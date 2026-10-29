<script lang="ts">
  import { u } from "$lib/display-units.svelte.ts";
  import type { Scenario, ScenarioTreeResult } from "$hydraulics/scenario.ts";
  import { toggleGate } from "$lib/branch-edit.ts";
  let { scenario, network, onchange, onLine, onConfigure }: {
    scenario: Scenario; network: ScenarioTreeResult | null;
    onchange: (s: Scenario) => void; onLine: (path: string[]) => void;
    onConfigure: () => void;
  } = $props();
</script>
<section class="discharges" aria-label="Descargas de la bomba">
  <h3>Descargas</h3>
  {#if !scenario.discharges}
    <p>Una salida alimenta esta tendida.</p>
    <button type="button" onclick={onConfigure}>Elegir camión y descargas</button>
    <p>Conserva esta línea al aplicar un perfil de camión.</p>
  {:else}
    <p>{scenario.apparatusName ?? "Configuración genérica"} · presión común, compuertas independientes. Configura el equipo en «Camión».</p>
    {#each scenario.discharges as d (d.id)}
      {@const r = network?.root.branches.find(b => b.id === d.id)}
      {@const unavailable = r?.result.pump?.pressurePsi === null && r?.result.pump?.status !== "empty"}
      <div class="outlet">
        <div class="row"><strong>{d.name} · {d.outletSizeIn.toString().replace(".5", "½")}″</strong>
          <button type="button" class:open={d.open} aria-label={`${d.open ? "Cerrar" : "Abrir"} ${d.name}`} aria-pressed={d.open} onclick={() => onchange(toggleGate(scenario, [d.id]))}>{d.open ? "Abierta" : "Cerrada"}</button>
        </div>
        <div class="readings"><b>{unavailable ? "—" : u.q(r?.flowGpm)} {u.flow}</b><span>{u.p(r?.inletPressurePsi ?? null)} {u.pressure} tras la compuerta</span></div>
        {#if d.sections.length}
          <button type="button" class="line" onclick={() => onLine([d.id])}>Ver línea de {d.name}</button>
        {:else}
          <p class:spill={d.open}>{d.open ? "Salida abierta sin manguera · descarga al suelo" : "Salida vacía · conecta una manguera desde Piezas"}</p>
        {/if}
      </div>
    {/each}
  {/if}
</section>
<style>
  .discharges { padding: 14px; background: var(--surface); border-radius: var(--radius); display: grid; gap: 10px; }
  h3, p { margin: 0; } h3 { font-size: 16px; } p { font-size: 13px; color: var(--muted); }
  .outlet { border: 1px solid var(--line); border-radius: 10px; padding: 10px; display: grid; gap: 8px; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
  button { min-height: 44px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; color: var(--ink); background: var(--surface); cursor: pointer; font: inherit; }
  .row button { flex-shrink: 0; }.open { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
  .readings { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; font-variant-numeric: tabular-nums; }
  .readings span { color: var(--muted); }.line { text-align: left; color: var(--accent); }.spill { color: var(--warn); }
</style>
