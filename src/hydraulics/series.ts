// Keep ".ts": node --test runs this folder with no bundler (line.ts says why).
import {
  elevationPressurePsi,
  frictionLossPsi,
  type AttackLineState,
  type FixedOrificeNozzle,
  type HoseLay,
} from "./line.ts";
import type { Term } from "./laws.ts";
import { METHODS, type FittingKind, type Method } from "./references.ts";
import { metersToFeet } from "./units.ts";

/**
 * A line of several hose sections in series: pump → section → section → …
 * → nozzle. Sections may differ in size (2-1/2" to a reducer to 1-1/2") and
 * each coupling has its own height, so the line can climb a stairwell and
 * come back down.
 *
 * Same laws as line.ts, applied per section: friction in each hose at the
 * one flow they all share, elevation from the pump to each coupling, the
 * nozzle at the end. Flow is still the solution, never an input.
 *
 * The solver is bisection on flow rather than line.ts's closed form. Today
 * every law is quadratic, so a closed form exists, but the next ones are
 * not (an automatic nozzle, a pump's capacity envelope). Bisection needs
 * only that the pressure left at the nozzle falls as flow rises, which every
 * element law here guarantees. line.ts stays as the closed-form oracle the
 * tests check this solver against.
 *
 * Fittings (adapters, in-line valves) sit at joints and cost the method's
 * fixed loss while water flows (`appliance.fixed`, MODEL.md §3.10). A
 * coupling's gauge reads upstream of the fittings at its joint; at the
 * nozzle joint they sit between the hose end and the nozzle.
 */

export type Section = {
  hose: HoseLay;
  /** Height of this section's downstream coupling above the pump discharge, metres. */
  endElevationM: number;
};

/** Joint 0 is the pump outlet, joint i the coupling after section i − 1, joint `sections.length` the nozzle inlet. */
export type Fitting = { joint: number; kind: FittingKind };

export type SeriesLine = {
  pumpPressurePsi: number;
  /** In order from the pump; at least one. The nozzle is on the last one. */
  sections: readonly Section[];
  nozzle: FixedOrificeNozzle;
  fittings?: readonly Fitting[];
};

/** Pressure at a coupling: index 0 is the pump discharge, the last is the nozzle inlet. */
export type NodeReading = {
  elevationM: number;
  pressurePsi: number;
};

export type SeriesResult = {
  /**
   * As in line.ts, except `no-pressure` checks the line's highest coupling,
   * not only the nozzle: a soft hose collapses rather than siphon water over
   * a point the pump can't reach.
   */
  state: AttackLineState;
  flowGpm: number;
  nodes: NodeReading[];
  nozzlePressurePsi: number;
  /** Summed over all sections. */
  frictionLossPsi: number;
  /** Summed over all fittings while flowing; 0 under a method with no fitting data. */
  fittingLossPsi: number;
  /** From the pump to the nozzle; signed as in line.ts. */
  elevationPressurePsi: number;
  /** The pump pressure at which the nozzle gets its rated flow at its rated pressure. */
  requiredPumpPressurePsi: number;
  /**
   * The laws applied, one term each (laws.ts), for the on-screen formulas.
   * While flowing, their values add up to the pump pressure. With no flow
   * there is no friction and no nozzle term, only elevation.
   */
  terms: Term[];
};

function totalFrictionPsi(sections: readonly Section[], flowGpm: number) {
  return sections.reduce((sum, { hose }) => sum + frictionLossPsi(hose, flowGpm), 0);
}

/** The method's fixed loss for one fitting; "sin dato" counts 0. */
const fittingLoss = (method: Method, kind: FittingKind) => method.fittingLossPsi?.[kind] ?? 0;

const lossAtJoint = (fittings: readonly Fitting[], joint: number, method: Method) =>
  fittings.filter((f) => f.joint === joint).reduce((sum, f) => sum + fittingLoss(method, f.kind), 0);

function nozzlePressureAt(nozzle: FixedOrificeNozzle, flowGpm: number) {
  return nozzle.ratedPressurePsi * (flowGpm / nozzle.ratedFlowGpm) ** 2;
}

/**
 * The root of a function that falls as its argument rises, with f(0) > 0.
 * Doubles an upper bound until f goes negative, then halves the bracket to
 * the last representable step.
 */
