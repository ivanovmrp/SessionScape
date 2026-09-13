# Plan 5: Make the prototype respond to owner-entered data
Status: IN PROGRESS
Advances: Owners without a supported booking integration can enter redacted practice records and see weekly metrics and recommendations respond, making prototype validation meaningful.

## Goal

Replace the fixed-only demonstration with a browser-local, owner-operated practice-data flow that preserves privacy boundaries and drives the existing trustworthy dashboard.

## Stories

### BL-011 — Establish a local redacted practice workspace
- **Status**: not started
- **Dependencies**: BL-002
- **Likely touched files**: `lib/practice-workspace.ts`, `lib/practice-workspace.test.ts`, `lib/dashboard-fixtures.ts`, `app/page.tsx`, `app/page.test.tsx`
- **Design**: Add a provider-neutral `PracticeWorkspace` contract with `{ version: 1, provenance, timezone, availability, appointments }` and a small browser-storage repository with `load`, `save`, and `clear`. Availability records use stable opaque IDs, practitioner IDs, ISO local dates, and start/end minutes in the practice's IANA timezone. Appointment records use stable opaque IDs, practitioner and service IDs, a UTC ISO instant, positive duration minutes, integer value cents, status, UTC `createdAt`/`statusChangedAt` and optional `cancelledAt`, plus an optional generated anonymous client ID matching `anon_[a-z0-9]{12}`. The UI can select an existing ID or generate one; it never accepts a free-form client identifier. The parser rejects unknown fields, invalid opaque IDs, and prohibited data. The canonical raw sample is explored separately and never overwrites the persisted owner workspace; copying it requires confirmation when owner records exist and records `sample-derived` provenance. Edge cases include first render before browser hydration, empty records, corrupt JSON, unknown schema versions, unavailable storage, quota failures, invalid lifecycle order, and destructive source transitions. Version 1 needs no forward migration; invalid data remains recoverable without overwriting its source. Rollback removes the storage key and entry path while retaining existing fixtures.
- **Tasks**:
  1. Write failing unit tests for the exact versioned record fields, stable IDs, generated anonymous-ID format, lifecycle timestamps, integer cents, provider-neutral raw sample, and `load`/`save`/`clear`; implement the minimum typed contract and storage repository.
  2. Write failing component tests for empty owner, read-only sample, confirmed sample-copy, and source labels; add non-destructive Practice Data source switching without changing dashboard derivation yet.
  3. Write failing component tests for reload persistence, deliberate clearing, invalid storage, and storage failures; implement hydration-safe persistence and visible recovery.
- **Test plan**:
  - Criterion 1: component integration tests start empty, explore the canonical raw sample without owner-data mutation, require confirmation before replacement, and assert sample, owner-entered, and sample-derived labels.
  - Criterion 2: unit parser tests accept stable system IDs, integer cents, ordered lifecycle instants, and generated anonymous IDs while rejecting free-form/nonconforming IDs, names, contact details, notes, health, intake, payment-card, and unknown fields; component tests expose only selection and generation controls.
  - Criterion 3: unit repository and component tests cover reload, deliberate clear confirmation, corrupt JSON, unknown versions, unavailable storage, and quota failure without destructive overwrite.
  - Criterion 4: unit and unmocked jsdom component tests prove all states without network or external-service calls.

### BL-012 — Make the weekly appointment ledger operable
- **Status**: not started
- **Dependencies**: BL-011
- **Likely touched files**: `lib/practice-workspace.ts`, `lib/practice-workspace.test.ts`, `app/page.tsx`, `app/page.test.tsx`, `app/globals.css`
- **Design**: Follow `docs/sketches/manual-practice-data/option-b.html`: a ledger-first Practice Data surface with a dedicated Availability tab, not a scheduling calendar. Persist appointment starts as UTC ISO instants; resolve date/time input through the workspace's IANA timezone. Persist availability as ISO local dates plus start/end minutes. Reject nonexistent DST-gap times, require the owner to choose the earlier or later offset for a repeated hour, and define a week as Monday 00:00 through the next Monday 00:00 in the practice timezone. Pure helpers own week ranges, availability validation, appointment validation, and practitioner-specific active-overlap detection. Malformed time, non-positive duration/value, cross-midnight/week records, and active overlaps are blocked. Stable IDs survive edits; adjacent slots, the edited record itself, and cancelled/no-show records do not conflict. Outside-hours appointments require a second-step owner override. Status transitions update UTC lifecycle metadata; a cancellation is refilled only by a later-created active appointment for the same practitioner that overlaps the released interval. No migration beyond BL-011 is required; rollback removes ledger mutations while leaving the workspace readable.
- **Tasks**:
  1. Write failing unit and component tests for the UTC-instant/local-availability contract, DST gaps and repeated hours, and previous/next/current week navigation; implement time and week helpers and connect the existing date control to the ledger range.
  2. Write failing component tests for stable identity through appointment creation/editing, all status transitions and lifecycle timestamps, confirmed deletion, and cancellation refill; implement the ledger and focused record editor.
  3. Write failing component tests for weekly practitioner availability; implement the dedicated Availability tab and persistence through the BL-011 repository.
  4. Write failing unit and component tests for malformed records, self-aware overlap rules, adjacent/cancelled/no-show cases, and outside-hours confirmation; implement blocking validation and the explicit override.
