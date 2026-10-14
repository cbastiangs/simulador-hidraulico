<script lang="ts">
  // M1 scaffold: proves the chain engine → Svelte → static build. The real
  // views (top-down, side, gauges, particles) replace this page.
  import { METHODS } from "$hydraulics/references.ts";
  import { solveSeriesLine, type SeriesLine } from "$hydraulics/series.ts";

  let pumpPressurePsi = $state(150);

  // 30 m of 2-1/2" up one floor, then 30 m of 1-1/2" to a 100 gpm @ 100 psi fog nozzle.
  const line = $derived<SeriesLine>({
    pumpPressurePsi,
    sections: [
      { hose: { lengthFt: 98.425, frictionCoefficient: 2 }, endElevationFt: 9.843 },
      { hose: { lengthFt: 98.425, frictionCoefficient: 24 }, endElevationFt: 9.843 },
    ],
    nozzle: { ratedFlowGpm: 100, ratedPressurePsi: 100, open: true },
  });
  const physical = $derived(solveSeriesLine(line, METHODS.physical));
  const cgbvp = $derived(solveSeriesLine(line, METHODS["cgbvp-2019"]));
</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>

<main>
  <h1>Simulador hidráulico</h1>
  <label>
    Presión de bomba: <strong>{pumpPressurePsi} psi</strong>
    <input type="range" min="0" max="250" bind:value={pumpPressurePsi} />
  </label>

  <table>
    <thead><tr><th></th><th>Físico</th><th>CGBVP 2019 (referencia)</th></tr></thead>
    <tbody>
      <tr><td>Caudal</td><td>{physical.flowGpm.toFixed(1)} gpm</td><td>{cgbvp.flowGpm.toFixed(1)} gpm</td></tr>
      <tr><td>Presión en pitón</td><td>{physical.nozzlePressurePsi.toFixed(1)} psi</td><td>{cgbvp.nozzlePressurePsi.toFixed(1)} psi</td></tr>
      <tr><td>Pérdida por fricción</td><td>{physical.frictionLossPsi.toFixed(1)} psi</td><td>{cgbvp.frictionLossPsi.toFixed(1)} psi</td></tr>
      <tr><td>Desnivel</td><td>{physical.elevationPressurePsi.toFixed(1)} psi</td><td>{cgbvp.elevationPressurePsi.toFixed(1)} psi</td></tr>
      <tr><td>Presión requerida</td><td>{physical.requiredPumpPressurePsi.toFixed(1)} psi</td><td>{cgbvp.requiredPumpPressurePsi.toFixed(1)} psi</td></tr>
    </tbody>
  </table>
</main>

<style>
  main { max-width: 40rem; margin: 0 auto; padding: 1rem; font-family: system-ui, sans-serif; }
  label { display: grid; gap: 0.5rem; margin-block: 1rem; }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 0.25rem 0.5rem; text-align: right; border-bottom: 1px solid #ccc; }
  td:first-child, th:first-child { text-align: left; }
</style>
