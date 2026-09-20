---
name: canvas
description: "Generate or update docs/canvas.html — a single-file, offline, interactive HTML overview of the project for any stakeholder: what it is, what it can do, how it's built, where it stands. User-invoked only; the workflow suggests it after plans that shift architecture or capabilities but never runs it."
---

# canvas — Stakeholder Documentation Canvas

One file: `docs/canvas.html`. It opens straight from disk in any browser, works offline, and is written for a reader who has never seen the project — new engineer, product stakeholder, API consumer. Write it per AGENTS.md → Talking to the User, and point every claim at its evidence (`src/services/auth.ts:42`). This is high-depth work — think hard about what this project's readers actually need before writing.

## Modes

| State | Mode |
|-------|------|
| No `docs/canvas.html` | **Generate** |
| Canvas exists | **Update** (default — diff-driven) |
| User passes `rebuild` | **Rebuild** from scratch, reusing recorded audiences |

## Contract (update mode and honesty depend on these)

- **Self-contained**: all CSS/JS/SVG inline. No CDN scripts, external stylesheets, fonts, remote images, or fetch — plain `<a href>` links out are fine. Must render with JS disabled (nav degrades to all-sections-visible).
- **Sections**: `<section class="canvas-section" id="kebab-id" data-sources="src/auth/, docs/project.md">` — `data-sources` lists the files/directories the content derives from (directory prefixes end with `/`).
- **Manifest** in `<head>`: `<script type="application/json" id="canvas-manifest">` holding `generated`, `commit` (full `git rev-parse HEAD`), `plan`, `audiences`, `sections`.
- **Footer stamp**, visible: `Documents the project as of Plan N · YYYY-MM-DD`. Readers must always know how fresh the page is.

## Generate

1. Inventory the project: README, `docs/` artifacts, source entry points, API surfaces, tests (`explorer` agent for large codebases).
2. One skippable decision-block round (AGENTS.md → Talking to the User): primary audiences (pick any that apply), what to emphasize, anything to exclude. Record answers in the manifest.
3. Design the section map **for this project** — a CLI tool, a data pipeline, and a SaaS app deserve different maps. Candidates: start here (lead with the north star from `docs/project.md`) · capabilities · architecture · how it works (walk the 2–3 flows that matter, one with real payloads) · API reference · try it locally · key decisions & FAQ · glossary · known gaps (candid, sourced from the backlog) · current state. Pick what answers this project's readers, not all of them.
4. For each piece of content, pick the representation that helps most — inline-SVG diagram, table, worked example, FAQ. Prose is the fallback, not the default.

## Update

1. Read the manifest's `commit`. Run `git diff --name-only <commit>..HEAD` — this catches hotfixes and manual commits, not just planned work. Read changelog entries since the manifest's `plan` for the why.
2. Map changed files to sections via `data-sources` prefixes; rewrite those sections. Always refresh the current-state section, manifest, and footer stamp.
3. Re-derive every number (test counts, endpoint counts) this run — never copy one from the old canvas. Never carry a claim you can't still point at.
4. Manifest commit no longer exists, or most sections stale → say so and Rebuild.

## Self-check (run it yourself before reporting done)

Every internal `#link` resolves · nav ↔ sections one-to-one · no external resource loads (`script`/`link`/`img` src) · every `data-sources` path exists in the repo · manifest parses · footer stamp present · no near-empty sections · no secrets, credentials, internal hostnames, or personal data (this file gets shared). Fix and re-check until all pass. Suggest committing as `docs(canvas): update for Plan N`.
