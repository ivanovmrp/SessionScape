# Plan 6: Make first practice setup self-guiding
Status: COMPLETE
Advances: enabling — a guided, visible practice-data setup path unblocks credible owner validation without turning the ledger into a scheduling wizard.

## Goal

Let a first-time owner save the minimum practitioner, service, availability, and appointment records without coaching or hunting for controls, while preserving the existing Practice Data workspace.

## Stories

### BL-019 — Guide owners through initial practice-data setup
- **Status**: done
- **Dependencies**: BL-011, BL-012, BL-013
- **Likely touched files**: `app/page.tsx`, `app/page.test.tsx`, `app/globals.css`, `docs/testing/manual-prototype-smoke.md`
- **Design**: Follow `docs/sketches/guided-practice-setup/option-a.html`. Add an ordered four-step checklist above the existing editable workspace using native buttons and `aria-current="step"`; derive progress only from the active saved workspace, globally rather than per selected week. Practitioner is complete with one active practitioner, service with one active service, availability with one non-closed interval for an active practitioner on any date, and appointment with one record on any date. A closed day alone does not complete availability. Disabled future steps expose why their prerequisite is missing. Activating an available step opens the existing form and focuses its first field. Service progression targets the first active practitioner and the first selected-week date without an availability record, scanning Monday through Sunday; if all dates have records but none is open, focus the earliest closed date for editing. Successful persisted creation—not routine edits—advances practitioner → service → availability → appointment. Every guided editor uses the same viewport-fixed action bar with Save-and-continue and Cancel, plus reserved page space so it cannot cover fields, validation, or browser controls; manually verify 1440×900, 768×600, and 360×640. Completion renders a source-aware choice rather than navigating: if connected data is authoritative, `Use owner data for insights` or `Use sample-derived data for insights`, based on the active editable source, invokes the existing disconnect confirmation before showing that same labeled source; `Keep connected insights` leaves authority unchanged. When the dashboard already uses the active browser-local source, offer `View owner insights` or `View sample-derived insights`. Existing or complete workspaces retain all normal editors and can collapse or bypass guidance; source/week dirty-draft confirmation remains authoritative. Validation or repository-save failure keeps the editor, draft, and current step unchanged; advancement requires persisted success. Edge cases: no active practitioner/service, partially complete imported/sample-derived data, validation failure at each editor, storage failure, reload, deactivated-only catalogs, source/week changes, and an owner manually opening another editor. No stored schema changes or data migration; rollback removes guidance and layout rules without touching workspace records.
- **Tasks**:
  1. Write failing component tests for the global completion predicates, ordered/native step semantics, prerequisite-disabled states, partial/complete resume, and existing-record preservation; implement the saved-record-derived checklist around existing editors.
  2. Write failing component tests for keyboard activation and focus plus practitioner-to-service, deterministic service-to-availability targeting, availability-to-appointment, and source-aware owner/sample-derived completion choices; connect persisted first-record creation without changing routine edit behavior or silently changing dashboard authority.
  3. Write one failing validation regression per practitioner, service, availability, and appointment step plus a repository-save failure regression; keep the current step, editor, and draft stable with no duplicate until persistence succeeds, while retaining source/week draft protection and manual editor choice.
  4. Add a viewport-fixed guided action bar with reserved content space and a checked-in synthetic-data manual smoke checklist; verify the full uncoached journey at 1440×900, 768×600, and 360×640.
- **Test plan**:
  - Criterion 1: component tests seed empty, partial, globally complete, owner, and sample-derived workspaces and assert ordered-list/native-button semantics, `aria-current`, prerequisite state, global completion, and unchanged normal workspace controls.
  - Criteria 2–3: component tests keyboard-activate each available step, assert first-field focus, save one valid persisted record per stage, verify deterministic practitioner/date targeting, and prove practitioner, service, availability, and appointment validation failures plus repository failure retain the same editor/draft/step without duplicates.
  - Criterion 4: component tests reload partial storage, switch source/week through existing confirmation guards, prove completed owners are not re-coached in another week, and verify connected-versus-owner and connected-versus-sample-derived completion choices never merge, mislabel, or silently change authority.
  - Criterion 5: component tests cover the interaction contract; the manual checklist verifies uncoached discoverability, unobscured fixed actions, persistence, source boundaries, and dashboard reconciliation at 1440×900, 768×600, and 360×640 using synthetic data.

