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
import { pressureBalanced, PRESSURE_TOLERANCE_PSI, type BalanceIssue } from "./balance.ts";

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
  /** Unknown in an isolated, dry or unsolved line. */
  pressurePsi: number | null;
};

export type SeriesResult = {
  /**
   * As in line.ts, except `no-pressure` checks the line's highest coupling,
   * not only the nozzle: a soft hose collapses rather than siphon water over
   * a point the pump can't reach.
   */
  state: AttackLineState | "isolated" | "unbalanced";
  issues: BalanceIssue[];
  flowGpm: number;
  nodes: NodeReading[];
  nozzlePressurePsi: number | null;
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
  /** Pump pressure for the rated point; null when whole-tree planning is needed. */
  requiredPumpPressurePsi: number | null;
  /**
   * The laws applied, one term each (laws.ts), for the on-screen formulas.
   * At a balanced flow, their values add up to the pump pressure. A stopped
   * segment has no friction or nozzle term; a path may still have feed losses.
   */
  terms: Term[];
};

function totalFrictionPsi(sections: readonly Section[], flowGpm: number) {
  return sections.reduce((sum, { hose }) => sum + frictionLossPsi(hose, flowGpm), 0);
}

/** The method's loss for one fitting at a flow: fixed, stepped, or "sin dato" (0). */
function fittingLoss(method: Method, kind: FittingKind, flowGpm: number) {
  if (flowGpm <= 0) return 0;
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
function rootOfDecreasing(f: (x: number) => number): number | null {
  const atZero = f(0);
  if (!Number.isFinite(atZero) || atZero <= 0) return null;
  let low = 0;
  let high = 1;
  let upperResidual = f(high);
  while (Number.isFinite(upperResidual) && upperResidual > 0 && high <= Number.MAX_VALUE / 2) {
    high *= 2;
    upperResidual = f(high);
  }
  if (!Number.isFinite(upperResidual) || upperResidual > 0) return null;
  for (let i = 0; i < 200 && high - low > Number.EPSILON * high; i++) {
    const mid = (low + high) / 2;
    if (f(mid) > 0) low = mid;
    else high = mid;
  }
  const q = (low + high) / 2;
  return pressureBalanced(f(q)) ? q : null;
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
  let state: SeriesResult["state"] = headAtHighestPoint <= 0 ? "no-pressure" : nozzle.open ? "flowing" : "nozzle-closed";
  const issues: BalanceIssue[] = [];
  // The right-hand limit at zero includes the fixed allowance: it applies
  // to every positive flow, although an actual stopped line spends none.
  const fixedPsi = fittings.reduce((sum, f) => sum + (method.fittingLossPsi?.[f.kind] ?? 0), 0);
  const step = method.fittingLossPsi ? null : method.fittingStep;
  const stepPsi = step ? allFittingsPsi(fittings, method, Infinity) : 0;
  const residual = (q: number) =>
    pumpPressurePsi - elevation - fixedPsi - (step && q > step.aboveGpm ? stepPsi : 0)
    - totalFrictionPsi(sections, q) - nozzlePressureAt(nozzle, q);
  // At the step's flow, without the allowance (Q ≤ Qs counts none): spare pressure the allowance can't absorb exactly.
  const spare = step && stepPsi > 0 ? residual(step.aboveGpm) : 0;
  let unsatisfied =
    state === "flowing" && step && spare > 0 && spare <= stepPsi
      ? {
          stepGpm: step.aboveGpm,
          sparePsi: spare,
          stepPsi,
          lowPsi: pumpPressurePsi - spare,
          highPsi: pumpPressurePsi - spare + stepPsi,
        }
      : null;
  let flowGpm = 0;
  if (state === "flowing") {
    if (residual(0) <= 0) {
      state = "unbalanced";
      issues.push({ code: "allowance-gap", residualPsi: pumpPressurePsi - elevation });
    } else if (unsatisfied) {
      flowGpm = unsatisfied.stepGpm;
      issues.push({ code: "allowance-gap", residualPsi: unsatisfied.sparePsi });
    } else {
      const root = rootOfDecreasing(residual);
      if (root === null) {
        state = "unbalanced";
        issues.push({ code: "pressure-balance", residualPsi: residual(0) });
      } else flowGpm = root;
    }
  }
  // A loss is only spent while water moves.
  const fittingPsiAt = (joint: number) => lossAtJoint(fittings, joint, method, flowGpm);

  // Walk the line from the pump, spending friction and height at each section.
  const pressures = [pumpPressurePsi];
  sections.forEach(({ hose, endElevationM }, i) => {
    pressures.push(pressures[i] - fittingPsiAt(i) - frictionLossPsi(hose, flowGpm)
      - elevationPressurePsi(endElevationM - elevations[i], method));
  });
  const minimum = Math.min(...pressures.map((p, i) => p - fittingPsiAt(i)));
  if (flowGpm > 0 && minimum < -PRESSURE_TOLERANCE_PSI) {
    state = "no-pressure";
    flowGpm = 0;
    unsatisfied = null;
    issues.splice(0, issues.length, { code: "high-point", residualPsi: minimum });
  }
  const available = state === "flowing" || state === "nozzle-closed";
  const nodes = elevations.map((elevationM, i) => ({
    elevationM, pressurePsi: i === 0 || available ? pressures[i] : null,
  }));

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
  if (flowGpm > 0) {
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
    state,
    issues,
    flowGpm,
    nodes,
    nozzlePressurePsi: available ? pressures.at(-1)! - fittingPsiAt(sections.length) : null,
    frictionLossPsi: totalFrictionPsi(sections, flowGpm),
    fittingLossPsi: allFittingsPsi(fittings, method, flowGpm),
    unsatisfied,
    elevationPressurePsi: elevation,
    requiredPumpPressurePsi,
    terms,
  };
}
