# Project Memory
<!-- ≤30 lines total. Read at the start of every session (AGENTS.md → Project Memory). Maintained by sdlc-init and the ship-time learning pass. -->
- **North star**: For independent massage-practice owners, turn booking-platform data into trustworthy, actionable capacity and retention opportunities that produce attributable completed bookings.
- **Stack**: Next.js 16.3.4, React 19.1.0, TypeScript 5.8.3, Vitest 4.1.11, ESLint 9.39.5, Node.js 20.18.0; npm; static export
- **Test command**: `npm test` (non-interactive full suite)
- **Structure**: App Router prototype in `app/`; typed synthetic scenarios in `lib/`; product, architecture, privacy, and business evidence in `docs/`
- **Constraints**: Keep the booking provider as system of record; exclude clinical, health, intake, and payment-card data; require owner control over actions; justified dependencies are allowed
- **Skills**: No installed third-party stack skills found
- **Docs**: Next.js 16: https://nextjs.org/docs/llms.txt; React 19: https://react.dev/llms.txt; TypeScript 5.8: no llms.txt — use installed package + version-scoped official search
- **Do / Don't**: Do treat the current UI as a synthetic discovery prototype; don't imply it is connected to live booking data (2026-09-09)
- **Learnings**: On this Windows sandbox, a stale generated `.next/trace` can cause build `EPERM`; verify the path, remove that generated file with elevated access, then rerun (Plan 1)
- **Learnings**: Vitest 4 config must use `.mts` in this non-ESM package; `.ts` loads as CommonJS and fails on Vitest's ESM-only dependency (Plan 1)
- **Learnings**: Next 16's ESLint config range resolves a Node 20.19-only TypeScript-ESLint subtree; pin `typescript-eslint@8.46.0` on Node 20.18 and globally ignore generated/workflow directories (Plan 1)
- **Learnings**: Clean install warns ESLint 9.39.5 is unsupported, but ESLint 10 requires Node 20.19; BL-008 owns the Node/lint upgrade (Plan 1)
- **Learnings**: Vitest discovers test copies in nested git worktrees unless `**/.worktrees/**` extends its default exclusions (Plan 1)

## Amendments
<!-- project-local workflow rule changes, one line each, user-approved; extend or override AGENTS.md -->
