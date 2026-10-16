# UX and visual design

> 2026-10-15. How the app should behave and look. Every screen follows this
> document; a change to it is a design decision, recorded here first. Written
> after the owner's tests of the first two screens (ROADMAP §10b).

## 1. Principles

1. **Operate equipment like equipment.** A nozzle has a bale you flick, a
   gallonage ring you turn, a pattern collar. A pump has a panel. Never a
   checkbox or a bare form for an equipment state.
2. **Every number three ways:** type it, step it (± buttons), or drag it
   on the canvas where that makes sense. Typed values are exact; drags snap.
3. **The canvas never moves on its own.** Scales are fixed; only the person
   pans or zooms (§2).
4. **Mobile first.** Works from 360 px wide; touch targets at least 44 px;
   no hover-only information; one-finger pan, pinch to zoom.
5. **Immediate feedback.** Every edit re-solves and redraws within a frame.
   Gauges and streams ease to new values (about 250 ms); nothing jumps.
6. **Honest picture.** Exaggerations are fixed and labelled (§2). Anything
   illustrative rather than computed says so.
7. **Spanish UI**, CGBVP terms (pitón, tramo, paño, bifurca, desnivel).

## 2. The canvas

- **World coordinates in metres.** Horizontal is real horizontal distance;
  vertical is height. A hose is drawn at its true length: a section spans
  its horizontal run and its rise, and if the hose is longer than the
  straight line between its couplings, the slack is drawn as a sag
  (owner, 2026-10-16; replaces "horizontal = distance along the hose").
- **One uniform scale, no exaggeration.** 14 px per metre at zoom 1 in both
  directions, so lengths look like lengths.