## Parallel Groups

- Group 1: BL-019 — build inline; one story owns the shared Practice Data component and styles.

## Risks

- Automatically opening the next form can feel coercive for established owners; advance only after first-record creation and keep normal workspace controls available.
- Progress inferred from records must handle deactivated-only catalogs and partial sample-derived workspaces without claiming setup is complete.
- A viewport-fixed action area can cover validation or content on short screens; reserve page space beneath every guided editor and verify all three exact viewport sizes.
- Guidance must not bypass dirty-draft confirmation, storage error recovery, privacy boundaries, or connected-source authority.

## Observations

- 2026-09-14 (plan): pre-build review tightened broad setup progression into global saved-record predicates, native keyboard controls, deterministic availability targeting, and persistence-failure guarantees so the criteria test the uncoached journey rather than implementation presence.
- 2026-09-14 (plan): the first sketch's end-of-form sticky action could reproduce the invisible-Save defect; require a viewport-fixed action with reserved content space and smoke checks at 1440×900, 768×600, and 360×640.
- 2026-09-14 (plan): setup completion must label and select the active editable source—owner or sample-derived—rather than hardcoding owner data.
- 2026-09-14 (BL-019): browser verification found the catalog button selector overrode the primary background, producing white Save text on white; the catalog primary rule now sets the dark background explicitly.
- 2026-09-14 (BL-019): the existing 360px navigation hid Practice data, blocking an uncoached mobile start; mobile navigation now retains Overview and Practice data.
- 2026-09-14 (BL-019): setup transitions must follow newly persisted qualifying records regardless of whether the owner entered through the guide or normal workspace; converting a closed record into the first open interval is a progression event, not a routine edit.
- 2026-09-14 (BL-019): live ship verification found normal-workspace completion bypassed the source choice and guided transitions left a duplicate-capable prior editor open; completion behavior must be entry-path independent, transitions must close the prior editor, and the enabled Appointment step must describe the next action rather than a satisfied prerequisite.
- 2026-09-14 (BL-019): supporting normal-workspace completion exposed an out-of-order outside-hours path that can create the first appointment before open availability; show the completion choice only when the newly saved workspace satisfies every derived setup prerequisite.

## Archived Specs

### BL-019 — Guide owners through initial practice-data setup
- **Status**: planned (Plan 6)
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-011, BL-012, BL-013
- **Sketches**: docs/sketches/guided-practice-setup/option-a.html
- **Context**: Post-ship owner testing found the catalog Save control was not visible or discoverable and the separate panels gave no clear path from practitioner to service, availability, and appointment. Use a persistent four-step checklist inside the existing Practice Data workspace; reject a separate full-screen wizard because owners must retain access to the normal ledger and catalogs. This story blocks BL-006 owner research until the uncoached manual smoke path passes.
- **Acceptance criteria**:
  1. An empty or incomplete editable workspace shows an ordered Practitioner → Service → Availability → Appointment checklist whose completed/current state is derived globally from saved records, identifies the current step with accessible semantics, and leaves the normal Practice Data workspace available.
  2. Each available checklist step is a native keyboard-operable control that opens and focuses the existing editor; while any guided editor is open, a viewport-fixed Save-and-continue action and Cancel remain visible without covering fields or validation at 1440×900, 768×600, and 360×640.
  3. A successfully persisted first practitioner advances to service; service advances to the first missing date for the first active practitioner in the selected week; the first saved open availability advances to appointment; and the first appointment completes the checklist. A closed day alone does not complete availability. Failed validation or persistence does not advance, duplicate, close the editor, or lose draft data.
  4. Completed setup offers an explicit source-aware dashboard choice: connected insights remain authoritative unless the owner confirms switching to the currently active, correctly labeled owner-entered or sample-derived insights. Reloading or changing source/week safely resumes at the globally first incomplete saved step; completed/existing workspaces are not re-coached each week or forced through a wizard.
  5. Component tests cover progress derivation, native keyboard activation, focus, successful transitions, validation failure at every step, persistence failure, reload/resume, source authority, and preservation of existing records; a checked-in manual smoke checklist covers the uncoached journey at all three specified viewport sizes using synthetic data only.
