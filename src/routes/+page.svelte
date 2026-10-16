<script lang="ts">
  import { parseScenario, pathResult, solveScenario, solveScenarioTree, type Scenario, type TreeSegmentResult } from "$hydraulics/scenario.ts";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import BudgetBar from "$lib/components/BudgetBar.svelte";
  import Canvas from "$lib/components/Canvas.svelte";
  import Concepts from "$lib/components/Concepts.svelte";
  import Inspector from "$lib/components/Inspector.svelte";
  import PumpPanel from "$lib/components/PumpPanel.svelte";
  import Sources from "$lib/components/Sources.svelte";
  import Sheet, { CLOSED_PX, sheetHeights, type SheetState } from "$lib/components/Sheet.svelte";
  import Actions from "$lib/components/Actions.svelte";
  import type { Action, Target } from "$lib/actions.ts";
  import * as edit from "$lib/edit.ts";
  import { METHOD_IDS, METHOD_LABELS } from "$lib/methods.ts";
  import type { MethodId } from "$hydraulics/references.ts";
  import NumberField from "$lib/components/NumberField.svelte";
  import type { Selection } from "$lib/selection.ts";
  import TreeResults from "$lib/components/TreeResults.svelte";
  import * as branch from "$lib/branch-edit.ts";

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
  /** A branched lay's drawn line: one branch id per wye, from the pump to a nozzle (UX.md §2). */
  let selectedPath: string[] = $state([]);

  // Phones (UX.md §8): the page does not scroll; a bottom sheet holds the
  // inspector and results, and opens at peek when something is selected.
  // Read from media queries, not innerWidth: a phone can report its 980 px
  // layout width when the page starts and send no resize once it settles.
  let phone = $state(false);
  // Desktop (UX.md §4): one panel on the right, the pump header atop it.
  let wide = $state(false);
  $effect(() => {
    const queries = [matchMedia("(max-width: 599.98px)"), matchMedia("(min-width: 1024px)")];
    const sync = () => ([phone, wide] = queries.map((q) => q.matches));
    sync();
    queries.forEach((q) => q.addEventListener("change", sync));
    return () => queries.forEach((q) => q.removeEventListener("change", sync));
  });
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

  // Every action (lib/actions.ts) runs here, whichever surface offered it:
  // one undo step, then the selection it names.
  let fitSignal = $state(0);
  function runAction(action: Action, target: Target) {
    if (scenario.wye && action.id === "pump.apply-required") return;
    const c = { scenario: lineScenario, target, requiredPsi: result.requiredPumpPressurePsi };
    if (action.blocked?.(c)) return;
    const out = action.run(c);
    if (out.scenario) applyLine(out.scenario, "", "index" in target ? target.index : undefined);
    if (out.view === "fit") fitSignal += 1;
    if (out.select === null) deselect();
    else if (out.select) select(out.select);
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
    const n = lineScenario.sections.length;
    if ((selection?.kind === "section" && selection.index >= n) || (selection?.kind === "joint" && selection.index > n)) {
      selection = null;
    }
  }

  /** Draw another outlet's line; what stays on the drawing stays selected. */
  function selectLine(path: string[]) {
    selectedPath = path;
    keepSelection();
  }

  /** An edit of the whole branched lay (gates, lines, wyes). */
  function applyTree(next: Scenario) {
    // The drawn line stays drawn: shutting its gate must not hand the drawing to another outlet.
    if (view) selectedPath = view.path;
    apply(next);
    keepSelection();
  }

  /**
   * An edit of the drawn line, from the canvas, the panel or an action. On a
   * branched lay it maps back into the tree; `hint` is the section or joint a
   * hose was added or removed at.
   */
  function applyLine(next: Scenario, key = "", hint?: number) {
    if (!view) return apply(next, key);
    apply(branch.applyPathEdit(scenario, view, next, hint), key && `${view.path.join("/")}:${key}`);
    keepSelection();
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

  // A branched lay is drawn, edited and split one pump-to-nozzle line at a
  // time (UX.md §2): `lineScenario` is that line as an ordinary one-line
  // scenario, `result` its reading from the tree solve; the pump shows the total.
  const network = $derived(scenario.wye ? solveScenarioTree(scenario) : null);
  const view = $derived(scenario.wye ? branch.pathView(scenario, selectedPath) : null);
  const lineScenario = $derived(view?.scenario ?? scenario);
  const result = $derived(network && view ? pathResult(network.root, view.path) : solveScenario(scenario));
  const pumpResult = $derived(network?.root.result ?? result);
  /** Each outlet's reading, keyed by its path joined with "/". */
  const outlets = $derived.by(() => {
    const out: Record<string, { flowGpm: number; isolated: boolean; nozzlePsi: number | null }> = {};
    const walk = (node: TreeSegmentResult, path: string[]) => {
      if (path.length) out[path.join("/")] = { flowGpm: node.flowGpm, isolated: node.isolated, nozzlePsi: node.branches.length ? null : node.outletPressurePsi };
      for (const b of node.branches) walk(b, [...path, b.id!]);
    };
    if (network) walk(network.root, []);
    return out;
  });
  const wyeWhy = $derived(branch.addLimit(scenario, view?.path ?? [], "wye"));
  const lineName = $derived(view ? view.path.map((id, i) => view.junctions[i].outlets.find((o) => o.id === id)!.name).join(" › ") : "");
  // "Comparar con" (MODEL.md §4): a second method solved beside the first, or
  // none; a view choice, remembered per browser, off when it equals "Método".
  let compareId = $state<MethodId | null>("cgbvp-2019");
  $effect(() => {
    try {
      const stored = localStorage.getItem("view.compare");
      if (stored !== null) compareId = stored === "none" ? null : METHOD_IDS.includes(stored as MethodId) ? (stored as MethodId) : compareId;
    } catch {}
  });
  function chooseCompare(id: MethodId | null) {
    compareId = id;
    try {
      localStorage.setItem("view.compare", id ?? "none");
    } catch {}
  }
  const comparing = $derived(compareId !== null && compareId !== scenario.methodId ? compareId : null);
  const referenceNetwork = $derived(comparing && network ? solveScenarioTree(scenario, comparing) : null);
  const reference = $derived(comparing ? referenceNetwork && view ? pathResult(referenceNetwork.root, view.path) : solveScenario(scenario, comparing) : null);
  const methodName = $derived(METHOD_LABELS[scenario.methodId]);
  const refName = $derived(comparing ? METHOD_LABELS[comparing] : "");

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
    selectedPath = [];
    past = [];
    future = [];
  }

  // Global (UX.md §10.1): both are undoable and refit the canvas.
  let fileMenu: HTMLDetailsElement | undefined = $state();
  function newLine() {
    apply(edit.blankLine(scenario));
    selectedPath = [];
    loads += 1;
    deselect();
    if (fileMenu) fileMenu.open = false;
  }
  function resetPreset() {
    apply(presets.find((p) => p.id === presetId)!.scenario);
    selectedPath = [];
    loads += 1;
    deselect();
    if (fileMenu) fileMenu.open = false;
  }
