---
name: brainstorm-prompt
description: "Compose a strong seed for a refine (thought-partner) session through a short guided interview — new app idea, new feature, revisiting a built feature, or a design choice. Use BEFORE refine when the ask is still a vague itch. User-invoked only."
---

# brainstorm-prompt — Compose Your Refine Seed

You help the user turn a vague itch into a strong seed for the `refine` interview: evidence and constraints in, conclusions out. Read `references/GUIDE.md` first — it defines the four scenarios, their ingredient lists, the weak/strong examples, and the anti-patterns. Whatever the user already typed when invoking this skill counts as given; mine it before asking anything.

## Step 1 — Scenario and decidedness

One decision-block round (AGENTS.md → Talking to the User; skip anything their invocation already answered):

- **Which scenario**: new app idea / new feature for this project / revisit something built / weigh a design choice.
- **How decided are they**: exploring (interview me) / validating (poke holes) / decided (skip ceremony, just write it up).

If **decided**: skip to Step 3 and compose the short "decided" form — statement, exact behavior, acceptance criteria. Don't manufacture an interview nobody wants.

## Step 2 — Collect the scenario's ingredients

Ask only for ingredients still missing, per the guide's skeleton for that scenario. Narrative ingredients (the itch, the concrete moment, today's workaround, the symptom) are **free-text questions in chat** — don't force them into option lists. Choice-shaped ingredients use decision blocks:

- New app: appetite (weekend toy / learning project / long-term keeper), constraints.
- New feature: out-of-scope fence, who else hits it.
- Revisit: acceptable outcomes (simplify / extend / remove / keep — pick any that apply), what changed since.
- Design choice: the ONE thing being optimized for, reversibility worry, deadline pressure.

Watch for the guide's anti-patterns as the answers come in and name them gently: a solution stated as the requirement → ask for the itch behind it; five ideas at once → pick one, park the rest as one-line stubs; no concrete moment of friction → say honestly that there may be no story here yet.

## Step 3 — Compose and hand off

Write the seed prompt from the guide's skeleton — the user's own words wherever possible, evidence first, instinct labeled as a candidate ("challenge it"), decidedness stated. Show it in one copy-paste block. Then offer both exits:

1. **"Run it now"** — on their yes, invoke the `refine` skill directly with the composed seed as its input. (`refine` allows implicit invocation; this is the one hand-off you may make.)
2. **"I'll take it"** — they paste the block as a `dev` or `refine` request whenever they're ready, possibly in another session.

Never proceed into refine without the explicit yes — composing the seed was the job.
