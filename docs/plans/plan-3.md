# Plan 3: Make the prototype trustworthy and actionable
Status: COMPLETE
Advances: Owners see reconciled, explicitly qualified opportunity numbers and can move from an explainable recommendation to an owner-controlled provider handoff without false claims of automation.

## Goal

Derive every displayed dashboard value from inspectable synthetic inputs, establish browser interaction coverage, and complete the guided action-validation flow selected in the committed wireframe.

## Stories

### BL-002 — Reconcile synthetic dashboard calculations
- **Status**: done
- **Dependencies**: BL-001, BL-010
- **Likely touched files**: `lib/dashboard-calculations.ts`, `lib/dashboard-calculations.test.ts`, `lib/dashboard-fixtures.ts`, `lib/dashboard-fixtures.test.ts`, `app/page.tsx`, `app/page.test.tsx`
- **Design**: Replace presentation-first fixture strings with numeric scenario inputs consumed by `deriveDashboard(input)`, returning the existing render-ready view model plus explicit `current | partial | unavailable | stale` states. Keep money in integer cents and format only at the view-model boundary; visible opportunity count and cents-total derive from the non-dismissed recommendation set. Edge cases: distinguish valid zero from unavailable; round ratios once at the derivation boundary; partial availability must hide capacity values without erasing supported appointment or retention values; stale values remain last-known and visibly qualified; repeated or unknown dismissal IDs must not change totals twice. Tests independently calculate expectations from source inputs rather than repeating production helpers. No persistent-data migration exists; rollback restores the prior synthetic fixture module and page bindings in one story revert.
- **Tasks**:
  1. Write failing pure tests that independently calculate every current-scenario headline, metric, capacity, pulse, and opportunity value from numeric inputs; implement the smallest `deriveDashboard(input)` path and migrate the current fixture.
  2. Write failing partial, unavailable, and stale scenario tests; implement explicit availability/freshness states that suppress unsupported precision while preserving supported metrics.
  3. Write failing dismissal reconciliation tests for one, repeated, unknown, and all-dismissed IDs; derive the visible opportunity count and total cents and wire the page to that state.
- **Test plan**:
  - Criterion 1: pure unit tests independently compute and assert every displayed value for current, partial, and stale inputs; fixture-view assertions ensure the page receives those derived values.
  - Criterion 2: pure unit tests derive count and cents-total from visible recommendations before and after one, repeated, unknown, and all-item dismissals; a rendered smoke check confirms the page displays the result.
  - Criterion 3: pure unit tests distinguish zero, partial, unavailable, and stale states and assert unsupported capacity values/bars are absent rather than zero-filled or copied from current data.

### BL-010 — Establish browser component interaction testing
- **Status**: done
- **Dependencies**: BL-001
- **Likely touched files**: `package.json`, `package-lock.json`, `app/page.test.tsx`, `.agents/skills/stack-testing/SKILL.md`
- **Design**: Keep existing pure tests in Vitest's Node environment and opt the dashboard test into jsdom at file scope. Exactly lock test-only `@testing-library/react@16.3.3`, `@testing-library/dom@10.4.1`, `@testing-library/user-event@14.6.7`, and `jsdom@26.1.0`; jsdom 27.0.1's open dependency ranges now resolve packages requiring Node 20.19 and are out of bounds until BL-008. Exercise the real client component without mocking project modules. Edge cases: cleanup must prevent state leaking between tests; user events must be awaited; the harness must not require browser APIs during static export; pure calculation tests must stay in Node. No production/runtime migration; rollback removes the component test and four dev dependencies.
- **Tasks**:
  1. Add a colocated TSX test that imports the real dashboard and attempts a representative scenario selection and opportunity interaction, observe the missing browser-test dependency/environment failure, then install the four exact dev dependencies, opt only that test into jsdom, and make it pass alongside the existing Node suite and all quality gates.