- **Test plan**:
  - Criterion 1: pure time/week tests cover UTC storage, local-date availability, DST gaps/repeated-hour disambiguation, and week boundaries; component tests prove previous/next/today keeps the range and rows synchronized.
  - Criteria 2–3: component integration tests cover stable-ID CRUD, every status and lifecycle transition, refill matching, confirmed deletion, generated anonymous-ID selection, and dedicated availability editing.
  - Criterion 4: pure validation tests cover invalid values and overlap exceptions; component tests prove blocked saves and the two-step outside-hours override.

### BL-013 — Derive dashboard opportunities from manual records
- **Status**: not started
- **Dependencies**: BL-011, BL-012
- **Likely touched files**: `lib/practice-insights.ts`, `lib/practice-insights.test.ts`, `lib/dashboard-calculations.ts`, `lib/dashboard-calculations.test.ts`, `app/page.tsx`, `app/page.test.tsx`
- **Design**: Add one record-to-dashboard-input adapter and retain `deriveDashboard(input, dismissed)` as the renderer-facing boundary; never create a manual-only calculation path. It filters the selected local week, deduplicates by stable record ID, and exposes coverage, exclusions, provenance, lifecycle, and a trailing six-month history ending at the selected-week boundary. Capacity counts regular availability minus scheduled/completed appointments; it becomes actionable only for at least two continuous future hours at least 48 hours away and, for a value estimate, at least three completed manual appointments yielding a median value per service hour above the existing $150 threshold. Cancelled/no-show records have no booked or realized value, and outside-hours overrides do not expand regular availability. Retention evidence requires at least three completed visits for a generated anonymous ID, a current gap at least 14 days beyond its median interval, and no future scheduled record; because manual data has no consent or suppression evidence, it produces an aggregate owner-review signal with no eligible-audience or estimated-outreach-value claim. A source-aware action contract preserves the representative Square flow only for sample mode; owner and sample-derived modes stop at an evidence drawer with `Mark reviewed` and no audience, draft, export, provider link, send, booking, or payment claim. Zero hours, partial coverage, missing IDs, insufficient history, repeated edits, and lifecycle anomalies are explicit unavailable states. No persisted schema change is planned; rollback returns the page to fixtures without altering stored owner data.
- **Tasks**:
  1. Write failing calculation tests for selected-week adaptation, stable-ID edits/removals, lifecycle-based cancellation refill, deduplication, coverage, integer-cent value, and status exclusions; implement the record-to-input adapter.
  2. Write failing tests for the exact capacity and anonymous-retention evidence thresholds, including incomplete history and absence of consent/suppression evidence; derive actionable capacity or owner-review retention signals and explicit unavailable reasons.
  3. Write failing component tests for ledger-to-dashboard reconciliation and source-aware action paths; bind metrics, definitions, evidence, provenance, period, exclusions, and value summaries while preserving sample Square handoff and limiting owner data to `Mark reviewed`.
- **Test plan**:
  - Criterion 1: calculation tests change, complete, cancel, and remove records and assert reconciled appointment, capacity, cancellation, and value outputs for the selected week.
  - Criterion 2: calculation tests prove the two-hour/48-hour/value-evidence capacity gate and the three-completion/median-gap/future-booking retention gate, plus explicit unavailable reasons for missing availability, partial coverage, absent anonymous IDs, insufficient history, and missing consent/suppression evidence.
  - Criterion 3: component tests inspect definitions and evidence for period, coverage, exclusions, and provenance without exposing individual records.
  - Criterion 4: calculation and component tests cover stable-ID repeated edits without duplicates and preserve estimated, attributed, completed, and realized value separation.
  - Criterion 5: component tests prove sample mode retains the representative Square path while owner and sample-derived modes expose only evidence review and `Mark reviewed`, with no audience, draft, export, provider link, send, booking, or payment claim.

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

## Observations

- 2026-09-13 (BL-011): the existing sample dataset contains aggregate dashboard inputs rather than raw appointments; create one canonical raw sample workspace and derive its dashboard output instead of presenting aggregates as loadable records.
- 2026-09-13 (plan): plan review found manual data cannot support the sample's Square and audience workflow; owner-entered and sample-derived recommendations now stop at evidence review with no provider or outreach action.
- 2026-09-13 (BL-011): rejected free-form anonymous client keys because they invite personal data; the UI generates format-constrained opaque IDs and only selects existing IDs.
- 2026-09-13 (plan): stable record IDs, integer cents, UTC appointment and lifecycle instants, local-date availability, explicit source transitions, and exact evidence gates are required before raw records can drive trustworthy weekly results.

## Archived Specs
