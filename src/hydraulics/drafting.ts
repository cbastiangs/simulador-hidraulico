// MODEL §3.8: fixed, primed CX teaching rig with one 5″ × 20 ft intake.
import { SUPPLY_RIG_NOZZLE } from "./catalog.ts";
import { solveAttackLine } from "./line.ts";
import { dischargePressureAt, WATEROUS_CX } from "./pump.ts";
import { POOL, poolIntakePsi } from "./pool.ts";

export const POOL_RIG = {
  minLiftM: POOL.minLiftM, maxLiftM: POOL.maxLiftM, shaftRpm: WATEROUS_CX.referenceRpm,
  hose: { lengthM: 30, frictionCoefficient: 2 },
  nozzle: SUPPLY_RIG_NOZZLE,
} as const;

// F-2093, Figure 3. The two published rows bracket this exercise's operating points.
const lowGpm = 250;
const highGpm = 350;

export function solvePoolDraft(liftM: number) {
  if (!Number.isFinite(liftM) || liftM < POOL_RIG.minLiftM || liftM > POOL_RIG.maxLiftM) {
    throw new RangeError("Lift outside pool exercise range");
  }
  function operatingPoint(flowGpm: number) {
    const intakePsi = poolIntakePsi({ liftM }, flowGpm)!;
    const dischargePsi = dischargePressureAt(WATEROUS_CX.points, flowGpm, intakePsi)!;
    const line = solveAttackLine({ pumpPressurePsi: dischargePsi, nozzleElevationM: 0,
      hose: POOL_RIG.hose, nozzle: POOL_RIG.nozzle });
    return { intakePsi, dischargePsi, flowGpm: line.flowGpm };
  }
  let low = lowGpm, high = highGpm;
  if (operatingPoint(low).flowGpm < low || operatingPoint(high).flowGpm > high) {
    throw new RangeError("Fixed lay falls outside the suction table");
  }
  while (high - low > 1e-8) {
    const trial = (low + high) / 2;
    if (operatingPoint(trial).flowGpm > trial) low = trial;
    else high = trial;
  }
  return operatingPoint((low + high) / 2);
}
