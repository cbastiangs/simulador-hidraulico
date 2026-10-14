<script lang="ts">
  import { parseScenario, solveScenario, type Scenario } from "$hydraulics/scenario.ts";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import BudgetBar from "$lib/components/BudgetBar.svelte";
  import Canvas from "$lib/components/Canvas.svelte";
  import Inspector from "$lib/components/Inspector.svelte";
  import PumpPanel from "$lib/components/PumpPanel.svelte";
  import * as edit from "$lib/edit.ts";
  import type { Selection } from "$lib/selection.ts";

  // Built to docs/design/main-screen.html (UX.md §6).
  // Presets are parsed like any outside document: the same gate as a share link.
  const files = import.meta.glob("/data/presets/*.json", { eager: true, import: "default" });
  const presets = Object.entries(files)
    .map(([path, doc]) => ({ id: path.split("/").pop()!.replace(".json", ""), scenario: parseScenario(doc) }))
    .sort((a, b) => (a.id === "ataque-segundo-piso" ? -1 : b.id === "ataque-segundo-piso" ? 1 : a.id.localeCompare(b.id)));

  let presetId = $state(presets[0].id);
  // Counts loads, so reloading the same preset also refits the canvas.
  let loads = $state(0);
  // Replaced whole by each edit (lib/edit.ts), never mutated in place.
  let scenario: Scenario = $state.raw(presets[0].scenario);
  let selection: Selection = $state({ kind: "nozzle" });
  // How dragging and height edits treat hose length (UX.md §2); fixed length by default.

  const result = $derived(solveScenario(scenario));
  const reference = $derived(solveScenario(scenario, "cgbvp-2019"));

  function choosePreset(id: string) {
    presetId = id;
    loads += 1;
    scenario = presets.find((p) => p.id === id)!.scenario;
    selection = { kind: "nozzle" };
  }

  function addSection() {
    scenario = edit.addSection(scenario);
    selection = { kind: "section", index: scenario.sections.length - 1 };
  }
</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>

<div class="app">
  <header class="top">
    <h1>Simulador hidráulico</h1>
    <select value={presetId} onchange={(e) => choosePreset(e.currentTarget.value)} aria-label="Escenario inicial">
      {#each presets as p (p.id)}<option value={p.id}>{p.scenario.name}</option>{/each}
    </select>
  </header>

  <div class="pump"><PumpPanel {scenario} {result} onchange={(s) => (scenario = s)} /></div>

  <div class="canvas">
    <Canvas
      {scenario}
      {result}
      {selection}
      resetKey={`${presetId}#${loads}`}
      onSelect={(s) => (selection = s)}
      onMove={(i, runM, elevationM) => (scenario = edit.moveCoupling(scenario, i, { runM, elevationM }))}
      onToggleLock={(i) => (scenario = edit.toggleLengthLock(scenario, i))}
      onHoseSize={(i, id) => (scenario = edit.setSectionHose(scenario, i, id))}
      onLength={(i, m) => (scenario = edit.setSectionLength(scenario, i, m))}
      onToggleNozzle={() => (scenario = edit.setNozzleOpen(scenario, !scenario.nozzle.open))}
    />
  </div>

  <div class="side">
    <Inspector {scenario} {selection} onchange={(s) => (scenario = s)} onSelect={(s) => (selection = s)} />
    <button type="button" class="add" onclick={addSection}>+ Añadir tramo al final</button>
  </div>

  <div class="results">
    <BudgetBar {result} {reference} />
    <details class="card">
      <summary>Ver cálculo ({result.terms.length} fórmulas) · física y CGBVP 2019</summary>
      <table>
        <thead><tr><th></th><th>Física</th><th>CGBVP 2019 (ref.)</th></tr></thead>
        <tbody>
          <tr><td>Caudal</td><td>{result.flowGpm.toFixed(1)} gpm</td><td>{reference.flowGpm.toFixed(1)} gpm</td></tr>
          <tr><td>Presión en pitón</td><td>{result.nozzlePressurePsi.toFixed(1)} psi</td><td>{reference.nozzlePressurePsi.toFixed(1)} psi</td></tr>
          <tr><td>Presión requerida</td><td>{result.requiredPumpPressurePsi.toFixed(1)} psi</td><td>{reference.requiredPumpPressurePsi.toFixed(1)} psi</td></tr>
        </tbody>
      </table>
      <Breakdown terms={result.terms} methodId={scenario.methodId} />
    </details>
  </div>
</div>

<style>
  /* Layout by width: docs/UX.md §4. */
  .app {
    display: grid;
    gap: var(--gap);
    padding: var(--gap);
    max-width: 1440px;
    margin: 0 auto;
    grid-template-columns: minmax(0, 1fr) 340px;
    grid-template-areas: "top top" "pump pump" "canvas side" "results side";
    grid-template-rows: auto auto auto 1fr;
  }
  .top { grid-area: top; display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; justify-content: space-between; }
  .top h1 { margin: 0; font-size: 18px; }
  .top select { height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); padding: 0 10px; max-width: 100%; }
  .pump { grid-area: pump; }
  .canvas { grid-area: canvas; min-width: 0; }
  .side { grid-area: side; display: grid; gap: var(--gap); align-content: start; }
  .results { grid-area: results; display: grid; gap: var(--gap); min-width: 0; }
  .add { min-height: 44px; border-radius: 8px; border: 1px dashed var(--muted); background: transparent; cursor: pointer; font-weight: 600; }
  .card { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; }
  .card summary { cursor: pointer; color: var(--accent); }
  .card[open] summary { margin-bottom: 12px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 14px; }
  td, th { padding: 6px 8px; text-align: right; border-bottom: 1px solid var(--line); }
  td:first-child, th:first-child { text-align: left; }

  @media (max-width: 1023px) {
    .app { grid-template-columns: minmax(0, 1fr); grid-template-areas: "top" "pump" "canvas" "side" "results"; }
    
  }
  @media (max-width: 599px) {
    .app { padding: 8px; gap: 8px; grid-template-areas: "top" "pump" "canvas" "results" "side"; }
    
    .side :global(.inspector) { border-radius: 16px 16px 0 0; box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.12); }
  }
</style>
