<script lang="ts">
  import { u } from "$lib/display-units.svelte.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import { balanceMessage } from "$lib/readings.ts";

  const f = u.p;

  // Where the pump's pressure goes (ROADMAP §5): nozzle + friction + elevation,
  // from the engine's terms. A downhill line gains pressure; that shows as a
  // credit next to the bar rather than a negative slice.
  // `reference`: the "Comparar con" method's solve, or null when comparing is off.
  // On a branched lay there is no single split: every line spends the whole
  // pump pressure on its own path (owner, 2026-10-17). `line` names the one
  // detailed here; `lines` adds a row per line, in outlet order, to switch.
  type LineRow = { key: string; name: string; color: string; result: SeriesResult; openEnd: boolean; shut: boolean; edited: boolean };
  let {
    result,
    reference = null,
    referenceLabel = "",
    compact = false,
    openEnd = false,
    line = null,
    lines = [],
    onPickLine,
  }: {
    result: SeriesResult;
    reference?: SeriesResult | null;
    referenceLabel?: string;
    compact?: boolean;
    openEnd?: boolean;
    line?: { name: string; color: string } | null;
    lines?: LineRow[];
    onPickLine?: (key: string) => void;
  } = $props();
  /** With no nozzle the last slice is the pressure left at the hose's end (MODEL.md §3.4d). */
  const endName = $derived(openEnd ? "Punta" : "Pitón");

  function splitOf(r: SeriesResult) {
    const sum = (id: string) => r.terms.filter((t) => t.lawId === id).reduce((a, t) => a + t.valuePsi, 0);
    const p = { nozzle: sum("nozzle.fixed-orifice"), friction: sum("hose.friction"), elevation: sum("elevation"), fittings: sum("appliance.fixed") + sum("appliance.step") };
    const whole = p.nozzle + p.friction + p.fittings + Math.max(0, p.elevation);
    return { ...p, pct: (v: number) => `${whole > 0 ? (Math.max(0, v) / whole) * 100 : 0}%` };
  }
  const parts = $derived(splitOf(result));
  const fittingCount = $derived(result.terms.filter((t) => t.lawId === "appliance.fixed" || t.lawId === "appliance.step").length);
  /** The method's stepped allowance, when it uses one: "0 up to 350 gpm, 10 psi above". */
  const step = $derived.by(() => {
    const t = result.terms.find((t) => t.lawId === "appliance.step");
    return t?.lawId === "appliance.step" ? t.inputs : null;
  });
  const noData = $derived(result.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null));
  const total = $derived(parts.nozzle + parts.friction + parts.fittings + Math.max(0, parts.elevation));
  const pct = (v: number) => `${total > 0 ? (Math.max(0, v) / total) * 100 : 0}%`;

  // A slice shows its name and value, else the value, else nothing (its title
  // keeps it), whichever fits: a clipped "Fricción 3" misreads (UX.md §10.7, UX-06).
  let barWidth = $state(0);
  const LABEL_PX_PER_CHAR = 7.2;
  function fit(width: string, ...labels: string[]) {
    const px = (parseFloat(width) / 100) * barWidth;
    return labels.find((l) => l.length * LABEL_PX_PER_CHAR + 16 <= px) ?? "";
  }
</script>

