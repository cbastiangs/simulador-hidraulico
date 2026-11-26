/** Waterous CX family model; MODEL §3.8 and docs/reference/pumps/waterous-cx/. */
import { supplyAtFlow, type HydrantSupply } from "./supply.ts";
import type { BalanceIssue } from "./balance.ts";

import { smoothBoreFlowGpm } from "./nozzle.ts";
import { POOL, poolIntakePsi, type PoolSupply } from "./pool.ts";

export type PumpPoint = { flowGpm: number; pressurePsi: number };
export type PumpCurve = { id: string; referenceRpm: number; minRpm: number; maxRpm: number; points: PumpPoint[] };
export type PumpConfig = { curve: PumpCurve; mode: "pressure" | "rpm"; speedRpm: number };
export type HydrantLimit = "intake-zero" | "test-flow" | "below-inlet";
export type PumpOperation = {
  status: "holding" | "limited" | "rpm" | "stopped" | "outside-curve" | "unbalanced" | "empty";
  hydrantPsi?: number | null;
  addedPsi?: number | null;
  poolLimit?: boolean;
  hydrantLimit?: HydrantLimit;
  balanceIssue?: BalanceIssue;
  intakePsi?: number | null;
  pressurePsi: number | null;
  flowGpm: number | null;
  curve: PumpPoint[];
  system: (PumpPoint | null)[];
};
export const WATEROUS_CX: PumpCurve = {
  id: "waterous-cx-810304-v1", referenceRpm: 4000, minRpm: 2600, maxRpm: 4800,
  points: [[0,224],[250,222],[500,218],[750,212],[1000,202],[1250,184],[1500,154],[1600,140]]
    .map(([flowGpm, pressurePsi]) => ({ flowGpm, pressurePsi })),
};

/** Copy and validate the numeric snapshot, including a decreasing, bounded curve. */
export function parsePump(value: unknown): PumpConfig {
  const p = value as PumpConfig;
  const c = p?.curve;
  const finitePositive = (n: number) => Number.isFinite(n) && n > 0;
  if (!c || typeof c.id !== "string" || !c.id.length || c.id.length > 100 ||
      !finitePositive(c.referenceRpm) || !finitePositive(c.minRpm) || !finitePositive(c.maxRpm) || c.minRpm > c.maxRpm ||
      !["pressure", "rpm"].includes(p.mode) || !Number.isFinite(p.speedRpm) ||
      (p.speedRpm !== 0 && (p.speedRpm < c.minRpm || p.speedRpm > c.maxRpm)) ||
      !Array.isArray(c.points) || c.points.length < 2 || c.points.length > 64 ||
      c.points.some((v, i) => !v || !Number.isFinite(v.flowGpm) || v.flowGpm < 0 || !finitePositive(v.pressurePsi) ||
        (i === 0 ? v.flowGpm !== 0 : v.flowGpm <= c.points[i-1].flowGpm || v.pressurePsi > c.points[i-1].pressurePsi))) {
    throw new RangeError("Invalid pump curve or control");
  }
  return { mode: p.mode, speedRpm: p.speedRpm, curve: { id: c.id, referenceRpm: c.referenceRpm,
    minRpm: c.minRpm, maxRpm: c.maxRpm, points: c.points.map(({flowGpm, pressurePsi}) => ({flowGpm, pressurePsi})) } };
}

export function scaledPumpCurve(p: PumpConfig): PumpPoint[] {
  const r = p.speedRpm / p.curve.referenceRpm;
  return p.curve.points.map(v => ({ flowGpm: v.flowGpm * r, pressurePsi: v.pressurePsi * r * r }));
}
export function pumpPressureAt(points: readonly PumpPoint[], q: number): number | null {
  if (!Number.isFinite(q) || q < 0 || q > points.at(-1)!.flowGpm) return null;
  for (let i = 1; i < points.length; i++) {
    const a = points[i-1], b = points[i];
    if (q <= b.flowGpm) return b.flowGpm === a.flowGpm ? a.pressurePsi : a.pressurePsi +
      (b.pressurePsi-a.pressurePsi) * (q-a.flowGpm)/(b.flowGpm-a.flowGpm);
  }
  return points.at(-1)!.pressurePsi;
}

/** MODEL §3.8: curve ordinate is net pump pressure. Intake is signed gauge psi. */
export function dischargePressureAt(curve: readonly PumpPoint[], flowGpm: number, intakePsi: number) {
  const netPsi = pumpPressureAt(curve, flowGpm);
  return netPsi === null ? null : netPsi + intakePsi;
}

