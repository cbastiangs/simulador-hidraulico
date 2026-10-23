import type { ScenarioNozzle } from "$hydraulics/scenario.ts";

/**
 * The per-model nozzle art (owner, 2026-10-19): every researched model draws
 * its own two views from the product's own plate or photo, instead of the
 * generic shape both views fell back to. One file per `data/catalog/nozzles.csv`
 * row, named after its specId in lower case; `index.ts` maps them.
 *
 * Two coordinate frames, one per view:
 *
 * SIDE — what `NozzleDrawing.svelte` draws on the lay canvas, one icon ~52–64
 *   units long, hose at x = 0. As on the canvas today, length is compressed
 *   (a nozzle cannot be true-scale next to an exaggerated hose and a 24 px
 *   floor band); what stays true is shape and every diameter ratio — and the side is one fixed 0.7 of the top view's diameters (owner, 2026-10-22: the two views must agree on proportions; a handline's 1½ in swivel is 33 units across in the top view, so 23 here) — the
 *   bumper wider than the barrel, the grip's length, the bale's sweep.
 *   y = 0 is the nozzle's axis, up is negative y. Keep within x ∈ [−2, 66],
 *   y ∈ [−26, 20]. The hose, its colour band and the stream are the
 *   component's; do not draw them.
 *
 * TOP — what `NozzleCloseUp.svelte` draws ("vista desde arriba"), one fixed
 *   canvas 400 × 176, axis y = 88, hose 0–38 of the component. True scale:
 *   14 units = 1 inch, on both axes (so a 1½ in inlet is 21 units tall and a
 *   4 in bumper 56), and true across models (a 4AN draws short, a master
 *   stream long). Model from x = 36 to `tipX` ≤ 386. Keep within y ∈ [26, 152].
 *   This is a plan projection: draw only what is visible from directly above.
 *   Parts that hang below the axis — a pistol grip above all — are hidden by
 *   the body and are not drawn; a bale is the thin edge of its loop, never
 *   its side-view height. Never copy side-view radii or heights into this
 *   frame.
 *
 * Paths are fill-only outlines (`d` + a palette `role`); no strokes, no text,
 * no filters. Array order is z-order: later paths paint over earlier ones.
 * Draw each part as its own path so seams stay clean; 8–25 commands per path
 * is plenty — the views are 350 px and 60 px wide on screen. Rounded corners
 * (Q/C) wherever the moulding is round; kinks where the part really kinks.
 *
 * The moving shutoff is NOT part of `shell` in either view: the component
 * animates it (a bale's swing, a slide's travel, a ball's quarter turn) from
 * the two end poses (`side.shutoff`) or from the anchors (`top.shutoff`).
 * The gallonage numbers on a ring are the component's too — they travel as
 * the ring turns (`top.ring`); `side.flowLabel` only says where the canvas
 * icon prints its rated-flow tag.
 *
 * Check a drawing by rasterizing it before handing it back: paste the paths
 * into a scratch SVG (holds: dark #23272b, steel #8f989f, brass #b08d57,
 * grip #2b2f33, label #e8eaec, red #c0392b, yellow #e8c02a, orange
 * #e07f2a, blue #2aa7c4), `pnpm shot file:///…/scratch.svg /tmp/…/check.png`,
 * then look at the png against the reference photo.
 */

export type ArtRole = "dark" | "steel" | "brass" | "grip" | "label" | "red" | "yellow" | "orange" | "blue";

export type ArtPath = {
  d: string;
  role: ArtRole;
  /** An SVG transform for the path (translate/rotate about a pivot): the same shape placed twice — a bale's two poses, a lug mirrored. */
  t?: string;
  /** Paint order only — 1 for a shadow or a recess, never for fading a part out. */
  opacity?: number;
};

/** The moving shutoff on the side view, in its two end poses; `hit` is the tap target. */
export type SideShutoff = {
  open: ArtPath[];
  closed: ArtPath[];
  hit: { x: number; y: number; r: number };
};

export type SideArt = {
  /** Everything static: inlet swivel and lugs, body, grip, barrel, rings, collar, teeth. */
  shell: ArtPath[];
  /** Null for a model with no shutoff (masters) or a fixed one. */
  shutoff: SideShutoff | null;
  /** Where the water leaves the drawing: the tip's front edge, and the stream's half-width there. */
  exit: { x: number; half: number };
  /** Where a selectable's rated-flow tag prints (above the ring); null when nothing should. */
  flowLabel: { x: number; y: number } | null;
  /** Overall drawn length; the tap-grab strip covers −12 → length. */
  length: number;
};

/**
 * A numbered ring in the top view: the band the component prints its turning
 * numbers on. `r` is the ring's drawn radius (half the band's height), so the
 * numbers wrap around a circle of that radius; `ink` is the numbers' colour
 * over the band's own fill.
 */
export type TopRing = { from: number; to: number; r: number; ink: string };

/** The pressure-selection ring (POK 50/100 psi): drawn as part of the model, never worked. */
export type TopPressure = { from: number; to: number; r: number; ink: string };

/**
 * The pattern collar's turn zone: the component overlays its ridge count and
 * slides the ridges around the collar's axis as it turns. `r` is the ridge
 * circle's radius; `ink` the ridges' colour over the collar's own fill.
 */
export type TopCollar = { from: number; to: number; r: number; ribs: number; ink: string };

/**
 * Where the component anchors the moving shutoff on the top view. Bale: the
 * loop seen edge-on — a slim bar from the pivot at `pivotX` reaching `arm`
 * fore-aft along the axis (forward is shut, back is open), its plane at
 * `offset` from the axis (omit it for a loop centred over the body). Slide:
 * the knob rides its rail, forward shut. Ball: the lever turns about
 * (`pivotX`, axis), along the body = open, across = shut.
 */
export type TopShutoff =
  | { kind: "bale"; pivotX: number; arm: number; offset?: number }
  | { kind: "slide"; railFrom: number; railTo: number; railY: number; knobW: number; knobH: number }
  | { kind: "ball"; pivotX: number; barLen: number }
  | { kind: "none" };

export type TopArt = {
  /** Everything static, the collar and teeth included; the working parts are the component's. */
  shell: ArtPath[];
  ring: TopRing | null;
  pressure: TopPressure | null;
  collar: TopCollar | null;
  /** Where the stream leaves, on the axis. */
  tipX: number;
  shutoff: TopShutoff;
};

export type NozzleArt = { side: SideArt; top: TopArt };

/** The art for a scenario nozzle, or null to keep the generic drawing. */
export type ArtLookup = (nozzle: ScenarioNozzle) => NozzleArt | null;
