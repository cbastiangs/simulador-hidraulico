# simulador-hidraulico

Hydraulics simulator for CGBVP-style fireground line calculations. Extracted
from `fd-app` (2026-10): the engine, its tests, and the design documents moved
here untouched; the screen and station-data integration are still open (see
`docs/PLAN-simulador.md` §5–§8).

## Layout

- `src/hydraulics/` — the engine: plain TypeScript, no framework, no app
  imports. The seed of the future `fire-calc` package. `series.ts` is the
  solver the app uses; `line.ts` is the closed-form oracle it is tested
  against.
- `src/routes/`, `src/lib/` — the app: SvelteKit, built to static files
  (`adapter-static`) as a client-rendered shell with a splash (`ssr = false`). Imports the engine through the `$hydraulics` alias.
- `tests/` — `node --test`, checked against published tables (Colorado DFPC
  chart, CGBVP 2019 manual, metric cross-check). `boundaries.test.mjs`
  enforces the engine's import rule below.
- `tools/devtools/` — snippets pasted into the browser console on the running
  app (not part of the build). `layout-dump.js` reports where gauges and
  nozzles are drawn, for layout bug reports.
- `docs/ROADMAP.md` — what the simulator is (a playground of lays), the
  stack, the scenario document, trucks, and the milestone order. Read it
  first.
- `docs/MODEL.md` — every law and constant: formula, units, source, status,
  and what to verify before implementing. Code, tests and on-screen formulas
  follow it.
- `docs/UX.md` — how screens behave and look: canvas, controls, layout,
  mobile, visual style, and how UI work is checked.
- `docs/ARCHITECTURE.md` — current state ownership, the target core/app/
  platform/ui layers, and the incremental migration plan. Read it before
  moving state or modules.
- `docs/PATTERNS.md` — architecture, code and UI/UX patterns, anti-patterns
  and the decision checklist. Read it before adding a pattern or a screen.
- `docs/PLAN-simulador.md` — history and open questions: the licence and
  placement question, solver roadmap, station data. Where its sequencing or
  fd-app plumbing disagrees with `ROADMAP.md`, the roadmap wins.
- `docs/HISTORY.md` — the subject-based pre-release timeline and candidate
  Spanish Novedad copy; an archive, not read by the app.
- `docs/manual-summaries/hydraulics/` — the CGBVP 2019 review that grounds the
  physical model.
- `data/releases.json` + `scripts/release.mjs` — the in-app novedades
  catalog and the `pnpm release` command that maintains it (Releases below).

## Foundation (2026-11-26)

The direction lives in `docs/ARCHITECTURE.md` (layers, state ownership,
migration), `docs/PATTERNS.md` (architecture, code and UI/UX patterns,
anti-patterns, checklists) and `docs/UX.md` (screen behaviour). Read the
relevant one before moving state or modules, or adding a screen; use the
decision checklist in `PATTERNS.md` §9. Do not invent a pattern when one is
already named there.

Non-negotiables, including while old code is migrated:

- **Layers:** `core → app → platform → ui`; a lower layer never imports a higher
  one. New code follows the layers; touched code moves one step toward them.
  Four layers are a convention, not a framework: the rule is the arrow.
- **One owner per state:** document, session, view, preferences, runtime,
  derived. The document is the only persisted user work; preferences persist
  separately; view state is ephemeral; derived state is never stored.
- **Edits are commands; reads are selectors; formatting lives at the UI edge.**
  Parse untrusted input only at the boundary.
- **One lay representation:** the scenario tree plus an explicit line path.
  No synthetic `Scenario` and no `WeakMap` identity bridge.
- **Features are slices; availability is a composition decision.** A disabled
  feature disappears from navigation/routes/commands; its document data still
  parses and opens. No feature flags inside core/app logic.
- **Persistence through the storage adapter once it exists.** Until then, keep
  storage in its owning module and add no new `localStorage` keys in
  components or routes.
- **Four outcomes stay distinct:** invalid document, blocked action,
  unavailable solve, platform failure. No silent failure.
- **UI:** selection never edits; one primary action; scope every reading;
  diagnose at the element; no hover-only; 44 px targets; reduced motion; one
  modal/sheet at a time.

## Engine rules

- `src/hydraulics/` imports only its own files (`./references.ts`, `./units.ts`)
  and runs under `node --test` with no bundler. Never import React, a
  framework, or anything outside the folder.
