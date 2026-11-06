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
  .trim().split("\n").slice(1).map((line) => line.split(","))
  .filter(([, , , , kind]) => kind === "overall")
  .map(([id, gpm, psi, , , metres]) => ({ id, gpm: Number(gpm), psi: Number(psi), metres: Number(metres) }));
// The generic tips' curves come from Akron's tip rows (the 15/16″ filed under the catalog's Akron tip).
const reachTable = { "smooth-bore-7-8": "AKR-1430-7-8", "smooth-bore-15-16": "AKR-1499-15-16" };
for (const specId of Object.keys(NOZZLE_REACH)) {
  test(`stream.reach ${specId}: its curve within 6 % of every published overall point`, () => {
    const rows = reachRows.filter((r) => r.id === (reachTable[specId] ?? specId));
    assert.ok(rows.length >= 2, specId);
    for (const r of rows) {
      near(nozzleReachM(specId, r.gpm, r.psi), r.metres, 0.06 * r.metres);
      assert.equal(streamReach(specId, specId.startsWith("smooth") ? "smooth-bore" : "fog", r.gpm, r.psi, 0).fitted, true, `${specId} ${r.gpm}@${r.psi}`);
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
  // Hand arithmetic: 14.3 × 125^0.25 = 14.3 × 3.3437 = 47.81 m; a generic nozzle never states it.
  near(streamReach("fog-150", "fog", 125, 100, 0).reachM, 47.81, 0.01);
  assert.equal(streamReach("fog-150", "fog", 125, 100, 0).fitted, false);
  // Akron 1720 outside its table (60 psi): its own curve, not stated.
  assert.equal(streamReach("AKR-17204001", "fog", 100, 60, 0).fitted, false);
});
