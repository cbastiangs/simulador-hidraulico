<script module lang="ts">
  import type { AppDocument } from "$lib/document.ts";

  type ScenarioContext = {
    base: AppDocument;
    presetId: string | null;
    practiceEpoch: number;
    revealedPracticeKey: string | null;
    dischargeBaseline: { key: string; values: number[] } | null;
  };
  type HistoryEntry = { document: AppDocument; context?: ScenarioContext };

  // Keep the editing session in memory while the user consults the reference page.
  let workspaceReturn: ScenarioContext & {
    document: AppDocument;
    past: HistoryEntry[];
    future: HistoryEntry[];
    autoSaveEnabled: boolean;
  } | undefined;
</script>

<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { u } from "$lib/display-units.svelte.ts";
  import { poolRangeMessage, hydrantLimitMessage, enduranceLabel } from "$lib/readings.ts";
  import { pathResult, solveScenario, solveScenarioTree, type Scenario, type TreeSegmentResult } from "$hydraulics/scenario.ts";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import BudgetBar from "$lib/components/BudgetBar.svelte";
  import PowerSplit from "$lib/components/PowerSplit.svelte";
  import { powerSplit } from "$hydraulics/power.ts";
  import { tick, untrack } from "svelte";
  import EmptyPumpCanvas from "$lib/components/EmptyPumpCanvas.svelte";
  import Canvas from "$lib/components/Canvas.svelte";
  import Concepts from "$lib/components/Concepts.svelte";
  import Inspector from "$lib/components/Inspector.svelte";
  import PumpCurvePanel from "$lib/components/PumpCurvePanel.svelte";
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
  import DischargesPanel from "$lib/components/DischargesPanel.svelte";
  import TruckPanel from "$lib/components/TruckPanel.svelte";
  import SupplyPanel from "$lib/components/SupplyPanel.svelte";
  import TankPanel from "$lib/components/TankPanel.svelte";
  import ScenarioPicker from "$lib/components/ScenarioPicker.svelte";
  import SavedLays from "$lib/components/SavedLays.svelte";
  import Offline from "$lib/components/Offline.svelte";
  import Novedades from "$lib/components/Novedades.svelte";
  import { markSeen, unreadOnOpen, type Release } from "$lib/novedades.ts";
  import { drainTank, tankMinutes } from "$hydraulics/tank.ts";
  import { workingLay, saveWorking, downloadScenario } from "$lib/library.ts";
  import { LESSONS } from "$lib/lessons.ts";
  import { parseDocument, wrapScenario, withScenario, type Exercise } from "$lib/document.ts";
  import { exerciseReadings } from "$lib/fire-flow.ts";
  import DischargeComparison from "$lib/components/DischargeComparison.svelte";
  import PracticeSummary from "$lib/components/PracticeSummary.svelte";
  import FireFlowPractice from "$lib/components/FireFlowPractice.svelte";
  import { feetToMeters } from "$hydraulics/units.ts";
  import * as pieces from "$lib/pieces.ts";

  // Built to docs/design/main-screen.html (UX.md §6).
  // Presets are parsed like any outside document: the same gate as a share link.
  // The first lay a visitor sees and the welcome tour runs on (UX.md §8.4).
  const DEFAULT_PRESET = "alcance-turbojet";
  const files = import.meta.glob(["/data/presets/*.json", "/data/exercises/*.json"], { eager: true, import: "default" });
  const presets = Object.entries(files)
    .map(([path, doc]) => ({ id: path.split("/").pop()!.replace(".json", ""), scenario: parseDocument(doc) }))
    .sort((a, b) => (a.id === DEFAULT_PRESET ? -1 : b.id === DEFAULT_PRESET ? 1 : a.id.localeCompare(b.id)));

  const examples = presets.filter(preset => !preset.scenario.exercise);
  const practiceOrder = ["practica-diametro", "practica-piton", "practica-descargas", "practica-descargas-reserva", "practica-nfa"];
  const rank = (id: string) => practiceOrder.includes(id) ? practiceOrder.indexOf(id) : practiceOrder.length;
  const practices = presets.filter(preset => preset.scenario.exercise).sort((a, b) => rank(a.id) - rank(b.id));
  let picker: ScenarioPicker;

  /** The preset loaded last; null when the scenario came from a link or a paste. */
  let presetId = $state<string | null>(presets[0].id);
  /** What "Reiniciar este escenario" returns to: the preset, link or paste loaded last. */
  let base: AppDocument = $state.raw(presets[0].scenario);
  // Counts loads, so reloading the same preset also refits the canvas.
  let loads = $state(0);
  // Replaced whole by each edit (lib/edit.ts), never mutated in place.
  let activeDocument: AppDocument = $state.raw(presets[0].scenario);
  const scenario = $derived(activeDocument.scenario);
  let practiceOpen = $state(false);
  let practiceHeaderHeight = $state(0);
  let pressureDockHeight = $state(70);
  let practiceEpoch = $state(0);
  let revealedPracticeKey = $state<string | null>(null);
  const practiceKey = $derived(JSON.stringify([practiceEpoch, activeDocument.exercise?.lengthM, activeDocument.exercise?.widthM, activeDocument.exercise?.involvedFraction]));
  const practiceRevealed = $derived(!!activeDocument.exercise && revealedPracticeKey === practiceKey);
  function revealPractice(value: boolean) { revealedPracticeKey = value ? practiceKey : null; }
  function openPractice() { practiceOpen = true; if (scenarioMenu) scenarioMenu.open = false; }
  function changeExercise(exercise: Exercise | undefined, key = "") {
    applyDocument({ ...activeDocument, exercise }, key);
  }
  function addExercise() {
    changeExercise({ lengthM: feetToMeters(40), widthM: feetToMeters(30), involvedFraction: 0.25, assignments: [] });
  }
  // Nothing is selected until the user taps something (UX.md §2 "Selecting").
  let selection: Selection | null = $state(null);
  /** A branched lay's drawn line: one branch id per wye, from the pump to a nozzle (UX.md §2). */
  let selectedPath: string[] = $state([]);

  // Phones and tablets (UX.md §10.9): the page does not scroll; a bottom sheet holds the
  // inspector and results, and opens at peek when something is selected.
  // Read from media queries, not innerWidth: a phone can report its 980 px
  // layout width when the page starts and send no resize once it settles.
  let phone = $state(false);
  let landscape = $state(false);
  let viewportHeight = $state(800);
  let keyboardBottom = $state(0);
  // Desktop (UX.md §4): one panel on the right, the pump header atop it.
  let wide = $state(false);
  $effect(() => {
    const queries = [matchMedia("(max-width: 1023.98px)"), matchMedia("(min-width: 1024px)")];
    const compactLandscape = matchMedia("(min-width: 640px) and (max-width: 1023.98px) and (max-height: 600px) and (orientation: landscape)");
    const sync = () => { [phone, wide] = queries.map((q) => q.matches); landscape = compactLandscape.matches; };
    queries.push(compactLandscape);
    sync();
    queries.forEach((q) => q.addEventListener("change", sync));
    return () => queries.forEach((q) => q.removeEventListener("change", sync));
  });
  $effect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    const sync = () => {
      const usable = viewport && Math.abs(viewport.scale - 1) < 0.05;
      viewportHeight = usable ? viewport.height : window.innerHeight;
      keyboardBottom = usable ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && focused.matches('input, textarea, select') &&
            (keyboardBottom > 100 || viewportHeight < 500)) focused.scrollIntoView({ block: 'center', inline: 'nearest' });
      });
    };
    sync();
    viewport?.addEventListener('resize', sync);
    viewport?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    document.addEventListener('focusin', sync);
    return () => { cancelAnimationFrame(frame); viewport?.removeEventListener('resize', sync); viewport?.removeEventListener('scroll', sync); window.removeEventListener('resize', sync); document.removeEventListener('focusin', sync); };
  });
  let sheet = $state<SheetState>("closed");
  let windowHeight = $state(800);
  let closedSheetHeight = $state(CLOSED_PX);
  /** Viewport edge available to the drawing above the peek or closed sheet. */
  const shortPortrait = $derived(phone && !landscape && viewportHeight < 650);
  const canvasBottom = $derived(landscape ? Infinity : windowHeight - keyboardBottom - (sheet === "peek" ? sheetHeights(viewportHeight).peek : closedSheetHeight));
  let desktopPanel: HTMLDivElement | undefined = $state();
  let landscapePanel: HTMLDivElement | undefined = $state();

  function select(s: Selection, open = true) {
    if (JSON.stringify(s) !== JSON.stringify(selection)) {
      (landscapePanel ?? desktopPanel)?.scrollTo({ top: 0 });
    }
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
    if ((scenario.wye || scenario.discharges) && action.id === "pump.apply-required") return;
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
  let past: HistoryEntry[] = $state.raw([]);
  let future: HistoryEntry[] = $state.raw([]);
  let burst = { key: "", at: 0 };

  function apply(next: Scenario, key = "") {
    if (next === scenario) return;
    const updated = withScenario(activeDocument, next);
    const removed = (activeDocument.exercise?.assignments.length ?? 0) - (updated.exercise?.assignments.length ?? 0);
    applyDocument(updated, key);
    if (removed > 0) say("Práctica NFA: cambió un pitón asignado. Revisa las líneas que participan.");
  }
  function applyDocument(next: AppDocument, key = "") {
    if (next === activeDocument) return;
    const oldTank = scenario.source.tank;
    advanceClock();
    if (oldTank && next.scenario.source.tank === oldTank) next = { ...next, scenario: { ...next.scenario, source: { ...next.scenario.source, tank: scenario.source.tank } } };
    const now = performance.now();
    const sameBurst = key !== "" && key === burst.key && now - burst.at < BURST_MS;
    if (!sameBurst) rememberEdit();
    burst = { key, at: now };
    future = [];
    activeDocument = next;
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
    if (landscapePanel) landscapePanel.scrollTop = 0;
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

  function currentEntry(withContext = false): HistoryEntry {
    const context = withContext ? { base, presetId, practiceEpoch, revealedPracticeKey, dischargeBaseline: $state.snapshot(dischargeBaseline) } : undefined;
    return { document: activeDocument, context };
  }

  function rememberEdit(withContext = false) {
    past = [...past.slice(-(HISTORY_MAX - 1)), currentEntry(withContext)];
  }

  function restoreEntry(entry: HistoryEntry) {
    activeDocument = entry.document;
    burst = { key: "", at: 0 };
    if (entry.context) {
      ({ base, presetId, practiceEpoch, revealedPracticeKey, dischargeBaseline } = entry.context);
      loads += 1;
      selectedPath = [];
      practiceOpen = false;
      deselect();
    } else keepSelection();
  }

  function undo() {
    pauseClock();
    const entry = past.at(-1);
    if (!entry) return;
    future = [currentEntry(!!entry.context), ...future];
    past = past.slice(0, -1);
    restoreEntry(entry);
  }

  function redo() {
    pauseClock();
    const entry = future[0];
    if (!entry) return;
    rememberEdit(!!entry.context);
    future = future.slice(1);
    restoreEntry(entry);
  }

  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable]") || document.querySelector("dialog[open]")) return;
    // Esc clears the selection, unless it is closing a menu.
    if (event.key === "Escape") {
      const openMenu = [scenarioMenu, helpMenu].find(menu => menu?.open);
      if (openMenu) {
        closeMenu(openMenu);
        return;
      }
    }
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
  const network = $derived((scenario.wye || scenario.discharges) ? solveScenarioTree(scenario) : null);
  const view = $derived((scenario.wye || scenario.discharges) ? branch.pathView(scenario, selectedPath) : null);
  const lineScenario = $derived(view?.scenario ?? scenario);
  const result = $derived(network && view ? pathResult(network.root, view.path) : solveScenario(scenario));
  const practiceReadings = $derived(exerciseReadings(activeDocument, result, network));
  const diameterPractice = $derived(activeDocument.exercise?.lessonId === "diameter" &&
    !network && scenario.sections.length === 1 && !!practiceReadings?.lines[0]?.assigned);
  async function inspectPracticeHose() {
    practiceOpen = false;
    select({ kind: "section", index: 0 });
    await tick();
    document.getElementById("section-hose-size")?.focus();
  }
  const pumpResult = $derived(network?.root.result ?? result);
  let dischargeBaseline = $state<{ key: string; values: number[] } | null>(null);
  const dischargeValues = $derived.by(() => {
    const valid = network?.balanced && pumpResult.pump?.status !== 'empty';
    return [valid ? network?.root.branches[0]?.flowGpm ?? null : null,
      valid ? pumpResult.flowGpm : null,
      valid ? pumpResult.pump?.pressurePsi ?? pumpResult.nodes[0]?.pressurePsi ?? null : null];
  });
  const dischargeKey = $derived(JSON.stringify([practiceKey, scenario.source]));
  const baselineValues = $derived(dischargeBaseline?.key === dischargeKey ? dischargeBaseline.values : null);
  $effect(() => { if (!practiceRevealed) dischargeBaseline = null; });
  function chooseDischargeCase(reserve: boolean) {
    pauseClock();
    const preset = presets.find(p => p.id === (reserve ? 'practica-descargas-reserva' : 'practica-descargas'))!;
    applyDocument(structuredClone(preset.scenario));
    dischargeBaseline = null;
    selection = null;
    selectedPath = [];
  }
  function captureDischargeBaseline() {
    if (dischargeValues.every(v => v !== null)) dischargeBaseline = { key: dischargeKey, values: dischargeValues as number[] };
  }

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
  // Novedades (UX.md §8.6): once after an update, or from the Escenario menu.
  let novedadesOpen = $state(false);
  let unread = $state<Release[]>([]);
  function openNovedades() { closeMenu(helpMenu); unread = []; novedadesOpen = true; }
  function closeNovedades() { novedadesOpen = false; unread = []; markSeen(); }
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
    const preset = presets.find(p => p.id === id)!;
    loadShared(preset.scenario, true);
    presetId = id;
  }

  let scenarioMenu: HTMLDetailsElement | undefined = $state();
  let helpMenu: HTMLDetailsElement | undefined = $state();
  function closeMenu(menu: HTMLDetailsElement | undefined) {
    if (!menu?.open) return;
    menu.open = false;
    menu.querySelector("summary")?.focus();
  }
  function openPicker(group: "examples" | "practices") {
    closeMenu(scenarioMenu);
    picker.show(group);
  }
  function closeOutsideMenus(event: PointerEvent) {
    for (const menu of [scenarioMenu, helpMenu]) {
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
    }
  }
  /** Changed since the preset was loaded: what "Reiniciar" would undo. */
  const edited = $derived(activeDocument !== base);
  function newLine() {
    practiceEpoch += 1;
    pauseClock();
    applyDocument(wrapScenario(edit.blankLine(scenario)));
    selectedPath = [];
    loads += 1;
    deselect();
    if (scenarioMenu) scenarioMenu.open = false;
  }
  function resetPreset() {
    practiceEpoch += 1;
    pauseClock();
    applyDocument(base);
    selectedPath = [];
    loads += 1;
    deselect();
    if (scenarioMenu) scenarioMenu.open = false;
  }

  // Copy, paste and links: the document travels; guesses and view settings stay local.
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
  function loadShared(next: AppDocument, undoable: boolean) {
    pauseClock();
    if (undoable) rememberEdit(true);
    else past = [];
    future = [];
    activeDocument = next;
    practiceEpoch += 1;
    revealedPracticeKey = null;
    dischargeBaseline = null;
    base = next;
    burst = { key: "", at: 0 };
    practiceOpen = !!next.exercise;
    presetId = null;
    selectedPath = [];
    loads += 1;
    deselect();
  }
  /** Opens the lay a link names; false when the address names none. */
  async function openLink(undoable: boolean) {
    const fragment = location.hash;
    if (!fragment) return false;
    let opened = false;
    try {
      const next = await share.fromFragment(fragment);
      if (!next) return false;
      loadShared(next, undoable);
      opened = true;
      // A first visit by a link is offered the tour rather than shown it over the lay it was sent (UX.md §8.4).
      say(`Abierto desde el enlace: ${next.scenario.name}`, tourSeen() ? null : { label: "¿Primera vez? Ver recorrido", run: startTour });
    } catch (error) {
      say(error instanceof share.ShareError ? error.message : "No se pudo abrir el enlace.");
    }
    // The address stops naming the lay once it is open: edits would make it stale.
    history.replaceState(history.state, "", location.pathname + location.search);
    return opened;
  }
  // The welcome tour (UX.md §8.4): on a first visit, unless a link opened a lay.
  let touring = $state(false);
  function startTour() {
    if (scenarioMenu) scenarioMenu.open = false;
    closeMenu(helpMenu);
    notice = "";
    noticeAction = null;
    touring = true;
  }
  $effect(() => {
    untrack(async () => {
      const linked = await openLink(false);
      const returning = workspaceReturn;
      workspaceReturn = undefined;
      if (!linked && returning) {
        activeDocument = returning.document;
        base = returning.base;
        presetId = returning.presetId;
        past = returning.past;
        future = returning.future;
        practiceEpoch = returning.practiceEpoch;
        revealedPracticeKey = returning.revealedPracticeKey;
        dischargeBaseline = returning.dischargeBaseline;
        autoSaveEnabled = returning.autoSaveEnabled;
        storageReady = true;
        return;
      }
      let restored = false;
      if (!linked) {
        try { const saved = workingLay(); if (saved) { loadShared(saved, false); restored = true; } }
        catch { autoSaveEnabled = false; saveStatus = "No se pudo recuperar la última tendida. No se sobrescribirá: guarda una copia en Mis líneas o exporta tu trabajo."; }
      }
      storageReady = true;
      // A first visit gets the tour (or its offer), never the history of changes.
      unread = unreadOnOpen(!tourSeen());
      if (!linked && !restored && !tourSeen()) startTour();
      else if (unread.length > 0) novedadesOpen = true;
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
    const text = kind === "link" ? await share.linkOf(activeDocument, location.href) : share.toText(activeDocument);
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
      say(`Escenario pegado: ${next.scenario.name}`);
    } catch (error) {
      pasteError = error instanceof share.ShareError ? error.message : "No se pudo abrir.";
    }
  }
  let pumpTab = $state<"truck" | "discharges" | "tank" | "curve">("discharges");
  let libraryOpen = $state(false);
  let fileInput: HTMLInputElement | undefined;
  let storageReady = $state(false);
  let saveStatus = $state("Recuperando la última tendida…");
  let lastSavedAt = 0;
  let autoSaveEnabled = true;
  $effect(() => {
    if (!storageReady) return;
    const current = activeDocument;
    const timer = setTimeout(() => persist(current), Math.max(100, 1000 - (Date.now() - lastSavedAt)));
    return () => clearTimeout(timer);
  });
  function persist(current = activeDocument) {
    if (!storageReady || !autoSaveEnabled) return;
    try { saveWorking(current); lastSavedAt = Date.now(); saveStatus = "Última tendida guardada automáticamente en este navegador"; }
    catch { saveStatus = "No se pudo guardar automáticamente. Exporta un archivo para conservar tu trabajo."; }
  }
  beforeNavigate(({ to }) => {
    if ((to?.route.id !== "/acerca-de" && to?.route.id !== "/piscina" && to?.route.id !== "/hidrante") || !storageReady) return;
    pauseClock();
    persist();
    workspaceReturn = {
      document: activeDocument, base, presetId, past, future, practiceEpoch, revealedPracticeKey,
      dischargeBaseline: $state.snapshot(dischargeBaseline),
      autoSaveEnabled,
    };
  });
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("El archivo supera 1 MB.");
      const next = parseDocument(JSON.parse(await file.text()));
      loadShared(next, true); say(`Archivo abierto: ${next.scenario.name}`);
    } catch { say("No se pudo abrir: el archivo debe contener un escenario JSON válido de hasta 1 MB."); }
    if (fileInput) fileInput.value = "";
  }

  let clockRunning = $state(false);
  let lastTick = 0;
  const totalFlow = $derived(pumpResult.pump?.status === "empty" ? 0 :
    (pumpResult.pump?.pressurePsi === null || (network ? !network.balanced : pumpResult.issues.length > 0)) ? null : pumpResult.flowGpm);
  const endurance = $derived(scenario.source.tank ? tankMinutes(scenario.source.tank, totalFlow) : null);
  function advanceClock() {
    if (!clockRunning) return;
    const now = performance.now();
    const tank = scenario.source.tank;
    if (scenario.source.hydrant || scenario.source.pool || !tank || totalFlow === null) { clockRunning = false; return; }
    const next = drainTank(tank, totalFlow, (now - lastTick) / 1000);
    lastTick = now;
    activeDocument = { ...activeDocument, scenario: { ...scenario, source: { ...scenario.source, tank: next } } };
    if (next.remainingGal === 0) clockRunning = false;
  }
  function pauseClock() { advanceClock(); clockRunning = false; }
  function toggleClock() {
    if (clockRunning) return pauseClock();
    if (scenario.source.hydrant || scenario.source.pool || !scenario.source.tank?.remainingGal || totalFlow === null || totalFlow <= 0) return;
    rememberEdit(); future = [];
    lastTick = performance.now(); clockRunning = true;
  }
  function changeTank(next: Scenario) { pauseClock(); apply(next); }
  $effect(() => {
    const timer = setInterval(advanceClock, 500);
    const hidden = () => { if (document.hidden) { pauseClock(); persist(); } };
    const leaving = () => { pauseClock(); persist(); };
    document.addEventListener("visibilitychange", hidden);
    addEventListener("pagehide", leaving);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", hidden); removeEventListener("pagehide", leaving); };
  });
  const lesson = $derived(presetId ? LESSONS[presetId] : undefined);

