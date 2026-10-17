<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import * as branch from "$lib/branch-edit.ts";
  import { prefs, setControls } from "$lib/prefs.svelte.ts";
  import WyeCloseUp from "./WyeCloseUp.svelte";

  // A wye's panel (UX.md §2 "Branched lays"): every outlet with its gate, its
  // reading and a way to edit its line; adding and removing lines. The valves
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
  const addWhy = $derived(branch.addLimit(tree, junction.owner, "branch"));
  const canRemove = $derived(junction.outlets.length > 2);
  const readingOf = (o: { open: boolean; path: string[] }) => {
    const r = outlets[o.path.join("/")];
    return !o.open ? "Válvula cerrada" : r?.isolated ? "Aislada" : r ? `${r.flowGpm.toFixed(0)} gpm` : "";
  };
</script>

<div class="style-switch">
  <button type="button" onclick={() => setControls(prefs.controls === "drawn" ? "plain" : "drawn")}>{prefs.controls === "drawn" ? "Ver controles simples" : "Ver bifurca dibujada"}</button>
</div>
{#if prefs.controls === "drawn"}
  <WyeCloseUp outlets={segments.map((o) => ({ ...o, reading: readingOf(o) }))} onGate={(path) => onTree(branch.toggleGate(tree, path))} />
{/if}

<ul class="outlets">
  {#each segments as o (o.id)}
    {@const r = outlets[o.path.join("/")]}
    <li class:active={o.active}>
      <div class="who">
        <b>{o.name}</b>
        <span>{branch.branchLabel(o.segment).slice(o.name.length + 3)}</span>
        <span class="reading">
          {#if !o.open}Válvula cerrada · 0 gpm{:else if r?.isolated}Aislada aguas arriba{:else if r}{r.flowGpm.toFixed(0)} gpm{r.nozzlePsi !== null ? ` · pitón ${r.nozzlePsi.toFixed(0)} psi` : ""}{/if}
        </span>
      </div>
      {#if prefs.controls === "plain"}
      <div class="seg" role="radiogroup" aria-label={`Válvula de ${o.name}`}>
        <button type="button" role="radio" aria-checked={o.open} class:on={o.open} onclick={() => !o.open && onTree(branch.toggleGate(tree, o.path))}>Abierta</button>
        <button type="button" role="radio" aria-checked={!o.open} class:on={!o.open} onclick={() => o.open && onTree(branch.toggleGate(tree, o.path))}>Cerrada</button>
      </div>
      {/if}
      <div class="row">
        {#if o.active}<span class="drawn">En edición</span>{:else}<button type="button" onclick={() => onLine(o.path)}>Editar esta línea</button>{/if}
        {#if canRemove}<button type="button" class="danger" onclick={() => onTree(branch.removeBranch(tree, o.path))}>Quitar</button>{/if}
      </div>
    </li>
  {/each}
</ul>
<div class="row">
  <button type="button" disabled={addWhy !== null} title={addWhy ?? undefined} onclick={() => onTree(branch.addBranch(tree, junction.owner))}>Añadir línea</button>
  <button type="button" class="danger" onclick={() => onTree(branch.removeWye(tree, junction.owner))}>Quitar bifurca y sus líneas</button>
</div>
{#if addWhy}<p class="note">{addWhy}</p>{/if}

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
  .seg .on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .row button:disabled { opacity: 0.45; cursor: default; }
  .danger { color: var(--warn) !important; }
  .drawn { font-size: 13px; color: var(--accent); font-weight: 600; padding: 0 4px; }
  .note { margin: 0; font-size: 12px; color: var(--muted); }
</style>