- **The canvas fits the lay** (owner, 2026-10-16; replaces "the
  scale never changes on its own" and "bounds grow, never shrink"). The
  world is the lay plus margins, recomputed on every edit; the zoom fits
  its width (or its height, if that is smaller). Auto-fit goes down to 12 % so a long lay always fits without
  a scrollbar; − / + range 10 %–300 % (owner, 2026-10-14: zooming out must
  be possible).
  The canvas takes the height the window has (owner, 2026-10-14: "height was
  my gripe"; replaces sizing it to the lay): the window height minus about
  240 px of page above it when side by side, 55 % of the window on a phone, 260 px
  at least. The lay sits on the ground at the bottom and the rest is
  building: floor bands continue up, and a coupling or the nozzle can be
  dragged to any visible floor. The height does not change with the lay, so
  nothing jumps when editing. Floor labels
  hide when floors are under 20 px apart.
- **Slack is always visible.** A hose in the air sags; slack on the floor
  (it cannot hang) is drawn piled in arches along the chord, taller when the
  chord is short. Drawing only; the label says "holgura x m".
  During a drag the world and zoom are frozen (refitting under the pointer
  would move the target) and refit on release. − / + set a manual zoom;
  "Ajustar" returns to automatic.
- **Use the screen.** The page grows to 2000 px wide (the canvas takes the
  width the side column leaves); the fit zoom goes up to 220 %; the world is
  the lay plus margins (12 m before the truck, 16 m after the nozzle for its
  stream), 50 m wide at least. The first fit is measured on mount, not
  assumed.
- **Constant-size overlays.** Labels, handles and the nozzle keep their
  screen size at any zoom; hoses and the engine scale with the world.
  Gauges shrink with the zoom below 80 %, down to 75 % of their size (owner,
  2026-10-15: at a fitted phone zoom full-size gauges covered the truck).
- **Controls below the drawing,** never over it: zoom readout,
  − / + / Ajustar.
- **Tap vs drag.** A press that moves less than 6 px is a tap: it selects
  (on the nozzle it also works the bale, open/shut; on a coupling it opens
  that joint's fittings; the hose itself opens the hose toolbar). More is a
  drag.
- **On-canvas editing.** Tapping a hose shows a small toolbar on the canvas
  with the hose sizes and −15 / +15 m. Tapping the engine selects the pump:
  its discharge outlet size (1½, 2½, 3″ or "same as the hose"); a different
  outlet size needs an adapter (MODEL.md §3.10; ROADMAP §11, decisions 5–6).
- **Fittings (owner 2026-10-15).** Tapping a coupling (or the small ring at
  the pump outlet) opens a toolbar on the canvas, mirrored in the inspector,
  with that joint's adapter (named reducción/ampliación by direction, with
  the sizes) and an in-line valve. The nozzle joint is edited in the nozzle's
  inspector panel. Fittings are drawn
  at the joint in their own colour and move with it. An adapter is only
  offered where coupling sizes differ. No loose items and no toolbox drag for
  now. **Accesorios automáticos** (a switch in the Línea section, §4; on by default):
  on, every mismatch gets an adapter, drawn dashed and not removable while the
  switch is on; off, adapters are placed by hand (turning it off keeps the
  ones it had derived), and a mismatch without one shows a red "!" at the
  joint, a "Falta adaptador" button under the canvas, and "Línea sin
  conectar" on the pump header: no water flows until it is placed. Fitting
  losses get their own segment and legend line in the pressure split, with
  the CGBVP value beside "sin dato". Under `us-training` the 350 gpm step will
  be labelled.
- **Selecting and deselecting (owner, 2026-10-16).** The app opens with
  nothing selected. A tap selects; tapping what is already selected keeps
  it. Nothing selected again: tap or click empty canvas, Esc, or the **×**
  on the selection panel and on the floating toolbars. On a phone,
  deselecting also closes the sheet. With nothing selected the panel's
  body shows Línea and "Partes", the line's parts (pump, each hose and
  coupling, nozzle) as buttons, for discovery and the keyboard.
- **Building the line (owner, 2026-10-15).** Hoses are added, split, joined
  and removed on the canvas; nothing needs the inspector:
  - **Context menu:** right click, or a press held still for 0.5 s on touch,
    on a hose (insert before / after, split in two, join with the next, lock
    or unlock its length, remove), a coupling (insert a hose here, join the
    two hoses), the nozzle (open/shut, add a hose at the end), the engine or
    pump outlet (insert at the outlet, apply the required pressure), or empty
    canvas (add at the end, fit the view). The press that opens it already
    selects, so no entry only selects. The press is not also a tap.
  - **Every menu entry is in the selection panel too** (§10.5), since nobody
    discovers a long press; the common ones are also on the floating
    toolbar. A hint under the canvas names the menu.
  - **Edits keep the drawing still:** an inserted hose copies its neighbour,
    level and taut, so nothing else moves; a split meets halfway up the rise;
    a join takes the upstream hose's size and the combined length; a removed
    hose closes the gap (everything downstream drops by its rise). The
    nozzle keeps its fittings through all of them.
  - **Undo / redo** in the header ("↶ Deshacer", "↷ Rehacer"; Ctrl+Z,
    Ctrl+Shift+Z or Ctrl+Y). A drag or a burst of typing in one field is one
    step. Loading a preset clears the history.
  - **The engine solves one line**, so the only things to add are hoses,
    fittings and the nozzle. Wyes, second lines and a toolbox to drag pieces
    from wait for branching (ROADMAP §10c); no piece is offered that the
    solver can't compute.
- **Length lock, per hose** (owner, 2026-10-14; replaces the global
  "Largo fijo / Libre" toggle under the canvas). Each hose has its own lock,
  a button on its on-canvas toolbar, with a 🔒/🔓 on its label. Locked is the
  default (scenario `lengthFree` absent) and is stored with the hose. Dragging
  a coupling applies the lock of the hose that ends at it:
  - **Locked (tether):** the hose length is fixed. The coupling moves within
    the hose's reach and the hose sags if there is slack; dragged beyond
    reach it stops at the tether; a rise can't exceed the hose length. A taut
    hose stays taut when its height is edited (it slides along its reach).
  - **Unlocked (free):** the coupling goes where it's dragged and the hose
    resizes to span the gap, taut (length rounded up to 0.5 m).
  Either way, everything downstream moves with the dragged coupling (later
  sections keep their own run and rise). Snaps: run 0.5 m, height 0.5 m,
  magnetic to floor lines. A live label shows the values while dragging;
  drags start only on handles; dragging empty canvas pans. The horizontal
  run is drawing data only: the hydraulics use length and height (MODEL.md
  §3.2).
- **The pressure split follows you.** The canvas fills the window, which pushes
  the "¿En qué se gasta la presión de la bomba?" bar below the fold. While that
  bar is less than half in view, a slim copy floats at the bottom of the window
  (pump pressure, the split bar); the full bar with its legend stays below.
- **Floors** are bands labelled "Piso 1, 2…" with their height in metres.
  Floor height defaults to 3 m and is editable.

## 3. Equipment and controls

- **Hose:** thickness proportional to diameter; couplings drawn as rings at
  each joint; an adapter at a joint where the coupling size changes (a
  fitting object, see §2 "Fittings"); length and size labelled on the hose.
- **Gauges:** real dials: ticks every 50 psi, numbers, needle, and the
  reading below. Same component everywhere (pump, couplings, nozzle).
- **Nozzle:** drawn as a combination or smooth-bore nozzle, with its
  controls on the drawing and mirrored in the inspector:
  - **Bale:** a lever. Flick or drag it between shut and open, or tap it.
    Partial opening is not modelled until a valve law with a source exists
    (MODEL.md).
  - **Gallonage ring** (selectable nozzles): the actual settings as
    segments.
  - **Pattern collar:** straight stream ↔ wide fog. Drawn on the stream.
  - **Stream:** grows and collapses with the flow; shape follows the
    pattern.
- **Pump header:** discharge gauge, pressure (typed, ±), the "apply
  required pressure" control, and the flow, large, always in view (§4).
  The outlets are the pump's detail; truck, governor and tank join it with
  M3 (ROADMAP §6).
- **Controls:** no unstyled browser defaults in the main UI. Segmented
  controls for small choice sets, ± steppers for numbers, sheets or side
  panels for inspectors.

## 4. Layout

| Width | Pump header | Canvas | Panel body (selection, Línea) | Results and formulas |
|---|---|---|---|---|
| ≥ 1024 px | atop the right panel, stuck while it scrolls | left, the rest of the width | right panel, 360 px | below canvas, collapsible |
| 600–1023 px | bar above the canvas | full width | below canvas | below the panel |
| < 600 px | one-row strip (pressure ±, Req., flow); tapping the flow selects the pump | full width, the rest of the screen; the page does not scroll (§8) | bottom sheet that slides up on selection (§8.2) | in the sheet, collapsible |

**One panel (owner, 2026-10-16).** The matrix in §10 is the screen's
schema: every row has **one home** in the panel, and every other place a
control appears (floating toolbar, context menu) is a shortcut to that home
(§10.5). Two panels, a fold and a floating pump card were tried the same day
and dropped: the pump was edited in two places and line settings in three.

- **One side panel, on the right**, the convention for a properties panel
  (Figma, CAD, EPANET) and closest to the hoses being edited. Left is a
  one-line grid change; the walkthrough and the tests with firefighters
  ask which side they look to.
- **Header: the pump**, always in view, because discharge pressure is the
  control a lay is set with. Gauge, pressure, "Req." (apply required),
  flow and the state. Tablets put it above the canvas, phones as the strip;
  the body goes below the canvas or in the sheet.
- **Body: what is selected.** Nothing: **Línea** (name, method, compare,
  floor height, add a hose at the end, automatic fittings) and the parts
  list. The truck or the pump outlet: the pump's detail (Descargas: outlet
  size, fittings; Camión, Control and Abastecimiento with M3). A hose, a
  coupling, the nozzle: its editor, with × back to Línea.
