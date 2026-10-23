import type { SeriesResult } from "./series.ts";
import type { TreeSegmentResult } from "./tree.ts";
import { GPM_PSI_PER_HORSEPOWER, WATTS_PER_HORSEPOWER } from "./units.ts";

/**
 * Where the pump's work goes across a whole lay (MODEL.md §3.8, `power.split`).
 *
 * Pressures along different paths don't add; power does. Every element takes
 * W = Q·ΔP/1714 at the flow through it, so the shared feed counts at the
 * total flow and each branch at its own, and the parts sum to the pump's
 * Q_total·P_pump/1714 (energy conservation). Nothing is solved here: it reads
 * the segment-local terms the solvers already report.
 *
 * Height is counted per line, from the pump to its nozzle (Σ Q·k·h over the
 * segments telescopes to that): water that ends up higher is stored work;
 * a line that ends lower gives work back, reported as `creditHp`, never as
 * a negative part, as the pressure split does.
 */
export type PowerSplit = {
  /** The pump's output, Q_total·P_pump/1714. */
  pumpHp: number;
  /** Nozzles (or open ends): the useful part. */
  streamsHp: number;
  frictionHp: number;
  /** Lifting the water, summed over the lines that end above the pump. */
  heightHp: number;
  /** Adapters, valves and wyes. */
  fittingsHp: number;
  /** What the lines that end below the pump give back. */
  creditHp: number;
  /** The four parts together: the bar's width, = pumpHp + creditHp when balanced. */
  wholeHp: number;
  /** Stream share of the whole, 0–1; 0 with no flow. */
  efficiency: number;
  /** Each nozzle's stream, by the branch ids from the pump to it ([] for a single line). */
  streams: { path: string[]; flowGpm: number; hp: number }[];
  /** pumpHp − (wholeHp − creditHp): ≈ 0, except in the 350 gpm rule's gap (MODEL.md §2). */
  residualHp: number;
};

export const horsepower = (flowGpm: number, psi: number) => (flowGpm * psi) / GPM_PSI_PER_HORSEPOWER;
export const kilowatts = (hp: number) => (hp * WATTS_PER_HORSEPOWER) / 1000;

type Segment = { flowGpm: number; result: SeriesResult; branches: readonly Segment[]; id?: string | null };

/** A single line's result, or a branched lay's root (`ScenarioTreeResult.root`). */
export function powerSplit(input: SeriesResult | TreeSegmentResult): PowerSplit {
  const root: Segment = "branches" in input ? input : { flowGpm: input.flowGpm, result: input, branches: [] };
  const split = { streamsHp: 0, frictionHp: 0, heightHp: 0, fittingsHp: 0, creditHp: 0 };
  const streams: PowerSplit["streams"] = [];
  const walk = (segment: Segment, path: string[], heightPsi: number) => {
    const q = segment.flowGpm > 0 ? segment.flowGpm : 0;
    let height = heightPsi;
    for (const t of segment.result.terms) {
      if (t.lawId === "elevation") height += t.valuePsi;
      else if (t.lawId === "hose.friction") split.frictionHp += horsepower(q, t.valuePsi);
      else if (t.lawId === "nozzle.fixed-orifice") {
        const hp = horsepower(q, t.valuePsi);
        split.streamsHp += hp;
        streams.push({ path, flowGpm: q, hp });
      } else split.fittingsHp += horsepower(q, t.valuePsi);
    }
    if (!segment.branches.length) {
      const hp = horsepower(q, height);
      if (hp >= 0) split.heightHp += hp;
      else split.creditHp -= hp;
    }
    for (const b of segment.branches) walk(b, [...path, b.id ?? ""], height);
  };
  walk(root, [], 0);
  const pumpHp = root.flowGpm > 0 ? horsepower(root.flowGpm, root.result.nodes[0].pressurePsi!) : 0;
  const wholeHp = split.streamsHp + split.frictionHp + split.heightHp + split.fittingsHp;
  return {
    ...split, pumpHp, wholeHp, streams,
    efficiency: wholeHp > 0 ? split.streamsHp / wholeHp : 0,
    residualHp: pumpHp - (wholeHp - split.creditHp),
  };
}
