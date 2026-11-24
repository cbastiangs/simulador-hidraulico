import { solveScenario, solveScenarioTree, type Scenario } from "./scenario.ts";
import { scaledPumpCurve, dischargePressureAt } from "./pump.ts";
import { POOL } from "./pool.ts";
import { smoothBoreFlowGpm } from "./nozzle.ts";

/** Conditional operating point for the pool rig with an observed assisted intake. */
export function assistedDraft(scenario: Scenario, intakePsi: number, differentialPsi: number) {
  const { pump, pool } = scenario.source;
  if (!Number.isFinite(intakePsi) || !Number.isFinite(differentialPsi) || differentialPsi < 0)
    throw new RangeError("Invalid jet pressure");
  if (pool?.diameterIn !== 6 || pump?.mode !== "rpm" || !pump.speedRpm) return null;
  const net = scaledPumpCurve(pump);
  const returnGpm = smoothBoreFlowGpm(1, differentialPsi);
  const lay = { ...scenario, source: { ...scenario.source, pump: undefined, pool: undefined, tank: undefined } };
  function point(grossGpm: number) {
    const pressurePsi = dischargePressureAt(net, grossGpm, intakePsi)!;
    lay.source.pressurePsi = Math.max(0, pressurePsi);
    if (lay.wye || lay.discharges) {
      const r = solveScenarioTree(lay);
      return { pressurePsi, attackGpm: r.totalFlowGpm, balanced: r.balanced };
    }
    const r = solveScenario(lay);
    return { pressurePsi, attackGpm: r.flowGpm, balanced: !r.issues.length };
  }
  let lo = Math.max(returnGpm, POOL.minGpm), hi = Math.min(POOL.maxGpm, net.at(-1)!.flowGpm);
  if (lo > hi || point(lo).attackGpm + returnGpm < lo || point(hi).attackGpm + returnGpm > hi) return null;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (point(mid).attackGpm + returnGpm > mid) lo = mid;
    else hi = mid;
  }
  const grossGpm = (lo + hi) / 2;
  const r = point(grossGpm);
  if (r.pressurePsi < 0 || !r.balanced || Math.abs(r.attackGpm + returnGpm - grossGpm) > 1e-5) return null;
  return { grossGpm, returnGpm, attackGpm: r.attackGpm, dischargePsi: r.pressurePsi };
}
