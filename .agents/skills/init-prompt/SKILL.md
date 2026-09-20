---
name: init-prompt
description: "Compose a ready-to-paste sdlc-init prompt through a short guided interview plus automated preparation checks. Use BEFORE running sdlc-init on a greenfield or existing project. User-invoked only."
---

# init-prompt — Compose Your sdlc-init Prompt

You interview the user and check the project so their `sdlc-init` prompt front-loads only what init cannot detect. Read `references/GUIDE.md` first — it defines the categories, both skeletons, and what does NOT belong in an init prompt. Anything the user already said when invoking this skill counts as answered; don't re-ask it.

## Step 1 — Detect the situation

Look at the folder: source code present? `docs/backlog.md`? Existing `AGENTS.md` or `.agents/`/`.codex/` content beyond this workflow?

- No source → **greenfield** track.
- Source, no backlog → **adoption** track.
- Backlog exists → the project is already governed; suggest invoking `sdlc-init` directly (re-validate mode) and stop.

## Step 2 — Automated prep checks (report, don't fix)

Run what the guide's preparation lists make checkable, and show a pass/fail checklist:

- Git: repo exists? working tree clean? (adoption: dirty tree = warn, init's diff should be reviewable alone)
- `jq` installed (the guard hook fails closed without it)
- Project trusted in Codex and hooks approved? (project `.codex/` layers — config, hooks, rules — only load in a trusted project; the guard hook needs a one-time `/hooks` approval)
- Adoption only: find the test command and **run it** — green, red (which failures), or none configured
- Collisions: pre-existing `AGENTS.md` (→ recommend appending the workflow file's content, or keeping the workflow as the root AGENTS.md and moving project-specific notes to `docs/project.md`) or existing `.codex/hooks.json` (→ merge the hook entries, don't overwrite)

## Step 3 — Interview (the human-only categories)

One or two decision-block rounds (AGENTS.md → Talking to the User), options seeded from what you saw in the folder:

- **Greenfield**: intent — push until it can be stated as a one-sentence north star (who it's for + what outcome means success); the composed prompt carries it so init doesn't re-ask — + posture (learning / shipping), decisions already made (stack leanings — offer what the ecosystem suggests), access facts (services, endpoints, env-var *names*), hard constraints, first focus, doc URLs for anything niche or newer than training data.
- **Adoption**: the north star if the user can state it (otherwise init drafts one from the code), never-touch zones, corrections ("what would a fresh scanner misjudge here?"), where it actually hurts (free-text — greps find annotations, not pain), initial groom scope, team gates (CI, PR rules).

Free-text is fine for narrative answers; don't force choices where there's nothing to choose.

## Step 4 — Compose and hand off

Produce the prompt from the guide's skeleton for the detected track, 25–45 lines, in one copy-paste code block whose first line invokes the init skill (`$sdlc-init` — or "use the sdlc-init skill:"). After it:

- List any prep gaps that must be fixed **before** running it (red suite, missing jq, untrusted project, dirty tree).
- Remind: facts stated become project memory — flag anything you guessed as "confirm with me" inside the prompt rather than asserting it.
- Do NOT run `sdlc-init` yourself — it is user-invoked by design. End with: "paste this when ready."
