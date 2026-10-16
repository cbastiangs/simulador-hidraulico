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
  name every 1st, 2nd, 5th, 10th… floor, whichever keeps two labels at
  least 22 px apart (owner, 2026-10-16; replaces hiding them all under
  20 px, which left a phone with none); "Planta baja" is always named.
  **The labels are a height axis** (owner, 2026-10-16: gauges and labels
  fought for the same spot): pinned to the view's left edge so they stay
  while panning, never hidden for a gauge, drawn over the drawing with a
  halo. **Gauges float above them**, lifted by a shadow, their reading
  haloed.
- **Slack is always visible.** A hose in the air sags; slack on the floor
  (it cannot hang) is drawn piled in arches along the chord, taller when the
  chord is short. Drawing only; the label says "holgura x m".
  During a drag the world and zoom are frozen (refitting under the pointer
  would move the target) and refit on release. − / + set a manual zoom;
  "Ver todo" shows the whole lay.
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
  the sizes). **No in-line valve toggle** (owner, 2026-10-16): an
  always-open valve only adds loss, and a valve is a kind of coupling, to be
  chosen as one when a coupling picker exists; a document that already has
  one can still remove it, and the engine keeps the fitting. **A coupling is
  named by what it is** (owner, 2026-10-16) — "Reducción 2½″ → 1½″",
  "Ampliación …", "Válvula 2½″", or a plain "Acople 2½″" — in the parts
  list, the panel, the menu, the gauge readings and the calculation
  (`src/lib/names.ts`). The nozzle joint is edited in the nozzle's
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
- **Pump header:** discharge gauge, pressure (typed, ±), **"Ajustar"**,
  **"Ralentí"** and the flow, large, always in view (§4). "Ajustar" sets the
  discharge to the required pressure: what the pump needs for the nozzle to
  get its rated pressure (nozzle + friction + elevation + fittings, under
  the chosen method); its tooltip says so ("Req." was cryptic). "Ralentí"
  (owner, 2026-10-16) is the kill: red, undoable, 0 psi today because the
  pump is an ideal pressure source; with the governor's RPM mode (M3) it
  sets the lowest RPM and the pump curve gives the pressure. On a phone the
  strip is a summary (pressure ±, Ajustar, flow); selecting the pump opens
  its whole control in the sheet (large gauge, ±1 and ±10, Ajustar,
  Ralentí, flow) above its detail.
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
  control a lay is set with. Gauge, pressure, "Ajustar", "Ralentí",
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
| Pan | drag empty canvas or a hose; trackpad swipe; Shift + wheel | one finger on empty canvas or a hose; two fingers |
| Zoom | mouse wheel (around the pointer), pinch on trackpad, − / + | pinch (two fingers pan and zoom together), − / + |
| Whole lay | "Ver todo" | "Ver todo", double tap on empty canvas |
| Select | click | tap (moves < 6 px) |
| Move a coupling or the nozzle | drag its handle | drag its handle, at once (no hold) |
| More actions | right click | hold 0.5 s without moving |

- **On a phone the canvas owns every touch inside it.** The page never
  scrolls from the canvas; pan and pinch are the canvas's own (pointer
  events, `touch-action: none`), not the browser's scroll.
- **On a phone the page does not scroll at all** (§4's layout, now
  required): the pump strip at the top, the canvas filling the rest, and a
  bottom sheet over it. Everything else lives in the sheet.
