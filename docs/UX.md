# UX and visual design

> 2026-10-15. How the app should behave and look. Every screen follows this
> document; a change to it is a design decision, recorded here first. Written
> after the owner's tests of the first two screens (ROADMAP §10b).

## 1. Principles

1. **Operate equipment like equipment.** A nozzle has a bale you flick, a
   gallonage ring you turn, a pattern collar. A pump has a panel. Never a
   checkbox for an equipment state. **The drawn equipment is optional
   (owner, 2026-10-17):** the plain controls (fields, ± buttons, chips) stay,
   and both ways are fully functional — every state reachable in one is
   reachable in the other (§10.1 Operate).
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
7. **Spanish UI**, CGBVP terms (pitón, tramo, paño, bifurco, desnivel).

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
  name every 1st, 2nd, 5th, 10th… floor above the street, whichever keeps
  two labels at least 22 px apart (owner, 2026-10-16; replaces hiding them
  all under 20 px, which left a phone with none); "Piso 1" is always named.
  **The labels are a height axis** (owner, 2026-10-16: gauges and labels
  fought for the same spot): pinned to the view's left edge so they stay
  while panning, never hidden for a gauge, drawn over the drawing with a
  halo. **Gauges float above them**, lifted by a shadow, their reading
  haloed, and above everything else drawn, the spray included (owner,
  2026-10-17); a dial takes no pointer, so the bale under it still works.
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
  **Nozzles shrink the same way, down to 45 %** (owner, 2026-10-17: they
  were "comically big" zoomed out); their drag handles keep full size.
- **Each nozzle shows its flow** (owner, 2026-10-17): "95 gpm" under it, or
  "cerrado", on every line. The header's gpm is what leaves the pump: on a
  single line the same number, on a branched lay the total of the lines.
- **Controls below the drawing,** never over it: zoom readout,
  − / + / Presión ideal.
