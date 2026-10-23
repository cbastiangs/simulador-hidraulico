<script lang="ts">
  import type { Scenario, ScenarioBranch, ScenarioTreeResult, TreeSegmentResult } from "$hydraulics/scenario.ts";
  import * as branch from "$lib/branch-edit.ts";
  import { leafColor } from "$lib/line-colors.ts";

  // Every line of a branched lay at once (UX.md §2/§3), read-only: the drawn
  // line's pressure split and breakdown sit above it, and a line is drawn from
  // the wye (canvas or panel). Nothing here calculates hydraulics: per
  // segment, the flow and the pressure at its two ends (unknown while
  // isolated), the gate and the nozzle state, and the "Comparar con" flow.
  let {
    scenario,
    network,
    reference = null,
    referenceLabel = "",
  }: {
    scenario: Scenario;
    network: ScenarioTreeResult;
    /** The "Comparar con" method's tree solve, or null when comparing is off. */
    reference?: ScenarioTreeResult | null;
    referenceLabel?: string;
  } = $props();

  type Entry = { path: string[]; result: TreeSegmentResult; depth: number; segment: Scenario | ScenarioBranch };
  function climbing(node: TreeSegmentResult, current: string[], depth: number, out: Entry[]) {
    out.push({ path: current, result: node, depth, segment: branch.segmentAt(scenario, current) ?? scenario });
    for (const child of node.branches) climbing(child, [...current, child.id!], depth + 1, out);
    return out;
  }
  const entries = $derived(climbing(network.root, [], 0, []));

  function readingAt(root: TreeSegmentResult, current: string[]): TreeSegmentResult {
    let node = root;
    for (const id of current) {
      const child = node.branches.find((b) => b.id === id);
      if (!child) return root;
      node = child;
    }
    return node;
  }
  const referenceAt = (current: string[]) => (reference ? readingAt(reference.root, current) : null);

  const refApprox = $derived(reference && !reference.balanced ? "≈ " : "");

  const number = (value: number | null | undefined, decimals = 1) =>
    value === null || value === undefined || !Number.isFinite(value) ? "—" : value.toLocaleString("es-PE", { maximumFractionDigits: decimals });
  const pressure = (value: number | null | undefined) => (value === null || value === undefined || !Number.isFinite(value) ? "presión —" : `${number(value)} psi`);
  const gateState = (segment: Scenario | ScenarioBranch, depth: number) =>
    depth === 0 ? "Alimentación" : (segment as ScenarioBranch).open ? "Compuerta abierta" : "Compuerta cerrada";

  const issueText = (issue: { code: string; segmentId: string | null; residualPsi: number }) => {
    const who = issue.segmentId ? branch.flattenSegments(scenario).find((e) => e.path.at(-1) === issue.segmentId)?.segment.name ?? issue.segmentId : "Alimentación";
    if (issue.code === "high-point") return `${who}: el caudal exigiría presión negativa en un acople (${issue.residualPsi.toFixed(1)} psi); la línea no entrega agua.`;
    if (issue.code === "pressure-balance") return `${who}: no hay un caudal que equilibre la malla (residuo ${issue.residualPsi.toFixed(1)} psi); el resultado es aproximado.`;
    return `${who}: el caudal queda atrapado en un escalón de la pérdida por accesorios (residuo ${issue.residualPsi.toFixed(1)} psi); revisa la presión.`;
  };
</script>

