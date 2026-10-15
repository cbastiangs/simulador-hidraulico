<script lang="ts">
  import { missingAdapters, type Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import * as edit from "$lib/edit.ts";
  import Gauge from "./Gauge.svelte";
  import JointControls from "./JointControls.svelte";
  import NumberField from "./NumberField.svelte";

  // The pump panel (UX.md §3, §4): discharge gauge, pressure typed or stepped,
  // "apply required", and the flow, large. Three shapes: a bar above the
  // canvas (tablet), a strip (phone), and the left column (desktop), which
  // also holds the discharges. Truck, control and tank sections join the
  // column with M3 (ROADMAP §6).
  let {
    scenario,
    result,
    onchange,
    column = false,
    collapsed = false,
    onCollapse,
    strip = false,
    onOpen,
    onClose,
  }: {
    scenario: Scenario;
    result: SeriesResult;
    onchange: (s: Scenario) => void;
    /** Desktop: the left column. */
    column?: boolean;
    /** The column folded to a narrow rail: gauge, pressure and flow only. */
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
    /** Phone: one row (pressure ± and flow); tapping the flow opens the whole panel in the sheet. */
    strip?: boolean;
    onOpen?: () => void;
    /** In the phone's sheet: × clears the selection. */
    onClose?: () => void;
  } = $props();

  const STATE = {
    flowing: "Fluyendo",
    "nozzle-closed": "Pitón cerrado · presión estática",
    "no-pressure": "La bomba no llega al punto más alto",
  };
  const f = (n: number) => n.toFixed(1);
  // A missing adapter (manual fittings) leaves the line unconnected: say so rather than "nozzle closed".
  const missing = $derived(missingAdapters(scenario));
  const outlet = $derived(scenario.source.outletSizeIn);
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

{#if column && collapsed}
  <section class="rail" aria-label="Panel de bomba (plegado)">
    <button type="button" class="fold" aria-label="Abrir panel de bomba" title="Abrir panel de bomba" onclick={() => onCollapse?.(false)}>▸</button>
    <svg width="44" height="44" viewBox="-22 -22 44 44" aria-hidden="true"><Gauge psi={scenario.source.pressurePsi} r={20} dark label={false} /></svg>
    <b>{scenario.source.pressurePsi.toFixed(0)}</b><small>psi</small>
    <b class:warn-text={warn}>{result.flowGpm.toFixed(0)}</b><small>gpm</small>
  </section>
{:else if column}
  <section class="column" aria-label="Panel de bomba">
    <header>
      <h2>Bomba</h2>
      {#if onCollapse}<button type="button" class="fold" aria-label="Plegar panel de bomba" title="Plegar panel de bomba" onclick={() => onCollapse(true)}>◂</button>{/if}
      {#if onClose}<button type="button" class="fold" aria-label="Quitar selección" onclick={onClose}>×</button>{/if}
    </header>
    <svg class="big-dial" width="132" height="132" viewBox="-66 -66 132 132" aria-hidden="true">
      <Gauge psi={scenario.source.pressurePsi} r={62} dark label={false} />
    </svg>
    <NumberField
      label="Presión de descarga"
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
      {@render stateLine()}
    </div>

    <h3>Descargas</h3>
    <div class="discharge">
      <div class="row"><b>Descarga 1</b><span>→ Línea · {scenario.sections.length} {scenario.sections.length === 1 ? "tramo" : "tramos"}</span></div>
      <div class="seg" role="radiogroup" aria-label="Tamaño de la salida">
        <button type="button" role="radio" aria-checked={outlet === undefined} class:on={outlet === undefined} onclick={() => onchange(edit.setOutletSize(scenario, undefined))}>= manguera</button>
        {#each [1.5, 2.5, 3] as d (d)}
          <button type="button" role="radio" aria-checked={outlet === d} class:on={outlet === d} onclick={() => onchange(edit.setOutletSize(scenario, d))}>{d.toString().replace(".5", "½")}″</button>
        {/each}
      </div>
      <JointControls {scenario} joint={0} onToggle={(kind) => onchange(edit.toggleFitting(scenario, 0, kind))} />
    </div>
  </section>
{:else if strip}
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
    <button type="button" class="flow-open" aria-label="Abrir panel de bomba" onclick={onOpen}>
      <span class="big">{result.flowGpm.toFixed(0)} <small>gpm</small></span>
      <span class="mini" class:warn-text={warn}>{missing.length > 0 ? "Sin conectar" : result.state === "flowing" ? `${result.nozzlePressurePsi.toFixed(0)} psi en pitón` : result.state === "nozzle-closed" ? "Pitón cerrado" : "No llega"} ▾</span>
    </button>
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
  .pump, .column, .rail, .strip { background: var(--panel); color: var(--panel-ink); border-radius: var(--radius); }
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

  .column { padding: 12px 14px 16px; display: grid; gap: 12px; align-content: start; }
  .column header { display: flex; align-items: center; justify-content: space-between; }
  .column h2 { margin: 0; font-size: 16px; }
  .column h3 { margin: 6px 0 -4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--panel-muted); border-top: 1px solid var(--panel-line); padding-top: 12px; }
  .big-dial { justify-self: center; }
  .column .chip { width: 100%; }
  .column .flow { margin: 0; justify-items: center; text-align: center; }
  .discharge { display: grid; gap: 8px; background: var(--panel-2); border: 1px solid var(--panel-line); border-radius: 10px; padding: 10px; }
  .discharge .row { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
  .discharge .row span { color: var(--panel-muted); }
  /* JointControls is drawn for light surfaces: give it one inside the dark panel. */
  .discharge :global(.joint) { background: var(--surface); color: var(--ink); border-radius: 8px; padding: 8px; }
  .seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; }
  .seg button { min-height: 40px; border-radius: 8px; border: 1px solid var(--panel-line); background: transparent; color: var(--panel-ink); font-weight: 600; cursor: pointer; font-size: 13px; }
  .seg .on { border-color: var(--accent); background: var(--accent); color: #fff; }
  .fold { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--panel-line); background: transparent; color: var(--panel-ink); cursor: pointer; font-size: 14px; }

  .strip { padding: 6px 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .flow-open { display: grid; justify-items: end; gap: 2px; min-height: 44px; padding: 2px 6px; border: 0; border-radius: 8px; background: transparent; color: var(--panel-ink); cursor: pointer; }
  .flow-open .big { font-size: 26px; }
  .mini { font-size: 12px; color: var(--ok-ink); white-space: nowrap; }
  .rail { padding: 8px 4px; display: grid; justify-items: center; gap: 2px; align-content: start; font-variant-numeric: tabular-nums; }
  .rail .fold { margin-bottom: 8px; }
  .rail b { font-size: 16px; margin-top: 8px; }
  .rail small { font-size: 11px; color: var(--panel-muted); }
  .warn-text { color: #ffc9c9; }

  @media (max-width: 600px) {
    .dial, .title, .long { display: none; }
    .chip { padding: 6px 10px; font-size: 13px; }
    .pump { padding: 8px 10px; gap: 8px; }
    .big { font-size: 28px; }
    .short { display: inline; }
  }
</style>
