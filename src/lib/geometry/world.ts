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
 * so the world never ends before the canvas does. Adds world to the right
 * and above, so the ground stays at the foot of a tall canvas (owner,
 * 2026-10-16: it sat in the middle); the scale is unchanged.
 * `bottomPx` reserves a bottom inset (a dock or the pressure bar) by extending
 * the world downward by that much before the height is topped up. Depends only
 * on the viewport, so it can't feed back into a drag.
 */
export function fillViewport(bounds: Bounds, widthPx: number, heightPx: number, zoom: number, bottomPx = 0): Bounds {
  const perM = PX_PER_M * zoom;
  const minY = bounds.minY - bottomPx / perM;
  const extraY = Math.max(0, heightPx / perM - (bounds.maxY - minY));
  return {
    minX: bounds.minX,
    maxX: Math.max(bounds.maxX, bounds.minX + widthPx / perM),
    minY,
    maxY: bounds.maxY + extraY,
  };
}

export type WorldNode = { x: number; y: number; distanceM: number; elevationM: number; pressurePsi: number };
export type Point = { x: number; y: number };
/** A fitting face the hose must reach exactly: the point and the forward direction there (degrees, pump→nozzle). */
export type PathAttachment = { point: Point; angle: number };
/** What a hose's path is made of, so it can be redrawn shorter at either end (see drawnHose). */
export type HoseGeometry = {
  a: Point;
  b: Point;
  /** Control point of the hanging sag's quadratic; null when there is no sag. */
  control: Point | null;
  /** Metadata only: the contour carries floor arches; never drives a hard switch. */
  piled: boolean;
  slackPx: number;
  /** The shared sampled contour the path, hit path and particles all read. */
  points: Point[];
};
export type WorldHose = {
  geom: HoseGeometry;
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

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const lerpPoint = (p: Point, q: Point, t: number): Point => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
const angleDeg = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;
const unit = (dx: number, dy: number): Point => {
  const m = Math.hypot(dx, dy);
  return m < 1e-9 || !Number.isFinite(m) ? { x: 1, y: 0 } : { x: dx / m, y: dy / m };
};
/** The unit vector of a forward direction in degrees (pump→nozzle), fallback +x. */
const axis = (deg: number): Point => {
  if (!Number.isFinite(deg)) return { x: 1, y: 0 };
  const r = (deg * Math.PI) / 180;
  return { x: Math.cos(r), y: Math.sin(r) };
};

/**
 * The hose's drawn contour: sampled points from `a` to `b` that hang as a sag
 * when there is slack in the air, and rise as smooth schematic arches where
 * the hose lies on the floor. Visual only: never a hydraulic number, and never
 * a hard switch — sag and arches blend continuously.
 *
 * The hanging sag is the shallow-curve formula capped by the floor beneath the
 * hose; whatever slack the sag can't use feeds floor arches whose height fades
 * to nothing about 2 m above the floor. As the horizontal run vanishes the
 * contour blends into compact schematic coils, so a zero-run hose never divides
 * by its chord, never jumps shape, and reads as a short stack, not a tall ring.
 */
function buildContour(a: Point, b: Point, slackPx: number, floorY: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const chordPx = Math.hypot(dx, dy);
  const chordM = chordPx / PX_PER_M;
  const slackM = Math.max(0, slackPx / PX_PER_M);
  const lengthM = chordM + slackM;

  // Truly zero-length: a point, not a shape.
  if (chordPx < 1 && slackPx < 1) return { points: [a, b], sagPx: 0, amplitudePx: 0, loopWeight: 0 };

  // Shallow-curve sag L ≈ c + 8s²/(3c), faded in smoothly at negligible slack.
  let desiredSagPx = 0;
  if (slackM > 0) {
    const baseM = chordM < 0.5 ? lengthM / 2 : Math.min(Math.sqrt((3 * chordM * slackM) / 8), lengthM / 2);
    desiredSagPx = baseM * PX_PER_M * smoothstep(0, 0.2, slackM);
  }
  // The sag can't take the curve below the floor beneath it.
  const floorSagPx = (Math.sqrt(Math.max(0, floorY - a.y)) + Math.sqrt(Math.max(0, floorY - b.y))) ** 2 / 4;
  const sagPx = Math.max(0, Math.min(desiredSagPx, floorSagPx));

  const used = desiredSagPx > 1e-6 ? (sagPx / desiredSagPx) ** 2 : 0;
  const remainingSlackPx = Math.max(0, slackPx * (1 - used));
  const waves = Math.min(12, Math.max(1, lengthM / 6));
  const amplitudePx = Math.min(4, Math.sqrt((remainingSlackPx / PX_PER_M) * Math.max(chordM, 1) / (waves * waves) * 0.3)) * PX_PER_M;

  // Neither sag nor floor slack: two exact endpoints, drawn straight.
  if (sagPx <= 0.01 && amplitudePx <= 0.01) return { points: [a, b], sagPx: 0, amplitudePx: 0, loopWeight: 0 };

  // As the horizontal run vanishes there is no line to hang along: blend the
  // contour into compact schematic coils of the stored slack over chordM 0…0.5,
  // so zero-run geometry never jumps shape and reads as a short stack rather
  // than a standing circle. The radius and turn caps are drawing choices, not a
  // hose's physical bend radius and not a hydraulic loss.
  const loopWeight = 1 - smoothstep(0, 0.5, chordM);
  const coilRadius = Math.min(0.75 * PX_PER_M, slackPx / (2 * Math.PI));
  const turns = coilRadius > 1e-9 ? Math.min(8, slackPx / (2 * Math.PI * coilRadius)) : 1;
  const baseCount = Math.max(24, Math.ceil(waves * 8));
  const n = loopWeight > 0 ? Math.min(128, Math.max(baseCount, Math.ceil(turns * 16))) : baseCount;
  const edge = Math.min(0.25, Math.max(0.04, 1 / Math.max(lengthM, 1)));
  const floorFadePx = 2 * PX_PER_M;
  const points: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const baseY = a.y + dy * t + 4 * sagPx * t * (1 - t);
    const floorWeight = 1 - smoothstep(0, floorFadePx, Math.max(0, floorY - baseY));
    const window = smoothstep(0, edge, t) * smoothstep(0, edge, 1 - t);
    const wave = Math.sin(Math.PI * waves * t) ** 2;
    const nx = a.x + dx * t;
    const ny = baseY - amplitudePx * window * wave * floorWeight;
    if (loopWeight <= 0) {
      points.push({ x: nx, y: ny });
    } else {
      const coil = 2 * Math.PI * turns * t;
      const lx = a.x + dx * t + window * coilRadius * Math.sin(coil);
      const ly = a.y + dy * t - window * coilRadius * (1 - Math.cos(coil));
      points.push({ x: nx + (lx - nx) * loopWeight, y: ny + (ly - ny) * loopWeight });
    }
  }
  points[0] = { x: a.x, y: a.y };
  points[n] = { x: b.x, y: b.y };
  return { points, sagPx, amplitudePx, loopWeight };
}

