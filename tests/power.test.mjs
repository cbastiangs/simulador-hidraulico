import assert from "node:assert/strict";
import test from "node:test";
import { powerSplit } from "../src/hydraulics/power.ts";
import { METHODS } from "../src/hydraulics/references.ts";
import { solveSeriesLine } from "../src/hydraulics/series.ts";
import { solveScenarioTree } from "../src/hydraulics/tree.ts";
import { feetToMeters } from "../src/hydraulics/units.ts";

// Expected values are worked by hand in the comments, never produced by the
// code under test. MODEL.md §3.8: W = Q·ΔP/1714, with 1714.29 = 33 000 × 12 / 231.

function near(actual, expected, tolerance) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);
}

test("power.split: Q·ΔP/1714 per element, the feed at the total flow, summing to the pump's output", () => {
  // One line, CGBVP (1.5 psi/m): 150 ft of 1½″ (C = 24) climbing 4 m to a
  // 95 gpm @ 100 psi nozzle. At 95 gpm: FL = 24 × 0.9025 × 1.5 = 32.49,
  // EP = 6, NP = 100 → pump 138.49 psi and 95 × 138.49 / 1714.29 = 7.675 hp:
  // streams 5.542, friction 1.800, height 0.333 (the pressure split's proportions).
  const line = solveSeriesLine({
    pumpPressurePsi: 138.49,
    sections: [{ hose: { lengthM: feetToMeters(150), frictionCoefficient: 24 }, endElevationM: 4 }],
    nozzle: { ratedFlowGpm: 95, ratedPressurePsi: 100, open: true },
  }, METHODS["cgbvp-2019"]);
  const one = powerSplit(line);
  near(one.pumpHp, 7.675, 0.001);
  near(one.streamsHp, 5.542, 0.001);
  near(one.frictionHp, 1.800, 0.001);
  near(one.heightHp, 0.333, 0.001);
  near(one.efficiency, 100 / 138.49, 1e-6);

  // A wye, CGBVP, 150 psi: 30 m (0.98425 hundred ft) of 2½″ (C = 2) to the
  // wye (5 psi), then 30 m of 1½″ (C = 24) to a 100 gpm @ 100 nozzle (a) and
  // to a 150 gpm @ 100 one (b). Both lines see the same wye head H:
  //   r_a = (24·0.98425 + 100)/10⁴, r_b = 24·0.98425/10⁴ + 100/150², q_b/q_a = √(r_a/r_b) = 1.34767
  //   145 = r_a·q_a² + (2·0.98425/10⁴)·(q_a + q_b)² → q_a = 103.84, q_b = 139.94, Q = 243.78 gpm.
  // NP_a = 107.83, NP_b = 87.04 psi. Streams (103.84 × 107.83 + 139.94 × 87.04)/1714.29
  // = 13.637 hp; wye 243.78 × 5 / 1714.29 = 0.711; pump 243.78 × 150 / 1714.29 = 21.331;
  // friction the rest, 6.983. Efficiency 63.9 %, which neither line's pressure
  // split shows (a: 107.83/150 = 71.9 %, b: 87.04/150 = 58.0 %).
  const hose = (id, d, c) => ({ hoseSizeId: id, diameterIn: d, frictionCoefficient: c, lengthM: 30, endElevationM: 0 });
  const nozzle = (q) => ({ kind: "fixed-orifice", specId: null, settingsGpm: [], ratedFlowGpm: q, ratedPressurePsi: 100, pattern: 0.25, open: true });
  const branch = (id, q) => ({ id, name: id, open: true, sections: [hose("1-1/2", 1.5, 24)], nozzle: nozzle(q) });
  const tree = solveScenarioTree({
    schema: "simulador-hidraulico/scenario", version: 1, name: "t", methodId: "cgbvp-2019",
    source: { kind: "fixed-pressure", pressurePsi: 150 },
    sections: [hose("2-1/2", 2.5, 2)], nozzle: nozzle(100),
    wye: { branches: [branch("a", 100), branch("b", 150)] },
  });
  const lay = powerSplit(tree.root);
  near(lay.pumpHp, 21.331, 0.001);
  near(lay.streamsHp, 13.637, 0.001);
  near(lay.fittingsHp, 0.711, 0.001);
  near(lay.frictionHp, 6.983, 0.001);
  near(lay.efficiency, 0.639, 0.001);
  near(lay.residualHp, 0, 1e-6);
  assert.deepEqual(lay.streams.map((s) => s.path.join("/")), ["a", "b"]);
});
