<script lang="ts">
  import { missingAdapters, type Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import * as edit from "$lib/edit.ts";
  import Gauge from "./Gauge.svelte";
  import NumberField from "./NumberField.svelte";

  // The pump panel (UX.md §3): discharge gauge, pressure typed or stepped,
  // "apply required", and the flow, large.
  let { scenario, result, onchange }: { scenario: Scenario; result: SeriesResult; onchange: (s: Scenario) => void } =
    $props();

  const STATE = {
    flowing: "Fluyendo",
    "nozzle-closed": "Pitón cerrado · presión estática",
    "no-pressure": "La bomba no llega al punto más alto",
  };
  const f = (n: number) => n.toFixed(1);
  // A missing adapter (manual fittings) leaves the line unconnected: say so rather than "nozzle closed".
  const missing = $derived(missingAdapters(scenario));
</script>

<section class="pump" aria-label="Panel de bomba">
  <svg class="dial" width="64" height="64" viewBox="-32 -32 64 64" aria-hidden="true">
    <Gauge psi={scenario.source.pressurePsi} r={29} dark label={false} />
  </svg>
  <div class="title"><strong>Bomba · descarga</strong><span>Presión de descarga</span></div>
  <NumberField
    label="Presión de descarga"
    hideLabel
    dark
    value={scenario.source.pressurePsi}
    unit="psi"
    bigStep={{ size: 10, label: "10" }}
    onchange={(p) => onchange(edit.setSourcePressure(scenario, p))}
  />
  <button class="chip" type="button" onclick={() => onchange(edit.setSourcePressure(scenario, result.requiredPumpPressurePsi))}>
    Aplicar requerida · {f(result.requiredPumpPressurePsi)} psi
  </button>
  <div class="flow" aria-live="polite">
    <div class="big">{f(result.flowGpm)} <small>gpm</small></div>
    <span class="state" class:warn={result.state !== "flowing" || missing.length > 0}>
      {#if missing.length > 0}
        Línea sin conectar · falta adaptador
      {:else}
        {STATE[result.state]}{result.state === "flowing" ? ` · ${result.nozzlePressurePsi.toFixed(0)} psi en pitón` : ""}
      {/if}
    </span>
  </div>
</section>

<style>
  .pump { background: var(--panel); color: var(--panel-ink); border-radius: var(--radius); padding: 10px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
  .title { display: grid; }
  .title span { font-size: 12px; color: var(--panel-muted); }
  .chip { border-radius: 999px; padding: 8px 14px; min-height: 44px; font-size: 14px; font-weight: 600; background: var(--panel-2); border: 1px solid var(--panel-line); color: var(--panel-ink); cursor: pointer; }
  .flow { margin-left: auto; text-align: right; display: grid; justify-items: end; gap: 4px; }
  .big { font-size: 34px; font-weight: 800; line-height: 1; }
  .big small { font-size: 15px; color: var(--panel-muted); font-weight: 600; }
  .state { border-radius: 999px; padding: 5px 12px; font-size: 13px; font-weight: 600; background: var(--ok-bg); color: var(--ok-ink); }
  .state.warn { background: #5c1d1d; color: #ffc9c9; }
  @media (max-width: 600px) {
    .dial, .title, .chip { display: none; }
    .pump { padding: 8px 10px; gap: 8px; }
    .big { font-size: 28px; }
  }
</style>
