# Sketch Method

Shared by `sketch` (full sessions) and `refine` (inline sketch step). This file owns the *how*; the caller owns the why, the rounds, and the exits.

## Files

- Home: `docs/sketches/<topic>/` — kebab-case topic, or `BL-XXX` when scoped to one story. Create the directory lazily, only when a sketch is actually written.
- Competing layouts: `option-a.html`, `option-b.html`, … with a one-line comment at the top of each naming its core idea. A revision replaces the file — git is the history.
- Sketches are tracked files: commit them together with the bookkeeping that references them (`docs(sketch): <topic> — <what>`). An uncommitted sketch is invisible to worktree implementers and unrecoverable after deletion.
- One screen or one flow per file. A flow = numbered frames stacked vertically in one file, arrows between frames.

## HTML contract

- Single file, opens from disk (`file://`), fully self-contained: inline CSS, no external scripts/fonts/images, no build step.
- JS only if a state toggle genuinely helps; must degrade to all-states-visible without it.
- Key states shown, not described: default, plus whichever of empty / loading / error the decision touches, as stacked labeled sections.
- Realistic content, never lorem: plausible names, numbers, dates from the project's domain — reactions to real-looking data are real reactions.

## Wireframe fidelity (the default — and the only mode outside /sketch)

- Grayscale boxes, borders, text labels. System font stack.
- Semantic color only: red for error states, green for success, one neutral accent marking the primary action — nothing decorative.
- No brand colors, images, or icons beyond unicode glyphs; no polish. Anything prettier gets thrown away at build and anchors the reaction on paint instead of structure.

## Annotate

- Mark in the sketch itself, as small labels or arrows: the entry point (where the user lands), the primary action per screen, and state transitions (what click leads where).
- Open questions go on screen as visible sticky-note labels next to the element they ask about — not in chat where they detach from the pixels.

## Show and react

- Present the file paths (clickable) plus one line per option naming its core idea.
- Ask 2–3 questions tied to on-screen specifics ("does A's left rail fit how you move between projects better than B's top tabs?", "what's missing from this empty state?") — never "thoughts?".
- After each revision round, say what changed and what the change assumes.

## Referencing

- From a backlog item or initiative header: `- **Sketches**: docs/sketches/<topic>/option-a.html` — bold marker, exact shape (it's part of the format contract); comma-separate multiple files.
- From a plan story's `Design:` note: same path — and that story's `implementer` dispatch prompt names the file (dispatch prompts are self-contained; builders don't hunt for the layout they're implementing).

## Lifecycle

Sketches are pre-build artifacts. The ship-time completion lifecycle prunes sketch files whose only references are stories shipped in that plan — the code (and `canvas`) is the record of the UI from then on; git history keeps the files recoverable. A file still referenced by an active backlog item, another plan, or an Icebox item survives; an Icebox item that gets deleted takes its sketches with it.
