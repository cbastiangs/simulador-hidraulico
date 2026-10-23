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

  // Close only a's nozzle: b still flows, so the closed line reads the
  // junction pressure, 150 − feed friction at q_b − 5, not 150 psi.
  scenario.wye.branches[0] = { ...scenario.wye.branches[0], nozzle: { ...nozzle, open: false } };
  const one = solveScenarioTree(scenario);
  const qb = Math.sqrt(145 / (2 * ft / 1e4 + 24 * ft / 1e4 + 100 / 1e4));
  const shut = pathResult(one.root, ["a"]);
  near(one.totalFlowGpm, qb);
  assert.equal(shut.state, "nozzle-closed");
  assert.equal(shut.flowGpm, 0);
  near(shut.nozzlePressurePsi, 145 - 2 * ft / 1e4 * qb ** 2);
  assert.equal(shut.requiredPumpPressurePsi, null);

  // Closing the gate also stops a, but isolates its water: its pressure is
  // unknown. The flowing line b retains exactly the same operating point.
  scenario.wye.branches[0].open = false;
  const isolated = solveScenarioTree(scenario);
  near(isolated.totalFlowGpm, qb);
  const gated = pathResult(isolated.root, ["a"]);
  assert.equal(gated.state, "isolated");
  assert.equal(gated.nozzlePressurePsi, null);
  assert.equal(gated.nodes.at(-1).pressurePsi, null);
});

test("an empty wye outlet opened flows as an open end through its 1½″ bore (MODEL.md §2, §3.4d)", () => {
  // CGBVP, 150 psi: 30 m of 2½″ (C = 2) to a trifurco (the wye's 5 psi). Outlet a
  // has a line with its gate shut, b is empty and open, c empty and shut. The
  // open port is an orifice with Q_ref = 29.84 × 0.90 × 1.5² × √50 = 427.28 gpm at 50 psi:
  //   145 = 2·(Q/100)²·0.98425 + 50·(Q/427.28)² → Q = 555.0 gpm, 84.4 psi at the port.
  const port = (id, open) => ({ id, name: id, open, sections: [], nozzle: { ...nozzle, design: "open-end" } });
  const scenario = {
    schema: "simulador-hidraulico/scenario", version: 1, name: "t", methodId: "cgbvp-2019",
    source: { kind: "fixed-pressure", pressurePsi: 150 },
    sections: [hose("2-1/2", 2.5, 2)], nozzle,
    wye: { device: "trifurca", branches: [{ ...line("a"), open: false }, port("b", true), port("c", false)] },
  };
  const tree = solveScenarioTree(scenario);
  near(tree.totalFlowGpm, 555.0, 0.05);
  const [a, b, c] = tree.root.branches;
  near(b.flowGpm, 555.0, 0.05);
  near(b.outletPressurePsi, 84.36, 0.01);
  assert.equal(a.flowGpm, 0);
  assert.equal(c.flowGpm, 0);
  near(tree.root.wyeLossPsi, 5);
});
