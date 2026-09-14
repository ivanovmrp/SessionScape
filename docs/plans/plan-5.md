# Plan 5: Make the prototype respond to owner-entered data
Status: COMPLETE
Advances: Owners without a supported booking integration can enter redacted practice records and see weekly metrics and recommendations respond, making prototype validation meaningful.

## Goal

Replace the fixed-only demonstration with a browser-local, owner-operated practice-data flow that preserves privacy boundaries and drives the existing trustworthy dashboard.

## Stories

### BL-011 — Establish a local redacted practice workspace
- **Status**: done
- **Dependencies**: BL-002
- **Likely touched files**: `lib/practice-workspace.ts`, `lib/practice-workspace.test.ts`, `lib/dashboard-fixtures.ts`, `lib/dashboard-fixtures.test.ts`, `app/page.tsx`, `app/page.test.tsx`
- **Design**: Add a provider-neutral `PracticeWorkspace` contract with `{ version: 1, provenance, timezone, practitioners, services, availability, appointments }` and a browser-storage repository with `load`, `save`, and `clear`. Practitioner records use stable opaque IDs, privacy-safe editable labels, and active state. Service records use stable opaque IDs, editable labels, positive default duration, integer default value cents, and active state; neither catalog accepts contact details or notes. Availability records use stable IDs, practitioner IDs, ISO local dates, start/end minutes or an explicit closed marker. Appointment records use stable IDs, practitioner/service IDs, a UTC ISO instant, positive duration minutes, integer value cents, status, UTC `createdAt`/`statusChangedAt` and optional `cancelledAt`, plus an optional generated client ID matching `anon_[a-z0-9]{12}`. The UI selects or generates client IDs and never accepts free form. The parser rejects unknown fields, dangling catalog references, invalid IDs, and prohibited data. Source transitions are fixed: first use opens the separately persisted owner slot; Explore sample enters read-only sample mode without writes; Return to owner restores that slot unchanged; Copy sample creates or, after confirmation, replaces only a separate sample-derived slot; edits stay in the active editable slot and preserve its provenance; Clear confirms and empties only that slot. A future connected slot is stored separately and becomes the sole calculation source while connected; owner and sample-derived slots remain preserved and inactive, never merged. The current/partial/stale selector exists only in read-only sample mode. Source changes close drawers/editors after dirty-state confirmation and reset dismissed recommendations; week changes do the same while retaining the active source. Edge cases include hydration, corrupt JSON, unknown versions, storage/quota failure, invalid lifecycle order, and destructive transitions. Version 1 has no forward migration; invalid data remains recoverable without overwrite. Rollback removes new keys and entry paths while retaining fixtures.
- **Tasks**:
  1. Write failing unit tests for practitioner/service catalogs, referential integrity, exact versioned record fields, stable IDs, generated anonymous-ID format, lifecycle timestamps, integer cents, provider-neutral raw sample, and slot-aware `load`/`save`/`clear`; implement the minimum typed contract and repository.
  2. Write failing component tests for every source transition, replacement/clear confirmation, preserved owner recovery, source labels, sample-only scenario selector, and stale drawer/editor/dismissal reset; add non-destructive Practice Data source switching without changing dashboard derivation yet.
  3. Write failing component tests for reload persistence, deliberate clearing, invalid storage, and storage failures; implement hydration-safe persistence and visible recovery.
  4. Add review regressions for exact calendar dates and slot-matched provenance; reject malformed or mislabeled stored workspaces.
- **Test plan**:
  - Criterion 1: component tests cover the full owner/sample/sample-derived transition table, prove replacements and clears are confirmed and slot-scoped, recover the exact owner slot after sample exploration, and assert active-source labels and context reset.
  - Criterion 2: unit parser tests accept privacy-safe practitioner/service catalogs, stable system IDs, catalog references, integer cents, ordered lifecycle instants, and generated anonymous IDs while rejecting dangling references, free-form/nonconforming client IDs, contact details, notes, health, intake, payment-card, and unknown fields; component tests cover catalog CRUD plus ID selection/generation.
  - Criterion 3: unit repository and component tests cover reload, deliberate clear confirmation, corrupt JSON, unknown versions, unavailable storage, and quota failure without destructive overwrite.
  - Criterion 4: unit and unmocked jsdom component tests prove all states without network or external-service calls.

