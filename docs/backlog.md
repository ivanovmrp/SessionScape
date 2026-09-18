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

- BL-011 Establish a local redacted practice workspace — done (Plan 5)

- BL-012 Make the weekly appointment ledger operable — done (Plan 5)

- BL-013 Derive dashboard opportunities from manual records — done (Plan 5)

### BL-014 — Restore dashboard destinations from Practice Data
- **Status**: planned (Plan 7)
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-012
- **Context**: The Opportunities, Clients, and Activity links target dashboard sections that are not mounted while Practice Data is open, so they appear broken. Source: review (Plan 5).
- **Acceptance criteria**:
  1. Choosing Opportunities, Clients, or Activity from Practice Data restores the dashboard before navigating to the requested section.
  2. Component tests prove every primary-navigation destination remains reachable from both surfaces.

### BL-015 — Keep Practice Data reachable on small screens
- **Status**: planned (Plan 7)
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-012, BL-013
- **Context**: The current narrow-screen rules hide both the Practice Data navigation item and the dashboard week control, preventing mobile-width access to Plan 5 flows. Source: review (Plan 5).
- **Acceptance criteria**:
  1. At supported narrow widths, owners can open Practice Data and move between dashboard and ledger weeks without hidden controls.
  2. Component tests prove the navigation and week controls remain wired and rendered; manual browser verification confirms both are visible and actionable at 360×640.

### BL-017 — Use one anonymous-client ID generator
- **Status**: ready
- **Priority · Effort**: P2 · S
- **Dependencies**: BL-011
- **Context**: The tested `anonymousClientIdFromUuid` helper is unused by production while the UI carries a separate generator, so its unit test cannot protect the actual path. Source: review (Plan 5).
- **Acceptance criteria**:
  1. Production UI generation uses the single tested anonymous-client ID helper with no duplicate implementation.
  2. Unit and component tests prove generated IDs match the persisted `anon_[a-z0-9]{12}` contract.

### BL-018 — Complete keyboard semantics for Practice Data tabs
- **Status**: planned (Plan 7)
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-012
- **Context**: The Practice Data controls declare tab roles without associated tabpanels, relationships, roving focus, or arrow-key behavior. Source: review (Plan 5).
- **Acceptance criteria**:
  1. Appointment and Availability tabs expose linked tab/tabpanel semantics with exactly one selected and focusable tab.
  2. Left/right arrow keys move focus and selection between tabs, with component tests covering keyboard and accessible relationships.

- BL-019 Guide owners through initial practice-data setup — done (Plan 6)

### BL-020 — Remove the single-use guided availability helper
- **Status**: ready
- **Priority · Effort**: P2 · S
- **Dependencies**: BL-019
- **Context**: `guidedAvailabilityTarget` has one caller and no independent test boundary, adding an abstraction before a second use exists. Source: review (Plan 6).
- **Acceptance criteria**:
  1. Guided availability target selection remains inline with its only caller unless a second concrete caller exists.
  2. Existing component tests continue to prove first-missing-date selection and earliest-closed-date fallback behavior.

## Icebox
