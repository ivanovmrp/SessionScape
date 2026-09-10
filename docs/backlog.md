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

### BL-001 — Establish deterministic quality gates
- **Status**: planned (Plan 1)
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-007
- **Context**: The prototype has no tests or direct test runner; `next lint` is interactive and deprecated, and the production build stalled during onboarding. This story is the prerequisite for all prototype changes.
- **Acceptance criteria**:
  1. A documented `npm` test command runs non-interactively, returns a meaningful exit code, and watches no files by default.
  2. At least one representative unit or component test is observed failing for the intended reason before its supporting setup makes it pass.
  3. Stable non-interactive scripts run the full test suite, lint, and TypeScript checks from a clean checkout.
  4. The production build completes successfully, or its root cause and an explicit unblock story are recorded without weakening the build gate.

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

### BL-007 — Patch the critical Next.js vulnerability
- **Status**: planned (Plan 1)
- **Priority · Effort**: P0 · S
- **Dependencies**: none
- **Context**: `npm audit` reports critical advisories against the locked Next.js 15.5.20 runtime and identifies 15.5.25 as the non-major patched release. The issue predated Plan 1 and surfaced when the first development dependency was installed.
- **Acceptance criteria**:
  1. `package.json` and `package-lock.json` pin Next.js 15.5.25, and the installed package reports that exact version.
  2. `npm audit --omit=dev` reports no high or critical vulnerability in Next.js or its production dependency tree.
  3. TypeScript checking passes without weakening compiler settings, and the production build completes successfully on the patched runtime.

## Icebox
