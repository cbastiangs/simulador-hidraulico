<script lang="ts">
  import { parseScenario, pathResult, solveScenario, solveScenarioTree, type Scenario, type TreeSegmentResult } from "$hydraulics/scenario.ts";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import BudgetBar from "$lib/components/BudgetBar.svelte";
  import PowerSplit from "$lib/components/PowerSplit.svelte";
  import { powerSplit } from "$hydraulics/power.ts";
  import { untrack } from "svelte";
  import Canvas from "$lib/components/Canvas.svelte";
  import Concepts from "$lib/components/Concepts.svelte";
  import Inspector from "$lib/components/Inspector.svelte";
  import PumpPanel from "$lib/components/PumpPanel.svelte";
  import Sources from "$lib/components/Sources.svelte";
  import Sheet, { CLOSED_PX, sheetHeights, type SheetState } from "$lib/components/Sheet.svelte";
  import type { Action, Target } from "$lib/actions.ts";
  import * as edit from "$lib/edit.ts";
  import { METHOD_IDS, METHOD_LABELS } from "$lib/methods.ts";
  import type { MethodId } from "$hydraulics/references.ts";
  import Settings from "$lib/components/Settings.svelte";
  import ScenarioText from "$lib/components/ScenarioText.svelte";
  import Tour, { tourSeen } from "$lib/components/Tour.svelte";
  import * as share from "$lib/share.ts";
  import type { Selection } from "$lib/selection.ts";
  import TreeResults from "$lib/components/TreeResults.svelte";
  import * as branch from "$lib/branch-edit.ts";
  import { leafColor } from "$lib/line-colors.ts";
  import * as pieces from "$lib/pieces.ts";

  // Built to docs/design/main-screen.html (UX.md §6).
  // Presets are parsed like any outside document: the same gate as a share link.
  // The first lay a visitor sees and the welcome tour runs on (UX.md §8.4).
  const DEFAULT_PRESET = "bifurcada";
  const files = import.meta.glob("/data/presets/*.json", { eager: true, import: "default" });
  const presets = Object.entries(files)
    .map(([path, doc]) => ({ id: path.split("/").pop()!.replace(".json", ""), scenario: parseScenario(doc) }))
    .sort((a, b) => (a.id === DEFAULT_PRESET ? -1 : b.id === DEFAULT_PRESET ? 1 : a.id.localeCompare(b.id)));

  /** The preset loaded last; null when the scenario came from a link or a paste. */
  let presetId = $state<string | null>(presets[0].id);
  /** What "Reiniciar este escenario" returns to: the preset, link or paste loaded last. */
  let base: Scenario = $state.raw(presets[0].scenario);
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
    if (out.tree) {
      apply(out.tree.tree);
      selectedPath = out.tree.path;
      keepSelection();
    }
    if (out.view === "fit") fitSignal += 1;
    if (out.select === null) deselect();
    else if (out.select) select(out.select);
  }

  /** A piece dropped on the canvas (lib/pieces.ts, UX.md §2 "Pieces"), on any drawn line: one undo step, then what it names. */
  function place(piece: pieces.PieceId, spot: pieces.Spot, path?: string[]) {
    // A spot on another line edits that line: it becomes the drawn one, as a tap on it would.
    if (path) selectedPath = path;
    const out = pieces.place(piece, spot, lineScenario);
    if (out.scenario) applyLine(out.scenario, "", out.hint);
    if (out.tree) {
      apply(out.tree.tree);
      selectedPath = out.tree.path;
      keepSelection();
    }
    if (out.select === null) deselect();
    else if (out.select) select(out.select, false);
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
    if (event.key === "Escape" && scenarioMenu?.open) return void (scenarioMenu.open = false);
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
  /** The lay's other lines, drawn beside the edited one: each from the wye where it leaves it. */
  const others = $derived.by(() => {
    if (!network || !view) return [];
    const drawn = view.path;
    return branch.leafPaths(scenario)
      .filter((p) => p.join("/") !== drawn.join("/"))
      .map((p) => {
        const v = branch.pathView(scenario, p);
        const shared = p.findIndex((id, i) => drawn[i] !== id);
        const shut = p.some((_, i) => !(branch.segmentAt(scenario, p.slice(0, i + 1)) as { open: boolean }).open);
        return { path: p, name: v.junctions[shared].outlets.find((o) => o.id === p[shared])!.name, scenario: v.scenario, result: pathResult(network.root, p), from: v.junctions[shared].joint, shut };
      });
  });
  /** The pressure split's rows on a branched lay (BudgetBar): every line, outlet order, the edited one marked. */
  const budgetLines = $derived.by(() => {
    if (!network || !view) return [];
    const edited = view.path.join("/");
    return branch.leafPaths(scenario).map((p) => {
      const key = p.join("/");
      if (key === edited) {
        return { key, name: lineName.split(" › ").at(-1) ?? "", color: leafColor(scenario, p) ?? "", result, openEnd: lineScenario.nozzle.design === "open-end", shut: false, edited: true };
      }
      const o = others.find((x) => x.path.join("/") === key)!;
      return { key, name: o.name, color: leafColor(scenario, p) ?? "", result: o.result, openEnd: o.scenario.nozzle.design === "open-end", shut: o.shut, edited: false };
    });
  });
  const budgetLine = $derived(budgetLines.find((l) => l.edited) ?? null);
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
  // Ajustes › Vista (UX.md §10.1): changes no number; remembered per browser.
  let showGauges = $state(true);
  let trueScale = $state(false);
  $effect(() => {
    try {
      showGauges = localStorage.getItem("view.gauges") !== "off";
      trueScale = localStorage.getItem("view.hose-scale") === "true";
    } catch {}
  });
  function setView(key: "gauges" | "scale", on: boolean) {
    if (key === "gauges") showGauges = on;
    else trueScale = on;
    try {
      localStorage.setItem(key === "gauges" ? "view.gauges" : "view.hose-scale", key === "gauges" ? (on ? "on" : "off") : String(on));
    } catch {}
  }
  let settingsOpen = $state(false);
  const comparing = $derived(compareId !== null && compareId !== scenario.methodId ? compareId : null);
  const referenceNetwork = $derived(comparing && network ? solveScenarioTree(scenario, comparing) : null);
  const reference = $derived(comparing ? referenceNetwork && view ? pathResult(referenceNetwork.root, view.path) : solveScenario(scenario, comparing) : null);
  /** The whole lay's power split (MODEL.md §3.8): on a single line, the Conceptos card's pump power instead. */
  const power = $derived(powerSplit(network?.root ?? result));
  const referencePower = $derived(referenceNetwork ? powerSplit(referenceNetwork.root) : null);
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
    if (scenarioMenu) scenarioMenu.open = false;
    if (id === presetId) return;
    presetId = id;
    loads += 1;
    scenario = base = presets.find((p) => p.id === id)!.scenario;
    selection = null;
    selectedPath = [];
    past = [];
    future = [];
  }

  // The header's "Escenario" menu (UX.md §4): the presets, a blank line,
  // reset; later copy and paste. A blank line and reset are undoable and
  // refit the canvas; a preset starts a fresh history.
  let scenarioMenu: HTMLDetailsElement | undefined = $state();
  /** Changed since the preset was loaded: what "Reiniciar" would undo. */
  const edited = $derived(scenario !== base);
  function newLine() {
    apply(edit.blankLine(scenario));
    selectedPath = [];
    loads += 1;
    deselect();
    if (scenarioMenu) scenarioMenu.open = false;
  }
  function resetPreset() {
    apply(base);
    selectedPath = [];
    loads += 1;
    deselect();
    if (scenarioMenu) scenarioMenu.open = false;
  }

  // Copy, paste and links (lib/share.ts, UX.md §4): only the scenario travels.
  let notice = $state("");
  /** A button in the notice, e.g. the tour offered to a first visit that came by a link. */
  let noticeAction = $state<{ label: string; run: () => void } | null>(null);
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  function say(text: string, action: typeof noticeAction = null) {
    notice = text;
    noticeAction = action;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => ((notice = ""), (noticeAction = null)), action ? 8000 : 3000);
  }
  /** A scenario from outside becomes what Reiniciar returns to; a paste is an undo step, a link opens fresh. */
  function loadShared(next: Scenario, undoable: boolean) {
    if (undoable) apply(next);
    else {
      scenario = next;
      past = [];
      future = [];
    }
    base = next;
    presetId = null;
    selectedPath = [];
    loads += 1;
    deselect();
  }
  /** Opens the lay a link names; false when the address names none. */
  async function openLink(undoable: boolean) {
    const fragment = location.hash;
    if (!fragment) return false;
    try {
      const next = await share.fromFragment(fragment);
      if (!next) return false;
      loadShared(next, undoable);
      // A first visit by a link is offered the tour rather than shown it over the lay it was sent (UX.md §8.4).
      say(`Abierto desde el enlace: ${next.name}`, tourSeen() ? null : { label: "¿Primera vez? Ver recorrido", run: startTour });
    } catch (error) {
      say(error instanceof share.ShareError ? error.message : "No se pudo abrir el enlace.");
    }
    // The address stops naming the lay once it is open: edits would make it stale.
    history.replaceState(history.state, "", location.pathname + location.search);
    return true;
  }
  // The welcome tour (UX.md §8.4): on a first visit, unless a link opened a lay.
  let touring = $state(false);
  function startTour() {
    if (scenarioMenu) scenarioMenu.open = false;
    notice = "";
    noticeAction = null;
    touring = true;
  }
  $effect(() => {
    untrack(async () => {
      if (!(await openLink(false)) && !tourSeen()) startTour();
    });
    const changed = () => openLink(true);
    addEventListener("hashchange", changed);
    return () => removeEventListener("hashchange", changed);
  });
  let textMode = $state<"copy" | "paste" | null>(null);
  let textCopy = $state("");
  let pasteError = $state("");
  async function copy(kind: "link" | "text") {
    if (scenarioMenu) scenarioMenu.open = false;
    const text = kind === "link" ? await share.linkOf(scenario, location.href) : share.toText(scenario);
    try {
      await navigator.clipboard.writeText(text);
      say(kind === "link" ? "Enlace copiado: quien lo abra ve este escenario" : "Escenario copiado como texto");
    } catch {
      textCopy = text;
      textMode = "copy";
    }
  }
  function paste() {
    if (scenarioMenu) scenarioMenu.open = false;
    pasteError = "";
    textMode = "paste";
  }
  async function openPasted(text: string) {
    try {
      const next = await share.fromText(text);
      textMode = null;
      loadShared(next, true);
      say(`Escenario pegado: ${next.name}`);
    } catch (error) {
      pasteError = error instanceof share.ShareError ? error.message : "No se pudo abrir.";
    }
  }
