# Plan 1: Establish deterministic quality gates
Status: IN PROGRESS
Advances: enabling — removes a critical runtime vulnerability and establishes reliable automated gates that unblock trustworthy prototype validation work in BL-002 through BL-005.

## Goal

Patch the vulnerable runtime, then make every later prototype change testable and reviewable through stable, non-interactive test, lint, type-check, and production-build commands.

## Stories

### BL-007 — Patch the critical Next.js vulnerability
- **Status**: not started
- **Dependencies**: none
- **Likely touched files**: `package.json`, `package-lock.json`
- **Design**: Preserve the existing Next.js 15 interface and static-export architecture while moving the top-level Next dependency from 15.5.20 to the audit-recommended 15.5.25 patch. Keep React, React DOM, and unrelated top-level dependencies fixed while allowing only transitive updates required by Next 15.5.25. Security boundary: this removes known critical/high findings from the production dependency tree without broad dependency modernization. Edge cases: the installed version must match both manifest and lockfile; `npm audit --omit=dev` must assess production dependencies rather than hide findings behind an override or forced audit rewrite; TypeScript and the static build must still work; any new framework warning or runtime behavior change is investigated rather than suppressed. Testing uses dependency-tree inspection, the existing TypeScript command, and the production build, with the audit report as security evidence. Rollback is the prior lockfile/manifest pair only if the patched version causes a worse verified failure; a rollback would leave the story blocked because returning to a known critical version is not acceptable.
- **Tasks**:
  1. Capture the current production audit and installed-version RED evidence for Next.js 15.5.20.
  2. Install and pin Next.js 15.5.25 without changing React, React DOM, or unrelated top-level dependencies; allow only the transitive resolution changes required by the patched Next package.
  3. Verify the exact installed version and inspect `npm ls next postcss sharp`, then run `npm audit --omit=dev`, the existing TypeScript check, and the production build in isolation.
  4. If ordinary Next 15.5.25 resolution leaves a high or critical production finding, stop for a rung-3 amendment to select a verified compatible patch; do not add an override, force an audit rewrite, suppress the report, or accept a red audit silently.
- **Test plan**:
  - Criterion 1: dependency integration — inspect the manifest, lockfile root, and installed `next/package.json`; all must report 15.5.25.
  - Criterion 2: security integration — capture `npm audit --omit=dev` exit status and report; no Next.js or production-tree high/critical finding may remain.
  - Criterion 3: integration/build — run `npm exec tsc -- --noEmit`, then `npm run build` with no overlapping Next process; both must exit 0.

### BL-001 — Establish deterministic quality gates
- **Status**: blocked (BL-007)
- **Dependencies**: BL-007
- **Likely touched files**: `package.json`, `package-lock.json`, `vitest.config.ts` only after its need is demonstrated by RED, `eslint.config.mjs`, `lib/dashboard-fixtures.test.ts`, `README.md`, `docs/project.md`, `.codex/rules/project.rules`; conditionally `docs/backlog.md` and this plan if the build needs an unblock story; build-root-cause files only if the reproduced failure requires a narrowly tested fix
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

## Archived Specs