- **Under the canvas:** view only (zoom, Vista). **Header of the page:**
  undo, scenario, ⋯.
- The panel is never hidden, so selecting does not resize and refit the
  canvas; it stays in view while the results scroll.
- Layout follows media queries, not `innerWidth`: a phone can report its
  980 px layout width while loading and never send a resize.

## 5. Visual style

- Design tokens on `:root` (colour, radius, spacing, type), light and dark.
- Palette: neutral greys; water blue for water and flow; fire-red for the
  pump and hose; a single accent for selection; red only for warnings.
- Typography: system UI font; tabular figures for every number.
- Diagrams are flat and technical, not skeuomorphic: clean shapes, a few
  well-chosen details (coupling rings, bale lever), no gradients or textures.

## 6. Approved design

**Main screen, approved by the owner 2026-10-15:**
`design/main-screen.html` (static mock-up, open in a browser) and its
renders `design/main-screen-desktop.png`, `design/main-screen-phone.png`.
The app is built to it; departures need a revised, approved mock-up. Its
nozzle settings (30/60/95/125 gpm) are generic placeholders.

**Awaiting approval (2026-10-14):** `design/nozzle-stream-menu.html` and
its renders: nozzle panel with a model card and a picker list (no
drop-down) grouped by coupling fit; an aimable stream drawn in metres with
a labelled illustrative reach; the context menu it proposed is built
(owner, 2026-10-15; §2 "Building the line").

