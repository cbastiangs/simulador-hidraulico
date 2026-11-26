import type { ScenarioNozzle } from "./scenario.ts";
import { STANDARD_GRAVITY } from "./units.ts";
import { nozzleExitVelocityMps } from "./velocity.ts";

/**
 * Stream reach (docs/MODEL.md §3.14, `stream.reach`).
 *
 * Fitted, not derived: drag and jet breakup set a real stream's reach, and a
 * ballistic arc overstates it (manual pp. 76–77). Each catalog nozzle with a
 * published reach table gets its own curve, fitted to that table
 * (data/catalog/nozzle-reach.csv, sources in docs/reference/nozzles/SOURCES.md):
 *
 *   R = c · Q^a · (NP/100)^b   metres, "overall" reach (farthest droplets),
 *   Q the actual flow (gpm), NP the nozzle pressure (psi), straight stream,
 *   at the documented test angle where available.
 *
 * At a tested setting or tip and within its pressure interval, straight stream, the reach is
 * stated; outside it the same curve draws an illustrative stream. Every other
 * nozzle draws an illustrative stream from one cross-maker curve, R = 14.3 · Q^0.25 m (11
 * handline points at 100 psi, within 11 %), labelled as illustrative. That
 * curve carries pressure only through the flow: the per-nozzle tables leave a
 * pressure exponent of 0.08–0.18 once Q is the actual flow, too small to
 * add a separate factor for.
 *
 * A fog pattern shortens either by up to 70 % at the widest setting
 * (illustrative; no data).
 */

/** Legacy drawing angle for scenarios without an explicit aim. */
export const DEFAULT_AIM_DEG = 32;

/** Published rows grouped by the ring setting or exposed tip. Distances are in metres. */
type TestPoint = readonly [pressurePsi: number, flowGpm: number, effectiveM: number, overallM: number];
type ReachTests =
  | { tipIn: number; points: readonly TestPoint[] }
  | { ratedPressurePsi: number; settings: Readonly<Record<number, readonly TestPoint[]>> };

type NozzleReach = {
  tests: ReachTests;
  /** R = c · Q^a · (NP/100)^b */
  c: number; a: number; b: number;
  testAngleDeg: number | null;
  /** Absolute relative deviation from the fitted overall-reach rows, rounded to 0.1%.
   * A two-point fit has no independent check and omits this statistic. */
  fitRows: number;
  maxTableDeviationPct: number | null;
  /** The published table's span: the curve is stated only inside it. */
  psi: readonly [number, number];
  gpm: readonly [number, number];
};

const akron439Reach: NozzleReach = {
  testAngleDeg: 32, fitRows: 2, maxTableDeviationPct: null, c: 61.48, a: 0, b: 0.4185, psi: [50, 80], gpm: [182, 230],
  tests: { tipIn: 15 / 16, points: [[50, 182, 43, 46], [80, 230, 53, 56]] },
};

/**
 * Per catalog spec id (catalog.ts). Least-squares fits in log space to the
 * "overall" rows of data/catalog/nozzle-reach.csv; tests/nozzle.test.mjs
 * checks each against its rows.
 */
export const NOZZLE_REACH: Readonly<Record<string, NozzleReach>> = {
  // Akron Turbojet table, 1714–1720 group: 4 settings × 75/100/125 psi, 12 points.
  "AKR-17204001": {
    testAngleDeg: 32, fitRows: 12, maxTableDeviationPct: 4.1, c: 9.83, a: 0.328, b: 0.076, psi: [75, 125], gpm: [26, 140],
    tests: { ratedPressurePsi: 100, settings: {
      30: [[75, 26, 24, 27], [100, 30, 26, 29], [125, 34, 30, 33]],
      60: [[75, 52, 33, 36], [100, 60, 35, 38], [125, 67, 37, 40]],
      95: [[75, 82, 39, 42], [100, 95, 41, 44], [125, 106, 44, 47]],
      125: [[75, 108, 40, 45], [100, 125, 43, 46], [125, 140, 46, 49]],
    } },
  },
  // Same table, 1722/1723 group: 4 settings × 3 pressures, 12 points.
  "AKR-1723P": {
    testAngleDeg: 32, fitRows: 12, maxTableDeviationPct: 4.1, c: 10.90, a: 0.308, b: 0.184, psi: [75, 125], gpm: [82, 224],
    tests: { ratedPressurePsi: 100, settings: {
      95: [[75, 82, 36, 39], [100, 95, 43, 46], [125, 106, 44, 47]],
      125: [[75, 108, 39, 42], [100, 125, 47, 50], [125, 140, 49, 52]],
      150: [[75, 130, 44, 47], [100, 150, 49, 52], [125, 168, 53, 56]],
      200: [[75, 173, 49, 52], [100, 200, 52, 55], [125, 224, 55, 58]],
    } },
  },
  // Protek 368, catalogue p. 86: 5 settings × 3 pressures, 32° in still air.
  "PRO-368": {
    testAngleDeg: 32, fitRows: 15, maxTableDeviationPct: 5.2, c: 13.16, a: 0.263, b: 0.167, psi: [75, 125], gpm: [82, 280],
    tests: { ratedPressurePsi: 100, settings: {
      95: [[75, 82, 35, 38], [100, 95, 42, 45], [125, 106, 44, 47]],
      125: [[75, 108, 38, 41], [100, 125, 45, 48], [125, 140, 47, 50]],
      150: [[75, 130, 44, 47], [100, 150, 48, 51], [125, 168, 48, 51]],
      200: [[75, 173, 47, 50], [100, 200, 51, 54], [125, 224, 53, 56]],
      250: [[75, 217, 48, 51], [100, 250, 53, 56], [125, 280, 56, 59]],
    } },
  },
  // Generic 7/8″ and 15/16″ tips, from Akron's style 1430 7/8″ and style 439 15/16″ solid-bore tips
  // at 50 and 80 psi (2 points each, so the curve passes through both). One tip: its flow follows NP,
  // so the curve is in NP alone.
  "smooth-bore-7-8": {
    testAngleDeg: 32, fitRows: 2, maxTableDeviationPct: null, c: 56.69, a: 0, b: 0.3014, psi: [50, 80], gpm: [159, 201],
    tests: { tipIn: 7 / 8, points: [[50, 159, 40, 46], [80, 201, 48, 53]] },
  },
  "AKR-439-15-16": akron439Reach,
  "smooth-bore-15-16": akron439Reach,
};

