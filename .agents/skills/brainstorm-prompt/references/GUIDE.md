# Prompting Guide — Brainstorming with the Workflow

How to prompt when you want to *think* with the workflow: a new app idea, a new feature, revisiting something already built, or weighing a design choice. These all route to the `refine` skill (thought-partner mode), directly or via `dev`.

## How the interview works — and what that means for your prompt

In refine, **Codex leads and you steer.** Before asking you anything, it reads project memory, greps the changelog and code, restates your ask as an underlying problem, and forms alternative framings. Then it asks at most 3 structured questions per round (3 rounds max) — numbered-option decision blocks, each carrying a recommendation — your job is to correct or confirm. Every session ends with something written: backlog items, a decision on record, a lesson in project memory.

So your prompt is not a spec — it's **seed material for the pre-thinking**. The best seeds are experience and evidence, not conclusions:

- **State the itch, not the fix.** "I keep losing track of which notes are stale" beats "add a staleness dashboard." If you *do* have a solution in mind, give it — but labeled: "my instinct is X, challenge it."
- **Include the evidence.** When did you last feel this? What were you doing? What did you expect instead? One concrete moment is worth ten abstract requirements.
- **Name constraints and non-goals up front.** "Must stay offline", "no new dependencies", "not trying to serve anyone but me." Cheap to say now, expensive to discover in round 3.
- **Say how decided you already are.** The three honest levels:
  - *exploring* — "I don't know what I want yet; interview me"
  - *validating* — "I have a direction; poke holes in it"
  - *decided* — "I've decided; skip the interview, write it up"
  All three are legitimate. Saying which one you're at saves the ceremony where it isn't wanted — refine's own rule is to skip the interview when the ask is already clear.
- **"I don't know" is a good answer.** Unresolved questions get captured as open questions on the item, tagged for whoever resolves them later. Don't invent certainty to satisfy the interviewer.

---

## A. New app idea (often before a project exists)

What Codex can't grep for here is *your life* — the context an empty repo doesn't have. Give it:

```
$refine   (or a plain dev request with the idea, in an initialized project)

The idea: <one or two sentences, problem-form if you can manage it>.
Who it's for: <even if "just me" — then which you: you-the-developer,
  you-the-parent, you-at-work?>
The moment it comes from: <the last time you wished this existed — what
  were you doing, what did you do instead?>
Why existing tools don't do it: <or "I haven't looked — that's a fair
  first question">
Success in 3 months looks like: <e.g. "I use it weekly without forcing myself">
Appetite: <weekend toy / learning project / something I'd maintain for years>
Constraints: <local-only, budget, stack you want to learn, time>
Where I am: <exploring | validating | decided>
```

The appetite line matters most — the same idea produces a different story set for a weekend toy than for a keeper.

**Weak:**

> $refine I want to build a reading tracker app

Codex has nothing to pre-think with — the interview's first round gets spent discovering who it's for and why Goodreads isn't the answer.

**Strong:**

> $refine An app for what I *thought* about books, not just what I read.
> Last week I recommended a book to a friend and couldn't reconstruct why I'd
> loved it — my margin notes are scattered across three notebooks and photos.
> For me only; Goodreads-style social features are explicitly out. Success in
> 3 months: I look up something I wrote about a book two months earlier, and
> it's actually there. Appetite: learning project (excuse to practice local
> LLM embeddings), maintained for years if it sticks. Constraint: private,
> fully local. Where I am: exploring — interview me.

Same idea, but now round 1 can go straight to real choices: capture flow (type? photograph? voice?), organization model, whether search or browsing is the primary read path.

## B. New feature for an existing project

```
<feature ask, as a plain dev request>

The moment: when I <do X>, I can't <Y> — last happened <when/how often>.
Today's workaround: <what you do instead — this is the strongest evidence
  of what the feature actually needs to do>
Who else hits this: <or "only me">
Out of scope: <what this is explicitly NOT — the cheapest scope control you have>
My instinct: <your candidate solution, if any> — challenge it if there's
  something simpler.
Where I am: <exploring | validating | decided>
```

**Weak:** "add export functionality" — forces Codex to invent the who/what/why, and the interview burns its 3 questions recovering basics.
**Strong:** "When my accountant asks for last quarter's numbers I screenshot the dashboard piece by piece (did it Tuesday, took 20 minutes). Something exportable she can open — my instinct says CSV, challenge that. Not trying to build a reporting engine." — now the questions go to real choices (scope, format, period selection), not archaeology.

**And the "decided" variant, which skips the interview honestly:**

> Decided: add a `--json` flag to the export command, mirroring exactly
> how the `--csv` flag works today (same period selection, same file naming).
> No interview needed — write the backlog item; criteria: valid JSON, same
> rows as CSV for the same period, documented in --help.

Codex writes the item, states any defaults it filled in ("Assuming UTF-8, flag if wrong"), and you're planning two minutes later. Declaring "decided" isn't skipping quality — the acceptance criteria still gate everything downstream.

## C. Revisiting something already built

This is Revisit mode: Codex finds the feature in the changelog, reads its archived spec, checks what the code looks like *today*, then interviews you about what changed. Feed it the symptom:

