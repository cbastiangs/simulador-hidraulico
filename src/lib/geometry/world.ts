/**
 * Canvas geometry (docs/UX.md §2). The world is in metres: horizontal is
 * distance along the hose, vertical is height. Scales are fixed, so content
 * never changes how big a metre looks; only zoom does, and zoom is applied by
 * the component (SVG size vs. viewBox), not here.
 *
 * Pure functions: the component draws what these return.
 */

/** At zoom 1. Vertical is exaggerated ×3 so floors are tall enough to read; the canvas says so. */
export const SCALE = { xPxPerM: 8, yPxPerM: 24 } as const;
export const VERTICAL_EXAGGERATION = SCALE.yPxPerM / SCALE.xPxPerM;

/** Space kept around the content: room for the truck, the stream and a floor above and below. */
const MARGIN_M = { before: 12, after: 15 };

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

type Section = { lengthM: number; endElevationM: number; diameterIn: number };

/** The starting world: 80 m of lay, one floor below ground to three above. */
export function initialBounds(floorM: number): Bounds {
  return { minX: -MARGIN_M.before, maxX: 80, minY: -floorM, maxY: 3 * floorM };
}

function distances(sections: readonly Section[]) {
  return sections.reduce((acc, s) => [...acc, acc[acc.length - 1] + s.lengthM], [0]);
}

/** The smallest world that holds the content with its margins, never smaller than the initial one. */
export function fitBounds(sections: readonly Section[], floorM: number): Bounds {
  const start = initialBounds(floorM);
  const elevations = [0, ...sections.map((s) => s.endElevationM)];
  const total = distances(sections).at(-1)!;
  return {
    minX: start.minX,
    maxX: Math.max(start.maxX, Math.ceil((total + MARGIN_M.after) / 10) * 10),
    minY: Math.min(start.minY, Math.floor(Math.min(...elevations) / floorM - 1) * floorM),
    // 1.5 floors above the highest point: room for its gauge.
    maxY: Math.max(start.maxY, Math.ceil(Math.max(...elevations) / floorM + 1.5) * floorM),
  };
}

/**
 * The bounds extended to fill a viewport of `widthPx` × `heightPx` at `zoom`,
 * so the world never ends before the canvas does. Adds world to the right and
 * above (sky over the building, ground stays at the bottom); the scale is
 * unchanged. Depends only on the viewport, so it can't feed back into a drag.
 */
export function fillViewport(bounds: Bounds, widthPx: number, heightPx: number, zoom: number): Bounds {
  return {
    ...bounds,
    maxX: Math.max(bounds.maxX, bounds.minX + widthPx / (SCALE.xPxPerM * zoom)),
    maxY: Math.max(bounds.maxY, bounds.minY + heightPx / (SCALE.yPxPerM * zoom)),
  };
}

/** Grows `current` to hold the content; never shrinks it (UX.md §2). */
export function growBounds(current: Bounds, sections: readonly Section[], floorM: number): Bounds {
  const needed = fitBounds(sections, floorM);
  return {
    minX: Math.min(current.minX, needed.minX),
    maxX: Math.max(current.maxX, needed.maxX),
    minY: Math.min(current.minY, needed.minY),
    maxY: Math.max(current.maxY, needed.maxY),
  };
}

export type WorldNode = { x: number; y: number; distanceM: number; elevationM: number; pressurePsi: number };
export type WorldHose = { x1: number; y1: number; x2: number; y2: number; thicknessPx: number; index: number };
export type WorldFloor = { y: number; elevationM: number; number: number };

export type WorldLayout = {
  widthPx: number;
  heightPx: number;
  groundY: number;
  nodes: WorldNode[];
  hoses: WorldHose[];
  floors: WorldFloor[];
  xAt: (distanceM: number) => number;
  yAt: (elevationM: number) => number;
  distanceAt: (x: number) => number;
  elevationAt: (y: number) => number;
};

/** Drawn hose thickness per inch of diameter (world px). */
const PX_PER_INCH = 4;

export function layoutWorld(
  sections: readonly Section[],
  pressuresPsi: readonly number[],
  bounds: Bounds,
  floorM: number,
): WorldLayout {
  const xAt = (d: number) => (d - bounds.minX) * SCALE.xPxPerM;
  const yAt = (h: number) => (bounds.maxY - h) * SCALE.yPxPerM;
  const dist = distances(sections);
  const elevations = [0, ...sections.map((s) => s.endElevationM)];
  const nodes = dist.map((d, i) => ({
    x: xAt(d),
    y: yAt(elevations[i]),
    distanceM: d,
    elevationM: elevations[i],
    pressurePsi: pressuresPsi[i],
  }));
  const floors: WorldFloor[] = [];
  // Floor lines sit on whole floors even when the bounds don't (fillViewport).
  for (let h = Math.ceil(bounds.minY / floorM - 1e-9) * floorM; h <= bounds.maxY + 1e-9; h += floorM) {
    floors.push({ y: yAt(h), elevationM: h, number: Math.round(h / floorM) });
  }
  return {
    widthPx: (bounds.maxX - bounds.minX) * SCALE.xPxPerM,
    heightPx: (bounds.maxY - bounds.minY) * SCALE.yPxPerM,
    groundY: yAt(0),
    nodes,
    hoses: sections.map((s, i) => ({
      x1: nodes[i].x,
      y1: nodes[i].y,
      x2: nodes[i + 1].x,
      y2: nodes[i + 1].y,
      thicknessPx: Math.max(3, s.diameterIn * PX_PER_INCH),
      index: i,
    })),
    floors,
    xAt,
    yAt,
    distanceAt: (x) => x / SCALE.xPxPerM + bounds.minX,
    elevationAt: (y) => bounds.maxY - y / SCALE.yPxPerM,
  };
}

/** Lengths snap to whole metres, at least 1 m. */
export function snapLengthM(meters: number) {
  return Math.max(1, Math.round(meters));
}

/** Heights snap to 0.5 m, and to a floor line when within 0.4 m of it. */
export function snapHeightM(meters: number, floorM: number) {
  const floor = Math.round(meters / floorM) * floorM;
  return Math.abs(meters - floor) <= 0.4 ? floor : Math.round(meters * 2) / 2;
}
