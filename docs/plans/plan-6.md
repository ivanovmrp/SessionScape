# Plan 6: Make first practice setup self-guiding
Status: IN PROGRESS
Advances: enabling — a guided, visible practice-data setup path unblocks credible owner validation without turning the ledger into a scheduling wizard.

## Goal

Let a first-time owner save the minimum practitioner, service, availability, and appointment records without coaching or hunting for controls, while preserving the existing Practice Data workspace.

## Stories

### BL-019 — Guide owners through initial practice-data setup
- **Status**: not started
- **Dependencies**: BL-011, BL-012, BL-013
- **Likely touched files**: `app/page.tsx`, `app/page.test.tsx`, `app/globals.css`, `docs/testing/manual-prototype-smoke.md`
- **Design**: Follow `docs/sketches/guided-practice-setup/option-a.html`. Add a semantic four-step checklist above the existing editable workspace; derive completed/current steps only from the active saved workspace rather than persisting separate progress. The current step opens the existing form and moves keyboard focus to its first field. Successful creation—not routine edits—advances to the next existing editor: practitioner → service → availability → appointment → dashboard offer. The active form keeps its primary action visible at desktop and narrow widths, while validation and Cancel remain in the same form. Existing or complete workspaces retain all normal editors and can collapse or bypass guidance; source/week dirty-draft confirmation remains authoritative. Edge cases: no active practitioner/service, partially complete imported/sample-derived data, validation failure, save/storage failure, reload, deactivated-only catalogs, source/week changes, and an owner manually opening another editor. No stored schema changes or data migration; rollback removes guidance and layout rules without touching workspace records.
- **Tasks**:
  1. Write failing component tests for saved-record-derived step status, incomplete-workspace resume, complete-workspace state, and existing-record preservation; implement the semantic checklist around existing editors.
  2. Write failing component tests for checklist activation and focus plus practitioner-to-service, service-to-availability, availability-to-appointment, and appointment-to-dashboard progression; connect successful creates without changing routine edit behavior.
  3. Write failing regressions for validation/storage failure, deactivated-only catalogs, manual editor choice, and source/week draft protection; keep the current step stable until a record is actually saved.
  4. Add narrow-width action visibility rules and a checked-in synthetic-data manual smoke checklist; verify the full journey at desktop and the smallest supported viewport.
- **Test plan**:
  - Criterion 1: component tests seed empty, partial, complete, owner, and sample-derived workspaces and assert semantic step names, state, current position, and unchanged normal workspace controls.
  - Criteria 2–3: component tests activate each step, assert focus and visible primary-action semantics, save one valid record per stage, and verify the next existing editor opens; validation and storage failures remain on the same stage with draft/error intact.
  - Criterion 4: component tests reload partial storage, switch source/week through existing confirmation guards, exercise completed/existing workspaces, and prove no duplicate or replacement records.
  - Criterion 5: component tests cover the interaction contract; the manual checklist verifies uncoached desktop and narrow-width discoverability, persistence, source boundaries, and dashboard reconciliation with synthetic data.

## Parallel Groups

- Group 1: BL-019 — build inline; one story owns the shared Practice Data component and styles.

## Risks

- Automatically opening the next form can feel coercive for established owners; advance only after first-record creation and keep normal workspace controls available.
- Progress inferred from records must handle deactivated-only catalogs and partial sample-derived workspaces without claiming setup is complete.
- A sticky action area can cover validation or content on short screens; keep it inside the active form and verify the smallest supported viewport.
- Guidance must not bypass dirty-draft confirmation, storage error recovery, privacy boundaries, or connected-source authority.

## Observations

## Archived Specs
