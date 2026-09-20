# SDLC Workflow (Slim) — Codex Edition

> Lightweight agile SDLC for Codex. Solo developer or small team. Pipeline: **groom → plan → build (TDD) → review → ship**. All state lives in `docs/` artifacts, not conversation memory — any session resumes from the files alone. This file is the workflow; the skills are thin — two entry points plus on-demand modules.

## Project Memory (read this first)

`docs/project.md` is the project's memory (north star, stack, constraints, learnings, amendments — ≤30 lines). Codex has no file-import mechanism, so it is not auto-loaded: **read `docs/project.md` before acting on any workflow request** — at the start of every `dev`/`sdlc-init`/`refine`/`canvas`/`sketch` invocation and any session that touches the pipeline. Honor its Constraints and Amendments as if they were written here.

## Entry Points

| Skill | When |
|---------|------|
| `sdlc-init` | First time: greenfield setup or onboarding an existing codebase. Also re-validates an already-governed project (artifact drift check). User-invoked only (`/skills` picker or `$sdlc-init`). |
| `dev` | Everything else — the user describes what they want, or just invokes `dev` to continue. Plain development requests ("continue", a feature idea, a bug) route here via implicit skill invocation. |

Never make the user learn anything else. `dev` reads state and routes — including to the on-demand `refine` skill (thought-partner mode: define new features, revisit shipped ones, evaluate design choices) whenever the ask is exploratory rather than executable. `refine` can also be invoked directly, but it's a module, not a third entry point. Four modules are user-invoked-only (`allow_implicit_invocation: false` — the workflow suggests them, never runs them): `canvas` (stakeholder docs, suggested after ships that change architecture), `sketch` (visual UI/UX brainstorm room — wireframes to react to; ends by feeding the backlog, parking, or discarding), `init-prompt` (composes the `sdlc-init` prompt before init), and `brainstorm-prompt` (composes a refine seed from a vague itch).

## Artifacts

```
docs/
  project.md        # project memory: north star, stack, constraints, skills, do/don't, learnings, amendments (≤30 lines; read at session start)
  backlog.md        # story specs — the single home of acceptance criteria for active stories
  plans/plan-N.md   # one file per iteration: goal, stories, tasks, statuses, decisions, observation log, archived specs
  changelog.md      # greppable index of completed work, grouped by plan (and by release when one is cut)
  sketches/<topic>/ # committed wireframe HTML (method: .agents/skills/sketch/references/GUIDE.md) — pruned at ship
```

**Ownership** — the backlog owns the spec (description, ≥2 testable acceptance criteria, dependencies, priority, effort guess); the plan owns execution (task lists, story status, branch, design notes, observation log). Read criteria from the backlog, tasks from the plan.

**Statuses** — backlog item: `ready | planned (Plan N) | done (Plan N) | blocked (reason)`. Plan: `IN PROGRESS | COMPLETE | PARTIAL`. Story in plan: `not started | in progress | done | blocked (reason)`.

**Numbering** — backlog IDs (`BL-001`…) are global, never reused, never renumbered. New plan number = highest existing `docs/plans/plan-N.md` + 1.

**Format contract** — greppable state depends on exact shapes: backlog items and plan stories carry `- **Status**: <value>` verbatim (and, when sketches exist, `- **Sketches**: <comma-separated paths>`); plan files open with `# Plan N: <goal>`, `Status: <value>` on the next line, then `Advances: <value>` — a sentence naming the user-visible outcome toward the north star, `enabling — <what it unblocks>`, or `detour — <why worth it>; budget: <timebox or stories>; exit: <criterion>`; plans predating the north star are exempt — never backfill; the backlog has `## Active` and `## Icebox` sections; plan observation entries are dated bullets `- YYYY-MM-DD (BL-XXX): <text>` — or `(plan)` in place of the story ID for cross-story and planning-time decisions — under `## Observations`. `sdlc-init` scaffolds these shapes — never improvise variants.