- **Tap vs drag.** A press that moves less than 6 px is a tap: it selects
  (on the nozzle it also works the bale, open/shut; on a coupling it opens
  that joint's fittings; the hose itself opens the hose toolbar). More is a
  drag.
- **On-canvas editing.** Tapping a hose shows a small toolbar on the canvas
  with the hose sizes and −15 / +15 m. Tapping the engine selects the pump:
  its discharge outlet size (1½, 2½, 3″ or "same as the hose"); a different
  outlet size needs an adapter (MODEL.md §3.10; ROADMAP §11, decisions 5–6).
- **Nozzle toolbar (owner, 2026-10-17).** Selecting the nozzle opens a
  toolbar on the canvas like the hose's (desktop; the phone uses the sheet):
  the bale (Cerrado / Abierto), the gallonage ring's settings, the pattern
  at three stops (Directo / Medio / Neblina; the panel's slider sets anything
  between), "Quitar pitón" / "Poner pitón". An open
  end shows its flow and "Poner pitón"; a smooth bore has no ring or pattern.
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
  (`src/lib/names.ts`). **Its loss is stated, never "sin dato"** (owner,
  2026-10-16): under Modelo base "0 psi hasta 350 gpm; 10 psi por encima
  (regla de 350 gpm, Colorado)" and whether it counts at the current flow;
  under CGBVP "5 psi fija". Inside the step, where no flow balances
  (MODEL.md §2), the pump's state says "En el escalón de 350 gpm · sin
  caudal exacto" and gives the pressures that leave it. The nozzle joint is edited in the nozzle's
  inspector panel. Fittings are drawn
  at the joint in their own colour and move with it. An adapter is only
  offered where coupling sizes differ. No loose items: a piece is always
  placed on the chain (the Piezas strip, below). **Accesorios automáticos** (a switch in Ajustes › Escenario, §4; on by default):
  on, every mismatch gets an adapter, drawn dashed and not removable while the
  switch is on; off, adapters are placed by hand (turning it off keeps the
  ones it had derived throughout the tree, including nested branches), and a mismatch without one shows a red "!" at the
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
- **Pieces (owner, 2026-10-18).** A **"Piezas" strip** on the canvas's left
  edge (wider than a phone; a column, 78 px) holds what can be added: a
  hose of 1½″ or 2½″, Bifurco, Trifurco, a combination ("Neblina") or
  smooth-bore ("Liso") nozzle, and **Quitar**, the eraser. On a phone a
  "+ Piezas" button by the zoom controls opens it as a row of seven above
  the toolbar. **Tap a piece, then tap a spot**: picking one lights where
  it can go on **every drawn line** (`src/lib/pieces.ts`; owner,
  2026-10-18: a sandbox, not a line to switch to first) — a hose at every
  coupling, the pump outlet, the line's end, before a wye and on an empty
  outlet (which connects a line there); a wye at a coupling or the end; a
  nozzle on the nozzle; for Quitar, every hose, wye, hand-placed fitting
  and the nozzle. A spot that can't take it now is drawn dimmed and a tap
  says why (the parser's limits, "Una línea necesita al menos un tramo").
  A spot on another line places the piece there and makes that line the
  edited one. Each line owns the spots past the wye where it leaves the
  edited line. An empty outlet's spot comes with the line that draws its
  wye. On a branched lay a spot's ring is its line's colour. Where lines
  lie together, the later line's spot steps down, with a leader back to
  the point.
  A banner names the picked piece with "Cancelar"; a tap beside the spots,
  Esc, or selecting something puts it back. A piece goes back after one
  placement and what it made is selected; **Quitar stays picked** until
  "Listo", for clearing several things. Each placement is one undo step
  and says what it did. If no spot is in view when a piece is picked, the
  view shows the whole lay. Erasing a line's only hose after a wye
  disconnects that line; erasing a wye with one connected line rejoins it.
  **Adding and removing happen here, not in the panel** (owner,
  2026-10-18: "having any button control on the panel doing that feels
  really awkward"): the panel edits what a thing is, the canvas what is
  there. **Adding** happens only from the strip; the right-click /
  long-press menu keeps it for the selected thing, so the keyboard and
  screen readers can still build. **Removing what is selected happens
  where it is** (owner, 2026-10-18: "we should be able to remove stuff
  while there"): a red "Quitar" at the foot of its floating toolbar
  (desktop; just "Quitar", since the selection is highlighted beside it,
  or "Quitar con sus 2 líneas" when a wye takes its lines), a red × just above it on the drawing (phone, which has no
  floating toolbar), and Delete or Backspace. **Everything selectable
  offers it** (owner, 2026-10-18), a wye and the pump in a small bar of
  their own. What can't go shows it dimmed and says why: the pump, the
  pump's outlet, an open end, the last hose. Removing a plain coupling
  joins its two hoses, only when they are one size (otherwise one would
  quietly change size); a hand-placed adapter or valve goes from its
  coupling. The rules are Quitar's (`removalFor` in `src/lib/pieces.ts`),
  so the strip's eraser and the selection's button can't disagree. The
  coupling toolbar's "Unir tramos" is gone, since Quitar does it; the menu
  keeps "Unir los dos tramos". The phone's × ignores the click of the tap that made
  it appear.
  **Dragging a piece from the strip is deferred** (ROADMAP §10e):
  tap-then-tap is the phone's way anyway, and a drag would reuse the same
  spots.
- **Building the line (owner, 2026-10-15).** Hoses are added, split, joined
  and removed on the canvas; nothing needs the inspector:
  - **Context menu:** right click, or a press held still for 0.5 s on touch,
    on a hose (insert before / after, split in two, join with the next, lock
    or unlock its length, remove), a coupling (insert a hose here, join the
    two hoses, a wye or trifurco here), the nozzle (open/shut, take it off),
    the engine or pump outlet (insert at the outlet, apply the required
    pressure), or empty canvas (fit the view). The press that opens it already
    selects, so no entry only selects. The press is not also a tap.
  - **Every menu entry is in the selection panel too** (§10.5), since nobody
    discovers a long press, **except adding and removing pieces**, which the
    Piezas strip has (above); the common ones that remain (split, join)
    are also on the floating toolbar. A hint under the canvas names the
    menu.
  - **Edits keep the drawing still:** an inserted hose copies its neighbour,
    level and taut, so nothing else moves; a split meets halfway up the rise;
    a join takes the upstream hose's size and the combined length; a removed
    hose closes the gap (everything downstream drops by its rise). The
    nozzle keeps its fittings through all of them.
  - **Undo / redo** in the header ("↶ Deshacer", "↷ Rehacer"; Ctrl+Z,
    Ctrl+Shift+Z or Ctrl+Y). A drag or a burst of typing in one field is one
    step. Loading a preset clears the history.
  - **The engine solves one line or a gated tree.** A line is hoses,
    fittings and a nozzle; a wye splits it into branches, each with its own
    gate, hoses and nozzle, and a branch may hold another wye (nested wyes).
    **Branched lays are drawn in the same side view as a single line,
    every line at once** (owner, 2026-10-17: the separate top-down
    schematic lost the floors and the pressure split; "the same feel of the
    horizontal view"; "why can't we render both lines"). One line is **the
    edited line**: drawn on top, at scale, with its handles, gauges, hose
    labels and floating toolbars, and it is the line the pressure split and
    "Ver cálculo" describe. **Every line sits at its true height and
    lines overlap** (owner, 2026-10-17: hoses on one floor lie together;
    "allow overlap"), the edited line in front; hose labels carry a halo
    where hoses cross. Each other line shows its hoses with moving water
    at their own flow, couplings, its nozzle with bale and stream, and
    **its gauges — none hidden, each tagged with its line's name** above
    the dial; gauges that would overlap **sit side by side in a row**, not
    stacked in a column (owner, 2026-10-17): the slot left of the coupling
    first, then right, never past the lay's farthest nozzle and never over a
    nozzle's body. A gauge may also **join the row of a gauge just above
    it**, beside that gauge, and does so exactly rather than sitting a few
    pixels off (owner, 2026-10-17: two nozzles a floor apart, the lower one
    a little ahead, read as one row). A nozzle's gauge counts before it is
    placed, so the row is the same whichever line is edited. Dials stay
    inside the "Ver todo" frame; when no slot fits (a crowded phone view)
    a gauge goes up a row rather than drifting away from its coupling. The edited line's gauges past
    the first wye are tagged too. **Each line has a colour** (owner,
    2026-10-17), shown as a dot before its name: on its gauge tags, the
    hover tag, the "Reparto de" line, the wye panel and the per-line
    results, and as a band at each nozzle's inlet, like tape on a coupling,
    so a nozzle matches its gauges. Hoses stay hose-red; the colour follows the line's place in
    outlet order (`src/lib/line-colors.ts`, tokens `--line-1…6`), so it
    doesn't change with the line being edited, and the name tells apart
    lines that share a colour past the sixth. **Its couplings and nozzle drag straight
    away** (owner, 2026-10-17): pressing one makes that line the edited one
    and the same press moves it, no tap to pick the line first; a tap still
    only selects. A nozzle drags from anywhere on its body, not only its
    coupling end; the bale keeps its tap. Picking is needed only where lines overlap and the edited
    line's handle is on top. **Reaching what is behind:** on desktop,
    hovering an overlap brings the line behind forward with a tag
    ("Línea 2 · clic para editarla") and a click edits it; on any device a
    second tap on the same overlap (the same hoses, wherever the drawing
    has moved) edits the next line there in outlet order, with a toast
    ("2 líneas aquí · toca de nuevo para la siguiente"); right-click or
    long-press lists "Editar Línea n" for every line under the pointer;
    where line ends coincide a "×n" badge picks the next line's nozzle.
    Hover is only a preview, never the only way. **The wye in the side
    view** (owner, 2026-10-17: "side view doesn't need much detail"):
    the lugged inlet swivel, a round casting (not the reducer's taper:
    owner, 2026-10-17), the outlets leaving it one behind the other (the
    far one shaded and a little higher), and on top each outlet's
    quarter-turn ball-valve handle straight on the casting (owner,
    2026-10-17: a turn handle, no bonnet), staggered along it. The handle
    turns about its stem, animated — open, a bar along the
    hose; shut, turned across it toward the eye (its red end) — tapped to
    open or close. **Its close-up is drawn from above**: selecting the wye
    opens its panel with the gated wye seen from above — inlet swivel with
    rocker lugs, the Y casting, and on each arm a ball valve whose lever
    lies along the arm when open and across it when shut; each arm ends in
    its line's name and flow. It follows the Operate / Close-up
    preference: with plain controls each outlet has Abierta / Cerrada
    buttons instead. Below, each outlet with its flow and nozzle
    pressure and "Editar esta línea"; a note points to Piezas for
    connecting, disconnecting and removing. The edited line's hoses and nozzle use the ordinary
    canvas and inspector; an edit maps back to the segment it belongs to
    (`branch-edit.ts` `applyPathEdit`), hoses never merge across a wye and
    each line keeps a hose. **Wyes are placed, then built out** (owner,
    2026-10-17, ROADMAP §10e item 0): the Bifurco or Trifurco piece, or
    "Bifurco aquí" and "Trifurco aquí" (menu), on any
    coupling or the line's end put the device there; the hoses after it go
    on through its first outlet and the others start **empty**, gate shut.
    The wye's panel switches Bifurco ↔ Trifurco (a new outlet starts
    empty; going back needs an empty outlet). A hose piece on an empty
    outlet connects a line there (a 30 m hose of that size and the nozzle,
    shut, and that line is drawn); Quitar on an outlet line's only hose
    disconnects it (the gate shuts; not the last connected outlet). An empty outlet is a dashed card,
    "Salida vacía · boca de 1½″"; on the canvas a capped far spout. **Opened,
    it flows** (MODEL.md §2): the spout spills with its gpm in the warning
    colour, the panel says "⚠ Abierta sin manguera: N gpm al suelo", the
    results list "⚠ al suelo". Quitar on the wye rejoins the line when one
    outlet is connected, else takes every line with it. Empty outlets are
    not lines: no colour, no lane, no row in the pressure split. A feed hose's particles move at the feed's flow.
    **The pressure split names the line it shows** ("· ● Línea 2", in the
    full bar and the floating one) and, on a branched lay, **starts with a
    row per line** — its dot, name, flow and a thin split bar — the edited
    one marked; tapping a row edits that line (owner, 2026-10-17). There is
    no "total" split: every line spends the whole pump pressure on its own
    path, so the bars don't add up, and the bar says so. **What does add up
    is power**: under the pressure split, a branched lay shows "¿En qué se
    gasta lo que entrega la bomba? · Toda la tendida" (MODEL.md §3.8
    `power.split`, owner, 2026-10-17): one bar in the pressure split's
    colours with percentages (streams, friction, fittings, height), a
    sentence ("De todo lo que entrega la bomba, 41 % llega a los chorros,
    46 % se pierde en fricción y 13 % sube el agua"), "Eficiencia de la
    tendida" (the stream share; the "Comparar con" method's beside it), each
    line's share of the streams by its dot, and, folded under "Ver en
    potencia", hp and kW per part with what power is and the formula with
    the pump's numbers. **Never a bare "hp"**: percentages lead, the
    absolute figure stays one tap away with its explanation. A downhill gain
    is a sentence, not a slice; "≈" in the 350 gpm rule's gap. A single line
    shows no such card (its split is the pressure split's): the Conceptos
    card gives the pump's power and says so. Under the power split, a
    read-only list gives every line's flow and pressures at once
    (ROADMAP §10c; MODEL.md §2). **Every gate is fully open or
    fully shut, independently**: a shut gate isolates its whole downstream
    subtree, whose flow reads 0 and whose downstream pressure is **unknown**
    (trapped water with no drainage history), never fabricated from the pump
    behind it. The source stays a **fixed pressure** — the ideal-pressure
    pump holds its outlet at the set value, capacity and curve still to come
    (§3, M3). No piece is offered that the solver can't compute.
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
  **While dragging the nozzle the label leads with the floor/height only; the
  hose length is a small secondary note to the right of the nozzle** (owner,
  2026-10-17). Couplings keep "length · floor" in one label. Do not put the
  length back into the nozzle's main label.
  Drags start only on handles; dragging empty canvas pans. The horizontal
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
- **Nozzle:** drawn as the model's own anatomy (§3.1): the shutoff it really
  has, its grip, rings, collar and teeth, with its working controls on the
  drawing and mirrored in the inspector:
  - **Shutoff:** the model's bale lever, slide valve or ball valve. Flick,
    slide, turn or tap it between shut and open. Partial opening is not
    modelled until a valve law with a source exists (MODEL.md).
  - **Gallonage ring** (selectable nozzles): the actual settings as
    segments. Where a model indexes its flow on the slide valve (POK), the
    index marks are drawn on the valve instead.
  - **Pressure ring:** a dual-pressure model's selection ring (POK
    50/100 psi) is drawn as part of the model; it is not worked until the
    rating story for dual-pressure automatics is decided.
  - **Pattern collar:** straight stream ↔ wide fog. Drawn on the stream.
  - **Stream:** grows and collapses with the flow; shape follows the
    pattern.
- **Pump header:** discharge gauge, pressure (typed, ±), **"Presión
  ideal"**, **"Ralentí"** and the flow, large, always in view (§4). The
  ideal pressure is what the pump needs for the nozzle to get its rated
  pressure (nozzle + friction + elevation + fittings, under the chosen
  method). **A reading first, a shortcut second** (owner, 2026-10-18,
  replacing "Ajustar", which solved the task for you): the chip reads
  "Ideal 132", turns green with ✓ when the pump is there, and a tap sets
  it; a tick on the pump's dial marks it. Single line with a nozzle only:
  an open end has no rating, and a branched lay has no single ideal yet. "Ralentí"
  (owner, 2026-10-16) is the kill: red, undoable, 0 psi today because the
  pump is an ideal pressure source; with the governor's RPM mode (M3) it
  sets the lowest RPM and the pump curve gives the pressure. On a phone the
  strip is a summary (pressure ±, Ideal, flow); selecting the pump opens
  its whole control in the sheet (large gauge, ±1 and ±10, Presión ideal,
  Ralentí, flow) above its detail.
  The outlets are the pump's detail; truck, governor and tank join it with
  M3 (ROADMAP §6).
- **Controls:** no unstyled browser defaults in the main UI. Segmented
  controls for small choice sets, ± steppers for numbers, sheets or side
  panels for inspectors.

### 3.1 Nozzle anatomy (owner, 2026-10-19)

The in-canvas nozzle and the close-up are drawn from one map of the model's
controls and their stations, `src/lib/nozzle-anatomy.ts`, with one entry per
researched row of `data/catalog/nozzles.csv` (columns `ctrl_*`). Stations,
hose to tip: **valve** (the shutoff body), **grip** (pistol, under the
valve), **barrel**, **flow** (gallonage or pressure ring), **pattern** (the
collar), **tip** (teeth, or a smooth bore's stack). A control sits at another
station when its model puts it there: POK indexes the flow on the slide valve
itself. A generic or hand-entered nozzle draws the shape from before
2026-10-19 (bale, ring when selectable, collar); a smooth bore draws its
shutoff and stacked tip; an open end nothing.

Control locations differ between models and may need tuning: `verify` in the
map and `ctrl_source` in the CSV say what still needs the model's plate,
photo or manual. What the drawings show today:

| Model | Shutoff | Flow | Pattern | Grip | Teeth | Checked |
|---|---|---|---|---|---|---|
| TFT Mid-Matic HM-VPGI | bale | — (auto) | collar | pistol | rubber | page |
| TFT Handline H-2VPGI | bale | — (auto) | collar | pistol | rubber | series |
| TFT G-Force GF3D2S | bale | ring | collar | pistol | metal | series |
| TFT G-Force GF3C2S | bale | ring | collar | pistol | metal | page |
| TFT QuadraFog FQS125F | bale | ring | collar | — | metal | page |
| TFT ThunderFog FTS200PS | bale | ring | collar | pistol | metal | page |
| TFT ThunderFog JTS250PS | bale | ring | collar | pistol | metal | note |
| TFT Handline H-VPGI | bale | — (auto) | collar | pistol | rubber | page |
| TFT Ultimatic BGH-125 | bale | — (auto) | collar | pistol | rubber | note |
| TFT Master Stream M-RS1000-NJ | — | ring | collar | — | metal | pending |
| Elkhart Chief XD mid/high tip | bale | — | collar | — | metal | series |
| Elkhart Phantom XD mid/high | bale | ring | collar | — | metal | page |
| Elkhart Select-O-Matic XD mid/high | bale | — (auto) | collar | — | metal | series |
| Elkhart X-Stream SM-1250 | — | — (auto) | collar | — | metal | pending |
| Elkhart Select-O-Flow CSW-LB | — | ring | collar | — | metal | pending |
| MAFCO SS Series S402 | bale | ring | collar | pistol | metal | series |
| Protek 368 | bale | ring | collar | pistol | metal | photo |
| Akron Turbojet 1720 | bale | ring | collar | pistol | metal | page |
| Akron Mid-Range Turbojet 1723P | bale | ring | collar | pistol | metal | page |
| Akron Mid-Range Assault 48634028 | bale | — | collar | pistol | — | series |
| Akron Akromatic 1250 5160 | — | — (auto) | collar | — | metal | pending |
| Akron 4AN Navy 2069 | bale | — | collar | — | — | pending |
| POK Slide-O-Matic 150/300 | bale | index (valve) | collar | — | — | pending |
| Viper VB9520 + Akron 1420 | bale | — | — | pistol | — | photo |
| Smooth bores (TFT FSS10-IF, Elkhart XD, Akron 1499) | bale | — | — | — | — | tip only |

- **Master streams draw without a shutoff:** the monitor's valve shuts them,
  not the nozzle. Their silhouette gets its own pass when monitors arrive
  (M6); until then the map is a placeholder.
- **POK's 50/100 psi ring is drawn, not worked.** Switching it would change
  `ratedPressurePsi`, and what an automatic regulates at each pressure is an
  engine question (MODEL.md §3.5), not a drawing one.
- **The researched catalog is not runtime yet** (ROADMAP §3): only linked or
  hand-edited documents carry a researched `specId`, and they already draw
  with its entry. When the catalog becomes runtime this map moves into it.
- **Each researched row draws its own art (owner, 2026-10-19).** The
  silhouette of both views lives per model in `src/lib/nozzle-art/`, drawn
  from that model's reference photos in `docs/reference/nozzles/`; `types.ts`
  is the contract. The full scrape/PDFs sit in that folder's gitignored
  `raw/` cache, with source URLs in `SOURCES.md`. The side
  view compresses length (a schematic) but keeps true diameters; the top
  view is true-scale, 14 units per inch; every diameter in the side view is 0.7 of the same part's in the top view, so the two agree on proportions (owner, 2026-10-22; master streams and the 4AN keep their own scale for now), and a plan projection: parts that
  hang below the axis (a pistol grip) are hidden by the body and not drawn,
  a bale is a U from above — an arm along each flank of the body, a pivot pin on each, the crossbar joining the arms at their free end — never its side profile (owner, 2026-10-21; a catalog's "slide valve" or "ball valve" names the valve inside, never the handle: every pistol-grip handline here — TFT, MAFCO, POK, Protek, Akron, Viper — works it with a bale loop; from the truck photos in `docs/reference/nozzles/photos/truck/`: every unit in the station inventory, the MAFCO SS402 included, has a bale handle), and a control
  mounted on the body's top face (slide rail and knob, flow index, ball
  lever) is drawn on the centreline — never at its side-view height (owner,
  2026-10-19). The bale's arms and pins share one offset (±`offset` from the axis); the
  side-view loop is never part of the top shell. Rubber teeth are drawn on
  the tip face, not as lobes around the bumper's outline. The ring's numbers are printed round the ring, as on the unit: each one faces the person holding the nozzle (behind it, tip ahead): tops toward the tip, baseline running across the axis (circumferentially, ascending values toward the holder's right, i.e. down the screen), squashed by cos θ as the ring turns it away, and they are never straightened for readability (owner, 2026-10-22; a tooltip will carry the readable value later) The selected flow is
  read from the horizontal readout in the close-up's top corner instead
  (owner, 2026-10-19). The art holds only the static shell; every working part —
  bale, slide, ball, ring numbers, collar ribs, stream — stays the
  component's, so it keeps moving. A row without art keeps the generic
  drawing; adding art is a file plus its `index.ts` entry.

## 4. Layout

| Width | Pump header | Canvas | Panel body (selection, Línea) | Results and formulas |
|---|---|---|---|---|
| ≥ 1024 px | atop the right panel, stuck while it scrolls | left, the rest of the width | right panel, 360 px | below canvas, collapsible |
| < 1024 px | one-row strip (pressure ±, Req., flow); tapping the flow selects the pump | full width, the rest of the screen; the page does not scroll (§8) | bottom sheet that slides up on selection (§8.2) | in the sheet, collapsible |

**Loading (owner, 2026-10-18).** The page is not server-rendered: built
without a screen, it laid out at the wrong size (no canvas width, neither
phone nor wide) and snapped into place seconds later on a phone, once the
scripts ran. `app.html` shows a splash (title, a bar, "Cargando…") until
the app mounts; the first layout drawn is the measured one.

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
  control a lay is set with. Gauge, pressure, "Presión ideal", "Ralentí",
  flow and the state. Tablets put it above the canvas, phones as the strip;
  the body goes below the canvas or in the sheet.
- **Body: what is selected.** Nothing: **Línea** (its name) and the
  parts list. The truck or the pump outlet: the pump's detail (Descargas: outlet
  size, fittings; Camión, Control and Abastecimiento with M3). A hose, a
  coupling, the nozzle: its editor, with × back to Línea.
- **Under the canvas:** view only (zoom, Ver todo, Cámara, Enfocar).
  **Header of the page:** undo, the **Escenario** menu, **Ajustes (⚙)**.
- **One Escenario menu (owner, 2026-10-18)** replaces the preset dropdown
  and the "⋯" menu. Its button shows the scenario's name. The menu lists
  "Empezar desde" and the presets, with the loaded one ticked, then
  "Línea en blanco" and "Reiniciar este escenario" (greyed out until
  something changes), "Copiar enlace", "Copiar como texto" and "Pegar
  escenario…". Loading a preset starts a fresh history; a blank line,
  reset and a paste are undo steps.
- **The first lay is "Bifurcada" (owner, 2026-10-18)**, replacing "Ataque al
  2.º piso", whose nozzle opened off the edge of a phone. Its hoses keep
  their 30 m but are laid short and snaked on the ground (`runM`, drawing
  only), so the truck, the wye and both nozzles fit the start view at 390
  and 1024 px. Línea 2 goes up to the 2nd floor: the two nozzles never
  share a spot, and the two lines differ, which the welcome tour uses
  (§8.4). Coiled hoses caption in lanes below the ground, shortening the
  caption before two overlap.
- **Copy, paste, links (owner, 2026-10-18; ROADMAP §10e item 2).** Only
  the scenario travels (the lay, method, floor height, fittings mode),
  never Ajustes › Vista. A link carries the document in the URL's
  fragment (`src/lib/share.ts`), so it reaches no server and works
  offline. Opening one loads it with a fresh history, says so in a
  notice, and clears the address, which would go stale with the first
  edit. "Pegar escenario…" opens a box that takes the copied text or a
  link, and says in Spanish why it won't open. Where the browser keeps
  the clipboard closed (an http address on the station's network), copying
  shows the text to copy by hand. What comes in passes `parseScenario`,
  like the presets; "Reiniciar" returns to the last thing loaded.
- **Settings, not buttons (owner, 2026-10-18).** A choice about the whole
  simulation rather than a piece goes in **Ajustes**, a dialog from the
  header's ⚙ (full width on a phone), never as a button in a panel.
  **Escenario**, saved with the lay, each change an undo step: Método de
  cálculo, Altura de piso, Accesorios automáticos. **Vista**, remembered
  per browser, changes no number: Comparar con, Manómetros, Grosor real de
  la manguera; display units go here when they come (ROADMAP decision 6).
  What a firefighter does on the fireground stays a control on the item:
  pump pressure, Ralentí, Presión ideal, gates and the bale, the nozzle's ring
  and pattern, a hose's size, length and lock.
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

Unavailable readings show **—**, never NaN. Static nozzle pressure is shown
only for a connected, closed nozzle, using the engine's solved reading;
another outlet may still cause losses in the common feed. An isolated line
does not inherit the pump's pressure. Branched paths omit the ideal-pressure
shortcut until whole-tree planning exists. A failed pressure balance or a
dry high point is labelled in the pump status and pressure breakdown, rather
than displayed as a normally flowing line. An open nozzle with zero delivery
reads "sin caudal" on the canvas; "cerrado" means the nozzle is actually shut.

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
| Open / shut the bale | click the lever | tap the lever when drawn at 70 % size or more; smaller, a tap selects the nozzle and Manija is in the sheet (owner, 2026-10-18) |
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
  fine steps. **The camera stays inside the world** (owner, 2026-10-16:
  zooming out showed empty space above and left of the truck; replaces "may
  leave the world, 48 px stays"): the world always fills the view, so the
  truck's edge is the left limit, the ground the bottom, and a zoom or a
  resize pulls the camera back in. **Lock** (button, or Y) keeps the camera on the selection,
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
| Line | add or remove a hose, wye, nozzle | Piezas strip; menu | Piezas tray; menu |
| | split, join | hose / coupling toolbar, menu | sheet at peek, menu |
| | hose size, length (±15 m, typed) | hose toolbar; inspector | sheet at peek |
| | length lock | hose toolbar, menu | sheet at peek |
| | move a coupling (run, height) | drag; arrow keys; typed in inspector | drag; typed in sheet |
| Fittings | adapter at a joint | coupling toolbar | sheet at peek |
| | Accesorios automáticos | Ajustes | Ajustes |
| Nozzle | open / shut the bale | tap the nozzle | tap the nozzle |
| | model, gallonage, pattern, typed rating | inspector | sheet at peek |
| Pump | pressure (typed, ±) | panel header | top strip |
| | ideal pressure (reading; tap sets it), idle ("Ralentí") | panel header | top strip: Ideal; sheet (pump selected): both |
| | discharge outlet size | tap the engine → panel body | tap the engine or the strip's flow → sheet |
| Scenario | load a preset | header | header menu |
| | undo, redo | header; Ctrl+Z, Ctrl+Shift+Z | header icons |
| Read | gauges, flow, pressure split | canvas, panel, floating bar | canvas, top strip, sheet |
| | calculation, concepts | below the canvas | sheet, full |
| Help | welcome tour, again | "?" in the header | "Ver recorrido" in the Escenario menu |

### 8.4 Welcome tour (owner, 2026-10-18; replaces the 2026-10-15 steps)

**When.** First visit only, remembered per browser (a failed storage read
shows it again, never breaks the page). It starts on the default lay
(§4, "Bifurcada"). A shared link or a pasted scenario never starts it: the
notice that names the lay offers "¿Primera vez? Ver recorrido" instead, and
the tour then runs on that lay. Reopened from **"?" in the header** (wide
and tablet) and **"Ver recorrido" in the Escenario menu** (phone, whose
header has no room left at 360–390 px).

**Generic steps.** Every step points at a kind of thing (the pump, a
nozzle, a coupling, a hose, the pressure bar), never at a preset's piece,
so the tour works on any lay. A step whose target the lay lacks (no
coupling, an open end with no bale) is skipped. Each step frames its target
first ("Ver todo" for the lay, the selection otherwise) and, on a phone,
keeps it above the sheet. What the person does during the tour is ordinary
editing: undo steps, nothing restored at the end. "Saltar" and Esc end it
at any step; ending it counts as seen.

| # | Points at | Text (Spanish UI) | Moves on |
|---|---|---|---|
| 0 | nothing (a card) | "Simulador hidráulico: cambias el tendido y la bomba; el caudal lo calcula la física. Un minuto." · Empezar / Ahora no | a button |
| 1 | the canvas, whole lay | "El tendido, de lado: bomba → mangueras → pitones. Las líneas grises son los pisos." | Siguiente |
| 2 | nothing (a card in the empty building, so the lay and the view buttons stay in sight) | Phone: "Un dedo arrastra el dibujo; dos dedos lo acercan o alejan (pellizco). «Ver todo» lo muestra completo." Wide: "Arrastra el fondo para moverlo; la rueda del ratón acerca o aleja. «Ver todo» lo muestra completo." (owner, 2026-10-18: the tour had no navigation) | Siguiente; the person may try it first |
| 3 | the pump (panel head; phone: the strip) | "La presión de la bomba: súbela o bájala. «Ideal» marca la que pide el pitón; tócala para ponerla." | Siguiente |
| 4 | Wide: the nozzle's drawn lever, tinted in the accent colour. Phone: the nozzle, then, once selected, the sheet's "Abierta" button (the drawn lever is too small to aim at, §8.1) | Wide: "Haz clic en la manija, la palanca sobre el pitón, para cerrarlo." Phone: "Toca el pitón para seleccionarlo." then "Ahora toca «Abierta», en el panel, para cerrar la manija." (owner, 2026-10-18: say where to act and highlight that control) | the nozzle closes |
| 5 | the pump's flow | Branched: "Bajó el caudal total, y la otra línea recibe un poco más: comparten la bomba. Ábrelo otra vez." Single line: "Sin caudal no hay fricción. Ábrelo otra vez." | the nozzle opens |
| 6 | a coupling's handle (else the nozzle's) | "Arrastra esta pieza a otro piso: subir cuesta presión." | a move |
| 7 | a hose | "Toca una manguera para cambiar diámetro o largo. Mantén pulsado (clic derecho) para más." | a hose is selected |
| 8 | the pressure bar (phone: the closed sheet; wide: the dock or the results' bar) | "En qué se gasta la presión: pitón, fricción, altura." | Siguiente |
| 9 | The control that reopens the tour: wide, the "?"; phone, the Escenario menu opens and "Ver recorrido" is highlighted inside it (owner, 2026-10-18: the step named the control without showing it); the menu closes when the tour ends | Wide: "Para repetir el recorrido, pulsa «?». Otros tendidos, y copiar o pegar el tuyo, están en Escenario." Phone: "Para repetir el recorrido: «Ver recorrido», al final de este menú. Aquí también están los otros tendidos, copiar y pegar." | Listo |

Steps 4, 6 and 7 re-frame the lay first ("Ver todo"), since the person may
have panned or zoomed in step 2.

**Look.** One popover by the target with the step count ("3 de 8"), Saltar
and, on information steps, Siguiente; the rest of the screen dims except the
target, which stays usable. Under `prefers-reduced-motion` nothing slides.

**Built (2026-10-18)** in `src/lib/components/Tour.svelte`; targets carry
`data-tour` marks (`canvas`, `pump`, `nozzle`, `manija`, `coupling`, `hose`,
`budget`, `escenario`), so a redesign moves a mark, not the tour. Walked at
390 and 1024 px, every step done by hand.

**Library.** [Driver.js](https://driverjs.com) (MIT, no dependencies,
pinned exactly): it highlights any element, SVG included, and the app moves
it on from its own events; `refresh()` follows the camera. Not Intro.js
(AGPL or a paid licence, and the licence question is open, ROADMAP §11 item 4);
React Joyride needs React.

### 8.1b Hover and tap feedback (owner, 2026-10-18: deferred)

Built, mouse only and never the only cue: a thin halo on the hovered hose
(`hovered` state, drawn from the hose's own path) and a CSS outline on handles,
the engine, gauges and badges. **Deferred until the network model is
settled** (siamese, two pumps, supply: `ROADMAP.md` §7.7): a single overlay
drawn from the layout for any `hovered` target, a brief flash of the pressed
target's hit area on tap and click, and merging the overlap peek into
`hovered`. They wait because the targets are keyed by index today and would be
keyed by id in a graph, and because the engine's truck has no geometry in the
layout yet.

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
| **Operate** (owner, 2026-10-17: approved, optional) | work a piece of equipment: the bale, a discharge's push-pull valve, the gallonage ring, the pattern collar, the governor | the piece is drawn as equipment, never a checkbox; the control's own motion confirms the actuation (≈150–250 ms); a typed/± value sits beside it. **Optional, both complete:** a View choice switches between the drawn equipment and the plain controls (fields, ±, chips), remembered per browser; each covers every action of that piece, so neither is a fallback and no state is reachable only one way |
| **Close-up** (owner, 2026-10-17: approved, optional) | an enlarged, realistic view of one piece (the nozzle, the pump) where its Operating controls live | entered from the element; draws the real thing large; one piece at a time; returns to the canvas (a sheet on a phone, the side panel when wide). **Optional, by preference:** the same View choice as Operate — with plain controls the element opens its form in the same place; both complete. Pump close-up draws Descarga 1 only until the engine has more discharges (M3). The nozzle close-up draws a combination nozzle; a smooth bore shows its bale as plain controls (no ring, no pattern) until it has a drawing of its own, and an open end has nothing to operate (2026-10-17) |
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
| **Scenario** | preset ✅; blank line ✅ ("Línea en blanco", Escenario menu) | rename ✅ (Línea) | — | reset to preset ✅ (Escenario menu, undoable) | — | share link ✅, copy / paste ✅ (Escenario menu); cloud save ⏳ (paid) |
| **Method** | clone a built-in ⏳ | edit a clone ⏳; built-ins ✕ (read-only) | — | delete a clone ⏳ | sources ✅ ("Fuentes" card) | pick "Método" ✅; "Comparar con" ✅ (Ajustes; per browser, off when equal to Método) |
| **Pump** | ✕ (a line needs a source) | pressure ✅, apply required ✅, outlet size ✅; spec ⏳ M3 | ✕ | ✕ | flow, state ✅ | — |
| **Truck** | choose a truck file / preset ⏳ M3; clone a built-in ⏳ M3 | discharges open / shut, tank ⏳ M3; partial valves ⏳ (`valve.partial`); **specs editor** (pump, discharge sizes and diameters) ⏳ M3 | ✕ | ✕ | capacity ⏳ M3 | presets carry pump and discharge diameters ⏳ M3 |
| **Hose** | insert, split ✅ | size, length, lock ✅ | its couplings move it | remove, join ✅ | its friction loss ✅ (panel) | true-scale thickness ✅ (Ajustes › Vista; default exaggerated, badge "grosor ×11") |
| **Coupling** | with a hose ✅ | fittings ✅ | drag ✅; first-drag camera stability ✅ (§10.8) | join the two hoses ✅ | pressure here, lost before it ✅ (tap its gauge) | — |
| **Fitting** | adapter ✅; valve: engine only, no toggle (a coupling kind later) | ✕ (a kind has one loss) | moves with its coupling | ✅ | its loss and basis ✅ | auto fittings switch ✅ |
| **Nozzle** | put back ✅ ("Poner pitón": the one it came from) | bale ✅, model ✅ (chips grouped Combinado / Chorro sólido / Sin pitón), ring ✅, typed rating ✅ (fog only); smooth-bore tips ✅ (owner, 2026-10-17) | drag ✅ | remove ✅ ("Quitar pitón": an open end, MODEL.md §3.4d; owner, 2026-10-17) | rating vs actual ✅ (mark on its gauge, warning in its panel under 95 %; none for an open end); **reaction ✅** (lbf and kgf with the formula, its panel) | — |
| **Stream** | — | pattern ✅; aim ⏳ M2 | — | — | jet speed ✅; reach ⏳ M2 (illustrative) | — |
| **Water flow** | — | ✕: flow is solved, the app's core lesson; "I want X gpm" is target planning ⏳ | — | — | flow ✅, hose speed ✅, where the pressure went ✅ | — |
| **Gauge** | — | — | — | hide ✅ (Ajustes › Vista) | tap: reading, loss before it ✅ | — |
| **Building** | — | floor height ✅ (Línea, 2–6 m) | — | — | — | obstacles, routes ⏳ (ROADMAP §10b) |
| **Fire** | ⏳ M5 | fire size ⏳ M5 | — | — | required vs delivered flow ⏳ M5 (NFA first) | — |
| **Canvas view** | — | pan, zoom, fit ✅; zoom to selection ✅ ("Enfocar") | — | — | — | — |
| **History** | — | undo, redo ✅ | — | — | — | — |
| **Help** | — | — | — | — | tour ✅ (§8.4; "?" wide, Escenario › Ver recorrido on a phone) | — |

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
| T3 3rd floor | At a fitted zoom floors are 12 px apart and their labels hide; the drag label says "9 m", not the floor | ✅ The drag label names the floor ("piso 4 · 9 m", "sobre piso 2 · 3.5 m"); the typed "± piso" stays |
| T4 build a maniobra | No blank line, so you start from a preset and edit; the nozzle model sits under "Ajustes avanzados" | "Línea en blanco" in the Escenario menu; model chips at the top of the nozzle's sheet |
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

**Where the new controls live (2026-10-16).** Global (the header's
Escenario menu since 2026-10-18, before that "⋯"): "Línea en blanco",
"Reiniciar este escenario". Línea section: name. Ajustes (⚙, since
2026-10-18; §4 "Settings, not buttons"): Método, floor height, automatic
fittings (with the lay); Comparar con, gauges on/off, true hose thickness
(per browser). Under the canvas, "Enfocar" zooms to the selection. Inspect: tap a gauge for its reading (pressure here,
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
3. **The panel has everything but placing.** It draws every action for its
   target except those that add or remove a piece (`placed`), which are the
   canvas's (§2 "Pieces", owner, 2026-10-18); the menu and the toolbar are
   shortcuts. An action the panel already offers as
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
  **Built (2026-10-17)** in the nozzle's panel (side panel; the sheet on a
  phone), not a modal: the bale taps or pulls and snaps; the gallonage ring
  and the pattern collar turn with an up/down drag (numbers follow the
  finger); arrow keys work on each; a readout with ‹ › under each control
  covers every state too. A link above it ("Ver controles simples" / "Ver
  pitón dibujado") switches to the plain controls and is remembered per
  browser (`view.controls`). **Drawn from above (owner, 2026-10-17)**,
  modelled on a TFT combination nozzle, not from the side: hose and
  swivel on the left, tip and stream on the right, so the direction of
  the water is never in doubt. The bale is the U seen from above: pushed
  forward toward the tip it lies over the barrel (shut), pulled back
  toward the hose it is open, as on the real nozzle; a tap or a sideways
  drag works it. The canvas nozzle stays a side view (the lay is an
  elevation). The under-pressure warning sits after the
  controls, so it appearing mid-turn never moves them under the finger.
- **Full truck-specs editor** and **preset trucks** with pump and discharge
  diameters: **Configure** and **Choose** (`ROADMAP` §6, M3).
- **Left-click action menu: not added (owner, 2026-10-16).** It would
  duplicate the panel, which already carries every other action (§10.5 rule 3);
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

**Separate review items.** Equipment-like controls (UX-08) and the toolbar
over the lay at 1024 (UX-05's first half) remain open. §10.7 is
the historical pre-polish review; the verified results above supersede its
observations where they differ.

**Fixed before the welcome tour (2026-10-18).**
- **UX-06:** a pressure-bar slice shows its name and value, else the value,
  else nothing (its title keeps it), by its measured width, so no label is
  cut. Slice text is 4.5:1 or better in both themes (dark text on orange and
  on the dark theme's light blue; the light theme's water slice is one step
  darker, `--water-bar`). The bar's width transition stops under reduced
  motion.
- **Dock over the 1024 panel (UX-05, second half):** the panel's height
  leaves room for the header and the dock; the wide header stays one row
  (a long scenario name truncates), which was pushing the panel down.
- The diameter picker names hoses as the toolbar does (`2½″`,
  `3″ (acoples 2½″)`), from one helper in `names.ts`.

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

### 10.9 Desktop and touch layout follow-up (2026-10-21)

Approved after the current-build review. Below 1024 px, use the compact
pump strip and bottom sheet so operating controls stay beside the drawing;
this supersedes §4's stacked tablet layout. Keep the equipment illustration
compact on tablets. Selection changes reset the sheet's content scroll,
including changes of branch, but ordinary value edits preserve it.

Frame the selected equipment together with its pressure gauge above the
peek sheet, moving the camera only enough to expose them. Keep gesture-time
camera freezing. Desktop shortcuts prefer nearby free space, avoiding
hoses, equipment, captions and gauges before falling back in a crowded view.
Pressure values and units never wrap; the compact budget can put its line
name on a separate row. Step controls and parts-list targets are at least
44 px. These changes affect presentation only, not the hydraulic model.

On touch layouts, the quick operating readouts precede the nozzle drawing.
The inspector heading stays visible while scrolling. The closed sheet reports
its measured summary height to the page so view controls remain uncovered.

Verified in Chromium at 360×740, 390×844, 768×900, 1024×768 and
1440×900: no horizontal overflow; touch layouts stay within one screen;
closed sheet clears the view controls; selecting from Partes resets scroll;
44×44 pattern steps and the selectable nozzle's operating readouts fit at
peek; close/open and undo work; closed content remains inert. Desktop
screenshots include dark mode with reduced motion. No real-device study.
Evidence: `/tmp/ux-improved/final-390.png`, `selector-390.png`,
`final-768.png`, `final-1024.png`, and `dark-1024.png`.
