# Patterns and practices

> **Foundation v1, 2026-11-26.** Normative for new code and for any module or
> screen you touch. This is the direction the project was missing; amend it
> deliberately, not by accident. `ARCHITECTURE.md` describes the current state
> and the migration; `UX.md` owns screen behaviour; `MODEL.md` owns the laws.
> If this document disagrees with `MODEL.md` on hydraulics, `MODEL.md` wins.
> If it disagrees with `UX.md` on a screen, `UX.md` wins for that screen.

This is a catalog of the patterns the app should follow, the anti-patterns it
has already accumulated, and a checklist for deciding where a change belongs.
It is written to be used: read the section that matches your change, follow the
rule, and use the anti-pattern list as a review checklist.

---

## 1. How to use this document

- **New code follows these rules.** Old code moves one step toward them when
  touched; do not add a new violation because an old one exists.
- **Rules are "must" unless marked "should".** A justified exception is written
  in the change description, not left implicit.
- **One change, one pattern.** If a change needs two patterns, it is probably
  two changes.
- **Name the home before writing code.** A feature must answer: which layer,
  which state holder, which document field, which UI pattern, which test, which
  doc.

---

## 2. Architecture patterns

"Dependency layers" is the name used here for four groups of modules with a
one-way import rule: **core → app → platform/adapters → presentation**. It is
not a framework, a library, or a standard number of folders; the rule is the
point. It is a small, concrete form of the better-known functional-core /
ports-and-adapters ideas.

| Pattern | Rule | Where it applies | Seed in the current code |
| --- | --- | --- | --- |
| **Functional core, imperative shell** | Pure engineering decisions; impure browser decisions at the edge. The core returns values; the shell decides when to call it, store it or draw it. | Engine, document, commands, queries | `src/hydraulics/`, `src/extinguishment/`, `geometry/` |
| **Dependency layers** | `core → app → platform/adapters → presentation`; lower never imports higher. | Every module | `tests/boundaries.test.mjs` (engine only today) |
| **Ports and adapters** | Application code depends on small interfaces (`StoragePort`, `SharePort`, `ClockPort`, `ClipboardPort`); platform modules implement them. | Persistence, share links, clock, download, clipboard | `library.ts`, `share.ts`, `novedades.ts` (symptoms to formalize) |
| **Document store + commands + selectors** | One `AppDocument` is the source of truth. Edits are commands returning a new document + reason. Reads are selectors/queries. Views never mutate. | Session, editing, results | `apply`/`applyDocument` in `+page.svelte`; `actions.ts` as a command seed |
| **Memento, not event sourcing** | Undo stores document snapshots plus the small session context needed to restore a switch. Do not build an event log for a local single-user app. | History | `HistoryEntry` in `+page.svelte` |
| **Explicit session machine** | Booting → restoring → ready → saving → saved/failed are states, not a pile of booleans. | Load, autosave, share, route return | `storageReady`, `autoSaveEnabled`, `saveStatus` today |
| **One canonical model + explicit projections** | The scenario tree is the only lay. A line, a reading, a canvas layout and a budget are explicit projections, never fake `Scenario` objects. | Tree/path, canvas, results | `branch.pathView` is the counter-example |
| **Content as data/catalog** | Presets, exercises, apparatus, lessons and descriptions are data with ids, order and validation. UI renders them; it does not own them. | Chooser, lessons, apparatus | `data/*.json`; ordering/descriptions split today |
| **Feature slices** | A feature is a vertical unit with its commands, queries, entry points and UI. Slices do not import each other's internals; shared behavior moves to `app` or `ui` primitives. | Editor, practice, library/share, trucks/supply, reference | Current page/canvas mix all of them |
| **Feature availability** | Availability is a composition decision (manifest/route/nav), not an `if` scattered through logic. Disabled features stay out of navigation and commands; documents remain readable. | Dev/unfinished modules, optional rigs, editions | Only ad-hoc view preferences today |
| **Composition root** | Routes/layout wire stores, adapters and components. They are the only place allowed to know all layers. | `+layout`, `+page`, route entries | `+page.svelte` (overloaded today) |
| **Presenter / view model** | Formatting, labels and reason-to-Spanish mapping live at the UI edge. Domain values and reason codes stay unformatted inside. | Readings, actions, messages | `readings.ts` mixed with `u`; `actions.ts` labels mixed with commands |
| **Pure geometry** | Positions, paths, camera fit and overlay boxes are functions of inputs, not component state. | Canvas, world, exercise | `geometry/world.ts` is the good seed |
| **Anti-corruption layer** | Every untrusted document (preset, link, file, paste, storage) passes one parser; inside the app the type is trusted. | `parseDocument`, share codec, storage | `parseDocument` is the good seed |
| **Architecture tests** | Import rules, storage rules, no `$state` in core/app, file budgets. A rule that is not tested will be broken. | CI/tests | `boundaries.test.mjs` (extend it) |

