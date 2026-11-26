import assert from "node:assert/strict";
import test from "node:test";
import { openEndFlowGpm, reactionOf, smoothBoreFlowGpm } from "../src/hydraulics/nozzle.ts";
import { NOZZLE_SPECS } from "../src/hydraulics/catalog.ts";
import { readFileSync } from "node:fs";
import { genericReachM, NOZZLE_REACH, nozzleReachM, streamReach } from "../src/hydraulics/reach.ts";
import { METHODS } from "../src/hydraulics/references.ts";
import { parseScenario, solveScenario } from "../src/hydraulics/scenario.ts";

// Expected values are worked by hand or read from the printed source, never
// produced by the code under test. MODEL.md §3.4, §3.4d, §3.6.

function near(actual, expected, tolerance) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);
}

/** One hose of the given size and length on level ground, pump at `pumpPsi`, ending in `nozzle`. */
function line({ hoseSizeId, diameterIn, frictionCoefficient, lengthM, pumpPsi, nozzle }) {
  return parseScenario({
    schema: "simulador-hidraulico/scenario",
    version: 1,
    name: "test",
    methodId: "physical",
    source: { kind: "fixed-pressure", pressurePsi: pumpPsi },
    sections: [{ hoseSizeId, diameterIn, frictionCoefficient, lengthM, endElevationM: 0 }],
    nozzle: { kind: "fixed-orifice", specId: null, settingsGpm: [], pattern: 0, open: true, ...nozzle },
  });
}

test("nozzle.smooth-bore: Freeman, Q = 29.7·d²·√NP (Colorado DFPC chart p. 2)", () => {
  // 15/16″ at 50 psi: 29.7 × 0.87890625 × √50 = 184.58 gpm (MODEL.md §3.4: "185").
  near(smoothBoreFlowGpm(15 / 16, 50), 184.58, 0.01);
  // The solver uses the tip's rating: a hose with no length leaves the pump's 50 psi at the tip.
  const result = solveScenario(line({
    hoseSizeId: "1-3/4", diameterIn: 1.75, frictionCoefficient: 15.5, lengthM: 0, pumpPsi: 50,
    nozzle: { design: "smooth-bore", tipIn: 15 / 16, ratedFlowGpm: 1, ratedPressurePsi: 50 },
  }));
  near(result.flowGpm, 184.58, 0.01);
});

test("nozzle.open-end: Q = 29.84·c·d²·√p (NFPA 291 via Temecula's fire-flow sheet)", () => {
  // The sheet's example: one 2½″ outlet, c = 0.90, pitot 23 psi → "Q = 804 gpm"
  // (29.84 × 0.90 × 6.25 × 4.79583 = 804.98; the sheet truncates).
  near(openEndFlowGpm(2.5, 23), 804.98, 0.01);
  // MODEL.md §3.4d: 30 m of 1½″ (C = 24) from 150 psi, open end on its 1½″ coupling:
  // 150 = 24·(Q/100)²·0.98425 + (Q / (29.84·0.9·2.25))² → Q = √(150 / 0.0026360) = 238.5 gpm.
  const result = solveScenario(line({
    hoseSizeId: "1-1/2", diameterIn: 1.5, frictionCoefficient: 24, lengthM: 30, pumpPsi: 150,
    nozzle: { design: "open-end", ratedFlowGpm: 1, ratedPressurePsi: 50, open: false },
  }));
  near(result.flowGpm, 238.5, 0.2);
});

test("nozzle.reaction: TFT formulas, the open-end momentum and the CGBVP shortcut (MODEL.md §3.6)", () => {
  const physical = METHODS.physical;
  // Smooth bore, 15/16″ at 50 psi: 1.57 × 0.87890625 × 50 = 68.99 lbf = 31.29 kgf (§3.6: "69").
  const smooth = reactionOf({ design: "smooth-bore", tipIn: 15 / 16, ratedFlowGpm: 185, ratedPressurePsi: 50 }, 1.5, 185, 50, physical);
  near(smooth.lbf, 68.99, 0.01);
  near(smooth.kgf, 31.29, 0.01);
  // Fog, 185 gpm at 100 psi: 0.0505 × 185 × 10 = 93.43 lbf (§3.6: "93").
  near(reactionOf({ design: "fog", ratedFlowGpm: 185, ratedPressurePsi: 100 }, 1.5, 185, 100, physical).lbf, 93.43, 0.01);
  // Open 2½″ end at 23 psi: 1.57 × 0.90 × 6.25 × 23 = 203.12 lbf.
  near(reactionOf({ design: "open-end", ratedFlowGpm: 1, ratedPressurePsi: 50 }, 2.5, 805, 23, physical).lbf, 203.12, 0.01);
  // CGBVP p. 46, under its method: 0.24 × 250 gpm = 60 kgf (validation-cases.md VC-05).
  near(reactionOf({ ratedFlowGpm: 250, ratedPressurePsi: 100 }, 2.5, 250, 100, METHODS["cgbvp-2019"]).kgf, 60, 1e-9);
  // A shut line pushes nothing.
  assert.equal(reactionOf({ design: "fog", ratedFlowGpm: 95, ratedPressurePsi: 100 }, 1.5, 0, 120, physical).lbf, 0);
});

