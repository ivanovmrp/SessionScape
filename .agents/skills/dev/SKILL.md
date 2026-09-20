---
name: dev
description: "Main SDLC entry point — use for ANY development request: new work, a feature idea, a bug, 'continue', 'what's next', or 'status'. Reads workflow state from docs/ and routes to the right phase."
---

# dev — Router

The workflow is defined in AGENTS.md (pipeline, artifacts, routing table, engineering rules) — it's loaded with the session. This skill only decides *what happens next*.

## 1. Read state (cheaply)

- `docs/project.md` — read it now if this session hasn't yet (project memory: north star, constraints, amendments — honor them)
- `docs/backlog.md` — exists? item counts per status (grep `**Status**`, don't read whole file)
- Active plan — highest `docs/plans/plan-N.md` with `Status: IN PROGRESS`; grep its story statuses
- `git branch --show-current` and `git log --oneline -5`

Always open with a 2-line status summary in plain words: plan + progress, then the recommended next action — written for the user, not the workflow (see AGENTS.md → Talking to the User).

## 2. Route

Route on the inferred need, not the literal words: restate a worded ask to yourself in problem form and check what it leaves unstated before picking a row (AGENTS.md → Pipeline, "Read the ask"). When it's genuinely unclear whether an ask is exploratory or concrete, `refine` is the cheaper mistake — an unnecessary interview costs minutes, a wrong story costs a plan.

| State / intent | Action |
|----------------|--------|
| Exploratory ask — vague/broad idea, "think this through", revisit a shipped feature, weigh a design choice | Invoke the `refine` skill (thought-partner interview); resume routing on the artifacts it writes |
| User described concrete new work | Groom it directly |
| No backlog | Groom: `explorer`-agent scan of the codebase for work signals |
| Backlog has `ready` items, no active plan | Plan — propose story selection ranked against the north star; lead the proposal with the plan's `Advances:` line so the user confirms direction, then confirm selection |
| Active plan, available stories (deps met) | Build — one story inline; parallel group → confirm, create the worktrees, then fan out `implementer` agents in one spawn |
| All stories `done`, no review yet | Test gate, then dispatch `reviewer` (scope `code`) |
| Review clean or findings triaged | Ship sequence (PR only after explicit user yes) |
| Small change, ≤3 files, well understood | Quick path — TDD, commit, no artifacts |
| Production emergency | Hotfix path |
| "Will X even work?" — an exploratory *build* question | Spike path — timeboxed disposable branch, conclusion written down (side doors, AGENTS.md) |
| "Cut a release" | Release act: changelog heading + compaction + tag (per AGENTS.md) |
| Documentation ask ("explain the project", "update the canvas") | README edits directly; for the canvas, point the user to invoke `canvas` themselves (`/skills` → canvas) — it's user-gated |
| "auto" (e.g. `dev auto`) | Auto mode — see section 4 |
| "status" / unclear intent | Status + recommendation, touch nothing |
| No `docs/project.md` (project never initialized) | Recommend invoking `init-prompt` (composes the init prompt), then `sdlc-init` — don't groom into an unscaffolded project |

## 3. Gates and recovery

- Auto-run light phases (status, groom, plan bookkeeping). Confirm before heavy ones (build, review, ship). PR creation always requires an explicit yes.
- If plan and backlog statuses disagree, report the drift; fix only with approval, commit as `chore(plan): sync statuses`.
- If a gate is red (tests, build), stop routing forward — diagnose, map the failure to a story, fix or report. Never carry a red gate into the next phase.
- Subagent failed or partial? Merge the successful branches first (tests between merges); a failure traced to new information routes into the mid-plan discovery ladder (AGENTS.md → Build, usually rung 3), otherwise redo the failed story inline.
- User abandons a plan? Unfinished stories return to `ready` in the backlog, finished ones keep their plan record, plan Status becomes `PARTIAL`. Mid-fan-out, rung 4's worktree rules apply first: collect reports, merge surviving finished branches serially with tests, leftovers to the user.
- Story balloons mid-plan (far bigger than estimated)? A rung-3 discovery (AGENTS.md → Build): split via a decision block — core criteria stay on the original backlog item (still in this plan's scope), the rest becomes a new backlog item — recorded as a `(plan)` Observation, groups re-validated.

## 4. Auto mode (`dev auto`)

Reduced confirmation, not unsupervised execution: chain phases through the plan without the routine "ready to proceed?" pauses. Story-to-story progress gets one line ("BL-003 done — building BL-004"); phase boundaries still get the full transition briefing (framed as what's still reversible — interrupting is always fine), and decision echoes never drop (AGENTS.md → Talking to the User) — auto removes pauses, never information. Everything else holds:

- **Hard stops — pause and ask even in auto**: a red gate (test regression, broken build), a scope-guard trip (3 failed attempts), a mid-plan discovery at rung 3 or above (plan amendment / abort), all remaining stories blocked, artifact drift, or genuine ambiguity in a requirement.
- **Still explicitly confirmed**: parallel dispatch (once per group), a detour declaration and the consecutive-non-direct-plans direction check (auto never decides direction alone), and PR creation (always — auto mode never bypasses the Irreversibles rule).
- **No gate is skipped** — TDD, per-merge test runs, reviewer passes, and the verify-by-running ship step all run exactly as in normal mode. Auto removes pauses, never checks.

Auto mode ends when the plan completes, a hard stop fires, or the user interrupts.
