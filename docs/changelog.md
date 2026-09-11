# Changelog

Completed plans and releases are indexed here.

## Plan 1 — Establish deterministic quality gates (2026-09-10)

- Upgraded the static application to Next.js 16.3.4 while retaining React 19.1.0; the production dependency audit is clean.
- Established non-interactive `test`, `lint`, `typecheck`, and `build` package interfaces, with verified command allowlisting in `.codex/rules/project.rules`.
- Added Vitest configuration that excludes nested orchestrator worktrees and a version-stamped testing guide at `.agents/skills/stack-testing/SKILL.md`.
- Deferred the maintained ESLint-major move to BL-008 because it requires raising the declared Node runtime beyond 20.18.