</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>
<svelte:window onkeydown={onKey} bind:innerHeight={windowHeight} />

{#snippet line()}
  <section class="line-tools" aria-label="Línea">
    <h2>Línea</h2>
    <label class="field">
      <span>Nombre</span>
      <input type="text" value={scenario.name} maxlength="80" oninput={(e) => apply(edit.setName(scenario, e.currentTarget.value), "name")} />
    </label>
    <div class="field">
      <span>Método</span>
      <div class="seg" role="radiogroup" aria-label="Método">
        {#each METHOD_IDS as id (id)}
          <button type="button" role="radio" aria-checked={scenario.methodId === id} class:on={scenario.methodId === id} onclick={() => apply(edit.setMethod(scenario, id))}>{METHOD_LABELS[id]}</button>
        {/each}
      </div>
    </div>
    <div class="field">
      <span>Comparar con</span>
      <div class="seg" role="radiogroup" aria-label="Comparar con">
        <button type="button" role="radio" aria-checked={comparing === null} class:on={comparing === null} onclick={() => chooseCompare(null)}>Nada</button>
        {#each METHOD_IDS.filter((id) => id !== scenario.methodId) as id (id)}
          <button type="button" role="radio" aria-checked={comparing === id} class:on={comparing === id} onclick={() => chooseCompare(id)}>{METHOD_LABELS[id]}</button>
        {/each}
      </div>
    </div>
    <NumberField label="Altura de piso" value={edit.floorOf(scenario)} unit="m" step={0.1} onchange={(m) => apply(edit.setFloorHeight(scenario, m), "floor")} />
    <Actions target={{ kind: "line" }} scenario={lineScenario} requiredPsi={result.requiredPumpPressurePsi} place="panel" onAction={runAction} />
    <!-- A wye at the end of the drawn line: two new lines with their own nozzles (UX.md §2). -->
    <button type="button" class="add-wye" disabled={wyeWhy !== null} title={wyeWhy ?? "Dos líneas nuevas, cada una con su pitón"} onclick={() => applyTree(branch.addWye(scenario, view?.path ?? []))}>Añadir bifurca al final</button>
  </section>
{/snippet}

{#snippet side()}
  {#if selection === null}{@render line()}{/if}
  <Inspector
    scenario={lineScenario}
    {selection}
    floorM={edit.floorOf(scenario)}
    onClose={deselect}
    onchange={(s) => applyLine(s, `inspector:${JSON.stringify(selection)}`)}
    onSelect={select}
    requiredPsi={result.requiredPumpPressurePsi}
    {result}
    branched={!!network}
    onAction={runAction}
    tree={network ? scenario : undefined}
    {outlets}
    onTree={applyTree}
    onLine={selectLine}
  />
{/snippet}

{#snippet results()}
  {#if network}<p class="line-name">En el dibujo: <b>{lineName}</b> · toca otra salida de la bifurca para ver su línea</p>{/if}
  <div bind:this={budgetEl}><BudgetBar {result} {reference} referenceLabel={refName} /></div>
  <details class="card">
    <summary>Ver cálculo ({result.terms.length} fórmulas) · {methodName}{comparing ? ` y ${refName}` : ""}</summary>
    <table>
      <thead><tr><th></th><th>{methodName}</th>{#if reference}<th>{refName} (comparación)</th>{/if}</tr></thead>
      <tbody>
        <tr><td>Caudal</td><td>{result.flowGpm.toFixed(1)} gpm</td>{#if reference}<td>{reference.flowGpm.toFixed(1)} gpm</td>{/if}</tr>
        <tr><td>Accesorios</td><td>{result.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null) ? "sin dato" : `${result.fittingLossPsi.toFixed(1)} psi`}</td>{#if reference}<td>{reference.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null) ? "sin dato" : `${reference.fittingLossPsi.toFixed(1)} psi`}</td>{/if}</tr>
        <tr><td>Presión en pitón</td><td>{result.nozzlePressurePsi.toFixed(1)} psi</td>{#if reference}<td>{reference.nozzlePressurePsi.toFixed(1)} psi</td>{/if}</tr>
        {#if !network}<tr><td>Presión requerida</td><td>{result.requiredPumpPressurePsi.toFixed(1)} psi</td>{#if reference}<td>{reference.requiredPumpPressurePsi.toFixed(1)} psi</td>{/if}</tr>{/if}
      </tbody>
    </table>
    <Breakdown terms={result.terms} methodId={scenario.methodId} scenario={lineScenario} />
  </details>
  {#if network}<TreeResults {scenario} {network} reference={referenceNetwork} referenceLabel={refName} />{/if}
  <Sources methodId={scenario.methodId} />
  <Concepts scenario={lineScenario} {result} />
{/snippet}

{#snippet pumpPanel(mode: "strip" | "head" | "full" | "bar")}
  <PumpPanel {scenario} result={pumpResult} branched={!!network} balanced={network?.balanced ?? true} onchange={(s) => apply(s, "pump")} strip={mode === "strip"} head={mode === "head"} full={mode === "full"} onOpen={() => select({ kind: "pump" })} />
{/snippet}

{#snippet summary()}
  <BudgetBar {result} {reference} referenceLabel={refName} compact />
{/snippet}

<div class="app" class:phone class:wide style:--sheet-closed={`${CLOSED_PX}px`}>
  <header class="top">
    <h1>Simulador hidráulico</h1>
    <div class="history">
      <button type="button" onclick={undo} disabled={past.length === 0} aria-label="Deshacer" title="Deshacer (Ctrl+Z)">↶<span class="word"> Deshacer</span></button>
      <button type="button" onclick={redo} disabled={future.length === 0} aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)">↷<span class="word"> Rehacer</span></button>
    </div>
    <select value={presetId} onchange={(e) => choosePreset(e.currentTarget.value)} aria-label="Escenario inicial">
      {#each presets as p (p.id)}<option value={p.id}>{p.scenario.name}</option>{/each}
    </select>
    <details class="file" bind:this={fileMenu}>
      <summary aria-label="Más: línea nueva, reiniciar" title="Línea nueva, reiniciar">⋯</summary>
      <div class="file-menu">
        <button type="button" onclick={newLine}>Línea nueva</button>
        <button type="button" onclick={resetPreset}>Reiniciar escenario</button>
      </div>
    </details>
  </header>

  {#if !wide}
    <div class="pump">{@render pumpPanel(phone ? "strip" : "bar")}</div>
  {/if}

  <div class="canvas">
    <Canvas
      scenario={lineScenario}
      {result}
      {selection}
      {phone}
      {wide}
      {coverPx}
      floorM={edit.floorOf(scenario)}
      resetKey={`${presetId}#${loads}`}
      onSelect={select}
      onTapEmpty={deselect}
      onDeselect={deselect}
      onMove={(i, runM, elevationM) => applyLine(edit.moveCoupling(lineScenario, i, { runM, elevationM }), `move:${i}`)}
      onToggleLock={(i) => applyLine(edit.toggleLengthLock(lineScenario, i))}
      onHoseSize={(i, id) => applyLine(edit.setSectionHose(lineScenario, i, id))}
      onLength={(i, m) => applyLine(edit.setSectionLength(lineScenario, i, m), `length:${i}`)}
      onToggleFitting={(j, kind) => applyLine(edit.toggleFitting(lineScenario, j, kind))}
      onToggleNozzle={() => applyLine(edit.setNozzleOpen(lineScenario, !lineScenario.nozzle.open))}
      onAction={runAction}
      {fitSignal}
      {outlets}
      onGate={(path) => applyTree(branch.toggleGate(scenario, path))}
      onLine={selectLine}
    />
  </div>

  {#if !phone}
    <div class="side">
      {#if wide}<div class="head">{@render pumpPanel("head")}</div>{/if}
      {@render side()}
    </div>
    <div class="results">{@render results()}</div>
  {/if}
</div>

{#if phone}
  <Sheet {summary} {sheet} onSheet={(s) => (sheet = s)}>
    {#if selection?.kind === "pump"}
      <!-- The strip is a summary; the pump's whole control opens here, above its detail (UX.md §4). -->
      {@render pumpPanel("full")}
    {/if}
    {@render side()}
    {@render results()}
  </Sheet>
{:else if !budgetVisible}
  <div class="dock"><BudgetBar {result} {reference} referenceLabel={refName} compact /></div>
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
  /* Desktop: canvas and results | the panel, which stays in view while the results scroll. */
  .app.wide {
    grid-template-columns: minmax(0, 1fr) 360px;
    grid-template-areas: "top top" "canvas side" "results side";
    grid-template-rows: auto auto 1fr;
  }
  .app.wide .head { position: sticky; top: 0; z-index: 5; }
  /* Shorter than the viewport by the bottom padding, so it can stay stuck to the end of the page. */
  .app.wide .side { position: sticky; top: var(--gap); align-self: start; max-height: calc(100dvh - var(--gap) - 90px); overflow: auto; }
  .dock { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; padding: 8px var(--gap) calc(8px + env(safe-area-inset-bottom)); background: var(--bg); box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15); }
  .dock > :global(*) { max-width: 1976px; margin: 0 auto; }
  .top { grid-area: top; display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; justify-content: space-between; }
  .top h1 { margin: 0; font-size: 18px; }
  .history { display: flex; gap: 6px; margin-left: auto; }
  .history button { height: 44px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; cursor: pointer; }
  .history button:disabled { opacity: 0.4; cursor: default; }
  .top select { height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); padding: 0 10px; max-width: 100%; }
  .file { position: relative; }
  .file summary { list-style: none; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-size: 20px; font-weight: 700; cursor: pointer; }
  .file summary::-webkit-details-marker { display: none; }
  .file-menu { position: absolute; right: 0; top: 50px; z-index: 30; min-width: 200px; display: grid; padding: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
  .file-menu button { min-height: 44px; padding: 0 12px; text-align: left; border: 0; border-radius: 6px; background: transparent; color: var(--ink); font-size: 14px; cursor: pointer; }
  .file-menu button:hover { background: var(--accent-soft); }
  .pump { grid-area: pump; display: grid; gap: var(--gap); align-content: start; }
  .line-tools { display: grid; gap: 8px; background: var(--surface); border-radius: var(--radius); padding: 12px 14px; }
  .field { display: grid; gap: 6px; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .field input { height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); padding: 0 10px; font-size: 15px; color: var(--ink); text-transform: none; letter-spacing: 0; }
  .seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; }
  .seg button { min-height: 40px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; font-size: 13px; cursor: pointer; text-transform: none; letter-spacing: 0; color: var(--ink); }
  .seg .on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .line-tools h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
  .canvas { grid-area: canvas; min-width: 0; }
  .line-name { margin: 0; font-size: 13px; color: var(--muted); }
  .line-name b { color: var(--ink); }
  .add-wye { justify-self: start; min-height: 44px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; font-size: 14px; }
  .add-wye:disabled { opacity: 0.45; cursor: default; }
  .side { grid-area: side; display: grid; gap: var(--gap); align-content: start; }
  .results { grid-area: results; display: grid; gap: var(--gap); min-width: 0; }
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
  .app.phone .file { order: 3; }
  .app.phone .canvas { min-height: 0; }
</style>