type Cubic = { p0: Point; c1: Point; c2: Point; p1: Point };

/** Catmull-Rom through the samples as cubic Béziers; the first and last points stay exact. */
function catmullSegments(points: readonly Point[]): Cubic[] {
  const n = points.length;
  if (n < 2) return [];
  const segments: Cubic[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    segments.push({
      p0: p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p1: p2,
    });
  }
  return segments;
}

function cubicAt(seg: Cubic, t: number): Point {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return {
    x: w0 * seg.p0.x + w1 * seg.c1.x + w2 * seg.c2.x + w3 * seg.p1.x,
    y: w0 * seg.p0.y + w1 * seg.c1.y + w2 * seg.c2.y + w3 * seg.p1.y,
  };
}

/** Arc length of the cubic path, sampled on the same segments the path is drawn from. */
function segmentsLength(segments: readonly Cubic[], samplesPer = 7) {
  let total = 0;
  for (const seg of segments) {
    let prev = seg.p0;
    for (let i = 1; i <= samplesPer; i++) {
      const at = cubicAt(seg, i / samplesPer);
      total += Math.hypot(at.x - prev.x, at.y - prev.y);
      prev = at;
    }
  }
  return total;
}

function renderSegments(segments: readonly Cubic[]) {
  if (!segments.length) return "";
  let d = `M ${segments[0].p0.x} ${segments[0].p0.y}`;
  for (const seg of segments) d += ` C ${seg.c1.x} ${seg.c1.y} ${seg.c2.x} ${seg.c2.y} ${seg.p1.x} ${seg.p1.y}`;
  return d;
}

/** A short cubic that leaves `p0` along `t0` and reaches `p1` along `t1`; both tangents are unit. */
function shoulder(p0: Point, t0: Point, p1: Point, t1: Point, len: number): Cubic {
  const u = len / 3;
  return {
    p0,
    c1: { x: p0.x + t0.x * u, y: p0.y + t0.y * u },
    c2: { x: p1.x - t1.x * u, y: p1.y - t1.y * u },
    p1,
  };
}