**Observation log (memory capture)** — each plan file carries `## Observations`: dated one-liners appended the moment a decision is made, an approach rejected, or a surprise changes the plan's course (hidden coupling found, a criterion that proved untestable) — e.g. `- 2026-07-08 (BL-003): rejected localStorage for session state — fails in private browsing`. Decisions, rejections, course-changing surprises only — never narration of routine work. Boundary with the Facts loop: a durable fact about the stack (API contradicts docs, tool quirk) is a Learning; a this-plan choice is an Observation. Subagents can't write it (parallel copies would conflict); they report observations in their final message and the orchestrator appends. Every append is echoed to the user in the same message (see Talking to the User). At ship, the learning pass distills this section into `docs/project.md` (see Self-Improvement); the section then rides into the completed plan as the permanent evidence trail behind every promoted line.

**Completion lifecycle (runs at ship)** — for each story completed in the plan:
1. Copy its full spec from the backlog into the plan file under `## Archived Specs`.
2. Condense the backlog entry to one line: `- BL-XXX Title — done (Plan N)`.
3. Append a changelog entry: `## Plan N — <goal> (YYYY-MM-DD)`, with bullets only for what future work may build on — patterns established, decisions made, where things live. Skip routine fixes.
4. Prune `docs/sketches/`: delete sketch files whose only references are stories shipped in this plan — the code (and `canvas`) is the record now; git history keeps them. Files still referenced by an active item, another plan, or the Icebox survive.
5. Integrity check: every completed story ID appears exactly once in the plan's `## Archived Specs` and once as a backlog one-liner; a mismatch stops the ship until fixed.

The plan file becomes the permanent record; the backlog stays lean; the changelog stays greppable.

**Iterations & releases** — a plan is the iteration unit (1–5 stories, days not weeks). A release is a grouping act: add a `# Release X.Y (YYYY-MM-DD)` heading in the changelog above the plans it contains and tag the merge commit. No release branches.

**Release-time compaction** — detail decays with age so the warm files stay small over many iterations. When cutting a release: (1) condense that release's per-plan changelog entries into one release summary, keeping only load-bearing decisions and patterns; (2) delete the released plans' done one-liners from the backlog — their record lives on in the changelog and the plan archives, still greppable by story ID; (3) re-read the North star with the user — confirm or reword (it changes only with explicit user approval, here or whenever they ask). Result: the backlog holds only active work and post-release done lines; the changelog stays per-plan detailed for the current release and per-release condensed for history.

## Model & Reasoning Routing

Policy for now: **everything runs on `gpt-5.6-sol`**; reasoning effort scales with what the task needs — escalate effort, not model. The session default is `medium` (set in `.codex/config.toml`); subagents pin their own effort in their TOML files. Codex skills cannot pin effort per invocation, so for hard inline work the depth is spent as **longer deliberate reasoning before writing** — interfaces, edge cases, failure modes — not as more prose in the artifact. `xhigh` is reserved for exceptionally hard one-offs; the user escalates the session via `/model` when they want it. (Changing models later = edit this table, `.codex/config.toml`, and the three `.codex/agents/*.toml` files — nothing else references models.)

