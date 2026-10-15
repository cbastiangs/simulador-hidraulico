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
- `src/routes/`, `src/lib/` — the app: SvelteKit, prerendered to static files
  (`adapter-static`). Imports the engine through the `$hydraulics` alias.
- `tests/` — `node --test`, checked against published tables (Colorado DFPC
  chart, CGBVP 2019 manual, metric cross-check). `boundaries.test.mjs`
  enforces the engine's import rule below.
- `docs/ROADMAP.md` — what the simulator is (a playground of lays), the
  stack, the scenario document, trucks, and the milestone order. Read it
  first.
- `docs/MODEL.md` — every law and constant: formula, units, source, status,
  and what to verify before implementing. Code, tests and on-screen formulas
  follow it.
- `docs/UX.md` — how screens behave and look: canvas, controls, layout,
  mobile, visual style, and how UI work is checked.
- `docs/PLAN-simulador.md` — history and open questions: the licence and
  placement question, solver roadmap, station data. Where its sequencing or
  fd-app plumbing disagrees with `ROADMAP.md`, the roadmap wins.
- `docs/manual-summaries/hydraulics/` — the CGBVP 2019 review that grounds the
  physical model.

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
- The app never computes hydraulics itself: it builds an input, calls the
  engine, and formats the result.
- UI text in Spanish, code and docs in English.
- **UI work follows `docs/UX.md`.** Build directly; **no mock-ups unless the
  owner asks for one** (owner, 2026-10-15: they cost tokens). Before handing
  back, check it in a browser at 390 px and 1024 px and send a screenshot.

## Design documents over code

**Decisions go in the docs, in the same commit.** When the owner states a
preference or decision that outlives the task at hand, record it where it
belongs (`ROADMAP.md` decisions, `UX.md`, `MODEL.md`), not only in chat.

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

**Test budget:** tests exist to catch wrong numbers that look right. One
test per law per source, against published tables or hand arithmetic. No
tests for UI, geometry or crashes (those are visible); no test repeating
what another proves.

No database, no Docker. Before handing work back, run all three. `pnpm dev`
serves the app locally.