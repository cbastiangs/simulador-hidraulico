import { SECONDS_PER_MINUTE } from "./units.ts";
import type { SeriesResult } from "./series.ts";

/** Explicit scenario assumption, not a catalog capacity. MODEL §3.9. */
export type Tank = { capacityGal: number; remainingGal: number };
export function parseTank(value: unknown): Tank {
  const t = value as Tank;
  if (!t || !Number.isFinite(t.capacityGal) || t.capacityGal <= 0 ||
      !Number.isFinite(t.remainingGal) || t.remainingGal < 0 || t.remainingGal > t.capacityGal) {
    throw new RangeError("Invalid tank capacity or remaining volume");
  }
  return { capacityGal: t.capacityGal, remainingGal: t.remainingGal };
}

/** null = unknown flow or no finite depletion time; UI distinguishes those cases. */
export function tankMinutes(tank: Tank, flowGpm: number | null): number | null {
  parseTank(tank);
  if (flowGpm === null) return null;
  if (!Number.isFinite(flowGpm) || flowGpm < 0) throw new RangeError("Invalid flow");
  return tank.remainingGal === 0 ? 0 : flowGpm > 0 ? tank.remainingGal / flowGpm : null;
}

/** Integrate the current steady delivery over an elapsed interval; never overdraw. */
export function drainTank(tank: Tank, flowGpm: number, seconds: number): Tank {
  parseTank(tank);
  if (!Number.isFinite(flowGpm) || flowGpm < 0 || !Number.isFinite(seconds) || seconds < 0) throw new RangeError("Invalid consumption interval");
  return { ...tank, remainingGal: Math.max(0, tank.remainingGal - flowGpm * seconds / SECONDS_PER_MINUTE) };
}

/** Empty supply disconnects delivery; trapped downstream pressure is unknown. */
export function emptySupplyResult(result: SeriesResult): SeriesResult {
  return { ...result, state: "isolated", flowGpm: 0, nozzlePressurePsi: null,
    frictionLossPsi: 0, fittingLossPsi: 0, requiredPumpPressurePsi: null,
    issues: [], terms: [], unsatisfied: null,
    nodes: result.nodes.map(n => ({ ...n, pressurePsi: null })),
    pump: { status: "empty", pressurePsi: null, flowGpm: 0, curve: [], system: [] } };
}