| Work | Model | Effort | Runs where |
|------|-------|--------|------------|
| Routing, status, artifact bookkeeping | gpt-5.6-sol | session default (medium) — keep it quick | `dev` skill inline |
| Grooming: backlog writing, discovery questions | gpt-5.6-sol | medium | `dev` inline |
| Idea refinement, feature re-evaluation, design tradeoffs | gpt-5.6-sol | medium session + deep pre-think; suggest `/model` → high for a gnarly session | `refine` skill |
| Stakeholder documentation | gpt-5.6-sol | deep pre-think | `canvas` skill (user-invoked only) |
| UI/UX sketching (wireframe brainstorm) | gpt-5.6-sol | deep pre-think | `sketch` skill (user-invoked only; `refine` embeds the same method inline) |
| Prompt composition (init prompt, refine seed) | gpt-5.6-sol | medium | `init-prompt` / `brainstorm-prompt` skills (user-invoked only) |
| Planning: story selection, task breakdown, parallel grouping | gpt-5.6-sol | medium | `dev` inline |
| Architecture decisions (design notes on hard stories) | gpt-5.6-sol | think hard before writing — reason through interfaces, edge cases, failure modes first | `dev` inline |
| Codebase scanning & research | gpt-5.6-sol | medium (pinned) | `explorer` subagent |
| Implementation (TDD) | gpt-5.6-sol | medium (pinned) | `implementer` subagent |
| Review & pre-ship audit | gpt-5.6-sol | **high** (pinned) | `reviewer` subagent |
| Exceptionally hard design one-offs | gpt-5.6-sol | xhigh — user-escalated via `/model`, never self-selected | inline |

## Subagents

Three custom agents in `.codex/agents/` (TOML):

| Agent | Job | Why a subagent |
|-------|-----|----------------|
| `implementer` | One story, strict TDD, in a git worktree the orchestrator assigns | Parallel independent stories; implementation churn stays out of the main context |
| `reviewer` | Fresh-context audit: a plan before build (`plan`), a diff (`code`), or ship-readiness (`ship`) | Fresh eyes — no anchoring to the conversation that produced the work; pinned to high reasoning effort |
| `explorer` | Codebase sweeps during groom/plan/init (read-only sandbox) | Search breadth returns as conclusions, not file dumps |

Dispatch rules:
- **Worktrees are orchestrator-managed** (Codex subagents get no automatic isolation). Before fanning out a parallel group: for each story, `git worktree add .worktrees/BL-XXX -b story/BL-XXX <plan-branch>` (ensure `.worktrees/` is gitignored — `sdlc-init` sets this up). Each dispatch prompt names the story's absolute worktree path and branch; the agent works only inside it. Never run two agents against the same working tree.
- Fan out `implementer` agents only for stories in the same parallel group (no dependencies between them, no shared files). Spawn the whole group at once; Codex runs up to `agents.max_threads` (6) concurrently.
- Subagent prompts are **self-contained**: story ID, inlined acceptance criteria, inlined task list, the story's test plan, the assigned worktree path and the base branch it forked from, names of relevant stack packs, sketch file paths when the story's `Design:` note links one, report format. Subagents see no conversation history — never tell one to "read the docs to figure out the scope."
- Merge worktree branches into the plan branch **serially**, running the full suite after each merge — a failure isolates the offending branch. Clean up only after a branch is fully merged: `git worktree remove .worktrees/BL-XXX`, then `git branch -d story/BL-XXX` (never `rm -rf`, never `-D` — the guard hook blocks both; an unmerged leftover branch goes to the user).
- Don't dispatch for work you can finish directly in a few edits. One available story → implement inline.
- Subagents never spawn subagents (`agents.max_depth` = 1 enforces this) and never edit plan/backlog files — the orchestrator owns all bookkeeping.

## Talking to the User

**Plain language, always.** These workflow files are written dense to save context — that register is for the machinery, never for the user. To the user: short sentences, everyday words, one idea per sentence. Lead with what happened and what happens next. Concrete numbers over adjectives ("3 of 5 stories done", not "good progress"). The workflow's own nouns (story, plan, backlog) are fine; any other term of art gets a plain-words gloss the first time it appears in a session. Match the user's language level — and if they ask for simpler wording, record it as a `docs/project.md` Amendment so every future session honors it without being reminded.

**Decisions go through decision blocks.** Codex has no structured-question tool, so decisions — scope cuts, naming, structural alternatives, approach picks — use this exact plain-text shape and then **stop and wait for the reply**:

```
**Decision — <topic>**
1. <option> (Recommended) — <plain-words tradeoff: what you gain, what you give up>
2. <option> — <tradeoff>
3. <option> — <tradeoff>
Reply with a number, combine them, or say it your own way.
```