**Built without a mock-up (owner, 2026-10-15):** a "Conceptos" card below the
results (static pressure, flowing pressure, exit pressure, flow, hose speed,
jet speed, the manufacturer's rating, "presión requerida"), each with this
line's own numbers (MODEL §3.13). A settings comparison table and chart are
not built yet.

## 7. Process

- **No mock-ups unless the owner asks for one** (owner, 2026-10-15): build
  directly and show the result.
- **Before handing back UI work:** check it in a browser at 390 px and
  1024 px wide, and send a screenshot.

## 8. Actions and how each is reached (owner, 2026-10-15)

The owner's phone test (2026-10-15) found mobile unusable: holding to drag
scrolled the page, the canvas could not be navigated, and the pump gauge was
hidden. Measured at 390 px: the page was 2032 px tall and the canvas let the
browser scroll it (`touch-action: auto`); auto-fit drew the lay at 29 % in
the bottom of a 422 px canvas, with the pump gauge over the truck and clipped
by the canvas edge. The cause is structural, so this section fixes the rules
first and lists every action against them. Owner's choices: on a phone the
page does not scroll and a bottom sheet holds everything but the pump strip
and the canvas; the sheet replaces the floating toolbars on phones; the
welcome tour is interactive.

### 8.1 Gesture rules

| Gesture | Desktop | Phone / tablet |
|---|---|---|
| Pan | drag empty canvas or a hose; wheel / trackpad | one finger on empty canvas or a hose; two fingers |
| Zoom | Ctrl + wheel, pinch on trackpad, − / + | pinch (two fingers pan and zoom together), − / + |
| Fit | "Ajustar" | "Ajustar", double tap on empty canvas |
| Select | click | tap (moves < 6 px) |
| Move a coupling or the nozzle | drag its handle | drag its handle, at once (no hold) |
| More actions | right click | hold 0.5 s without moving |

- **On a phone the canvas owns every touch inside it.** The page never
  scrolls from the canvas; pan and pinch are the canvas's own (pointer
  events, `touch-action: none`), not the browser's scroll.
- **On a phone the page does not scroll at all** (§4's layout, now
  required): the pump strip at the top, the canvas filling the rest, and a
  bottom sheet over it. Everything else lives in the sheet.
- **Fit shows the whole lay, truck and nozzle included,** and a lay wider
  than the canvas starts at the truck. A canvas taller than the lay adds
  building above and ground below in equal parts, so the lay sits in the
  middle, not at the foot. Detail is reached by pinching, not by a
  minimum zoom.
- **Gauges never cover the equipment.** The pump's gauge sits above the
  truck; the pump's pressure also stays in the top strip.

### 8.2 The bottom sheet (phone)

Three heights: **closed** (a handle and one line: flow, nozzle pressure),
**peek** (the selected element's main controls), **full** (inspector,
pressure split, calculation, concepts). Tapping an element opens it at peek;
tapping empty canvas closes it and clears the selection (§2). On phones it replaces the floating
on-canvas toolbars, which cover a small canvas.

### 8.3 Every action

"Canvas" = on the drawing; "toolbar" = the floating bar by the element
(desktop and tablet) or the sheet at peek (phone); "menu" = §8.1's more
actions; "inspector" = the side column (desktop) or the sheet at full.