// Manufacturer rating points (MODEL §3.5 links), not claims about off-rating curves.
for (const [id, pressure, settings, inletIn = 1.5] of [
  ["TFT-GF3C2S", 100, [30, 60, 95, 125, 150]],
  ["TFT-GF3D2S", 75, [30, 60, 95, 125, 150]],
  ["AKR-17204001", 100, [30, 60, 95, 125]],
  ["AKR-48634028", 50, [175]],
  ["AKR-1723P", 100, [95, 125, 150, 200]],
  ["PRO-368", 100, [95, 125, 150, 200, 250], 2.5],
  ["MAF-SS402", 100, [30, 60, 95, 125, 150]],
]) {
  test(`${id}: published rating points through the scenario solver`, () => {
    const spec = NOZZLE_SPECS.find((n) => n.id === id);
    assert.equal(spec.inletIn, inletIn); // The datasheet inlet: 1½″, except the Protek 368's 2½″.
    assert.deepEqual(spec.settingsGpm.length ? spec.settingsGpm : [spec.ratedFlowGpm], settings);
    for (const ratedFlowGpm of settings) {
      const scenario = parseScenario({
        schema: "simulador-hidraulico/scenario", version: 1, name: id, methodId: "physical",
        source: { kind: "fixed-pressure", pressurePsi: pressure },
        sections: [{ hoseSizeId: "1-1/2", diameterIn: 1.5, frictionCoefficient: 24, lengthM: 0, endElevationM: 0 }],
        nozzle: { ...spec, specId: id, ratedFlowGpm, pattern: 0, open: true },
      });
      const result = solveScenario(scenario);
      near(result.flowGpm, ratedFlowGpm, 0.001);
      near(result.nozzlePressurePsi, pressure, 0.001);
    }
  });
}

// Each nozzle's reach curve against its own published table (MODEL.md §3.14):
// the "overall" rows of data/catalog/nozzle-reach.csv, read as printed.
const reachRows = readFileSync(new URL("../data/catalog/nozzle-reach.csv", import.meta.url), "utf8")
  .trim().split("\n").slice(1).map(line => {
    const [id, gpm, psi, angle, kind, metres] = line.split(",");
    const setting = line.match(/setting (\d+) gpm/);
    return { id, kind, gpm: Number(gpm), psi: Number(psi), angle: angle ? Number(angle) : null,
      metres: Number(metres), setting: setting ? Number(setting[1]) : Number(gpm) };
  });

function catalogNozzle(id, changes = {}) {
  const spec = NOZZLE_SPECS.find(spec => spec.id === id);
  return { ...spec, specId: id, open: true, pattern: 0, ...changes };
}
// The generic tips' curves come from Akron's tip rows.
const reachTable = { "smooth-bore-7-8": "AKR-1430-7-8", "smooth-bore-15-16": "AKR-439-15-16" };
for (const specId of Object.keys(NOZZLE_REACH)) {
  test(`stream.reach ${specId}: its curve within 6 % of every published overall point`, () => {
    const rows = reachRows.filter((r) => r.kind === "overall" && r.id === (reachTable[specId] ?? specId));
    const fit = NOZZLE_REACH[specId];
    assert.equal(fit.fitRows, rows.length);
    const deviations = rows.map(r => Math.abs(nozzleReachM(specId, r.gpm, r.psi) / r.metres - 1) * 100);
    assert.equal(fit.maxTableDeviationPct, rows.length === 2 ? null : Number(Math.max(...deviations).toFixed(1)));
    for (const r of rows) {
      near(nozzleReachM(specId, r.gpm, r.psi), r.metres, 0.06 * r.metres);
      const nozzle = catalogNozzle(specId, { ratedFlowGpm: r.setting });
      const reference = streamReach(nozzle, r.gpm, r.psi);
      const effective = reachRows.find(e => e.kind === "effective" && e.id === r.id && e.gpm === r.gpm && e.psi === r.psi);
      assert.deepEqual(reference.testPoint, { flowGpm: r.gpm, pressurePsi: r.psi, effectiveM: effective.metres, overallM: r.metres });
      assert.equal(NOZZLE_REACH[specId].testAngleDeg, r.angle);
      near(reference.referenceM, r.metres, 0.06 * r.metres);
      assert.equal(reference.fitted, r.angle === 32);
      const tilted = streamReach({ ...nozzle, aimDeg: 60 }, r.gpm, r.psi);
      assert.equal(tilted.fitted, false);
      assert.equal(tilted.referenceM, reference.referenceM);
      assert.equal(reference.angleProjectionM, null);
      assert.equal(tilted.angleProjectionM, r.angle === null ? null : tilted.reachM);
    }
  });
}

