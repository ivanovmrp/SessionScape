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
- **Design**: Add a provider-neutral `PracticeWorkspace` contract with `{ version, source, timezone, availability, appointments }` and a small browser-storage repository with `load`, `save`, and `clear`. Appointment records contain only practitioner, service, start, duration, value, status, and an optional anonymous returning-client key; reject unknown and prohibited persisted fields at the parsing boundary. The canonical sample becomes raw workspace records from which dashboard inputs can later be derived, not a wrapper around current aggregates. Edge cases include first render before browser hydration, empty records, corrupt JSON, unknown schema versions, unavailable storage, quota failures, and prohibited fields. Version 1 needs no forward migration; an unknown or invalid version returns a visible recoverable empty state without overwriting the source value. Rollback removes the new storage key and UI entry path while retaining the existing aggregate fixtures.
- **Tasks**:
  1. Write failing unit tests for the versioned workspace parser, provider-neutral raw sample records, and `load`/`save`/`clear`; implement the minimum typed contract and storage repository.
  2. Write failing component tests for empty and explicitly loaded sample workspaces with clear source labels; add the Practice Data entry state without changing dashboard derivation yet.
  3. Write failing component tests for reload persistence, deliberate clearing, invalid storage, and storage failures; implement hydration-safe persistence and visible recovery.
- **Test plan**:
  - Criterion 1: component integration tests start empty, load the canonical raw sample workspace explicitly, and assert owner-entered versus sample source labels.
  - Criterion 2: unit parser tests accept exactly the allowed availability and appointment fields and reject names, contact details, notes, health, intake, payment-card, and unknown fields.
  - Criterion 3: unit repository and component tests cover reload, deliberate clear confirmation, corrupt JSON, unknown versions, unavailable storage, and quota failure without destructive overwrite.
  - Criterion 4: unit and unmocked jsdom component tests prove all states without network or external-service calls.

### BL-012 — Make the weekly appointment ledger operable
- **Status**: not started
- **Dependencies**: BL-011
- **Likely touched files**: `lib/practice-workspace.ts`, `lib/practice-workspace.test.ts`, `app/page.tsx`, `app/page.test.tsx`, `app/globals.css`
- **Design**: Follow `docs/sketches/manual-practice-data/option-b.html`: a ledger-first Practice Data surface with a dedicated Availability tab, not a scheduling calendar. Pure helpers own practice-timezone week ranges, availability validation, appointment validation, and active-overlap detection; the UI persists only validated workspace snapshots. Malformed date/time, non-positive duration/value, cross-week records, and active overlaps are blocked. Adjacent slots, the record being edited, and cancelled/no-show records do not conflict. Outside-hours appointments require an explicit second-step owner override. DST week boundaries, midnight crossings, missing availability, practitioner-specific hours, and confirmed deletion are explicit edge cases. No data migration beyond the BL-011 versioned boundary is required; rollback removes ledger mutations while leaving the workspace readable.
- **Tasks**:
  1. Write failing unit and component tests for previous, next, and current-week navigation across timezone and DST boundaries; implement week helpers and connect the existing date control to the ledger range.
  2. Write failing component tests for appointment creation, editing, all four statuses, and confirmed deletion; implement the ledger and focused record editor.
  3. Write failing component tests for weekly practitioner availability; implement the dedicated Availability tab and persistence through the BL-011 repository.
  4. Write failing unit and component tests for malformed records, self-aware overlap rules, adjacent/cancelled/no-show cases, and outside-hours confirmation; implement blocking validation and the explicit override.
- **Test plan**:
  - Criterion 1: pure week-helper tests cover timezone and DST boundaries; component tests prove previous/next/today keeps the visible range and rows synchronized.
  - Criteria 2–3: component integration tests cover appointment CRUD, each status, confirmed deletion, and dedicated availability editing with the exact allowed fields.
  - Criterion 4: pure validation tests cover invalid values and overlap exceptions; component tests prove blocked saves and the two-step outside-hours override.

### BL-013 — Derive dashboard opportunities from manual records
- **Status**: not started
- **Dependencies**: BL-011, BL-012
- **Likely touched files**: `lib/practice-insights.ts`, `lib/practice-insights.test.ts`, `lib/dashboard-calculations.ts`, `lib/dashboard-calculations.test.ts`, `app/page.tsx`, `app/page.test.tsx`
- **Design**: Add one record-to-dashboard-input adapter and retain `deriveDashboard(input, dismissed)` as the renderer-facing boundary; never create a manual-only calculation path. The adapter owns selected-week filtering, record coverage, exclusions, source, and the retention-history window. Capacity requires serviceable availability plus active appointments; retention requires enough completed history with stable anonymous keys. Zero serviceable hours, partial practitioner coverage, missing keys, insufficient history, repeated-ID edits, cancelled/no-show value exclusion, and outside-hours overrides produce explicit coverage or unavailable states. Existing value-classification and synthetic-action truthfulness rules remain unchanged. No persisted schema change is planned; rollback returns the page to aggregate fixtures without altering stored workspace data.
- **Tasks**:
  1. Write failing calculation tests for selected-week record adaptation, statuses, edits/removals, deduplication, coverage, and value exclusions; implement the record-to-input adapter.
  2. Write failing tests for sufficient and insufficient capacity and anonymous retention evidence; derive or suppress recommendations with explicit reasons.
  3. Write failing component tests for ledger-to-dashboard reconciliation; bind metrics, definitions, recommendation evidence, source labels, period, exclusions, and value summaries to the selected workspace week.
- **Test plan**:
  - Criterion 1: calculation tests change, complete, cancel, and remove records and assert reconciled appointment, capacity, cancellation, and value outputs for the selected week.
  - Criterion 2: calculation tests prove capacity and retention thresholds plus explicit unavailable reasons for missing availability, partial coverage, absent anonymous keys, and insufficient history.
  - Criterion 3: component tests inspect metric definitions and recommendation evidence for period, coverage, exclusions, and sample versus owner-entered source without exposing individual records.
  - Criterion 4: calculation and component tests cover repeated edits without duplicate records and preserve estimated, attributed, completed, and realized value separation.

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

## Observations

- 2026-09-13 (BL-011): the existing sample dataset contains aggregate dashboard inputs rather than raw appointments; create one canonical raw sample workspace and derive its dashboard output instead of presenting aggregates as loadable records.

## Archived Specs
