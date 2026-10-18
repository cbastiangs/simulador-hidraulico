<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import * as branch from "$lib/branch-edit.ts";
  import { leafColor } from "$lib/line-colors.ts";
  import { prefs, setControls } from "$lib/prefs.svelte.ts";
  import WyeCloseUp from "./WyeCloseUp.svelte";

  // A wye's panel (UX.md §2 "Branched lays"): the device (bifurco or
  // trifurco), every outlet with its gate, its reading and a way to edit its
  // line (MODEL.md §2: an empty outlet flows when its gate is open).
  // Connecting, disconnecting and removing are the canvas's Piezas (owner,
  // 2026-10-18: add and delete buttons in the panel felt awkward). The valves
  // are worked on the close-up drawn from above, or with plain buttons: the
  // same preference as the nozzle's (UX.md §10.1), both complete.
  let {
    tree,
    junction,
    outlets,
    onTree,
    onLine,
  }: {
    /** The whole branched lay, which these edits change. */
    tree: Scenario;
    junction: branch.Junction;
    outlets: Record<string, { flowGpm: number; isolated: boolean; nozzlePsi: number | null }>;
    onTree: (s: Scenario) => void;
    onLine: (path: string[]) => void;
  } = $props();

  const segments = $derived(junction.outlets.map((o) => ({ ...o, segment: branch.segmentAt(tree, o.path)! })));
  const DEVICES = [{ id: "wye", label: "Bifurco" }, { id: "trifurca", label: "Trifurco" }] as const;
  const readingOf = (o: { open: boolean; path: string[]; empty: boolean }) => {
    const r = outlets[o.path.join("/")];
    const what = o.empty ? "Vacía · " : "";
    return !o.open ? `${what}Válvula cerrada` : r?.isolated ? "Aislada" : r ? `${what}${r.flowGpm.toFixed(0)} gpm` : "";
  };
</script>

<div class="style-switch">
  <button type="button" onclick={() => setControls(prefs.controls === "drawn" ? "plain" : "drawn")}>{prefs.controls === "drawn" ? "Ver controles simples" : "Ver bifurco dibujado"}</button>
</div>
{#if prefs.controls === "drawn"}
  <WyeCloseUp outlets={segments.map((o) => ({ ...o, reading: readingOf(o) }))} onGate={(path) => onTree(branch.toggleGate(tree, path))} />
{/if}

<div class="seg device" role="radiogroup" aria-label="Accesorio">
  {#each DEVICES as d (d.id)}
    {@const why = d.id === junction.device ? null : branch.deviceLimit(tree, junction.owner, d.id)}
    <button type="button" role="radio" aria-checked={junction.device === d.id} class:on={junction.device === d.id} disabled={why !== null} title={why ?? undefined}
      onclick={() => junction.device !== d.id && onTree(branch.setDevice(tree, junction.owner, d.id))}>{d.label}</button>
  {/each}
</div>

<ul class="outlets">
  {#each segments as o (o.id)}
    {@const r = outlets[o.path.join("/")]}
    <li class:active={o.active} class:empty={o.empty}>
      <div class="who">
        {#if o.empty}
          <b>Salida vacía</b>
          <span>Nada conectado · boca de 1½″</span>
          <span class="reading" class:spill={o.open && (r?.flowGpm ?? 0) > 0}>
            {#if !o.open}Válvula cerrada · tapada{:else if r?.isolated}Aislada aguas arriba{:else if r}⚠ Abierta sin manguera: {r.flowGpm.toFixed(0)} gpm al suelo{/if}
          </span>
        {:else}
          <b>{#if !o.segment.wye}<span class="line-dot" style:background={leafColor(tree, o.path)}></span>{/if}{o.name}</b>
          <span>{branch.branchLabel(o.segment).slice(o.name.length + 3)}</span>
          <span class="reading">
            {#if !o.open}Válvula cerrada · 0 gpm{:else if r?.isolated}Aislada aguas arriba{:else if r}{r.flowGpm.toFixed(0)} gpm{r.nozzlePsi !== null ? ` · pitón ${r.nozzlePsi.toFixed(0)} psi` : ""}{/if}
          </span>
        {/if}
      </div>
      {#if prefs.controls === "plain"}
      <div class="seg" role="radiogroup" aria-label={`Válvula de ${o.empty ? "la salida vacía" : o.name}`}>
        <button type="button" role="radio" aria-checked={o.open} class:on={o.open} onclick={() => !o.open && onTree(branch.toggleGate(tree, o.path))}>Abierta</button>
        <button type="button" role="radio" aria-checked={!o.open} class:on={!o.open} onclick={() => o.open && onTree(branch.toggleGate(tree, o.path))}>Cerrada</button>
      </div>
      {/if}
      {#if !o.empty}
        <div class="row">
          {#if o.active}<span class="drawn">En edición</span>{:else}<button type="button" onclick={() => onLine(o.path)}>Editar esta línea</button>{/if}
        </div>
      {/if}
    </li>
  {/each}
</ul>
<p class="note">Para conectar una línea, pon un tramo de <b>Piezas</b> en la salida vacía; para desconectarla o quitar el accesorio, usa <b>Quitar</b> en el dibujo.</p>

<style>
  .style-switch { display: flex; justify-content: flex-end; margin: -8px 0 -6px; }
  .style-switch button { min-height: 36px; padding: 0 4px; border: 0; background: transparent; color: var(--accent); font-size: 13px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .outlets { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  li { display: grid; gap: 8px; padding: 10px; border: 1px solid var(--line); border-radius: 10px; }
  li.active { border-color: var(--accent); }
  .who { display: grid; gap: 2px; }
  .who span { font-size: 13px; color: var(--muted); }
  .who .reading { color: var(--ink); font-variant-numeric: tabular-nums; }
  .seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; }
  .seg button, .row button { min-height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-weight: 600; cursor: pointer; padding: 0 12px; }
  .seg button:disabled { opacity: 0.45; cursor: default; }
  .device { margin-bottom: 4px; }
  li.empty { border-style: dashed; }
  .who .reading.spill { color: var(--warn); font-weight: 600; }
  .seg .on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .note { margin: 0; font-size: 13px; color: var(--muted); }
  .drawn { font-size: 13px; color: var(--accent); font-weight: 600; padding: 0 4px; }
</style>
