---
name: stack-testing
description: "Run and extend SessionScape's Vitest 4.1.11 test harness and quality gates."
---

# SessionScape testing — Vitest 4.1.11

Version basis: Vitest 4.1.11, TypeScript 5.8.3, Next.js 16.3.4, Node 20.18.

## Commands

- One test: `npm exec vitest -- run lib/dashboard-fixtures.test.ts -t "partial data excludes capacity recommendations"`
- Scoped set: `npm exec vitest -- run lib`
- Full suite once: `npm test`
- Intentional watch: `npm exec vitest -- --watch`
- All gates: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`
- Coverage is not configured; add a version-matched provider through a backlog story before making coverage a gate.

## Layout and conventions

- Keep a pure module's tests beside it as `*.test.ts`.
- Use Node environment for pure logic; add a browser-like environment only when a component test requires it.
- Import `test` from `vitest`; assertions use configured globals.
- Push behavior to the lowest useful layer: pure calculations in unit tests, module boundaries in integration tests, only key owner journeys in e2e tests.
- Mock only true external systems, time, or randomness. Keep project modules and future test databases real.
- Every production change starts with a test observed failing for the intended reason; keep the test unchanged through GREEN.

## Known gotchas

- Config is `vitest.config.mts`; `.ts` loads as CommonJS in this package and fails on Vitest's ESM-only dependency.
- `npm test` uses `vitest run`, so it must exit and never watch by default.
- On this Windows sandbox, stale `.next/trace` may need verified elevated deletion before a build can write its trace.
- ESLint 9 is pinned only until BL-008 raises Node and moves to the maintained ESLint line.
