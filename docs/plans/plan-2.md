# Plan 2: Enforce quality gates in GitHub CI
Status: IN PROGRESS
Advances: enabling — makes Plan 1's quality gates automatic on pull requests and required before merging to `main`, enabling safer prototype validation changes.

## Goal

Run the established quality gates on pull requests and `main`, prove failure and supersession behavior in GitHub, and require the verified check without weakening existing branch protection.

## Stories

### BL-009 — Run quality gates in GitHub CI
- **Status**: in progress
- **Dependencies**: BL-001
- **Likely touched files**: `.github/workflows/ci.yml`, temporary `lib/ci-failure.test.ts` and `lib/ci-delay.test.ts` files removed before completion, `docs/plans/plan-2.md`; GitHub `main` branch-protection settings after the check context is verified
- **Design**: Add one workflow named `CI` with one job named `quality`, producing the stable check context `CI / quality`. Trigger on pull requests and pushes to `main`. Set top-level `permissions: contents: read`, no secrets, a finite job timeout, and concurrency keyed by workflow plus pull-request number or ref with `cancel-in-progress: true`, so one PR cannot cancel another and a newer run remains visible. Use Ubuntu, exact Node 20.18.0, npm cache, `npm ci`, then `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`. Pin Checkout 7.0.1 to `3d3c42e5aac5ba805825da76410c181273ba90b1` with `persist-credentials: false`, and Setup Node 7.0.0 to `820762786026740c76f36085b0efc47a31fe5020`. Edge cases: a stale lockfile must fail at `npm ci`; a test/lint/type/build failure must stop the job nonzero; rapid pushes to one PR must cancel only the older run; forked pull requests must need no write permission, persisted credential, or secret; the required check must match both GitHub's emitted context and GitHub Actions app ID. RED is an intentionally failing temporary Vitest test on a bootstrap draft PR; GREEN deletes only that sentinel and leaves the workflow unchanged. Because a `main`-push event cannot run before the workflow first reaches `main`, use two explicitly authorized PRs: merge the bootstrap workflow PR, verify its `main` run, bind protection through `required_status_checks.checks` using the successful check run's emitted `app.id`, then use a second protected completion PR to prove enforcement. Preserve zero required reviews, administrator enforcement, and force-push/deletion blocks. Rollback first removes the required check, then removes the workflow through a PR; never leave protection requiring a check that cannot run.
- **Tasks**:
  1. Capture RED baseline evidence: no workflow exists, PR/push events emit no quality check, and `main` has no required status checks.
  2. Create the least-privilege SHA-pinned workflow plus a temporary failing Vitest sentinel; commit, then after explicit authorization push and open a bootstrap draft PR so `CI / quality` fails for the named test.
  3. Delete only the sentinel and commit GREEN. After explicit authorization, push it and verify the latest `CI / quality` run remains visible and completes successfully. To prove supersession deterministically, commit and push a temporary passing delay test, wait until its run is active, then after explicit authorization delete only that test and push the superseding commit; verify the older run is cancelled while the latest run completes successfully.
  4. Mark the bootstrap PR ready for review after GREEN and cancellation evidence, complete code and bootstrap ship review, then after explicit authorization merge it. Verify its resulting `main`-push run succeeds and read the emitted check context plus `app.id`.
  5. Update `main` protection through `required_status_checks.checks` to require the verified context and app ID with strict up-to-date checking, preserving zero approvals, administrator enforcement, and blocked force pushes/deletion.
  6. Continue on the existing `plan/2-ci` branch by merging updated `main` into it, record the bootstrap evidence, and run all local gates. After explicit authorization, push the branch and create the completion PR; verify its app-bound required check is enforced, then mark BL-009 done, run the final ship review, complete the lifecycle and learning pass, and set Plan 2 complete. After separate explicit authorization, push that final commit and require its latest check to be green before merge.
- **Test plan**:
  - Criterion 1: workflow integration — inspect permissions, immutable action SHAs, disabled checkout credential persistence, event filters, exact Node version, locked install, and all four commands; verify a bootstrap pull-request run, its post-merge `main` run, and the second protected pull-request run.
  - Criterion 2: external RED/GREEN — confirm the temporary named test makes `CI / quality` conclude failure; remove the unchanged cause, explicitly authorize two close successive pushes, confirm the older run is cancelled and the latest run is visible and successful.
  - Criterion 3: protection integration — read the successful check's context and `app.id`, require that pair with strict up-to-date checking, retain zero approvals, administrator enforcement, and blocked force pushes/deletion, then verify the second PR reports the requirement satisfied.

## Parallel Groups

- Group 1: BL-009 only — build inline; no worktrees or parallel implementers.

## Risks

- GitHub check naming can differ from assumptions; protection is changed only after reading the emitted context.
- Hosted-action major versions can move; immutable release SHAs prevent an upstream tag change from altering this plan.
- The deliberate RED commit remains in bootstrap branch history but its sentinel must be deleted before merge; the merged tree and latest check must contain no sentinel.
- Cancellation is timing-sensitive; push the second GREEN-state commit while the first GREEN run is active, then verify both run conclusions through the API.
- The first PR is an unavoidable bootstrap exception: CI cannot be required or prove its `main` event until that workflow has merged once.

## Observations

- 2026-09-10 (plan): the repository's first `main`-push workflow cannot be live-verified before its initial merge — use an explicitly approved bootstrap PR, then app-bind the required check and prove enforcement on a second PR.
- 2026-09-11 (BL-009): GitHub coalesced two immediate pushes before creating the first run — wait until a run is active before pushing the superseding commit.
- 2026-09-11 (BL-009): the hosted quality run completed during the authenticated superseding-push round trip — use a temporary passing delay test for the final deterministic cancellation proof.

## Archived Specs
