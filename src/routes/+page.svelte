<script lang="ts">
  import { isAuto, parseScenario, solveScenario, type Scenario } from "$hydraulics/scenario.ts";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import BudgetBar from "$lib/components/BudgetBar.svelte";
  import Canvas from "$lib/components/Canvas.svelte";
  import Concepts from "$lib/components/Concepts.svelte";
  import Inspector from "$lib/components/Inspector.svelte";
  import PumpPanel from "$lib/components/PumpPanel.svelte";
  import Sheet, { CLOSED_PX, sheetHeights, type SheetState } from "$lib/components/Sheet.svelte";
  import * as edit from "$lib/edit.ts";
  import type { Selection } from "$lib/selection.ts";

  // Built to docs/design/main-screen.html (UX.md §6).
  // Presets are parsed like any outside document: the same gate as a share link.
  const files = import.meta.glob("/data/presets/*.json", { eager: true, import: "default" });
  const presets = Object.entries(files)
    .map(([path, doc]) => ({ id: path.split("/").pop()!.replace(".json", ""), scenario: parseScenario(doc) }))
    .sort((a, b) => (a.id === "ataque-segundo-piso" ? -1 : b.id === "ataque-segundo-piso" ? 1 : a.id.localeCompare(b.id)));

  let presetId = $state(presets[0].id);
  // Counts loads, so reloading the same preset also refits the canvas.
  let loads = $state(0);
  // Replaced whole by each edit (lib/edit.ts), never mutated in place.
  let scenario: Scenario = $state.raw(presets[0].scenario);
  // Nothing is selected until the user taps something (UX.md §2 "Selecting").
  let selection: Selection | null = $state(null);

  // Phones (UX.md §8): the page does not scroll; a bottom sheet holds the
  // inspector and results, and opens at peek when something is selected.
  // Read from media queries, not innerWidth: a phone can report its 980 px
  // layout width when the page starts and send no resize once it settles.
  let phone = $state(false);
  // Desktop (UX.md §4): pump panel in a left column beside the truck, selection on the right.
  let wide = $state(false);
  $effect(() => {
    const queries = [matchMedia("(max-width: 599.98px)"), matchMedia("(min-width: 1024px)")];
    const sync = () => ([phone, wide] = queries.map((q) => q.matches));
    sync();
    queries.forEach((q) => q.addEventListener("change", sync));
    return () => queries.forEach((q) => q.removeEventListener("change", sync));
  });
  let pumpFolded = $state(false);
  $effect(() => {
    try {
      const stored = localStorage.getItem("panel.pump");
      // Under 1280 px an open pump column leaves the canvas too narrow: it starts folded.
      pumpFolded = stored ? stored === "folded" : !matchMedia("(min-width: 1280px)").matches;
    } catch {
      pumpFolded = !matchMedia("(min-width: 1280px)").matches;
    }
  });
  function foldPump(folded: boolean) {
    pumpFolded = folded;
    try {
      localStorage.setItem("panel.pump", folded ? "folded" : "open");
    } catch {}
  }
  let sheet = $state<SheetState>("closed");
  let windowHeight = $state(800);
  /** How much of the canvas the open sheet covers, so the canvas keeps the selection above it. */
  const coverPx = $derived(phone && sheet === "peek" ? sheetHeights(windowHeight).peek - CLOSED_PX : 0);

  function select(s: Selection, open = true) {
    selection = s;
    if (open && sheet === "closed") sheet = "peek";
  }

  /** Tap on empty canvas, Esc, or a panel's ×: nothing selected; the phone's sheet closes. */
  function deselect() {
    selection = null;
    sheet = "closed";
  }

  function structural(next: Scenario, then?: Selection) {
    apply(next);
    if (then) select(then);
  }

  // Undo and redo (UX.md §2). Every edit goes through `apply`; a burst of edits
  // with the same key (one drag, one typed field) is one step.
  const HISTORY_MAX = 100;
  const BURST_MS = 600;
  let past: Scenario[] = $state.raw([]);
  let future: Scenario[] = $state.raw([]);
  let burst = { key: "", at: 0 };

  function apply(next: Scenario, key = "") {
    if (next === scenario) return;
    const now = performance.now();
    const sameBurst = key !== "" && key === burst.key && now - burst.at < BURST_MS;
    if (!sameBurst) past = [...past.slice(-(HISTORY_MAX - 1)), scenario];
    burst = { key, at: now };
    future = [];
    scenario = next;
  }

  /** Keeps the selection pointing at something that still exists. */
  function keepSelection() {
    const n = scenario.sections.length;
    if ((selection?.kind === "section" && selection.index >= n) || (selection?.kind === "joint" && selection.index > n)) {
      selection = null;
    }
  }

  function undo() {
    if (past.length === 0) return;
    future = [scenario, ...future];
    scenario = past[past.length - 1];
    past = past.slice(0, -1);
    burst = { key: "", at: 0 };
    keepSelection();
  }

  function redo() {
    if (future.length === 0) return;
    past = [...past, scenario];
    scenario = future[0];
    future = future.slice(1);
    burst = { key: "", at: 0 };
    keepSelection();
  }

  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable]")) return;
    // Esc clears the selection, unless it is closing a menu.
    if (event.key === "Escape" && !document.querySelector("[role=menu]")) return deselect();
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "z" && !event.shiftKey) undo();
    else if ((key === "z" && event.shiftKey) || key === "y") redo();
    else return;
    event.preventDefault();
  }

  const result = $derived(solveScenario(scenario));
  const reference = $derived(solveScenario(scenario, "cgbvp-2019"));

  // The pressure split lives below the canvas, which now fills the window: while it
  // is off screen, a slim copy floats at the bottom (UX.md §2).
  let budgetEl: HTMLDivElement | undefined = $state();
  let budgetVisible = $state(true);
  $effect(() => {
    if (!budgetEl) return;
    // Half of it in view counts as visible: a sliver at the window's edge is no use.
    const watcher = new IntersectionObserver(([entry]) => (budgetVisible = entry.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] });
    watcher.observe(budgetEl);
    return () => watcher.disconnect();
  });

  function choosePreset(id: string) {
    presetId = id;
    loads += 1;
    scenario = presets.find((p) => p.id === id)!.scenario;
    selection = null;
    past = [];
    future = [];
  }

  function addSection() {
    apply(edit.addSection(scenario));
    selection = { kind: "section", index: scenario.sections.length - 1 };
  }