- **The start view names every floor** (owner, 2026-10-16; replaces "fit
  shows the whole lay", which opened a phone at 29 %, a floor 18 px tall):
  the automatic zoom is the whole-lay fit or the zoom at which floors are
  24 px apart, whichever is closer. It opens at the truck with the ground at
  the foot; the rest of a long lay is a pan away. **"Ver todo"** (and a
  double tap) shows the whole lay, truck and nozzle included, however small;
  the badge says "todo". A canvas taller than the lay adds building above
  only, so the ground stays at the foot (owner, 2026-10-16: the floor line
  sat in the middle of the screen; replaces "equal parts").
- **Free movement and a lockable camera** (owner, 2026-10-16). No native
  scrolling and no scroll bars: the canvas is a camera over the world. Drag
  empty canvas (or a hose), a trackpad swipe or Shift + wheel to pan; the
  mouse wheel zooms around the pointer, like a map (owner, 2026-10-16), and
  so does a pinch. A trackpad is told from a wheel by sideways motion or
  fine steps. The camera may leave the world, but 48 px of it always
  stays in view. **Lock** (button, or Y) keeps the camera on the selection,
  or on the truck when nothing is selected, like a game's locked camera;
  any manual pan unlocks. A new lay returns to the start view; "Ver todo"
  and a double tap to the whole lay.
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
| Fittings | adapter at a joint | coupling toolbar | sheet at peek |
| | Accesorios automáticos | panel, Línea | sheet, Línea |
| Nozzle | open / shut the bale | tap the nozzle | tap the nozzle |
| | model, gallonage, pattern, typed rating | inspector | sheet at peek |
| Pump | pressure (typed, ±) | panel header | top strip |
| | apply required pressure ("Ajustar"), idle ("Ralentí") | panel header | top strip: Ajustar; sheet (pump selected): both |
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

**Proposed additions (2026-10-16, for the owner to confirm).** The owner's
target features — a realistic pump panel with animated push-pull discharges,
an enlarged nozzle panel with an animated gallonage ring and pattern collar,
a full truck-specs editor, and preset trucks with pump and discharge
diameters — are the patterns below applied to equipment, not new objects.
The gap they expose is **fidelity and motion**, not reach.

| Pattern | What it is | Rule |
|---|---|---|
| **Operate** | work a piece of equipment: the bale, a discharge's push-pull valve, the gallonage ring, the pattern collar, the governor | the piece is drawn as equipment, never a checkbox; the control's own motion confirms the actuation (≈150–250 ms); a typed/± value sits beside it |
| **Close-up** | an enlarged, realistic view of one piece (the nozzle, the pump) where its Operating controls live | entered from the element; draws the real thing large; one piece at a time; returns to the canvas (a sheet on a phone, a panel or modal when wide) |
| **Configure** | edit a data definition: a truck's pump, discharges and diameters; a cloned method; a catalog row | built-ins are read-only, cloned to edit; saved as data (a truck file), not scenario state; never silently changes an open scenario |
| **Choose** | pick a named item: a truck, a preset, a nozzle model, a method | show its identity and the one fact that tells it apart (e.g. "3″ (2½″)"); the current choice is visible without opening the picker |
| **Compare** | two states side by side (A/B): a method, a nozzle kind, before/after | both sides draw the same document shape; differences are marked, not narrated |
| **Motion** | how a change is shown moving: needles, ring, stream, valve | motion confirms what a person changed; water is the one thing that may move on its own; off under `prefers-reduced-motion` |
| **Diagnose** | why the result is blocked or zero: a missing adapter, a pump that can't reach a height, a closed line | say what and where, at the element and in the result; never silently show zero or a bare error |

### 10.2 Matrix

✅ built · ◻ missing, polish (§10c) · ⏳ later, with its milestone · ✕ not
allowed, with the reason.

| Object | Create / add | Edit | Move | Remove | Inspect | Other |
|---|---|---|---|---|---|---|
| **Scenario** | preset ✅; blank line ✅ ("Línea nueva", header ⋯) | rename ✅ (Línea) | — | reset to preset ✅ (header ⋯, undoable) | — | share link ⏳ (deferred); cloud save ⏳ (paid) |
| **Method** | clone a built-in ⏳ | edit a clone ⏳; built-ins ✕ (read-only) | — | delete a clone ⏳ | sources ✅ ("Fuentes" card) | pick "Método" ✅; "Comparar con" ✅ (Línea; per browser, off when equal to Método) |
| **Pump** | ✕ (a line needs a source) | pressure ✅, apply required ✅, outlet size ✅; spec ⏳ M3 | ✕ | ✕ | flow, state ✅ | — |
| **Truck** | choose a truck file / preset ⏳ M3; clone a built-in ⏳ M3 | discharges open / shut, tank ⏳ M3; partial valves ⏳ (`valve.partial`); **specs editor** (pump, discharge sizes and diameters) ⏳ M3 | ✕ | ✕ | capacity ⏳ M3 | presets carry pump and discharge diameters ⏳ M3 |
| **Hose** | insert, split ✅ | size, length, lock ✅ | its couplings move it | remove, join ✅ | its friction loss ✅ (panel) | true-scale thickness ✅ (Vista; default exaggerated, badge "grosor ×11") |
| **Coupling** | with a hose ✅ | fittings ✅ | drag ✅; first-drag camera stability ✅ (§10.8) | join the two hoses ✅ | pressure here, lost before it ✅ (tap its gauge) | — |
| **Fitting** | adapter ✅; valve: engine only, no toggle (a coupling kind later) | ✕ (a kind has one loss) | moves with its coupling | ✅ | its loss and basis ✅ | auto fittings switch ✅ |
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

> **Historical (2026-10-16).** This walkthrough recorded the first pass over
> the built tasks and its fixes were applied (§10.4). It is kept as history.
> The latest review of the current build is §10.7.

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

### 10.6 Where the target features land (owner, 2026-10-16)

The owner's read: "we have most of it, but UX and aesthetics is where we are
falling short." The features named live in the proposed patterns (§10.1):

- **Realistic pump panel** (gauges, push-pull discharge valves, animated):
  **Close-up** + **Operate**, on the pump panel's `ROADMAP` §6 sections.
- **Nozzle panel as a modal** with the nozzle drawn as in real life, an
  animated gallonage ring, an animated pattern collar and open/close: a
  **Close-up** whose controls are **Operate**. The bale's own motion is the
  confirmation (the existing `Tween`s are the seed).
- **Full truck-specs editor** and **preset trucks** with pump and discharge
  diameters: **Configure** and **Choose** (`ROADMAP` §6, M3).
- **Left-click action menu: not added (owner, 2026-10-16).** It would
  duplicate the panel, which already carries every action (§10.5 rule 3);
  right-click / long-press is the shortcut. A primary-button menu on an
  element would also collide with "Selecting never edits". Revisit only if a
  target's actions outgrow the panel.
- **Search / filter:** only when a list (trucks, catalog) is long; not yet.

**Principle recorded:** equipment realism and motion are first-class, not
decoration — but every motion must reflect a real state. An animated control
that implies a behaviour the model does not have is worse than a plain one
(the guardrail of `compatibility-vs-physics.md`, applied to the screen).

### 10.7 Current-build UX review (2026-10-16)

> **Status: review; the fixes below are proposed and not implemented, and the
> §10.1 additions remain unapproved.** Records what the current build does and
> what to change.

**Method.** A fresh external production build (with current uncommitted canvas/geometry
work) walked in Chromium 153 headless at 390×844 touch
emulation and 1024×768 desktop, plus 360×780 responsive, dark,
`prefers-reduced-motion` and keyboard checks. Not a real-phone study. Snapshot
app JS `_app/immutable/nodes/2.CgWPKC2r.js`; `pnpm test` 37 pass, `pnpm typecheck`
0 errors/warnings, `pnpm build` pass; product `src` matches the snapshot, no
UI/engine/test edits.

**Observed working.** T1 hose diameter changes updated friction/flow. T2
nozzle selection kept the open state; ring 125 gave 117.4 gpm/88.2 psi with a
clear under-rating warning; pattern changed spray without moving 95 gpm. T3
typed height 9 m + required 152.8 psi delivered 125 gpm; nozzle touch-drag
6→9 m worked (nozzle/typed success, distinct from the coupling-drag regression
UX-01). T4 built 3 sections (2×2½″ then 1½″) with 1 auto adapter. T7
comparison 95.1 vs 93.0 gpm, required 131.6 vs 137.1 psi, reachable. T8
remove+undo restored 2. Pan/pinch/fit and long-press worked; no page-scroll
escape; console error log empty.

| ID | Priority | Observed | Proposed polish |
|---|---|---|---|
| UX-01 | P1 | Fresh 390 preset *Ataque*: first coupling at 0 m moved up 12.2 px (~3 m at 0.29037 zoom) over 12 touchmove events; a 267.8 px camera jump at drag start; final height −3 m, opposite the intent. Canvas auto-centering runs after `onSelect` on drag start. | Suspend centering while pressing/dragging; keep world/zoom/camera stable through the gesture, refit after release; any explicit camera lock must be deliberate. First priority; not a law defect. |
| UX-02 | P1 | At 390 "+" ends x208.6, "Req." starts x199.7 (8.9 px overlap). At 360 the strip is 364.6 px in 344 px so flow clips; 95→117 gpm wraps the unit and grows the strip ~20 px, moving the canvas; 152.8 is not fully visible. | Reserve stable space for whole values, non-wrapping flow/unit, 44 px targets; constrain at 360/390 without shrinking targets. No extra controls. |
| UX-03 | P1 | At 390 the nozzle ring (y814–858) is partly below 844 and the pattern (y896–928) fully below; model picker and bale take the first screen; "Ver todo" at y1840, after inspector+results. | Operating controls (bale/ring/pattern) before model/configuration, visible at peek; expand/collapse in a persistent header; advanced settings/fittings/formulas secondary. Current laws; no partial-valve work. |
| UX-04 | P1 | At default fit the first ground coupling centre (y674.9) is only 11.9 px above the scroller bottom (686.8), so hose labels +22 px and the 22 px handle radius clip; "Bomba", "Planta baja" and hose text overlap. | Constant-screen overlay insets/layers; avoid collisions. Keep ground-at-foot and free camera, not a forced centered scene. |
| UX-05 | P2 | At 1024 the selected first-hose toolbar sits at x−21.6, width 427; first diameter chips clip at x12; selecting a low hose shifts the world and exposes a large empty rectangle. | Clamp the toolbar to the visible canvas; minimize auto-centering to real occlusion; keep background continuity on pan. Free manual camera stays allowed. |
| UX-06 | P2 | 12 px white text contrast: light-theme nozzle blue 4.20:1 / orange 2.48:1; dark-theme nozzle blue 2.48:1 / orange 2.48:1. Narrow segments clip labels and the elevation value. | Contrasting text/fills; place names/readouts outside slices too narrow, keeping proportional widths honest; small text target 4.5:1. |
| UX-07 | P2 | After closing the nozzle, the 95 px grip/summary clips in the 72 px closed sheet, cutting the zero-flow explanation; Tab from the grip focuses an invisible Nombre input at y840–884 on an 844 screen. | Fit the closed summary; hide/inert the closed body from focus/accessibility; Enter+Space on the grip, restore focus. Give camera-lock/flow-opening affordances visible purpose on touch (recommendation, not a missing-glyph bug: the headless font lacks emoji). |
| UX-08 | P2 | Most functionality exists but controls look like generic forms (design assessment, not breakage). | Group by operation with a flat technical nozzle graphic, ring ticks/setting, pattern glyphs and coherent selection states; distinguish "Ajuste nominal" from solved delivered flow; label "Req.", pump opening and camera lock. Truck editor/multi-discharge/partial valves stay M3; no new law or fake partial-valve animation. Detailed work follows stability/layout fixes. |

**Proposed order.** 1. Drag/camera (UX-01) and the stable pump strip
(UX-02). 2. Sheet operating hierarchy (UX-03), annotations/toolbars (UX-04/05),
closed-sheet focus (UX-07). 3. Legibility (UX-06), consistent equipment
graphics and nozzle motion (UX-08); then truck/nozzle modules.

**Manual acceptance (not new UI tests).** First coupling dragged up 3 m ends
at +3 m, no camera jump; step/typed pressure 132/152.8/399.9 and flows
0/95/117/125 fully readable without a header jump at 360/390;
bale/ring/pattern visible and reachable at peek, expand always discoverable;
annotations, toolbars and dock do not overlap controls at 390/1024; the
closed sheet cannot focus hidden fields; repeat T1–T8, keep the 37 numerical
tests unchanged.

**Secondary.** At 1024 the dock (y693) overlaps lower right-panel actions
(bottom y709–720); reserve dock clearance in the side scroller (fits UX-05).
Under reduced motion particles stop but the budget transition stays 250 ms;
the proposed common motion policy should cover gauges/stream/sheet/camera
(existing proposal, not new approval).

**Doc alignment follow-up.** Older sections keep stale nozzle-tap wording
(§2, §8.3, §8.4) and an absolute no-auto-camera principle §8.1 qualifies;
align later, don't rewrite now.

**Evidence.** Session screenshots are outside the repo at
`/tmp/opencode/hydraulics-ux-uiXnS6/`: `phone-initial.png`, `phone-nozzle.png`,
`phone-coupling-drag.png`, `phone-360.png`, `phone-closed-line.png`,
`desktop-hose.png`, `desktop-dock-overlap.png`, `desktop-dark.png`. Current-app
screenshots, no mock-ups; no binaries committed.

### 10.8 SVG behavior polish (2026-10-16)

> **Status: implemented and browser-verified.** The canvas/geometry work is in
> the working tree and was walked in a browser at 390×844 and 1024×768, with
> additional checks at 360 px, 300% zoom, dark and
> `prefers-reduced-motion`. The verified results below supersede the §10.7
> observations, which stand as the historical pre-polish review. New
> sheet hierarchy, budget contrast and focus findings (UX-03/06/07) are **not** marked
> fixed.

**Gesture stability over a coupling.** While a coupling (or the nozzle) is
pressed and dragged, the camera mapping, the drawing bounds and the zoom are
**frozen** for the whole gesture: no auto-centering or re-mapping mid-drag.
Pointer deltas map to the station's run and height. The freeze is of the
camera, not of the model — the gauges, results and stream keep reflecting the
live solve as the numbers change. The root cause was
`src/lib/components/Canvas.svelte`, which auto-centered after `onSelect` on
drag start — not `src/lib/actions.ts`. After release, fit/follow may resume,
deliberately.

**Verified result (UX-01 corrected).** First coupling dragged 0 → +3 m with a
stable camera at **both** widths; undo returns to 0. A coupling can be raised
24 m into the visible sky. A 30 m hose folded to zero horizontal run stays finite;
dragging it back 4 m recovers. The same drawn geometry drives the hose path,
the hit path, the highlight and the particles; the reducer face seam error is
**< 0.001 screen px**. At 300% a painted 5″→1½″ reducer is clickable beyond
its 44 px handle. `pointercancel` causes no accidental selection.

**One shared hose contour.** A single sampled, smoothed contour drives the
visible path, the pointer/hit path, the selection outline and the particles,
so they cannot disagree. The contour is trimmed by arc length at each end;
fitting faces are anchored explicitly with their tangents, removing seams.
Internal rigid joints bend on the bisector axis; pump and nozzle horizontal
ports keep their current orientation (the hose meets them horizontally).

**Locked-hose reach and slack.** A hose that cannot extend shows Spanish
`Límite de manguera`; the actively dragged coupling is drawn distinctly from
a merely selected one. Slack — sag and floor arches — is **drawing only**: it
adds no hydraulic law or loss, and real length/elevation edits still reach the
engine. Sag and floor arches blend continuously, with no hard switch at 0.5 m,
and endpoint geometry stays finite.

**Zero-run.** A zero-run hose that still stores hose draws compact schematic
coils (drawing radius capped at 0.75 m, up to 8 turns) — not a physical
bend-radius or loss model. Only truly zero-length degenerate geometry collapses
to a point; the finite guard is what prevents `NaN`.

**Touch, overlays and labels.** Touch targets are at least 44 px, and
overlapping handles resolve to the nearest coupling. Captions and default
toolbars fit the canvas (desktop toolbar 20…447 inside canvas 12…625); the
ground caption uses a fixed-screen bottom inset while the ground stays near
the foot. Gauge and readout boxes avoid contours and one another; crowded
hoses get compact labels. (Floor labels no longer yield to gauges: they are
the height axis, §2, and gauges float above them.)

**Water and reduced motion.** The stream's phase is aligned across sections on
one shared timeline (CSS `startTime` 0), cycle-normalized across diameters, so
a multi-section lay reads as one stream; velocity stays engine-derived. Under
`prefers-reduced-motion`, Canvas particles and the camera are reduced — the
claim is limited to Canvas, not every component tween.

**Prerequisite (UX-02), verified.** Stable pump-strip sizing holds: pressure
132 / 152.8 / 399.9 is fully readable at 360 and 390, the strip stays 60 px
and buttons stay 44 px, so flow changes no longer move the canvas.

**Checks.** `pnpm test` 39 pass, `pnpm typecheck` 0 errors/warnings, `pnpm
build` pass.

**Separate review items.** Budget contrast (UX-06), the dock over the
1024 panel (UX-05) and equipment-like controls (UX-08) remain open. §10.7 is
the historical pre-polish review; the verified results above supersede its
observations where they differ.

**Fixed after the review (2026-10-16).**
- **UX-03:** the nozzle panel puts its operating controls first (Manija,
  anillo, Patrón, grouped as "Operar el pitón"), then the model, height,
  advanced settings and fittings. At peek all three are on screen at 390 ×
  844 (pattern y764–796) and 360 × 740. Expand / shrink is a ▴ / ▾ button
  beside the sheet's grip, not after the results; the sheet's button is
  "Ampliar panel", since "Ver todo" now names the canvas's whole-lay view.
- **UX-07:** the closed sheet grows to its summary when it runs to two lines
  (the zero-flow explanation fits whole), never below 80 px (was 72, which
  clipped the bar by 4 px). The closed body is `inert`, so Tab cannot reach
  hidden fields; the grip opens on Enter and Space.
- The start view (§8.1) no longer fits a long lay, so the world extends half
  a view past the nozzle: centring on it never shows the world's edge.

**Evidence.** Screenshots of the current actual app (no mock-ups) under
`/tmp/opencode/hydraulics-ux-uiXnS6/`: `svg-final-390.png`,
`svg-final-1024.png`, `svg-final-coil.png`, `svg-final-slack.png`,
`svg-final-fitting-300.png`, `svg-final-360.png`, `svg-final-dark.png`.