- **Test plan**:
  - Criterion 1: component integration test renders the real page, changes the scenario control, opens a real recommendation, and observes resulting UI without mocking project modules.
  - Criterion 2: run the component test with existing pure tests under `npm test`, then lint, typecheck, and static build.
  - Criterion 3: inspect `package.json` and lockfile for exact dev-only versions and run a clean locked install on Node 20.18.

### BL-003 — Complete the prototype action-validation flow
- **Status**: done
- **Dependencies**: BL-001, BL-002, BL-010
- **Sketches**: docs/sketches/action-validation/option-a.html
- **Likely touched files**: `lib/dashboard-calculations.ts`, `lib/dashboard-calculations.test.ts`, `lib/dashboard-fixtures.ts`, `lib/dashboard-fixtures.test.ts`, `app/page.tsx`, `app/page.test.tsx`, `app/globals.css`
- **Design**: Implement the selected guided drawer from `docs/sketches/action-validation/option-a.html`: evidence → editable draft/audience → explicit approval snapshot → representative provider handoff with a visible four-stage value ladder. Extend each synthetic opportunity with a representative draft, audience presets, eligibility explanation, and provider handoff label; keep the approved content/audience snapshot in client-only prototype state and never send, book, collect payment, or advance outcome status. Interfaces are serializable fixture/view-model data plus local `review | draft | approval | handoff` stage and `draft | approved | dismissed` decision state. Edge cases: audience changes after text edits; zero eligible recipients disables approval; dismissal during draft removes the opportunity once; scenario change closes/reset the flow; partial capacity actions are absent; stale actions require a visible recheck warning; provider-link use remains only a handoff; approval never marks attributed, completed, or realized value. Parameterized component tests cover current, partial, and stale journeys with real modules. No stored-data migration; rollback removes the extended fixture fields and returns the drawer to its prior review-only state.
- **Tasks**:
  1. Write failing fixture/derivation contract tests for representative drafts, audience presets, eligibility explanation, provider labels, and scenario limitations; add only the synthetic fields the flow renders and preserve them through input-to-view-model derivation.
  2. Write failing component tests for review, text editing, preset/eligibility refinement, zero-recipient prevention, dismissal, and the frozen approval summary; implement the guided evidence/draft/approval stages.
  3. Write failing component tests for the representative Square handoff and visible estimated → attributed → completed → realized ladder; implement the handoff without changing any later outcome to observed.
  4. Parameterize the component journey across current, partial, and stale scenarios; implement the missing/qualified actions, stale recheck warning, and scenario-change reset, then align responsive drawer styling with the sketch.
- **Test plan**:
  - Criterion 1: component integration tests type into the real draft, change presets/eligibility, reject zero recipients, approve or dismiss, and assert no sent/delivered claim or duplicate dismissal.
  - Criterion 2: component integration test reaches the representative Square handoff and asserts explicit external/system-of-record, no-live-availability, no-booking, and no-payment language.
  - Criterion 3: component integration test asserts all four value labels remain visible and only estimated opportunity is current after approval/provider-link interaction.
  - Criterion 4: parameterized current, partial, and stale journeys assert freshness, coverage, limitations, capacity-action absence, stale recheck warning, and reset behavior throughout the drawer.

## Parallel Groups

- Group 1: BL-010 — build inline; establishes the component harness required by later rendered checks.
- Group 2: BL-002 — starts only after BL-010 is green; establishes the derived view model and reconciliation behavior.
- Group 3: BL-003 — starts only after BL-002 is green; consumes the derived view model and component harness.

## Risks

- Tests that reuse production formatters or derivation helpers would only echo implementation; expected values must be independently calculated from source inputs.
- BL-002 and BL-003 both touch `lib/dashboard-fixtures.ts` and `app/page.tsx`, so they must remain in separate sequential groups.
- jsdom 26.1.0 is the Node 20.18 compatibility pin; BL-008 must reassess it when raising the runtime because jsdom 27.0.1 now resolves Node 20.19-only transitive packages.
- The single client page may become dense; extract only pure calculations or concrete repeated UI, not speculative layers.
- Static export forbids server-only action handling; every action remains synthetic client state and the provider destination remains representative.
- The selected sketch is a pre-build artifact and will be pruned when BL-003 ships if no active story still references it.

