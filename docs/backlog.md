# Product Backlog

## Status legend

- `ready` — sufficiently defined for planning
- `planned (Plan N)` — selected for an active plan
- `done (Plan N)` — completed and archived in that plan
- `blocked (reason)` — waiting on a named dependency or decision

<!--
Item shape (field names are intentionally unbolded in this example):

### BL-XXX — Title
Status: ready
Priority · Effort: P0 · S
Dependencies: none
Context: optional
Sketches: optional, comma-separated paths
Acceptance criteria:
1. First testable outcome.
2. Second testable outcome.
-->

## Active

- BL-001 Establish deterministic quality gates — done (Plan 1)

### BL-002 — Reconcile synthetic dashboard calculations
- **Status**: ready
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-001
- **Context**: The validation prototype must earn trust from independently checkable synthetic data, not merely display plausible numbers. Source: former BI-002 and the business validation plan.
- **Acceptance criteria**:
  1. Automated tests independently calculate and verify every displayed headline metric for the current, partial, and stale fixture scenarios.
  2. Opportunity counts and total estimated values reconcile with the underlying recommendations before and after dismissal.
  3. Unsupported or incomplete inputs produce explicit partial or unavailable states rather than fabricated precision.

### BL-003 — Complete the prototype action-validation flow
- **Status**: ready
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-001, BL-002
- **Context**: Owner research requires a realistic path from an explainable recommendation to a controlled action and provider handoff without implying that outreach or booking happened inside SessionScape.
- **Acceptance criteria**:
  1. An owner can review and edit a representative action draft, refine its audience, and approve or dismiss it; nothing is presented as sent automatically.
  2. Approval leads to a clearly labeled representative provider-booking handoff that does not claim live availability, booking, or payment.
  3. The flow visibly distinguishes estimated opportunity, attributed booking, completed appointment, and realized revenue.
  4. Current, partial, and stale data states remain understandable throughout the action flow.

### BL-004 — Make dismissed recommendations truthfully recoverable
- **Status**: ready
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-001
- **Context**: The current confirmation says dismissed recommendations can be restored from Activity, but Activity has no restore interface.
- **Acceptance criteria**:
  1. A dismissed recommendation appears in Activity with enough context to identify what was dismissed.
  2. The owner can restore it, after which it reappears in the opportunity list and counts exactly once.
  3. Tests cover dismissal, restoration, and repeated actions without duplicate recommendations.

### BL-005 — Make dashboard dialogs keyboard accessible
- **Status**: ready
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-001
- **Context**: Metric and recommendation drawers expose dialog semantics but have no verified focus, Escape, or focus-return behavior.
- **Acceptance criteria**:
  1. Opening a drawer moves focus to a meaningful control or heading, and Tab navigation remains within the open dialog.
  2. Escape closes the drawer and returns focus to the control that opened it.
  3. Automated accessibility-focused interaction tests cover both drawer types and their close controls.

### BL-006 — Run owner discovery and prototype validation
- **Status**: ready
- **Priority · Effort**: P0 · L
- **Dependencies**: BL-002, BL-003, BL-004, BL-005
- **Context**: Validate problem frequency, dashboard trust, actionability, provider concentration, and payment evidence before connected-MVP implementation. Source: former BI-001/BI-002 and `docs/business/validation-plan.md`.
- **Acceptance criteria**:
  1. Research includes 8–12 representative owners or operators using synthetic or owner-redacted data and records the validation plan's evidence scorecard for each participant.
  2. Participants attempt the defined dashboard, recommendation, action, provider-handoff, data-state, and value-classification tasks; task outcomes and interpretation errors are recorded.
  3. A decision report compares results with the documented proceed, change-provider, defer, and stop criteria and names the supported next step.
  4. No identifiable client export, clinical content, health data, intake content, or payment-card data is collected.

- BL-007 Upgrade Next.js to a patched supported release — done (Plan 1)

### BL-008 — Move lint tooling to a supported Node and ESLint line
- **Status**: ready
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-001
- **Context**: The current Node 20.18 runtime cannot run ESLint 10, whose engine floor is Node 20.19. BL-001 therefore pins functional ESLint 9.39.5, but clean installation warns that ESLint 9 is no longer supported.
- **Acceptance criteria**:
  1. The repository declares a supported Node version that satisfies Next.js and the current maintained ESLint major, and a clean install emits no engine or unsupported-ESLint warning.
  2. The maintained ESLint version and compatible Next.js configuration are exactly locked without overrides, and `npm run lint` remains non-interactive and green.
  3. Tests, TypeScript checking, the production audit, and the static build remain green after the toolchain update.

### BL-009 — Run quality gates in GitHub CI
- **Status**: ready
- **Priority · Effort**: P0 · S
- **Dependencies**: BL-001
- **Context**: Plan 1 established local deterministic gates, but the repository has no CI workflow and `main` protection therefore has no required status check. Source: ship readiness (Plan 1).
- **Acceptance criteria**:
  1. Pull requests and pushes to `main` run a least-privilege workflow that performs a clean locked install, tests, lint, TypeScript checking, and the static production build.
  2. A failing gate fails the workflow, and concurrent superseded runs are cancelled without hiding the latest result.
  3. The verified workflow check is required by `main` branch protection before merge.

## Icebox