### 2.1 The dependency rule, concretely

```
core/        imports core/
app/         imports core/, app/
platform/    imports core/, app/ port types, platform APIs
ui/          imports core/, app/, platform/, ui/
```

- Only `ui/` and `platform/` may touch the DOM, Svelte runes, `localStorage`,
  clipboard or download APIs.
- `core/` and `app/` may not import Svelte or use `$state`.
- A component may call a **read-only** engine helper (for example a reach or
  velocity function) to draw; it may not solve, edit or persist.
- If a lower layer needs something from a higher layer, that is a missing port or
  a misplaced responsibility, not an import.

### 2.2 The state rule, concretely

Six holders, one lifetime each:

| Holder | Owns | Never owns |
| --- | --- | --- |
| **Document** | `AppDocument`: scenario + exercise | selection, camera, units, autosave status |
| **Session** | baseline, preset id, history, exercise reveal, discharge baseline, load/save state | the user's saved work |
| **View** | selection, selected path, sheet, dialogs, pump tab, camera | document facts |
| **Preferences** | units, control style, gauges, true scale, compare method | anything that changes hydraulics or the document |
| **Runtime** | tank clock, elapsed time, visibility | persisted state |
| **Derived** | solve results, readings, layout, overlays | persistence |

The document is the only thing a link, file or saved copy carries. Preferences
persist separately. View state is ephemeral. Derived state is recomputed.

### 2.3 Feature slices

Layers answer "may this module import that one?". Slices answer "where does
this feature live?". Both are needed.

A feature slice is a vertical unit inside `app/` and `ui/`. Starting set:

| Slice | Owns |
| --- | --- |
| `editor` | Line/tree edits, selection, canvas interaction, inspector |
| `practice` | Exercise attach/reveal/aggregate, discharge comparison |
| `library` | Working autosave, saved copies, import/export, share |
| `trucks` | Apparatus profiles, discharges, pump curve, supply |
| `reference` | Methods, sources, concepts, about, release notes |
| `rigs` | Independent hydrant/pool exercises (optional slice) |

Each slice exports its commands/queries, its routes or entry points, its UI and
its tests. Shared behavior belongs to `core`, `app/document`, `app/session`,
`app/ports`, `app/content` or `ui` primitives.

Rules:

- A slice may import shared app/core/ui primitives; it does not import another
  slice's internals. If two slices need each other, either they are one slice or
  the shared part is missing.
- A feature's document fields are optional and schema-versioned. Turning a
  feature off must not make an old or shared document unreadable.
- A feature's UI entry point is registered once, in the composition root. No
  deep `if (feature)` checks in shared components.
- Deleting a slice is a realistic goal: after removal, the remaining app still
  parses and solves old documents, with a clear "not available" if one uses the
  removed capability.

### 2.4 Feature availability

"Turn a feature on/off" is not one thing. Separate four kinds:

| Kind | What it means | Where it lives | Example |
| --- | --- | --- | --- |
| **Availability** | The code is built or loaded | build config / manifest | An unfinished aerial module, the dev contact sheet |
| **Preference** | The user can show/hide a view | preferences | Gauges, true scale, control style |
| **Capability** | The document contains data for it | document schema | Attached exercise, truck profile, method |
| **Entitlement** | Who is allowed to use it | distribution/auth | A paid or institutional edition (not now) |

Rules:

- **Availability is decided at composition points**: routes, navigation,
  command registration, slice mounting. Not inside core/app logic.
- **Disabled does not mean unreadable.** The parser keeps accepting the
  document's fields; if the UI is off and the document uses the capability,
  show a clear notice and keep the rest of the tendida usable.
- **Preferences are presentation only.** They never change hydraulics, the
  document or saved work.
- **Capabilities are versioned document data.** New fields are optional with
  defaults; a change of meaning gets a version and a migration.
- **Entitlements are not enforceable in a public static bundle.** If a feature
  must be sold or restricted, build separate variants or gate distribution; do
  not rely on a hidden local flag.