```
revisit <feature — by name, or story ID if you remember it>

Symptom: <what makes you bring it up — unused? complaints? every change
  nearby is painful? just a feeling?>
What changed since we built it: <new usage patterns, new features leaning
  on it, requirements that shifted — or "nothing, I'm just doubting it">
My suspicion: <e.g. "we over-built it" / "it's fine, reassure me">
Acceptable outcomes: <simplify / extend / remove / keep as is — list any
  you'd rule out up front>
```

Two things to know: "keep as is" is a first-class outcome — it gets written to the changelog so the same doubt doesn't restart next quarter. And if the real driver is *maintenance pain* rather than user value, say so — that steers toward simplification stories instead of feature stories.

**Weak:**

> revisit the notifications feature

An invitation to re-read old specs with no direction — Codex can describe what exists but not what's wrong with it.

**Strong:**

> revisit notifications (the digest part was BL-031, I think).
> Symptom: the weekly digest email — I checked the logs, nobody has opened
> one in two months, but its template breaks every time we touch the styling,
> which is the real cost. What changed: we added mobile push last quarter and
> it clearly won. Suspicion: the digest is dead weight. Acceptable outcomes:
> remove, or keep-and-freeze; NOT interested in improving it.

Codex verifies against the code and archived spec (maybe the digest also drives the "unsubscribe all" flow — that's what fresh reading is for), then the interview is about consequences of removal, not whether there's a problem.

## D. Weighing a design choice

Evaluate mode — before building (best), or after, when a made choice is bothering you:

```
help me decide: <the choice, one line>

Options I see: <A, B — Codex will add C if one exists>
Optimizing for: <pick the ONE that wins ties: simplicity / performance /
  flexibility / time-to-ship>
Reversibility worry: <what gets expensive to change later if we choose wrong>
Deadline pressure: <"deciding today" vs "can sit on it a week">
```

For an already-made choice that seems wrong: expect the answer in switching-cost terms — what changing costs *now* vs. *later* — not a relitigation of the original debate.

**Weak:**

> should I use SQLite or Postgres?

Unanswerable as asked — the right choice depends entirely on the context you didn't give.

**Strong (before building):**

> help me decide: storage for session history. Options I see: SQLite
> file (matches "runs anywhere, zero setup") or Postgres (I know it better).
> Optimizing for: simplicity — this is a single-user local tool. Reversibility
> worry: if the data model gets relational later, how painful is migrating?
> Deciding this week, before the walking skeleton.

**Strong (after the fact):**

> I picked LibSQL for thread storage in plan 1. Now I'm adding full-text
> search and wondering if that was wrong. What does switching cost now (3
> stories built on it) vs. in six months? Optimizing for: not rewriting the
> storage layer twice.

---

## Answering the interview (the other half of the skill)

A round arrives as decision blocks, each option carrying Codex's lean. Example, mid-interview on the reading-notes idea:

> **Decision — capture flow** (how do notes get in?)
> 1. Type while reading (Recommended — matches "private, local"; lowest build cost)
> 2. Photograph margin notes — needs OCR, adds a heavy dependency
> 3. Voice memos — transcription via the local model, unproven quality
> Reply with a number or your own words.

Good ways to answer:

- **Confirm**: pick the recommended option. Don't feel obliged to be interesting — "the default is right" is the most common correct answer.
- **Correct with a reason**: pick another option, or redirect in your own words: "Actually photograph-first — my notes are in physical books, typing them over kills the habit." The reason matters; it feeds the next round's pre-think.
- **Split the difference out loud**: "Type-first for v1, but design the note format so OCR can feed it later." Hybrids you can articulate are better than silently picking the bigger option.
- **Say "I don't know — park it"**: it becomes an open question on the item instead of a fake decision. Far better than guessing under interview pressure.

One caution: every free-form answer that adds scope is a scope decision, and it's yours — Codex will fold it in, not argue twice. If rounds keep growing the idea, that's you, not the interview.

## Anti-patterns

- **Solution smuggling** — presenting your fix as if it were the requirement ("add a Redis cache" when the itch is "the page is slow"). You'll get a well-groomed story for the wrong thing. State the itch; offer the fix as a candidate.
- **Kitchen-sink sessions** — five ideas in one prompt. The interview format collapses; each idea gets a fifth of the thinking. One topic per session; park the rest as one-line backlog stubs.
- **Premature detail** — schemas, endpoint names, file layouts. Refine works at the interfaces-and-tradeoffs level; implementation detail belongs in the plan's `Design:` note. If you supply it now, it'll anchor the design before design happens.
- **Fake brainstorming** — asking for an interview when you've already decided, then rejecting every question. If you've decided, say "decided" — refine will skip the ceremony and write the items. That's the system working, not cheating.
- **Vibes with no evidence** — "make the app better/faster/nicer." There's nothing to interview. Find one concrete moment of friction first; if you can't, that's a signal there's no story here yet.

## What you'll have when it ends

Every session lands in artifacts — that's refine's contract ("unwritten decisions didn't happen"): backlog items with decisions and rejected alternatives on their `Context:` lines · an `## Initiative:` header when 5+ stories share decisions · Do/Don't lessons in `docs/project.md` · "keep as is" or "dead end, because X" notes in the changelog · open questions tagged for later. To resume any of it: a plain `dev` request — the router picks up from the artifacts, as always.
