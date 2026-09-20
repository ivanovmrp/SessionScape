# User Guide — Slim SDLC Workflow for Codex

A lightweight process for building software with Codex. It plans work in small batches, writes tests before code, reviews everything with fresh eyes, and keeps a written record of every decision — while you steer with two skills.

```
idea ──► groom ──► plan ──► build ──► review ──► ship (PR)
         (backlog)  (plan-N)  (TDD)    (fresh eyes)
```

You run `sdlc-init` once, and `dev` for everything after that. That's the whole interface. (Skills are invoked from the `/skills` picker or by mentioning them — `$dev` — and because `dev`'s description covers any development request, plainly typing what you want usually routes there by itself.)

---

## 1. Setup

Copy the workflow into your project and start Codex:

```bash
cp -r <workflow-dir>/.agents  my-project/
cp -r <workflow-dir>/.codex   my-project/
cp <workflow-dir>/AGENTS.md   my-project/
cd my-project && codex
```

Then two one-time Codex steps:

1. **Trust the project** when Codex asks — project-level config, hooks, and rules only load in a trusted project.
2. **Approve the safety hook** via `/hooks` — the destructive-command guard is a project hook and needs your one-time OK before it runs.

**Already have an `AGENTS.md` or `.codex/` folder in your project? Don't overwrite them.** Codex loads at most one `AGENTS.md` per directory, so merge by hand: usually the workflow file becomes the root `AGENTS.md` and your project-specific notes move into `docs/project.md` (that's where they belong anyway). Merge `.codex/hooks.json` entries into yours instead of replacing the file.

Then invoke:

```
$sdlc-init
```

What happens next depends on your project:

- **Empty folder** → Codex asks what you want to build, distills your answer into a one-sentence **north star** (who it's for and what outcome means success — you correct the wording, it's your sentence), sets up the `docs/` files, and writes your first backlog items.
- **Existing codebase** → Codex detects your stack and test command (and verifies the test command actually runs), scans the code for TODOs and tech debt, drafts a north star from the README and code for you to correct, and asks two questions: what must it never break, and what matters most right now.
- **Already set up** → Codex checks everything is still consistent (files, statuses, recorded facts) and reports any drift.