function rootOfDecreasing(f: (x: number) => number) {
  let low = 0;
  let high = 1;
  while (f(high) > 0) high *= 2;
  for (let i = 0; i < 200 && high - low > Number.EPSILON * high; i++) {
    const mid = (low + high) / 2;
    if (f(mid) > 0) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function assertValidSeriesLine(line: SeriesLine) {
  const fail = (field: string, rule: string, value: unknown) => {
    throw new RangeError(`${field} must be ${rule}, got ${value}`);
  };
  const atLeastZero = (field: string, value: number) => {
    if (!(Number.isFinite(value) && value >= 0)) fail(field, "zero or more", value);
  };
  const aboveZero = (field: string, value: number) => {
    if (!(Number.isFinite(value) && value > 0)) fail(field, "greater than zero", value);
  };
  atLeastZero("pumpPressurePsi", line.pumpPressurePsi);
  if (line.sections.length === 0) fail("sections", "at least one section", 0);
  line.sections.forEach(({ hose, endElevationM }, i) => {
    atLeastZero(`sections[${i}].hose.lengthM`, hose.lengthM);
    atLeastZero(`sections[${i}].hose.frictionCoefficient`, hose.frictionCoefficient);
    if (!Number.isFinite(endElevationM)) fail(`sections[${i}].endElevationM`, "finite", endElevationM);
  });
  (line.fittings ?? []).forEach(({ joint }, i) => {
    if (!(Number.isInteger(joint) && joint >= 0 && joint <= line.sections.length)) {
      fail(`fittings[${i}].joint`, `a joint from 0 to ${line.sections.length}`, joint);
    }
  });
  aboveZero("nozzle.ratedFlowGpm", line.nozzle.ratedFlowGpm);
  aboveZero("nozzle.ratedPressurePsi", line.nozzle.ratedPressurePsi);
}

export function solveSeriesLine(line: SeriesLine, method: Method = METHODS.physical): SeriesResult {
  assertValidSeriesLine(line);
  const { pumpPressurePsi, sections, nozzle } = line;
  const fittings = line.fittings ?? [];
  const allFittingsPsi = fittings.reduce((sum, f) => sum + fittingLoss(method, f.kind), 0);
  const elevations = [0, ...sections.map((s) => s.endElevationM)];
  const nozzleElevationM = elevations[elevations.length - 1];
  const elevation = elevationPressurePsi(nozzleElevationM, method);
  const requiredPumpPressurePsi =
    nozzle.ratedPressurePsi + totalFrictionPsi(sections, nozzle.ratedFlowGpm) + elevation + allFittingsPsi;

  // What the pump has left at the line's highest point once water is lifted there.
  const headAtHighestPoint = pumpPressurePsi - elevationPressurePsi(Math.max(...elevations), method);
  const flowing = headAtHighestPoint > 0 && nozzle.open;
  const flowGpm = flowing
    ? rootOfDecreasing(
        (q) => pumpPressurePsi - elevation - allFittingsPsi - totalFrictionPsi(sections, q) - nozzlePressureAt(nozzle, q),
      )
    : 0;
  // A fixed loss is only spent while water moves.
  const fittingPsiAt = (joint: number) => (flowing ? lossAtJoint(fittings, joint, method) : 0);

  // Walk the line from the pump, spending friction and height at each section.
  const nodes: NodeReading[] = [{ elevationM: 0, pressurePsi: pumpPressurePsi }];
  sections.forEach(({ hose, endElevationM }, i) => {
    const previous = nodes[i];
    nodes.push({
      elevationM: endElevationM,
      pressurePsi:
        previous.pressurePsi -
        fittingPsiAt(i) -
        frictionLossPsi(hose, flowGpm) -
        elevationPressurePsi(endElevationM - previous.elevationM, method),
    });
  });

  const terms: Term[] = sections.map(({ hose }, sectionIndex) => ({
    lawId: "hose.friction",
    sectionIndex,
    inputs: { frictionCoefficient: hose.frictionCoefficient, flowGpm, lengthFt: metersToFeet(hose.lengthM) },
    valuePsi: frictionLossPsi(hose, flowGpm),
  }));
  terms.push({
    lawId: "elevation",
    inputs: { psiPerMeter: method.psiPerMeterOfHeight, heightM: nozzleElevationM },
    valuePsi: elevation,
  });
  if (flowing) {
    for (const { joint, kind } of fittings) {
      terms.push({
        lawId: "appliance.fixed",
        joint,
        kind,
        inputs: { lossPsi: method.fittingLossPsi?.[kind] ?? null },
        valuePsi: fittingLoss(method, kind),
      });
    }
    terms.push({
      lawId: "nozzle.fixed-orifice",
      inputs: { ratedPressurePsi: nozzle.ratedPressurePsi, ratedFlowGpm: nozzle.ratedFlowGpm, flowGpm },
      valuePsi: nozzlePressureAt(nozzle, flowGpm),
    });
  }

  return {
    state: flowing ? "flowing" : headAtHighestPoint <= 0 ? "no-pressure" : "nozzle-closed",
    flowGpm,
    nodes,
    nozzlePressurePsi: nodes[nodes.length - 1].pressurePsi - fittingPsiAt(sections.length),
    frictionLossPsi: totalFrictionPsi(sections, flowGpm),
    fittingLossPsi: flowing ? allFittingsPsi : 0,
    elevationPressurePsi: elevation,
    requiredPumpPressurePsi,
    terms,
  };
}
