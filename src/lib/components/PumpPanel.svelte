<script lang="ts">
  import { missingAdapters, type Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import * as edit from "$lib/edit.ts";
  import Gauge from "./Gauge.svelte";
  import NumberField from "./NumberField.svelte";

  // The panel's pump header (UX.md §4): discharge gauge, pressure typed or
  // stepped, "Presión ideal" (the required pressure: shown, and set on a tap), "Ralentí" and the flow,
  // large. Always in view: atop the right panel (desktop), above the canvas
  // (tablet), as a strip (phone). On a phone the strip is a summary and the
  // pump's whole control (`full`) opens in the sheet with its detail. The
  // detail (outlets, fittings; truck, control and tank with M3) is the panel
  // body when the pump is selected (Inspector).
  let {
    scenario,
    result,
    onchange,
    strip = false,
    head = false,
    full = false,
    onOpen,
    branched = false,
    balanced = true,
  }: {
    scenario: Scenario;
    result: SeriesResult;
    onchange: (s: Scenario) => void;
    /** Phone: one row (pressure ±, apply required, flow); tapping the flow selects the pump, whose detail opens in the sheet. */
    strip?: boolean;
    onOpen?: () => void;
    /** Desktop: the header of the side panel, 360 px wide. */
    head?: boolean;
    /** Phone, in the sheet when the pump is selected: large gauge, ±1 and ±10, Presión ideal, Ralentí. */
    full?: boolean;
    branched?: boolean;
    balanced?: boolean;
  } = $props();
  const STATE = {
    flowing: "Fluyendo",
    "nozzle-closed": "Pitón cerrado · presión estática",
    "no-pressure": "La bomba no llega al punto más alto",
  };
  const f = (n: number) => n.toFixed(1);
  // A missing adapter (manual fittings) leaves the line unconnected: say so rather than "nozzle closed".
  const missing = $derived(missingAdapters(scenario));
  const gap = $derived(result.unsatisfied);
  const warn = $derived(result.state !== "flowing" || missing.length > 0 || gap !== null || !balanced);
  // Inside the 350 gpm step no flow balances (MODEL.md §2): say so, and how to leave it.
  const gapTip = $derived(
    gap
      ? `Regla de 350 gpm: entre ${gap.lowPsi.toFixed(0)} y ${gap.highPsi.toFixed(0)} psi no hay caudal exacto. A ${gap.stepGpm} gpm sobran ${gap.sparePsi.toFixed(1)} psi sin la pérdida de los acoples y faltan ${(gap.stepPsi - gap.sparePsi).toFixed(1)} con ella. Baja a ${Math.floor(gap.lowPsi)} psi o sube a ${Math.ceil(gap.highPsi)}.`
      : "",
  );
  const required = $derived(result.requiredPumpPressurePsi);
  /** An open end has no rating to reach, so no pressure is "required" (MODEL.md §3.4d). */
  const rated = $derived(scenario.nozzle.design !== "open-end");
  // "Presión ideal" (owner, 2026-10-18): a reading first, a shortcut second.
  // It shows what the lay asks of the pump, turns green when the pump is
  // there, and a tap sets it; a tick marks it on the pump's dial.
  const atIdeal = $derived(Math.abs(scenario.source.pressurePsi - required) < 0.5);
  const requiredTip = $derived(
    atIdeal
      ? `La bomba está en la presión ideal: ${required.toFixed(0)} psi, los ${scenario.nozzle.ratedPressurePsi} psi nominales en el pitón.`
      : `Presión ideal: ${required.toFixed(0)} psi en la bomba dan al pitón sus ${scenario.nozzle.ratedPressurePsi} psi nominales. Toca para ponerla.`,
  );
  const idealLabel = $derived(`Presión ideal ${required.toFixed(0)} psi${atIdeal ? ", la bomba ya está ahí" : ": tocar para ponerla"}`);
  /** The dial's tick at the ideal pressure: a single line with a nozzle only. */
  const mark = $derived(!branched && rated ? required : undefined);
  const applyRequired = () => onchange(edit.setSourcePressure(scenario, required));
  // Idle: today's pump is an ideal pressure source, so idle is 0 psi; with the
  // governor's RPM mode (M3) it becomes the lowest RPM (UX.md §4).
  const idle = () => onchange(edit.setSourcePressure(scenario, 0));
  const idling = $derived(scenario.source.pressurePsi === 0);
</script>

{#snippet idleButton()}
  <button class="chip kill" type="button" disabled={idling} title="Bomba a ralentí: 0 psi de descarga (se puede deshacer)" onclick={idle}>Ralentí</button>
{/snippet}

{#snippet stateLine()}
  <span class="state" class:warn title={gapTip || undefined}>
    {#if branched}
      {balanced ? result.flowGpm > 0 ? "Caudal total · líneas conectadas" : "Sin caudal" : "Sin equilibrio exacto · revisa las líneas"}
    {:else if missing.length > 0}
      Línea sin conectar · falta adaptador
    {:else if gap}
      En el escalón de {gap.stepGpm} gpm · sin caudal exacto
    {:else}
      {STATE[result.state]}{result.state === "flowing" ? ` · ${result.nozzlePressurePsi.toFixed(0)} psi ${rated ? "en pitón" : "en la punta"}` : ""}
    {/if}
  </span>
{/snippet}

{#if strip}
  <section class="strip" class:branched aria-label="Panel de bomba">
    <NumberField
      label="Presión de descarga"
      hideLabel
      dark
      compact
      value={scenario.source.pressurePsi}
      unit="psi"
      onchange={(p) => onchange(edit.setSourcePressure(scenario, p))}
    />
    {#if !branched && rated}<button class="chip small ideal" class:at={atIdeal} type="button" title={requiredTip} aria-label={idealLabel} onclick={applyRequired}>
      <span class="req-label">{atIdeal ? "✓ Ideal" : "Ideal"}</span>
      <span class="req-value">{required.toFixed(0)}</span>
    </button>{/if}
    <button type="button" class="flow-open" aria-label="Bomba: salida y accesorios" onclick={onOpen}>
      <span class="big">{result.flowGpm.toFixed(0)} <small>gpm</small></span>
      <span class="mini" class:warn-text={warn}>{branched ? balanced ? "Total de líneas" : "Sin equilibrio" : missing.length > 0 ? "Sin conectar" : gap ? `escalón ${gap.stepGpm}` : result.state === "flowing" ? `${rated ? "pitón" : "punta"} ${result.nozzlePressurePsi.toFixed(0)} psi` : result.state === "nozzle-closed" ? "Cerrado" : "No llega"}{" "}<span class="chev" aria-hidden="true">›</span></span>
    </button>
  </section>
{:else if head}
  <section class="head" aria-label="Panel de bomba">
    <svg class="dial" width="64" height="64" viewBox="-32 -32 64 64" aria-hidden="true">
      <Gauge psi={scenario.source.pressurePsi} r={29} dark label={false} {mark} markTitle="Presión ideal" />
    </svg>
    <div class="flow" aria-live="polite">
      <span class="kicker">Bomba · descarga</span>
      <div class="big">{f(result.flowGpm)} <small>gpm</small></div>
      {@render stateLine()}
    </div>
    <div class="controls" class:branched>
      <NumberField
        label="Presión de descarga"
        hideLabel
        dark
        compact
        value={scenario.source.pressurePsi}
        unit="psi"
        onchange={(p) => onchange(edit.setSourcePressure(scenario, p))}
      />
      {#if !branched && rated}<button class="chip small ideal" class:at={atIdeal} type="button" title={requiredTip} aria-label={idealLabel} onclick={applyRequired}>
        <span class="req-label">{atIdeal ? "✓ Ideal" : "Ideal"}</span>
        <span class="req-value">{required.toFixed(0)}</span>
      </button>{/if}
      {@render idleButton()}
    </div>
  </section>
{:else if full}
  <section class="full" aria-label="Control de bomba">
    <svg class="dial" width="88" height="88" viewBox="-44 -44 88 88" aria-hidden="true">
      <Gauge psi={scenario.source.pressurePsi} r={41} dark label={false} {mark} markTitle="Presión ideal" />
    </svg>
    <div class="flow" aria-live="polite">
      <span class="kicker">Bomba · descarga</span>
      <div class="big">{f(result.flowGpm)} <small>gpm</small></div>
      {@render stateLine()}
    </div>
    <div class="span">
      <NumberField
        label="Presión de descarga"
        hideLabel
        dark
        value={scenario.source.pressurePsi}
        unit="psi"
        bigStep={{ size: 10, label: "10" }}
        onchange={(p) => onchange(edit.setSourcePressure(scenario, p))}
      />
    </div>
    <div class="span row">
      {#if !branched && rated}<button class="chip grow ideal" class:at={atIdeal} type="button" title={requiredTip} aria-label={idealLabel} onclick={applyRequired}>{atIdeal ? "✓ " : ""}Presión ideal: {required.toFixed(0)} psi</button>{/if}
      {@render idleButton()}
    </div>
    <p class="span hint">{branched ? "Ajusta la descarga y consulta la presión y el caudal de cada línea. La bomba mantiene la presión indicada; su capacidad aún no se modela." : rated ? `Presión ideal: la que da al pitón sus ${scenario.nozzle.ratedPressurePsi} psi nominales; tócala para ponerla. La marca en el manómetro la señala.` : "Sin pitón no hay presión nominal que alcanzar: el caudal lo fijan la bomba y la manguera."}</p>
    {#if gap}<p class="span hint gap">{gapTip}</p>{/if}
  </section>
{:else}
  <section class="pump" aria-label="Panel de bomba">
    <svg class="dial" width="64" height="64" viewBox="-32 -32 64 64" aria-hidden="true">
      <Gauge psi={scenario.source.pressurePsi} r={29} dark label={false} {mark} markTitle="Presión ideal" />
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
    {#if !branched && rated}<button class="chip ideal" class:at={atIdeal} type="button" title={requiredTip} aria-label={idealLabel} onclick={applyRequired}>
      {atIdeal ? "✓ " : ""}Presión ideal: {required.toFixed(0)} psi
    </button>{/if}
    {@render idleButton()}
    <div class="flow" aria-live="polite">
      <div class="big">{f(result.flowGpm)} <small>gpm</small></div>
      {@render stateLine()}
    </div>
  </section>
{/if}

<style>
  .pump, .strip, .head, .full { background: var(--panel); color: var(--panel-ink); border-radius: var(--radius); }
  .pump { padding: 10px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
  .title { display: grid; }
  .title span { font-size: 12px; color: var(--panel-muted); }
  .chip { border-radius: 999px; padding: 8px 14px; min-height: 44px; font-size: 14px; font-weight: 600; background: var(--panel-2); border: 1px solid var(--panel-line); color: var(--panel-ink); cursor: pointer; }
  .flow { margin-left: auto; text-align: right; display: grid; justify-items: end; gap: 4px; }
  .big { font-size: 34px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
  .big small { font-size: 15px; color: var(--panel-muted); font-weight: 600; }
  .state { border-radius: 999px; padding: 5px 12px; font-size: 13px; font-weight: 600; background: var(--ok-bg); color: var(--ok-ink); }
  .state.warn { background: #5c1d1d; color: #ffc9c9; }

  .head { padding: 10px 12px; display: grid; grid-template-columns: 64px 1fr; gap: 10px 12px; align-items: center; }
  .head .flow { margin: 0; }
  .kicker { font-size: 12px; font-weight: 600; color: var(--panel-muted); }
  .head .controls { grid-column: 1 / -1; display: grid; grid-template-columns: max-content 56px max-content; gap: 8px; align-items: center; justify-content: space-between; }
  .head .controls.branched { grid-template-columns: max-content max-content; }
  .head .controls .chip { white-space: nowrap; }
  .head .controls .chip.small { width: 56px; min-width: 56px; }
  .chip.kill { border-color: #a33a3a; color: #ffc9c9; background: #3a1616; }
  .chip.kill:disabled { opacity: 0.45; cursor: default; }

  .full { padding: 10px 12px 12px; display: grid; grid-template-columns: 88px 1fr; gap: 10px 12px; align-items: center; }
  .full .span { grid-column: 1 / -1; }
  .full .row { display: flex; gap: 8px; }
  .full .grow { flex: 1; }
  .full .hint { margin: -4px 0 0; font-size: 12px; color: var(--panel-muted); }
  .full .hint.gap { color: #ffc9c9; }
  .full .flow { margin: 0; }

  .strip { min-height: 60px; width: 100%; min-width: 0; padding: 6px 8px; display: grid; grid-template-columns: max-content 48px minmax(0, 1fr); align-items: center; gap: 6px; }
  /* No «Presión ideal» on a branched lay: the flow takes its column. */
  .strip.branched { grid-template-columns: max-content minmax(0, 1fr); }
  .flow-open { display: grid; justify-items: end; gap: 2px; min-width: 0; min-height: 44px; padding: 2px; border: 0; border-radius: 8px; background: transparent; color: var(--panel-ink); cursor: pointer; }
  .flow-open .big { font-size: 21px; white-space: nowrap; }
  .flow-open .big small { font-size: 11px; }
  .mini { font-size: 11px; color: var(--ok-ink); white-space: nowrap; }
  .chev { color: var(--panel-muted); }
  .chip.small { width: 48px; min-width: 48px; min-height: 44px; padding: 4px 2px; font-size: 13px; display: grid; justify-items: center; align-content: center; gap: 1px; line-height: 1; }
  .req-label { font-size: 10px; font-weight: 600; color: var(--panel-muted); }
  .req-value { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; background: var(--panel-line); border-radius: 999px; padding: 1px 6px; min-width: 24px; text-align: center; }
  .warn-text { color: #ffc9c9; }
  .ideal.at { border-color: var(--ok-ink); color: var(--ok-ink); }
  .ideal.at .req-label { color: var(--ok-ink); }

  @media (max-width: 600px) {
    .pump .dial, .title { display: none; }
    .chip { padding: 6px 10px; font-size: 13px; }
    .pump { padding: 8px 10px; gap: 8px; }
    .big { font-size: 28px; }
  }
</style>