const defaultAngle = DEFAULT_AIM_DEG * Math.PI / 180;
const FALLBACK = { c: 14.3, a: 0.25 };

export type StreamReach = {
  /** Horizontal span of the drawing, anchored to overall reach for a fitted stream. */
  reachM: number;
  /** Vertical control-point scale of the illustrative arc. */
  riseScaleM: number;
  /** Straight-stream table fit at this operating point, independent of the selected aim. */
  referenceM: number | null;
  /** Closest published pressure for this configuration. This row always describes straight stream. */
  testPoint: { pressurePsi: number; flowGpm: number; effectiveM: number; overallM: number } | null;
  /** Same-height span reportable as an unvalidated off-angle projection. */
  angleProjectionM: number | null;
  /** True when aim, pattern, pressure and flow match the table. */
  fitted: boolean;
};

/** The illustrative cross-maker curve: overall reach of a straight stream from its flow alone. */
export function genericReachM(flowGpm: number) {
  return FALLBACK.c * Math.max(0, flowGpm) ** FALLBACK.a;
}

/** Overall reach of a straight stream from the nozzle's own curve, or null when it has none. */
export function nozzleReachM(specId: string | null, flowGpm: number, nozzlePressurePsi: number) {
  const fit = specId === null ? undefined : NOZZLE_REACH[specId];
  return fit ? fit.c * flowGpm ** fit.a * (nozzlePressurePsi / 100) ** fit.b : null;
}

/** A saved nozzle carries its equipment values as well as its catalog id. */
export function reachTableFor(nozzle: ScenarioNozzle) {
  const id = nozzle.specId;
  if (!id || !Object.hasOwn(NOZZLE_REACH, id)) return undefined;
  const fit = NOZZLE_REACH[id];
  const tests = fit.tests;
  if ("tipIn" in tests)
    return nozzle.design === "smooth-bore" && nozzle.tipIn === tests.tipIn ? fit : undefined;
  return (nozzle.design ?? "fog") === "fog" && nozzle.kind === "selectable"
    && nozzle.ratedPressurePsi === tests.ratedPressurePsi && Object.hasOwn(tests.settings, nozzle.ratedFlowGpm)
    ? fit : undefined;
}

export function streamReach(nozzle: ScenarioNozzle, flowGpm: number, nozzlePressurePsi: number): StreamReach {
  if (!(flowGpm > 0) || !(nozzlePressurePsi > 0))
    return { reachM: 0, riseScaleM: 0, referenceM: null, testPoint: null, angleProjectionM: null, fitted: false };

  const fit = reachTableFor(nozzle);
  const straight = fit ? nozzleReachM(nozzle.specId, flowGpm, nozzlePressurePsi)! : genericReachM(flowGpm);
  const points = fit && ("tipIn" in fit.tests ? fit.tests.points : fit.tests.settings[nozzle.ratedFlowGpm]);
  const inRange = points && nozzlePressurePsi >= points[0][0] && nozzlePressurePsi <= points[points.length - 1][0];
  const nearest = inRange ? points.reduce((best, row) =>
    Math.abs(row[0] - nozzlePressurePsi) < Math.abs(best[0] - nozzlePressurePsi) ? row : best) : null;

  const spread = (nozzle.design ?? "fog") === "fog" ? nozzle.pattern : 0;
  const aimDeg = nozzle.aimDeg ?? DEFAULT_AIM_DEG;
  const angle = aimDeg * Math.PI / 180;
  const hasAngleReference = !!nearest && fit?.testAngleDeg != null && spread === 0;
  const fitted = hasAngleReference && aimDeg === fit.testAngleDeg;
  // Horizontal and vertical control scales share this factor. Bounding it before
  // the sin/cos projection also keeps a vertical stream finite at low pressure.
  const base = straight * (1 - 0.7 * spread);
  const projectedScale = base / (Math.sin(defaultAngle) * Math.cos(defaultAngle));
  const maxScale = 2 * nozzleExitVelocityMps(nozzlePressurePsi) ** 2 / STANDARD_GRAVITY;
  const span = (fitted ? projectedScale : Math.min(projectedScale, maxScale)) * Math.sin(angle);
  const reachM = aimDeg === 90 ? 0 : span * Math.cos(angle);
  return {
    reachM,
    riseScaleM: span * Math.sin(angle),
    referenceM: nearest ? straight : null,
    testPoint: nearest ? { pressurePsi: nearest[0], flowGpm: nearest[1], effectiveM: nearest[2], overallM: nearest[3] } : null,
    angleProjectionM: hasAngleReference && !fitted ? reachM : null,
    fitted,
  };
}