/** The contour between `startPx` and `endPx` of arc length, cut proportionally so a drawable middle always remains. */
function trimPoints(points: readonly Point[], startPx: number, endPx: number): Point[] {
  const n = points.length;
  if (n < 2) return points.slice();
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  const total = cum[n - 1];
  if (total < 1e-6) return [points[0], points[n - 1]];
  let from = Math.max(0, startPx);
  let to = Math.max(0, endPx);
  const room = total * 0.98;
  if (from + to > room) {
    const f = room / (from + to);
    from *= f;
    to *= f;
  }
  const at = (arc: number): Point => {
    if (arc <= 0) return points[0];
    if (arc >= total) return points[n - 1];
    let i = 1;
    while (i < n && cum[i] < arc) i++;
    const span = cum[i] - cum[i - 1] || 1;
    return lerpPoint(points[i - 1], points[i], (arc - cum[i - 1]) / span);
  };
  const out: Point[] = [at(from)];
  for (let i = 1; i < n - 1; i++) if (cum[i] > from && cum[i] < total - to) out.push(points[i]);
  out.push(at(total - to));
  return out;
}

function polylineLength(points: readonly Point[]) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return total;
}

/**
 * The hose's path, cut by `startPx` / `endPx` of arc length at its ends. With
 * attachments each end is capped by the exact supplied face point and forward
 * direction: a short shoulder cubic meets the middle's own tangent, or, where
 * the face already sits on the contour, the neighbouring cubic is bent to the
 * supplied axis. Every case draws the exact endpoints with the tangent asked
 * for; no segment is ever dropped. `lengthPx` is measured on the same cubics.
 */
export function drawnHose(g: HoseGeometry, startPx = 0, endPx = 0, start?: PathAttachment, end?: PathAttachment): { d: string; lengthPx: number } {
  const source = g.points && g.points.length >= 2 ? g.points : [g.a, g.b];
  const totalArc = polylineLength(source);

  // Cut a little more where a fitting is attached, so its shoulder blends into
  // a middle contour instead of reaching all the way to the face.
  const relief = (trim: number) => Math.min(Math.max(12, trim * 0.75), totalArc * 0.15);
  const middle = trimPoints(source, start ? startPx + relief(startPx) : startPx, end ? endPx + relief(endPx) : endPx);
  const pointsOr = (i: number, fallback: Point) => middle[i] ?? fallback;
  const hasMiddle = middle.length >= 2 && polylineLength(middle) > 1e-9;
  const segments: Cubic[] = [];

  if (hasMiddle) {
    const first = middle[0];
    const next = middle[1];
    const last = middle[middle.length - 1];
    const prev = middle[middle.length - 2];
    const startGap = start ? Math.hypot(first.x - start.point.x, first.y - start.point.y) : 0;
    const endGap = end ? Math.hypot(last.x - end.point.x, last.y - end.point.y) : 0;
    const middleSegs = catmullSegments(middle);

    // A face that lands on the contour: bend the neighbouring cubic to leave /
    // arrive on the supplied axis rather than dropping the attachment.
    if (start && startGap <= 1e-9 && middleSegs.length) {
      const seg = middleSegs[0];
      const d = Math.hypot(seg.c1.x - first.x, seg.c1.y - first.y) || Math.hypot(next.x - first.x, next.y - first.y) / 3 || 1;
      const t0 = axis(start.angle);
      middleSegs[0] = { ...seg, c1: { x: first.x + t0.x * d, y: first.y + t0.y * d } };
    }
    if (end && endGap <= 1e-9 && middleSegs.length) {
      const seg = middleSegs[middleSegs.length - 1];
      const d = Math.hypot(last.x - seg.c2.x, last.y - seg.c2.y) || Math.hypot(last.x - prev.x, last.y - prev.y) / 3 || 1;
      const t1 = axis(end.angle);
      middleSegs[middleSegs.length - 1] = { ...seg, c2: { x: last.x - t1.x * d, y: last.y - t1.y * d } };
    }

    if (start && startGap > 1e-9) segments.push(shoulder(start.point, axis(start.angle), first, unit(next.x - first.x, next.y - first.y), startGap));
    segments.push(...middleSegs);
    if (end && endGap > 1e-9) segments.push(shoulder(last, unit(last.x - prev.x, last.y - prev.y), end.point, axis(end.angle), endGap));
  } else if (start || end) {
    // Middle collapsed: one direct cubic, still honouring every attached face.
    const p0 = start ? start.point : pointsOr(0, g.a);
    const p1 = end ? end.point : pointsOr(middle.length - 1, g.b);
    const dir = unit(p1.x - p0.x, p1.y - p0.y);
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    segments.push(shoulder(p0, start ? axis(start.angle) : dir, p1, end ? axis(end.angle) : dir, len > 1e-9 ? len : 1));
  }

  // Keep every control finite in place; never filter a segment out (a gap).
  const sane = (p: Point, fallback: Point) => (Number.isFinite(p.x) && Number.isFinite(p.y) ? p : fallback);
  const clean = segments.map((s) => {
    const p0 = sane(s.p0, g.a);
    const p1 = sane(s.p1, g.b);
    return { p0, c1: sane(s.c1, p0), c2: sane(s.c2, p1), p1 };
  });
  if (!clean.length) {
    const p0 = start ? start.point : pointsOr(0, g.a);
    const p1 = end ? end.point : pointsOr(middle.length - 1, g.b);
    return { d: `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`, lengthPx: Math.hypot(p1.x - p0.x, p1.y - p0.y) };
  }
  return { d: renderSegments(clean), lengthPx: segmentsLength(clean) };
}

