# Plan 4: Remove the final prototype interaction blockers
Status: IN PROGRESS
Advances: Owners can recover dismissed recommendations and operate both dashboard drawers by keyboard, enabling accessible, trustworthy prototype validation.

## Goal

Make recommendation dismissal honestly reversible and make both dashboard drawer types fully usable by keyboard before owner validation begins.

## Stories

### BL-004 — Make dismissed recommendations truthfully recoverable
- **Status**: not started
- **Dependencies**: BL-001
- **Likely touched files**: `app/page.tsx`, `app/page.test.tsx`, `app/globals.css`
- **Tasks**:
  1. Write a failing component test that dismisses a recommendation and identifies its title, type, and estimated value in a real Activity section; render dismissed fixture records by ID using the existing opportunity data.
  2. Write a failing repeated-cycle component test; implement idempotent restore-by-ID, return the card and reconciled count/value exactly once, and add only the compact Activity styling the test-backed UI requires.
- **Test plan**:
  - Criterion 1: a component integration test dismisses a real recommendation and asserts its identifying title, type, and estimated value in Activity.
  - Criterion 2: the same layer restores the recommendation and asserts that its opportunity card, action count, and total value return exactly once.
  - Criterion 3: a repeated dismiss/restore test covers duplicate clicks, restoring one of multiple records, and scenario reset without duplicate opportunity or Activity entries.

### BL-005 — Make dashboard dialogs keyboard accessible
- **Status**: not started
- **Dependencies**: BL-001
- **Likely touched files**: `app/page.tsx`, `app/page.test.tsx`
- **Design**: Keep focus behavior inside the existing client page with shared dialog, initial-control, and opener references rather than adding a dependency. Opening either drawer moves focus to its close control; Tab and Shift+Tab wrap among enabled, visible controls in only the active drawer; action-stage transitions move focus from an unmounted control to the first meaningful control in the new stage. Escape, the close control, and backdrop closure return focus to the captured opener when it still exists. Dismissal may remove a recommendation opener, so that path closes without targeting a detached element; scenario changes close either drawer and leave focus on the scenario control rather than reviving stale opener focus. The metric drawer's single tabbable control, action-stage control changes, disabled audience approval, nested textarea/select/link controls, and two simultaneously addressable drawers are explicit edge cases. Component interaction tests use installed React 19 types and real DOM keyboard behavior. No data migration exists; rollback removes the focus lifecycle and its tests.
- **Tasks**:
  1. Write failing component tests for initial focus, forward/reverse Tab containment in both drawer types, and focus continuity when action-stage controls unmount; implement one shared in-page focus lifecycle for the active dialog and move stage-transition focus to the next meaningful control.
  2. Write failing Escape, close-control, backdrop, dismissal, and scenario-change tests across both drawers; capture each opener, centralize accessible closure, restore focus only when the opener remains connected, and keep focus on the scenario control when its change closes a drawer.
- **Test plan**:
  - Criterion 1: component integration tests open each drawer, assert initial focus, prove `Tab` and `Shift+Tab` remain within its enabled controls, and assert each action-stage transition focuses a meaningful control still inside the dialog.
  - Criterion 2: component integration tests close both drawer types through Escape, labeled close controls, backdrop clicks, and scenario changes; connected openers regain focus, dismissal does not target its removed opener, and scenario changes retain focus on the scenario control.
  - Criterion 3: the colocated component suite covers both metric and recommendation drawers without mocking project modules.

## Parallel Groups

- Group 1: BL-004 — build inline; establishes the dismissal and restoration close paths.
- Group 2: BL-005 — starts after BL-004; shares `app/page.tsx` and `app/page.test.tsx` and makes those paths focus-safe.

## Risks

- The client page is already dense; edit existing state and markup rather than extracting a new abstraction without a second caller.
- Restoring one of several dismissed recommendations must update Activity, cards, count, and total from the same deduplicated ID set.
- Focus restoration can target a stale or removed opener after dismissal or scenario changes; check DOM connection before focusing.
- The metric drawer has only one enabled control, so forward and reverse tab wrapping must still be deterministic.
- No new accessibility or UI dependency is justified; installed React types and browser behavior are the ground truth.

## Observations

- 2026-09-12 (plan): reuse the existing Activity navigation target and opportunity data for recovery; this completes reserved hierarchy rather than redesigning navigation, so Plan 4 needs no sketch.
- 2026-09-12 (BL-005): plan review found focus could escape when action-stage controls unmount and closure paths lacked explicit proof; stage transitions, backdrops, dismissal, and scenario changes now have named focus expectations and tests.

## Archived Specs