It also sets up some conveniences: it writes a command allowlist (`.codex/rules/project.rules`) for your test/lint/build commands (so parallel work doesn't stop to ask approval for every test run — it shows you exactly what it added, and `/permissions` adjusts things anytime), and it offers to write a `stack-testing` cheat-sheet skill for itself about your test tooling. If the folder isn't a git repo yet it offers `git init`, and for GitHub repos it can set up branch protection so every change to main arrives through a PR.

**Requirement**: `git`, and `jq` (used by the safety hook that blocks destructive commands). If `jq` is missing the hook plays it safe and blocks *all* shell commands — `sdlc-init` checks for it so you find out immediately, not mid-work.

**Upgrading later**: replace `AGENTS.md`, `.agents/`, and `.codex/` with the newer template wholesale. Your project's memory (`docs/project.md`) and all other `docs/` files survive untouched — that's why `AGENTS.md` is never edited in place.

---

## 2. The commands

| You invoke | What it does |
|----------|--------------|
| `$sdlc-init` | One-time setup, or a health check any time later |
| `$dev` | Everything else — reads the project state and does the next right thing |
| `$dev <anything>` | Same, with your words as input: a feature idea, a bug, a question, "status", "auto". Plain requests without the mention usually route here too. |
| `$refine` | Optional direct door to thinking-partner mode (usually `dev` routes you there) |
| `$canvas` | Generates/updates a stakeholder-friendly HTML overview of the project. Only you can trigger it. |
| `$sketch` | A side room to brainstorm UI/UX visually — wireframe pages you open in a browser and react to. Ends with your choice: feed the result into the backlog, park it for later, or throw it away. Only you can trigger it. |
| `$init-prompt` | Interviews you and checks the folder, then hands you a ready-to-paste `sdlc-init` prompt. Only you can trigger it. |
| `$brainstorm-prompt` | Turns a vague itch into a strong seed for a thinking session, then runs `refine` with it if you say go. Only you can trigger it. |


You never need to remember phase names. `dev` figures out where you are and proposes the next step; you confirm or redirect.

---

## 3. What gets created

```
docs/
  project.md        ← the project's memory: the north star, stack, test command, your rules, lessons learned
  backlog.md        ← what could be built: stories with acceptance criteria (BL-001, BL-002, …)
  plans/plan-1.md   ← one file per work batch: tasks, statuses, decisions, observations; a permanent record when done
  changelog.md      ← short index of everything shipped (entries appended in order, grouped by release)
  sketches/         ← (only when sketching) wireframe pages; cleaned up when their stories ship
  canvas.html       ← (only if you run canvas) the stakeholder overview page
```

Everything the workflow knows lives in these files, not in the conversation. You can close Codex at any moment; the next session picks up exactly where you left off.

The backlog has two sections: **Active** (stories in play) and the **Icebox** (ideas set aside on purpose — including anything you "park" from a sketch session). During grooming, Codex flags stories that have sat untouched for a few plans and asks you: keep, icebox, or delete. A backlog nobody prunes stops being a plan and becomes a graveyard.

---

## 4. Everyday scenarios

### "I have a feature idea"

```
You:    $dev users should be able to export their data
Codex:  (checks the backlog, greps the code, thinks first)
        Before I write this up, two choices:
        **Decision — export format**
        1. CSV only (Recommended) — covers the stated need, smallest build
        2. CSV + JSON — more flexible, more to test
        3. User picks per export — most work, needs UI
        **Decision — scope**
        1. Own data only (Recommended)  2. Admins can export any user
You:    (reply with numbers, or type your own answer)
Codex:  Added BL-014 "Export own data as CSV" to the backlog with 3 acceptance
        criteria. Ready to plan it?
```

Codex leads with recommendations; your job is to correct or confirm, not to write a spec. If the idea is big or fuzzy ("rethink onboarding"), `dev` first routes it through a short interview (thought-partner mode) and may produce several related stories under one initiative heading.

### "Just continue"

```
You:    $dev
Codex:  Plan 3 "Data export": 2 of 4 stories done, tests green.
        Next: BL-016 (export history page). Start building it?
```

### "What's the status?"

```
You:    $dev status
Codex:  Plan 3 "Data export": 2 of 4 stories done · suite: 118 passing ·
        BL-016 ready to build, BL-017 waits on BL-016.
        Nothing needs your input right now.
```

Status never changes any files.

### Starting a plan — where direction gets confirmed

```
You:    $dev plan the next batch
Codex:  Proposal for Plan 4 — direction first: this plan advances the north star
        directly — users will be able to export and schedule reports.
        Stories: BL-014 (export CSV), BL-016 (export history page, needs BL-014),
        BL-018 (weekly email) — BL-014 and BL-018 can build in parallel.
        Confirm and I'll write it up? A fresh-eyes review checks the plan before
        any code is written.
```

Every plan opens by saying how it moves the project toward its north star — directly, as groundwork, or as a declared side-quest. Work with no tie to the goal is still fine, but it gets boxed in the open:

```
You:    $dev I'd like to split our CSV parser into its own open-source package
Codex:  That doesn't move the north star — it's a side-quest, which is fine
        if we box it:
        **Decision — budget for the detour**
        1. One plan; exit when the package is published and our app depends
           on it (Recommended)
        2. Two stories; exit when the parser sits behind its own interface
        3. Put it in the backlog for later
```

And if two batches in a row are groundwork or detours, Codex stops before proposing a third and asks whether this is still the fastest path to the goal — deep dives stay deliberate, never drift.

### Building — one story or several in parallel

For a single story, Codex works in the open: failing test first, then the code to pass it, then the full suite, then a commit — task by task.

When the plan contains independent stories, Codex offers to build them at the same time:

```
Codex:  BL-014 and BL-015 don't touch the same files. Build both in parallel?
        (I create an isolated git worktree for each under .worktrees/, spawn
        one implementer agent per story, and merge them one at a time with
        tests between merges.)
You:    yes
Codex:  ... BL-014 done (worktree merged, 12 new tests). Merging BL-015 ... done.
        Suite green after both merges. Next: review.
```

Parallel work always asks first — even in auto mode.

### "Run without asking me at every step"

```
You:    $dev auto
```

Auto mode chains the phases with one-line progress reports instead of pausing at each transition. Decision narration and phase briefings still arrive — auto removes pauses, not information. It still stops for the things that matter: failures, blocked work, ambiguity, parallel-build confirmation, and it will **never** open a pull request without your explicit yes.

### Changed your mind mid-plan?

```
You:    $dev actually, drop the export work — priorities changed
Codex:  Abandoning Plan 3: BL-016 and BL-017 return to the backlog as ready,
        the two finished stories keep their record, and the plan is marked
        PARTIAL. Nothing is lost. What's next?
```

You can redirect at any point — plans serve you, not the other way around. The reverse also works: if a story turns out much bigger than estimated, Codex proposes splitting it — the core stays in the current plan, the rest becomes a new backlog item.

### When the work changes the plan

Plans can also change because of what the *work* uncovers — legally and in the open:

```
Codex:  While building BL-016 I found the export queue is shared with
        notifications — BL-017 assumes it isn't. This changes what the plan
        delivers, so it's your call:
        **Decision — the shared queue**
        1. Rescope BL-017 to reuse the shared queue (Recommended)
        2. Add a story to split the queues first
        3. Defer BL-017
You:    1
Codex:  Rescoped BL-017 (its acceptance criteria updated in the backlog),
        change recorded in the plan. Continuing with BL-016.
```

Small discoveries — a better approach, a reordered task — are just told to you and logged as they happen. Anything that changes what a plan *delivers* becomes a decision you make, even in auto mode. And every plan change leaves a record: the plan's history shows what was originally approved, what changed, and why — the pre-ship review checks that trail.

### Review and ship

When all stories are built, Codex dispatches a fresh-eyes reviewer — a separate agent that has no memory of writing the code, so it can't rationalize its own mistakes. Blocking findings get fixed immediately (each fix gated by the test suite); minor ones become backlog items so nothing is lost.

Then the ship gate: full suite, linter, build — and Codex **runs the app** and clicks/exercises each new feature, because passing tests alone don't prove a feature works. If the plan was a declared detour, its exit condition is checked here too: met, explicitly rolled forward by you, or turned into a backlog item. A second fresh-eyes pass checks ship-readiness. Only after all that, and your explicit go-ahead, does it open the PR.

### Quick fix (no ceremony)

```
You:    $dev fix the typo in the welcome email subject
Codex:  Small change — skipping the planning ceremony. Wrote a failing test,
        fixed the subject line, suite green, committed. Done.
```

Anything touching 1–3 well-understood files takes this path. If it turns out bigger mid-flight, Codex stops and suggests planning it properly.

### Production emergency

```
You:    $dev users can't log in when their email has a + sign — production is down
Codex:  Hotfix path. Branching hotfix/email-plus-login from main.
        Reproducing... root cause: the email validator rejects "+".
        Regression test written (fails), minimal fix applied, suite green.
        Ready to open the PR to main?
```

Minimal fix only, always with a regression test. After it merges, Codex brings the fix into any in-progress plan branch too.

### "Will this even work?" — spikes

```
You:    $dev I want to try whether SQLite full-text search is good enough before we commit
Codex:  That's a spike. Timebox? I'd suggest one session.
        (creates spike/fts-experiment, hacks freely — no TDD, code is throwaway)
        Conclusion: FTS5 handles our queries at <10ms up to 100k rows, but ranking
        needs a custom function. Logged to project memory. The spike branch will
        not be merged. Want a real story for the production version?
```

The code is disposable; the *written conclusion* is the deliverable.

### Re-evaluating something you built earlier

```
You:    $dev is the notifications feature from a while back still the right design?
Codex:  (thinking-partner mode: finds it in the changelog, reads its archived
        spec, checks the code as it is today)
        Three observations: the digest option is unused, the queue has grown a
        second consumer it wasn't designed for, and two TODOs reference it.
        I'd either simplify (drop digest) or leave as is — leaning simplify
        because... [decision block]
```

Outcomes land somewhere permanent: new backlog items, a "keep as is" note in the changelog, or a lesson in project memory — so the same debate doesn't restart next month.

### "I want to see it before we build it" — sketching UI

```
You:    $sketch what if the dashboard used a sidebar instead of tabs?
Codex:  (reads the current dashboard code first, then draws)
        Two wireframes in docs/sketches/dashboard-nav/ — open them in your browser:
        option-a.html (left sidebar, filters at top) · option-b.html (tabs kept,
        quick-actions rail added). Two questions: does A's sidebar fit how you
        jump between projects? And what should the empty state show?
You:    sidebar — but move the filters into it
Codex:  Updated option-a.html. Settled on A? Then: feed it into the backlog,
        park it for later, or discard?
You:    feed it in
Codex:  Added BL-021 "Sidebar navigation" (sketch linked). Deleted option B.
```

Sketches are deliberately plain — gray boxes and labels, so you react to the layout, not the colors. Once a direction is chosen you can ask to see that one dressed up. If a UI idea comes up inside a thinking session (`dev` / `refine`), Codex sketches the same way without you needing `sketch`. Wireframes of shipped stories are cleaned up at ship — the app itself (and `canvas`) documents the real UI from then on.

### Cutting a release

```
You:    $dev cut release 1.2
Codex:  Grouping plans 5–7 under "Release 1.2" in the changelog, condensing
        their entries to the decisions that still matter, pruning shipped
        one-liners from the backlog, tagging the merge commit. Done.
```

Releases are bookkeeping plus a git tag — no release branches.

### Documentation for other people

```
You:    $canvas
Codex:  (first run) Who is this for — new engineers, product stakeholders,
        API consumers? ... generates docs/canvas.html
```

One self-contained HTML page — open it from disk, no server, works offline: what the project is, what it can do, how it's built, where it stands, every claim linked to the file that proves it. On later runs it updates only the sections that changed since the last documented commit. This is the only skill Codex will never run on its own — after a plan that changed the architecture it will *suggest* invoking it, and that's all.

---

## 5. How it learns your project

`docs/project.md` is the project's memory, read at the start of every session (kept under 30 lines, pruned automatically — with every promotion or deletion reported to you in one line at ship):

- **The north star** is the one-sentence goal captured at setup. Every plan states up front how it moves toward it — directly (something a user will see), as groundwork ("enabling"), or as a declared side-quest ("detour") with a budget and an exit condition you agree to. When two plans in a row aren't direct progress, Codex stops and asks whether this is still the fastest path — so deep dives into infrastructure or tooling stay deliberate, never drift. The sentence itself changes only when you approve it.
- **Observations** are captured mid-plan in the plan file: every decision made, approach rejected, or surprise hit gets a dated one-liner ("rejected localStorage — fails in private browsing"). The debate you had in March doesn't restart in June, because the *why* was written down when it happened.
- **Facts** land the moment they're discovered ("vitest needs --pool=forks here").
- **Lessons** get promoted at each ship into Do / Don't lines. Every memory line cites the plan (or date) that taught it, so you can always trace a rule back to its evidence — and lines whose evidence is ~3 plans old get challenged at ship: confirm, compress, or delete. The memory forgets on purpose, not by accident.
- **Amendments** are your standing rule changes. Say once — *"always explain things in simple English"* or *"never touch the payments module"* — approve the one-line amendment, and every future session obeys it without being reminded.

At each ship, Codex asks one retro question ("anything about how this plan went that should change how we work?"). That's your moment to tune the process itself.

Alongside the memory file, Codex writes itself small cheat-sheet skills as it goes — `.agents/skills/stack-<topic>/` — the first time it works on your test tooling, a niche library, or a framework corner it needs a runbook for. They show up in your diffs like any other file; they're safe to commit, and each is stamped with the dependency version it was written for so a later health check (`sdlc-init`) flags it for a refresh when that dependency jumps a major version.

---

## 6. Safety and control

- **Always asks first**: opening PRs, pushing, releases, parallel dispatch, anything irreversible. Auto mode does not bypass these.
- **You hear decisions as they're made**: every choice, rejected approach, or surprise is told to you in plain words as it's logged — for parallel work, when each story reports back — with "flag if you disagree" on the choices. Every phase ends with a short briefing: what finished, what was decided, what's next, what's still open to change. Parallel builds and review findings are relayed story by story and finding by finding, never silently absorbed.
- **A guard hook blocks destructive commands** (`rm -rf` on absolute paths, `git reset --hard`, force-push, database drops, …) no matter what — it's a separate script, not a promise in a prompt. (One-time: trust the project and approve the hook via `/hooks`.)
- **Codex's own sandbox backs it up**: by default commands run workspace-scoped (`workspace-write`), and anything outside — network, out-of-tree writes — asks first.
- **Tests gate every step**: before review, before ship, after every merge. A red suite stops the line.
- **Give or take autonomy** anytime with `/permissions`, or by editing `.codex/rules/project.rules` — the init-generated allowlist is just a starting point.
- **If a task fails three times**, Codex stops, marks it blocked with the reason, and tells you — no silent thrashing.

---

## 7. Cheat sheet

| Situation | Invoke |
|-----------|------|
| Help me write the init prompt first | `$init-prompt` |
| Brand-new or newly-adopted project | `$sdlc-init` |
| Help me shape a fuzzy idea into a good ask | `$brainstorm-prompt` |
| Anything development-related | `$dev` + your words (or just type it) |
| Continue where we left off | `$dev` |
| Just looking, change nothing | `$dev status` |
| Small fix, no ceremony | `$dev <describe the fix>` |
| Production is broken | `$dev <describe the bug> — production is down` |
| Fewer pauses, same gates | `$dev auto` |
| Priorities changed, drop the plan | `$dev drop the current plan` |
| Think an idea through with me | `$dev <the idea>` (or `$refine`) |
| Play with UI/UX ideas visually | `$sketch <the itch>` |
| Is that old feature still right? | `$dev revisit <feature>` |
| Try before committing | `$dev spike <question>` |
| Group shipped work + tag | `$dev cut release <X.Y>` |
| Docs page for other people | `$canvas` |
| Health check after time away | `$sdlc-init` |