| Area | Action | Desktop | Phone |
|---|---|---|---|
| Navigate | pan, zoom, fit | §8.1 | §8.1 |
| Line | add a hose at the end | toolbar of the nozzle, menu on empty canvas, button | sheet |
| | insert a hose here | hose / coupling toolbar, menu | sheet at peek, menu |
| | split, join, remove | hose / coupling toolbar, menu | sheet at peek, menu |
| | hose size, length (±15 m, typed) | hose toolbar; inspector | sheet at peek |
| | length lock | hose toolbar, menu | sheet at peek |
| | move a coupling (run, height) | drag; arrow keys; typed in inspector | drag; typed in sheet |
| Fittings | adapter, valve at a joint | coupling toolbar | sheet at peek |
| | Accesorios automáticos | panel, Línea | sheet, Línea |
| Nozzle | open / shut the bale | tap the nozzle | tap the nozzle |
| | model, gallonage, pattern, typed rating | inspector | sheet at peek |
| Pump | pressure (typed, ±) | panel header | top strip |
| | apply required pressure | panel header ("Req.") | top strip ("Req.") |
| | discharge outlet size | tap the engine → panel body | tap the engine or the strip's flow → sheet |
| Scenario | load a preset | header | header menu |
| | undo, redo | header; Ctrl+Z, Ctrl+Shift+Z | header icons |
| Read | gauges, flow, pressure split | canvas, panel, floating bar | canvas, top strip, sheet |
| | calculation, concepts | below the canvas | sheet, full |
| Help | welcome tour, again | "?" in the header | "?" in the header |

### 8.4 Welcome tour

First visit only (remembered per browser), skippable, and reopened from
"?". Each step points at the real element on the screen and, where it asks
for an action, moves on when the person does it:

1. "Esta es una línea: bomba → mangueras → pitón."
2. Pump strip: "La presión de la bomba. Súbela o bájala."
3. Nozzle: "Toca el pitón para abrirlo." (advances on open)
4. A coupling: "Arrastra el acople a otro piso." (advances on a move)
5. A hose: "Toca una manguera para cambiarla; mantén pulsado para más."
6. Pressure split: "En qué se gasta la presión: fricción, altura, pitón."

### 8.5 Order of work

1. Phone layout without page scroll, canvas gestures, fit (§8.1).
2. Bottom sheet replacing the toolbars on phones (§8.2).
3. Welcome tour (§8.4).

## 9. Top tasks (owner, 2026-10-15)

What people come to do. Every screen decision is checked against these; the
object × action matrix and the phone walkthrough (next) are built from them.
A task whose law is not built yet waits for its milestone.

| # | Who | Task | Needs |
|---|---|---|---|
| 1 | Instructor | Show that a 1½″ line loses far more pressure than a 2½″ at the same flow | built |
| 2 | Instructor | Show that more flow costs pressure: turn the gallonage ring, watch friction | built |
| 3 | Pump operator | Find and apply the pump pressure for an attack line to the 3rd floor | built |
| 4 | Firefighter | Build a station maniobra from scratch: pump, 2 × 2½″, reducer, 1½″, nozzle | built |
| 5 | Instructor | Explain why the nozzle gets less than its rating when pump pressure is short | built |
| 6 | Anyone | Change one thing (a hose size, a length, a floor) and see its effect on flow | built |
| 7 | Instructor | Compare the physical result with the CGBVP 2019 figure and where they differ | method selector |
| 8 | Anyone | Fix a mistake: remove a hose, undo | built |
| 9 | Instructor | Send a lay to a student so they open exactly that line | share link (M1) |
| 10 | Firefighter | Same flow with a smooth bore vs a fog nozzle | M2 |
| 11 | Instructor | Swap smooth-bore tips (⅞″, 15/16″, 1″, 1⅛″) and see flow grow with the tip's square and the pump pressure each demands; tips worked like stacked tips, tapped to change | M2: `nozzle.smooth-bore` (Freeman) in MODEL.md first; smooth-bore rows in the catalog |

## 10. Patterns, objects and actions (owner, 2026-10-16: approved; the ◻ items are part of the polish)

Built from the top tasks (§9). Every action belongs to one pattern; a new
feature picks a pattern rather than inventing an interaction. §8 says where
each surface lives on desktop and phone.

