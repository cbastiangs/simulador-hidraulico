import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { NOZZLE_SPECS } from "../src/hydraulics/catalog.ts";
import { HOSE_SIZES, SOURCES } from "../src/hydraulics/references.ts";
import { parseScenario, ScenarioError, solveScenario, toSeriesLine } from "../src/hydraulics/scenario.ts";

const PRESETS = new URL("../data/presets/", import.meta.url);
const preset = (name) => JSON.parse(readFileSync(new URL(name, PRESETS), "utf8"));

function near(actual, expected, tolerance) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);
}

test("every preset parses, survives a JSON round trip, and solves", () => {
  const files = readdirSync(PRESETS).filter((f) => f.endsWith(".json"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const scenario = parseScenario(preset(file));
    assert.deepEqual(parseScenario(JSON.parse(JSON.stringify(scenario))), scenario, file);
    assert.equal(solveScenario(scenario).state, "flowing", file);
  }
});

test("preset linea-basica: 30 m of 1-1/2\" to a 100 gpm fog nozzle", () => {
  // 30 m = 98.425 ft. Required: 100 + 24 × 1² × 0.98425 = 123.62 psi.
  // At 125 psi: Q = √(125 / (0.01 + 0.0024 × 0.98425)) = √(125 / 0.012362) = 100.56 gpm.
  const scenario = parseScenario(preset("linea-basica.json"));
  const result = solveScenario(scenario);
  near(result.requiredPumpPressurePsi, 123.62, 0.01);
  near(result.flowGpm, 100.56, 0.01);
});

test("preset reduccion-un-piso: physical vs the CGBVP reference", () => {
  // Friction at 100 gpm: 2 × 0.98425 + 24 × 0.98425 = 25.59 psi; nozzle 100; rise 3 m.
  // Physical: 3 m = 9.8425 ft × 0.434 = 4.27 → 129.86 (the 2-1/2" → 1-1/2" reducer: no data, 0).
  // CGBVP: 3 m × 1.5 = 4.5, plus the reducer's fixed 5 psi (p. 45) → 100 + 25.59 + 4.5 + 5 = 135.09.
  const scenario = parseScenario(preset("reduccion-un-piso.json"));
  near(solveScenario(scenario).requiredPumpPressurePsi, 129.86, 0.01);
  near(solveScenario(scenario, "cgbvp-2019").requiredPumpPressurePsi, 135.09, 0.01);
  // Pressure drops at each coupling: pump 135 → after the 2-1/2" and the climb → nozzle.
  const pressures = solveScenario(scenario).nodes.map((n) => n.pressurePsi);
  assert.ok(pressures[0] > pressures[1] && pressures[1] > pressures[2]);
});

test("preset ataque-tercer-piso: the main-screen design's lay", () => {
  // Combination nozzle on 95 gpm at 100 psi; 30 m = 0.98425 × 100 ft.
  // 2-1/2": 2 × 0.95² × 0.98425 = 1.777; 1-1/2": 24 × 0.95² × 0.98425 = 21.319;
  // 6 m × 0.434/0.3048 = 8.543. Required: 100 + 1.777 + 21.319 + 8.543 = 131.64 psi.
  const scenario = parseScenario(preset("ataque-tercer-piso.json"));
  near(solveScenario(scenario).requiredPumpPressurePsi, 131.64, 0.01);
});

test("the document carries values; the catalog id is provenance only", () => {
  const doc = preset("linea-basica.json");
  doc.sections[0].frictionCoefficient = 12; // an edited C, as from a flow test
  doc.sections[0].hoseSizeId = "retired-size"; // a row the catalog no longer has
  const line = toSeriesLine(parseScenario(doc));
  assert.equal(line.sections[0].hose.frictionCoefficient, 12);
});

test("a bad document is rejected with the path of the first bad field", () => {
  const cases = [
    [(d) => (d.schema = "other"), "schema"],
    [(d) => (d.version = 2), "version"],
    [(d) => (d.methodId = "magic"), "methodId"],
    [(d) => (d.source.pressurePsi = -5), "source.pressurePsi"],
    [(d) => (d.sections = []), "sections"],
    [(d) => (d.sections[0].lengthM = "30"), "sections[0].lengthM"],
    [(d) => (d.sections[0].endElevationM = null), "sections[0].endElevationM"],
    [(d) => (d.nozzle.ratedFlowGpm = 0), "nozzle.ratedFlowGpm"],
    [(d) => (d.nozzle.open = "yes"), "nozzle.open"],
    [(d) => (d.nozzle.kind = "automatic"), "nozzle.kind"],
    [(d) => ((d.nozzle.kind = "selectable"), (d.nozzle.settingsGpm = [30, 60])), "nozzle.settingsGpm"],
    [(d) => (d.nozzle.pattern = 2), "nozzle.pattern"],
    [(d) => (d.sections[0].runM = -1), "sections[0].runM"],
    // Wyes (MODEL.md §2): one branch per outlet, an empty outlet is an open end, one outlet has a hose.
    [(d) => (d.wye = { device: "trifurca", branches: [outlet(d, "a"), outlet(d, "b")] }), "wye.branches"],
    [(d) => (d.wye = { branches: [outlet(d, "a"), { ...outlet(d, "b"), sections: [] }] }), "wye.branches[1].nozzle.design"],
    [(d) => (d.wye = { branches: [empty(d, "a"), empty(d, "b")] }), "wye.branches"],
  ];
  const outlet = (d, id) => ({ id, name: id, open: true, sections: d.sections, nozzle: { ...d.nozzle } });
  const empty = (d, id) => ({ ...outlet(d, id), sections: [], nozzle: { ...d.nozzle, design: "open-end" } });
  for (const [spoil, path] of cases) {
    const doc = preset("linea-basica.json");
    spoil(doc);
    assert.throws(() => parseScenario(doc), (e) => e instanceof ScenarioError && e.path === path, path);
  }
  assert.throws(() => parseScenario(null), ScenarioError);
  assert.throws(() => parseScenario([]), ScenarioError);
});

test("parsing copies only known fields", () => {
  const doc = { ...preset("linea-basica.json"), injected: "<script>" };
  assert.equal("injected" in parseScenario(doc), false);
});

test("every built-in value names a published source or says it is generic", () => {
  for (const hose of HOSE_SIZES) {
    assert.ok(hose.sources.length > 0, hose.id);
    for (const id of hose.sources) assert.ok(id in SOURCES, `${hose.id}: ${id}`);
  }
  for (const spec of NOZZLE_SPECS) {
    for (const [field, provenance] of Object.entries(spec.provenance)) {
      assert.ok(provenance.note.length > 0, `${spec.id}.${field} needs a note`);
      for (const id of provenance.sources) assert.ok(id in SOURCES, `${spec.id}.${field}: ${id}`);
    }
  }
});
