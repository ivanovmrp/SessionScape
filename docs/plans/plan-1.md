# Plan 1: Establish deterministic quality gates
Status: IN PROGRESS
Advances: enabling — establishes reliable automated gates that unblock trustworthy prototype validation work in BL-002 through BL-005.

## Goal

Make every later prototype change testable and reviewable through stable, non-interactive test, lint, type-check, and production-build commands.

## Stories

### BL-001 — Establish deterministic quality gates
- **Status**: in progress
- **Dependencies**: none
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

- Group 1: BL-001 only — build inline; no worktrees or parallel implementers.

## Risks

- Adding a test runner and ESLint requires new development dependencies; lock exact compatible versions and use official version-matched guidance.
- The earlier build hang may be environment-specific or caused by overlapping build processes; diagnosis must not convert a timeout into an application workaround.
- Existing untracked workflow files must be preserved when the plan branch is created and committed as the plan baseline.

## Observations

- 2026-09-09 (plan): plan review rejected a missing-script-only RED and a red-build fallback — the same fixture test must execute RED then green after minimal setup, and dependent stories remain blocked until the production build is green.
- 2026-09-09 (BL-001): the RED test imports its registration function but leaves `expect` global — this proves the named test body fails before configuration rather than failing during discovery.

## Archived Specs
