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
 * fixed loss while water flows (`appliance.fixed`), or its stepped allowance
 * (`appliance.step`: 0 up to 350 gpm, 10 psi above), MODEL.md §3.10. A
 * coupling's gauge reads upstream of the fittings at its joint; at the
 * nozzle joint they sit between the hose end and the nozzle.
 *
 * The step can leave no balanced flow (MODEL.md §2): for a pump pressure
 * inside the step, the line has pressure to spare at the step's flow without
 * the allowance and too little with it. That is reported, not smoothed:
 * the flow is the step's flow, `unsatisfied` says by how much the balance
 * misses, and the gauges show the allowance not yet counted.
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
  /**
   * The stepped allowance left no balanced flow (MODEL.md §2): `flowGpm` is
   * the step's flow, not a balanced root. `sparePsi` is the pressure left
   * over there without the allowance; `stepPsi` what the allowance would
   * take. Pump pressures from `lowPsi` to `highPsi` all land in the step.
   */
  unsatisfied: { stepGpm: number; sparePsi: number; stepPsi: number; lowPsi: number; highPsi: number } | null;
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

/** The method's loss for one fitting at a flow: fixed, stepped, or "sin dato" (0). */
function fittingLoss(method: Method, kind: FittingKind, flowGpm: number) {
  if (method.fittingLossPsi) return method.fittingLossPsi[kind];
  const step = method.fittingStep;
  return step && flowGpm > step.aboveGpm ? step.lossPsi : 0;
}

const lossAtJoint = (fittings: readonly Fitting[], joint: number, method: Method, flowGpm: number) =>
  fittings.filter((f) => f.joint === joint).reduce((sum, f) => sum + fittingLoss(method, f.kind, flowGpm), 0);

const allFittingsPsi = (fittings: readonly Fitting[], method: Method, flowGpm: number) =>
  fittings.reduce((sum, f) => sum + fittingLoss(method, f.kind, flowGpm), 0);

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
  const elevations = [0, ...sections.map((s) => s.endElevationM)];
  const nozzleElevationM = elevations[elevations.length - 1];
  const elevation = elevationPressurePsi(nozzleElevationM, method);
  const requiredPumpPressurePsi =
    nozzle.ratedPressurePsi +
    totalFrictionPsi(sections, nozzle.ratedFlowGpm) +
    elevation +
    allFittingsPsi(fittings, method, nozzle.ratedFlowGpm);

  // What the pump has left at the line's highest point once water is lifted there.
  const headAtHighestPoint = pumpPressurePsi - elevationPressurePsi(Math.max(...elevations), method);
  const flowing = headAtHighestPoint > 0 && nozzle.open;
  // Pressure left over at flow q once every element has taken its share.
  const residual = (q: number) =>
    pumpPressurePsi - elevation - allFittingsPsi(fittings, method, q) - totalFrictionPsi(sections, q) - nozzlePressureAt(nozzle, q);
  const step = method.fittingLossPsi ? null : method.fittingStep;
  const stepPsi = step ? allFittingsPsi(fittings, method, Infinity) : 0;
  // At the step's flow, without the allowance (Q ≤ Qs counts none): spare pressure the allowance can't absorb exactly.
  const spare = step && stepPsi > 0 ? residual(step.aboveGpm) : 0;
  const unsatisfied =
    flowing && step && spare > 0 && spare < stepPsi
      ? {
          stepGpm: step.aboveGpm,
          sparePsi: spare,
          stepPsi,
          lowPsi: pumpPressurePsi - spare,
          highPsi: pumpPressurePsi - spare + stepPsi,
        }
      : null;
  const flowGpm = !flowing ? 0 : unsatisfied ? unsatisfied.stepGpm : rootOfDecreasing(residual);
  // A loss is only spent while water moves.
  const fittingPsiAt = (joint: number) => (flowing ? lossAtJoint(fittings, joint, method, flowGpm) : 0);

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
      terms.push(
        step
          ? {
              lawId: "appliance.step",
              joint,
              kind,
              inputs: { aboveGpm: step.aboveGpm, stepPsi: step.lossPsi, flowGpm },
              valuePsi: fittingLoss(method, kind, flowGpm),
            }
          : {
              lawId: "appliance.fixed",
              joint,
              kind,
              inputs: { lossPsi: method.fittingLossPsi?.[kind] ?? null },
              valuePsi: fittingLoss(method, kind, flowGpm),
            },
      );
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
    fittingLossPsi: flowing ? allFittingsPsi(fittings, method, flowGpm) : 0,
    unsatisfied,
    elevationPressurePsi: elevation,
    requiredPumpPressurePsi,
    terms,
  };
}
