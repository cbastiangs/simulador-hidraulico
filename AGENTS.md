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
- `docs/PLAN-simulador.md` — the design authority: model, constants and their
  sources, the open licence/placement question, solver roadmap. Where its
  sequencing or fd-app plumbing disagrees with `ROADMAP.md`, the roadmap wins.
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

## Design documents over code

The `docs/` documents are the design pass. Before changing the model, the
constants, or the element laws, re-read `PLAN-simulador.md` and the summaries
they name. The manual is a training/compatibility reference, not physical
truth; maintain the guardrail in `compatibility-vs-physics.md`.

## Verification

| Command | Proves |
|---|---|
| `pnpm test` | the hydraulic laws against published tables |
| `pnpm typecheck` | engine and app type-check (`svelte-check`) |
| `pnpm build` | the app prerenders to static files in `build/` |

No database, no Docker. Before handing work back, run all three. `pnpm dev`
serves the app locally.