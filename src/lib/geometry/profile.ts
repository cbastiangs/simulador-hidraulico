/**
 * Side-view geometry: where each coupling, hose and floor line goes, in
 * pixels. Pure functions of the scenario and its solution, so the logic is
 * framework-free (ROADMAP §5) and components only draw what this returns.
 *
 * Horizontal is distance along the hose and vertical is height, on separate
 * scales: a lay is tens of metres long and a few metres high, so one shared
 * scale would draw it flat. Floor lines with metre labels keep the vertical
 * stretch honest.
 */

export type ProfileInput = {
  sections: readonly { lengthM: number; endElevationM: number; diameterIn: number }[];
  /** Pressure at each coupling from the solver: index 0 is the source, the last is the nozzle. */
  pressuresPsi: readonly number[];
  width: number;
  height: number;
  floorHeightM: number;
  /** A height range to keep, e.g. frozen while dragging; otherwise fitted to the line. */
  range?: ElevationRange;
};

export type ElevationRange = { low: number; high: number };

export type ProfileNode = { x: number; y: number; elevationM: number; pressurePsi: number };
export type ProfileHose = { x1: number; y1: number; x2: number; y2: number; strokePx: number; sectionIndex: number };
export type ProfileFloor = { y: number; elevationM: number };

export type ProfileLayout = {
  nodes: ProfileNode[];
  hoses: ProfileHose[];
  floors: ProfileFloor[];
  range: ElevationRange;
  /** Inverse of the vertical scale, for dragging a coupling to a height. */
  elevationAt: (y: number) => number;
};

export const MARGIN = { left: 56, right: 56, top: 64, bottom: 28 };

/** Drawn hose thickness per inch of diameter, so 1-1/2" and 2-1/2" differ visibly. */
const PX_PER_INCH = 4;

/**
 * Height range shown: from the lowest point (at least one floor below the
 * source) to one floor above the highest, in whole floors and at least three
 * floors tall. The caller freezes it while dragging: if it refitted on every
 * move, nearing the top would stretch the scale, which maps the same pointer
 * position higher, which stretches it again -- a runaway.
 */
function elevationRange(elevations: number[], floorM: number): ElevationRange {
  const low = Math.floor(Math.min(0, ...elevations) / floorM - 1) * floorM;
  const high = Math.max(Math.ceil(Math.max(0, ...elevations) / floorM + 1) * floorM, low + 3 * floorM);
  return { low, high };
}

export function layoutProfile(input: ProfileInput): ProfileLayout {
  const { sections, pressuresPsi, width, height, floorHeightM } = input;
  const elevations = [0, ...sections.map((s) => s.endElevationM)];
  const distances = sections.reduce((acc, s) => [...acc, acc[acc.length - 1] + s.lengthM], [0]);
  const totalLengthM = Math.max(distances[distances.length - 1], 1e-9);

  const range = input.range ?? elevationRange(elevations, floorHeightM);
  const { low, high } = range;
  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;
  const xAt = (distanceM: number) => MARGIN.left + (distanceM / totalLengthM) * plotWidth;
  const yAt = (elevationM: number) => MARGIN.top + ((high - elevationM) / (high - low)) * plotHeight;

  const nodes = elevations.map((elevationM, i) => ({
    x: xAt(distances[i]),
    y: yAt(elevationM),
    elevationM,
    pressurePsi: pressuresPsi[i],
  }));

  const floors: ProfileFloor[] = [];
  for (let m = low; m <= high + 1e-9; m += floorHeightM) floors.push({ y: yAt(m), elevationM: m });

  return {
    nodes,
    hoses: sections.map((s, i) => ({
      x1: nodes[i].x,
      y1: nodes[i].y,
      x2: nodes[i + 1].x,
      y2: nodes[i + 1].y,
      strokePx: Math.max(3, s.diameterIn * PX_PER_INCH),
      sectionIndex: i,
    })),
    floors,
    range,
    elevationAt: (y) => high - ((y - MARGIN.top) / plotHeight) * (high - low),
  };
}

/** Rounds a dragged height to the nearest step (0.5 m). */
export function snapM(meters: number, step = 0.5) {
  return Math.round(meters / step) * step;
}
