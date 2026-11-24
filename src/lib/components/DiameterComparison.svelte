<script lang="ts">
  import { solveScenario, type Scenario } from '$hydraulics/scenario.ts';
  import type { SeriesResult } from '$hydraulics/series.ts';
  import { u } from '$lib/display-units.svelte.ts';
  import { setSectionHose } from '$lib/edit.ts';
  import { sizeLabel } from '$lib/names.ts';

  let { scenario, result, referenceGpm }: {
    scenario: Scenario; result: SeriesResult; referenceGpm: number;
  } = $props();

  const hose = $derived(scenario.sections[0]);
  // Solve the smaller hose under the current equipment settings, even on a restored lay.
  const small = $derived(hose.hoseSizeId === '1-1/2' ? null : solveScenario(setSectionHose(scenario, 0, '1-1/2')));
  const available = (r: SeriesResult) => r.pump?.status === 'empty' || (!r.issues.length && r.pump?.pressurePsi !== null);
</script>

<section class="comparison" aria-label="Comparación de mangueras" aria-live="polite">
  <table>
    <caption>Comparación de mangueras</caption>
    <thead><tr><td></td>{#if small}<th scope="col">Con 1½″</th>{/if}<th scope="col">Actual · {sizeLabel(hose.diameterIn)}</th></tr></thead>
    <tbody>
      <tr><th scope="row">Fricción <small>({u.pressure})</small></th>
        {#if small}<td>{u.p(available(small) ? small.frictionLossPsi : null)}</td>{/if}
        <td>{u.p(available(result) ? result.frictionLossPsi : null)}</td></tr>
      <tr><th scope="row">Entrega del pitón <small>({u.flow})</small></th>
        {#if small}<td>{u.q(available(small) ? small.flowGpm : null)}</td>{/if}
        <td>{u.q(available(result) ? result.flowGpm : null)}</td></tr>
    </tbody>
  </table>
  <p class="reference">Referencia del piso <strong>{u.q(referenceGpm)} {u.flow}</strong></p>
  {#if !small}
    <p>Antes de elegir 2½″, ¿alcanzará el pitón la referencia del piso?</p>
  {:else if !available(small) || !available(result)}
    <p>Falta una lectura resuelta para comparar las mangueras.</p>
  {:else}
    {#if result.frictionLossPsi < small.frictionLossPsi && result.flowGpm > small.flowGpm}
      <p>Con {sizeLabel(hose.diameterIn)} se pierde menos presión por fricción y el pitón entrega más agua.</p>
    {/if}
    <p>La referencia se mantiene porque el área afectada es la misma.</p>
  {/if}
</section>

<style>
  .comparison { margin: 10px 0 14px; padding: 12px; background: var(--band); border-radius: var(--radius); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
  caption { text-align: left; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  th, td { text-align: right; padding: 5px 0 5px 6px; }
  tbody th { padding-left: 0; text-align: left; font-weight: 500; }
  thead th, small { color: var(--muted); font-size: 11px; }
  td:last-child { font-weight: 700; }
  p { font-size: 12px; line-height: 1.4; margin: 6px 0 0; }
  .reference { display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid var(--line); padding-top: 8px; font-size: 13px; }
</style>
