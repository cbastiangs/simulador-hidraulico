import assert from "node:assert/strict";
import test from "node:test";
import { pathResult, solveScenarioTree } from "../src/hydraulics/tree.ts";

function near(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);
}

const hose = (id, d, c) => ({ hoseSizeId: id, diameterIn: d, frictionCoefficient: c, lengthM: 30, endElevationM: 0 });
const nozzle = { kind: "fixed-orifice", specId: null, settingsGpm: [], ratedFlowGpm: 100, ratedPressurePsi: 100, pattern: 0.25, open: true };
const line = (id) => ({ id, name: id, open: true, sections: [hose("1-1/2", 1.5, 24)], nozzle });

test("a branched path's terms: feed friction at the total flow, the wye once, and a sum equal to the pump pressure", () => {
  // CGBVP: 150 psi; 30 m (98.425 ft) of 2½″ (C = 2) to a wye (5 psi), two equal
  // 30 m 1½″ lines (C = 24) to 100 gpm @ 100 psi nozzles. By symmetry each
  // line flows q and the feed 2q:
  //   150 = 2·(2q/100)²·0.98425 + 5 + 24·(q/100)²·0.98425 + 100·(q/100)²
  //   145 = q²·(8·0.98425 + 24·0.98425 + 100)/10⁴
  const ft = 30 / 0.3048 / 100;
  const q = Math.sqrt(145 / (2 * 4 * ft / 1e4 + 24 * ft / 1e4 + 100 / 1e4));
  const scenario = {
    schema: "simulador-hidraulico/scenario", version: 1, name: "t", methodId: "cgbvp-2019",
    source: { kind: "fixed-pressure", pressurePsi: 150 },
    sections: [hose("2-1/2", 2.5, 2)], nozzle,
    wye: { branches: [line("a"), line("b")] },
  };
  const tree = solveScenarioTree(scenario);
  near(tree.totalFlowGpm, 2 * q, 1e-4);
  const path = pathResult(tree.root, ["a"]);
  near(path.flowGpm, q, 1e-4);
  near(path.terms.reduce((sum, t) => sum + t.valuePsi, 0), 150, 1e-4);
  const feed = path.terms.find((t) => t.lawId === "hose.friction" && t.sectionIndex === 0);
  near(feed.inputs.flowGpm, 2 * q, 1e-4);
  const wye = path.terms.filter((t) => t.kind === "wye");
  assert.equal(wye.length, 1);
  assert.equal(wye[0].joint, 1);
  near(wye[0].valuePsi, 5);
});
