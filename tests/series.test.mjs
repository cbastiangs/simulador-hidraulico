import assert from "node:assert/strict";
import test from "node:test";
import { requiredPumpPressurePsi, solveAttackLine } from "../src/hydraulics/line.ts";
import { METHODS } from "../src/hydraulics/references.ts";
import { solveSeriesLine } from "../src/hydraulics/series.ts";
import { feetToMeters } from "../src/hydraulics/units.ts";

// Expected values are worked by hand in the comments, or come from line.ts's
// closed form -- an independent derivation of the same laws.

function near(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);
}

const nozzle = { ratedFlowGpm: 100, ratedPressurePsi: 100, open: true };
// Lengths and heights below are in feet, as the hand arithmetic is; the engine takes metres.
const hose = (lengthFt, frictionCoefficient) => ({ lengthM: feetToMeters(lengthFt), frictionCoefficient });

test("one section agrees with line.ts's closed form", () => {
  const cases = [
    { pumpPressurePsi: 148, hose: hose(200, 24), nozzleElevationM: feetToMeters(0) },
    { pumpPressurePsi: 37, hose: hose(200, 24), nozzleElevationM: feetToMeters(0) },
    { pumpPressurePsi: 157.38, hose: hose(200, 24), nozzleElevationM: feetToMeters(-50) },
    { pumpPressurePsi: 120, hose: hose(500, 2), nozzleElevationM: feetToMeters(33) },
  ];
  for (const { pumpPressurePsi, hose, nozzleElevationM } of cases) {
    for (const method of Object.values(METHODS)) {
      const closed = solveAttackLine({ pumpPressurePsi, hose, nozzle, nozzleElevationM }, method);
      const series = solveSeriesLine(
        { pumpPressurePsi, sections: [{ hose, endElevationM: nozzleElevationM }], nozzle },
        method,
      );
      assert.equal(series.state, closed.state);
      near(series.flowGpm, closed.flowGpm);
      near(series.nozzlePressurePsi, closed.nozzlePressurePsi);
      near(series.frictionLossPsi, closed.frictionLossPsi);
      near(series.requiredPumpPressurePsi, closed.requiredPumpPressurePsi);
    }
  }
});

test("a 2-1/2\" section reduced to 1-1/2\" spends friction section by section", () => {
  // r = 2·1/100² + 24·1/100² + 100/100² = 0.0002 + 0.0024 + 0.01 = 0.0126
  // PDP 126 → Q = √(126 / 0.0126) = 100. Couplings: 126 → 124 → 100.
  const result = solveSeriesLine({
    pumpPressurePsi: 126,
    sections: [
      { hose: hose(100, 2), endElevationM: feetToMeters(0) },
      { hose: hose(100, 24), endElevationM: feetToMeters(0) },
    ],
    nozzle,
  });
  near(result.flowGpm, 100);
  assert.deepEqual(result.nodes.map((n) => Math.round(n.pressurePsi * 1e6) / 1e6), [126, 124, 100]);
  near(result.frictionLossPsi, 26);
});

test("up a stairwell and back down: each coupling pays its own height", () => {
  // Coupling 1 at 30 ft, nozzle at 20 ft (physical, 0.434 psi/ft).
  // Required: 100 + 2 + 24 + 0.434·20 = 134.68 → Q = 100.
  // Coupling 1: 134.68 − 2 − 0.434·30 = 119.66; nozzle: 119.66 − 24 + 0.434·10 = 100.
  const result = solveSeriesLine({
    pumpPressurePsi: 134.68,
    sections: [
      { hose: hose(100, 2), endElevationM: feetToMeters(30) },
      { hose: hose(100, 24), endElevationM: feetToMeters(20) },
    ],
    nozzle,
  });
  near(result.requiredPumpPressurePsi, 134.68);
  near(result.flowGpm, 100);
  near(result.nodes[1].pressurePsi, 119.66);
  near(result.nodes[2].pressurePsi, 100);
  near(result.elevationPressurePsi, 8.68);
  // The on-screen breakdown accounts for the whole pump pressure: 2 + 24 + 8.68 + 100.
  near(result.terms.reduce((sum, t) => sum + t.valuePsi, 0), 134.68);
});

test("splitting a section in two changes nothing", () => {
  const whole = solveSeriesLine({ pumpPressurePsi: 150, sections: [{ hose: hose(200, 24), endElevationM: feetToMeters(0) }], nozzle });
  const halves = solveSeriesLine({
    pumpPressurePsi: 150,
    sections: [
      { hose: hose(100, 24), endElevationM: feetToMeters(0) },
      { hose: hose(100, 24), endElevationM: feetToMeters(0) },
    ],
    nozzle,
  });
  near(halves.flowGpm, whole.flowGpm);
  near(halves.nozzlePressurePsi, whole.nozzlePressurePsi);
});

