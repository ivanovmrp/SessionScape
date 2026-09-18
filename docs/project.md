# Project Memory
<!-- ≤30 lines total. Read at the start of every session (AGENTS.md → Project Memory). Maintained by sdlc-init and the ship-time learning pass. -->
- **North star**: For independent massage-practice owners, turn booking-platform data into trustworthy, actionable capacity and retention opportunities that produce attributable completed bookings.
- **Stack**: Next.js 16.3.4, React 19.1.0, TypeScript 5.8.3, Vitest 4.1.11, ESLint 9.39.5, Node.js 20.18.0; npm; static export
- **Test command**: `npm test` (non-interactive full suite)
- **Structure**: App Router prototype and guided practice setup in `app/`; typed scenarios plus browser-local practice workspace and insight adapters in `lib/`; CI in `.github/workflows/ci.yml`; product evidence and smoke paths in `docs/`
- **Constraints**: Keep the booking provider as system of record; exclude clinical, health, intake, and payment-card data; require owner control over actions; justified dependencies are allowed
- **Skills**: No installed third-party stack skills found
- **Docs**: Next.js 16: https://nextjs.org/docs/llms.txt; React 19: https://react.dev/llms.txt; TypeScript 5.8: no llms.txt — use installed package + version-scoped official search
- **Do / Don't**: Do derive displayed metrics from inspectable numeric inputs and suppress unavailable values in text and chart geometry; don't imply synthetic actions were sent, booked, or paid (confirmed Plan 6)
- **Do / Don't**: Do keep only one modal active, contain focus within it, and return focus only to a connected opener; don't revive stale focus after dismissal or context changes (confirmed Plan 6)
- **Do / Don't**: Do keep connected, owner, sample-derived, and read-only sample sources isolated and labeled; don't merge inactive browser-local records into authoritative connected data (confirmed Plan 6)
- **Do / Don't**: Do resolve appointment and availability boundaries to real instants; don't calculate elapsed time from wall-clock minutes across daylight-saving changes (confirmed Plan 6)
- **Do / Don't**: Do derive guided progress and completion from persisted qualifying records across every entry path; don't key workflow truth to the control used or the latest mutation (Plan 6)
- **Learnings**: Vitest 4 config must use `.mts` in this non-ESM package; `.ts` loads as CommonJS and fails on Vitest's ESM-only dependency (confirmed Plan 6)
- **Learnings**: Next 16 resolves a Node 20.19-only TypeScript-ESLint subtree and ESLint 10 also requires Node 20.19; pin `typescript-eslint@8.46.0` on Node 20.18 until BL-008 (confirmed Plan 6)
- **Learnings**: Vitest discovers test copies in nested git worktrees unless `**/.worktrees/**` extends its default exclusions (confirmed Plan 6)
- **Learnings**: jsdom proves responsive control wiring but not CSS media-query visibility; verify breakpoints in a real browser until a viewport-capable harness exists (Plan 7)

## Amendments
<!-- project-local workflow rule changes, one line each, user-approved; extend or override AGENTS.md -->
