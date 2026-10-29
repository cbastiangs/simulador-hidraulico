<script lang="ts">
  import { u } from "$lib/display-units.svelte.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import { tankMinutes, type Tank } from "$hydraulics/tank.ts";
  import { enduranceLabel } from "$lib/readings.ts";
  import NumberField from "./NumberField.svelte";
  let { scenario, flowGpm, running, onchange, onToggle }: {
    scenario: Scenario; flowGpm: number | null; running: boolean;
    onchange: (s: Scenario) => void; onToggle: () => void;
  } = $props();
  let capacity = $state<number | undefined>();
  const tank = $derived(scenario.source.tank);
  const minutes = $derived(tank ? tankMinutes(tank, flowGpm) : null);
  const setTank = (value: Tank | undefined) => onchange({ ...scenario, source: { ...scenario.source, tank: value } });
</script>
<section class="tank" aria-label="Abastecimiento">
  <h3>Abastecimiento</h3>
  {#if !tank}
    <p>Sin límite de volumen. Para simular un tanque, indica su capacidad; no hay un valor verificado para M11-5.</p>
    <form onsubmit={e => { e.preventDefault(); if (capacity && capacity > 0) setTank({ capacityGal: capacity, remainingGal: capacity }); }}>
      <label>Capacidad del tanque · US gal<input aria-label="Capacidad del tanque" type="number" min="1" step="any" required bind:value={capacity} /></label>
      <button type="submit">Usar tanque</button>
    </form>
  {:else}
    <div class="remaining"><strong>{tank.remainingGal.toLocaleString("es-PE", { maximumFractionDigits: 1 })}</strong> / {tank.capacityGal.toLocaleString("es-PE")} US gal</div>
    <progress max={tank.capacityGal} value={tank.remainingGal} aria-label="Agua restante"></progress>
    <p class:empty={tank.remainingGal === 0} role="status">{tank.remainingGal === 0 ? "Tanque vacío · sin entrega; presión aguas abajo desconocida" : flowGpm === null ? "Autonomía desconocida · no hay caudal resuelto" : flowGpm === 0 ? "Sin consumo · no se vacía" : `${enduranceLabel(minutes!)} al caudal actual de ${u.q(flowGpm, 0)} ${u.flow}`}</p>
    <div class="row"><button type="button" class="primary" disabled={!running && (tank.remainingGal === 0 || flowGpm === null || flowGpm === 0)} onclick={onToggle}>{running ? "Pausar reloj" : "Iniciar reloj"}</button>
      <button type="button" onclick={() => setTank({ ...tank, remainingGal: tank.capacityGal })}>Rellenar tanque</button></div>
    <details><summary>Datos del tanque</summary>
      <NumberField label="Capacidad · dato del escenario" value={tank.capacityGal} unit="gal" step={100} digits={0} onchange={v => { if (v > 0) setTank({ capacityGal: v, remainingGal: Math.min(v, tank.remainingGal) }); }} />
      <NumberField label="Agua restante" value={tank.remainingGal} unit="gal" step={100} digits={1} onchange={v => setTank({ ...tank, remainingGal: Math.max(0, Math.min(tank.capacityGal, v)) })} />
      <button type="button" onclick={() => setTank(undefined)}>Volver a volumen ilimitado</button>
    </details>
    <p>Reloj didáctico: descuenta el caudal total resuelto. Se pausa al salir de la pestaña. No modela la tubería tanque–bomba ni cavitación.</p>
  {/if}
</section>
<style>
  .tank { padding: 14px; background: var(--surface); border-radius: var(--radius); display: grid; gap: 12px; } h3,p { margin: 0; } h3 { font-size: 16px; } p { font-size: 13px; color: var(--muted); }.empty { color: var(--warn); }
  form, label { display: grid; gap: 8px; } label { font-size: 13px; } input,button { min-height: 44px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); font: inherit; } button { cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
  input { width: 100%; box-sizing: border-box; }.row { display: flex; flex-wrap: wrap; gap: 8px; }.primary { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .remaining { font-variant-numeric: tabular-nums; color: var(--muted); font-size: 14px; }.remaining strong { font-size: 24px; color: var(--ink); } progress { width: 100%; accent-color: var(--water); height: 10px; }
  summary { min-height: 44px; cursor: pointer; color: var(--accent); } details :global(.field) { margin: 8px 0; } details > button { margin-top: 8px; }
</style>
