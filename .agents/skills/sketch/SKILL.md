---
name: sketch
description: "Visual UI/UX brainstorm room — wireframe HTML sketches to react to, with or without a backlog item behind them. Explore layouts side by side, then feed the result into the workflow, park it, or discard it. User-invoked only; refine reuses this skill's method for inline sketching."
---

# sketch — UI/UX Brainstorm Room

A side room for visual thinking, independent of pipeline state — no plan or backlog item needs to exist. Users react to a layout in seconds and to bullet points in minutes; the sketch *is* the question. Read `references/GUIDE.md` first — it owns the method (file conventions, fidelity, annotation, the react protocol); this file owns the session. High-depth work: think hard about the decision at stake before drawing.

## Session loop

1. **Pre-think silently.** Read `docs/project.md`; grep the backlog and changelog for the area; if the surface already exists, read its code (`explorer` agent for wide sweeps) — sketch what could be, grounded in what is. Restate the itch as the decision at stake ("sidebar vs tabs" → "how many places must a user look to find anything?").
2. **Sketch.** 1–3 wireframe HTML files per the guide, saved to `docs/sketches/<topic>/`. Options must differ in structure — two layouts that differ only in styling are one option.
3. **React.** Link the file paths so the user opens them in a browser. Ask 2–3 questions tied to what's on screen (decision blocks when choice-shaped, free-text for impressions). Revise or add options from the answers. Repeat until a direction settles, the user stops, or a round adds nothing new.
4. **Exit — always explicit.** One decision block: feed / park / discard.

## Exits

- **Feed**: groom the settled direction into backlog items at the normal spec bar (≥2 testable criteria, priority, dependencies), each carrying a `- **Sketches**:` line pointing at the kept files; 5+ related stories → initiative header. If scope questions remain beyond the visuals, offer to hand the summary + kept sketches to `refine` (invoke only on an explicit yes). Delete the losing option files.
- **Park**: keep the kept files; add an Icebox backlog item with the one-line direction and a `- **Sketches**:` line. Nothing else — parked means parked.
- **Discard**: delete the topic directory. If a real direction was rejected (not just "nothing here"), write one line first — changelog (`Sketch session <topic>: rejected X because Y`) or a `docs/project.md` Do/Don't entry if it's a durable product lesson. A session that produced nothing needs no record.

Whatever the exit: commit the kept sketch files and the exit's bookkeeping together (`docs(sketch): <topic> — <exit>`) — uncommitted sketches are invisible to worktree implementers and lost on deletion.

## Fidelity

Wireframe by default, always (the guide defines it). Exception, this skill only: after a direction is chosen, the user may explicitly ask to dress up that ONE option — real colors, spacing, type — as a vision check before feeding it in. Name the file `<option>-polished.html`; it proves the direction, then dies at build like any sketch. Never polish to break a tie — polish anchors reactions on paint, not structure.

## Rules

- No production code, ever. Nothing outside `docs/sketches/` changes except the exit's bookkeeping (backlog / changelog / project.md lines).
- Every kept sketch is referenced from a backlog artifact; every rejected direction with a reason gets its line. Unwritten decisions didn't happen.
- No backlog yet (project not initialized)? Sketching works fine — but the feed and park exits need `sdlc-init` first; say so at the start of the session, not after.
