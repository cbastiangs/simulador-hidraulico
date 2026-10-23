import assert from "node:assert/strict";
import test from "node:test";
import {
  compareHeatReference,
  referenceCoolingCapacityKw,
} from "../src/extinguishment/absorption.ts";
import { calculateNfaFireFlow, compareNfaFireFlow } from "../src/extinguishment/fire-flow.ts";

// Expected values are worked by hand or read from the printed source, never
// produced by the code under test. Sources: docs/extinguishment-research.md,
// docs/MODEL.md §3.12.

function near(actual, expected, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

// 40 ft × 30 ft: 12.192 m × 9.144 m = 111.483648 m² exactly.
const FLOOR_40_BY_30_M2 = 111.483648;

test("extinguish.fire-flow: NFA required flow and the delivered-flow comparison (MODEL.md §3.12)", () => {
  // SM2-28–30 (PDF pp. 102–103): Q = L × W / 3, one fully involved floor.
  // A fully involved 40 × 30 ft floor is (40 × 30) / 3 = 400 gpm (SM2-29).
  const full = calculateNfaFireFlow({ floorAreaM2: FLOOR_40_BY_30_M2, involvedFraction: 1 });
  assert.equal(full.lawId, "extinguish.fire-flow");
  assert.equal(full.classification, "convention");
  assert.equal(full.sourceId, "nfaInitialCompanyOperations");
  near(full.floorAreaFt2, 1200);
  near(full.involvedAreaFt2, 1200);
  near(full.requiredFlowGpm, 400);

  // Same floor at 25 % involved: SM2-30 scales the flow with involvement;
  // the JIBC review gives (40 × 30) / 3 × 0.25 = 100 gpm.
  const quarter = { floorAreaM2: FLOOR_40_BY_30_M2, involvedFraction: 0.25 };
  near(calculateNfaFireFlow(quarter).requiredFlowGpm, 100);

  // Delivered 75 against 100 required: short by 25 gpm, ratio 0.75.
  const short = compareNfaFireFlow(quarter, 75);
  near(short.requiredFlowGpm, 100);
  near(short.marginGpm, -25);
  near(short.deficitGpm, 25);
  near(short.coverageRatio, 0.75);

  // Delivered 125 against 100 required: 25 gpm to spare, no deficit, ratio 1.25.
  const covered = compareNfaFireFlow(quarter, 125);
  near(covered.marginGpm, 25);
  near(covered.deficitGpm, 0);
  near(covered.coverageRatio, 1.25);

  // Zero involved area: nothing is required, so the ratio is undefined (null)
  // and there is no deficit; delivered 0 is the zero-flow boundary.
  const nothing = compareNfaFireFlow({ floorAreaM2: FLOOR_40_BY_30_M2, involvedFraction: 0 }, 0);
  near(nothing.requiredFlowGpm, 0);
  near(nothing.marginGpm, 0);
  near(nothing.deficitGpm, 0);
  assert.equal(nothing.coverageRatio, null);
  near(calculateNfaFireFlow({ floorAreaM2: 0, involvedFraction: 1 }).requiredFlowGpm, 0);

  // A flowing line against a required 100 gpm: deficit 100, ratio 0.
  const dry = compareNfaFireFlow(quarter, 0);
  near(dry.marginGpm, -100);
  near(dry.deficitGpm, 100);
  near(dry.coverageRatio, 0);
});

test("extinguish.absorption: full-vaporization reference and explicit η comparison (MODEL.md §3.12)", () => {
  // NIST water states: 2591.5757 kJ/kg from 20 °C liquid to 100 °C vapor at
  // 101.325 kPa absolute; 998.2072 kg/m³; 3.785411784 L/US gal; 60 s/min.
  // One gpm is therefore 0.0629770883 kg/s and 163.2098917 kW at full
  // vaporization; 100 gpm is 16,320.9891684 kW.
  near(referenceCoolingCapacityKw(0), 0);
  near(referenceCoolingCapacityKw(1), 163.20989168439348);
  near(referenceCoolingCapacityKw(100), 16_320.989168439348);

  // The report's illustrative assumption, not a sourced fireground value:
  // 100 gpm at η = 0.10 against Test034's 4021 kW measured peak.
  const etaHeat = {
    value: 0.1,
    basis: "assumed",
    rationale: "Illustrative arithmetic only; not a fireground measurement.",
  };
  const comparison = compareHeatReference({
    deliveredAppliedFlowGpm: 100,
    referenceHrrKw: 4021,
    etaHeat,
  });
  assert.equal(comparison.lawId, "extinguish.absorption");
  assert.equal(comparison.classification, "physical");
  assert.equal(comparison.sourceId, "nistWaterStates");
  near(comparison.referenceCapacityKw, 16_320.989168439348);
  near(comparison.adjustedCapacityKw, 1_632.0989168439348);
  near(comparison.signedPowerDifferenceKw, -2_388.9010831560654);
  near(comparison.thermalRatio, 0.40589378683012556);
  assert.deepEqual(comparison.etaHeat, etaHeat);

  // η = 1 is accepted only because the caller states it; there is no default.
  const full = compareHeatReference({
    deliveredAppliedFlowGpm: 100,
    referenceHrrKw: 10_000,
    etaHeat: { value: 1, basis: "assumed", rationale: "Declared full reference." },
  });
  near(full.adjustedCapacityKw, 16_320.989168439348);
  near(full.signedPowerDifferenceKw, 6_320.989168439348);
  near(full.thermalRatio, 1.6320989168439348);

  // Zero applied flow has zero reference capacity and a zero power ratio.
  const dry = compareHeatReference({
    deliveredAppliedFlowGpm: 0,
    referenceHrrKw: 4021,
    etaHeat,
  });
  near(dry.adjustedCapacityKw, 0);
  near(dry.signedPowerDifferenceKw, -4021);
  near(dry.thermalRatio, 0);
});
