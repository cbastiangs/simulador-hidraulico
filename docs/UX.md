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
- **Constant-size overlays.** Gauges, labels, handles and the nozzle keep
  their screen size at any zoom; hoses and the engine scale with the world.
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
  inspector panel, since tapping the nozzle works the bale. Fittings are drawn
  at the joint in their own colour and move with it. An adapter is only
  offered where coupling sizes differ. No loose items and no toolbox drag for
  now. **Accesorios automáticos** (a switch under the canvas, on by default):
  on, every mismatch gets an adapter, drawn dashed and not removable while the
  switch is on; off, adapters are placed by hand (turning it off keeps the
  ones it had derived), and a mismatch without one shows a red "!" at the
  joint, a "Falta adaptador" button under the canvas, and "Línea sin
  conectar" on the pump panel: no water flows until it is placed. Fitting
  losses get their own segment and legend line in the pressure split, with
  the CGBVP value beside "sin dato". Under `us-training` the 350 gpm step will
  be labelled.
- **Building the line (owner, 2026-10-15).** Hoses are added, split, joined
  and removed on the canvas; nothing needs the inspector:
  - **Context menu:** right click, or a press held still for 0.5 s on touch,
    on a hose (insert before / after, split in two, lock or unlock its
    length, remove), a coupling (insert a hose here, join the two hoses,
    fittings), the nozzle (add a hose before it, open/shut, change nozzle),
    the engine or pump outlet (insert at the outlet, outlet fittings, pump),
    or empty canvas (add at the end, fit the view). The press that opens it
    is not also a tap.
  - **Every menu entry has a visible control too,** since nobody discovers a
    long press: the hose toolbar has "+ Tramo", "Dividir" and "🗑 Quitar";
    the coupling toolbar "+ Tramo aquí" and "Unir tramos"; a hint under the
    canvas names the menu.
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
- **Pump panel:** discharge gauge, pressure (typed, ±1, ±10, slider), the
  "apply required pressure" control, and the flow, large.
- **Controls:** no unstyled browser defaults in the main UI. Segmented
  controls for small choice sets, ± steppers for numbers, sheets or side
  panels for inspectors.

## 4. Layout

| Width | Pump panel | Canvas | Inspector | Results and formulas |
|---|---|---|---|---|
| ≥ 1024 px | top bar | centre | right column | below canvas, collapsible |
| 600–1023 px | top bar | full width | below canvas | below inspector |
| < 600 px | compact strip (pressure, flow) | full width, most of the screen | bottom sheet that slides up on selection | in the sheet, collapsible |

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
