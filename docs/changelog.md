# Changelog

Completed plans and releases are indexed here.

## Plan 1 — Establish deterministic quality gates (2026-09-10)

- Upgraded the static application to Next.js 16.3.4 while retaining React 19.1.0; the production dependency audit is clean.
- Established non-interactive `test`, `lint`, `typecheck`, and `build` package interfaces, with verified command allowlisting in `.codex/rules/project.rules`.
- Added Vitest configuration that excludes nested orchestrator worktrees and a version-stamped testing guide at `.agents/skills/stack-testing/SKILL.md`.
- Deferred the maintained ESLint-major move to BL-008 because it requires raising the declared Node runtime beyond 20.18.

## Plan 2 — Enforce quality gates in GitHub CI (2026-09-11)

- Added `.github/workflows/ci.yml` with least-privilege permissions, immutable action pins, isolated cancellation groups, exact Node 20.18.0, and all established quality gates.
- Bound `main` protection strictly to the emitted `quality` check from GitHub Actions app ID `15368`, while retaining 0 approvals, administrator enforcement, and blocked force pushes/deletion.
- Established a two-PR bootstrap pattern for introducing a repository's first required workflow without creating a check that cannot yet run.

## Plan 3 — Make the prototype trustworthy and actionable (2026-09-12)

- Replaced presentation-first dashboard numbers with typed numeric scenarios and a single derivation boundary for current, partial, unavailable, and stale states.
- Established colocated browser-like component interaction coverage while keeping pure calculation tests in Node; the full suite now covers 34 tests.
- Added an owner-controlled evidence, draft, audience, approval, and representative Square handoff flow with an explicit estimated-to-realized value ladder and no false send, booking, or payment claims.
- Defined unavailable visualization behavior: unsupported denominators suppress both numeric precision and chart geometry.
