# Architecture: current state, target and migration

> **Review, 2026-11-26.** Snapshot `87f6dd0` plus the uncommitted working tree.
> This document is a proposal, not an approved product decision. It changes no
> code. Line numbers drift; functions and file names are the durable references.

This is the high-level map of the app: what each part owns, where the current
shape breaks down, what a proportionate architecture for this kind of software
looks like, and how to get there without a rewrite. It is written so a new
contributor or a reviewer can read it once and then go straight to the files
that matter.

**Contents**

1. [Read this first](#1-read-this-first)
2. [What kind of app this is](#2-what-kind-of-app-this-is)
3. [Current architecture](#3-current-architecture)
4. [Findings](#4-findings)
5. [Target architecture](#5-target-architecture)
6. [Where a change lands](#6-where-a-change-lands)
7. [Migration plan](#7-migration-plan)
8. [Decisions needed](#8-decisions-needed)
9. [Review method and limits](#9-review-method-and-limits)
10. [Appendices](#10-appendices)

---

## 1. Read this first

**The diagnosis.** The hydraulic core is in good shape: it is pure, guarded by
a boundary test, and checked by 79 passing tests. The periphery accumulated
instead. The browser page became the application layer, the canvas became a
screen-sized component with five responsibilities, and the app now keeps
persisted state, session state, view state, browser preferences, runtime state
and derived state in the same few places. The code is not a dump; it has good
seams. The problem is that the seams are not drawn where the state changes.

**The recommendation.** Keep the modular monolith and Svelte runes. Introduce
four explicit layers — **core → application → platform/adapters → presentation**
— with one dependency rule, and split state by lifetime (document, session,
view, preferences, runtime, derived). "Layers" is not a framework or an
industry-standard count: it means four groups of modules with a one-way import
rule. The important part is the arrow, not the number. Make the scenario tree the only lay
representation, with an explicit line path. Move persistence and formatting to
the edges. Then break the page and canvas along seams that already exist.

**If you only do three things**

1. Extract a document store and a session store out of `+page.svelte`, and move
   autosave behind a storage port.
2. Replace the "flattened path as a fake `Scenario`" plus `WeakMap` bridge with
   one tree plus an explicit `LinePath` / `LineView`.
3. Split `Canvas.svelte` into a pure canvas model, a camera module, a gesture
   state machine, and rendering/overlay components.

**What not to do.** Do not rewrite the engine. Do not introduce Redux, DDD
ceremony, event sourcing, a backend, or packages/workspaces now (ROADMAP §9
explicitly defers them). Do not turn this into a clean-architecture diagram
exercise; four layers and one rule are enough.

---

## 2. What kind of app this is

The architecture has to fit these constraints, all of which are already
recorded in `ROADMAP.md`, `UX.md` or `AGENTS.md`:

| Constraint | Consequence for the architecture |
| --- | --- |
| Static files, offline, no login, no backend | All state is local. Persistence is a browser adapter; the app must survive storage denial, quota and private mode. |
| Deterministic engineering model | The solver and its inputs are pure functions. Display, layout, time and preferences never enter the hydraulic inputs. |
| One document is the product | Presets, links, saved copies, exercises and undo are all views over one versioned scenario document (`ROADMAP.md` §4). |
| Local-first, one user, one tab in practice | No server sync, no optimistic concurrency. A small document store with undo/redo is enough; no state library needed. |
| Teaching tool used in a browser on a projector or a phone | Presentation must be swappable: units, control style and layout are preferences, not document facts. Same document, different reading. |
| The engine is the seed of `fire-calc` | The engine stays plain TypeScript, testable under `node --test`, and never imports the app. |
| AI-assisted maintenance | Clear seams, small files, explicit types, guardrail tests. A contributor should find the one place a change belongs. |

This is a **local-first, document-centric simulator**: a functional core
(document + solver), an imperative shell (session, storage, browser), and a
presentation layer (Svelte). That is the natural reference architecture; the
rest of this document measures the current code against it.

---

## 3. Current architecture

### 3.1 At a glance

```
┌──────────────────────────────────────────────────────────────────────┐
│ SvelteKit pages                                                      │
│  +page.svelte (1,171 lines, 50 imports)                              │
│    presets · document · history · autosave · share · tour · clock    │
│    selection · sheet · practice · compare · layout · solve · render  │
│  /hidrante · /piscina (independent rigs, own state)                   │
│  /acerca-de · /boquillas                                             │
├──────────────────────────────────────────────────────────────────────┤
│ Components (41 files, 7,545 lines)                                   │
│  Canvas.svelte (2,460) · NozzleCloseUp (539) · Inspector (507) ...    │
│  Most components import the engine and the display-units singleton.  │
│  (27 of 41 import the engine; 24 import the unit singleton.)         │
├──────────────────────────────────────────────────────────────────────┤
│ src/lib (23 TS modules, 2,426 lines + 2,708 art + 569 geometry)      │
│  mixed application logic (edit, branch-edit, document, fire-flow)    │
│  presentation (display-units, readings, actions labels, selections)  │
│  persistence (library, apparatus, prefs, novedades)                  │
│  content (lessons, exercise-lessons, methods, pieces, nozzle art)    │
├──────────────────────────────────────────────────────────────────────┤
│ src/extinguishment (379 lines)   ← boundary tested, own domain       │
├──────────────────────────────────────────────────────────────────────┤
│ src/hydraulics (20 files, 2,676 lines) ← pure, boundary tested       │
│  units · references · catalog · laws · line · series · pump          │
│  scenario (+ parse, joints, solve facade) · tree · supply · tank     │
│  pool · reach · power · velocity · drafting · hydrant · jet-draft    │
├──────────────────────────────────────────────────────────────────────┤
│ data/  presets (11) · exercises (5) · apparatus · catalog CSVs       │
└──────────────────────────────────────────────────────────────────────┘
```

`src/lib` is not a layer. It is the default drawer: application logic,
presentation helpers, persistence, content and a 2,708-line nozzle-art
library all live under one prefix. That is the main reason the app feels
"all over the place": the folder name tells you nothing about what a module
may import or who owns its state.

### 3.2 Runtime flow today

1. `+page.svelte` eagerly loads every preset and exercise through
   `import.meta.glob` and parses each one with `parseDocument` (`+page.svelte:77`).
2. The page holds the active document, the last loaded baseline, the preset id,
   undo/redo stacks, selection, practice reveal, discharge baseline, comparison
   method, view toggles, sheet and layout state, storage readiness, autosave
   status and the tank clock (`+page.svelte:14-15,89-105,114-166,220-222,416-465,642-704`).
3. It solves on every edit: `network` for a branched lay, `lineScenario`/`result`
   for the drawn path, plus a second solve for "Comparar con"
   (`+page.svelte:340-459`).
4. It builds one synthetic `Scenario` and one solve result per other line so the
   canvas can draw them (`+page.svelte:387-398`).
5. Edits come back as a new `Scenario` through `apply`, `applyLine` or
   `applyTree` (`+page.svelte:224-276`). A drawn-line edit is mapped back into
   the tree by `branch.applyPathEdit`.
6. An effect debounces autosave to `localStorage` through `library.saveWorking`
   (`+page.svelte:642-655`).
7. Links, paste and file import replace the document after `parseDocument`.
8. Navigating to `/hidrante` or `/piscina` stores the whole editing session in a
   module-level `workspaceReturn` variable and restores it on return
   (`+page.svelte:14-22,573-606,656-663`).

### 3.3 Directory map and current responsibilities

| Area | What it currently contains | What it behaves like |
| --- | --- | --- |
| `src/hydraulics/` | Pure laws, catalog, solver, scenario parsing, tree solve, supply, reach | Core domain; the healthiest part |
| `src/extinguishment/` | NFA heat/flow laws | Second core domain; boundary tested |
| `src/lib/document.ts` | `AppDocument`, exercise schema, `parseDocument`, assignment pruning | Application document model, but under the generic lib drawer |
| `src/lib/edit.ts` | Single-path scenario edits | Application commands |
| `src/lib/branch-edit.ts` | Tree edits, path flattening, junction discovery, edit mapping | Application model + hidden state |
| `src/lib/actions.ts` | Command registry **and** Spanish labels **and** unit formatting | Application + presentation |
| `src/lib/pieces.ts` | Palette pieces, placement rules, labels | Application + presentation |
| `src/lib/readings.ts` | Reading extraction, messages, formatting with `u` | Presenter |
| `src/lib/fire-flow.ts` | Exercise aggregation query | Application query |
| `src/lib/library.ts` | Working autosave, saved copies, file download | Persistence + platform |
| `src/lib/share.ts` | Link/text codec, boundary error mapping | Platform adapter |
| `src/lib/apparatus.ts` | Truck schema, storage, apply-to-scenario | Content + persistence + command |
| `src/lib/display-units.svelte.ts` | Global `$state` unit preferences and formatting | Presentation singleton |
| `src/lib/prefs.svelte.ts` | Global `$state` control style | Presentation singleton |
| `src/lib/lessons.ts`, `exercise-lessons.ts` | Prompt text that formats numbers through the unit singleton | Content + presentation |
| `src/lib/geometry/` | Pure world layout and exercise geometry | Good presentation geometry |
| `src/lib/nozzle-art/` | 27 equipment drawings as data | Content/art |
| `src/lib/components/` | 41 Svelte components, including the canvas, inspector, pump panel, dialogs | Presentation, but many also own behavior |
| `src/routes/` | Workspace shell, independent rigs, about, art contact sheet | Presentation and composition root, currently also application |

### 3.4 State ownership today

The app has at least eight kinds of state. They are not separated; most of them
live in `+page.svelte`, a few in singleton modules, a few in components, and one
in a `WeakMap`.

| Kind | Examples | Current owner | Persistence |
| --- | --- | --- | --- |
| Persisted document | `scenario`, `exercise` | `activeDocument` in page | `simulador.working.v1` |
| Document baseline | `base`, `presetId` | Page | none |
| History | `past`, `future`, `burst` | Page | none |
| Exercise session | `revealedPracticeKey`, `practiceEpoch`, `dischargeBaseline` | Page | none (not shared) |
| View | `selection`, `selectedPath`, `sheet`, `pumpTab`, dialogs, camera | Page + `Canvas` | none |
| Preferences | units, control style, gauges, true scale, compare method | `display-units`, `prefs`, page | 5 `localStorage` keys |
| Runtime | tank clock, `lastTick`, visibility | Page effects | none |
| Derived | `network`, `result`, `view`, `others`, `budgetLines`, layout | Page + `Canvas` `$derived` | none |
| Hidden identity | path ↔ tree association, junction lists | `WeakMap`s in `branch-edit.ts:300-302` | none |
| Cross-route session | the whole session while visiting a rig | module-level `workspaceReturn` | none |

This is the root cause of most findings below. When each kind of state has one
home with one lifetime, the page can become a shell and the canvas can become a
renderer.

### 3.5 Persistence and boundaries today

Ten browser keys are written by seven modules:

| Key | Module | Versioned? |
| --- | --- | --- |
| `simulador.working.v1` | `lib/library.ts` | yes |
| `simulador.library.v1` | `lib/library.ts` | yes |
| `simulador.apparatus.v1` | `lib/apparatus.ts` | yes |
| `view.units.v1` | `lib/display-units.svelte.ts` | yes |
| `view.controls` | `lib/prefs.svelte.ts` | no |
| `view.compare` | `routes/+page.svelte` | no |
| `view.gauges` | `routes/+page.svelte` | no |
| `view.hose-scale` | `routes/+page.svelte` | no |
| `novedades.seen.v1` | `lib/novedades.ts` | yes |
| `tour.seen` | `lib/components/Tour.svelte` | no |

There is no key registry, no shared read/write contract, no migration chain
beyond re-parsing, and no typed storage error. Some modules guard storage
access; others throw generic `Error`s. A browser that denies storage produces
different behaviour for the document, the library, the apparatus profiles, the
tour and the release notes.

### 3.6 Dependency rules: intended vs actual

The project already states the intended direction:

- `src/hydraulics/` imports only itself (`AGENTS.md`, enforced by
  `tests/boundaries.test.mjs`).
- `src/extinguishment/` imports only itself and `hydraulics/units.ts`
  (enforced by the same test).
- `ROADMAP.md` §4: "The solver reads it; the views draw it; nothing else holds
  state that matters."
- `ROADMAP.md` §5: geometry is pure under `src/lib/geometry/`; components only
  render its output.
- `PLAN-simulador.md` §8 (historical but still the right rule): the UI imports
  the core; the solver never sees layout or display units; the drawing never
  sees the solver.

What actually happens:

| Rule | Status | Evidence |
| --- | --- | --- |
| Engine imports only itself | Enforced, passing | `tests/boundaries.test.mjs` |
| Extinguishment imports only itself + units | Enforced, passing | same |
| Solver never sees display units or layout | Holds | no engine import of `$lib` |
| Drawing never sees the solver | Broken | `Canvas.svelte` imports solver result types plus velocity/reach/nozzle physics, readings and actions |
| Application logic independent of UI state | Broken | `actions.ts:1`, `readings.ts:3`, `lessons.ts:1`, `exercise-lessons.ts:2` import the `$state` unit singleton |
| Ordinary modules are `node --test`-able | Partial | the four modules above cannot load outside Svelte |
| One representation of a lay | Broken | tree + synthetic flattened `Scenario` + `WeakMap` bridge |
| Persistence at one edge | Broken | ten keys in seven modules |

### 3.7 Metrics snapshot

Measured on the snapshot; useful for trend, not a score.

| Metric | Value |
| --- | --- |
| Source lines (`.ts` + `.svelte` under `src/`) | ~18,000 |
| Engine | 2,676 lines / 20 files |
| Extinguishment | 379 lines / 3 files |
| Components | 7,545 lines / 41 files |
| `src/lib` TypeScript | 2,426 lines / 23 modules |
| Nozzle art | 2,708 lines / 30 files |
| Geometry | 569 lines / 3 files |
| Routes | 1,723 lines / 8 files |
| Largest components | Canvas 2,460 · NozzleCloseUp 539 · Inspector 507 · Tour 351 |
| Largest non-engine modules | branch-edit 423 · edit 408 · nozzle-anatomy 378 · actions 270 |
| `+page.svelte` | 1,171 lines · 50 imports · 47 `$state` · 33 `$derived` · 9 `$effect` |
| `Canvas.svelte` | 2,460 lines · 26 imports · 37 `$state` · 51 `$derived` · 13 `$effect` · 34 props |
| Tests | 79 passing, all engine/extinguishment/boundaries |
| Tests importing `src/lib` | 0 |
| Engine import cycles | 1 (`scenario.ts` ↔ `tree.ts`) |
| Modules that write `localStorage` | 7 |
| Browser keys | 10 |

---

## 4. Findings

Priority reflects structural cost and correctness risk, not the size of the
diff. Each finding says what is observed, why it matters, and what "good"
looks like. The findings are deliberately about seams, not about visual style;
the UI review in `docs/UX-AUDIT.md` covers screen-level friction.

**At a glance**

| # | Finding | Priority | Consequence |
| --- | --- | --- | --- |
| F1 | The page is the application layer | P0 | Every feature touches one 1,171-line file; no application tests |
| F2 | State kinds are mixed | P0 | No single source of truth; reload/undo/autosave drift |
| F3 | Two lay representations joined by `WeakMap`s | P0 | Hidden identity; the riskiest code is untested |
| F4 | Display units leak into logic/content | P1 | Logic cannot run under `node --test`; content couples to units |
| F5 | Persistence is scattered | P1 | No migration home; inconsistent storage failure behavior |
| F6 | The canvas is five components in one | P1 | Interaction, layout and hydraulics change together |
| F7 | Document module overloaded + engine cycle | P2 | Hard to extract `fire-calc`; parser and solver collide |
| F8 | Content, ordering and lessons are scattered | P2 | Adding a practice touches several unrelated files |
| F9 | Independent rigs use a module-level session hack | P2 | Session lost on reload/hard navigation |
| F10 | Glue has no tests and no typed error model | P1 | The riskiest code has the least coverage |

### F1 · P0 — The page is the application layer

**Observed.** `+page.svelte` is 1,171 lines with 50 imports. It loads content,
owns the document, baseline, history, autosave, share/paste/import, the tour,
the tank clock, selection, practice reveal, comparison method, view toggles,
layout measurements, and a module-level session snapshot for other routes.
Every screen action eventually calls into it. It has 47 `$state` declarations,
33 `$derived` values and 9 effects.

**Why it hurts.** Each new feature has to understand the whole page. State
transitions are implicit (for example, what happens if autosave fires while a
link is loading, or the tank clock while the document is replaced). Nothing
here can be tested under `node --test`. Reviewers cannot tell which state is
authoritative. The page is also the composition root, the router adapter and
the application service at once.

**Good looks like.** A page that wires a session store, a document store and
view state into a layout and components. Loading, saving, sharing and history
live in named application modules with explicit inputs and outcomes.

### F2 · P0 — State kinds are mixed, so authority is unclear

**Observed.** The page owns persisted document, baseline, history, exercise
session, view, preferences, runtime and derived state. Some view preferences
live in singleton modules (`display-units`, `prefs`), three more live as raw
`localStorage` calls in the page, and one piece of model information lives in
`WeakMap`s. `base` and `activeDocument` both look like "the scenario"; the
scenario name and `presetId` both identify "the current preset"; the compare
method is both a preference and a solve input.

**Why it hurts.** Two sources of truth drift. Reload, undo, link load and
scenario switch have subtle interactions because each touches a different
combination of variables. It is also why the app is hard to document: there is
no single answer to "where does this value live?".

**Good looks like.** Six explicit state holders with one lifetime each:
document, session, view, preferences, runtime, derived. Only the document is
persisted as the user's work; preferences persist separately; view state is
ephemeral; derived state is never stored.

### F3 · P0 — Two representations of a lay, joined by object identity

**Observed.** The canonical lay is a `Scenario` tree (`sections`, `wye`,
`discharges`). To draw and edit one pump-to-nozzle path, `branch.pathView`
builds a **new synthetic `Scenario`** by flattening the path's sections and
nozzle (`branch-edit.ts:336-360`). It records the relationship in two
`WeakMap`s: `junctionJoints` and `drawnFrom` (`branch-edit.ts:300-302`). Edits
to the synthetic scenario are mapped back by `applyPathEdit` using section
counts and a positional hint (`branch-edit.ts:371-404`). The page additionally
creates one synthetic `Scenario` and one solve result **per other line** for the
canvas (`+page.svelte:387-398`).

**Why it hurts.** Object identity now carries semantics. A copy, spread or
serialization of the path loses its junction list and its parent tree
(`junctionsOf` returns `[]` by design for an edited copy). The mapping back is
the most intricate code in the app, and it is untested. Any new feature that
needs "the drawn line" must know whether it has the tree, the flattened view,
or another line's view. This is the single biggest source of accidental
complexity.

**Good looks like.** One canonical tree. A line is an explicit value:
`LinePath = string[]` plus a pure `lineAt(scenario, path): LineView` that
contains the path's sections, nozzle, source and junctions. Commands take the
path explicitly and return a new document. No synthetic `Scenario`, no
`WeakMap`, no identity bridge.

### F4 · P1 — Display units leak into logic and content

**Observed.** The unit preference is a Svelte `$state` singleton
(`display-units.svelte.ts:11,17`). These non-component modules import it:
`actions.ts` (labels), `readings.ts` (formatting and messages), `lessons.ts`
(prompt numbers), `exercise-lessons.ts` (prompt numbers). Components import it
too, which is fine; the problem is the four logic/content modules.

**Why it hurts.** Those modules cannot run under `node --test` without a Svelte
compiler, so command behaviour, reading extraction and lesson content are
untested. It also means changing a display preference recomputes Spanish
strings inside logic, and content is coupled to the current unit selection.

**Good looks like.** Commands and queries return values plus reason codes.
Presentation injects a formatter: `formatQuantity(value, quantity, units)`.
Lessons are static text with placeholders or a formatter argument. The unit
singleton is imported only by presentation code.

### F5 · P1 — Persistence is scattered and unversioned in places

**Observed.** Ten keys in seven modules (§3.5). `library.ts`, `apparatus.ts`
and `novedades.ts` each own their storage, schema check and error handling.
The page writes three view keys directly. Versioning is inconsistent
(`view.units.v1` versus `view.controls`, `view.compare`, `view.gauges`,
`view.hose-scale`, `tour.seen`). Storage failures are sometimes caught,
sometimes thrown, sometimes ignored with `catch {}`.

**Why it hurts.** Migrations have no home. A key rename or schema change means
editing several unrelated modules. Private mode and quota errors surface
differently per feature. There is no place to add cross-tab sync or a
"storage unavailable" banner. Saved work is the user's most important asset;
its adapter should be the most boring, explicit module in the app.

**Good looks like.** One `platform/storage` module with a key registry, typed
read/write results and per-key migrations. Repositories for working document,
library, apparatus and preferences. Autosave is a subscriber to the document
store, not a page effect. No other module calls `localStorage`.

### F6 · P1 — The canvas is five components in one

**Observed.** `Canvas.svelte` is 2,460 lines with 26 imports, 37 `$state`,
51 `$derived`, 13 effects and 34 props. It owns camera math (fit, lock, glide,
zoom), pointer gestures (tap, drag, pinch, long-press, hold, wheel, keyboard),
hit testing and line cycling, layout overlays (gauges, rulers, warning labels),
piece placement, toolbars and context menus, stream/reach physics, particles,
and accessibility. It imports the solver result types, velocity, reach and
nozzle laws, and it formats readings.

**Why it hurts.** A canvas change can break interaction, layout or hydraulics
without an obvious boundary. The component is too large to review, too
stateful to test, and cannot be reused for another view (top-down, 3D) without
copying. It also violates the project's own rule that the drawing only renders
geometry and never sees the solver.

**Good looks like.** A pure `canvas/model.ts` that turns a line view plus
readings into positions and overlay boxes; `camera.ts` for fit/lock/zoom;
`gestures.ts` for the pointer state machine; small renderer components for
hoses, gauges, streams and labels; the page owns commands. Stream physics
becomes a presenter (`JetView`), not canvas logic.

### F7 · P2 — The engine's document module is overloaded, and there is a cycle

**Observed.** `scenario.ts` (542 lines) exports the schema, types, parser,
joint/fitting logic, nozzle resolution, reaction, series conversion,
single-line solve, and it re-exports the tree solve (`scenario.ts:344,428,499,517,542`).
`tree.ts` imports `scenario.ts` (`tree.ts:2`), producing the only engine cycle:
`scenario → tree → scenario`.

**Why it hurts.** "Document model" and "solver facade" change for different
reasons but live in one file. The cycle makes initialization order and future
package extraction harder. The engine's internal layering (document → network
→ solve) is invisible from the outside.

**Good looks like.** `core/document.ts` (types, schema, parse), `core/network.ts`
(joints, fittings, nozzle resolution, tree traversal), `core/solve.ts` (single
and tree facades, re-exports). One-way dependencies, no cycle. The parser stays
the only gate for untrusted documents. This is a refactor of the engine, so do
it last and keep the tests as the oracle.

### F8 · P2 — Content, ordering and lesson text are scattered

**Observed.** The page loads presets and exercises with `import.meta.glob`,
hardcodes practice order and default preset, and owns the "examples vs
practices" split (`+page.svelte:77-86`). `ScenarioPicker.svelte` owns the
per-id descriptions. `lessons.ts` and `exercise-lessons.ts` own prompt text.
`data/presets` and `data/exercises` own the documents. Adding or reordering a
practice touches the page, the picker, the lesson maps, tests and docs.

**Why it hurts.** Content is a product asset, but it is not represented as one
catalog. IDs, order, descriptions and prompts can drift. The exercise documents
are not covered by the "every preset parses and solves" test, which only reads
`data/presets` (`tests/scenario.test.mjs:15`).

**Good looks like.** A `content/catalog` module exports typed `Preset` entries
(`id`, group, order, document, description, optional lesson), validates them
once at startup and owns ordering. The picker and page render the catalog.
Lessons are content data, not logic. Tests iterate over every catalog entry,
including exercises.

### F9 · P2 — The independent rigs use a module-level session hack

**Observed.** `beforeNavigate` snapshots the whole editing session into a
module-scope `workspaceReturn` and the boot effect restores it
(`+page.svelte:14-22,573-606,656-663`). `/hidrante` and `/piscina` are separate
pages with their own local state and duplicate truck/rear-view composition.

**Why it hurts.** The session is not a real object with a lifetime; it exists
only while the JavaScript module stays alive. A reload, a new tab or a
hard navigation loses the return context. Back/forward behaviour is implicit.
The two rigs cannot share session behavior cleanly.

**Good looks like.** A session store owned by a layout or a workspace route
group. The rigs are either modes of the same shell or routes that read the same
session. No module-level mutable state.

### F10 · P1 — The glue has no tests and no typed error model

**Observed.** The engine has 79 passing tests, including every example preset
(`tests/scenario.test.mjs:15`). No test imports any module from `src/lib`.
The untested glue includes `parseDocument`/`withScenario`, `branch-edit`
path mapping, `share` encode/decode, `library` and `apparatus` parsers,
`fire-flow.exerciseReadings`, and the five exercise documents in
`data/exercises`. Errors are a mix of `ScenarioError`, `ShareError`, generic
`Error` and Spanish strings; async state is a mix of booleans, status strings
and notices.

**Why it hurts.** The riskiest code is the code that maps edits between two
representations and parses untrusted links. That is exactly where a wrong
number or a lost assignment will hide. Without a typed error/state model, the
UI cannot consistently distinguish "invalid document", "blocked action",
"solver unavailable" and "storage denied".

**Good looks like.** Unit tests for every pure application module. Boundary
tests extended to the app layers. Typed `Result`/reason codes in application
code; Spanish wording in one presenter. An explicit session state machine
(booting → restoring → ready → saving/failed) instead of separate booleans.

### F11 · P3 — Presentation is repeated and oversized

**Observed.** `Inspector.svelte` (507) composes nozzle, coupling, wye, pump and
line panels; `NozzleCloseUp` is 539; `SavedLays` contains storage CRUD; the
picker contains content descriptions. Some labels and display rules are
repeated across components.

**Why it hurts.** It is not the first problem to fix, but it keeps the page and
canvas changes expensive. These components should become simpler once state,
commands and presenters are extracted.

**Good looks like.** Small panel components selected by a view model; library
CRUD behind a repository; content descriptions in the catalog.

---

## 5. Target architecture

For a local-first engineering simulator, the canonical shape is a **functional
core with an imperative shell**:

- the engineering model is pure and deterministic;
- one versioned document is the only source of truth for the user's work;
- edits are commands, reads are selectors/queries;
- persistence and browser APIs are adapters at the edge;
- presentation formats values and renders view models, never solves.

That is not an academic preference: it is the shape that lets the same engine
run in `node --test`, in this app, and later in `fire-calc`; that keeps links,
files and undo stable; and that lets a phone, a desktop and a future 3D view
read the same document. The four layers below are the smallest version of that
shape that fits this codebase. The reusable code and UI/UX patterns, the
anti-pattern gallery and the decision checklist live in `PATTERNS.md`; this
section defines the target structure they apply to.

### 5.1 Style and the one dependency rule

A **modular monolith with four layers** and a functional core:

```
        presentation (routes, components, presenters)
                 │  may import everything below
                 ▼
        application (session, commands, queries, content)
          │                         ▲
          ▼                         │ implements ports
        core (document, hydraulics, extinguishment)
                                    │
        platform/adapters ──────────┘
        (storage, share, clock, router, download, clipboard)
```

The rule: **dependencies point inward; a lower layer never imports a higher
one.** Concretely:

- `core/` imports only `core/`.
- `app/` imports `core/` and `app/`.
- `platform/` imports `core/`, `app/` port types, and platform APIs (DOM,
  `localStorage`, `CompressionStream`). It never imports Svelte components.
- `ui/` imports all of the above. Nothing below imports `ui/`.
- Only `ui/` and `platform/` may touch the DOM, Svelte runes, `localStorage`,
  clipboard or download APIs.
- No module in `core/` or `app/` may import `$state` or a Svelte file.

This is the same idea already stated in `PLAN-simulador.md` §8 and
`ROADMAP.md` §4–§5, applied consistently to the Svelte app.

### 5.2 Layers and responsibilities

| Layer | Owns | Must not own |
| --- | --- | --- |
| **Core** | Units and conversion factors; laws and constants; catalog/reference data; document schema and parser; line/tree/pump/supply/reach/power solves; extinguishment laws | DOM, Svelte, storage, display units, layout, Spanish UI strings |
| **Application** | Document store and history; session (load, switch, baseline, exercise reveal); commands and reason codes; queries (readings, budget, exercise aggregation, comparison); preset/exercise catalog; ports | Components, `$state`, `localStorage`, formatting with units, literal Spanish wording |
| **Platform** | Storage adapters and migrations; share/link codec; clipboard/download; clock/visibility; service-worker concerns; route adapters | Hydraulic rules, UI layout, screen state |
| **Presentation** | Routes and layout; components; canvas model/camera/gestures/renderers; presenters (formatting, labels, messages); geometry and art; styles; global view preferences | Editing rules, persistence policy, schema parsing, solve orchestration |

### 5.3 Proposed layout

Folders now, packages later. Do not create a workspace yet (`ROADMAP.md` §9).

```
src/
  core/
    units.ts  laws.ts  references.ts  catalog.ts
    document.ts                     # Scenario types, schema, parse
    line.ts  series.ts  tree.ts  pump.ts  supply.ts  tank.ts
    pool.ts  hydrant.ts  jet-draft.ts  drafting.ts
    reach.ts  power.ts  velocity.ts
    fire/                           # extinguishment (or keep top-level)
  app/
    document/                       # AppDocument, migrations, portable form
    session/                        # document store, history, baseline, exercise reveal
    content/                        # preset/exercise catalog, lessons as data
    ports.ts                        # StoragePort, SharePort, ClockPort, ClipboardPort
    features/
      editor/                       # line/tree commands, queries, selection rules
      practice/                     # exercise commands, aggregation, comparison
      library/                      # save/share/import/export orchestration
      trucks/                       # apparatus, discharges, pump/supply commands
      reference/                    # methods, sources, concepts, release notes
      rigs/                         # independent hydrant/pool exercises
  platform/
    storage.ts                      # key registry, typed read/write, migrations
    library.ts  apparatus.ts  prefs.ts  releases.ts
    share.ts  download.ts  clipboard.ts  clock.ts
  ui/
    features/                       # one folder per slice: routes, panels, dialogs
    components/                     # shared primitives: fields, sheets, gauges
    canvas/                         # model.ts, camera.ts, gestures.ts, renderers
    presenters/                     # quantities, labels, messages, view models
    geometry/  art/  styles/
  data/                             # presets, exercises, apparatus, catalog, releases
```

This is a move-and-shim plan, not a rewrite: files keep their content until
the phase that touches them. The layer names are descriptive; if the owner
prefers Spanish folder names, keep them in Spanish. The rule matters more than
the labels.

Commands and queries live with the feature that owns them; they move to a
shared `app` module only when two slices use them. Feature availability is a
composition decision in a small typed manifest (see `PATTERNS.md` §2.3–§2.4),
not an `if` inside a command, a law or a shared component. A slice can be
removed without making old documents unreadable.

### 5.4 State model

Six holders, one lifetime each:

| Holder | Lifetime | Contents | Persisted? |
| --- | --- | --- | --- |
| **DocumentStore** | session | `AppDocument`, revision, undo/redo history | yes, debounced, through `StoragePort` |
| **SessionStore** | session | `base`, `presetId`, load state, exercise reveal, discharge baseline, autosave status | optionally for rig return; not the user's work |
| **ViewState** | session/screen | selection, selected path, sheet, dialogs, pump tab, canvas camera | no |
| **Preferences** | browser | units, control style, gauges, true scale, compare method | yes, separate keys |
| **Runtime** | process | tank clock running, last tick, visibility | no |
| **Derived** | per change | `network`, `lineResult`, `readings`, budget, layout, overlays | never |

The document store is the only source of truth for user work. All edits are
commands over it. Views never mutate it directly. Autosave is a subscriber.
Undo/redo is a memento stack of documents plus the small session context needed
to restore a scenario switch (the current `HistoryEntry` idea, typed and
tested).

### 5.5 Data flow

```
user gesture / form
      │
      ▼
command (app/commands) ──► Result<document, reason>
      │                         │
      ▼                         ▼
DocumentStore ──► autosave port   presenter maps reason → Spanish message
      │
      ├──► query: solve(document, method, path) ──► domain values
      ├──► query: exercise(document, network)   ──► domain values
      └──► presenter: format(values, preferences) ──► view model
                                                        │
                                                        ▼
                                                   components
```

Two rules keep this honest:

1. A command never returns formatted strings or Spanish labels.
2. A component never solves hydraulics; it renders a view model produced by a
   query + presenter pair.

### 5.6 One lay, one line path

Keep the canonical tree and make the line explicit:

```ts
// core/document.ts
export type Scenario = { /* unchanged tree */ };

// core/network.ts
export type LinePath = readonly string[];       // branch ids, root to nozzle
export type LineView = {
  path: LinePath;
  sections: ScenarioSection[];
  nozzle: ScenarioNozzle;
  source: ScenarioSource;
  junctions: JunctionView[];
  counts: number[];                              // sections per segment
};

export function lineAt(scenario: Scenario, path: LinePath): LineView;

// app/commands/line.ts
export function editLine(
  doc: AppDocument,
  path: LinePath,
  edit: (line: LineView) => LineView,
): Result<AppDocument, Reason>;
```

`LineView` is a read-only value, not a `Scenario`. It cannot be confused with
the document. `editLine` knows the path and writes back through one pure tree
function. The canvas receives `LineView` plus results, not a synthetic
scenario. The other lines are `lineAt` for their paths, not cloned scenarios.

This removes `pathView`, `applyPathEdit`, `drawnFrom`, `junctionJoints`,
`treeOf`, `drawnPathOf` and the "edited copy has no junctions" exception. It is
the highest-value refactor in the list and the one that needs the most tests.

### 5.7 Commands and reason codes

`actions.ts` already has the right idea: one registry for every verb, with
applicability, blocked reason and result. Split it into two modules:

- `app/commands.ts`: id, target kinds, `run` returning a new document or a
  `Reason` code, and what should be selected. No Spanish, no units.
- `ui/presenters/actions.ts`: label, short label, grouping (`quick`, `menu`,
  `panel`), and reason-to-Spanish mapping.

Reason codes are a closed union, for example:

```ts
type Reason =
  | { code: "last-hose" }
  | { code: "branch-needs-hose"; line: string }
  | { code: "missing-adapter"; joint: number }
  | { code: "no-rating" }
  | { code: "unsupported-multiple-discharges" };
```

This makes blocked actions testable and keeps wording in one place. It also
lets the future "Diagnose" behavior—the missing-adapter cue from the UX
audit—be a first-class outcome instead of a string.

### 5.8 Persistence and migrations

One adapter, one key registry:

```ts
type StorageKey =
  | "working" | "library" | "apparatus" | "prefs.units"
  | "prefs.controlStyle" | "prefs.compare" | "prefs.gauges"
  | "prefs.hoseScale" | "releases.seen" | "tour.seen";

interface StoragePort {
  read<T>(key: StorageKey, parse: (value: unknown) => T): Result<T | null, StorageError>;
  write<T>(key: StorageKey, value: T): Result<void, StorageError>;
  remove(key: StorageKey): Result<void, StorageError>;
}
```

The adapter owns namespacing, JSON, version fields, migration functions and
error mapping. Repositories (`workingDocument`, `library`, `apparatus`,
`preferences`) use the port. The app sees typed `StorageError` values and can
show one consistent banner. Tests cover migrations and round trips.

### 5.9 Presentation and formatting

- `ui/presenters/quantities.ts`: `p`, `q`, `l` equivalents with the unit
  preference passed in, not read from a singleton.
- `ui/presenters/readings.ts`: labels for reach, endurance, balance, pump
  limits, export targets; pure functions from domain values + formatter.
- `ui/presenters/content.ts`: lesson text with placeholders filled by the
  formatter.
- `ui/presenters/actions.ts`: labels and grouping for the command registry.

This is the same presentation logic the app has now, just moved to the edge so
the application modules become testable and unit-independent.

### 5.10 Content as a catalog

```ts
type PresetEntry = {
  id: string;
  group: "examples" | "practices" | "independent";
  order: number;
  document: AppDocument;
  description: string;
  lesson?: { question: string; action: string };
};
```

The catalog validates every entry at startup, owns ordering and exposes
lookups. The page and picker render it. The picker no longer holds a
`descriptions` map. The "every preset parses and solves" test iterates the
catalog, including `data/exercises`.

### 5.11 Routing and the independent rigs

- A workspace route group or layout owns the session store.
- `/` renders the workspace shell.
- `/hidrante` and `/piscina` are either modes of the same shell or routes that
  read the same session store. No module-level `workspaceReturn`.
- `/acerca-de` stays a static reference page.
- `/boquillas` is a development contact sheet. Keep it out of the production
  navigation, or document it as a dev route (it already is; decide whether it
  ships).

### 5.12 Error model

Four distinct outcomes, never conflated:

| Outcome | Produced by | Presented as |
| --- | --- | --- |
| Invalid document | `core/document.parse` / platform codec | "El escenario no es válido: revisa «path»." |
| Blocked command | `app/commands` reason code | Inline reason beside the action |
| Unavailable solve | engine result state | Pump/line status with cause |
| Storage or platform failure | `StoragePort` / share codec | One banner/toast with a recovery action |

Use discriminated unions (`Result`, reason codes) in application code. Keep
thrown errors for programmer errors only, as the engine already does for
invalid input.

### 5.13 Testing and guardrails

The current test budget is deliberately small: one test per law per source, no
UI tests. Keep that philosophy; add tests where a wrong number or a lost edit
would be invisible:

| Test | Proves |
| --- | --- |
| `tests/core/*` (existing) | Laws, solver, presets, boundaries |
| `tests/app/document.test.mjs` | `AppDocument` parse, exercise validation, assignment pruning, version handling |
| `tests/app/line.test.mjs` | `lineAt` and `editLine` on every branch shape; add/remove hose at a wye; empty outlets |
| `tests/app/commands.test.mjs` | Reason codes and blocked actions; no UI needed |
| `tests/app/queries.test.mjs` | Exercise aggregation, budget lines, pump limits |
| `tests/content/catalog.test.mjs` | Every example and exercise parses, solves, round-trips, has a description and stable id |
| `tests/platform/storage.test.mjs` | Key registry, migrations, denied/quota errors, round trips |
| `tests/platform/share.test.mjs` | Link/text round trip, corrupt fragments, uncompressed fallback |
| `tests/architecture.test.mjs` | Import layers, no `$state` in core/app, no `localStorage` outside platform, file-size budgets |

The architecture test is the cheapest long-term guardrail. It codifies §5.1 so
a future change cannot quietly reintroduce the current coupling.

### 5.14 Right-sizing

| Option | Verdict |
| --- | --- |
| Keep the current structure and add features | Rejected: each feature increases page/canvas coupling; the risk is already visible |
| Redux/global store library | Rejected: one user, one document, no server; Svelte runes + store modules suffice |
| Full DDD / event sourcing | Rejected: commands + document mementos are enough; the domain is deterministic, not event-driven |
| Microfrontends / packages now | Rejected by `ROADMAP.md` §9; revisit when `fire-calc` has a second consumer |
| Four layers, modular monolith, commands + selectors | Recommended: fits the constraints, incremental, testable |

Do not chase architectural purity. The target is: **one owner per state, one
direction per dependency, one representation per lay, one adapter per platform
edge.**

---

## 6. Where a change lands

This table is the practical test of the architecture. Today, "add a feature"
means "find the right combination of page, canvas, engine and content". In the
target, each change has a named home.

| Change | Today | Target |
| --- | --- | --- |
| Add a hydraulic law | `core` only; good | `core` only |
| Add a hose size or nozzle | catalog + references + maybe parser | `core` catalog/references; data if sourced |
| Add an example or practice | `data/*.json` + page order + picker description + lesson map + tests | `data/*.json` + one `content/catalog` entry + catalog test |
| Add a piece to the palette | `pieces.ts` + `edit.ts`/`branch-edit.ts` + `actions.ts` + Canvas + Inspector/PieceStrip labels | `app/commands` + `ui/presenters/actions` + one palette entry + renderer |
| Add a saved field | `Scenario` type + `parseScenario` + edit helper + UI + maybe `AppDocument` | `core/document` + migration + command + presenter; storage format unchanged where possible |
| Change display units | `display-units` + every component; logic modules also import it | `ui/presenters/quantities`; preferences port; no logic changes |
| Add a screen | new route + page state + duplicate session handling | route in `ui/routes` + view model; session from layout |
| Change persistence | one of 7 modules, or the page | one platform adapter + key registry |
| Change a label or reason | `actions.ts`, component, or page string | `ui/presenters` one file |
| Improve the canvas | `Canvas.svelte` (2,460 lines) | `ui/canvas/model`, `camera`, `gestures`, renderers |
| Add a top-down/3D view | not possible without a second canvas | new renderer over the same `LineView` + geometry |

---

## 7. Migration plan

**Principles.** No big-bang rewrite. Each phase is shippable, keeps links and
storage compatible, and is verified with `pnpm test`, `pnpm typecheck`,
`pnpm build`, and 390/1024 screenshots for UI-visible changes. Do not change
hydraulic behaviour during a structural phase. Keep `parseDocument` as the only
gate for untrusted input throughout.

### Phase 0 · Guardrails (≈1 day, low risk)

- Land this document and `PATTERNS.md`; link them from `AGENTS.md` and
  `ROADMAP.md` §9.
- Add `tests/architecture.test.mjs`: import layers, no `$state` in core/app, no
  `localStorage` outside platform, file-size warnings.
- Add `tests/app/document.test.mjs` and extend the preset test to
  `data/exercises` (currently only `data/presets` is covered).
- Establish the baseline metrics in §3.7.

**Acceptance:** existing tests still pass; the new tests fail if a UI module
is imported by core/app or a new storage key bypasses the future adapter.

### Phase 1 · Document and session stores (≈2–4 days, medium)

- Create `app/document/store` and `app/session/store`.
- Move `activeDocument`, `base`, `presetId`, history, burst, undo/redo and
  `workspaceReturn` out of `+page.svelte`.
- Move autosave to a subscriber behind a `StoragePort` (the platform adapter can
  initially wrap the existing `library.ts`).
- Keep the page's props and component APIs unchanged; the page becomes a shell
  that wires the stores.

**Acceptance:** scenario switch/undo/redo/autosave/link load behave exactly as
before; the page shrinks substantially; history is unit-tested.

### Phase 2 · One lay representation (≈4–7 days, high)

- Add `LinePath`, `LineView`, `lineAt` and `editLine` in core/app.
- Convert Canvas, Inspector, BudgetBar and the page to consume `LineView`.
- Delete `pathView`, `applyPathEdit`, `drawnFrom`, `junctionJoints`, `treeOf`
  and the synthetic-scenario construction of `others`.
- Write characterization tests for every branch shape **before** deleting the
  old mapping.

**Acceptance:** every interaction on single, branched and multi-discharge lays
matches the current behaviour at 390 and 1024 px; assignments are preserved or
pruned exactly as now; tests cover add/remove hose at a wye, gate toggles and
empty outlets.

### Phase 3 · Canvas split (≈4–7 days, medium)

- Extract `canvas/model.ts` (layout + overlay boxes), `camera.ts`,
  `gestures.ts`, `interactions.ts`, and small renderers.
- Move stream/reach/particle presentation to a presenter.
- Keep the rendered output identical; screenshot diff at both widths.

**Acceptance:** `Canvas.svelte` under ~900 lines; camera/gesture behaviour
unchanged; the drawing no longer imports the solver or reads display units.

### Phase 4 · Platform adapters (≈2–3 days, low)

- Create the key registry and `StoragePort`.
- Move `library`, `apparatus`, `novedades`, `prefs`, `display-units` storage and
  the page's three view keys behind it.
- Add migrations and typed errors. One banner for storage failure.

**Acceptance:** no `localStorage` outside `platform/`; private-mode and quota
failures show one consistent recovery message; saved data survives the move.

### Phase 5 · Presenters and content (≈2–3 days, low)

- Move formatting/messages/labels to `ui/presenters`.
- Remove `display-units` imports from `actions`, `readings`, `lessons`,
  `exercise-lessons`.
- Introduce the preset/exercise catalog with descriptions and lessons.
- Make the pure application modules importable under `node --test`.

**Acceptance:** unit switches work as before; application tests can run under
plain Node; the picker/page no longer own content ordering or descriptions.

### Phase 6 · Routing and rigs (≈2–3 days, low)

- Move session ownership to a layout/route group.
- Convert `/hidrante` and `/piscina` to read the same session or become modes of
  the shell.
- Remove `workspaceReturn`.

**Acceptance:** returning from a rig restores the session in the same tab and
survives a reload if the session is persisted; no module-level mutable state.

### Phase 7 · Package extraction (later)

- Move `core/` to `packages/fire-calc` only when a second consumer exists
  (`ROADMAP.md` §9). The layer rule makes this a move plus a `package.json`, as
  the original plan intended.

**Parallelization:** Phase 1 and Phase 4 can overlap (store and storage port).
Phase 3 should wait for Phase 2 so the canvas consumes `LineView`, not a moving
target. Phase 5 can overlap with Phase 3. Keep each phase on its own branch and
do not mix hydraulic changes with structural changes.

---

## 8. Decisions needed

These are for the owner; the document recommends, it does not decide.

1. **Adopt the four layers and folder layout?** Recommended. The current engine
   boundary is already the model; this extends it to app/platform/ui.
2. **One document store plus small session/view modules, or one big store?**
   Recommended: one document store, separate session/view stores. Avoid a
   single "god store".
3. **Commands as pure functions over the document?** Recommended. The existing
   `actions.ts` is the seed; split behavior from labels.
4. **Keep runes stores (`$state` classes/modules) or plain pub/sub?**
   Recommended: runes for reactive view state, plain functions for commands.
5. **Are `/hidrante` and `/piscina` modes of the shell, or separate routes?**
   Either works; the requirement is a shared session store, not module state.
6. **Should the exercise guess/reveal travel in the document or the session?**
   Recommended: exercise configuration travels (as today); guesses, reveal and
   baseline stay in the session (as today). Keep that boundary explicit.
7. **Does `/boquillas` ship in production?** It is a development contact sheet;
   decide and document it in the routing map.
8. **Extract `fire-calc` now?** No. Prepare the boundary; extract on a second
   consumer or a measured need.

---

## 9. Review method and limits

**What was done.** Read `AGENTS.md`, `ROADMAP.md`, `MODEL.md`, `UX.md`,
`PLAN-simulador.md`, the UX audit and recent reports. Scanned every source
file for imports, measured LOC and rune usage, built the dependency graph and
cycle list, traced load/edit/solve/save/share/route-return flows, and ran
`pnpm test` (79 passing on 2026-11-26). No hydraulic or visual behaviour was
changed. No profiler was run.

**Limits.** The snapshot has a dirty working tree (41 changed files at the
time of writing), so line numbers and some component sizes will drift. This
review is structural: it does not re-measure runtime performance, compare
against user studies, or certify accessibility. The UI audit covers screen
friction; this document covers where the code and state belong.

**What this review is not.** It is not a demand for a rewrite, not an
endorsement of a framework, and not a claim that the current code is bad. The
engine and the document idea are strong. The recommendation is to let the app
catch up to them.

---

## 10. Appendices

### A · Module inventory (current → target)

| Current | Responsibility | Target |
| --- | --- | --- |
| `hydraulics/units.ts` | Conversions | `core/units` |
| `hydraulics/references.ts` | Sources, hose C, methods, fittings | `core/references` |
| `hydraulics/catalog.ts` | Nozzle catalog | `core/catalog` |
| `hydraulics/laws.ts` | Law descriptors | `core/laws` |
| `hydraulics/line.ts` + `series.ts` | Element laws, series solve | `core/line`, `core/solve` |
| `hydraulics/tree.ts` | Tree solve | `core/tree` |
| `hydraulics/scenario.ts` | Types, parse, joints, nozzle, facade, re-export | split into `core/document`, `core/network`, `core/solve` |
| `hydraulics/pump.ts`, `supply.ts`, `tank.ts`, `pool.ts`, `hydrant.ts`, `jet-draft.ts`, `drafting.ts` | Supply and pump laws | `core/*` |
| `hydraulics/reach.ts`, `power.ts`, `velocity.ts` | Derived physical readings | `core/*` |
| `extinguishment/*` | NFA laws | `core/fire` |
| `lib/document.ts` | `AppDocument`, exercise schema | `app/document` |
| `lib/edit.ts` | Single-line edits | `app/commands/line` |
| `lib/branch-edit.ts` | Tree edits, path flattening, junctions | `app/commands/tree` + `core/network` |
| `lib/actions.ts` | Command registry + labels | `app/commands` + `ui/presenters/actions` |
| `lib/pieces.ts` | Palette placement | `app/commands/place` + `ui/presenters` |
| `lib/fire-flow.ts` | Exercise aggregation | `app/queries/exercise` |
| `lib/readings.ts` | Reading extraction + formatting | `app/queries/readings` + `ui/presenters` |
| `lib/lessons.ts`, `exercise-lessons.ts` | Prompt content | `app/content/lessons` |
| `lib/methods.ts` | Method labels | `ui/presenters` or `core/references` labels |
| `lib/names.ts` | Size/joint names | `ui/presenters/names` |
| `lib/library.ts`, `apparatus.ts` storage parts, `novedades.ts` storage, `prefs.svelte.ts`, page view keys | Browser persistence | `platform/storage` + repositories |
| `lib/share.ts` | Link/text codec | `platform/share` |
| `lib/apparatus.ts` apply part | Truck command | `app/commands/apparatus` |
| `lib/display-units.svelte.ts` | Unit preference + formatting | `ui/presenters/quantities` + `platform/prefs` |
| `lib/selection.ts` | Selection type | `ui/state` (view) |
| `lib/geometry/*` | Pure layout | `ui/geometry` |
| `lib/nozzle-art/*`, `lib/nozzle-anatomy.ts` | Equipment art | `ui/art` |
| `lib/components/*` | Screens | `ui/components/*` |
| `routes/+page.svelte` | Everything | `ui/routes/workspace` + `app/session` |
| `routes/hidrante`, `routes/piscina` | Independent rigs | `ui/routes/rigs` + shared session |
| `routes/acerca-de`, `routes/boquillas` | Reference/contact sheet | `ui/routes/*` |

### B · Dependency rules to enforce

| From | May import |
| --- | --- |
| `core/**` | `core/**` only |
| `app/**` | `core/**`, `app/**` |
| `platform/**` | `core/**`, `app/**` (port types), platform APIs |
| `ui/**` | `core/**`, `app/**`, `platform/**`, `ui/**` |
| `ui/**` | never imported by anything below it |
| `core/**`, `app/**` | no Svelte, no `$state`, no DOM, no `localStorage` |

### C · Browser key registry (target)

| Key | Owner | Migration needed |
| --- | --- | --- |
| `simulador.working.v1` | working document repository | keep v1 or migrate to a single namespace |
| `simulador.library.v1` | library repository | keep; add row version |
| `simulador.apparatus.v1` | apparatus repository | keep |
| `view.units.v1` | preferences | keep |
| `view.controls` | preferences | add version |
| `view.compare` | preferences | add version |
| `view.gauges` | preferences | add version |
| `view.hose-scale` | preferences | add version |
| `novedades.seen.v1` | releases | keep |
| `tour.seen` | onboarding | add version or fold into preferences |

### D · Screen and route map

| Route | Purpose | Session |
| --- | --- | --- |
| `/` | Workspace: canvas, pump panel, inspector, results, practice | owns the session |
| `/hidrante` | Independent hydrant supply comparison | reads/returns the shared session |
| `/piscina` | Independent pool suction comparison | reads/returns the shared session |
| `/acerca-de` | Methods, sources, version | none |
| `/boquillas` | Nozzle-art contact sheet (dev/review) | none |

### E · Test map

| Area | Covered today | Gap |
| --- | --- | --- |
| Laws and solver | `tests/hydraulics`, `series`, `tree`, `pump`, `nozzle`, `power`, `hydrant`, `drafting`, `tank` | — |
| Presets | `tests/scenario.test.mjs:15` parses/round-trips/solves every `data/presets` entry | exercises in `data/exercises` are not iterated |
| Document/exercise | none | `parseDocument`, `withScenario`, exercise validation |
| Line/tree editing | none | `pathView`/`applyPathEdit`, branch edits, assignment pruning |
| Queries | none | exercise aggregation, budget, pump limits |
| Share/persistence | none | codec round trip, migrations, denied/quota |
| Architecture | engine/extinguishment boundaries | app/platform/ui layers, storage rule, file budgets |

### F · Glossary

| Term | Meaning in this app |
| --- | --- |
| **Escenario** | A saved setup: the whole scenario document. The chooser and the share link carry one. |
| **Tendida** | The working lay as a whole: all discharges, hoses, wyes and nozzles. The thing autosave, undo and "Mis líneas" refer to. |
| **Línea** | One pump-to-nozzle path inside a tendida. A branched lay has several. |
| **Tramo / paño** | One hose section. |
| **Descarga** | A pump outlet. |
| **Documento** | `AppDocument`: the scenario plus optional exercise. The only thing links and files carry. |
| **Sesión** | Ephemeral editing context: baseline, history, selection, reveal, clock. Not shared. |
| **Preferencia** | Per-browser view choice: units, control style, gauges, scale, compare. Not part of the document. |
| **Derivado** | Anything solved or laid out from the document; never persisted. |

### G · Evidence index

Key source locations used by the findings:

| Topic | Location |
| --- | --- |
| Page as application layer | `src/routes/+page.svelte` (state, apply, autosave, route return) |
| Canvas responsibilities | `src/lib/components/Canvas.svelte` (props, camera, gestures, stream physics, overlays) |
| Flattened line + WeakMaps | `src/lib/branch-edit.ts:300-404` |
| Synthetic other lines | `src/routes/+page.svelte:387-398` |
| Display units in logic | `src/lib/actions.ts:1`, `readings.ts:3`, `lessons.ts:1`, `exercise-lessons.ts:2` |
| Storage keys | `src/lib/library.ts:3-4`, `apparatus.ts:20`, `novedades.ts:17`, `prefs.svelte.ts:6`, `Tour.svelte:2`, `+page.svelte:419-442` |
| Engine cycle | `src/hydraulics/scenario.ts:542`, `tree.ts:2` |
| Intended layering | `docs/PLAN-simulador.md` §8, `docs/ROADMAP.md` §4–§5, `AGENTS.md` |
| Test coverage | `tests/`; `tests/scenario.test.mjs:15`; `tests/boundaries.test.mjs` |
| Screen-level review | `docs/UX-AUDIT.md`, `reports/ux-review-2026-11-13/REVIEW.md` |

---

*End of review. Keep the engine; give the rest of the app the same clarity.*