test("stream.reach generic: R = 14.3·Q^0.25 m, illustrative, against published overall reach at 100 psi", () => {
  // Akron Turbojet table (32°), Elkhart Chief XD chart (32°), Fire Armour's Protek 368 table.
  const published = [
    [125, 46], [95, 46], [125, 50], [150, 52], [200, 55], // Akron 1720, 1723P
    [125, 43], [250, 56], // Elkhart Chief XD mid, high tip
    [95, 45], [125, 48], [150, 51], [200, 54], // Protek 368
  ];
  for (const [gpm, metres] of published) near(genericReachM(gpm), metres, 0.12 * metres);
  const generic = catalogNozzle("fog-150");
  near(streamReach(generic, 125, 100).reachM, 47.81, 0.01);
  assert.equal(streamReach({ ...generic, aimDeg: 60 }, 125, 100).angleProjectionM, null);
});

test("stream.reach: solved operating points qualify by setting or exposed tip and pressure", () => {
  const cases = [
    ["AKR-17204001", 30, 75, true],     // actual 25.98 gpm, printed as 26
    ["smooth-bore-7-8", 159, 80, true],  // actual 203.38 gpm, chart gives 201
    ["AKR-439-15-16", 182, 80, true],   // actual 233.48 gpm, chart gives 230
    ["AKR-439-15-16", 182, 81, false],
  ];
  for (const [id, setting, psi, expected] of cases) {
    const scenario = line({ hoseSizeId: "1-1/2", diameterIn: 1.5, frictionCoefficient: 24,
      lengthM: 0, pumpPsi: psi, nozzle: catalogNozzle(id, { ratedFlowGpm: setting }) });
    const r = solveScenario(scenario);
    assert.equal(streamReach(scenario.nozzle, r.flowGpm, r.nozzlePressurePsi).fitted, expected);
  }
  const turbojet = catalogNozzle("AKR-17204001");
  assert.equal(streamReach({ ...turbojet, ratedFlowGpm: 90 }, 90, 100).referenceM, null);
  assert.equal(streamReach({ ...turbojet, design: "open-end" }, 95, 100).referenceM, null);
  assert.equal(streamReach(catalogNozzle("smooth-bore-7-8", { tipIn: 1 }), 210, 50).referenceM, null);
  const fog = streamReach({ ...turbojet, pattern: 0.05 }, 95, 100);
  near(fog.reachM, 42.24, 0.01);
  assert.equal(fog.fitted, false);
  near(fog.referenceM, 43.78, 0.01);
  const protek = catalogNozzle("PRO-368", { aimDeg: 33 });
  const tilted = streamReach(protek, 95, 100);
  assert.equal(tilted.fitted, false);
  assert.equal(tilted.angleProjectionM, tilted.reachM);
  assert.equal(tilted.testPoint.pressurePsi, 100);
});

test("stream.reach: a weak stream stays within the Bernoulli/projectile ceiling", () => {
  const nozzle = catalogNozzle("AKR-17204001");
  // 1 psi = 6894.76 Pa. v² = 2P/1000. At 32°, R = v² sin(64°)/9.80665 = 1.264 m.
  near(streamReach(nozzle, 9.5, 1).reachM, 1.264, 0.001);
  near(streamReach(nozzle, 4.75, 0.25).reachM, 0.316, 0.001);
  near(streamReach({ ...nozzle, aimDeg: 45 }, 9.5, 1).reachM, 1.406, 0.001);
  assert.equal(streamReach({ ...nozzle, aimDeg: 90 }, 9.5, 1).reachM, 0);
  assert.equal(streamReach(nozzle, 0, 0).reachM, 0);
});