- **Keep the manifest small and typed.** Every flag has an owner, a default and
  a removal condition. No nested flags. No flag inside a hydraulic law.
- **Test the off state**: navigation, deep links, a document that uses the
  capability, and storage that must not be deleted.

For this app, build-time availability is the right tool for unfinished/dev
modules; runtime preferences are enough for view options; document capabilities
cover exercises, methods and truck profiles. Do not build a generic flag
framework until a real second need (an edition, a licensed module) appears.

---

## 3. State and data rules

### 3.1 Documents

- The document stores **hydraulic facts**, not layout, camera, units or
  preferences. Moving something on screen never changes the hydraulics.
- A new optional field with a default is the preferred evolution. A change of
  meaning bumps `version` and gets one migration, because links already sent
  must keep opening.
- Parse once at the boundary. Inside the app, treat the document as valid.
- `parseDocument` / `parseScenario` is the only gate. No component invents a
  partial document or trusts a raw object from storage.
- Keep values, not references: a section stores its own diameter and C; a
  catalog id is provenance only.
- Flow is a solved output, never an input. A target flow is a planning quantity
  that rides the pressure budget; it never enters the forward solve.

### 3.2 Canonical model and projections

- One scenario tree. A line is `LinePath` + `LineView`, not a synthetic
  `Scenario`.
- No `WeakMap` or object identity to recover a parent, a path or a junction.
  If a projection needs context, pass it explicitly.
- A projection is read-only. Edits go through one command that takes the path
  explicitly and returns a new document.
- Derived values are recomputed, never cached as a second source of truth.
  If a cache is needed, it is keyed by document revision and is disposable.

### 3.3 Errors are a taxonomy, not a string

Four outcomes, four treatments:

| Outcome | Producer | UI treatment |
| --- | --- | --- |
| **Invalid document** | parser / share codec / storage | "No es un escenario válido: revisa «path»." Never partially load. |
| **Blocked action** | command | Disabled action with the reason beside it; never disappear silently. |
| **Unavailable solve** | engine result | Status/cause at the pump, line or element; not a bare dash. |
| **Platform failure** | storage, clipboard, download | One banner/toast with a recovery action (export, retry, continue). |

- Application code returns discriminated results and reason codes.
- Thrown errors are for programmer errors (`RangeError` in the engine), not for
  expected user outcomes.
- Do not `catch {}` an expected failure without a visible consequence.

### 3.4 Naming and units

- Internal units are station units: metres, inches, psi, US gpm. Other units are
  display-only, converted at the UI edge.
- Name values with their unit when ambiguity is possible: `pressurePsi`,
  `flowGpm`, `lengthM`, `diameterIn`, `endElevationM`, `floorHeightM`.
- Conversion factors live in `hydraulics/units.ts` only.
- A published constant defined in feet converts inside the law that uses it.
- Rounding is display-only; typed values stay exact.

### 3.5 Persistence

- One browser key registry; one storage adapter; per-key version and migration.
- No `localStorage` in components or routes once the adapter exists.
- Repositories own meaning (`working`, `library`, `apparatus`, `preferences`);
  the adapter owns encoding.
- Autosave is a subscriber to the document store, debounced, with visible
  saving/saved/failed status.
- Storage denial is a first-class state, not a silent fallback.

---

## 4. Code best practices

### 4.1 TypeScript

- `strict` is on; do not widen with `any`. Prefer `unknown` at boundaries and
  parse it.
- Prefer discriminated unions for states and outcomes over optional fields and
  stringly-typed modes.
- Make illegal states unrepresentable: an open end has no tip; a blocked action
  carries a reason; a line view carries its path.
- Use named types for domain concepts; avoid bare `string[]` when the strings
  are a path, an id or a name.
- No non-null assertion unless the invariant is local and obvious; prefer a
  guard.
- Avoid `as` casts at boundaries; parsing is the cast.

### 4.2 Functions and modules

- Pure functions over shared mutable state.
- Immutable updates; never mutate a document, view or result in place.
- One responsibility per module. One reason to change per module.
- Keep modules small enough to read in one sitting. Suggested budget:
  **~400 lines** for logic modules, **~600 lines** for components; plan a split
  before exceeding it. `Canvas.svelte` and `+page.svelte` are the current
  exceptions to shrink, not the precedent.
- No barrel files that hide the dependency graph; import the concrete module.
- Prefer explicit imports over globals and singletons. A singleton is justified
  only for a true browser preference, and then it lives in the UI/platform edge.
