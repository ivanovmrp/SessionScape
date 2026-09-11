# Plan 1: Establish deterministic quality gates
Status: IN PROGRESS
Advances: enabling — removes a critical runtime vulnerability and establishes reliable automated gates that unblock trustworthy prototype validation work in BL-002 through BL-005.

## Goal

Patch the vulnerable runtime, then make every later prototype change testable and reviewable through stable, non-interactive test, lint, type-check, and production-build commands.

## Stories

### BL-007 — Upgrade Next.js to a patched supported release
- **Status**: done
- **Dependencies**: none
- **Likely touched files**: `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `docs/project.md`; conditionally `next.config.ts` or directly affected application files only when a reproduced Next.js 16 migration failure requires the minimum compatible change
- **Design**: Preserve the static-export product boundary while moving Next.js from the vulnerable 15.5 line to the supported 16.3.4 release that declares patched PostCSS and Sharp ranges. Keep React and React DOM pinned at 19.1.0, which satisfies Next 16's declared React 19 peer range, and keep unrelated top-level dependencies fixed while allowing only transitive updates required by Next 16.3.4. Security boundary: remove all high/critical production findings without overrides, forced audit rewrites, or broad modernization. Edge cases: Node 20.18 must satisfy Next 16's Node 20.9+ engine; manifest, lockfile, and installed version must agree; static export must still complete; removed or changed Next 16 behavior must be fixed at the smallest affected interface rather than suppressed; React versions must not drift. Testing uses dependency-tree inspection, the existing strict TypeScript command, and the static production build, with the production-only audit as security evidence. Because returning to a known vulnerable Next 15 line is unacceptable, rollback means marking the story blocked and the plan partial while preserving the failing evidence, not merging the old runtime.
- **Tasks**:
  1. Retain the captured RED evidence: Next.js 15.5.20 had a critical finding, and the attempted 15.5.25 patch still produced three high findings in PostCSS, Nano ID, and Sharp.
  2. Install and pin Next.js 16.3.4 without changing React, React DOM, or unrelated top-level dependencies; allow only transitive resolution changes required by Next 16.3.4.
  3. Verify manifest, lockfile, and installed Next/React versions and inspect `npm ls next postcss sharp nanoid`, then run `npm audit --omit=dev`.
  4. Run the existing strict TypeScript check and the production build in isolation; if Next.js 16 exposes a migration failure, reproduce it and make only the smallest compatible change before rerunning both gates.
  5. If the audit, type-check, or build remains red, stop for a rung-3 amendment; do not add an override, force an audit rewrite, suppress a migration failure, or accept a red gate silently.
- **Test plan**:
  - Criterion 1: dependency integration — inspect the manifest, lockfile root, installed `next/package.json`, and installed React packages; Next must report 16.3.4 and React/React DOM must remain 19.1.0.
  - Criterion 2: security integration — capture `npm audit --omit=dev` exit status and report; no Next.js or production-tree high/critical finding may remain.
  - Criterion 3: integration/build — run `npm exec tsc -- --noEmit`, then `npm run build` with no overlapping Next process; both must exit 0 without weakening TypeScript or suppressing Next.js 16 migration failures.

### BL-001 — Establish deterministic quality gates
- **Status**: in progress
- **Dependencies**: BL-007
- **Likely touched files**: `package.json`, `package-lock.json`, `vitest.config.mts` only after its need is demonstrated by RED, `eslint.config.mjs`, `lib/dashboard-fixtures.test.ts`, `.agents/skills/stack-testing/SKILL.md`, `README.md`, `docs/project.md`, `.codex/rules/project.rules`; conditionally `docs/backlog.md` and this plan for discovered unblock or follow-up work; build-root-cause files only if the reproduced failure requires a narrowly tested fix
- **Design**: The public tooling interface is four npm scripts: `test`, `lint`, `typecheck`, and `build`. Start with Vitest in its Node environment and one pure fixture-module test; defer browser/component-test dependencies until a component story requires them. The unchanged representative test imports `test` from Vitest, supplies compile-time types for globals in the test file, and deliberately leaves only `expect` as a runtime global while asserting that the partial scenario excludes capacity recommendations. After Vitest and the `vitest run` script exist, the named test must register and fail RED inside its callback because `expect` is unavailable; then the minimum `globals: true` configuration makes that same test green. ESLint uses its non-interactive CLI with the Next.js 15 config. Edge cases: a failing test must terminate nonzero and a green run must terminate zero rather than watch; TypeScript path/ES module handling must work without weakening strictness; lint must not prompt on a clean checkout; build diagnosis must distinguish a source/configuration failure from a sandbox or orphan-process hang. Rollback is removal of the new dev dependencies, configs, scripts, and allowlist entries; no runtime or data migration is involved.
- **Tasks**:
  1. Confirm the absent `npm test` interface, install only Vitest, and add `test: vitest run`; then add the unchanged partial-scenario invariant importing `test` but using global `expect`, observe the registered test fail inside its callback with a nonzero exit because `expect` is disabled, and add only the demonstrated `globals: true` configuration to make it exit green without watching.
  2. Reproduce the interactive/deprecated lint failure; install the version-compatible ESLint tooling, replace `next lint` with a non-interactive CLI command, and make it pass without suppressing real findings.
  3. Add a stable `typecheck` script around the already passing TypeScript command and verify it from the package interface.
  4. Reproduce the stalled production build in isolation and name the root cause. Make `npm run build` pass before BL-001 or Plan 1 can complete; if it remains unresolved, stop for a rung-3 amendment that either inserts the groomed unblock story into Plan 1 or marks the plan partial, leaving BL-002 through BL-005 blocked.
  5. At the candidate plan commit, create a fresh temporary worktree with generated outputs absent, run `npm ci`, then run the full test, lint, type-check, and build commands to prove the tracked lockfile and configuration are sufficient.
  6. Document the verified commands, update project memory with durable tooling facts, and allowlist only commands proven green.
- **Test plan**:
  - Criterion 1: integration/tooling — with the unchanged representative test, verify RED terminates nonzero and the configured green run terminates zero; both use `vitest run`, never default watch mode.
  - Criterion 2: unit + RED evidence — import `test` so the named partial-scenario invariant registers, capture its callback failing because global `expect` is unavailable, then enable globals and rerun the unchanged test to green.
  - Criterion 3: clean-environment integration — from a fresh temporary worktree at the candidate commit, run `npm ci`, `npm test`, `npm run lint`, and `npm run typecheck`; verify each is non-interactive and returns exit code 0.
  - Criterion 4: integration/build — run `npm run build` alone with no orphaned Next processes and again in the fresh worktree. A red build blocks plan completion; any unresolved root cause triggers the documented plan-amendment decision.

## Parallel Groups

- Group 1: BL-007 only — build inline.
- Group 2: BL-001 only after BL-007 — build inline; no worktrees or parallel implementers.

## Risks

- Adding a test runner and ESLint requires new development dependencies; lock exact compatible versions and use official version-matched guidance.
- The earlier build hang may be environment-specific or caused by overlapping build processes; diagnosis must not convert a timeout into an application workaround.
- Existing untracked workflow files must be preserved when the plan branch is created and committed as the plan baseline.

## Observations

- 2026-09-09 (plan): plan review rejected a missing-script-only RED and a red-build fallback — the same fixture test must execute RED then green after minimal setup, and dependent stories remain blocked until the production build is green.
- 2026-09-09 (BL-001): the RED test imports its registration function but leaves `expect` global — this proves the named test body fails before configuration rather than failing during discovery.
- 2026-09-09 (plan): installing the first dev dependency surfaced a pre-existing critical advisory in Next.js 15.5.20 with a non-major fix at 15.5.25 — security remediation must be inserted or explicitly deferred before BL-001 continues.
- 2026-09-09 (plan): owner chose to insert BL-007 before BL-001 — Plan 1 now delivers a patched runtime plus quality gates, with dependent prototype work still blocked until both stories pass.
- 2026-09-09 (BL-007): preserve React and unrelated top-level versions while allowing Next's required transitive updates; any remaining production audit finding requires another explicit amendment rather than an override or suppression.
- 2026-09-09 (BL-007): Next 15.5.25 removed the critical finding but left three high production advisories in PostCSS, Nano ID, and Sharp; Next 16.3.4 officially declares patched dependency ranges and is compatible with the installed Node 20.18 and React 19.1.
- 2026-09-10 (plan): owner chose the supported Next.js 16.3.4 upgrade over custom transitive overrides — BL-007 now includes major-version migration verification while keeping React 19.1 fixed.
- 2026-09-10 (BL-007): Next.js 16 required `jsx: react-jsx` and added `.next/dev/types/**/*.ts` to TypeScript inputs; the static build passed after applying those generated migration changes and clearing a stale `.next/trace` file.
- 2026-09-10 (BL-001): Vitest 4 cannot load `vitest.config.ts` as CommonJS in this package because its config path reaches ESM-only dependencies; use the ESM-explicit `.mts` config rather than changing the application's package type.
- 2026-09-10 (BL-001): pin `typescript-eslint@8.46.0` to keep Next 16's lint stack supported on Node 20.18, and add global ignores for generated/workflow directories so `eslint .` terminates deterministically.
- 2026-09-10 (BL-001): clean verification passed all gates but warned that ESLint 9 is unsupported; BL-008 owns the Node 20.19+ and maintained-ESLint upgrade so BL-001 does not broaden into an environment migration.
- 2026-09-10 (BL-001): the retained verification worktree caused Vitest to execute the same test twice; extend default exclusions with `**/.worktrees/**` so orchestrator worktrees cannot duplicate the suite.

## Archived Specs
