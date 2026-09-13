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
- **Status**: planned (Plan 5)
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-002
- **Sketches**: docs/sketches/manual-practice-data/option-b.html
- **Context**: Replace fixed-only fixtures with an owner-controlled prototype workspace. Start browser-local to validate behavior before paying for account storage; reject identifiable or clinical fields rather than inviting unsafe test data.
- **Acceptance criteria**:
  1. The owner can start empty, explore read-only sample data, return to their unchanged owner workspace, or create a separately stored sample-derived workspace; replacing an existing sample-derived copy or clearing either editable workspace requires confirmation, and every active source is labeled.
  2. The workspace includes minimal editable practitioner and service catalogs plus availability and appointment records with stable generated identifiers and the lifecycle metadata needed for editing and calculation. Deactivated catalog entries remain label-resolvable for historical appointments but cannot be selected for new or reassigned records. Returning-client links use only system-generated, format-constrained opaque identifiers selected from the workspace; no free-form client identifier or fields for client names, contact details, notes, health information, intake content, or payment-card data exist.
  3. Owner-entered workspace data survives a browser reload on the same device, can be cleared in one deliberate action, and recovers safely from missing or invalid stored data.
  4. Unit and component tests cover empty, sample, persisted, cleared, and invalid-data states without writing to an external service.

### BL-012 — Make the weekly appointment ledger operable
- **Status**: planned (Plan 5)
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-011
- **Sketches**: docs/sketches/manual-practice-data/option-b.html
- **Context**: Make the existing date control lead to a ledger-first practice-data workspace rather than a decorative calendar. Weekly availability has its own tab so appointment editing stays focused. This is an internal appointment ledger, not client booking: owners maintain records and availability, but clients cannot book, reschedule, or pay. A calendar-first layout was rejected because it would imply a broader scheduling product.
- **Acceptance criteria**:
  1. The owner can move to the previous or next week and return to the current week, with the visible date range and ledger changing together in the practice time zone.
  2. The owner can maintain and deactivate privacy-safe practitioner and service labels, then add and edit weekly availability plus appointment records by selecting active catalog entries and supplying date/time, duration, integer-cent value, status, and an optional existing system-generated anonymous returning-client identifier; deactivation preserves existing appointment labels and history.
  3. The owner can mark an appointment scheduled, completed, cancelled, or no-show and can remove an erroneous record through a deliberate confirmation.
  4. Invalid times, durations, values, and overlapping active appointments are blocked before saving; appointments outside recorded availability require an explicit owner override. Component tests cover creation, editing, status changes, deletion, week navigation, blocked validation, and the outside-hours override.

### BL-013 — Derive dashboard opportunities from manual records
- **Status**: planned (Plan 5)
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-011, BL-012
- **Sketches**: docs/sketches/manual-practice-data/option-b.html
- **Context**: The prototype becomes useful for validation only when owner edits visibly change its metrics and recommendations. Reuse the existing calculation boundary and truthfulness rules; do not introduce a second manual-only dashboard path.
- **Acceptance criteria**:
  1. Saving, editing, completing, cancelling, or removing a manual appointment immediately reconciles the selected week's appointment, capacity, cancellation, and value displays from the workspace records.
  2. Capacity and retention recommendations are derived only when the manual records contain the availability, status, and anonymous history required by their documented rules; otherwise the affected metric or recommendation shows an explicit unavailable reason.
  3. Metric definitions and recommendation evidence identify the selected period, record coverage, exclusions, and whether the source is sample or owner-entered data without exposing individual records.
  4. Calculation and component tests prove input-to-insight changes, insufficient-data behavior, repeated edits without duplicates, and continued separation of estimated, attributed, completed, and realized value.
  5. Sample data retains its clearly representative provider handoff; owner-entered and sample-derived data stop at owner-only evidence review and expose no audience, draft, export, provider link, send, booking, or payment claim.
  6. Manual and sample-derived records are active calculation sources only when no provider is connected; a future connected provider becomes authoritative without merging or deleting separately stored manual data.

### BL-014 — Restore dashboard destinations from Practice Data
- **Status**: ready
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-012
- **Context**: The Opportunities, Clients, and Activity links target dashboard sections that are not mounted while Practice Data is open, so they appear broken. Source: review (Plan 5).
- **Acceptance criteria**:
  1. Choosing Opportunities, Clients, or Activity from Practice Data restores the dashboard before navigating to the requested section.
  2. Component tests prove every primary-navigation destination remains reachable from both surfaces.

### BL-015 — Keep Practice Data reachable on small screens
- **Status**: ready
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-012, BL-013
- **Context**: The current narrow-screen rules hide both the Practice Data navigation item and the dashboard week control, preventing mobile-width access to Plan 5 flows. Source: review (Plan 5).
- **Acceptance criteria**:
  1. At supported narrow widths, owners can open Practice Data and move between dashboard and ledger weeks without hidden controls.
  2. Responsive tests cover the navigation and week controls at the smallest supported viewport.

### BL-017 — Use one anonymous-client ID generator
- **Status**: ready
- **Priority · Effort**: P2 · S
- **Dependencies**: BL-011
- **Context**: The tested `anonymousClientIdFromUuid` helper is unused by production while the UI carries a separate generator, so its unit test cannot protect the actual path. Source: review (Plan 5).
- **Acceptance criteria**:
  1. Production UI generation uses the single tested anonymous-client ID helper with no duplicate implementation.
  2. Unit and component tests prove generated IDs match the persisted `anon_[a-z0-9]{12}` contract.

### BL-018 — Complete keyboard semantics for Practice Data tabs
- **Status**: ready
- **Priority · Effort**: P1 · S
- **Dependencies**: BL-012
- **Context**: The Practice Data controls declare tab roles without associated tabpanels, relationships, roving focus, or arrow-key behavior. Source: review (Plan 5).
- **Acceptance criteria**:
  1. Appointment and Availability tabs expose linked tab/tabpanel semantics with exactly one selected and focusable tab.
  2. Left/right arrow keys move focus and selection between tabs, with component tests covering keyboard and accessible relationships.

## Icebox
