// Keep ".ts": node --test runs this folder with no bundler, and Node resolves
// only full paths (tsconfig's allowImportingTsExtensions lets tsc accept it).
import { METHODS, type Method } from "./references.ts";
import { metersToFeet } from "./units.ts";

/**
 * One attack line: a pump discharge, one hose lay and one nozzle -- the first
 * repeatable piece of a fireground layout.
 *
 * Each element has its own pressure law, and the line is those laws solved
 * together:
 *
 *   hose     FL  = C · (Q/100)² · (L/100)   friction loss; L in feet, as C is published
 *   nozzle   NP  = NPr · (Q/Qr)²            a fixed orifice: rated flow Qr at rated pressure NPr
 *   height   EP  = k · h                    h > 0 when the nozzle is above the pump
 *   line     PDP = NP + FL + EP
 *
 * The flow is the solution, never an input: a nozzle delivers its rated flow
 * only at its rated pressure. The classic training calculation -- the pump
 * pressure a nozzle needs -- is the same equations read the other way round
 * (`requiredPumpPressurePsi`), so there is no separate "training mode".
 *
 * k comes from the calculation method (references.ts, METHODS): hydrostatic
 * 1.424 psi/m (0.434 psi/ft) by default, or the CGBVP manual's 1.5 psi/m,
 * shown beside it as the reference. A method swaps constants, never laws.
 *
 * Hose and nozzle both take the form Δp = r·Q², the element law a network
 * solver needs once lines branch. Appliances (wyes, reducers) and velocity
 * head are not modelled yet. Pressures are gauge.
 *
 * Units: metres for length and height, psi, US gpm (units.ts says why).
 */

export type HoseLay = {
  lengthM: number;
  /** C in FL = C × (Q/100)² × (L/100); published values in references.ts. */
  frictionCoefficient: number;
};

/**
 * A nozzle whose opening does not change with pressure: a smooth-bore tip,
 * or a fog nozzle left at one gallonage setting. An automatic nozzle holds
 * its pressure by changing its opening, which is a different law; it is not
 * modelled yet.
 */
export type FixedOrificeNozzle = {
  ratedFlowGpm: number;
  ratedPressurePsi: number;
  open: boolean;
};

export type AttackLine = {
  /** Pump discharge pressure: the setting the operator controls. */
  pumpPressurePsi: number;
  hose: HoseLay;
  nozzle: FixedOrificeNozzle;
  /** Height of the nozzle above the pump discharge, metres; negative when below it. */
  nozzleElevationM: number;
};

/**
 * - `flowing`: water reaches an open nozzle with pressure to spare.
 * - `nozzle-closed`: no flow, so no friction; the nozzle holds static pressure.
 * - `no-pressure`: the pump does not exceed the elevation pressure, so nothing
 *   is left at the nozzle, open or closed.
 */
export type AttackLineState = "flowing" | "nozzle-closed" | "no-pressure";

export type AttackLineResult = {
  state: AttackLineState;
  flowGpm: number;
  /**
   * At the nozzle inlet. With no flow this is the static pressure; it is
   * negative only in `no-pressure`, when the pump cannot lift water that high.
   */
  nozzlePressurePsi: number;
  frictionLossPsi: number;
  /** Signed: positive is pressure spent climbing, negative is pressure gained going down. */
  elevationPressurePsi: number;
  /** The pump pressure at which the nozzle delivers its rated flow at its rated pressure. */
  requiredPumpPressurePsi: number;
};

/** r in FL = r·Q², psi per gpm². */
function hoseResistance(hose: HoseLay) {
  return (hose.frictionCoefficient * (metersToFeet(hose.lengthM) / 100)) / 100 ** 2;
}

/** r in NP = r·Q², psi per gpm². */
function nozzleResistance(nozzle: FixedOrificeNozzle) {
  return nozzle.ratedPressurePsi / nozzle.ratedFlowGpm ** 2;
}

export function frictionLossPsi(hose: HoseLay, flowGpm: number) {
  return hoseResistance(hose) * flowGpm ** 2;
}

export function elevationPressurePsi(heightM: number, method: Method = METHODS.physical) {
  return method.psiPerMeterOfHeight * heightM;
}

export function requiredPumpPressurePsi(line: AttackLine, method: Method = METHODS.physical) {
  const { nozzle } = line;
  return (
    nozzle.ratedPressurePsi +
    frictionLossPsi(line.hose, nozzle.ratedFlowGpm) +
    elevationPressurePsi(line.nozzleElevationM, method)
  );
}

type Rule = "finite" | "zero or more" | "greater than zero";

/**
 * Invalid input is a caller's bug, not a hydraulic state: a screen keeps its
 * own values inside these bounds and only hands over lines that pass.
 */
function assertValidLine(line: AttackLine) {
  const checks: Array<[string, number, Rule]> = [
    ["pumpPressurePsi", line.pumpPressurePsi, "zero or more"],
    ["hose.lengthM", line.hose.lengthM, "zero or more"],
    ["hose.frictionCoefficient", line.hose.frictionCoefficient, "zero or more"],
    ["nozzle.ratedFlowGpm", line.nozzle.ratedFlowGpm, "greater than zero"],
    ["nozzle.ratedPressurePsi", line.nozzle.ratedPressurePsi, "greater than zero"],
    ["nozzleElevationM", line.nozzleElevationM, "finite"],
  ];
  for (const [field, value, rule] of checks) {
    const valid =
      Number.isFinite(value) &&
      (rule === "finite" || (rule === "zero or more" ? value >= 0 : value > 0));
    if (!valid) throw new RangeError(`${field} must be ${rule}, got ${value}`);
  }
}

export function solveAttackLine(line: AttackLine, method: Method = METHODS.physical): AttackLineResult {
  assertValidLine(line);
  const elevation = elevationPressurePsi(line.nozzleElevationM, method);
  const requiredPump = requiredPumpPressurePsi(line, method);
  // What the pump has left for nozzle and friction once the water is lifted.
  const head = line.pumpPressurePsi - elevation;

  if (head <= 0 || !line.nozzle.open) {
    return {
      state: head <= 0 ? "no-pressure" : "nozzle-closed",
      flowGpm: 0,
      nozzlePressurePsi: head,
      frictionLossPsi: 0,
      elevationPressurePsi: elevation,
      requiredPumpPressurePsi: requiredPump,
    };
  }

  const flowGpm = Math.sqrt(head / (nozzleResistance(line.nozzle) + hoseResistance(line.hose)));
  return {
    state: "flowing",
    flowGpm,
    nozzlePressurePsi: nozzleResistance(line.nozzle) * flowGpm ** 2,
    frictionLossPsi: frictionLossPsi(line.hose, flowGpm),
    elevationPressurePsi: elevation,
    requiredPumpPressurePsi: requiredPump,
  };
}
