/**
 * Canvas geometry (docs/UX.md §2). The world is in metres: horizontal is
 * real horizontal distance, vertical is height, on one uniform scale, so a
 * hose is drawn at its true length. A section spans its run and rise; if its
 * hose is longer than the straight line between its couplings, the slack is
 * drawn as a sag. Zoom is applied by the component, not here.
 *
 * Pure functions: the component draws what these return; lib/edit.ts uses
 * the same run/slack rules to keep edits physically possible.
 */

/** Pixels per metre at zoom 1, both directions: no exaggeration. */
export const PX_PER_M = 14;

/** Space kept around the content: room for the truck, the stream and a floor above and below. */
const MARGIN_M = { before: 12, after: 16 };

/** A world never narrower than this (a bare lay still has room to grow into). */
const MIN_WIDTH_M = 50;

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

type Section = { lengthM: number; endElevationM: number; diameterIn: number; runM?: number };

/** The horizontal distance a taut hose of length L covers while rising Δh. */
export function tautRunM(lengthM: number, riseM: number) {
  return Math.sqrt(Math.max(0, lengthM * lengthM - riseM * riseM));
}

/** Each section's horizontal run: its stored run, or taut when it has none. */
export function runsOf(sections: readonly Section[]) {
  let previous = 0;
  return sections.map((s) => {
    const run = s.runM ?? tautRunM(s.lengthM, s.endElevationM - previous);
    previous = s.endElevationM;
    return run;
  });
}

/** The starting world: 80 m wide, one floor below ground to three above. */
export function initialBounds(floorM: number): Bounds {
  return { minX: -MARGIN_M.before, maxX: 80, minY: -floorM, maxY: 3 * floorM };
}