<section class="budget" class:compact>
  <div class="row">
    <span>
      {compact ? "Presión de la bomba" : "¿En qué se gasta la presión de la bomba?"}
      {#if line}<span class="which" title="La línea que muestra la barra">· <span class="line-dot" style:background={line.color}></span>{line.name}</span>{/if}
    </span>
    <b>{u.p(result.nodes[0].pressurePsi)} {u.pressure}</b>
  </div>
  {#if lines.length > 1 && !compact}
    <!-- One row per line: each spends the whole pump pressure on its own path, so they don't add up. -->
    <ul class="lines" aria-label="Reparto por línea">
      {#each lines as l (l.key)}
        {@const sp = splitOf(l.result)}
        <li>
          <button type="button" class:edited={l.edited} aria-pressed={l.edited} onclick={() => onPickLine?.(l.key)}>
            <span class="who"><span class="line-dot" style:background={l.color}></span>{l.name}<span class="q">{l.shut ? "cerrada" : l.result.state === "flowing" ? `${u.q(l.result.flowGpm, 0)} ${u.flow}` : "sin caudal"}</span></span>
            <span class="bar mini">
              {#if l.result.state === "flowing"}
                <span class="nozzle" style:width={sp.pct(sp.nozzle)} title={`${l.openEnd ? "Punta" : "Pitón"} ${u.p(sp.nozzle)} ${u.pressure}`}></span>
                <span class="friction" style:width={sp.pct(sp.friction)} title={`Fricción ${u.p(sp.friction)} ${u.pressure}`}></span>
                {#if sp.fittings > 0}<span class="fittings" style:width={sp.pct(sp.fittings)} title={`Accesorios ${u.p(sp.fittings)} ${u.pressure}`}></span>{/if}
                {#if sp.elevation > 0}<span class="elevation" style:width={sp.pct(sp.elevation)} title={`Desnivel ${u.p(sp.elevation)} ${u.pressure}`}></span>{/if}
              {/if}
            </span>
          </button>
        </li>
      {/each}
    </ul>
    <p class="small">Cada línea gasta toda la presión de la bomba en su propio camino: las barras no se suman. Toca una para ver su detalle.</p>
  {/if}
  {#if result.state === "flowing"}
    <div class="bar" bind:clientWidth={barWidth}>
      <div class="nozzle" style:width={pct(parts.nozzle)} title={`${endName} ${u.p(parts.nozzle)} ${u.pressure}`}>{fit(pct(parts.nozzle), `${endName} ${f(parts.nozzle)}`, f(parts.nozzle))}</div>
      <div class="friction" style:width={pct(parts.friction)} title={`Fricción ${u.p(parts.friction)} ${u.pressure}`}>{fit(pct(parts.friction), `Fricción ${f(parts.friction)}`, f(parts.friction))}</div>
      {#if parts.fittings > 0}<div class="fittings" style:width={pct(parts.fittings)} title={`Accesorios ${u.p(parts.fittings)} ${u.pressure}`}>{fit(pct(parts.fittings), f(parts.fittings))}</div>{/if}
      {#if parts.elevation > 0}<div class="elevation" style:width={pct(parts.elevation)} title={`Desnivel ${u.p(parts.elevation)} ${u.pressure}`}>{fit(pct(parts.elevation), f(parts.elevation))}</div>{/if}
    </div>
    {#if compact && parts.elevation < 0}
      <p class="small">La bajada aporta {u.p(-parts.elevation)} {u.pressure}; la barra incluye ese aporte además de la bomba.</p>
    {/if}
    {#if result.unsatisfied && !compact}
      {@const g = result.unsatisfied}
      <p class="gap" role="status">
        ⚠ Regla de 350 gpm: entre {u.p(g.lowPsi, 0)} y {u.p(g.highPsi, 0)} {u.pressure} en la bomba no hay caudal exacto. A {u.q(g.stepGpm)} {u.flow} sobran
        {u.p(g.sparePsi)} {u.pressure} sin la pérdida de los acoples y faltan {f(g.stepPsi - g.sparePsi)} con ella; la barra no suma la bomba.
      </p>
    {:else if result.issues.length && !compact}
      <p class="gap" role="status">{balanceMessage(result.issues[0])} La barra muestra un resultado aproximado.</p>
    {/if}
    {#if !compact}<ul class="legend">
      <li>
        <span class="swatch nozzle"></span>
        <span><b>{endName} {u.p(parts.nozzle)} {u.pressure}</b> · {openEnd ? "la presión que queda en la punta abierta y empuja el chorro" : "la presión que llega al pitón y forma el chorro"}</span>
      </li>
      <li>
        <span class="swatch friction"></span>
        <span><b>Fricción {u.p(parts.friction)} {u.pressure}</b> · lo que se pierde por rozamiento en las mangueras</span>
      </li>
      {#if fittingCount > 0}
        <li>
          <span class="swatch fittings"></span>
          <span>
            <b>Accesorios {noData ? "sin dato" : `${u.p(parts.fittings)} ${u.pressure}`}</b> ·
            {fittingCount} {fittingCount === 1 ? "accesorio" : "accesorios"} (reducciones, válvulas){noData ? ": el método no tiene un valor publicado, cuenta 0" : ""}{#if step}: {u.p(step.stepPsi)} {u.pressure} cada uno solo por encima de {u.q(step.aboveGpm)} {u.flow} (regla de 350 gpm, Colorado), según el caudal local de cada accesorio{/if}
            {#if reference}· {referenceLabel}: {f(reference.fittingLossPsi)}{/if}
          </span>
        </li>
      {/if}
      <li>
        <span class="swatch elevation"></span>
        <span>
          <b>Desnivel {u.p(parts.elevation)} {u.pressure}</b> ·
          {parts.elevation < 0
            ? "la bajada devuelve presión (no ocupa barra)"
            : "lo que cuesta subir el agua"}{#if reference} · {referenceLabel}: {f(reference.elevationPressurePsi)}{/if}
        </span>
      </li>
    </ul>{/if}
  {:else}
    <p class="small">
      {#if result.issues.length}{balanceMessage(result.issues[0])}
      {:else if result.state === "isolated"}Línea aislada: sin caudal y con presión desconocida aguas abajo.
      {:else if result.state === "no-pressure"}La bomba no alcanza el punto más alto de la línea: sin entrega de agua.
      {:else}Pitón cerrado: sin caudal en esta línea. La presión en el pitón es {u.p(result.nozzlePressurePsi)} {u.pressure}.{#if lines.length > 1} Otras salidas pueden seguir consumiendo presión en la alimentación común.{/if}
      {/if}
    </p>
  {/if}
</section>

<style>
  .budget { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; display: grid; gap: 8px; }
  .budget.compact { padding: 6px 12px; gap: 4px; }
  .budget.compact .bar { height: 24px; }
  .row { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); font-size: 14px; }
  .row b { color: var(--ink); white-space: nowrap; flex-shrink: 0; }
  .budget.compact { container-type: inline-size; }
  @container (max-width: 350px) { .compact .which { display: block; margin-left: 0; } }
  .which { white-space: nowrap; color: var(--ink); font-weight: 600; margin-left: 4px; }
  .lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
  .lines button { width: 100%; display: grid; grid-template-columns: minmax(7rem, auto) 1fr; gap: 8px; align-items: center; padding: 4px 6px; border: 1px solid transparent; border-radius: 8px; background: none; text-align: left; cursor: pointer; font-size: 13px; }
  .lines button.edited { border-color: var(--accent); background: var(--accent-soft); }
  .who { display: flex; align-items: center; gap: 2px; font-weight: 600; }
  .q { margin-left: 6px; font-weight: 400; color: var(--muted); }
  .bar.mini { height: 12px; border-radius: 4px; }
  .bar.mini span { display: block; height: 100%; transition: width 250ms; }
  .small { font-size: 13px; color: var(--muted); margin: 0; }
  .gap { margin: 0; font-size: 13px; font-weight: 600; color: var(--warn); }
  .bar { display: flex; height: 28px; border-radius: 6px; overflow: hidden; font-size: 12px; font-weight: 700; color: #fff; background: var(--band); }
  .bar div { display: flex; align-items: center; padding: 0 8px; white-space: nowrap; overflow: hidden; transition: width 250ms; }
  /* Labels at 4.5:1 or better on their slice, in both themes. */
  .bar .nozzle { background: var(--water-bar); color: var(--on-water); }
  .bar .friction { color: var(--on-friction); }
  @media (prefers-reduced-motion: reduce) { .bar div, .bar.mini span { transition: none; } }
  .legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 13px; color: var(--muted); }
  .legend li { display: flex; gap: 8px; align-items: baseline; }
  .legend b { color: var(--ink); }
  .swatch { flex: none; width: 12px; height: 12px; border-radius: 3px; transform: translateY(1px); }
  .nozzle { background: var(--water); }
  .friction { background: var(--friction); }
  .elevation { background: var(--elevation); }
  .fittings { background: var(--fitting); }
</style>