<section class="tree-results">
  <div class="total">
    <div><b>{network.balanced ? "" : "≈ "}{number(network.totalFlowGpm)}</b> <span>gpm total</span></div>
    {#if reference}
      <div class="ref"><b>{refApprox}{number(reference.totalFlowGpm)}</b> <span>gpm · {referenceLabel}</span></div>
    {/if}
  </div>
  {#if !network.balanced}
    <p class="balance" role="status">≈ Resultado aproximado: el solver no encontró un equilibrio exacto.</p>
  {/if}
  {#if reference && !reference.balanced}
    <p class="balance" role="status">≈ {referenceLabel}: resultado aproximado; ese método tampoco encontró un equilibrio exacto.</p>
  {/if}

  <ul class="segments">
    {#each entries as entry (entry.path.join("/") || "root")}
      {@const r = entry.result}
      {@const ref = referenceAt(entry.path)}
      <li>
        <div class="row" style:padding-left={`${12 + entry.depth * 14}px`}>
          <span class="name">
            {#if branch.isEmptyOutlet(entry.segment)}Salida vacía{:else}{#if !entry.segment.wye && entry.depth > 0}<span class="line-dot" style:background={leafColor(scenario, entry.path)}></span>{/if}{entry.depth === 0 ? "Alimentación" : entry.segment.name}{/if}
            {#if r.isolated}<span class="badge">aislada</span>{/if}
          </span>
          <span class="state">{gateState(entry.segment, entry.depth)}{#if branch.isEmptyOutlet(entry.segment)} · nada conectado{#if r.flowGpm > 0} · <b class="spill">⚠ al suelo</b>{/if}{:else if !entry.segment.wye} · {entry.segment.nozzle.open ? "pitón abierto" : "pitón cerrado"}{:else} · {entry.segment.wye.device === "trifurca" ? "trifurco" : "bifurco"}{/if}</span>
          <span class="numbers">
            <span><b>{number(r.flowGpm)}</b> gpm{#if ref} <i>({referenceLabel} {refApprox}{number(ref.flowGpm)})</i>{/if}</span>
            <span class="p">{r.isolated ? "presión —" : `${pressure(r.inletPressurePsi)} → ${pressure(r.outletPressurePsi)}`}</span>
          </span>
        </div>
      </li>
    {/each}
  </ul>

  {#if network.issues.length > 0}
    <ul class="issues" aria-label="Avisos del cálculo">
      {#each network.issues as issue, i (i)}
        <li>≈ {issueText(issue)}</li>
      {/each}
    </ul>
  {/if}

  {#if reference && reference.issues.length > 0}
    <ul class="issues" aria-label={`Avisos de ${referenceLabel}`}>
      {#each reference.issues as issue, i (i)}
        <li>≈ {referenceLabel}: {issueText(issue)}</li>
      {/each}
    </ul>
  {/if}

  <p class="source-note">La fuente es una presión fija: la bomba mantiene la presión indicada; su capacidad y su curva aún no se modelan.</p>
</section>

<style>
  .tree-results { display: grid; gap: 10px; }
  .total { display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: baseline; padding: 10px 14px; background: var(--surface); border-radius: var(--radius); }
  .total b { color: var(--water); font-size: 22px; font-variant-numeric: tabular-nums; }
  .total span { color: var(--muted); font-size: 13px; }
  .total .ref b { font-size: 17px; color: var(--ink); }
  .balance { margin: 0; padding: 8px 12px; border-radius: 8px; background: var(--band); color: var(--warn); font-size: 13px; }
  .segments { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
  .segments .row { display: grid; gap: 2px; width: 100%; min-height: 44px; padding: 8px 12px; text-align: left; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); cursor: pointer; }
  .name { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; }
  .badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 1px 6px; }
  .state { font-size: 12px; color: var(--muted); }
  .numbers { display: flex; flex-wrap: wrap; gap: 4px 12px; font-variant-numeric: tabular-nums; font-size: 13px; }
  .numbers b { font-size: 15px; }
  .numbers i { color: var(--muted); font-style: normal; }
  .numbers .p { color: var(--muted); }
  .issues { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .issues li { padding: 8px 10px; border-radius: 8px; background: color-mix(in srgb, var(--warn) 12%, transparent); color: var(--warn); font-size: 13px; }
  .source-note { margin: 0; font-size: 12px; color: var(--muted); }
  .spill { color: var(--warn); }
</style>