test("a closed nozzle shows static pressure at every coupling", () => {
  // 150 − 0.434·30 = 136.98; 150 − 0.434·20 = 141.32
  const result = solveSeriesLine({
    pumpPressurePsi: 150,
    sections: [
      { hose: hose(100, 2), endElevationM: feetToMeters(30) },
      { hose: hose(100, 24), endElevationM: feetToMeters(20) },
    ],
    nozzle: { ...nozzle, open: false },
  });
  assert.equal(result.state, "nozzle-closed");
  assert.equal(result.flowGpm, 0);
  near(result.nodes[1].pressurePsi, 136.98);
  near(result.nodes[2].pressurePsi, 141.32);
});

test("a pump that can't reach the highest coupling flows nothing, even to a lower nozzle", () => {
  // Highest point 30 ft needs 13.02 psi; the pump gives 10.
  const result = solveSeriesLine({
    pumpPressurePsi: 10,
    sections: [
      { hose: hose(100, 2), endElevationM: feetToMeters(30) },
      { hose: hose(100, 24), endElevationM: feetToMeters(0) },
    ],
    nozzle,
  });
  assert.equal(result.state, "no-pressure");
  assert.equal(result.flowGpm, 0);
  near(result.nodes[1].pressurePsi, -3.02);
});

test("required pump pressure delivers the rated flow under either method", () => {
  for (const method of Object.values(METHODS)) {
    const sections = [
      { hose: hose(150, 2), endElevationM: feetToMeters(10) },
      { hose: hose(100, 15.5), endElevationM: feetToMeters(40) },
    ];
    const probe = solveSeriesLine({ pumpPressurePsi: 0, sections, nozzle }, method);
    const result = solveSeriesLine({ pumpPressurePsi: probe.requiredPumpPressurePsi, sections, nozzle }, method);
    near(result.flowGpm, 100);
    near(result.nozzlePressurePsi, 100);
    // The single-section closed form agrees when the same total resistance and height are used.
    const closed = requiredPumpPressurePsi(
      { pumpPressurePsi: 0, hose: hose(100, 2 * 1.5 + 15.5), nozzle, nozzleElevationM: feetToMeters(40) },
      method,
    );
    near(probe.requiredPumpPressurePsi, closed);
  }
});

test("an impossible line is rejected instead of solved", () => {
  assert.throws(() => solveSeriesLine({ pumpPressurePsi: 100, sections: [], nozzle }), RangeError);
  assert.throws(
    () => solveSeriesLine({ pumpPressurePsi: 100, sections: [{ hose: hose(-1, 2), endElevationM: feetToMeters(0) }], nozzle }),
    RangeError,
  );
  assert.throws(
    () => solveSeriesLine({ pumpPressurePsi: 100, sections: [{ hose: hose(100, 2), endElevationM: feetToMeters(NaN) }], nozzle }),
    RangeError,
  );
});

test("Colorado's appliance allowance: 0 up to 350 gpm, 10 psi above, and no balanced flow inside the step", () => {
  // Colorado DFPC pumper chart, p. 1: "Appliances + 10 psi > 350 gpm" (MODEL.md §3.10).
  // 100 ft of 2½" (C = 2) with one reducer at the nozzle; nozzle rated 100 psi at 400 gpm.
  // FL(Q) = 2·(Q/100)²; NP(Q) = 100·(Q/400)².
  const big = { ratedFlowGpm: 400, ratedPressurePsi: 100, open: true };
  const line = (pumpPressurePsi) => ({
    pumpPressurePsi,
    sections: [{ hose: hose(100, 2), endElevationM: 0 }],
    nozzle: big,
    fittings: [{ joint: 1, kind: "adapter" }],
  });
  const step = (r) => r.terms.find((t) => t.lawId === "appliance.step");

  // Above 350: at 400 gpm, 100 + 32 + 10 = 142 psi.
  const above = solveSeriesLine(line(142), METHODS.physical);
  near(above.requiredPumpPressurePsi, 142);
  near(above.flowGpm, 400, 1e-6);
  assert.equal(step(above).valuePsi, 10);
  assert.equal(above.unsatisfied, null);

  // Below: 100 psi = Q²·(2/10⁴ + 100/400²) = 0.000825·Q², so Q = 348.15 gpm, no allowance.
  const below = solveSeriesLine(line(100), METHODS.physical);
  near(below.flowGpm, Math.sqrt(100 / 0.000825), 1e-6);
  assert.equal(step(below).valuePsi, 0);

  // At 350 gpm without the allowance the line needs 24.5 + 76.5625 = 101.0625 psi, with it
  // 111.0625. At 106 psi: 4.9375 psi to spare without, 5.0625 short with: no balanced flow.
  const inside = solveSeriesLine(line(106), METHODS.physical);
  assert.equal(inside.flowGpm, 350);
  near(inside.unsatisfied.sparePsi, 4.9375);
  near(inside.unsatisfied.lowPsi, 101.0625);
  near(inside.unsatisfied.highPsi, 111.0625);
});
