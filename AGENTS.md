# simulador-hidraulico

Hydraulics simulator for CGBVP-style fireground line calculations. Extracted
from `fd-app` (2026-10): the engine, its tests, and the design documents moved
here untouched; the screen and station-data integration are still open (see
`docs/PLAN-simulador.md` §5–§8).

## Layout

- `src/hydraulics/` — the engine: plain TypeScript, no framework, no app
  imports. The seed of the future `fire-calc` package.
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
- Units are internally psi / US gpm / feet because every published constant is
  defined in them; conversions live only in `src/hydraulics/units.ts` and
  happen at the screen's edge.
- Flow is a solved output, never an input. `line.ts` says why.
- Invalid input is a caller's bug (`assertValidLine` throws `RangeError`), not
  a hydraulic state.

## Design documents over code

The `docs/` documents are the design pass. Before changing the model, the
constants, or the element laws, re-read `PLAN-simulador.md` and the summaries
they name. The manual is a training/compatibility reference, not physical
truth; maintain the guardrail in `compatibility-vs-physics.md`.

## Verification

| Command | Proves |
|---|---|
| `pnpm test` | the hydraulic laws against published tables |
| `pnpm typecheck` | the engine type-checks |

Nothing else is needed: no database, no Docker, no browser. Before handing
work back, run both.