</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>
<svelte:window onkeydown={onKey} bind:innerHeight={windowHeight} />

{#snippet line()}
  <section class="line-tools" aria-label="Línea">
    <button type="button" class="add" onclick={addSection}>+ Añadir tramo al final</button>
    <button type="button" class="add" class:on={isAuto(scenario)} aria-pressed={isAuto(scenario)} onclick={() => apply(edit.setAutoFittings(scenario, !isAuto(scenario)))}>
      Accesorios automáticos: {isAuto(scenario) ? "sí" : "no"}
    </button>
  </section>
{/snippet}

{#snippet side()}
  <Inspector {scenario} {selection} onClose={deselect} onchange={(s) => apply(s, `inspector:${JSON.stringify(selection)}`)} onSelect={select} onEdit={structural} />
  {#if !wide}{@render line()}{/if}
{/snippet}

{#snippet results()}
  <div bind:this={budgetEl}><BudgetBar {result} {reference} /></div>
  <details class="card">
    <summary>Ver cálculo ({result.terms.length} fórmulas) · modelo base y CGBVP 2019</summary>
    <table>
      <thead><tr><th></th><th>Modelo base</th><th>CGBVP 2019 (ref.)</th></tr></thead>
      <tbody>
        <tr><td>Caudal</td><td>{result.flowGpm.toFixed(1)} gpm</td><td>{reference.flowGpm.toFixed(1)} gpm</td></tr>
        <tr><td>Accesorios</td><td>{result.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null) ? "sin dato" : `${result.fittingLossPsi.toFixed(1)} psi`}</td><td>{reference.fittingLossPsi.toFixed(1)} psi</td></tr>
        <tr><td>Presión en pitón</td><td>{result.nozzlePressurePsi.toFixed(1)} psi</td><td>{reference.nozzlePressurePsi.toFixed(1)} psi</td></tr>
        <tr><td>Presión requerida</td><td>{result.requiredPumpPressurePsi.toFixed(1)} psi</td><td>{reference.requiredPumpPressurePsi.toFixed(1)} psi</td></tr>
      </tbody>
    </table>
    <Breakdown terms={result.terms} methodId={scenario.methodId} />
  </details>
  <Concepts {scenario} {result} />
{/snippet}

<div class="app" class:phone class:wide class:folded={pumpFolded} style:--sheet-closed={`${CLOSED_PX}px`}>
  <header class="top">
    <h1>Simulador hidráulico</h1>
    <div class="history">
      <button type="button" onclick={undo} disabled={past.length === 0} aria-label="Deshacer" title="Deshacer (Ctrl+Z)">↶<span class="word"> Deshacer</span></button>
      <button type="button" onclick={redo} disabled={future.length === 0} aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)">↷<span class="word"> Rehacer</span></button>
    </div>
    <select value={presetId} onchange={(e) => choosePreset(e.currentTarget.value)} aria-label="Escenario inicial">
      {#each presets as p (p.id)}<option value={p.id}>{p.scenario.name}</option>{/each}
    </select>
  </header>

  <div class="pump">
    <PumpPanel {scenario} {result} onchange={(s) => apply(s, "pump")} column={wide} collapsed={pumpFolded} onCollapse={foldPump} strip={phone} onOpen={() => select({ kind: "pump" })} />
    {#if wide && !pumpFolded}{@render line()}{/if}
  </div>

  <div class="canvas">
    <Canvas
      {scenario}
      {result}
      {selection}
      {phone}
      {wide}
      {coverPx}
      resetKey={`${presetId}#${loads}`}
      onSelect={select}
      onTapEmpty={deselect}
      onDeselect={deselect}
      onMove={(i, runM, elevationM) => apply(edit.moveCoupling(scenario, i, { runM, elevationM }), `move:${i}`)}
      onToggleLock={(i) => apply(edit.toggleLengthLock(scenario, i))}
      onHoseSize={(i, id) => apply(edit.setSectionHose(scenario, i, id))}
      onLength={(i, m) => apply(edit.setSectionLength(scenario, i, m), `length:${i}`)}
      onToggleFitting={(j, kind) => apply(edit.toggleFitting(scenario, j, kind))}
      onToggleNozzle={() => apply(edit.setNozzleOpen(scenario, !scenario.nozzle.open))}
      onEdit={structural}
    />
  </div>

  {#if !phone}
    <div class="side">{@render side()}</div>
    <div class="results">{@render results()}</div>
  {/if}
</div>

{#if phone}
  <Sheet {sheet} onSheet={(s) => (sheet = s)}>
    {#snippet summary()}<BudgetBar {result} {reference} compact />{/snippet}
    {#if selection?.kind === "pump"}
      <!-- The phone's pump strip is a summary; the whole panel opens here (UX.md §8.2). -->
      <PumpPanel {scenario} {result} onchange={(s) => apply(s, "pump")} column onClose={deselect} />
      {@render line()}
    {:else}
      {@render side()}
    {/if}
    {@render results()}
  </Sheet>
{:else if !budgetVisible}
  <div class="dock"><BudgetBar {result} {reference} compact /></div>
{/if}

<style>
  /* Layout by width: docs/UX.md §4. */
  .app {
    display: grid;
    gap: var(--gap);
    padding: var(--gap) var(--gap) 90px;
    max-width: 2000px;
    margin: 0 auto;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "top" "pump" "canvas" "side" "results";
  }
  /* Desktop: pump | canvas and results | selection; the side columns stay in view while the results scroll. */
  .app.wide {
    grid-template-columns: 300px minmax(0, 1fr) 340px;
    grid-template-areas: "top top top" "pump canvas side" "pump results side";
    grid-template-rows: auto auto 1fr;
  }
  .app.wide.folded { grid-template-columns: 64px minmax(0, 1fr) 340px; }
  .app.wide .pump, .app.wide .side { position: sticky; top: var(--gap); align-self: start; max-height: calc(100dvh - 2 * var(--gap)); overflow: auto; }
  .dock { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; padding: 8px var(--gap) calc(8px + env(safe-area-inset-bottom)); background: var(--bg); box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15); }
  .dock > :global(*) { max-width: 1976px; margin: 0 auto; }
  .top { grid-area: top; display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; justify-content: space-between; }
  .top h1 { margin: 0; font-size: 18px; }
  .history { display: flex; gap: 6px; margin-left: auto; }
  .history button { height: 44px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; cursor: pointer; }
  .history button:disabled { opacity: 0.4; cursor: default; }
  .top select { height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); padding: 0 10px; max-width: 100%; }
  .pump { grid-area: pump; display: grid; gap: var(--gap); align-content: start; }
  .line-tools { display: grid; gap: 8px; }
  .add.on { border-color: var(--fitting); color: var(--fitting); }
  .canvas { grid-area: canvas; min-width: 0; }
  .side { grid-area: side; display: grid; gap: var(--gap); align-content: start; }
  .results { grid-area: results; display: grid; gap: var(--gap); min-width: 0; }
  .add { min-height: 44px; border-radius: 8px; border: 1px dashed var(--muted); background: transparent; cursor: pointer; font-weight: 600; }
  .card { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; }
  .card summary { cursor: pointer; color: var(--accent); }
  .card[open] summary { margin-bottom: 12px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 14px; }
  td, th { padding: 6px 8px; text-align: right; border-bottom: 1px solid var(--line); }
  td:first-child, th:first-child { text-align: left; }

  /* Phones (UX.md §8): one screen, no page scroll; the sheet sits below the canvas. */
  .app.phone {
    height: 100dvh;
    overflow: hidden;
    padding: 8px 8px calc(var(--sheet-closed) + 4px);
    gap: 6px;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "top" "pump" "canvas";
    grid-template-rows: auto auto minmax(0, 1fr);
  }
  .app.phone .top { flex-wrap: nowrap; }
  .app.phone .top h1, .app.phone .word { display: none; }
  .app.phone .history { order: 2; margin-left: 0; }
  .app.phone .history button { min-width: 44px; padding: 0; font-size: 20px; }
  .app.phone .top select { flex: 1; min-width: 0; }
  .app.phone .canvas { min-height: 0; }
</style>
