<script lang="ts">
  import { missingAdapters, type Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import * as edit from "$lib/edit.ts";
  import Gauge from "./Gauge.svelte";
    import NumberField from "./NumberField.svelte";

  // The panel's pump header (UX.md §4): discharge gauge, pressure typed or
  // stepped, "apply required", and the flow, large. Always in view: atop the
  // right panel (desktop), above the canvas (tablet), as a strip (phone).
  // The pump's detail (outlets, fittings; truck, control and tank with M3)
  // is the panel body when the pump is selected (Inspector).
  let {
    scenario,
    result,
    onchange,
    strip = false,
    head = false,
    onOpen,
  }: {
    scenario: Scenario;
    result: SeriesResult;
    onchange: (s: Scenario) => void;
    /** Phone: one row (pressure ±, apply required, flow); tapping the flow selects the pump, whose detail opens in the sheet. */
    strip?: boolean;
    onOpen?: () => void;
    /** Desktop: the header of the side panel, 360 px wide. */
    head?: boolean;
  } = $props();
  const STATE = {
    flowing: "Fluyendo",
    "nozzle-closed": "Pitón cerrado · presión estática",
    "no-pressure": "La bomba no llega al punto más alto",
  };
  const f = (n: number) => n.toFixed(1);
  // A missing adapter (manual fittings) leaves the line unconnected: say so rather than "nozzle closed".
  const missing = $derived(missingAdapters(scenario));
  const warn = $derived(result.state !== "flowing" || missing.length > 0);
</script>

{#snippet stateLine()}
  <span class="state" class:warn>
    {#if missing.length > 0}
      Línea sin conectar · falta adaptador
    {:else}
      {STATE[result.state]}{result.state === "flowing" ? ` · ${result.nozzlePressurePsi.toFixed(0)} psi en pitón` : ""}
    {/if}
  </span>
{/snippet}

{#if strip}
  <section class="strip" aria-label="Panel de bomba">
    <NumberField
      label="Presión de descarga"
      hideLabel
      dark
      compact
      value={scenario.source.pressurePsi}
      unit="psi"
      onchange={(p) => onchange(edit.setSourcePressure(scenario, p))}
    />
    <button class="chip small" type="button" title="Aplicar presión requerida" onclick={() => onchange(edit.setSourcePressure(scenario, result.requiredPumpPressurePsi))}>
      Req. {result.requiredPumpPressurePsi.toFixed(0)}
    </button>
    <button type="button" class="flow-open" aria-label="Bomba: salida y accesorios" onclick={onOpen}>
      <span class="big">{result.flowGpm.toFixed(0)} <small>gpm</small></span>
      <span class="mini" class:warn-text={warn}>{missing.length > 0 ? "Sin conectar" : result.state === "flowing" ? `pitón ${result.nozzlePressurePsi.toFixed(0)} psi` : result.state === "nozzle-closed" ? "Cerrado" : "No llega"}</span>
    </button>
  </section>
{:else if head}
  <section class="head" aria-label="Panel de bomba">
    <svg class="dial" width="64" height="64" viewBox="-32 -32 64 64" aria-hidden="true">
      <Gauge psi={scenario.source.pressurePsi} r={29} dark label={false} />
    </svg>
    <div class="flow" aria-live="polite">
      <span class="kicker">Bomba · descarga</span>
      <div class="big">{f(result.flowGpm)} <small>gpm</small></div>
      {@render stateLine()}
    </div>
    <div class="controls">
      <NumberField
        label="Presión de descarga"
        hideLabel
        dark
        value={scenario.source.pressurePsi}
        unit="psi"
        onchange={(p) => onchange(edit.setSourcePressure(scenario, p))}
      />
      <button class="chip" type="button" title="Aplicar la presión requerida" onclick={() => onchange(edit.setSourcePressure(scenario, result.requiredPumpPressurePsi))}>
        Req. {result.requiredPumpPressurePsi.toFixed(0)}
      </button>
    </div>
  </section>
{:else}
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
      <span class="long">Aplicar requerida · </span><span class="short">Req. </span>{f(result.requiredPumpPressurePsi)}<span class="long"> psi</span>
    </button>
    <div class="flow" aria-live="polite">
      <div class="big">{f(result.flowGpm)} <small>gpm</small></div>
      {@render stateLine()}
    </div>
  </section>
{/if}

<style>
  .pump, .strip, .head { background: var(--panel); color: var(--panel-ink); border-radius: var(--radius); }
  .pump { padding: 10px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
  .title { display: grid; }
  .title span { font-size: 12px; color: var(--panel-muted); }
  .chip { border-radius: 999px; padding: 8px 14px; min-height: 44px; font-size: 14px; font-weight: 600; background: var(--panel-2); border: 1px solid var(--panel-line); color: var(--panel-ink); cursor: pointer; }
  .flow { margin-left: auto; text-align: right; display: grid; justify-items: end; gap: 4px; }
  .big { font-size: 34px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
  .big small { font-size: 15px; color: var(--panel-muted); font-weight: 600; }
  .state { border-radius: 999px; padding: 5px 12px; font-size: 13px; font-weight: 600; background: var(--ok-bg); color: var(--ok-ink); }
  .short { display: none; }
  .state.warn { background: #5c1d1d; color: #ffc9c9; }

  .head { padding: 10px 12px; display: grid; grid-template-columns: 64px 1fr; gap: 10px 12px; align-items: center; }
  .head .flow { margin: 0; }
  .kicker { font-size: 12px; font-weight: 600; color: var(--panel-muted); }
  .head .controls { grid-column: 1 / -1; display: flex; gap: 8px; align-items: center; justify-content: space-between; }

  .strip { padding: 6px 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .flow-open { display: grid; justify-items: end; gap: 2px; min-height: 44px; padding: 2px 6px; border: 0; border-radius: 8px; background: transparent; color: var(--panel-ink); cursor: pointer; }
  .flow-open .big { font-size: 22px; }
  .flow-open .big small { font-size: 12px; }
  .mini { font-size: 11px; color: var(--ok-ink); white-space: nowrap; }
  .chip.small { min-height: 40px; padding: 4px 10px; font-size: 13px; }
  .warn-text { color: #ffc9c9; }

  @media (max-width: 600px) {
    .dial, .title, .long { display: none; }
    .chip { padding: 6px 10px; font-size: 13px; }
    .pump { padding: 8px 10px; gap: 8px; }
    .big { font-size: 28px; }
    .short { display: inline; }
  }
</style>