</script>

<svelte:head><title>Simulador hidráulico</title></svelte:head>
<svelte:window
  onkeydown={onKey}
  onpointerdown={closeOutsideMenus}
  bind:innerHeight={windowHeight}
/>

{#snippet line()}
  <section class="line-tools" aria-label="Línea">
    <button type="button" class="practice-entry" onclick={openPractice}>{activeDocument.exercise ? "Continuar práctica NFA" : "Práctica NFA · área y caudal"}</button>
    {#if lesson}<aside class="lesson"><strong>{lesson.question}</strong><p>{lesson.action}</p></aside>{/if}
    <h2>Línea</h2>
    <label class="field">
      <span>Nombre</span>
      <input type="text" value={scenario.name} maxlength="80" oninput={(e) => apply(edit.setName(scenario, e.currentTarget.value), "name")} />
    </label>
  </section>
{/snippet}

{#snippet side()}
  {#if selection === null}{@render line()}{/if}
  {#if selection?.kind === "pump"}
    {#if scenario.apparatusName}<p class="truck-name">Camión aplicado: <strong>{scenario.apparatusName}</strong></p>{/if}
    <nav class="pump-tabs" aria-label="Panel de bomba">
      <button type="button" aria-pressed={pumpTab === "truck"} onclick={() => pumpTab = "truck"}>Camión</button>
      <button type="button" aria-pressed={pumpTab === "discharges"} onclick={() => pumpTab = "discharges"}>Descargas</button>
      <button type="button" aria-pressed={pumpTab === "tank"} onclick={() => pumpTab = "tank"}>Abastecimiento</button>
      <button type="button" aria-pressed={pumpTab === "curve"} onclick={() => pumpTab = "curve"}>Curva y control</button>
    </nav>
    {#if pumpTab === "truck"}
      <TruckPanel {scenario} onchange={next => { pauseClock(); applyTree(next); }} />
    {:else if pumpTab === "discharges"}
      <DischargesPanel {scenario} {network} onchange={applyTree} onConfigure={() => pumpTab = "truck"} onLine={path => { selectLine(path); select({ kind: "section", index: 0 }); }} />
    {:else if pumpTab === "tank"}
      <SupplyPanel {scenario} operation={pumpResult.pump} onchange={next => { pauseClock(); applyTree(next); }} />
      {#if !scenario.source.hydrant && !scenario.source.pool}<TankPanel {scenario} flowGpm={totalFlow} running={clockRunning} onchange={changeTank} onToggle={toggleClock} />{/if}
    {:else}
      <PumpCurvePanel {scenario} operation={pumpResult.pump} onchange={applyTree} />
    {/if}
  {/if}
  {#if lineScenario.sections.length && (selection?.kind !== "pump" || pumpTab === "discharges")}
  <Inspector
    scenario={lineScenario}
    {selection}
    floorM={edit.floorOf(scenario)}
    onClose={deselect}
    onchange={(s) => applyLine(s, `inspector:${JSON.stringify(selection)}`)}
    onSelect={select}
    requiredPsi={result.requiredPumpPressurePsi}
    diameterReferenceGpm={diameterPractice && practiceRevealed ? practiceReadings?.reference.requiredFlowGpm : undefined}
    {result}
    branched={!!network}
    onAction={runAction}
    tree={network ? scenario : undefined}
    {outlets}
    onTree={applyTree}
    onLine={selectLine}
  />
  {/if}
{/snippet}

{#snippet results()}
  {#if pumpResult.pump?.pressurePsi === null}
    <p class="card" role="status">{#if pumpResult.pump.status === "empty"}Tanque vacío: sin entrega. Rellena el tanque en Abastecimiento; la presión aguas abajo es desconocida.{:else if pumpResult.pump.poolLimit}{poolRangeMessage()}{:else if pumpResult.pump.hydrantLimit}{hydrantLimitMessage(pumpResult.pump.hydrantLimit)} Sin punto de operación calculado.{:else}No hay un punto de operación disponible. Revisa la curva de la bomba y la tendida. {#if scenario.source.hydrant}El hidrante requiere admisión positiva o nula, caudal dentro de su ensayo y descarga igual o mayor que la admisión.{/if}{/if}</p>
  {:else if !lineScenario.sections.length && network}
    <TreeResults {scenario} {network} reference={referenceNetwork} referenceLabel={refName} />
  {:else}
  <div bind:this={budgetEl} data-tour="budget"><BudgetBar {result} {reference} referenceLabel={refName} openEnd={lineScenario.nozzle.design === "open-end"} line={budgetLine} lines={budgetLines} onPickLine={(key) => selectLine(key.split("/"))} /></div>
  {#if network}<PowerSplit split={power} flowGpm={network.totalFlowGpm} pumpPsi={pumpResult.pump?.pressurePsi ?? scenario.source.pressurePsi} lines={budgetLines} reference={referencePower} referenceLabel={refName} />{/if}
  <details class="card">
    <summary>Ver cálculo ({result.terms.length} fórmulas) · {methodName}{comparing ? ` y ${refName}` : ""}</summary>
    <table>
      <thead><tr><th></th><th>{methodName}</th>{#if reference}<th>{refName} (comparación)</th>{/if}</tr></thead>
      <tbody>
        <tr><td>Caudal</td><td>{u.q(result.flowGpm)} {u.flow}</td>{#if reference}<td>{u.q(reference.flowGpm)} {u.flow}</td>{/if}</tr>
        <tr><td>Accesorios</td><td>{result.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null) ? "sin dato" : `${u.p(result.fittingLossPsi)} ${u.pressure}`}</td>{#if reference}<td>{reference.terms.some((t) => t.lawId === "appliance.fixed" && t.inputs.lossPsi === null) ? "sin dato" : `${u.p(reference.fittingLossPsi)} ${u.pressure}`}</td>{/if}</tr>
        <tr><td>{lineScenario.nozzle.design === "open-end" ? "Presión en la punta" : "Presión en pitón"}</td><td>{u.p(result.nozzlePressurePsi)} {u.pressure}</td>{#if reference}<td>{u.p(reference.nozzlePressurePsi)} {u.pressure}</td>{/if}</tr>
        {#if !network && lineScenario.nozzle.design !== "open-end"}<tr><td>Presión requerida</td><td>{u.p(result.requiredPumpPressurePsi)} {u.pressure}</td>{#if reference}<td>{u.p(reference.requiredPumpPressurePsi)} {u.pressure}</td>{/if}</tr>{/if}
      </tbody>
    </table>
    <Breakdown terms={result.terms} methodId={scenario.methodId} scenario={lineScenario} />
  </details>
  {#if network}<TreeResults {scenario} {network} reference={referenceNetwork} referenceLabel={refName} />{/if}
  <Sources methodId={scenario.methodId} />
  <Concepts scenario={lineScenario} {result} power={network ? null : power} />
  {/if}
{/snippet}

{#snippet pumpPanel(mode: "strip" | "head" | "full" | "bar")}
  <PumpPanel {scenario} result={pumpResult} branched={!!network} balanced={network?.balanced ?? pumpResult.issues.length === 0} onchange={(s) => apply(s, "pump")} strip={mode === "strip"} head={mode === "head"} full={mode === "full"} onOpen={() => select({ kind: "pump" })} />
  {#if (scenario.source.hydrant || scenario.source.pool) && mode !== "full"}
    {@const op = pumpResult.pump}
    <button class="supply-readings" type="button" title="Abrir abastecimiento" onclick={() => { pumpTab = "tank"; select({ kind: "pump" }); }}>
      {#each [...(scenario.source.hydrant ? [["Hidrante", op?.hydrantPsi]] : [["Piscina", 0]]), ["Admisión", op?.intakePsi], ["Aporte bomba", op?.addedPsi], ["Descarga", op?.pressurePsi]] as [label, value]}
        <span>{label}<b>{u.p(value as number | null | undefined)} <small>{u.pressure}</small></b></span>
      {/each}
      {#if op?.poolLimit}<em>{poolRangeMessage()}</em>{:else if op?.hydrantLimit}<em>{hydrantLimitMessage(op.hydrantLimit)}</em>
      {:else if op?.status === "stopped"}<em>Bomba detenida · descarga aislada</em>{/if}
    </button>
  {:else if scenario.source.tank && !scenario.source.hydrant && mode !== "full"}
    <div class="tank-strip"><button type="button" onclick={() => { pumpTab = "tank"; select({ kind: "pump" }); }}>Tanque · {scenario.source.tank.remainingGal.toFixed(0)} gal · {scenario.source.tank.remainingGal === 0 ? "vacío" : totalFlow === null ? "autonomía —" : totalFlow === 0 ? "sin consumo" : enduranceLabel(endurance!)}</button>
      {#if clockRunning}<button type="button" onclick={pauseClock}>Pausar</button>{/if}</div>
  {/if}
{/snippet}

{#snippet summary()}
  {#if !lineScenario.sections.length && network}
    <div class="empty-summary"><strong>Bomba · {u.q(totalFlow, 0)} {u.flow}</strong><span>{u.p(pumpResult.nodes[0]?.pressurePsi, 0)} {u.pressure} · salidas sin manguera</span></div>
  {:else}
  <div data-tour="budget"><BudgetBar {result} {reference} referenceLabel={refName} openEnd={lineScenario.nozzle.design === "open-end"} line={budgetLine} compact /></div>
  {/if}
{/snippet}

<div class="app" class:phone class:wide class:landscape class:short-portrait={shortPortrait} class:has-practice={!!activeDocument.exercise} style:--dock-space={`${Math.max(90, pressureDockHeight + 12)}px`} style:--sheet-closed={`${closedSheetHeight}px`} style:--viewport-height={`${viewportHeight}px`}>
  <header class="top">
    <h1>Simulador hidráulico</h1>
    <div class="history">
      <button type="button" onclick={undo} disabled={past.length === 0} aria-label="Deshacer" title="Deshacer (Ctrl+Z)">↶<span class="word">Deshacer</span></button>
      <button type="button" onclick={redo} disabled={future.length === 0} aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)">↷<span class="word">Rehacer</span></button>
    </div>
    <details class="scenario" bind:this={scenarioMenu}>
      <summary data-tour="escenario" aria-label={`Escenario: ${scenario.name}`} title={scenario.name} onclick={() => { if (helpMenu) helpMenu.open = false; }}>
        <span class="scenario-title"><span class="scenario-label">Escenario</span><span class="name">{scenario.name}</span></span>
        <span class="caret" aria-hidden="true">▾</span>
      </summary>
      <div class="scenario-menu">
        <button type="button" onclick={() => openPicker("examples")}>Tendidas de ejemplo…</button>
        <button type="button" onclick={() => openPicker("practices")}>Prácticas guiadas…</button>
        <button type="button" onclick={newLine}>Línea en blanco</button>
        <hr />
        <button type="button" onclick={() => { closeMenu(scenarioMenu); libraryOpen = true; }}>Mis líneas…</button>
        <button type="button" onclick={() => copy("link")}>Copiar enlace</button>
        <details class="more-file">
          <summary>Archivos, texto y reinicio</summary>
          <button type="button" onclick={() => copy("text")}>Copiar como texto</button>
          <button type="button" onclick={paste}>Pegar escenario…</button>
          <button type="button" onclick={() => downloadScenario(activeDocument)}>Exportar archivo (.json)</button>
          <button type="button" onclick={() => { closeMenu(scenarioMenu); fileInput?.click(); }}>Importar archivo…</button>
          <button type="button" disabled={!edited} onclick={resetPreset}>Reiniciar este escenario</button>
        </details>
        <p class="save-status">{saveStatus}</p>
      </div>
    </details>
    <details class="help" bind:this={helpMenu}>
      <summary class="gear" data-tour="help" aria-label="Ayuda" title="Ayuda" onclick={() => { if (scenarioMenu) scenarioMenu.open = false; }}>?</summary>
      <div class="scenario-menu">
        <a href={resolve("/acerca-de")}>Acerca de · métodos y fuentes</a>
        <button type="button" onclick={startTour}>Ver recorrido</button>
        <button type="button" onclick={openNovedades}>Novedades</button>
        <hr />
        <Offline />
      </div>
    </details>
    <button type="button" class="gear" aria-label="Ajustes" title="Ajustes: método, altura de piso, accesorios, vista" onclick={() => (settingsOpen = true)}>⚙</button>
  </header>

  {#if !wide && !landscape}
    <div class="pump" data-tour="pump">{@render pumpPanel(phone ? "strip" : "bar")}</div>
  {/if}

  {#if !landscape && !shortPortrait && activeDocument.exercise && practiceReadings}
    <div class="practice-summary" bind:clientHeight={practiceHeaderHeight} inert={phone && sheet === "full"} style:visibility={phone && sheet === "full" ? "hidden" : undefined}>
      <PracticeSummary readings={practiceReadings} revealed={practiceRevealed} lessonId={activeDocument.exercise.lessonId} compact onOpen={openPractice} />
      {#if practiceRevealed && activeDocument.exercise?.lessonId === 'second-discharge'}
        <DischargeComparison values={dischargeValues} baseline={baselineValues} canCapture={scenario.discharges?.[1]?.open === false} onCapture={captureDischargeBaseline} pump={scenario.source.pump} status={pumpResult.pump?.status} onCase={chooseDischargeCase} />
      {/if}
    </div>
  {/if}

  {#if shortPortrait && activeDocument.exercise}
    <button type="button" class="practice-short" onclick={() => { selection = null; sheet = 'full'; }}>Práctica NFA · ver resultados y comparación ›</button>
  {/if}
  <div class="canvas" data-tour="canvas">
    {#if !lineScenario.sections.length && network}
      <EmptyPumpCanvas {scenario} {network} onPump={() => select({ kind: "pump" })}
        onGate={id => applyTree(branch.toggleGate(scenario, [id]))}
        onConnect={(id, size) => { applyTree(branch.connectOutlet(scenario, [id], size)); selectedPath = [id]; loads += 1; deselect(); }} />
    {:else}
    <Canvas
      scenario={lineScenario}
      {result}
      {selection}
      {phone}
      {landscape}
      {wide}
      visibleBottom={canvasBottom}
      bottomInsetPx={pressureDockHeight}
      topInsetPx={activeDocument.exercise ? practiceHeaderHeight + 12 : 0}
      floorM={edit.floorOf(scenario)}
      onShowReach={() => { select({ kind: "nozzle", reachFirst: true }); if (phone && !landscape) sheet = "full"; }}
      initialOverview={presetId === DEFAULT_PRESET || others.length > 0}
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
    {/if}
  </div>

  {#if !phone}
    <div class="side" bind:this={desktopPanel}>
      {#if wide}<div class="head" data-tour="pump">{@render pumpPanel("head")}</div>{/if}
      {@render side()}
    </div>
    <div class="results">{@render results()}</div>
  {:else if landscape}
    <div class="side landscape-panel" bind:this={landscapePanel} aria-label="Controles y resultados">
      <div class="landscape-pump">{@render pumpPanel("strip")}</div>
      {@render side()}
      {@render summary()}
      {#if practiceReadings}
        <PracticeSummary readings={practiceReadings} revealed={practiceRevealed} compact onOpen={openPractice} />
        {#if practiceRevealed && activeDocument.exercise?.lessonId === 'second-discharge'}
          <DischargeComparison values={dischargeValues} baseline={baselineValues} canCapture={scenario.discharges?.[1]?.open === false} onCapture={captureDischargeBaseline} pump={scenario.source.pump} status={pumpResult.pump?.status} onCase={chooseDischargeCase} />
        {/if}
      {/if}
      {@render results()}
    </div>
  {/if}
</div>

<input class="file-input" type="file" accept=".json,application/json" bind:this={fileInput} onchange={e => importFile(e.currentTarget.files?.[0])} aria-label="Importar archivo de escenario" />
<ScenarioPicker bind:this={picker} {examples} {practices} current={presetId} onPick={choosePreset} />
<SavedLays open={libraryOpen} scenario={activeDocument} onOpen={s => loadShared(s, true)} onClose={() => libraryOpen = false} />
<ScenarioText mode={textMode} text={textMode === "copy" ? textCopy : ""} error={pasteError} onOpen={openPasted} onClose={() => (textMode = null)} />
{#if notice}
  <div class="notice" role="status">
    {notice}
    {#if noticeAction}<button type="button" onclick={noticeAction.run}>{noticeAction.label}</button>{/if}
  </div>
{/if}
<Tour running={touring} {phone} {scenario} {selection} onFit={() => (fitSignal += 1)} onDeselect={deselect} onEnd={() => (touring = false)} />

{#if storageReady}
  {#key practiceEpoch}
  <FireFlowPractice open={practiceOpen} doc={activeDocument} readings={practiceReadings} revealed={practiceRevealed} onReveal={revealPractice} resetKey={practiceEpoch} onClose={() => practiceOpen = false} onAdd={addExercise} onCompareHoses={diameterPractice ? inspectPracticeHose : undefined} onchange={changeExercise} />
{/key}
{/if}

<Novedades open={novedadesOpen} {unread} onClose={closeNovedades} />

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

{#if phone && !landscape}
  <Sheet viewportHeight={viewportHeight} bottomInset={keyboardBottom} onClosedHeight={(height) => (closedSheetHeight = height)} selectionKey={JSON.stringify([selectedPath, selection])} {summary} {sheet} onSheet={(s) => (sheet = s)}>
    {#if selection?.kind === "pump" && !(activeDocument.exercise && pumpTab === "discharges")}
      {@render pumpPanel("full")}
    {/if}
    {#if !shortPortrait || selection !== null}{@render side()}{/if}
    {#if selection?.kind === "pump" && activeDocument.exercise && pumpTab === "discharges"}
      {@render pumpPanel("full")}
    {/if}
    {#if sheet === "full" && practiceReadings}
      <div class="sheet-practice"><PracticeSummary readings={practiceReadings} revealed={practiceRevealed} compact onOpen={openPractice} />
      {#if practiceRevealed && activeDocument.exercise?.lessonId === 'second-discharge'}
        <DischargeComparison values={dischargeValues} baseline={baselineValues} canCapture={scenario.discharges?.[1]?.open === false} onCapture={captureDischargeBaseline} pump={scenario.source.pump} status={pumpResult.pump?.status} onCase={chooseDischargeCase} />
      {/if}</div>
    {/if}
    {#if shortPortrait && selection === null}{@render side()}{/if}
    {@render results()}
  </Sheet>
{:else if !landscape && !budgetVisible && lineScenario.sections.length}
  <div class="dock" bind:clientHeight={pressureDockHeight} data-tour="budget"><BudgetBar {result} {reference} referenceLabel={refName} openEnd={lineScenario.nozzle.design === "open-end"} line={budgetLine} compact /></div>
{/if}

<style>
  .empty-summary { display: grid; gap: 6px; padding: 12px; border-radius: 8px; background: var(--surface); font-size: 13px; }.empty-summary span { color: var(--muted); }
  .pump-tabs { display: flex; flex-wrap: wrap; gap: 4px; }
  .truck-name { margin: 0; font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
  .pump-tabs button { flex: 1; min-height: 44px; padding: 8px 4px; font: inherit; font-size: 13px; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 8px; cursor: pointer; }
  .pump-tabs button[aria-pressed=true] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .file-input { display: none; }.save-status { padding: 4px 12px; margin: 0; font-size: 12px; color: var(--muted); max-width: 310px; }
  .lesson { padding: 10px; border-left: 3px solid var(--accent); background: var(--accent-soft); font-size: 14px; }.lesson p { margin: 6px 0 0; font-size: 13px; }
  .supply-readings { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); width:100%; min-height:44px; padding:6px 2px; border:1px solid var(--line); border-radius:8px; background:var(--surface); color:var(--ink); font:inherit; cursor:pointer; }
  .supply-readings span { display:grid; gap:2px; text-align:center; color:var(--muted); font-size:11px; }
  .supply-readings span + span { border-left:1px solid var(--line); }
  .supply-readings b { color:var(--ink); font-size:14px; }
  .supply-readings small { font-weight:400; }
  .supply-readings em { grid-column:1/-1; padding:5px; font-size:12px; font-style:normal; }
  .tank-strip { display: flex; gap: 4px; background: var(--surface); border-radius: 8px; }
  .tank-strip button { min-height: 44px; padding: 6px 10px; background: transparent; border: 0; color: var(--ink); font: inherit; font-size: 12px; cursor: pointer; }.tank-strip button:first-child { flex: 1; text-align: left; }
  /* Layout by width: docs/UX.md §4. */
  .app {
    display: grid;
    gap: var(--gap);
    padding: var(--gap) var(--gap) var(--dock-space);
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
  .sheet-practice { display: grid; gap: 6px; }
  .practice-summary { grid-area: practice; min-width: 0; }
  .app.wide.has-practice { overflow-anchor: none; grid-template-areas: "top top" "practice side" "canvas side" "results side"; grid-template-rows: auto auto auto 1fr; }
  .app.wide .practice-summary { align-self: start; }
  .app.wide .head { position: sticky; top: 0; z-index: 5; }
  /* One header row when wide: a long scenario name truncates rather than pushing ? and ⚙ to a second row, which would shift the panel under the dock. */
  .app.wide .top { flex-wrap: nowrap; }
  .app.wide .top h1 { flex: none; white-space: nowrap; }
  .app.wide .top > * { flex-shrink: 0; }
  .app.wide .top > .scenario { flex-shrink: 1; }
  /* Reserve the measured dock, including wrapped pressure labels. */
  .app.wide .side { scroll-padding-top: 190px; position: sticky; top: var(--gap); align-self: start; max-height: calc(100dvh - 2 * var(--gap) - 44px - var(--dock-space)); overflow: auto; }
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
  .scenario > summary { list-style: none; display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; font-weight: 600; font-size: 14px; }
  .scenario > summary::-webkit-details-marker, .help > summary::-webkit-details-marker { display: none; }
  .scenario-title { display: grid; gap: 1px; min-width: 0; }
  .scenario-label { color: var(--muted); font-size: 10px; font-weight: 600; }
  .help { position: relative; flex: none; }
  .help > summary { display: grid; place-items: center; list-style: none; }
  .help .scenario-menu { max-width: min(320px, calc(100vw - 76px)); }
  .more-file[open] { display: grid; }
  .more-file > summary { min-height: 44px; padding: 11px 12px; cursor: pointer; font-size: 14px; border-radius: 6px; }
  .more-file > summary:hover { background: var(--accent-soft); }
  .more-file > button { display: block; width: 100%; }
  .scenario .name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .scenario .caret { margin-left: auto; color: var(--muted); }
  .scenario-menu { max-height: calc(100dvh - 130px); overflow-y: auto; position: absolute; right: 0; top: 50px; z-index: 65; width: max-content; min-width: 100%; max-width: min(420px, calc(100vw - 16px)); display: grid; padding: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
  .scenario-menu :is(button, a) { min-height: 44px; padding: 0 12px; text-align: left; border: 0; border-radius: 6px; background: transparent; color: var(--ink); font-size: 14px; cursor: pointer; position: relative; }
  .scenario-menu a { display: flex; align-items: center; text-decoration: none; }
  .scenario-menu :is(button, a):hover:not(:disabled) { background: var(--accent-soft); }
  .scenario-menu button:disabled { opacity: 0.45; cursor: default; }
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
    height: var(--viewport-height, 100dvh);
    overflow: hidden;
    padding: 8px 8px calc(var(--sheet-closed) + 4px);
    gap: 6px;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "top" "pump" "canvas";
    grid-template-rows: auto auto minmax(0, 1fr);
  }
  .app.phone.has-practice { grid-template-areas: "top" "pump" "practice" "canvas"; grid-template-rows: auto auto auto minmax(0, 1fr); }
  .app.phone .top { flex-wrap: nowrap; }
  /* Svelte trims a leading space inside the span, so the gap after the arrow is a margin. */
  .word { margin-left: 0.35em; }
  .app.phone .top h1, .app.phone .word { display: none; }
  .app.phone .history { order: 2; margin-left: 0; }
  .app.phone .history button { min-width: 44px; padding: 0; font-size: 20px; }
  .app.phone .scenario { flex: 1; }
  .app.phone .scenario > .scenario-menu { left: 0; right: auto; }
  .app.phone .help, .app.phone .gear { order: 3; flex: none; }
  .app.phone .canvas { min-height: 0; }
  .practice-entry { min-height: 44px; border: 1px solid var(--line); border-radius: 8px; background: var(--accent-soft); color: var(--accent); font: inherit; font-size: 13px; padding: 8px; cursor: pointer; }
  .practice-short { grid-area: practice; min-height: 44px; text-align: left; padding: 8px 12px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--accent-soft); color: var(--accent); font: inherit; font-size: 13px; }
  .app.phone.landscape, .app.phone.landscape.has-practice {
    padding: max(6px, env(safe-area-inset-top)) max(6px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(6px, env(safe-area-inset-left));
    grid-template-columns: minmax(0, 1fr) clamp(350px, 40vw, 380px);
    grid-template-areas: "top top" "canvas side";
    grid-template-rows: 44px minmax(0, 1fr);
  }
  .landscape .scenario { max-width: none; }
  .landscape-panel { min-height: 0; min-width: 0; overflow: auto; overscroll-behavior: contain; border-radius: var(--radius); scroll-padding-top: 78px; }
  .landscape-pump { position: sticky; top: 0; z-index: 8; background: var(--bg); }
  @media (max-width: 1023px) { .field input { font-size: 16px; } }
</style>
