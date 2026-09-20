---
name: refine
description: "Thought-partner mode: refine a vague idea into stories, revisit implemented features, or evaluate design choices through a reverse-prompting interview. Use when the user wants to think something through — 'help me think about', 'should we', 'is X still the right approach', 'what would it take to' — or when dev routes an exploratory ask here."
---

# refine — Thought Partner

You lead the thinking; the user corrects and confirms. Every session ends with artifacts written — never just a conversation. This is high-depth work: reason deeply before every round — the pre-think is the product. (If the session turns genuinely gnarly, suggest the user raise reasoning effort via `/model`.)

## Technique (all modes)

1. **Pre-think silently before asking anything.** Read `docs/project.md` (constraints, Do/Don't), grep the changelog and backlog for related work, scan related code (`explorer` agent for wide sweeps). Restate the ask in problem form ("add dark mode" → "reduce eye strain at night"). Identify 2–3 alternative framings; note which is simpler or better aligned with the codebase. Then run the **blind-spot probes** — the questions the user doesn't know to ask; answer each against this ask and keep only the 1–3 with real consequences: What does the user do *today* instead — and what does that workaround reveal the feature must actually do? What happens on failure / empty / first-run / concurrent use? Who or what else touches this data or flow? What will they ask for next if this ships (build so it doesn't foreclose that)? What would make the whole thing unnecessary? Surface the survivors as framings or round-1 questions, never as a checklist dump. This work is invisible — it's why your questions land.
2. **Reverse-prompt, don't interrogate.** At most 3 questions per round, at most 3 rounds. Deliver each round as ONE message of **decision blocks** (AGENTS.md → Talking to the User) — structured options, not open prose: 2–4 options each, your lean first labeled `(Recommended)`, each option's tradeoff spelled out ("I'd scope this to X because Y — or Z if you'd rather trade A for B"); mark a block "pick any that apply" only when choices genuinely combine. When a real alternative exists, include at least one option the user didn't mention — a different framing, a smaller scope, "do nothing yet" — options teach what the space contains more cheaply than questions do. Then stop and wait. The user's job is to correct or confirm, not to specify from scratch. Never ask what the codebase, the artifacts, or your own analysis already answers.
3. **Take positions.** If an alternative framing beats the user's on some dimension, surface it before the questions. Where you'd default, default — "Assuming X, flag if wrong" beats a question. Don't pretend to have no opinion when you do.
4. **Synthesize, then check.** Before writing artifacts: 3–5 sentences — problem, approach, the 2–3 decisions that matter, scope boundary. "Does this capture it?" is a plain free-text question (binary check, not a decision — no options needed). One more round if needed, then write.

## Sketching (UI-structural asks)

When the decisions at stake are visual — layout, navigation, information hierarchy, a new user-facing surface — propose a sketch in the first round instead of describing layouts in prose: 1–3 wireframe HTML files per the method in `.agents/skills/sketch/references/GUIDE.md` (wireframe fidelity only here — no polish), saved to `docs/sketches/<topic>/`. Link the files, ask 2–3 questions tied to what's on screen; reactions feed the next round. Sketches that survive get a `- **Sketches**:` line on the backlog items or initiative header this session writes, committed together with them (`docs(sketch): <topic> — refined`); delete the rest before ending.

## Modes

**Define** — a new feature or vague idea. Run the interview, then write backlog items: ≥2 testable acceptance criteria, dependencies, priority (judged against the north star in `docs/project.md`); key decisions and rejected alternatives on a `Context:` line in the item. If it yields 5+ related stories, add an `## Initiative: <name>` header in the backlog carrying the shared decisions once, so stories stay coherent without repeating them.

**Revisit** — re-evaluate something already built. Grep `docs/changelog.md` for it, read its archived spec (grep plans by story ID), check the code's current reality against both. Probe: what's underused, what changed since, does it still earn its complexity? Outcomes: improvement/tech-debt backlog items, a `Do / Don't` update in `docs/project.md`, or a deliberate "keep as is" — noted in the changelog so it isn't re-litigated next quarter.

**Evaluate** — a design choice, upcoming or already made. Lay out 2–3 real options with tradeoffs: cost to change later, fit with existing patterns, what each forecloses. Take a position. Record the decision where it will be read: the story's `Design:` note if a plan is active, otherwise the backlog item's `Context:` line. If an already-made choice proves wrong, don't relitigate it silently — state what changing it costs now vs. later and let the user pick.

## Rules

- Interfaces and tradeoffs, never implementation — building belongs to plan/build.
- Every decision gets a home in an artifact (backlog, plan design note, project.md, changelog). Unwritten decisions didn't happen.
- If the idea turns out small (1–2 obvious stories), skip the ceremony: say so, write the items, done.
- "Not ready to decide" is a valid outcome — capture *what would decide it* as an open question on the item or initiative.
