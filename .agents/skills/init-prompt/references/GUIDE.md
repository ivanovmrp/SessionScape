# Writing a Good `sdlc-init` Prompt

`sdlc-init` detects what it can (stack, versions, test command, conventions) and asks about the rest. A good init prompt front-loads **only what detection cannot discover** — so the first session confirms instead of interrogating, and `docs/project.md` starts life accurate.

The rule of thumb: give init **decisions, access, intent, and corrections**. Leave everything discoverable-from-files to detection — correcting a wrong guess costs one sentence; writing an inventory costs an evening and goes stale.

What belongs in the prompt, in both modes:

| Category | Why the prompt must carry it | Examples |
|---|---|---|
| **Intent** | Not in any file | The north star — what this is, for whom, what outcome means success (init records it in project memory); learning-vs-shipping posture (it changes story sizing) |
| **Decisions already made** | Files show what *is*, not what you *chose* | Chosen framework, storage, architecture leanings, dependency policy |
| **Access facts** | Undetectable and blocking | Service endpoints, env-var **names** for keys (never values), local model URLs |
| **Hard constraints** | The most expensive thing to learn by violation | Never-touch modules, compatibility promises, privacy/local-first rules |
| **Doc pointers for niche/new tech** | Anything newer than training data | Blog/docs URLs to register on the Docs line; niche libraries to flag for stack packs |
| **First focus** | Sets the first plan's direction | "Walking skeleton first", "fix the flaky auth tests before anything new" |

What does **not** belong: a PRD or feature list (that's `refine` and groom's job — one line of intent is enough), implementation details, a dependency inventory (the lockfile is truth), secrets (names of env vars only, never values), and anything you're merely guessing at — a stated fact in the prompt becomes project memory, so don't state what you don't know.

---

## A. Greenfield project

### Preparation (before the first session)

1. **Mechanics**: empty folder → `git init` → copy the workflow's `AGENTS.md`, `.agents/`, and `.codex/` in. Install `jq` (the safety hook fails closed without it). Trust the project in Codex and approve the guard hook once via `/hooks` — project `.codex/` layers don't load otherwise.
2. **External things live and verified**: any local services running (curl the endpoint yourself once), API keys exported under their env-var names.
3. **Write down the 3–5 facts only you know**: the goal in one sentence, stack choices you've already made (and which you're leaving open), hard rules, first focus.
4. **Collect doc URLs** for anything post-cutoff or niche — the framework's blog/docs, the odd library's repo. Init registers them once; every later session benefits.
5. **Decide the posture**: learning project (small stories, one concept each, explain as you go) or shipping project (value first). Say it explicitly — it changes how everything downstream gets sized.

### Prompt skeleton

```
$sdlc-init

Greenfield [LEARNING | shipping] project. Goal (becomes the north star): <one
sentence — who it's for + what outcome means success>.
[If exploratory: "The exact <scope/domain/X> is not decided — route me through
the refine interview for it before planning features."]

Docs to register: <URLs for each core framework / niche library; note which
libraries are niche enough to deserve a generated stack pack>.

Stack facts for project memory:
- <language / runtime and chosen frameworks, with version floors if they matter>
- <storage, key libraries — decisions only, not a wish list>
- <endpoints: "service Y at <URL>">
- <external services: "<name> via <package>; key in env var <NAME>">
- <globally installed skills (~/.agents/skills) worth recording on the Skills line>

Constraints (hard rules):
- <secrets policy — env var names only, never committed>
- <dependency policy — e.g. "minimal; prefer what the framework provides">
- <privacy / offline / compatibility promises>
- <posture: e.g. "learning project: small stories, one concept each">

Current focus: <the first concrete thing — a walking skeleton is usually right>.

No test framework exists yet — make testing setup one of the first backlog
stories. [Any known testing lever: "library Z tests against <tool>".]
```

Greenfield init will then interview you briefly (constraints, focus — mostly confirming what you wrote), scaffold `docs/`, seed a small backlog from your goal, and offer the command-allowlist rules. Expect the whole thing in minutes; if it's grinding through files, something's wrong.

