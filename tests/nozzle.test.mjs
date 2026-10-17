import assert from "node:assert/strict";
import test from "node:test";
import { openEndFlowGpm, reactionOf, smoothBoreFlowGpm } from "../src/hydraulics/nozzle.ts";
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
