# Plan 7: Remove Practice Data usability barriers
Status: IN PROGRESS
Advances: direct — owners can move between dashboard and Practice Data on every supported viewport with reachable, keyboard-correct navigation.

## Goal

Restore reliable navigation from the Practice Data surface, preserve access on narrow screens, and make its Appointment/Availability tabs fully operable by keyboard and assistive technology.

## Stories

### BL-014 — Restore dashboard destinations from Practice Data
- **Status**: done
- **Dependencies**: BL-012
- **Likely touched files**: `app/page.tsx`, `app/page.test.tsx`
- **Design**: Keep one shared navigation state and restore the dashboard before applying the requested section target. Dashboard and Practice Data must remain independently reachable without duplicating destination definitions.
- **Tasks**:
  1. Add failing component tests for Opportunities, Clients, and Activity navigation from Practice Data.
  2. Implement dashboard restoration and section targeting while preserving existing source/week and dirty-draft guards.
  3. Run the component suite and verify all primary destinations from both surfaces.
- **Test plan**: Component tests prove each destination restores the dashboard and lands on the requested section from Practice Data and remains reachable from the dashboard.

### BL-015 — Keep Practice Data reachable on small screens
- **Status**: done
- **Dependencies**: BL-012, BL-013
- **Likely touched files**: `app/page.tsx`, `app/globals.css`, `app/page.test.tsx`, `docs/testing/manual-prototype-smoke.md`, browser-test configuration if the existing harness cannot set viewport dimensions
- **Design**: Preserve the desktop navigation model and change only narrow-screen visibility/overflow rules. The responsive acceptance must be verified in a real browser at 360×640 because jsdom component tests do not evaluate CSS media queries; extend the existing browser smoke path rather than adding a second UI harness. No data or navigation-state migration is needed, and rollback is limited to the responsive rules and their tests.
- **Tasks**:
  1. Add failing responsive interaction tests at the smallest supported viewport for Practice Data navigation and dashboard week controls.
  2. Adjust narrow-screen layout/visibility rules so both controls remain discoverable and usable without breaking desktop behavior.
  3. Run responsive tests and manually verify the narrow-screen path.
- **Test plan**: Component tests cover rendered control wiring; a real-browser smoke test at 360×640 proves the Practice Data navigation item and dashboard week controls are visible and actionable, while existing desktop component tests remain green.

### BL-018 — Complete keyboard semantics for Practice Data tabs
- **Status**: done
- **Dependencies**: BL-012
- **Likely touched files**: `app/page.tsx`, `app/page.test.tsx`
- **Design**: Implement a two-tab WAI-ARIA tabs contract with linked tabpanels, one selected/focusable tab, and Left/Right arrow movement with wraparound. Keep the existing panel content and editor state unchanged.
- **Tasks**:
  1. Add failing component tests for tab/tabpanel IDs, selection, roving tabindex, and arrow-key movement.
  2. Implement the keyboard and accessible relationships for Appointment and Availability tabs.
  3. Run the component suite and check focus behavior through the existing modal/editor flows.
- **Test plan**: Component tests cover initial selection, accessible linkage, exactly one selected/focusable tab, arrow-key focus and selection changes, and activation of each panel.

## Parallel Groups

- Group 1: BL-014, BL-015, BL-018 — serial implementation required because all stories share `app/page.tsx` and `app/page.test.tsx`; no worktree fan-out.

## Risks

- Navigation restoration must not discard dirty Practice Data drafts or silently change insight authority.
- Narrow-screen visibility changes can expose controls without making them fit; verify at the smallest supported viewport.
- Tab semantics must remain compatible with existing focus containment and editor transitions.

## Observations

- 2026-09-17 (BL-015): user manually confirmed the required 360×640 breakpoint behavior, closing the previously pending browser check.

- 2026-09-17 (BL-015): live browser verification confirmed Practice Data and week controls render at 1536×791; the connected browser surface exposed no viewport override, so the required 360×640 breakpoint check remains pending.