- Units are the station's: **metres** (length, height), **inches**
  (diameters), **psi**, **US gpm**. A published constant defined in feet is
  converted inside the law that uses it, with a factor from
  `src/hydraulics/units.ts`, the only place conversion factors live. Other
  display units (bar, L/min, ft) are converted at the screen's edge.
- Flow is a solved output, never an input. `line.ts` says why.
- Invalid input is a caller's bug (`assertValidLine` throws `RangeError`), not
  a hydraulic state.

## App rules

- **Svelte 5 runes only** (`$state`, `$derived`, `$effect`, `$props`). Never
  Svelte 4 syntax: no `export let`, no `$:` statements, no stores for
  component state, no `on:click` (use `onclick`). See
  https://svelte.dev/llms.txt.
- Versions are pinned exactly in `package.json`; SvelteKit stays on 2.x until
  a deliberate upgrade.
- The app never reimplements a hydraulic law: it builds an input, calls the
  engine, and formats the result. Read-only engine helpers may be used for
  drawing (reach, velocity); they must not solve, edit or persist.
- UI text in Spanish, code and docs in English.
- **UI work follows `docs/UX.md` and the UI/UX patterns in `docs/PATTERNS.md`.**
  Build directly; **no mock-ups unless the owner asks for one** (owner,
  2026-10-15: they cost tokens). Before handing back, check it in a browser at
  390 px and 1024 px and send a screenshot.

## Design documents over code

**Decisions go in the docs, in the same commit.** When the owner states a
preference or decision that outlives the task at hand, record it where it
belongs (`ROADMAP.md` decisions, `UX.md`, `MODEL.md`, `ARCHITECTURE.md`,
`PATTERNS.md`), not only in chat. A new screen or interaction pattern enters
`UX.md` or `PATTERNS.md` first; a new architecture pattern enters
`ARCHITECTURE.md` or `PATTERNS.md` first. Do not leave a new pattern only in
code.

The `docs/` documents are the design pass. Before changing the model, the
constants, or the element laws, re-read `MODEL.md` and the summaries it
names; a new law enters `MODEL.md` first, with its basis, before code. The
manual is a training/compatibility reference, not physical truth; maintain
the guardrail in `compatibility-vs-physics.md`.

## Verification

| Command | Proves |
|---|---|
| `pnpm test` | the hydraulic laws against published tables |
| `pnpm typecheck` | engine and app type-check (`svelte-check`) |
| `pnpm build` | the app prerenders to static files in `build/` |
| `pnpm dev` + `pnpm shot URL FILE` | UI work looked at in a browser: a screenshot at 390 and 1024 px |

**Test budget:** tests exist to catch wrong numbers that look right. One
test per law per source, against published tables or hand arithmetic. No
tests for UI, geometry or crashes (those are visible); no test repeating
what another proves. Application code gets tests where a wrong transformation
would be invisible: document parse/migrations, commands, line/path mapping,
exercise aggregation, share and storage codecs. Exercises in
`data/exercises/` count as presets for the parse/solve check.

No database, no Docker. Before handing work back, run all three. UI work
also gets its screenshots (e.g.
`pnpm shot --viewport-size=390,844 http://localhost:5173/ /tmp/opencode/390.png`).
`pnpm dev` serves the app locally; the model contact sheet is `pnpm dev`'s
`/boquillas` (UX.md §3.1).

## Releases

What users see in "Novedades" (UX.md §8.6) comes from `data/releases.json`.

- Commit subjects and bodies stay in English; only the `Novedad:` lines are
  Spanish. A `feat` or `fix` commit that users will notice carries one or
  more single-line trailers `Novedad: <one sentence in Spanish, for a crew
  member>`, one per user-visible change. A `feat` becomes "Nuevo" and a
  `fix` becomes "Corregido"; the subject is never the note. Internal work
  (docs, refactors, tests, chores) carries none, and the release script
  ignores trailers on those types.
- `pnpm release` previews; `pnpm release --draft` drafts a release from the
  `Novedad:` lines since the last `v<id>` tag (re-running it never rewrites
  the draft; it lists lines the draft lacks); edit the draft's wording and
  order by hand; `pnpm release --publish` stamps it and sets
  `package.json`'s version. The script never commits, tags, pushes or
  deploys; it prints the commit and tag commands for the owner to run.
- Never change or reuse a published id: browsers remember the last id read.

## Commits

Commit messages carry no AI co-author or session trailers: no
`Co-Authored-By: Claude …`, no `Claude-Session:`, no generated-by lines.
The owner (2026-10-15) asked for the history to be clean of them. Pull
request descriptions follow the same rule.