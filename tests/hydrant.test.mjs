import assert from "node:assert/strict";
import test from "node:test";
import { hydrantPressurePsi, solveHydrantSupply } from "../src/hydraulics/hydrant.ts";

test("USFA flow analysis problem 1 reproduces its static and residual readings", () => {
  assert.equal(hydrantPressurePsi(0), 65);
  assert.equal(hydrantPressurePsi(500), 30);
  // At half the pressure drop, the published projection gives Q=500*(1/2)^0.54.
  assert.ok(Math.abs(hydrantPressurePsi(343.8879545) - 47.5) < 0.01);
});

test("equal feeds share hose loss and spend each traversed component loss once", () => {
  for (const [layout, hoses, ports] of [["single",1,1], ["separate",2,2], ["siamese",2,1]]) {
    const r = solveHydrantSupply(layout, 4, 6);
    const q = r.totalGpm;
    assert.equal(r.perHoseGpm, q / hoses);
    assert.equal(r.portGpm, q / ports);
    const hoseR = 2 * (30 / 0.3048) / 100 / 10000;
    const p = 65 - 35 * (q/500)**(1/0.54) - hoseR * (q/hoses)**2
      - 4*(q/ports/350)**2 - (layout === "siamese" ? 6*(q/350)**2 : 0);
    assert.ok(Math.abs(r.intakePsi-p) < 1e-6);
    // All roots fall on the 250–500 gpm, 222–218 psi net curve segment.
    assert.ok(Math.abs(p + 222 - .016*(q-250) - (hoseR + 100/250**2)*q**2) < 1e-6);
  }
});

test("Kennedy K81-D whole-hydrant loss uses its outlet configuration and total flow", async () => {
  const { hydrantLossPsi } = await import("../src/hydraulics/hydrant.ts");
  for (const [size, layout, q, expected] of [
    ["2.5","single",250,0.4351], ["2.5","separate",500,1.0498],
    ["4","siamese",1000,2.9422], ["4.5","single",1000,2.7778],
  ]) assert.ok(Math.abs(hydrantLossPsi(size, layout, q) - expected) < 0.001);
  assert.equal(hydrantPressurePsi(1500, 1500), 30);
});

test("saved sandbox supply balances both attack lines and follows a discharge closure", async () => {
  const { readFile } = await import("node:fs/promises");
  const { parseScenario, solveScenarioTree } = await import("../src/hydraulics/scenario.ts");
  const s = JSON.parse(await readFile(new URL("../data/presets/segunda-descarga.json", import.meta.url)));
  s.source.pump.mode = "rpm";
  s.source.tank = { capacityGal: 500, remainingGal: 0 };
  s.source.hydrant = { layout: "siamese", outlet: "2.5", testFlowGpm: 1200, intakeRefPsi: 2, siameseRefPsi: 4 };
  s.discharges[1].open = true;
  for (const [layout, open, intake, nozzle] of [
    ["siamese", true, 20.07, 294.61], ["separate", true, 33.34, 306.33], ["separate", false, 55.52, 330.22],
  ]) {
    s.source.hydrant.layout = layout;
    s.discharges[1].open = open;
    const parsed = parseScenario(JSON.parse(JSON.stringify(s)));
    assert.deepEqual(parsed.source.hydrant, s.source.hydrant);
    const r = solveScenarioTree(parsed);
    assert.ok(r.balanced);
    const op = r.root.result.pump;
    assert.ok(op.hydrantPsi > op.intakePsi);
    assert.ok(Math.abs(op.intakePsi + op.addedPsi - op.pressurePsi) < 1e-7);
    assert.ok(Math.abs(r.root.result.pump.intakePsi - intake) < 0.01);
    assert.ok(Math.abs(r.root.branches[0].flowGpm - nozzle) < 0.01);
    assert.ok(Math.abs(r.root.branches[1].flowGpm - (open ? nozzle : 0)) < 0.01);
  }
  s.source.hydrant.testFlowGpm = 400;
  s.discharges[1].open = true;
  assert.equal(solveScenarioTree(parseScenario(s)).root.result.pump.pressurePsi, null);
  assert.equal(solveScenarioTree(parseScenario(s)).root.result.pump.hydrantLimit, "test-flow");
  s.source.hydrant.layout = "single";
  s.source.hydrant.testFlowGpm = 1200;
  const vacuumBoundary = solveScenarioTree(parseScenario(s)).root.result.pump;
  assert.equal(vacuumBoundary.hydrantLimit, "intake-zero");
  assert.equal(vacuumBoundary.intakePsi, null);
  delete s.source.hydrant;
  assert.equal(solveScenarioTree(parseScenario(s)).root.result.pump.status, "empty");
});

test("series hydrant agrees with the guided rig and a governor holds discharge, not net boost", async () => {
  const { readFile } = await import("node:fs/promises");
  const { parseScenario, solveScenario } = await import("../src/hydraulics/scenario.ts");
  const preset = JSON.parse(await readFile(new URL("../data/presets/segunda-descarga.json", import.meta.url)));
  const outlet = preset.discharges[0];
  const h = { layout: "siamese", outlet: "2.5", testFlowGpm: 500, intakeRefPsi: 4, siameseRefPsi: 6 };
  const s = parseScenario({ ...preset, discharges: undefined, sections: outlet.sections, nozzle: outlet.nozzle,
    source: { ...preset.source, hydrant: h, pump: { ...preset.source.pump, mode: "rpm", speedRpm: 4000 } } });
  const lesson = solveHydrantSupply(h.layout, h.intakeRefPsi, h.siameseRefPsi, h.outlet, h.testFlowGpm);
  const actual = solveScenario(s);
  assert.ok(Math.abs(actual.flowGpm - lesson.totalGpm) < 1e-6);
  assert.ok(Math.abs(actual.pump.intakePsi - lesson.intakePsi) < 1e-6);
  s.source.pump.mode = "pressure";
  s.source.pressurePsi = 140;
  assert.equal(solveScenario(s).pump.status, "holding");
  assert.equal(solveScenario(s).pump.pressurePsi, 140);
  s.source.pressurePsi = 1;
  assert.equal(solveScenario(s).pump.hydrantLimit, "below-inlet");
  assert.equal(solveScenario(s).pump.pressurePsi, null);
  s.source.pump.speedRpm = 0;
  const stopped = solveScenario(s).pump;
  assert.deepEqual([stopped.hydrantPsi, stopped.intakePsi, stopped.addedPsi, stopped.pressurePsi], [65,65,0,0]);
});