/**
 * The hose's path with `startPx` / `endPx` cut off its two ends, so a fitting
 * (a reducer) takes up space in the line and each hose stops at one of its
 * faces instead of running underneath it. Visual only.
 */
export function trimmedPath(g: HoseGeometry, startPx = 0, endPx = 0) {
  return drawnHose(g, startPx, endPx).d;
}

/** The tangent direction at a contour's first or last sample, degrees, forward (pump→nozzle). */
function contourTangent(points: readonly Point[], atStart: boolean) {
  const n = points.length;
  if (n < 2) return 0;
  return atStart ? angleDeg(points[1].x - points[0].x, points[1].y - points[0].y) : angleDeg(points[n - 1].x - points[n - 2].x, points[n - 1].y - points[n - 2].y);
}

/** The contour's arc-length midpoint and the tangent there, for the label. */
function contourMid(points: readonly Point[]): { point: Point; angle: number } {
  const n = points.length;
  if (n === 0) return { point: { x: 0, y: 0 }, angle: 0 };
  if (n === 1) return { point: points[0], angle: 0 };
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  const half = cum[n - 1] / 2;
  let i = 1;
  while (i < n && cum[i] < half) i++;
  const span = cum[i] - cum[i - 1] || 1;
  return {
    point: lerpPoint(points[i - 1], points[i], (half - cum[i - 1]) / span),
    angle: angleDeg(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y),
  };
}

/**
 * The direction a fitting follows at a joint (degrees, forward pump→nozzle). The
 * first and last joints take the pump's / nozzle's hose tangent; an internal
 * joint bends on the bisector of the end tangent meeting the next start tangent.
 * A degenerate meeting falls back to the outgoing start tangent.
 */
export function jointAngle(hoses: readonly WorldHose[], index: number): number {
  const n = hoses.length;
  if (!n) return 0;
  const startTangent = (h: WorldHose) => contourTangent(h.geom.points, true);
  const endTangent = (h: WorldHose) => contourTangent(h.geom.points, false);
  if (index <= 0) return startTangent(hoses[0]);
  if (index >= n) return endTangent(hoses[n - 1]);
  const back = hoses[index - 1];
  const forward = hoses[index];
  const a = endTangent(back) * (Math.PI / 180);
  const b = startTangent(forward) * (Math.PI / 180);
  const ux = Math.cos(a) + Math.cos(b);
  const uy = Math.sin(a) + Math.sin(b);
  if (Math.hypot(ux, uy) < 1e-9) return startTangent(forward);
  return angleDeg(ux, uy);
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
    // through it; the contour caps the sag there and arches the rest.
    const lower = Math.min(elevations[i], elevations[i + 1]);
    const floorY = yAt(Math.floor(lower / floorM + 1e-9) * floorM);
    const slackM = Math.max(0, s.lengthM - chord);
    const slackPx = slackM * PX_PER_M;
    const contour = buildContour(a, b, slackPx, floorY);
    const geom: HoseGeometry = {
      a,
      b,
      control: contour.sagPx > 0 && contour.loopWeight < 0.5 ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 2 * contour.sagPx } : null,
      piled: contour.amplitudePx > 0.5,
      slackPx,
      points: contour.points,
    };
    const mid = contourMid(contour.points);
    return {
      geom,
      d: drawnHose(geom).d,
      labelX: mid.point.x,
      labelY: mid.point.y,
      angle: mid.angle,
      startAngle: contourTangent(contour.points, true),
      endAngle: contourTangent(contour.points, false),
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
