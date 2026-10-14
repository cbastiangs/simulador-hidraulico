<script lang="ts">
  import { parseScenario, solveScenario, type Scenario } from "$hydraulics/scenario.ts";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import SideView from "$lib/components/SideView.svelte";
  import { setEndElevation, setNozzleOpen, setSourcePressure } from "$lib/edit.ts";

  // Presets are parsed like any outside document: the same gate as a share link.
  const files = import.meta.glob("/data/presets/*.json", { eager: true, import: "default" });
  const presets = Object.entries(files)
    .map(([path, doc]) => ({ id: path.split("/").pop()!.replace(".json", ""), scenario: parseScenario(doc) }))
    .sort((a, b) => a.id.localeCompare(b.id));

  let presetId = $state(presets[0].id);
  // $state.raw: the document is replaced whole by each edit (lib/edit.ts), never mutated in place.
  let scenario: Scenario = $state.raw(presets[0].scenario);

  const result = $derived(solveScenario(scenario));
  const reference = $derived(solveScenario(scenario, "cgbvp-2019"));

  function choosePreset(id: string) {
    presetId = id;
    scenario = presets.find((p) => p.id === id)!.scenario;
  }

  const STATE_LABELS = {
    flowing: "Fluyendo",
    "nozzle-closed": "Pitón cerrado: presión estática",
    "no-pressure": "La bomba no alcanza el punto más alto de la línea",
  };
  const f = (n: number) => n.toFixed(1);
</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>

<main>
  <header>
    <h1>Simulador hidráulico</h1>
    <select value={presetId} onchange={(e) => choosePreset(e.currentTarget.value)} aria-label="Escenario">
      {#each presets as preset (preset.id)}
        <option value={preset.id}>{preset.scenario.name}</option>
      {/each}
    </select>
  </header>

  <section class="controls">
    <label>
      Presión de bomba <strong>{f(scenario.source.pressurePsi)} psi</strong>
      <input
        type="range"
        min="0"
        max="300"
        step="any"
        value={scenario.source.pressurePsi}
        oninput={(e) => (scenario = setSourcePressure(scenario, e.currentTarget.valueAsNumber))}
      />
    </label>
    <label class="toggle">
      <input
        type="checkbox"
        checked={scenario.nozzle.open}
        onchange={(e) => (scenario = setNozzleOpen(scenario, e.currentTarget.checked))}
      />
      Pitón abierto
    </label>
    <!-- Exact, not rounded: one tap lands on the rated flow at the rated pressure. -->
    <button onclick={() => (scenario = setSourcePressure(scenario, result.requiredPumpPressurePsi))}>
      Aplicar presión requerida ({f(result.requiredPumpPressurePsi)} psi)
    </button>
  </section>

  <p class="state" class:warn={result.state !== "flowing"}>{STATE_LABELS[result.state]}</p>

  <SideView
    {scenario}
    {result}
    onElevationChange={(i, m) => (scenario = setEndElevation(scenario, i, m))}
  />

  <section class="readouts">
    <table>
      <thead><tr><th></th><th>Física</th><th>CGBVP 2019 (referencia)</th></tr></thead>
      <tbody>
        <tr><td>Caudal</td><td>{f(result.flowGpm)} gpm</td><td>{f(reference.flowGpm)} gpm</td></tr>
        <tr><td>Presión en pitón</td><td>{f(result.nozzlePressurePsi)} psi</td><td>{f(reference.nozzlePressurePsi)} psi</td></tr>
        <tr><td>Pérdida por fricción</td><td>{f(result.frictionLossPsi)} psi</td><td>{f(reference.frictionLossPsi)} psi</td></tr>
        <tr><td>Desnivel</td><td>{f(result.elevationPressurePsi)} psi</td><td>{f(reference.elevationPressurePsi)} psi</td></tr>
        <tr><td>Presión requerida</td><td>{f(result.requiredPumpPressurePsi)} psi</td><td>{f(reference.requiredPumpPressurePsi)} psi</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Cálculo</h2>
    <Breakdown terms={result.terms} methodId={scenario.methodId} />
  </section>
</main>

<style>
  :global(:root) {
    --bg: #fafaf8; --surface: #ffffff; --ink: #1d232a; --muted: #5d6670; --grid: #c9cfd6;
    --hose: #b5482f; --pump: #c0392b; --accent: #1f6feb; --danger: #c62828;
    --gauge-face: #ffffff; --needle: #c62828;
  }
  @media (prefers-color-scheme: dark) {
    :global(:root) {
      --bg: #14181d; --surface: #1d232a; --ink: #e7eaee; --muted: #9aa4ae; --grid: #3a434d;
      --hose: #e0735a; --pump: #e05a4a; --accent: #58a6ff; --danger: #ff6b6b;
      --gauge-face: #1d232a; --needle: #ff6b6b;
    }
  }
  :global(body) { margin: 0; background: var(--bg); color: var(--ink); font-family: system-ui, sans-serif; }
  main { max-width: 64rem; margin: 0 auto; padding: 1rem; display: grid; gap: 1rem; }
  header { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; }
  h1 { font-size: 1.25rem; margin: 0; }
  h2 { font-size: 1rem; margin: 0 0 0.5rem; }
  select, button { font: inherit; padding: 0.35rem 0.5rem; }
  .controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: end; }
  .controls label { display: grid; gap: 0.25rem; min-width: 14rem; }
  .controls .toggle { display: flex; gap: 0.4rem; align-items: center; min-width: 0; }
  .state { margin: 0; font-weight: 600; }
  .state.warn { color: var(--danger); }
  table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
  td, th { padding: 0.3rem 0.5rem; text-align: right; border-bottom: 1px solid var(--grid); }
  td:first-child, th:first-child { text-align: left; }
</style>