- Comments explain **why**, not what the code says.

### 4.3 Svelte 5

- Runes only: `$state`, `$derived`, `$effect`, `$props`. No stores, no
  `export let`, no `$:`.
- One owner for each `$state`. Pass values down; send events/commands up.
- `$derived` for computed values; `$effect` only for external synchronisation
  (DOM, storage, timers, browser events). Never use an effect as business logic
  or to derive one state from another.
- `$state.raw` for immutable documents and large structures that are replaced,
  not mutated.
- Keep component props small and typed. A component with dozens of props is a
  signal that a view model or a different boundary is missing.
- A component does not call `fetch`, `localStorage`, `document.cookie` or a
  network API directly.

### 4.4 Performance

- The solve is cheap; do not optimise it before measuring.
- Recompute derived values from revision-keyed inputs; avoid deep copies in hot
  loops.
- Keep vector work in pure geometry; keep frame loops in small components or
  outside the framework (as the particle code does).
- Measure before adding a cache, a worker or a library.

### 4.5 Security and honesty

- Untrusted input only through the parser.
- No source maps in production (`vite.config.ts` already enforces this).
- No secrets in the client; the app is static and public by construction.
- An illustrative value says so; an unvalidated value says so. Never present a
  model output as operational truth.
- Respect `prefers-reduced-motion`; motion confirms a change, never replaces it.

### 4.6 Testing

- Test the pure seam, not the screen. A law, a parser, a command, a codec or a
  path mapping is testable; a layout is looked at.
- One test per law per source, against a published table or hand arithmetic.
  Do not repeat a proof another test already makes.
- Every preset and exercise parses, round-trips and solves. The exercise
  documents count as presets.
- Every untrusted boundary has a corrupt-input test: bad schema, bad version,
  bad path, bad storage row.
- Every transformation that can lose an edit or a number has a test: assignment
  pruning, path mapping, undo context, share codec.
- Architecture rules are tested (`tests/architecture.test.mjs`), because a rule
  that is not tested is a suggestion.
- No UI tests, no geometry pixel tests, no crash tests. Those are visible in the
  browser; the screenshot check is the acceptance.

---

## 5. UI interaction patterns

`UX.md` §10.1 already names the approved patterns. This section adds the rules
that keep them from drifting.

| Pattern | Rule | Anti-pattern |
| --- | --- | --- |
| **Select ≠ operate** | A tap/click selects. Changing a state takes its own control (bale, gate, field). | Tapping a nozzle also shuts the line. |
| **Direct manipulation** | Drag geometry and equip state; snap; always offer typed/step. | Drag is the only way to set a value. |
| **Every number three ways** | Type it, step it (+, −), drag it where it makes sense. | A read-only gauge with no way to set the target. |
| **Quick actions** | At most one short row per target (4 actions max). | A toolbar that becomes a second menu. |
| **More actions** | Right-click/long-press is a shortcut, never the only path. | Removing an action from the panel and leaving it only in the context menu. |
| **Panel completeness** | The panel has every action for its target except placing/removing a piece. | A setting reachable only from a different screen. |
| **Operate + plain controls** | Both ways complete; the preference switches, it does not remove function. | Drawn control only, or plain control only. |
| **Close-up** | One piece at a time, real controls, return to the same selection. | A modal stack that hides the canvas and the way back. |
| **Choose** | Show identity + one distinguishing fact; current choice visible without opening. | A list of near-identical names with no consequence. |
| **View** | Changes no number; remembered per browser. | A view toggle that edits the document or adds undo. |
| **Compare** | Both sides same shape; differences marked, not narrated. | Comparing a solved value with a rating as if they were the same kind. |
| **Motion** | Confirms a change; 150–250 ms; off under reduced motion. | Motion that implies a behaviour the model does not have. |
| **Diagnose** | Say what, where and the next action, at the element. | A silent zero, a bare dash, or a fix hidden in Ajustes. |

### 5.1 Controls

- Touch targets ≥ 44 px; no hover-only information.
- Focus is visible and follows a logical order; every action has a keyboard path.
- A control's label says what it does, not what it is. "Cerrar pitón", not
  "Estado".
- Disabled is last resort: prefer a visible blocked action with a reason.
- Destructive actions are red, last and undoable; confirmation only when undo
  is impossible.
- One modal at a time. No modal on top of a modal. Escape and the close control
  always work and return focus.
- On phones the sheet is the inspector; on desktop the side panel. Do not build
  a third pattern for tablets.

