import assert from "node:assert/strict";
import test from "node:test";
import { requiredPumpPressurePsi, solveAttackLine } from "../src/hydraulics/line.ts";
import { METHODS } from "../src/hydraulics/references.ts";
import { solveSeriesLine } from "../src/hydraulics/series.ts";

// Expected values are worked by hand in the comments, or come from line.ts's
// closed form -- an independent derivation of the same laws.

function near(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);
}

const nozzle = { ratedFlowGpm: 100, ratedPressurePsi: 100, open: true };
const hose = (lengthFt, frictionCoefficient) => ({ lengthFt, frictionCoefficient });

test("one section agrees with line.ts's closed form", () => {
  const cases = [
    { pumpPressurePsi: 148, hose: hose(200, 24), nozzleElevationFt: 0 },
    { pumpPressurePsi: 37, hose: hose(200, 24), nozzleElevationFt: 0 },
    { pumpPressurePsi: 157.38, hose: hose(200, 24), nozzleElevationFt: -50 },
    { pumpPressurePsi: 120, hose: hose(500, 2), nozzleElevationFt: 33 },
  ];
  for (const { pumpPressurePsi, hose, nozzleElevationFt } of cases) {
    for (const method of Object.values(METHODS)) {
      const closed = solveAttackLine({ pumpPressurePsi, hose, nozzle, nozzleElevationFt }, method);
      const series = solveSeriesLine(
        { pumpPressurePsi, sections: [{ hose, endElevationFt: nozzleElevationFt }], nozzle },
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
      { hose: hose(100, 2), endElevationFt: 0 },
      { hose: hose(100, 24), endElevationFt: 0 },
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
      { hose: hose(100, 2), endElevationFt: 30 },
      { hose: hose(100, 24), endElevationFt: 20 },
    ],
    nozzle,
  });
  near(result.requiredPumpPressurePsi, 134.68);
  near(result.flowGpm, 100);
  near(result.nodes[1].pressurePsi, 119.66);
  near(result.nodes[2].pressurePsi, 100);
  near(result.elevationPressurePsi, 8.68);
});

test("splitting a section in two changes nothing", () => {
  const whole = solveSeriesLine({ pumpPressurePsi: 150, sections: [{ hose: hose(200, 24), endElevationFt: 0 }], nozzle });
  const halves = solveSeriesLine({
    pumpPressurePsi: 150,
    sections: [
      { hose: hose(100, 24), endElevationFt: 0 },
      { hose: hose(100, 24), endElevationFt: 0 },
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
      { hose: hose(100, 2), endElevationFt: 30 },
      { hose: hose(100, 24), endElevationFt: 20 },
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
      { hose: hose(100, 2), endElevationFt: 30 },
      { hose: hose(100, 24), endElevationFt: 0 },
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
      { hose: hose(150, 2), endElevationFt: 10 },
      { hose: hose(100, 15.5), endElevationFt: 40 },
    ];
    const probe = solveSeriesLine({ pumpPressurePsi: 0, sections, nozzle }, method);
    const result = solveSeriesLine({ pumpPressurePsi: probe.requiredPumpPressurePsi, sections, nozzle }, method);
    near(result.flowGpm, 100);
    near(result.nozzlePressurePsi, 100);
    // The single-section closed form agrees when the same total resistance and height are used.
    const closed = requiredPumpPressurePsi(
      { pumpPressurePsi: 0, hose: hose(100, 2 * 1.5 + 15.5), nozzle, nozzleElevationFt: 40 },
      method,
    );
    near(probe.requiredPumpPressurePsi, closed);
  }
});

test("an impossible line is rejected instead of solved", () => {
  assert.throws(() => solveSeriesLine({ pumpPressurePsi: 100, sections: [], nozzle }), RangeError);
  assert.throws(
    () => solveSeriesLine({ pumpPressurePsi: 100, sections: [{ hose: hose(-1, 2), endElevationFt: 0 }], nozzle }),
    RangeError,
  );
  assert.throws(
    () => solveSeriesLine({ pumpPressurePsi: 100, sections: [{ hose: hose(100, 2), endElevationFt: NaN }], nozzle }),
    RangeError,
  );
});