## Observations

- 2026-09-12 (plan): added BL-010 because BL-003 requires browser interaction coverage and test infrastructure must be planned; Node 20.18 requires pinning jsdom 27.0.1 instead of current releases.
- 2026-09-12 (plan): user selected the guided drawer, preset audience filters without individual identities, and an always-visible four-stage value ladder; the kept sketch and BL-003 scope use those choices.
- 2026-09-12 (plan): amended BL-010 from jsdom 27.0.1 to 26.1.0 after npm resolved 27.0.1's open dependency ranges to Node 20.19-only packages; keep Node 20.18 and the full Plan 3 product scope.
- 2026-09-12 (BL-002): code review found that hard-coded pulse history and inconsistent weekday totals could fabricate a trend; derive history from reconciled numeric inputs and require full scenario assertions.
- 2026-09-12 (BL-003): code review found preserved audience and provider-handoff fields were not fully rendered; approval and handoff now consume the frozen contract directly.
- 2026-09-12 (BL-002): re-review found zero eligible visits became a fabricated 0%; zero denominators now yield unavailable and rendered fixtures share the cached derived scenario outputs.
- 2026-09-12 (BL-002): final code review found zero-hour capacity and incomplete retention histories still implied supported trends; both now remain explicitly unavailable until their full denominators are present.
- 2026-09-12 (BL-002): unavailable derived values must also suppress chart geometry; incomplete trends and zero-total weekday bars now render explicit unavailable states instead of empty shapes.

## Archived Specs

### BL-002 — Reconcile synthetic dashboard calculations
- **Status**: planned (Plan 3)
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-001, BL-010
- **Context**: The validation prototype must earn trust from independently checkable synthetic data, not merely display plausible numbers. Source: former BI-002 and the business validation plan.
- **Acceptance criteria**:
  1. Automated tests independently calculate and verify every displayed headline metric for the current, partial, and stale fixture scenarios.
  2. Opportunity counts and total estimated values reconcile with the underlying recommendations before and after dismissal.
  3. Unsupported or incomplete inputs produce explicit partial or unavailable states rather than fabricated precision.

### BL-003 — Complete the prototype action-validation flow
- **Status**: planned (Plan 3)
- **Priority · Effort**: P0 · M
- **Dependencies**: BL-001, BL-002, BL-010
- **Sketches**: docs/sketches/action-validation/option-a.html
- **Context**: Owner research requires a realistic path from an explainable recommendation to a controlled action and provider handoff without implying that outreach or booking happened inside SessionScape.
- **Acceptance criteria**:
  1. An owner can review and edit a representative action draft, refine its audience, and approve or dismiss it; nothing is presented as sent automatically.
  2. Approval leads to a clearly labeled representative provider-booking handoff that does not claim live availability, booking, or payment.
  3. The flow visibly distinguishes estimated opportunity, attributed booking, completed appointment, and realized revenue.
  4. Current, partial, and stale data states remain understandable throughout the action flow.

### BL-010 — Establish browser component interaction testing
- **Status**: planned (Plan 3)
- **Priority · Effort**: P0 · S
- **Dependencies**: BL-001
- **Context**: BL-003 requires realistic typing, selection, approval, dismissal, and provider-handoff tests, but the current Vitest harness has no browser-like environment or React interaction utilities. Source: planning discovery (Plan 3).
- **Acceptance criteria**:
  1. A colocated TSX component test renders the real client dashboard in a browser-like environment and drives representative user input without mocking project modules.
  2. Browser component tests and existing pure Node tests remain non-interactive and pass together under `npm test`; lint, type checking, and the static production build remain green.
  3. Test-only dependencies are exactly locked to versions compatible with React 19.1, Vitest 4.1, and Node 20.18, and do not enter production dependencies.
