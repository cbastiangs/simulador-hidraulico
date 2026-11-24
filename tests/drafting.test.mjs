import test from "node:test";
import assert from "node:assert/strict";
import { solvePoolDraft } from "../src/hydraulics/drafting.ts";

test("pool draft balances intake, net pressure and line demand at both lifts", () => {
  // Independent hand calculation: solve the quadratic for Q on the two intersecting
  // linear chart segments. PDP=(100/250²+2*(30/0.3048)/100/100²)*Q²,
  // net=222-0.016*(Q-250), vacuum=(h/0.3048+0.5+0.005*(Q-250))/2.31.
  for (const [lift, intake, discharge, flow] of [
    [0.5, -1.142, 219.269, 349.328], [3, -4.686, 215.769, 346.528],
  ]) {
    const r = solvePoolDraft(lift);
    for (const [actual, expected] of [[r.intakePsi, intake], [r.dischargePsi, discharge], [r.flowGpm, flow]]) {
      assert.ok(Math.abs(actual - expected) < 0.001, `${actual} differs from ${expected}`);
    }
  }
});

import { poolIntakePsi } from "../src/hydraulics/pool.ts";
import { solvePump, WATEROUS_CX } from "../src/hydraulics/pump.ts";

test("F-2093 fig. 3 worked example and limits of the 5-inch teaching rig", () => {
  const pool = { liftM: 8 * 0.3048 };
  assert.ok(Math.abs(poolIntakePsi(pool, 850) + 6.06) < 0.1);
  const pump = { curve: WATEROUS_CX, mode: "rpm", speedRpm: 4000 };
  for (const q of [0, 100, 250, 850, 1000, 1100]) {
    const r = solvePump(pump, 150, () => ({ flowGpm: q, balanced: true }), pool);
    if (q === 100 || q === 1100) {
      assert.equal(r.flowGpm, null);
      assert.equal(r.poolLimit, true);
    } else {
      assert.equal(r.flowGpm, q);
      assert.equal(r.intakePsi, poolIntakePsi(pool, q));
      assert.ok(Math.abs(r.pressurePsi - r.intakePsi - r.addedPsi) < 1e-6);
    }
  }
});

import { jetBreakEven } from "../src/hydraulics/pump.ts";

test("6-inch suction and recirculation break-even at 500 gpm attack flow", () => {
  const pump = { mode: "rpm", speedRpm: 4000, curve: WATEROUS_CX };
  const pool = { diameterIn: 6, liftM: 8 * 0.3048 };
  const baseline = solvePump(pump, 100, () => ({ flowGpm: 500, balanced: true }), pool);
  assert.ok(Math.abs(baseline.intakePsi + 8.9 / 2.31) < 1e-8); // F-2093, 500 gpm
  const r = jetBreakEven(pump, baseline, 100);
  assert.equal(r.returnGpm, 297);
  assert.equal(r.grossGpm, 797);
  // CX drops from 218 psi at 500 to 212 - 47*10/250 psi at 797.
  assert.ok(Math.abs(r.requiredIntakePsi - baseline.intakePsi - 7.88) < 1e-6);
  assert.ok(Math.abs(jetBreakEven(pump, baseline, 0).requiredIntakePsi - baseline.intakePsi) < 1e-6);
});

import { readFileSync } from "node:fs";
import { assistedDraft } from "../src/hydraulics/jet-draft.ts";
import { solveScenarioTree } from "../src/hydraulics/scenario.ts";

test("the break-even inlet reading preserves both attack lines with the jet running", () => {
  const s = JSON.parse(readFileSync(new URL("../data/presets/segunda-descarga.json", import.meta.url)));
  s.source.pool = { diameterIn: 6, liftM: 1.5 };
  s.source.pump.mode = "rpm";
  s.discharges[1].open = true;
  const off = solveScenarioTree(s).root.result.pump;
  const threshold = jetBreakEven(s.source.pump, off, 50);
  const on = assistedDraft(s, threshold.requiredIntakePsi, 50);
  assert.ok(Math.abs(on.attackGpm - off.flowGpm) < 1e-5);
  assert.ok(Math.abs(on.grossGpm - on.attackGpm - 29.7 * Math.sqrt(50)) < 1e-5);
  assert.ok(assistedDraft(s, threshold.requiredIntakePsi + 1, 50).attackGpm > off.flowGpm);
});
