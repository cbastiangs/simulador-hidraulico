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
  directions, so a 3 m floor is 42 px and lengths look like lengths. Content
  never changes the scale.
- **Bounds expand, never shrink, while editing.** The world is at least the
  initial size (80 m × 4 floors, one floor below ground) and grows to keep a
  margin (15 m, one floor) around the content. It shrinks only on loading a
  preset or pressing "Ajustar".
- **Viewport.** The canvas fills its area and scrolls/pans over the world.
  Zoom with pinch, wheel + Ctrl, or the − / + / Ajustar buttons. On loading
  a lay and on "Ajustar" it fits the lay to the width (never below 60 %) and
  scrolls the selected element into view; otherwise only the person changes
  the zoom.
- **Two drag modes** (toggle on the canvas; fixed length is the default):
  - **Largo fijo (tether):** the hose length is fixed. The coupling moves
    within the hose's reach and the hose sags if there is slack; dragged
    beyond reach it stops at the tether; a rise can't exceed the hose length.
    A taut hose stays taut when its height is edited (it slides along its
    reach).
  - **Libre (resize):** the coupling goes where it's dragged and the hose
    resizes to span the gap, taut (length rounded up to 0.5 m).
  In both, everything downstream moves with the dragged coupling (later
  sections keep their own run and rise). Snaps: run 0.5 m, height 0.5 m,
  magnetic to floor lines. A live label shows the values while dragging;
  drags start only on handles; dragging empty canvas pans. The horizontal
  run is drawing data only: the hydraulics use length and height (MODEL.md
  §3.2).
- **Floors** are bands labelled "Piso 1, 2…" with their height in metres.
  Floor height defaults to 3 m and is editable.

## 3. Equipment and controls

- **Hose:** thickness proportional to diameter; couplings drawn as rings at
  each joint; a reducer where the size changes; length and size labelled on
  the hose.
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

## 7. Process

- **New screens and major visual changes start as a static mock-up**
  (rendered and sent to the owner) and are built only once approved.
- **Before handing back UI work:** check it in a browser at 390 px and
  1024 px wide, and send a screenshot.