### 5.2 Readings and numbers

- **Scope every number.** A gpm must say whether it is the pump total, a
  discharge, a nozzle, an NFA sum or a rating. Never show two unlabelled gpm
  side by side.
- One primary number per surface; secondary numbers are smaller and labelled.
- Distinguish **rating / actual / reference / prediction**. They are not
  interchangeable.
- A missing value is `—` plus a cause, not `0`. Zero means zero.
- Units are visible at the point of reading; converted values say so where the
  source unit matters.
- Apply the reading hierarchy: total → line → element → explanation. A user
  should be able to name which number they are looking at.

### 5.3 State feedback

- Every asynchronous or persistence state has a visible status: restoring,
  saving, saved, failed, offline.
- Saving failure includes the recovery action (export, retry, keep editing).
- Empty states explain why and offer the next action, not just "no data".
- Loading never flashes the wrong document; restore/share/first-visit are
  explicit outcomes.
- A blocked action stays visible with its reason; it does not disappear.

### 5.4 Responsive

- Phone: the page does not scroll; the canvas owns touches; the sheet holds the
  inspector, results and practice.
- Landscape and short viewports get a scrollable side panel, not a squeezed
  portrait layout.
- Check 390 px and 1024 px for every UI change, plus landscape when the sheet is
  involved.
- Preserve the target sizes and reading order; do not hide a primary action
  behind a scroll on one layout only.

---

## 6. UX flow patterns

### 6.1 Navigation: load vs. act

Two surfaces, two jobs. Do not merge them into one menu.

| Intent | Surface | Examples |
| --- | --- | --- |
| **Load/create** | Scenario chooser | Examples, guided practices, saved tendidas, blank tendida, independent rigs |
| **Act on the current work** | Current-tendida menu | Save a copy, copy link, export/import, reset, autosave status |

- The chooser is the only place to load or create. Saved copies belong there,
  not only under a separate "Mis líneas".
- The current-work menu acts only on what is open. It does not list other
  scenarios.
- `Cambiar escenario` (choose) and `Mi tendida` (act) are different verbs; the
  labels should say so.
- Use **tendida** for the whole working lay and **línea** for one
  pump-to-nozzle path. Do not call a whole tendida a "línea".

### 6.2 Saved work vs. autosave

- Autosave is a property of the current tendida, shown in the current-work
  surface.
- "Guardar copia" creates a new named record; it does not update an earlier
  copy.
- The library holds whole tendidas, not single lines.
- A shared link is a snapshot. Later edits need a new link.
- Recovery is explicit: undo for edits, reset for the loaded baseline, reopen
  for a saved copy, import for a backup.

### 6.3 Teaching loop

Use one loop for presets, practices and explanations:

1. **Question/prediction** — what do you expect?
2. **Action** — one controlled change, everything else held constant.
3. **Observation** — read the numbers and the drawing.
4. **Explanation** — the formula or the source, after the observation.

Rules:

- One exercise changes one variable; say what stays fixed.
- The reference (NFA, rating, CGBVP figure) is visually distinct from the
  solved delivery.
- A prediction is not a hydraulic input; guesses and reveal state stay in the
  session.
- Do not narrate the result before the user can see it.
- The practice dialog keeps the exercise name and its consequence visible.

### 6.4 Supply and multi-variable changes

- A source change that installs a pump is a second variable. Show the resulting
  configuration before applying, or offer a clear way back.
- Prefer one undoable change over a silent combined change.
- In a before/after guide, use undo or reopen the baseline; do not ask the user
  to remember the first state.

### 6.5 Errors and recovery

- Diagnose at the element first, then in the results, then in a global notice.
- The recovery action is in the same place as the problem, not only in Ajustes.
- An error that loses work is a P0 UX bug.
- Never tell the user to use a control that does not exist there.

---

## 7. Content and teaching patterns

- Content is data: a preset or exercise is a validated document plus metadata
  (id, group, order, description, lesson).
- Adding content does not require editing a component. If it does, the catalog
  is missing.
- Descriptions state the **consequence**, not the topic: "Abre una tendida
  nueva", "Usa tu tendida actual", "Abre otra página".
- Lessons are prompts, not scripts. They say what to change, what to hold and
  what to look at.
- Lessons never present a model result as an operational answer; label the
  teaching model.
- Reference tables and art are not runtime inputs unless the engine explicitly
  compiles a verified subset.

---

## 8. Anti-pattern gallery