2–4 options, your lean first labeled `(Recommended)`, each tradeoff naming the consequence, not the mechanism. Batch related decisions into one message, each in its own block. Do the thinking first: never present options you haven't ranked, never ask what the codebase or your own analysis already answers, and with one clear default don't ask at all — "Assuming X — flag if wrong." Free-form prose questions stay for binary confirmations and the one-line ship retro.

**Narrate the work, not just the asks.** A decision the user only finds by reading a file was made silently. Echo every `## Observations` line to the user in plain words, in the same message as the append — "flag if you disagree" on choices; surprises and facts are just told. Echoes never substitute for decision blocks: anything meeting that bar is asked *before* commitment; echoes are for task-level calls rightly made alone. Every phase boundary ends with a **transition briefing** — 3–5 lines inside that boundary's confirmation message, never an extra one: what finished (numbers), what was decided, what's next, what's still open to change. Relay subagent reports, don't absorb them: per `implementer` story — what changed and where, tests added, surprises; per `reviewer` pass — verdict, finding counts, and the fix-now/backlog split *before* acting on it. The ship learning pass reports its memory edits in one line beside the retro question; side doors (quick change, hotfix, spike) state their decisions and conclusions in the completion message — a spike's conclusion is told, not just filed. Each decision surfaces exactly once: echo, digest, proposal, or question — whichever comes first.

## The Pipeline

