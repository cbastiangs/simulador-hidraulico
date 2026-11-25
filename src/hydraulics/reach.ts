import type { NozzleDesign } from "./nozzle.ts";

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
 * Inside the table's pressures and flows, straight stream, the reach is
 * stated; outside it the same curve draws an illustrative stream. Every other
 * nozzle draws an illustrative stream from one cross-maker curve, R = 14.3 · Q^0.25 m (11
 * handline points at 100 psi, within 11 %), with no number on screen. That
 * curve carries pressure only through the flow: the per-nozzle tables leave a
 * pressure exponent of 0.08–0.18 once Q is the actual flow, too small to
 * add a separate factor for.
 *
 * A fog pattern shortens either by up to 70 % at the widest setting
 * (illustrative; no data).
 */

/** Legacy drawing angle for scenarios without an explicit aim. */
export const DEFAULT_AIM_DEG = 32;

type NozzleReach = {
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

const akron439Reach: NozzleReach = { testAngleDeg: 32, fitRows: 2, maxTableDeviationPct: null, c: 61.48, a: 0, b: 0.4185, psi: [50, 80], gpm: [182, 230] };

/**
 * Per catalog spec id (catalog.ts). Least-squares fits in log space to the
 * "overall" rows of data/catalog/nozzle-reach.csv; tests/nozzle.test.mjs
 * checks each against its rows.
 */
export const NOZZLE_REACH: Readonly<Record<string, NozzleReach>> = {
  // Akron Turbojet table, 1714–1720 group: 4 settings × 75/100/125 psi, 12 points.
  "AKR-17204001": { testAngleDeg: 32, fitRows: 12, maxTableDeviationPct: 4.1, c: 9.83, a: 0.328, b: 0.076, psi: [75, 125], gpm: [26, 140] },
  // Same table, 1722/1723 group: 4 settings × 3 pressures, 12 points.
  "AKR-1723P": { testAngleDeg: 32, fitRows: 12, maxTableDeviationPct: 4.1, c: 10.90, a: 0.308, b: 0.184, psi: [75, 125], gpm: [82, 224] },
  // Fire Armour's Protek 368 table: 5 settings × 3 pressures, 15 points (angle not stated).
  "PRO-368": { testAngleDeg: null, fitRows: 15, maxTableDeviationPct: 5.2, c: 13.16, a: 0.263, b: 0.167, psi: [75, 125], gpm: [82, 280] },
  // Generic 7/8″ and 15/16″ tips, from Akron's style 1430 7/8″ and style 439 15/16″ solid-bore tips
  // at 50 and 80 psi (2 points each, so the curve passes through both). One tip: its flow follows NP,
  // so the curve is in NP alone.
  "smooth-bore-7-8": { testAngleDeg: 32, fitRows: 2, maxTableDeviationPct: null, c: 56.69, a: 0, b: 0.3014, psi: [50, 80], gpm: [159, 201] },
  "AKR-439-15-16": akron439Reach,
  "smooth-bore-15-16": akron439Reach,
};

/** Where a stated reach requires straight stream. */
const STRAIGHT = 0.05;
const defaultAngle = DEFAULT_AIM_DEG * Math.PI / 180;
const FALLBACK = { c: 14.3, a: 0.25 };

export type StreamReach = {
  /** Horizontal distance to where the stream lands, at the nozzle's height, metres. */
  reachM: number;
  /** Vertical control-point scale of the illustrative arc. */
  riseScaleM: number;
  /** Straight-stream table fit at this operating point, independent of the selected aim. */
  referenceM: number | null;
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

export function streamReach(
  specId: string | null, design: NozzleDesign, flowGpm: number, nozzlePressurePsi: number, pattern: number,
  aimDeg = DEFAULT_AIM_DEG,
): StreamReach {
  if (!(flowGpm > 0) || !(nozzlePressurePsi > 0))
    return { reachM: 0, riseScaleM: 0, referenceM: null, angleProjectionM: null, fitted: false };
  // An open hose retains its removed nozzle's id for reattachment.
  const id = design === "open-end" ? null : specId;
  const fit = id === null ? undefined : NOZZLE_REACH[id];
  const straight = nozzleReachM(id, flowGpm, nozzlePressurePsi) ?? genericReachM(flowGpm);
  const referenceM = fit && nozzlePressurePsi >= fit.psi[0] && nozzlePressurePsi <= fit.psi[1]
    && flowGpm >= fit.gpm[0] && flowGpm <= fit.gpm[1] ? straight : null;
  const spread = design === "fog" ? Math.min(1, Math.max(0, pattern)) : 0;
  const base = straight * (1 - 0.7 * spread);
  // Illustrative projection (MODEL §3.14). Keep both axes finite at vertical.
  const angle = aimDeg * Math.PI / 180;
  const span = base * Math.sin(angle) / (Math.sin(defaultAngle) * Math.cos(defaultAngle));
  const reachM = aimDeg === 90 ? 0 : span * Math.cos(angle);
  const hasAngleReference = referenceM !== null && fit?.testAngleDeg != null && spread <= STRAIGHT;
  return {
    reachM,
    angleProjectionM: hasAngleReference && aimDeg !== fit.testAngleDeg ? reachM : null,
    riseScaleM: span * Math.sin(angle),
    referenceM,
    fitted: hasAngleReference && aimDeg === fit.testAngleDeg,
  };
}