### BL-012 — Make the weekly appointment ledger operable
- **Status**: done
- **Dependencies**: BL-011
- **Likely touched files**: `lib/practice-workspace.ts`, `lib/practice-workspace.test.ts`, `app/page.tsx`, `app/page.test.tsx`, `app/globals.css`
- **Design**: Follow `docs/sketches/manual-practice-data/option-b.html`: a ledger-first Practice Data surface with a dedicated Availability tab, not a scheduling calendar. Persist appointment starts as UTC ISO instants; resolve date/time input through the workspace's IANA timezone. Persist availability as ISO local dates plus start/end minutes or a closed marker. Reject nonexistent DST-gap times, require the owner to choose the earlier or later offset for a repeated hour, and define a week as Monday 00:00 through the next Monday 00:00 in the practice timezone. Pure helpers own week ranges, catalog/reference validation, availability validation, appointment validation, and practitioner-specific active-overlap detection. Catalog deactivation never deletes an entry: historical appointments keep resolving its label and remain valid evidence, inactive practitioners are excluded only from current coverage, and inactive practitioners/services are unavailable only for new or reassigned records. Each active practitioner must be closed or covered by availability for a day to count as complete coverage. Malformed time, non-positive duration/value, dangling references, cross-midnight/week records, and active overlaps are blocked. Stable IDs survive edits; adjacent slots, the edited record itself, and cancelled/no-show records do not conflict. Outside-hours appointments require a second-step owner override. Status transitions update UTC lifecycle metadata; a cancellation is refilled only by a later-created active appointment for the same practitioner that overlaps the released interval. No migration beyond BL-011 is required; rollback removes ledger mutations while leaving catalogs and workspaces readable.
- **Tasks**:
  1. Write failing unit and component tests for the UTC-instant/local-availability contract, DST gaps and repeated hours, and previous/next/current week navigation; implement time and week helpers and connect the existing date control to the ledger range.
  2. Write failing component tests for practitioner and service create/edit/deactivate, historical label preservation, active-only new/reassignment selectors, and active-practitioner coverage; implement the minimum catalog controls required by the ledger.
  3. Write failing component tests for stable identity through appointment creation/editing, all status transitions and lifecycle timestamps, confirmed deletion, and cancellation refill; implement the ledger and focused record editor.
  4. Write failing component tests for weekly practitioner availability, including explicit closed days and active-practitioner coverage; implement the dedicated Availability tab and persistence through the BL-011 repository.
  5. Write failing unit and component tests for malformed records, dangling references, valid historical inactive references, blocked new inactive assignments, self-aware overlap rules, adjacent/cancelled/no-show cases, and outside-hours confirmation; implement blocking validation and the explicit override.
- **Test plan**:
  - Criterion 1: pure time/week tests cover UTC storage, local-date availability, DST gaps/repeated-hour disambiguation, and week boundaries; component tests prove previous/next/today keeps the range and rows synchronized.
  - Criteria 2–3: parser and component tests prove deactivation preserves historical records and labels, excludes only inactive practitioners from current coverage, and removes inactive choices from new/reassigned records; the same layer covers stable-ID appointment CRUD, lifecycle transitions, refill matching, confirmed deletion, generated anonymous-ID selection, closed days, and dedicated availability editing.
  - Criterion 4: pure validation tests cover invalid values and overlap exceptions; component tests prove blocked saves and the two-step outside-hours override.

