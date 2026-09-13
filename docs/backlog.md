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

- BL-002 Reconcile synthetic dashboard calculations — done (Plan 3)

- BL-003 Complete the prototype action-validation flow — done (Plan 3)

- BL-004 Make dismissed recommendations truthfully recoverable — done (Plan 4)

- BL-005 Make dashboard dialogs keyboard accessible — done (Plan 4)

### BL-006 — Run owner discovery and prototype validation
- **Status**: ready
- **Priority · Effort**: P0 · L
- **Dependencies**: BL-002, BL-003, BL-004, BL-005, BL-011, BL-012, BL-013
- **Context**: Validate problem frequency, dashboard trust, actionability, provider concentration, manual-entry demand, and payment evidence before connected-MVP implementation. Participants should manipulate a redacted practice workspace so the study observes whether their own input produces trusted decisions, not only reactions to fixed fixtures. Source: former BI-001/BI-002 and `docs/business/validation-plan.md`.
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

- BL-009 Run quality gates in GitHub CI — done (Plan 2)

- BL-010 Establish browser component interaction testing — done (Plan 3)

## Initiative: Owner-entered practice data

Give practitioners without a supported booking platform a manual data source, and make the prototype testable through visible input-to-insight cause and effect. The product remains an intelligence layer rather than a client-facing booking system: the first slice supports weekly availability and appointment records, while public booking, reminders, payments, clinical notes, and client contact data remain out of scope. Prototype data is browser-local and redacted; later CSV import and provider connectors must feed the same provider-neutral model.

### BL-011 — Establish a local redacted practice workspace
- **Status**: ready
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-002
- **Context**: Replace fixed-only fixtures with an owner-controlled prototype workspace. Start browser-local to validate behavior before paying for account storage; reject identifiable or clinical fields rather than inviting unsafe test data.
- **Acceptance criteria**:
  1. The owner can start with an empty workspace or explicitly load the existing sample dataset, and the interface labels whether displayed results come from sample or owner-entered data.
  2. The workspace represents weekly practitioner availability and appointments using only practitioner, service, start time, duration, value, status, and an optional anonymous returning-client key; it has no fields for names, contact details, notes, health information, intake content, or payment-card data.
  3. Owner-entered workspace data survives a browser reload on the same device, can be cleared in one deliberate action, and recovers safely from missing or invalid stored data.
  4. Unit and component tests cover empty, sample, persisted, cleared, and invalid-data states without writing to an external service.

### BL-012 — Make the weekly appointment ledger operable
- **Status**: ready
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-011
- **Context**: Make the existing date control lead to a real owner-operated week rather than a decorative calendar. This is an internal appointment ledger, not client booking: owners maintain records and availability, but clients cannot book, reschedule, or pay.
- **Acceptance criteria**:
  1. The owner can move to the previous or next week and return to the current week, with the visible date range and ledger changing together in the practice time zone.
  2. The owner can add and edit weekly availability plus appointment records with practitioner, service, date/time, duration, value, status, and optional anonymous returning-client key.
  3. The owner can mark an appointment scheduled, completed, cancelled, or no-show and can remove an erroneous record through a deliberate confirmation.
  4. Invalid times, durations, values, and overlapping active appointments are identified before saving, and component tests cover creation, editing, status changes, deletion, week navigation, and validation failures.

### BL-013 — Derive dashboard opportunities from manual records
- **Status**: ready
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-011, BL-012
- **Context**: The prototype becomes useful for validation only when owner edits visibly change its metrics and recommendations. Reuse the existing calculation boundary and truthfulness rules; do not introduce a second manual-only dashboard path.
- **Acceptance criteria**:
  1. Saving, editing, completing, cancelling, or removing a manual appointment immediately reconciles the selected week's appointment, capacity, cancellation, and value displays from the workspace records.
  2. Capacity and retention recommendations are derived only when the manual records contain the availability, status, and anonymous history required by their documented rules; otherwise the affected metric or recommendation shows an explicit unavailable reason.
  3. Metric definitions and recommendation evidence identify the selected period, record coverage, exclusions, and whether the source is sample or owner-entered data without exposing individual records.
  4. Calculation and component tests prove input-to-insight changes, insufficient-data behavior, repeated edits without duplicates, and continued separation of estimated, attributed, completed, and realized value.

## Icebox