---

## B. Adopting an existing project

Adoption adds one category greenfield doesn't have: **corrections** — places where honest detection will reach the *wrong* conclusion, and history the files can't tell.

### Preparation (matters more here than in greenfield)

1. **Clean git state first.** Commit or stash everything. Init writes files (`docs/`, rules, gitignore lines) — you want its changes reviewable as one isolated diff.
2. **Run the test suite yourself, before adopting.** This is the single most important step. Every workflow gate assumes "suite green" means something. If it's red or flaky *today*, either fix that first or disclose it in the prompt ("suite has 3 known failures in <area>; treat them as pre-existing, backlog them, don't let them block gates"). Adopting a red suite silently poisons every gate from day one.
3. **Sort out collisions** if the project already has an `AGENTS.md` or `.codex/` config: Codex loads at most one AGENTS.md per directory, so merge by hand — usually the workflow file becomes the root `AGENTS.md` and the old content moves into it (or into `docs/project.md` if it's project facts). Merge `.codex/hooks.json` entries rather than overwriting. Trust the project and approve the hook via `/hooks`.
4. **Write the never-touch list.** Legacy modules mid-migration, generated code, vendored directories, the thing your teammate owns.
5. **List what actually hurts.** Init will scan for TODOs and dead tests, but greps find *annotations*, not *pain*. Your three sentences of "the deploy script is fragile, the auth module scares everyone, reports are slow" seed a better backlog than a hundred TODO hits.
6. **Note the deliberate weirdness** — the corrections list. Anything a fresh scanner would misjudge: "X is vendored on purpose", "the ugly module in src/old/ is scheduled for deletion — don't groom improvements into it", "we don't use the ORM in hot paths, that's intentional".
7. **Team facts**, if any: CI must pass before merge, PR conventions, protected branches, who reviews.

### Prompt skeleton

```
$sdlc-init

Adopting an existing project: <one sentence — what this system does and its
current life stage (active / maintenance / mid-migration)>.

North star, if you can state it: <one sentence — who it's for + what outcome
means success; omit and init drafts one from the code for you to correct>.

Test reality: <"suite green as of today, command: <cmd>" | "3 known failures
in <area> — pre-existing; backlog them, don't block gates on them">.

Corrections — things a fresh scan will misjudge:
- <"X is vendored deliberately">
- <"src/old/** is scheduled for deletion — do not groom or improve it">
- <"the missing tests in <area> are known; that's the debt we're here to fix">

Constraints (hard rules):
- Never touch: <modules / paths, with the one-line reason>
- <compatibility promises: API/schema stability, supported platforms>
- <team gates: "PRs merge only on CI green", branch rules>

Where it hurts (seed the backlog beyond what scanning finds):
- <pain point 1, in plain words>
- <pain point 2>

Scope the initial groom: <"focus the first scan on <area>; skip <area>" —
avoid a 50-item backlog graveyard on day one>.

Docs to register: <URLs for the stack's frameworks, esp. anything newer than
training data>. <Globally installed skills worth the Skills line.>

Current focus: <the first thing worth a plan — often "fix the flaky tests" or
"the smallest pain point above">.
```

Adoption init will verify the test command actually runs, detect stack and conventions from the lockfile and real files, scan for work signals *within the scope you set*, and record everything in `docs/project.md` for you to confirm. Review its whole diff before the first `dev` request.

---

## Universal advice

- **Shorter is better.** Both skeletons should fill to 25–45 lines. If yours is longer, you're either writing a PRD (move it to `refine`) or inventorying the detectable (delete it).
- **Every stated fact becomes memory.** `docs/project.md` starts from your prompt — wrong "facts" persist until something trips over them. When unsure, phrase as a question ("I *think* the API must stay backward compatible — confirm with me") rather than a rule.
- **Env vars by name, endpoints by URL, versions as floors** ("≥ 1.47") — the three formats that stay true longest.
- **The prompt is not the last word.** Anything you forget lands later via one sentence to `dev` — it goes into project memory or the backlog the same way. Init just makes day one smooth; it doesn't have to be perfect.
