import assert from "node:assert/strict";
import test from "node:test";
import {
  elevationPressurePsi,
  frictionLossPsi,
  requiredPumpPressurePsi,
  solveAttackLine,
} from "../src/hydraulics/line.ts";
import { METHODS } from "../src/hydraulics/references.ts";
import {
  barToPsi,
  feetToMeters,
  gpmToLitersPerMinute,
  litersPerMinuteToGpm,
  metersToFeet,
  psiToBar,
} from "../src/hydraulics/units.ts";

// Expected values below are worked by hand in the comments or read from a
// published table -- never produced by the code under test.

function near(actual, expected, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

// 200 ft of 1-1/2" (C = 24) to a nozzle rated 100 gpm at 100 psi.
//   nozzle r = 100 / 100² = 0.01 psi/gpm²
//   hose   r = 24 × (200/100) / 100² = 0.0048 psi/gpm²
//   PDP − EP = 0.0148 × Q²
const line = ({ hose = {}, nozzle = {}, ...rest } = {}) => ({
  pumpPressurePsi: 148,
  nozzleElevationM: feetToMeters(0),
  ...rest,
  hose: { lengthM: feetToMeters(200), frictionCoefficient: 24, ...hose },
  nozzle: { ratedFlowGpm: 100, ratedPressurePsi: 100, open: true, ...nozzle },
});

test("friction loss per 100 ft matches the Colorado DFPC pumper chart (Jan 2020)", () => {
  // [C, gpm, printed psi]. The chart prints whole psi except where it shows
  // decimals, so each cell is checked to ±0.5. Left out: 700 gpm on 3" hose,
  // printed 40 where C = 0.8 gives 39.2 -- a rounding quirk of the chart.
  const cells = [
    [24, 100, 24], [24, 125, 38], [24, 150, 54], [24, 200, 96],
    [15.5, 100, 15.5], [15.5, 125, 24], [15.5, 150, 35], [15.5, 200, 62], [15.5, 250, 97],
    [2, 100, 2], [2, 200, 8], [2, 250, 13], [2, 300, 18], [2, 400, 32], [2, 500, 50], [2, 600, 72],
    [0.8, 200, 3], [0.8, 300, 7], [0.8, 400, 13], [0.8, 500, 20],
    [0.2, 200, 0.8], [0.2, 250, 1.25], [0.2, 350, 2.45], [0.2, 800, 12.8], [0.2, 1000, 20],
    [0.08, 500, 2], [0.08, 1000, 8], [0.08, 2000, 32],
  ];
  for (const [frictionCoefficient, flowGpm, printed] of cells) {
    near(frictionLossPsi({ lengthM: feetToMeters(100), frictionCoefficient }, flowGpm), printed, 0.5);
  }
});

test("textbook case: 150 gpm through 200 ft of 1-3/4\" to a 100 psi fog nozzle", () => {
  // FL = 15.5 × 1.5² × 2 = 69.75; PDP = 100 + 69.75 = 169.75
  const textbook = line({
    hose: { frictionCoefficient: 15.5 },
    nozzle: { ratedFlowGpm: 150 },
  });
  near(frictionLossPsi(textbook.hose, 150), 69.75);
  near(requiredPumpPressurePsi(textbook), 169.75);
});

test("zero elevation at the required pressure delivers the rated flow", () => {
  // 148 / 0.0148 = 10000 → Q = 100; NP = 100; FL = 24 × 1² × 2 = 48
  const result = solveAttackLine(line());
  assert.equal(result.state, "flowing");
  near(result.flowGpm, 100);
  near(result.nozzlePressurePsi, 100);
  near(result.frictionLossPsi, 48);
  near(result.elevationPressurePsi, 0);
  near(result.requiredPumpPressurePsi, 148);
});

test("an under-pumped line delivers less flow at less nozzle pressure", () => {
  // 37 / 0.0148 = 2500 → Q = 50; NP = 100 × 0.5² = 25; FL = 24 × 0.5² × 2 = 12
  const result = solveAttackLine(line({ pumpPressurePsi: 37 }));
  assert.equal(result.state, "flowing");
  near(result.flowGpm, 50);
  near(result.nozzlePressurePsi, 25);
  near(result.frictionLossPsi, 12);
  near(result.requiredPumpPressurePsi, 148);
});

test("positive elevation costs 0.434 psi per foot", () => {
  // EP = 0.434 × 50 = 21.7; required = 148 + 21.7 = 169.7
  const uphill = line({ nozzleElevationM: feetToMeters(50), pumpPressurePsi: 169.7 });
  near(requiredPumpPressurePsi(uphill), 169.7);
  const result = solveAttackLine(uphill);
  near(result.elevationPressurePsi, 21.7);
  near(result.flowGpm, 100);
  near(result.nozzlePressurePsi, 100);
});

test("negative elevation gives pressure back", () => {
  // EP = −21.7; required = 148 − 21.7 = 126.3.
  // At PDP 157.38: head = 179.08 = 0.0148 × 110² → Q = 110;
  // NP = 100 × 1.1² = 121; FL = 24 × 1.1² × 2 = 58.08
  const downhill = line({ nozzleElevationM: feetToMeters(-50), pumpPressurePsi: 157.38 });
  near(requiredPumpPressurePsi(downhill), 126.3);
  const result = solveAttackLine(downhill);
  near(result.elevationPressurePsi, -21.7);
  near(result.flowGpm, 110);
  near(result.nozzlePressurePsi, 121);
  near(result.frictionLossPsi, 58.08);
});

test("a closed nozzle has zero flow, no friction, and static pressure", () => {
  const level = solveAttackLine(line({ pumpPressurePsi: 150, nozzle: { open: false } }));
  assert.equal(level.state, "nozzle-closed");
  assert.equal(level.flowGpm, 0);
  assert.equal(level.frictionLossPsi, 0);
  near(level.nozzlePressurePsi, 150);

  // 150 − 0.434 × 50 = 128.3
  const upstairs = solveAttackLine(line({ pumpPressurePsi: 150, nozzleElevationM: feetToMeters(50), nozzle: { open: false } }));
  near(upstairs.nozzlePressurePsi, 128.3);
});

test("a pump below the elevation pressure leaves nothing at the nozzle", () => {
  // 20 − 21.7 = −1.7
  const result = solveAttackLine(line({ pumpPressurePsi: 20, nozzleElevationM: feetToMeters(50) }));
  assert.equal(result.state, "no-pressure");
  assert.equal(result.flowGpm, 0);
  assert.equal(result.frictionLossPsi, 0);
  near(result.nozzlePressurePsi, -1.7);
});

test("friction loss grows linearly with hose length", () => {
  // 24 × 1² × (L/100)
  for (const [lengthFt, expected] of [[0, 0], [100, 24], [250, 60], [400, 96]]) {
    near(frictionLossPsi({ lengthM: feetToMeters(lengthFt), frictionCoefficient: 24 }, 100), expected);
  }
});

test("friction loss grows with the square of flow", () => {
  // 24 × (Q/100)² × 1
  for (const [flowGpm, expected] of [[0, 0], [50, 6], [100, 24], [200, 96]]) {
    near(frictionLossPsi({ lengthM: feetToMeters(100), frictionCoefficient: 24 }, flowGpm), expected);
  }
});

test("pumping the required pressure always gives the rated flow, and the pressures add up", () => {
  const lines = [
    line(),
    line({ hose: { lengthM: feetToMeters(131.23), frictionCoefficient: 2 }, nozzle: { ratedFlowGpm: 250, ratedPressurePsi: 50 } }),
    line({ hose: { lengthM: feetToMeters(0) }, nozzleElevationM: feetToMeters(30) }),
    line({ hose: { frictionCoefficient: 0 }, nozzleElevationM: feetToMeters(-80), nozzle: { ratedPressurePsi: 75 } }),
  ];
  for (const candidate of lines) {
    const pumpPressurePsi = requiredPumpPressurePsi(candidate);
    const result = solveAttackLine({ ...candidate, pumpPressurePsi });
    near(result.flowGpm, candidate.nozzle.ratedFlowGpm, 1e-6);
    near(result.nozzlePressurePsi, candidate.nozzle.ratedPressurePsi, 1e-6);
    near(result.nozzlePressurePsi + result.frictionLossPsi + result.elevationPressurePsi, pumpPressurePsi, 1e-6);
  }
});

test("metric input agrees with the published metric friction table", () => {
  // Metric form: FL[kPa] = C × (Q/100 L/min)² × (L/100 m), C = 38 for 38 mm
  // (bomberos.info, "Cálculo de pérdidas de presión por fricción").
  // 400 L/min through 100 m of 38 mm: 38 × 4² × 1 = 608 kPa.
  const flowGpm = litersPerMinuteToGpm(400);
  const kilopascals = frictionLossPsi({ lengthM: 100, frictionCoefficient: 24 }, flowGpm) * 6.894757;
  near(kilopascals, 608, 608 * 0.01);
});

test("unit conversions use the exact definitions", () => {
  near(metersToFeet(30.48), 100);
  near(feetToMeters(100), 30.48);
  near(gpmToLitersPerMinute(100), 378.5411784);
  near(litersPerMinuteToGpm(378.5411784), 100);
  // NIST SP 811: 1 psi = 6.894757 kPa
  near(psiToBar(100), 6.894757, 1e-6);
  near(barToPsi(1), 14.503774, 1e-6);
  near(barToPsi(psiToBar(137.5)), 137.5);
});

test("an impossible line is rejected instead of solved", () => {
  assert.throws(() => solveAttackLine(line({ hose: { lengthM: feetToMeters(-1) } })), RangeError);
  assert.throws(() => solveAttackLine(line({ nozzle: { ratedFlowGpm: 0 } })), RangeError);
  assert.throws(() => solveAttackLine(line({ pumpPressurePsi: Number.NaN })), RangeError);
  assert.throws(() => solveAttackLine(line({ nozzleElevationM: feetToMeters(Infinity) })), RangeError);
});

// CGBVP, "Curso de Hidráulica aplicada a la lucha contra incendios" (2019),
// cases from docs/manual-summaries/hydraulics/validation-cases.md. Each keeps
// the manual's printed value apart from the independent arithmetic.

test("CGBVP VC-01..03: the manual's hose tables follow the same C formula", () => {
  // VC-01, p. 40: 1-1/2", 40 gpm, 100 ft: 24 × 0.4² = 3.84; printed 4.
  near(frictionLossPsi({ lengthM: feetToMeters(100), frictionCoefficient: 24 }, 40), 3.84);
  // VC-02, p. 41: 2-1/2", 250 gpm, 30 m. Printed 13 because the tables read
  // 30 m as 100 ft (2 × 2.5² = 12.5); exactly, 30 m = 98.425 ft gives 12.303.
  near(frictionLossPsi({ lengthM: 30, frictionCoefficient: 2 }, 250), 12.303, 0.001);
  // VC-03, p. 42: 3", 500 gpm, 100 ft: 0.8 × 5² = 20, as printed.
  near(frictionLossPsi({ lengthM: feetToMeters(100), frictionCoefficient: 0.8 }, 500), 20);
});

test("CGBVP VC-04: 10 m of height is 15 psi by the manual, 14.2 by hydrostatics", () => {
  const tenMetres = 10;
  // p. 44: 1 m = 1.5 psi, so 10 m = 15 psi.
  near(elevationPressurePsi(tenMetres, METHODS["cgbvp-2019"]), 15);
  // ρgh = 1000 kg/m³ × 9.80665 m/s² × 10 m = 98.07 kPa = 14.22 psi.
  near(elevationPressurePsi(tenMetres, METHODS.physical), 14.22, 0.05);
});

test("CGBVP VC-06: a fixed orifice from 50 to 80 psi flows 26.5% more, not the printed 22%", () => {
  // No hose and no height, so the nozzle gets the pump pressure: 100 × √(80/50) = 126.491.
  const result = solveAttackLine(line({
    pumpPressurePsi: 80,
    hose: { lengthM: feetToMeters(0) },
    nozzle: { ratedPressurePsi: 50 },
  }));
  near(result.flowGpm, 126.491, 0.001);
});

test("a method changes the elevation constant, never the laws", () => {
  const uphill = line({ nozzleElevationM: 10 });
  // 100 nozzle + 48 friction + 15 height (manual) = 163
  near(requiredPumpPressurePsi(uphill, METHODS["cgbvp-2019"]), 163);
  for (const method of Object.values(METHODS)) {
    const pumpPressurePsi = requiredPumpPressurePsi(uphill, method);
    const result = solveAttackLine({ ...uphill, pumpPressurePsi }, method);
    near(result.flowGpm, 100, 1e-6);
    near(result.nozzlePressurePsi + result.frictionLossPsi + result.elevationPressurePsi, pumpPressurePsi, 1e-6);
  }
});

test("flow.velocity: 95 gpm in 1½″ is 0.4085·95/1.5² = 17.25 ft/s (MODEL.md §3.7)", async () => {
  const { hoseVelocityMps } = await import("../src/hydraulics/velocity.ts");
  assert.ok(Math.abs(hoseVelocityMps(95, 1.5) / 0.3048 - 17.25) < 0.01);
});
