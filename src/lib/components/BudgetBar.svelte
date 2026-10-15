<script lang="ts">
  import type { SeriesResult } from "$hydraulics/series.ts";

  // Where the pump's pressure goes (ROADMAP §5): nozzle + friction + elevation,
  // from the engine's terms. A downhill line gains pressure; that shows as a
  // credit next to the bar rather than a negative slice.
  let { result, reference, compact = false }: { result: SeriesResult; reference: SeriesResult; compact?: boolean } = $props();

  const parts = $derived.by(() => {
    const sum = (id: string) => result.terms.filter((t) => t.lawId === id).reduce((a, t) => a + t.valuePsi, 0);
    return { nozzle: sum("nozzle.fixed-orifice"), friction: sum("hose.friction"), elevation: sum("elevation") };
  });
  const total = $derived(parts.nozzle + parts.friction + Math.max(0, parts.elevation));
  const pct = (v: number) => `${total > 0 ? (Math.max(0, v) / total) * 100 : 0}%`;
  const f = (n: number) => n.toFixed(1);
</script>

<section class="budget" class:compact>
  <div class="row"><span>{compact ? "Presión de la bomba" : "¿En qué se gasta la presión de la bomba?"}</span><b>{f(result.nodes[0].pressurePsi)} psi</b></div>
  {#if result.state === "flowing"}
    <div class="bar">
      <div class="nozzle" style:width={pct(parts.nozzle)}>Pitón {f(parts.nozzle)}</div>
      <div class="friction" style:width={pct(parts.friction)}>Fricción {f(parts.friction)}</div>
      {#if parts.elevation > 0}<div class="elevation" style:width={pct(parts.elevation)}>{f(parts.elevation)}</div>{/if}
    </div>
    {#if !compact}<ul class="legend">
      <li>
        <span class="swatch nozzle"></span>
        <span><b>Pitón {f(parts.nozzle)} psi</b> · la presión que llega al pitón y forma el chorro</span>
      </li>
      <li>
        <span class="swatch friction"></span>
        <span><b>Fricción {f(parts.friction)} psi</b> · lo que se pierde por rozamiento en las mangueras</span>
      </li>
      <li>
        <span class="swatch elevation"></span>
        <span>
          <b>Desnivel {f(parts.elevation)} psi</b> ·
          {parts.elevation < 0
            ? "la bajada devuelve presión (no ocupa barra)"
            : "lo que cuesta subir el agua"} · CGBVP: {f(reference.elevationPressurePsi)}
        </span>
      </li>
    </ul>{/if}
  {:else}
    <p class="small">Sin caudal no hay fricción: la bomba solo sostiene el desnivel ({f(parts.elevation)} psi).</p>
  {/if}
</section>

<style>
  .budget { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; display: grid; gap: 8px; }
  .budget.compact { padding: 6px 12px; gap: 4px; }
  .budget.compact .bar { height: 24px; }
  .row { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); font-size: 14px; }
  .row b { color: var(--ink); }
  .small { font-size: 13px; color: var(--muted); margin: 0; }
  .bar { display: flex; height: 28px; border-radius: 6px; overflow: hidden; font-size: 12px; font-weight: 700; color: #fff; background: var(--band); }
  .bar div { display: flex; align-items: center; padding: 0 8px; white-space: nowrap; overflow: hidden; transition: width 250ms; }
  .legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 13px; color: var(--muted); }
  .legend li { display: flex; gap: 8px; align-items: baseline; }
  .legend b { color: var(--ink); }
  .swatch { flex: none; width: 12px; height: 12px; border-radius: 3px; transform: translateY(1px); }
  .nozzle { background: var(--water); }
  .friction { background: var(--friction); }
  .elevation { background: var(--elevation); }
</style>