/** The smallest world that holds the content with its margins, never smaller than the initial one. */
export function fitBounds(sections: readonly Section[], floorM: number): Bounds {
  const start = initialBounds(floorM);
  const elevations = [0, ...sections.map((s) => s.endElevationM)];
  const total = runsOf(sections).reduce((a, b) => a + b, 0);
  return {
    minX: start.minX,
    maxX: Math.max(MIN_WIDTH_M, Math.ceil((total + MARGIN_M.after) / 5) * 5),
    minY: Math.min(start.minY, Math.floor(Math.min(...elevations) / floorM - 1) * floorM),
    // 1.5 floors above the highest point: room for its gauge.
    maxY: Math.max(start.maxY, Math.ceil(Math.max(...elevations) / floorM + 1.5) * floorM),
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

/**
 * The bounds extended to fill a viewport of `widthPx` × `heightPx` at `zoom`,
 * so the world never ends before the canvas does. Adds world to the right,
 * and above and below in equal parts, so the lay sits in the middle of a tall
 * canvas rather than at its foot (UX.md §8.1); the scale is unchanged.
 * Depends only on the viewport, so it can't feed back into a drag.
 */
export function fillViewport(bounds: Bounds, widthPx: number, heightPx: number, zoom: number): Bounds {
  const extraY = Math.max(0, heightPx / (PX_PER_M * zoom) - (bounds.maxY - bounds.minY));
  return {
    minX: bounds.minX,
    maxX: Math.max(bounds.maxX, bounds.minX + widthPx / (PX_PER_M * zoom)),
    minY: bounds.minY - extraY / 2,
    maxY: bounds.maxY + extraY / 2,
  };
}

export type WorldNode = { x: number; y: number; distanceM: number; elevationM: number; pressurePsi: number };
export type WorldHose = {
  /** SVG path: a straight line when taut, a sag (quadratic curve) when slack. */
  d: string;
  /** Where the label sits: the curve's midpoint. */
  labelX: number;
  labelY: number;
  /** Angle of the chord, degrees, for the label. */
  angle: number;
  /** Direction of the drawn hose where it leaves / reaches its couplings, degrees (fittings follow these). */
  startAngle: number;
  endAngle: number;
  thicknessPx: number;
  slackM: number;
  index: number;
};
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

/**
 * Sag of a hose of length L hanging between points c apart, from the
 * shallow-curve approximation L ≈ c + 8s²/(3c). Visual only.
 */
function sagM(chordM: number, lengthM: number) {
  const slack = lengthM - chordM;
  if (slack <= 0.05) return 0;
  if (chordM < 0.5) return lengthM / 2;
  return Math.min(Math.sqrt((3 * chordM * slack) / 8), lengthM / 2);
}

/** The largest y (lowest on screen) of a quadratic Bézier with these y values. */
function lowestY(y0: number, yc: number, y2: number) {
  const denominator = y0 - 2 * yc + y2;
  const t = denominator === 0 ? 0.5 : (y0 - yc) / denominator;
  const at = (u: number) => (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * yc + u * u * y2;
  return Math.max(y0, y2, t > 0 && t < 1 ? at(t) : -Infinity);
}

/**
 * A hose lying on the floor with slack, drawn piled in arches along the chord
 * (visual only). Small slack: semicircles (π/2 times their chord, so 0.571 of
 * it is extra hose) from the start, then straight. More than the chord can
 * hold: arches fill the chord and grow taller (semi-ellipse, ≤ 4 m) to take
 * the length. Arches are at most 3 m across.
 */
function pileOfArches(a: { x: number; y: number }, b: { x: number; y: number }, chordPx: number, slackPx: number) {
  const saturated = slackPx / (Math.PI / 2 - 1) > chordPx;
  const covered = saturated ? chordPx : slackPx / (Math.PI / 2 - 1);
  const n = Math.max(1, Math.ceil(covered / (3 * PX_PER_M)));
  const d = covered / n;
  const rx = d / 2;
  // Semi-ellipse perimeter ≈ π·√((rx² + ry²)/2); solve for the length one arch must take.
  const target = d + (saturated ? slackPx / n : (d * (Math.PI / 2 - 1)));
  const ry = saturated ? Math.min(4 * PX_PER_M, Math.sqrt(Math.max(rx * rx, 2 * (target / Math.PI) ** 2 - rx * rx))) : rx;
  const ux = (b.x - a.x) / chordPx;
  const uy = (b.y - a.y) / chordPx;
  const rot = (Math.atan2(uy, ux) * 180) / Math.PI;
  let path = `M ${a.x} ${a.y}`;
  for (let i = 1; i <= n; i++) {
    path += ` A ${rx} ${ry} ${rot} 0 1 ${a.x + ux * d * i} ${a.y + uy * d * i}`;
  }
  return `${path} L ${b.x} ${b.y}`;
}

export function layoutWorld(
  sections: readonly Section[],
  pressuresPsi: readonly number[],
  bounds: Bounds,
  floorM: number,
  /** Floor lines stop here (the world's own top); above is plain sky added to fill the viewport. */
  floorTopM: number = bounds.maxY,
): WorldLayout {
  const xAt = (d: number) => (d - bounds.minX) * PX_PER_M;
  const yAt = (h: number) => (bounds.maxY - h) * PX_PER_M;
  const runs = runsOf(sections);
  const distances = runs.reduce((acc, r) => [...acc, acc[acc.length - 1] + r], [0]);
  const elevations = [0, ...sections.map((s) => s.endElevationM)];
  const nodes = distances.map((d, i) => ({
    x: xAt(d),
    y: yAt(elevations[i]),
    distanceM: d,
    elevationM: elevations[i],
    pressurePsi: pressuresPsi[i],
  }));

  const hoses = sections.map((s, i) => {
    const a = nodes[i];
    const b = nodes[i + 1];
    const chord = Math.hypot(runs[i], elevations[i + 1] - elevations[i]);
    // A slack hose rests on the floor beneath its lower end rather than hanging
    // through it: shrink the sag until the curve's lowest point is on that floor.
    const lower = Math.min(elevations[i], elevations[i + 1]);
    const floorY = yAt(Math.floor(lower / floorM + 1e-9) * floorM);
    let sag = sagM(chord, s.lengthM) * PX_PER_M;
    for (let k = 0; k < 30 && sag > 0 && lowestY(a.y, (a.y + b.y) / 2 + 2 * sag, b.y) > floorY; k++) sag *= 0.85;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const slackM = Math.max(0, s.lengthM - chord);
    // Slack on the floor can't hang, so it is drawn piled up in arches.
    const piled = slackM >= 0.5 && sag < 0.25 * PX_PER_M;
    const bent = !piled && sag > 0;
    const deg = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;
    const chordAngle = deg(b.x - a.x, b.y - a.y);
    return {
      // Quadratic Bézier: control point twice the sag below the midpoint puts the curve's middle at the sag.
      d: piled
        ? pileOfArches(a, b, chord * PX_PER_M, slackM * PX_PER_M)
        : sag > 0
          ? `M ${a.x} ${a.y} Q ${mx} ${my + 2 * sag} ${b.x} ${b.y}`
          : `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
      labelX: mx,
      labelY: my + sag,
      angle: chordAngle,
      startAngle: bent ? deg(mx - a.x, my + 2 * sag - a.y) : chordAngle,
      endAngle: bent ? deg(b.x - mx, b.y - (my + 2 * sag)) : chordAngle,
      thicknessPx: Math.max(3, s.diameterIn * PX_PER_INCH),
      slackM,
      index: i,
    };
  });

  // Floor lines sit on whole floors even when the bounds don't (fillViewport).
  const floors: WorldFloor[] = [];
  for (let h = Math.ceil(bounds.minY / floorM - 1e-9) * floorM; h <= Math.min(bounds.maxY, floorTopM) + 1e-9; h += floorM) {
    floors.push({ y: yAt(h), elevationM: Math.round(h * 100) / 100, number: Math.round(h / floorM) });
  }

  return {
    widthPx: (bounds.maxX - bounds.minX) * PX_PER_M,
    heightPx: (bounds.maxY - bounds.minY) * PX_PER_M,
    groundY: yAt(0),
    nodes,
    hoses,
    floors,
    xAt,
    yAt,
    distanceAt: (x) => x / PX_PER_M + bounds.minX,
    elevationAt: (y) => bounds.maxY - y / PX_PER_M,
  };
}

/** Heights snap to 0.5 m, and to a floor line when within 0.4 m of it. */
export function snapHeightM(meters: number, floorM: number) {
  // Rounded to the centimetre: a 3.1 m floor height would leave float noise (6.2000000001).
  const floor = Math.round(Math.round(meters / floorM) * floorM * 100) / 100;
  return Math.abs(meters - floor) <= 0.4 ? floor : Math.round(meters * 2) / 2;
}
