---
name: sdlc-init
description: "Bootstrap or re-validate the SDLC workflow: greenfield project setup, onboarding an existing codebase, or checking a governed project for artifact drift. User-invoked only."
---

# sdlc-init — Bootstrap / Re-validate

## Detect mode

| Signals | Mode |
|---------|------|
| No source code (empty repo, maybe a README) | **Greenfield** |
| Source code present, no `docs/backlog.md` | **Onboard** |
| `docs/backlog.md` exists | **Re-validate** |

## Greenfield / Onboard

1. **Scaffold** what's missing, never overwrite: `docs/backlog.md` (sections `## Active` and `## Icebox`, the status legend, and a comment describing the item shape: heading `### BL-XXX — Title`, then bold-marker field lines for Status / Priority · Effort / Dependencies / Context (optional) / Sketches (optional) / Acceptance criteria as a numbered list). **Write the field names inside that example comment unbolded** — e.g. `Status: ready` — so state-reading greps for `**Status**` never match the example, only real items. Also scaffold `docs/plans/`, `docs/changelog.md`, and `docs/project.md` from the template below. Add `.worktrees/` to `.gitignore` (parallel builds put orchestrator-managed git worktrees there). Real items follow AGENTS.md's format contract exactly.
2. **Detect** stack — with locked versions from the lockfile, not manifest ranges — test runner and the exact test command, source layout, dominant conventions (sample 3–5 files; use an `explorer` agent for large codebases). Run the test command once to verify it actually works. Flag any dependency 2+ major versions behind as a backlog candidate.
2b. **Locate doc sources** for the 2–4 frameworks that dominate the stack: an installed skill, a connected docs MCP server (`.codex/config.toml` `[mcp_servers]`), or the framework's `llms.txt` (check `<docs-url>/llms.txt`). Record what you find on the **Docs** line of `docs/project.md`, version-matched to the locked major. Found nothing for a framework? Record `<name>: none — use installed package + version-scoped search` so future sessions don't re-hunt.
2c. **Offer a `stack-testing` pack** (`.agents/skills/stack-testing/SKILL.md`, ≤80 lines, version-stamped): how to run one test / a scoped set / the full suite with coverage, where tests and fixtures live, the project's test-layer conventions (unit vs integration vs e2e and what belongs where), known gotchas. Synthesize from the locked versions' docs + existing test files. If no test framework exists yet, record that testing setup is the first backlog story instead. Other stack packs are generated lazily at first need — don't create them now.
3. **Record** findings in `docs/project.md`. Onboard: draft a one-sentence north star from README/code signals — or, if the invocation prompt already states one, confirm that sentence instead of re-deriving — and present it for correction alongside the questions below — it's the user's sentence, not yours; push back once if it names no user or no observable outcome (the backlog's own testability standard). Ask the user two things in one batched decision-block message (AGENTS.md → Talking to the User) — constraints ("anything I must never touch or break?", with common options like "keep APIs backward compatible" / "no new runtime dependencies" plus free-text) and current focus (offer your best guesses from the codebase as options). Scan installed skill *descriptions only* (`~/.agents/skills/*/SKILL.md` frontmatter) and record stack-relevant ones on the **Skills** line. Keep the file within its 30-line budget.
4. **Seed the backlog**: greenfield → short interview about what they're building; distill it into the one-sentence north star (if the invocation prompt stated a goal, confirm that sentence rather than re-deriving; same testability pushback as step 3), record it in `docs/project.md`, then turn goals into first stories; existing → `explorer`-agent scan for TODOs, skipped tests, missing coverage, obvious tech debt, plus "any features or fixes you already know you want?"
5. **Autonomy setup**: verify `jq` is installed — the destructive-ops hook (`.codex/hooks/block-destructive.sh`) requires it and fails closed (blocks all shell commands) without it; offer to install if missing. Remind the user that project hooks only run in a **trusted** project and must be approved once via `/hooks`. Then write a starter allowlist to `.codex/rules/project.rules` — Starlark `prefix_rule(pattern=[...], decision="allow")` entries for the verified test command plus linter, type-checker, and build (e.g. `prefix_rule(pattern=["npm", "test"], decision="allow")`) — and show the user exactly what was added and why (without it, parallel `implementer` dispatch triggers an approval prompt per subagent; adjust anytime with `/permissions` or by editing the rules file). If no git repo, offer `git init`. If the repo is on GitHub, offer branch protection for `main` so every change arrives via PR.
6. **Report**: mode, stack detected, test command verified or not, N backlog items created, then "invoke `dev` (or just describe what you want) to start."

### `docs/project.md` template

```markdown
# Project Memory
<!-- ≤30 lines total. Read at the start of every session (AGENTS.md → Project Memory). Maintained by sdlc-init and the ship-time learning pass. -->
- **North star**: <!-- one sentence, user-owned: who it's for + what outcome means success. Every plan's Advances line ties to it. Reworded only with explicit user approval — the learning pass never compresses or edits it -->
- **Stack**:
- **Test command**:
- **Structure**:
- **Constraints**: <!-- hard rules from the user — never violate -->
- **Skills**: <!-- installed third-party skills relevant to this stack -->
- **Docs**: <!-- per-framework doc sources, version-matched: llms.txt URL, skill name, or MCP — recorded by sdlc-init -->
- **Do / Don't**: <!-- strategic lessons: approaches that worked, dead ends not to retry — promoted from Learnings/Observations at ship, each stamped with its source plan -->
- **Learnings**: <!-- one line each: non-obvious toolchain/library facts that cost debugging time to discover, stamped (Plan N) or dated -->

## Amendments
<!-- project-local workflow rule changes, one line each, user-approved; extend or override AGENTS.md -->
```

## Re-validate

Check and report; fix only with user approval:

- Artifacts exist and parse; statuses consistent between backlog and the active plan
- `docs/project.md` has a North star line (projects initialized before this feature won't — draft one with the user); the active plan's `Advances:` line present and still honest. Completed plans predating the north star are exempt — never backfill
- `docs/project.md` still matches reality — test command runs, stack/structure unchanged, listed Skills still installed, Learnings still true (spot-check any that name versions or flags)
- `docs/project.md` within its 30-line budget; AGENTS.md unmodified (it's fixed — any project-specific content found in it should be moved to `docs/project.md`)
- Stack packs (`.agents/skills/stack-*/SKILL.md`) whose stamped major version no longer matches the lockfile → flag for regeneration
- Provenance: stamps are what make aging possible — add missing `(Plan N)`/date stamps to Learnings/Do-Don't lines when touching them; challenge any line whose stamp is stale (~3 plans or equivalent time) if the ship-time pass missed it
- Orphans: stories `planned (Plan N)` where plan N is `COMPLETE`; plans `IN PROGRESS` with every story `done`; backlog items marked `done` with no archived spec in any plan; `- **Sketches**:` lines pointing at missing files, and `docs/sketches/` files no artifact references
- Report each drift with the exact fix; commit approved syncs as `chore(sdlc): re-validate`

## Rules

- Keep init under a couple of minutes: grep for signals, sample files — don't deep-read the codebase.
- Never overwrite existing files; never install packages without asking.
- Respect existing conventions (test layout, naming) — record them, don't fight them.
