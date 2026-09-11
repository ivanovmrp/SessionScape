# Project Memory
<!-- ≤30 lines total. Read at the start of every session (AGENTS.md → Project Memory). Maintained by sdlc-init and the ship-time learning pass. -->
- **North star**: For independent massage-practice owners, turn booking-platform data into trustworthy, actionable capacity and retention opportunities that produce attributable completed bookings.
- **Stack**: Next.js 16.3.4, React 19.1.0, TypeScript 5.8.3, Node.js 20.18.0; npm; static export
- **Test command**: None yet; test harness setup must be the first backlog story
- **Structure**: App Router prototype in `app/`; typed synthetic scenarios in `lib/`; product, architecture, privacy, and business evidence in `docs/`
- **Constraints**: Keep the booking provider as system of record; exclude clinical, health, intake, and payment-card data; require owner control over actions; justified dependencies are allowed
- **Skills**: No installed third-party stack skills found
- **Docs**: Next.js 16: https://nextjs.org/docs/llms.txt; React 19: https://react.dev/llms.txt; TypeScript 5.8: no llms.txt — use installed package + version-scoped official search
- **Do / Don't**: Do treat the current UI as a synthetic discovery prototype; don't imply it is connected to live booking data (2026-09-09)
- **Learnings**: `npm run lint` invokes deprecated interactive `next lint`; migrate to a deterministic ESLint CLI setup (2026-09-09)
- **Learnings**: Next.js 15.5.20 has a direct critical npm advisory; npm identifies 15.5.25 as the non-major patched release (Plan 1)
- **Learnings**: Next.js 15.5.25 clears the critical finding but retains 3 high production-tree advisories; Next 16.3.4 declares patched PostCSS/Sharp ranges and supports Node 20.9+ with React 19 (Plan 1)
- **Learnings**: On this Windows sandbox, a stale generated `.next/trace` can cause build `EPERM`; verify the path, remove that generated file with elevated access, then rerun (Plan 1)

## Amendments
<!-- project-local workflow rule changes, one line each, user-approved; extend or override AGENTS.md -->