**Groom** — turn ideas and code signals into backlog items. A vague or large idea (would produce 5+ stories, no clear actor, no testable success criterion) goes through the `refine` skill first — its reverse-prompting interview returns decisions as backlog items and initiative notes. For concrete asks, groom directly and prefer stating defaults ("Assuming X — flag if wrong") over asking. Priority is distance to the north star, not recency of the ask. While grooming, flag `ready` items untouched for ~3 plans: still relevant → keep; doubtful → move under `## Icebox` or delete (the user decides; a deleted item's sketch files go with it). A backlog nobody prunes stops being a plan and becomes a graveyard.

**Read the ask before grooming it** — the user's words are evidence of a need, not a spec; never groom the literal words. Before writing any item, silently: (1) restate the ask as the problem it solves — actor + friction, not mechanism ("add a Redis cache" is evidence that "the page is slow"; an ask that names a mechanism gets its itch inferred and stated back before the mechanism is groomed); (2) list the 3–5 decisions the ask leaves unstated that change what gets built — scope boundary, failure/empty behavior, who else is affected, what happens to existing data; (3) per gap, default it when one answer is clearly right, ask via decision block only where the answers genuinely diverge. Then open the groom by stating the inferred need back in one sentence — the user correcting that sentence is the cheapest re-scope in the pipeline, and it surfaces what they didn't know to say.

**Plan** — select 1–5 `ready` stories (priority first, pull whole dependency chains — validate the graph is acyclic; a cycle stops planning and goes to the user). Write `docs/plans/plan-N.md`: goal, per-story task lists (one task ≈ one commit), a test plan per story (which layer proves each criterion), each story's likely-touched files (overlap within a parallel group is forbidden — regroup or assign the shared file to one story), dependencies, `## Parallel Groups`, risks, and an empty `## Observations` section. The `Advances:` line (format contract) is written first and **leads the proposal the user confirms** — direction, not just story selection: **direct** (a user-visible outcome toward the north star), **enabling** (groundwork — name what it unblocks), or **detour** (no tie but worth it — declared via a decision block, budget and exit criterion included; detours are legitimate, undeclared ones are drift). Tripwire: grep the previous plan's `Advances:` line (PARTIAL counts; pre-north-star plans don't) — after a detour, report whether it met its exit within budget; before a *third* consecutive non-direct (enabling/detour) plan, stop and re-check direction with the user ("still the fastest path to the north star?") via a decision block or a `refine` Evaluate session. A story that touches shared architecture, new schemas/contracts, or security gets a short `Design:` note in the plan — interfaces, ≥3 edge cases, testing approach, migration + rollback strategy if data changes shape. A story whose layout, navigation, or information hierarchy is a real decision links a wireframe sketch from its `Design:` note (`docs/sketches/`; method in `.agents/skills/sketch/references/GUIDE.md`). Think hard here; design mistakes propagate. Mark selected backlog items `planned (Plan N)`, then dispatch `reviewer` with scope `plan` — a wrong plan costs nothing to fix now and rework after code.

**Build** — per story: set it `in progress` in the plan and commit (`chore(plan): start BL-XXX`), then strict TDD per task. Append `## Observations` lines as decisions, rejections, and course-changing surprises happen (see Observation log) — not retrospectively at story end. Single story → inline; parallel group → confirm with user, create the worktrees, then `implementer` fan-out. All work lands on the plan branch `plan/N-short-goal` (created from main at first build). Story done → set `done` in the plan (backlog stays `planned (Plan N)` until ship).

**Mid-plan discoveries** — new information mid-build routes by what it invalidates, smallest response first; acceptance criteria are the rung-2/3 tiebreaker: a criterion that must be reworded, weakened, or dropped makes it rung 3.
1. **Note** — changes nothing about the plan's course → Observation line, continue.
2. **Story adjustment** — changes how a story is built, criteria untouched → edit its task list, Observation line, continue — no permission needed (the echo keeps it visible). Likely-touched files changed → update the list, re-check group disjointness; overlap → rung 3.
3. **Plan amendment** — invalidates a story or reveals required work → stop; decision block: re-scope the story (edit the backlog criteria too — the backlog owns the spec; Observation records old → new), insert a story (groomed into the backlog first, `planned (Plan N)`), or defer to the backlog. Record a `(plan)` Observation; re-validate dependencies acyclic and group files disjoint. If what the plan delivers changed, re-confirm `Advances:` — a category change quotes the old line in the Observation, and a former detour's exit criterion is still checked at ship. An amendment meeting the `Design:`-note criteria, or the plan's second rung-3, re-dispatches `reviewer` scope `plan`, delta-focused.
4. **Plan abort** — invalidates the plan's goal → propose it; the user decides. Never abort while `implementer` agents run — collect reports, merge surviving finished branches serially with tests; unmerged leftovers go to the user. Then the abandonment flow: unfinished stories → `ready`, finished keep their record, plan `PARTIAL`, the why a final `(plan)` Observation; re-groom.

The plan file changes only through rungs 2–4 — undeclared change is drift; rungs 3–4 are hard stops even in auto mode. A scope-guard trip or subagent failure traced to new information routes here (usually rung 3), not to parking or blind redo. The plan file's first commit on the plan branch is the amendment baseline — commit it before the first story starts.

**Review** — full suite green first; never review a red build. Dispatch `reviewer` with scope `code`, the diff range, and the stories' acceptance criteria. Fix blocking findings (criticals, acceptance-criteria violations) now — each fix test-gated: suite red after a fix → revert that fix and backlog the finding, don't massage it. Everything else becomes backlog items with `Source: review (Plan N)`. Nothing falls through: every finding is either fixed or backlogged.

**Ship** — final gate; the PR needs an explicit user go-ahead:
1. All stories `done`; full suite, linter, type checker, build all green. Run the e2e suite if the project has one. A detour plan also shows its exit criterion met — or the user explicitly rolls it forward, or the gap becomes a backlog item.
2. **Verify by running**: launch the app and exercise each story's changed flow end to end, checking acceptance criteria against real behavior — not test reports. Tests prove units; running proves the feature.
3. Dispatch `reviewer` with scope `ship`. A `CLEAN` verdict is required; findings route back to build.
4. Run the completion lifecycle (archive → condense → changelog → prune sketches), then the ship-time learning pass (see Self-Improvement). Update the project README if user-visible behavior changed; if architecture or capabilities shifted, suggest `canvas` — user-invoked only, never invoke it yourself.
5. Set plan `COMPLETE`, then — after the user confirms — create the PR (`plan/N-… → main`). Merge only after CI is green; a real project with no CI gets a backlog item for it.

**Side doors** (routed by `dev`, no ceremony):
- **Quick change** (≤3 files, well understood): TDD directly, single conventional commit, done. No artifacts — but if it reveals follow-up work, add a backlog item. If it grows past 3 files, stop and plan it.
- **Hotfix** (production emergency): branch `hotfix/<slug>` from main, regression test first (it must fail for the *cause*, not the symptom), minimal fix, full suite, then PR to main (user confirms). After it merges, merge main into any active plan branch and re-run tests.
- **Spike** (timeboxed exploration): when the question is "will this even work?", TDD doesn't apply. Branch `spike/<slug>`, agree the timebox up front, treat the code as disposable — it never merges. The mandatory output is the *conclusion, written down*: a Learnings entry, a backlog item with the decision on its `Context:` line, or "dead end, because X" in the changelog. Build the real thing afterward through the normal path.

## Engineering Rules (non-negotiable)

- **TDD**: no production code without a failing test first. Minimum code to green. Refactor only on green. Commit test + implementation together; conventional commits (`type(scope): description`).
- **Minimum code, literally**: write only what a failing test or an acceptance criterion demands — nothing on spec. No abstraction, interface, config option, helper module, or error hierarchy until a *second concrete caller* exists in this plan; edit the existing function before adding a new layer; handle errors at real external boundaries only, never for states the code can't reach. Sanity check before every commit: if the implementation is much larger than the test that motivated it, or you can't name the criterion each piece serves, cut it — deleted code is a contribution, "we might need it later" is not a reason.
- **Root cause**: name the cause before fixing. Never silence a symptom — swallowed errors, loosened tests, retries around flakiness, lint suppressions — without documenting the cause. Real fix out of scope → documented workaround + backlog item.
- **Scope guard**: 3 failed attempts on one task → mark it `blocked` in the plan with a reason, continue with independent tasks, tell the user.
- **Test gates**: full suite green before review, before ship, after every merge. Never proceed past a red gate.
- **Git safety**: no `reset --hard`, `clean -f`, `checkout .`, force push, `branch -D` (the PreToolUse hook in `.codex/hooks.json` blocks these too). Abandoning an attempt → revert only your own changes, never user edits.
- **Irreversibles**: PR creation, pushes, releases — explicit user confirmation, every time.

## Grounding in Current Docs

Training knowledge about frameworks and libraries goes stale. Ground implementation decisions in what's actually installed, in this order:

1. **Lockfile + installed package are ground truth.** Read the locked version before deciding how to use a library; when unsure of an API, read the installed package itself (type definitions, README in `node_modules` / the venv / vendor dir) — version-exact documentation at zero network cost.
2. **Codebase precedent beats memory.** If the project already uses this API, follow its patterns before consulting anything external.
3. **Fetch when the ground shifts** — adding a dependency, first use of an unfamiliar API surface, a locked major version newer than your knowledge, or behavior contradicting expectations while debugging. Use the doc source recorded on `docs/project.md`'s Docs line (llms.txt, installed skill, MCP); otherwise search the web scoped to the locked major version ("<lib> <major> <topic>"), never unversioned. (Network access needs approval under the default sandbox — ask, don't skip the lookup.)

Don't fetch ritually — stable APIs the codebase already demonstrates need no lookup. When reality contradicts the docs, that's a Learnings entry the moment it's confirmed.

## Stack Packs (generated skills)

For stack-specific know-how this file doesn't carry — framework idioms, test tooling, niche tech — the workflow writes its own project skills: `.agents/skills/stack-<topic>/SKILL.md`, ≤80 lines, synthesized from the locked version's docs (grounding hierarchy above) plus this codebase's actual conventions, header-stamped with the version it was written for.

- Prefer an installed third-party skill when a suitable one exists (it's on the Skills line); generate a pack only when nothing covers the need.
- Generate **lazily** — at the first story that needs the knowledge, never speculatively. Exception: `sdlc-init` offers a `stack-testing` pack up front, since every story touches the test harness.
- Packs load like any skill — only when their area is being worked. Name relevant packs in `implementer` dispatch prompts (subagents don't inherit skill context — the prompt must name the pack's path so the agent reads it).
- Tool-specific learnings go into the pack that owns the topic, not `docs/project.md`. Regenerate a pack when its stamped major version no longer matches the lockfile (`sdlc-init` re-validate checks this).

## Testing Strategy

- Pyramid by default: many unit tests (pure logic, branches, edge cases), some integration tests (your code against real collaborators — where most real bugs live), few e2e tests (user journeys anchored to acceptance criteria; smoke depth, not exhaustive).
- Push every test to the lowest layer where it can still fail for the real reason; don't re-verify lower-layer logic higher up.
- A meaningful test fails for exactly one interesting reason — and RED is the proof: a test you never watched fail proves nothing. Mock only true externals (third-party APIs, clock, randomness); your own DB and modules run real in integration tests. The thing being tested is never the mock.
- Each story's plan entry names which layer proves each acceptance criterion.
- Test infrastructure (e2e harness, fixtures, test DB) is backlog work — planned and built like any story, guided by the `stack-testing` pack.

## Context Discipline

The workflow's efficiency depends on *not* loading everything:

- **Grep before read.** Check statuses with targeted greps; read a whole artifact only when acting on it.
- **The changelog is the index of the past.** Never read old plan files; when a done story's archived spec is needed, grep `docs/plans/` for its ID and read only that section.
- **Sweeps go to subagents.** Codebase scans during groom/plan/init run in `explorer` agents; only conclusions enter the main context.
- **Heavy work goes to subagents.** Implementation churn and review passes live in agent contexts; the orchestrator sees reports, not transcripts.
- **Don't re-read** files already in context and unchanged.
- **Write it down.** Any state a future session needs goes into an artifact the moment it's known — never "I'll remember this."

## Self-Improvement

**This file is fixed — never edit it after install** (upgrading the workflow = replacing it wholesale). Everything the project teaches the workflow lands in `docs/project.md`, which is read at every session start and therefore always available. Three loops, three cadences:

- **Facts — immediately.** A non-obvious toolchain/library/environment fact that cost debugging time to discover → append one line to Learnings in `docs/project.md` the moment it's confirmed, stamped with its source — `(Plan N)`, or the date for un-planned work. No permission needed; it's factual. Parallel `implementer` agents can't write it (worktree copies would conflict) — they report learnings in their final message and the orchestrator merges them.
- **Patterns — at ship.** The ship-time learning pass: reflect over the plan's `## Observations` — promote the durable ones into Learnings or Do/Don't (carrying their `(Plan N)` stamp), leave the rest in the plan archive; re-derive Stack/Structure from the plan's diff (new dependencies, directories, patterns — factual, just update); promote Learnings entries that proved strategic into Do/Don't; delete entries this plan made obsolete; challenge stale entries — any Learnings/Do/Don't line whose stamp is stale (~3 plans back, or the equivalent in time for date stamps) is confirmed (re-stamp), compressed, or deleted, never silently kept; ask the user one retro question — "anything about how this plan went that should change how we work?"
- **Rules — on repetition, with approval.** When the same friction appears in two plans (a recurring reviewer finding class, a gate that keeps tripping, an instruction that proved over- or under-specified — grep past plans' `## Observations` for the evidence), propose a one-line entry in `docs/project.md → ## Amendments`. Amendments extend or override this file's rules for this project only. User approves → commit `chore(sdlc): amend workflow — <what>`.

Anti-bloat is part of the loop: `docs/project.md` stays ≤30 lines. Past budget, any addition must replace or compress something — a memory that only accretes isn't improving.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
