import { solveAttackLine } from "./line.ts";
import { WATEROUS_CX, dischargePressureAt } from "./pump.ts";
import { CAPACITY, parseHydrant, supplyAtFlow, type HydrantCase, type HydrantOutlet } from "./supply.ts";
export * from "./supply.ts";

const supplyHose = { lengthM: 30, frictionCoefficient: 2 };
const nozzle = { ratedPressurePsi: 100, ratedFlowGpm: 250, open: true };

export function solveHydrantSupply(layout: HydrantCase, intakeRefPsi = 0, siameseRefPsi = 0,
  outlet: HydrantOutlet = "ideal", testFlowGpm: number = CAPACITY.default) {
  const config = parseHydrant({ layout, intakeRefPsi, siameseRefPsi, outlet, testFlowGpm });
  function at(totalGpm: number) {
    const supply = supplyAtFlow(config, totalGpm);
    const dischargePsi = dischargePressureAt(WATEROUS_CX.points, totalGpm, supply.intakePsi)!;
    const demand = solveAttackLine({ pumpPressurePsi: dischargePsi, hose: supplyHose, nozzle, nozzleElevationM: 0 });
    return { totalGpm, ...supply, dischargePsi, residualGpm: demand.flowGpm - totalGpm };
  }
  let low = 0, high = Math.min(testFlowGpm, 500); // This fixed attack line delivers below 500 gpm even at static supply pressure.
  if (at(low).residualGpm < 0 || at(high).residualGpm > 0) throw new RangeError("Outside fixed rig envelope");
  while (high - low > 1e-7) {
    const mid = (low + high) / 2;
    if (at(mid).residualGpm > 0) low = mid;
    else high = mid;
  }
  return at((low + high) / 2);
}