### 10.1 Patterns

| Pattern | What it is | Rule |
|---|---|---|
| **Select** | tap / click an element | shows its controls; never changes the line |
| **Direct manipulation** | drag a coupling or the nozzle; flick the bale | for geometry and equipment states only; snaps; typed value always available too |
| **Quick actions** | the selected element's common edits: floating toolbar (desktop, tablet), sheet at peek (phone) | at most one row of choices plus one of actions |
| **More actions** | right-click / long-press menu | a shortcut, never the only way to an action |
| **Inspect** | read-only detail of something solved (flow, a gauge, a hose's loss) | never offers an edit for a solved quantity; says why |
| **View** | how the canvas looks: zoom, fit, gauges shown, hose scale | changes no number; remembered per browser |
| **Global** | header: preset, undo / redo, help | the same everywhere |

### 10.2 Matrix

✅ built · ◻ missing, polish (§10c) · ⏳ later, with its milestone · ✕ not
allowed, with the reason.

| Object | Create / add | Edit | Move | Remove | Inspect | Other |
|---|---|---|---|---|---|---|
| **Scenario** | preset ✅; blank line ✅ ("Línea nueva", header ⋯) | rename ✅ (Línea) | — | reset to preset ✅ (header ⋯, undoable) | — | share link ⏳ (deferred); cloud save ⏳ (paid) |
| **Method** | clone a built-in ⏳ | edit a clone ⏳; built-ins ✕ (read-only) | — | delete a clone ⏳ | sources ✅ ("Fuentes" card) | pick "Método" ✅; "Comparar con" ✅ (Línea; per browser, off when equal to Método) |
| **Pump** | ✕ (a line needs a source) | pressure ✅, apply required ✅, outlet size ✅; spec ⏳ M3 | ✕ | ✕ | flow, state ✅ | — |
| **Truck** | ⏳ M3 | discharges open / shut, tank ⏳ M3; partial valves ⏳ (`valve.partial`) | ✕ | ✕ | capacity ⏳ M3 | — |
| **Hose** | insert, split ✅ | size, length, lock ✅ | its couplings move it | remove, join ✅ | its friction loss ✅ (panel) | true-scale thickness ✅ (Vista; default exaggerated, badge "grosor ×11") |
| **Coupling** | with a hose ✅ | fittings ✅ | drag ✅ | join the two hoses ✅ | pressure here, lost before it ✅ (tap its gauge) | — |
| **Fitting** | adapter, valve ✅ | ✕ (a kind has one loss) | moves with its coupling | ✅ | its loss and basis ✅ | auto fittings switch ✅ |
| **Nozzle** | ✕ (a line ends in one) | bale ✅, model ✅ (chips at the top of its panel), ring ✅, typed rating ✅; smooth-bore tips ⏳ M2 | drag ✅ | ✕ | rating vs actual ✅ (mark on its gauge, warning in its panel under 95 %) | — |
| **Stream** | — | pattern ✅; aim ⏳ M2 | — | — | jet speed ✅; reach ⏳ M2 (illustrative) | — |
| **Water flow** | — | ✕: flow is solved, the app's core lesson; "I want X gpm" is target planning ⏳ | — | — | flow ✅, hose speed ✅, where the pressure went ✅ | — |
| **Gauge** | — | — | — | hide ✅ (Vista) | tap: reading, loss before it ✅ | — |
| **Building** | — | floor height ✅ (Línea, 2–6 m) | — | — | — | obstacles, routes ⏳ (ROADMAP §10b) |
| **Fire** | ⏳ M5 | fire size ⏳ M5 | — | — | required vs delivered flow ⏳ M5 (NFA first) | — |
| **Canvas view** | — | pan, zoom, fit ✅; zoom to selection ✅ (Vista) | — | — | — | — |
| **History** | — | undo, redo ✅ | — | — | — | — |
| **Help** | — | — | — | — | tour ◻ (§8.4) | — |

### 10.3 Phone walkthrough of the built tasks

Each task on a 390 px phone, against the current build. At every step: would
they know what to do, would they see how, would they understand the result?

| Task | Where it breaks | Fix |
|---|---|---|
| T1 1½″ vs 2½″ | Tapping a hose opens the sheet at peek, which can hide that hose; comparing means remembering the first number | ✅ The canvas scrolls the selection above the sheet (its stage grows by the covered height); A/B compare is M2 |
| T2 gallonage ring | **Tapping the nozzle to select it also works the bale**, so looking at the ring shuts the line (0 gpm) | ✅ Tapping the nozzle only selects; the bale lever is its own target, drawn above the handle |
| T3 3rd floor | At a fitted zoom floors are 12 px apart and their labels hide; the drag label says "9 m", not the floor | ✅ The drag label names the floor ("piso 3 · 9 m", "sobre piso 1 · 3.5 m"); the typed "± piso" stays |
| T4 build a maniobra | No blank line, so you start from a preset and edit; the nozzle model sits under "Ajustes avanzados" | "Línea nueva" in the header menu; model chips at the top of the nozzle's sheet |
| T5 nozzle under its rating | The rating vs the actual pressure is only in the Conceptos card (sheet, full) | A rated-pressure mark on the nozzle's gauge, and a one-line note when it falls short |
| T6 change one thing | Works; each change shows in the strip and the closed sheet's split bar | — |
| T7 vs CGBVP | Only the table in "Ver cálculo" (sheet, full); no method switch | "Método" / "Comparar con" (§10.2) |
| T8 remove, undo | Works: sheet "Quitar tramo" or long press; undo in the header | — |

### 10.4 Order (proposal)

1. ✅ T2 bale target, T3 floor in the drag label, selection kept above the
   sheet: the walkthrough's breaks (2026-10-16).
2. ✅ Missing ◻ in the matrix that the tasks need: method picker and compare
   toggle, blank line, nozzle model quick pick, gauge tap and hide, rated
   mark on the nozzle gauge (2026-10-16).
3. ✅ The rest of ◻: floor height, reset, rename, zoom to selection,
   true-scale toggle, Fuentes (2026-10-16). Left: the welcome tour (§8.4),
   after the polish.

**Where the new controls live (2026-10-16).** Global (header ⋯): "Línea
nueva", "Reiniciar escenario". Línea section: name, Método, Comparar con,
floor height, add a hose at the end, automatic fittings. View ("Vista" under
the canvas): zoom to the selection, gauges on/off, true hose thickness;
remembered per browser. Inspect: tap a gauge for its reading (pressure here,
the drop from the previous gauge, that hose's friction; the nozzle's rating),
× or a new selection closes it; the gauges sit under the nozzle so the bale
keeps its tap.
4. ✅ `src/lib/actions.ts` (2026-10-16, §10.5).

### 10.5 One list of actions (owner, 2026-10-16)

Every verb on screen is one entry in `src/lib/actions.ts` (the command
pattern): id, label, a shorter toolbar label, what it applies to (hose,
coupling, nozzle, pump, the whole line), whether it is on the toolbar or in
the menu, why it is blocked, and what it does (an edit, what to select
afterwards, or a view change). The menu, the floating toolbar (the sheet at
peek) and the selection panel draw from it; the page runs every action the
same way: one undo step, then the selection it names. Rules:

1. **Selecting never edits.** A tap selects; changing anything takes its
   own control (the bale, a button).
2. **One wording per action, everywhere.** The toolbar may shorten it
   ("+ Tramo" for "Insertar tramo después"), never rename it.
3. **The panel has everything.** It draws every action for its target; the
   menu and the toolbar are shortcuts. An action the panel already offers as
   a field (the bale lever, the length lock, "Aplicar requerida") is not
   repeated there as a button.
4. **The toolbar is short:** at most 4 actions per target (a dev-time check).
5. **Removing is red, last and undoable.**
6. **A blocked action stays visible,** disabled, with its reason: beside it
   in the panel, as a second line in the menu, as a tooltip on the toolbar.
7. **Fields are not actions.** Hose size, length, heights, pressure, nozzle
   ring and pattern stay controls drawn by their panel.

Joint 0 (the pump outlet) takes the pump's actions. A new feature adds
entries here rather than buttons in components.
