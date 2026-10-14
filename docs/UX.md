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

- **World coordinates in metres.** Horizontal is distance along the hose;
  vertical is height.
- **Fixed scales.** At zoom 1: 8 px per metre horizontally, 24 px per metre
  vertically. The vertical exaggeration (×3) is fixed and shown on the
  canvas, because floors would otherwise be a few pixels tall. Content never
  changes the scale.
- **Bounds expand, never shrink, while editing.** The world is at least the
  initial size (80 m × 4 floors, one floor below ground) and grows to keep a
  margin (15 m, one floor) around the content. It shrinks only on loading a
  preset or pressing "Ajustar".
- **Viewport.** The canvas fills its area and scrolls/pans over the world.
  Zoom with pinch, wheel + Ctrl, or the − / + / Ajustar buttons. Zoom is the
  only thing that changes pixels per metre.
- **Dragging a coupling:** sideways changes the length of the section that
  ends there (snap 1 m), and everything downstream moves with it; up/down
  changes its height (snap 0.5 m, magnetic to floor lines). A live label
  shows the value while dragging. Drags start only on handles; dragging
  empty canvas pans.
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

## 6. Process

- **New screens and major visual changes start as a static mock-up**
  (rendered and sent to the owner) and are built only once approved.
- **Before handing back UI work:** check it in a browser at 390 px and
  1024 px wide, and send a screenshot.
