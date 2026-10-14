<script lang="ts">
  import { parseScenario, solveScenario, type Scenario } from "$hydraulics/scenario.ts";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import Inspector from "$lib/components/Inspector.svelte";
  import NumberField from "$lib/components/NumberField.svelte";
  import SideView from "$lib/components/SideView.svelte";
  import * as edit from "$lib/edit.ts";
  import type { Selection } from "$lib/selection.ts";

  // Presets are parsed like any outside document: the same gate as a share link.
  const files = import.meta.glob("/data/presets/*.json", { eager: true, import: "default" });
  const presets = Object.entries(files)
    .map(([path, doc]) => ({ id: path.split("/").pop()!.replace(".json", ""), scenario: parseScenario(doc) }))
    .sort((a, b) => a.id.localeCompare(b.id));

  let presetId = $state(presets[0].id);
  // $state.raw: the document is replaced whole by each edit (lib/edit.ts), never mutated in place.
  let scenario: Scenario = $state.raw(presets[0].scenario);
  let selection: Selection = $state({ kind: "nozzle" });

  const result = $derived(solveScenario(scenario));
  const reference = $derived(solveScenario(scenario, "cgbvp-2019"));

  function choosePreset(id: string) {
    presetId = id;
    scenario = presets.find((p) => p.id === id)!.scenario;
    selection = { kind: "nozzle" };
  }

  function addSection() {
    scenario = edit.addSection(scenario);
    selection = { kind: "section", index: scenario.sections.length - 1 };
  }

  const STATE_LABELS = {
    flowing: "Fluyendo",
    "nozzle-closed": "Pitón cerrado: presión estática, sin caudal ni fricción",
    "no-pressure": "La bomba no alcanza el punto más alto de la línea",
  };
  const f = (n: number) => n.toFixed(1);
</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>

<main>
  <header>
    <h1>Simulador hidráulico</h1>
    <select value={presetId} onchange={(e) => choosePreset(e.currentTarget.value)} aria-label="Escenario inicial">
      {#each presets as preset (preset.id)}
        <option value={preset.id}>{preset.scenario.name}</option>
      {/each}
    </select>
  </header>

  <section class="panel" aria-label="Panel de bomba">
    <div class="pump">
      <NumberField
        label="Presión de descarga"
        value={scenario.source.pressurePsi}
        unit="psi"
        step={1}
        bigStep={{ size: 10, label: "10" }}
        onchange={(p) => (scenario = edit.setSourcePressure(scenario, p))}
      />
      <input
        type="range"
        min="0"
        max="300"
        step="any"
        aria-label="Presión de descarga"
        value={scenario.source.pressurePsi}
        oninput={(e) => (scenario = edit.setSourcePressure(scenario, e.currentTarget.valueAsNumber))}
      />
    </div>
    <!-- Exact, not rounded: one tap lands on the rated flow at the rated pressure. -->
    <button onclick={() => (scenario = edit.setSourcePressure(scenario, result.requiredPumpPressurePsi))}>
      Aplicar presión requerida ({f(result.requiredPumpPressurePsi)} psi)
    </button>
    <div class="flow" aria-live="polite">
      <span class="big">{f(result.flowGpm)}</span> gpm
      <span class="state" class:warn={result.state !== "flowing"}>{STATE_LABELS[result.state]}</span>
    </div>
  </section>

  <SideView
    {scenario}
    {result}
    {selection}
    onSelect={(s) => (selection = s)}
    onElevationChange={(i, m) => (scenario = edit.setEndElevation(scenario, i, m))}
    onToggleNozzle={() => (scenario = edit.setNozzleOpen(scenario, !scenario.nozzle.open))}
  />
  <p class="hint">Toca un tramo o el pitón para editarlo · toca el pitón para abrirlo o cerrarlo · arrastra los acoples para cambiar la altura</p>

  <div class="columns">
    <section class="card">
      <Inspector {scenario} {selection} onchange={(s) => (scenario = s)} onSelect={(s) => (selection = s)} />
      <button class="add" onclick={addSection}>+ Añadir tramo</button>
    </section>

    <section class="card">
      <table>
        <thead><tr><th></th><th>Física</th><th>CGBVP 2019 (ref.)</th></tr></thead>
        <tbody>
          <tr><td>Caudal</td><td>{f(result.flowGpm)} gpm</td><td>{f(reference.flowGpm)} gpm</td></tr>
          <tr><td>Presión en pitón</td><td>{f(result.nozzlePressurePsi)} psi</td><td>{f(reference.nozzlePressurePsi)} psi</td></tr>
          <tr><td>Pérdida por fricción</td><td>{f(result.frictionLossPsi)} psi</td><td>{f(reference.frictionLossPsi)} psi</td></tr>
          <tr><td>Desnivel</td><td>{f(result.elevationPressurePsi)} psi</td><td>{f(reference.elevationPressurePsi)} psi</td></tr>
          <tr><td>Presión requerida</td><td>{f(result.requiredPumpPressurePsi)} psi</td><td>{f(reference.requiredPumpPressurePsi)} psi</td></tr>
        </tbody>
      </table>
      <h2>Cálculo</h2>
      <Breakdown terms={result.terms} methodId={scenario.methodId} />
    </section>
  </div>
</main>

<style>
  :global(:root) {
    --bg: #f4f5f2; --surface: #ffffff; --ink: #1d232a; --muted: #5d6670; --grid: #c9cfd6;
    --hose: #b5482f; --pump: #c0392b; --accent: #1f6feb; --danger: #c62828; --water: #1c7ed6;
    --gauge-face: #ffffff; --needle: #c62828;
  }
  @media (prefers-color-scheme: dark) {
    :global(:root) {
      --bg: #14181d; --surface: #1d232a; --ink: #e7eaee; --muted: #9aa4ae; --grid: #3a434d;
      --hose: #e0735a; --pump: #e05a4a; --accent: #58a6ff; --danger: #ff6b6b; --water: #4dabf7;
      --gauge-face: #1d232a; --needle: #ff6b6b;
    }
  }
  :global(body) { margin: 0; background: var(--bg); color: var(--ink); font-family: system-ui, sans-serif; }
  main { max-width: 72rem; margin: 0 auto; padding: 1rem; display: grid; gap: 1rem; }
  header { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; }
  h1 { font-size: 1.25rem; margin: 0; }
  h2 { font-size: 1rem; margin: 1rem 0 0.5rem; }
  select, button { font: inherit; min-height: 2.5rem; padding: 0 0.75rem; border-radius: 6px; border: 1px solid var(--grid); background: var(--surface); color: var(--ink); }
  .panel { display: flex; flex-wrap: wrap; gap: 1rem; align-items: end; background: var(--surface); padding: 0.75rem; border-radius: 8px; }
  .pump { display: grid; gap: 0.5rem; }
  .pump input[type="range"] { width: 100%; }
  .flow { margin-left: auto; display: grid; justify-items: end; }
  .flow .big { font-size: 2rem; font-weight: 700; font-variant-numeric: tabular-nums; }
  .state { font-size: 0.85rem; }
  .state.warn { color: var(--danger); font-weight: 600; }
  .hint { margin: -0.5rem 0 0; font-size: 0.8rem; color: var(--muted); }
  .columns { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); }
  .card { background: var(--surface); padding: 0.75rem; border-radius: 8px; display: grid; gap: 0.75rem; align-content: start; }
  .add { justify-self: start; }
  table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
  td, th { padding: 0.3rem 0.5rem; text-align: right; border-bottom: 1px solid var(--grid); }
  td:first-child, th:first-child { text-align: left; }
</style>
