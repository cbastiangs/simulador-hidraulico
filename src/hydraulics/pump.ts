/** Waterous CX family model; MODEL §3.8 and docs/reference/pumps/waterous-cx/. */
export type PumpPoint = { flowGpm: number; pressurePsi: number };
export type PumpCurve = { id: string; referenceRpm: number; minRpm: number; maxRpm: number; points: PumpPoint[] };
export type PumpConfig = { curve: PumpCurve; mode: "pressure" | "rpm"; speedRpm: number };
export type PumpOperation = {
  status: "holding" | "limited" | "rpm" | "stopped" | "outside-curve" | "unbalanced";
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

/** Pressure-dependent demand comes from the existing series/tree solver, never the UI. */
export function solvePump(pump: PumpConfig, requestPsi: number,
  demand: (pressurePsi: number) => { flowGpm: number; balanced: boolean }): PumpOperation {
  const p = parsePump(pump);
  const curve = scaledPumpCurve(p);
  const maxQ = curve.at(-1)!.flowGpm;
  const head = curve[0].pressurePsi;
  const system: (PumpPoint | null)[] = [];
  for (let i = 0; i <= 24; i++) {
    const pressurePsi = head * i / 24;
    const d = demand(pressurePsi);
    system.push(d.balanced && d.flowGpm <= maxQ ? { pressurePsi, flowGpm: d.flowGpm } : null);
  }
  const answer = (status: PumpOperation["status"], pressurePsi: number | null, flowGpm: number | null): PumpOperation =>
    ({ status, pressurePsi, flowGpm, curve, system });
  if (!p.speedRpm || (p.mode === "pressure" && requestPsi === 0)) return answer("stopped", 0, 0);
  const upper = p.mode === "pressure" ? Math.min(requestPsi, head) : head;
  const top = demand(upper);
  const available = pumpPressureAt(curve, top.flowGpm);
  if (p.mode === "pressure" && available !== null && available >= upper && upper === requestPsi) {
    return top.balanced ? answer("holding", upper, top.flowGpm) : answer("unbalanced", null, null);
  }
  // If demand already exceeds the known flow domain at its end pressure,
  // an intersection would require extrapolation. Pressure mode can hold a
  // lower set-point only if that point was accepted above.
  if (top.flowGpm > maxQ && demand(Math.min(upper, curve.at(-1)!.pressurePsi)).flowGpm > maxQ) {
    return answer("outside-curve", null, null);
  }
  let lo = 0, hi = upper, x = upper;
  for (let i = 0; i < 64; i++) {
    x = (lo + hi) / 2;
    const d = demand(x), supplied = pumpPressureAt(curve, d.flowGpm);
    if (supplied === null || supplied < x) hi = x; else lo = x;
    if (supplied !== null && Math.abs(supplied-x) < 1e-7) break;
  }
  const d = demand(x), supplied = pumpPressureAt(curve, d.flowGpm);
  if (supplied === null) return answer("outside-curve", null, null);
  if (!d.balanced || Math.abs(supplied-x) > 1e-6) return answer("unbalanced", null, null);
  return answer(p.mode === "rpm" ? "rpm" : "limited", x, d.flowGpm);
}