These are the mistakes the codebase has made; use them as review cues.

| Anti-pattern | Why it hurts | Current example |
| --- | --- | --- |
| **The page as application layer** | Every feature touches one file; no tests | `+page.svelte` owns load/save/history/clock/share/view |
| **Fake model objects for views** | Identity carries semantics; copies lose context | `branch.pathView` returns a synthetic `Scenario`; `WeakMap`s recover the tree |
| **State by lifetime in one pile** | No authority; reload/undo/autosave drift | document + history + prefs + clock + view all in the page |
| **A menu as a junk drawer** | Users cannot predict where a thing lives | scenario menu once held presets, saves, files, help |
| **Two entry points, two consequences** | The same word does different things | practice chooser loads a lay, opens a page or attaches to the current lay |
| **Formatting inside logic** | Logic becomes untestable and unit-dependent | `actions.ts`, `readings.ts`, `lessons.ts` import `display-units` |
| **Storage in components** | No migrations, inconsistent failures | `SavedLays`, `Tour`, `+page` keys |
| **Hidden auto-correction** | The user cannot explain the result | automatic adapters are fine only when visible; a silent source pump change is not |
| **Silent zero or bare dash** | Hides a diagnosable cause | blocked pump/line states |
| **Instructions pointing elsewhere** | Dead end or broken line | Settings says «Piezas» for an adapter that lives on the coupling |
| **Menu-only actions** | Inaccessible and undiscoverable | a destructive or primary action only in a context menu |
| **Effect as business logic** | Re-entrancy, races, invisible dependencies | page effects mixing autosave, link load and restore |
| **Module-level routing state** | Lost on reload; hidden coupling | `workspaceReturn` |
| **A component with 30+ props** | The boundary is wrong | `Canvas.svelte` |
| **A new key or pattern per feature** | No registry, no migration, no review | ten browser keys in seven modules |

---

## 9. Decision checklist

Before writing code, answer these on the change itself (commit message, PR
description or an issue):

1. **Layer** — core, app, platform or ui? Which module owns it?
2. **State** — document, session, view, preferences, runtime or derived? Who
   owns it and what is its lifetime?
3. **Document** — does it change the scenario document? If so: optional field
   with default, or version + migration?
4. **Pattern** — which UI pattern from §5 (or `UX.md` §10.1) does it use? Is it
   a new pattern? If yes, write it here first.
5. **Slice and availability** — which feature slice owns it? Can it be off?
   If yes: where is the composition switch, and what happens to a document that
   already uses it?
6. **Truth** — is there one source of truth? Does it duplicate a value that
   already exists?
7. **Errors** — which of the four outcomes can happen, and what does the user
   see and do?
8. **Tests** — which pure seam proves it? If none, why not?
9. **Docs** — which of `MODEL.md`, `UX.md`, `ARCHITECTURE.md`, `PATTERNS.md`
   records the decision?
10. **Screens** — 390 px and 1024 px checked? Landscape if the sheet is involved?
11. **Recovery** — can the user undo, reset, reopen or export after this change?

### Definition of done

For code that ships:

- [ ] Fits a layer and a state holder; no new upward dependency.
- [ ] Belongs to one feature slice; shared code is justified by a second user.
- [ ] One source of truth; no new hidden identity or duplicated state.
- [ ] Parses untrusted input at the boundary.
- [ ] Errors are one of the four outcomes; no silent failure.
- [ ] If the feature can be off: the off state is tested and old documents
      still open.
- [ ] Pure logic has a test; UI does not get a test it cannot justify.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build` pass.
- [ ] UI: screenshots at 390 and 1024 px; keyboard path; empty/blocked/error
      states inspected.
- [ ] Docs updated where the decision lives.
- [ ] No new browser key, storage write, or pattern without a named owner.

---

## 10. Relationship to the other documents

| Document | Owns |
| --- | --- |
| `MODEL.md` | Laws, constants, units, sources, status |
| `UX.md` | Screen layout, gestures, actions, visual behaviour |
| `ARCHITECTURE.md` | Current state, target layers, state ownership, migration |
| `PATTERNS.md` (this) | Reusable patterns, rules, anti-patterns, checklists |
| `AGENTS.md` | Non-negotiables for agents; pointers to the above |
| `ROADMAP.md` | Product shape, milestones, decisions |

If a pattern here becomes a product decision, record it in `ROADMAP.md` or
`UX.md`, not only here. If a migration step changes the layers, update
`ARCHITECTURE.md` in the same change.