### BL-013 — Derive dashboard opportunities from manual records
- **Status**: done
- **Dependencies**: BL-011, BL-012
- **Likely touched files**: `lib/practice-insights.ts`, `lib/practice-insights.test.ts`, `lib/dashboard-calculations.ts`, `lib/dashboard-calculations.test.ts`, `lib/dashboard-fixtures.ts`, `lib/dashboard-fixtures.test.ts`, `app/page.tsx`, `app/page.test.tsx`
- **Design**: Add one record-to-dashboard-input adapter and retain `deriveDashboard(input, dismissed)` as the renderer-facing boundary; never create a manual-only calculation path. Source arbitration is fixed: connected data is authoritative while connected; otherwise the explicitly active owner, sample-derived, or read-only sample source supplies all calculations, with no cross-source merge. The adapter filters the selected local week, deduplicates by stable ID, and exposes catalog/active-practitioner coverage, exclusions, provenance, lifecycle, and trailing six-month history ending at the week boundary. Capacity counts regular availability minus scheduled/completed appointments. For each practitioner, at least three trailing-six-month completed appointments evidence a median integer cents per service hour; multiply that rate by a continuous usable open interval of at least two hours occurring at least 48 hours after a fixed evaluation clock, round down to integer cents, and compare the estimated interval total strictly against 15,000 cents. Tests cover 14,999, 15,000, and 15,001 cents. Cancelled/no-show records have no booked or realized value, and outside-hours overrides do not expand regular availability. Retention requires at least three completed visits for a generated client ID, a current gap at least 14 days beyond its median interval, and no future scheduled record; missing consent/suppression evidence limits it to an aggregate owner-review signal with no audience or outreach value. Sample mode alone preserves the representative Square flow; owner/sample-derived modes stop at evidence with `Mark reviewed` and no audience, draft, export, provider link, send, booking, or payment claim. Source or week changes close stale drawers and reset dismissals before rendering new evidence. Zero hours, partial catalogs/coverage, missing IDs, insufficient history, repeated edits, and lifecycle anomalies are explicit unavailable states. No persisted schema change is planned; rollback returns the page to fixtures without altering stored workspaces.
- **Tasks**:
  1. Write failing calculation tests for selected-week adaptation, stable-ID edits/removals, lifecycle-based cancellation refill, deduplication, coverage, integer-cent value, and status exclusions; implement the record-to-input adapter.
  2. Write failing fixed-clock tests for practitioner-grouped capacity value evidence and totals below/equal/above 15,000 cents plus the exact anonymous-retention gates; derive actionable capacity or owner-review retention signals and explicit unavailable reasons.
  3. Write failing fixture and component tests for source arbitration, sample-only scenario selection, context reset, ledger-to-dashboard reconciliation, and source-aware action paths; reconcile fixture-owned banners/metadata/copy/handoff, then bind metrics, definitions, evidence, provenance, period, exclusions, and value summaries while preserving sample Square handoff and limiting owner data to `Mark reviewed`.
  4. Add review regressions for inactive-practitioner bookings, an explicit current evaluation instant, hydration-safe current-week selection, and the complete appointment mutation-to-insight journey.
- **Test plan**:
  - Criterion 1: calculation tests change, complete, cancel, and remove records and assert reconciled appointment, capacity, cancellation, and value outputs for the selected week.
  - Criterion 2: fixed-clock calculation tests prove the practitioner-grouped median cents/hour evidence, two-hour/48-hour gate, estimated interval totals at 14,999/15,000/15,001 cents, and the three-completion/median-gap/future-booking retention gate, plus explicit unavailable reasons for missing catalogs, availability, coverage, anonymous IDs, history, and consent/suppression evidence.
  - Criterion 3: component tests inspect definitions and evidence for period, coverage, exclusions, and provenance without exposing individual records.
  - Criterion 4: calculation and component tests cover stable-ID repeated edits without duplicates and preserve estimated, attributed, completed, and realized value separation.
  - Criterion 5: component tests prove sample mode retains the representative Square path while owner and sample-derived modes expose only evidence review and `Mark reviewed`, with no audience, draft, export, provider link, send, booking, or payment claim.
  - Criterion 6: adapter and component tests prove connected-source authority, no cross-source merging, and recoverable inactive manual slots.

## Parallel Groups

- Group 1: BL-011 — build inline; establishes the canonical workspace and persistence boundary.
- Group 2: BL-012 — starts after BL-011; builds the ledger and availability flow on that boundary.
- Group 3: BL-013 — starts after BL-012; adapts validated records into the existing dashboard derivation.

## Risks