</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>
<svelte:window
  onkeydown={onKey}
  onpointerdown={(e) => scenarioMenu?.open && !scenarioMenu.contains(e.target as Node) && (scenarioMenu.open = false)}
  bind:innerHeight={windowHeight}
/>

{#snippet line()}
  <section class="line-tools" aria-label="Línea">
    <h2>Línea</h2>
    <label class="field">
      <span>Nombre</span>
      <input type="text" value={scenario.name} maxlength="80" oninput={(e) => apply(edit.setName(scenario, e.currentTarget.value), "name")} />
    </label>
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
  <div bind:this={budgetEl} data-tour="budget"><BudgetBar {result} {reference} referenceLabel={refName} openEnd={lineScenario.nozzle.design === "open-end"} line={budgetLine} lines={budgetLines} onPickLine={(key) => selectLine(key.split("/"))} /></div>
  {#if network}<PowerSplit split={power} flowGpm={network.totalFlowGpm} pumpPsi={pumpResult.nodes[0].pressurePsi} lines={budgetLines} reference={referencePower} referenceLabel={refName} />{/if}
  <details class="card">
    <summary>Ver cálculo ({result.terms.length} fórmulas) · {methodName}{comparing ? ` y ${refName}` : ""}</summary>
    <table>
      <thead><tr><th></th><th>{methodName}</th>{#if reference}<th>{refName} (comparación)</th>{/if}</tr></thead>
      <tbody>
        <tr><td>Caudal</td><td>{result.flowGpm.toFixed(1)} gpm</td>{#if reference}<td>{reference.flowGpm.toFixed(1)} gpm</td>{/if}</tr>
        <tr><td>Accesorios</td><td>{result.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null) ? "sin dato" : `${result.fittingLossPsi.toFixed(1)} psi`}</td>{#if reference}<td>{reference.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null) ? "sin dato" : `${reference.fittingLossPsi.toFixed(1)} psi`}</td>{/if}</tr>
        <tr><td>{lineScenario.nozzle.design === "open-end" ? "Presión en la punta" : "Presión en pitón"}</td><td>{result.nozzlePressurePsi.toFixed(1)} psi</td>{#if reference}<td>{reference.nozzlePressurePsi.toFixed(1)} psi</td>{/if}</tr>
        {#if !network && lineScenario.nozzle.design !== "open-end"}<tr><td>Presión requerida</td><td>{result.requiredPumpPressurePsi.toFixed(1)} psi</td>{#if reference}<td>{reference.requiredPumpPressurePsi.toFixed(1)} psi</td>{/if}</tr>{/if}
      </tbody>
    </table>
    <Breakdown terms={result.terms} methodId={scenario.methodId} scenario={lineScenario} />
  </details>
  {#if network}<TreeResults {scenario} {network} reference={referenceNetwork} referenceLabel={refName} />{/if}
  <Sources methodId={scenario.methodId} />
  <Concepts scenario={lineScenario} {result} power={network ? null : power} />
{/snippet}

{#snippet pumpPanel(mode: "strip" | "head" | "full" | "bar")}
  <PumpPanel {scenario} result={pumpResult} branched={!!network} balanced={network?.balanced ?? true} onchange={(s) => apply(s, "pump")} strip={mode === "strip"} head={mode === "head"} full={mode === "full"} onOpen={() => select({ kind: "pump" })} />
{/snippet}

{#snippet summary()}
  <div data-tour="budget"><BudgetBar {result} {reference} referenceLabel={refName} openEnd={lineScenario.nozzle.design === "open-end"} line={budgetLine} compact /></div>
{/snippet}

<div class="app" class:phone class:wide style:--sheet-closed={`${CLOSED_PX}px`}>
  <header class="top">
    <h1>Simulador hidráulico</h1>
    <div class="history">
      <button type="button" onclick={undo} disabled={past.length === 0} aria-label="Deshacer" title="Deshacer (Ctrl+Z)">↶<span class="word"> Deshacer</span></button>
      <button type="button" onclick={redo} disabled={future.length === 0} aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)">↷<span class="word"> Rehacer</span></button>
    </div>
    <details class="scenario" bind:this={scenarioMenu}>
      <summary data-tour="escenario" aria-label={`Escenario: ${scenario.name}`} title="Escenario: elegir otro, copiar, pegar, reiniciar"><span class="name">{scenario.name}</span><span class="caret" aria-hidden="true">▾</span></summary>
      <div class="scenario-menu">
        <span class="menu-title">Empezar desde</span>
        {#each presets as p (p.id)}
          <button type="button" class:on={p.id === presetId} aria-current={p.id === presetId} onclick={() => choosePreset(p.id)}>{p.scenario.name}</button>
        {/each}
        <button type="button" class="blank" onclick={newLine}>Línea en blanco</button>
        <hr />
        <button type="button" onclick={() => copy("link")}>Copiar enlace</button>
        <button type="button" onclick={() => copy("text")}>Copiar como texto</button>
        <button type="button" onclick={paste}>Pegar escenario…</button>
        <hr />
        <button type="button" disabled={!edited} title={edited ? undefined : "Sin cambios desde que se cargó"} onclick={resetPreset}>Reiniciar este escenario</button>
        {#if phone}
          <!-- A phone's header has no room for "?" (UX.md §8.4). -->
          <hr />
          <button type="button" onclick={startTour}>Ver recorrido</button>
        {/if}
      </div>
    </details>
    {#if !phone}<button type="button" class="gear" aria-label="Ver recorrido" title="Ver recorrido: cómo se usa" onclick={startTour}>?</button>{/if}
    <button type="button" class="gear" aria-label="Ajustes" title="Ajustes: método, altura de piso, accesorios, vista" onclick={() => (settingsOpen = true)}>⚙</button>
  </header>

  {#if !wide}
    <div class="pump" data-tour="pump">{@render pumpPanel(phone ? "strip" : "bar")}</div>
  {/if}

  <div class="canvas" data-tour="canvas">
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
      onEdit={(next, key) => applyLine(next, key)}
      onAction={runAction}
      {fitSignal}
      {others}
      editedPath={view?.path ?? []}
      editedName={view ? lineName.split(" › ").at(-1) : ""}
      linePaths={network ? branch.leafPaths(scenario) : []}
      outletFlows={Object.fromEntries(Object.entries(outlets).map(([key, o]) => [key, o.flowGpm]))}
      onGate={(path) => applyTree(branch.toggleGate(scenario, path))}
      onPick={(path, sel, open) => {
        selectedPath = path;
        select(sel, open);
      }}
      onPlace={place}
      {showGauges}
      {trueScale}
      onOtherNozzle={(path) => applyTree(branch.editSegment(scenario, path, (s) => ({ ...s, nozzle: { ...s.nozzle, open: !s.nozzle.open } })))}
    />
  </div>

  {#if !phone}
    <div class="side">
      {#if wide}<div class="head" data-tour="pump">{@render pumpPanel("head")}</div>{/if}
      {@render side()}
    </div>
    <div class="results">{@render results()}</div>
  {/if}
</div>

<ScenarioText mode={textMode} text={textMode === "copy" ? textCopy : ""} error={pasteError} onOpen={openPasted} onClose={() => (textMode = null)} />
{#if notice}
  <div class="notice" role="status">
    {notice}
    {#if noticeAction}<button type="button" onclick={noticeAction.run}>{noticeAction.label}</button>{/if}
  </div>
{/if}
<Tour running={touring} {phone} {scenario} {selection} onFit={() => (fitSignal += 1)} onDeselect={deselect} onEnd={() => (touring = false)} />

<Settings
  open={settingsOpen}
  onClose={() => (settingsOpen = false)}
  {scenario}
  onScenario={(next, key) => apply(next, key)}
  compareId={comparing}
  onCompare={chooseCompare}
  {showGauges}
  {trueScale}
  onView={setView}
/>

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
  <div class="dock" data-tour="budget"><BudgetBar {result} {reference} referenceLabel={refName} openEnd={lineScenario.nozzle.design === "open-end"} line={budgetLine} compact /></div>
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
  .notice { position: fixed; left: 50%; top: 64px; transform: translateX(-50%); z-index: 60; max-width: calc(100vw - 32px); padding: 10px 14px; border-radius: 10px; background: var(--ink); color: var(--surface); font-size: 14px; font-weight: 600; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); }
  .notice { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; width: max-content; }
  .notice button { min-height: 44px; padding: 0 12px; border-radius: 8px; border: 0; background: var(--accent); color: #fff; font: inherit; cursor: pointer; }
  .gear { width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-size: 20px; cursor: pointer; color: var(--ink); }
  .scenario { position: relative; min-width: 0; max-width: 420px; }
  .scenario summary { list-style: none; display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; font-weight: 600; font-size: 14px; }
  .scenario summary::-webkit-details-marker { display: none; }
  .scenario .name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .scenario .caret { margin-left: auto; color: var(--muted); }
  .scenario-menu { position: absolute; right: 0; top: 50px; z-index: 30; width: max-content; min-width: 100%; max-width: min(420px, calc(100vw - 16px)); display: grid; padding: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
  .scenario-menu .menu-title { padding: 6px 12px 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
  .scenario-menu button { min-height: 44px; padding: 0 12px 0 30px; text-align: left; border: 0; border-radius: 6px; background: transparent; color: var(--ink); font-size: 14px; cursor: pointer; position: relative; }
  .scenario-menu button:hover:not(:disabled) { background: var(--accent-soft); }
  .scenario-menu button:disabled { opacity: 0.45; cursor: default; }
  .scenario-menu button.on { font-weight: 700; }
  .scenario-menu button.on::before { content: "✓"; position: absolute; left: 10px; color: var(--accent); }
  .scenario-menu button.blank { color: var(--accent); font-weight: 600; }
  .scenario-menu hr { width: 100%; margin: 4px 0; border: 0; border-top: 1px solid var(--line); }
  .pump { grid-area: pump; display: grid; gap: var(--gap); align-content: start; }
  .line-tools { display: grid; gap: 8px; background: var(--surface); border-radius: var(--radius); padding: 12px 14px; }
  .field { display: grid; gap: 6px; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .field input { height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); padding: 0 10px; font-size: 15px; color: var(--ink); text-transform: none; letter-spacing: 0; }
  .line-tools h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
  .canvas { grid-area: canvas; min-width: 0; }
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
  .app.phone .scenario { flex: 1; }
  .app.phone .scenario-menu { left: 0; right: auto; }
  .app.phone .gear { order: 3; flex: none; }
  .app.phone .canvas { min-height: 0; }
</style>