/** Pressure-dependent demand comes from the existing series/tree solver, never the UI. */
export function solvePump(pump: PumpConfig, requestPsi: number,
  demand: (pressurePsi: number) => { flowGpm: number; balanced: boolean; issue?: BalanceIssue }, supply?: HydrantSupply | PoolSupply): PumpOperation {
  const p = parsePump(pump);
  const net = scaledPumpCurve(p);
  const pool = supply && "liftM" in supply ? supply : undefined;
  const hydrant = supply && "layout" in supply ? supply : undefined;
  const inlet = (q: number) => hydrant ? supplyAtFlow(hydrant, q).intakePsi : pool ? poolIntakePsi(pool, q)! : 0;
  let maxQ = Math.min(net.at(-1)!.flowGpm, hydrant?.testFlowGpm ?? (pool ? POOL.maxGpm : Infinity));
  let domainLimit: HydrantLimit | undefined = hydrant && hydrant.testFlowGpm < net.at(-1)!.flowGpm ? "test-flow" : undefined;
  if (hydrant && inlet(maxQ) < 0) {
    let lo = 0, hi = maxQ;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (inlet(mid) >= 0) lo = mid; else hi = mid;
    }
    maxQ = lo;
    domainLimit = "intake-zero";
  }
  function dischargeAt(q: number) {
    if (q > maxQ || (pool && q > 0 && q < POOL.minGpm)) return null;
    return dischargePressureAt(net, q, inlet(q));
  }
  const startQ = pool ? POOL.minGpm : 0;
  const curve = supply && maxQ < startQ ? [] : supply ? Array.from({ length: 33 }, (_, i) => {
    const flowGpm = startQ + (maxQ - startQ) * (i / 32);
    return { flowGpm, pressurePsi: dischargeAt(flowGpm)! };
  }) : net;
  const head = Math.max(0, dischargeAt(0)!);
  const system: (PumpPoint | null)[] = [];
  for (let i = 0; i <= 24; i++) {
    const pressurePsi = head * i / 24;
    const d = demand(pressurePsi);
    system.push(d.balanced && dischargeAt(d.flowGpm) !== null ? { pressurePsi, flowGpm: d.flowGpm } : null);
  }
  let poolLimit = false;
  function answer(status: PumpOperation["status"], pressurePsi: number | null, flowGpm: number | null,
    hydrantLimit?: HydrantLimit): PumpOperation {
    const result = { status, pressurePsi, flowGpm, curve, system };
    if (pool) {
      const intakePsi = flowGpm === null ? null : inlet(flowGpm);
      return { ...result, intakePsi, poolLimit,
        addedPsi: status === "stopped" ? 0 : pressurePsi === null || intakePsi === null ? null : pressurePsi - intakePsi };
    }
    if (!hydrant) return result;
    const feed = flowGpm === null ? null : supplyAtFlow(hydrant, flowGpm);
    const intakePsi = feed?.intakePsi ?? null;
    return { ...result, hydrantPsi: feed?.hydrantPsi ?? null, intakePsi,
      addedPsi: status === "stopped" ? 0 : pressurePsi === null || intakePsi === null ? null : pressurePsi - intakePsi,
      hydrantLimit: hydrantLimit ?? (domainLimit === "intake-zero" && intakePsi !== null && intakePsi < 1e-7 ? domainLimit : undefined) };
  }
  if (!p.speedRpm || (p.mode === "pressure" && requestPsi === 0)) return answer("stopped", 0, 0);
  const upper = p.mode === "pressure" ? Math.min(requestPsi, head) : head;
  const top = demand(upper);
  if (pool && top.flowGpm > 0) {
    // If the lay wants less than the first table flow even at that row's
    // available pressure, the intersection falls in the unsupported gap.
    const first = dischargeAt(POOL.minGpm);
    if (first === null || demand(Math.max(0, Math.min(upper, first))).flowGpm < POOL.minGpm) {
      poolLimit = first !== null || top.flowGpm < POOL.minGpm;
      return answer("outside-curve", null, null);
    }
  }
  const available = dischargeAt(top.flowGpm);
  if (p.mode === "pressure" && available !== null && available >= upper && upper === requestPsi) {
    if (upper < inlet(top.flowGpm)) return answer("unbalanced", null, null, "below-inlet");
    return top.balanced ? answer("holding", upper, top.flowGpm)
      : { ...answer("unbalanced", null, null), balanceIssue: top.issue };
  }
  // If demand already exceeds the known flow domain at its end pressure,
  // an intersection would require extrapolation. Pressure mode can hold a
  // lower set-point only if that point was accepted above.
  if (top.flowGpm > maxQ && demand(Math.max(0, Math.min(upper, curve.at(-1)!.pressurePsi))).flowGpm > maxQ) {
    poolLimit = !!pool && maxQ === POOL.maxGpm;
    return answer("outside-curve", null, null, domainLimit);
  }
  let lo = 0, hi = upper, x = upper;
  for (let i = 0; i < 64; i++) {
    x = (lo + hi) / 2;
    const d = demand(x), supplied = dischargeAt(d.flowGpm);
    if (pool && d.flowGpm < POOL.minGpm) lo = x;
    else if (supplied === null || supplied < x) hi = x;
    else lo = x;
    if (supplied !== null && Math.abs(supplied-x) < 1e-7) break;
  }
  const d = demand(x), supplied = dischargeAt(d.flowGpm);
  if (supplied === null) return answer("outside-curve", null, null, domainLimit);
  if (!d.balanced || Math.abs(supplied-x) > 1e-6)
    return { ...answer("unbalanced", null, null), balanceIssue: d.issue };
  return answer(p.mode === "rpm" ? "rpm" : "limited", x, d.flowGpm);
}

/** Intake gauge pressure required to retain the unassisted attack flow at fixed RPM. */
export function jetBreakEven(pump: PumpConfig, baseline: PumpOperation, nozzleDifferentialPsi: number) {
  if (!Number.isFinite(nozzleDifferentialPsi) || nozzleDifferentialPsi < 0)
    throw new RangeError("Invalid jet nozzle differential");
  if (pump.mode !== "rpm" || baseline.status !== "rpm" || baseline.flowGpm === null ||
      baseline.flowGpm <= 0 || baseline.pressurePsi === null || baseline.intakePsi == null) return null;
  const returnGpm = smoothBoreFlowGpm(1, nozzleDifferentialPsi);
  const grossGpm = baseline.flowGpm + returnGpm;
  const netPsi = pumpPressureAt(scaledPumpCurve(pump), grossGpm);
  if (netPsi === null || grossGpm > POOL.maxGpm) return null;
  return { attackGpm: baseline.flowGpm, grossGpm, returnGpm,
    requiredIntakePsi: baseline.pressurePsi - netPsi };
}