- `app/page.tsx` is already a dense client component; keep data contracts and pure validation/adapter logic in `lib/`, but do not extract speculative UI abstractions without a second caller.
- The existing sample fixture contains aggregate dashboard inputs, not appointment-level evidence; the new raw sample must reconcile to independently asserted dashboard outputs.
- Retention currently uses six months of aggregate history, so the raw-record adapter must define its history window and minimum anonymous evidence without weakening existing unavailable-state rules.
- Browser storage can be unavailable or fail during hydration and writes; failures must remain visible and must not silently claim persistence.
- The ledger must not acquire client-booking, messaging, payment, notes, or contact-data responsibilities.
- Manual data cannot prove outreach eligibility, consent, or suppressions; retention output must remain an owner-review signal rather than an outreach recommendation.
- Manual data cannot prove outreach eligibility, consent, or suppressions; retention output must remain an owner-review signal rather than an outreach recommendation.

## Observations

- 2026-09-13 (BL-011): the existing sample dataset contains aggregate dashboard inputs rather than raw appointments; create one canonical raw sample workspace and derive its dashboard output instead of presenting aggregates as loadable records.
- 2026-09-13 (plan): plan review found manual data cannot support the sample's Square and audience workflow; owner-entered and sample-derived recommendations now stop at evidence review with no provider or outreach action.
- 2026-09-13 (BL-011): rejected free-form anonymous client keys because they invite personal data; the UI generates format-constrained opaque IDs and only selects existing IDs.
- 2026-09-13 (plan): stable record IDs, integer cents, UTC appointment and lifecycle instants, local-date availability, explicit source transitions, and exact evidence gates are required before raw records can drive trustworthy weekly results.
- 2026-09-13 (BL-013): corrected the capacity gate to compare the interval's estimated total with 15,000 cents, using a practitioner-grouped median cents-per-hour rate and fixed-clock boundary tests.
- 2026-09-13 (plan): keep owner and sample-derived workspaces in separate recoverable slots, make sample exploration read-only, and let any future connected provider become authoritative without merging sources.
- 2026-09-13 (BL-011): practitioner and service references need editable privacy-safe catalogs with stable IDs; hardcoded sample labels cannot support truthful owner entry or coverage.
- 2026-09-13 (BL-012): catalog deactivation preserves historical appointment references and labels; inactive entries are excluded only from current coverage and new or reassigned selections.
- 2026-09-13 (BL-011): JavaScript date parsing normalizes impossible calendar dates; stored local dates must round-trip through exact calendar components before acceptance.
- 2026-09-13 (BL-013): capacity evidence needs one explicit client-side as-of instant for both the current week and the 48-hour opportunity gate; deriving either from build time or the selected week creates stale results.
- 2026-09-13 (plan): code review requires explicit provider disconnection, visible insufficient-evidence reasons, nullable unknown opportunity value, and source-aligned week selection before ship.
- 2026-09-13 (plan): deferred non-blocking navigation, responsive reachability, edit-test depth, ID-generator reuse, and tab-semantics findings to BL-014 through BL-018.
- 2026-09-13 (BL-013): unknown recommendation value makes the aggregate value unavailable rather than coercing it to zero; manual evidence drawers now show period and concrete exclusion counts.
- 2026-09-13 (BL-013): sample-derived evidence must name its own provenance, and partially outside-hours appointments count only their overlap with regular availability in both capacity metrics and opportunity intervals.
- 2026-09-13 (BL-012): ledger component coverage now edits every appointment field, exercises no-show, and overwrites existing availability; removed the superseded BL-016 follow-up.
- 2026-09-13 (BL-013): capacity availability and appointment overlaps use resolved instants rather than wall-clock subtraction so repeated and skipped daylight-saving hours retain real elapsed duration.
- 2026-09-13 (BL-012): availability boundaries and outside-hours validation share resolved-instant daylight-saving semantics; fixed connected fixtures retain their source period, and appointment definitions explicitly exclude no-shows.
- 2026-09-13 (BL-012): repeated workspace validation caches deterministic timezone and local-time resolution results; without reuse, the expanded component suite crossed its per-test runtime gate.
- 2026-09-13 (BL-013): timezone caching alone did not stabilize the full gate; workspace-to-dashboard derivation is memoized by source, week, and workspace instead of repeating on unrelated editor keystrokes.
- 2026-09-13 (BL-013): both sample scenario selectors share one context-reset path so dismissed recommendations and open action state cannot leak into a newly selected scenario.
- 2026-09-14 (BL-011): ship review found source and week reset tests closed editors without proving the promised confirmation before discarding an in-progress draft.

## Archived Specs

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
