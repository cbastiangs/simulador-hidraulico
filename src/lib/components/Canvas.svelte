<script lang="ts">
  import { tick, untrack } from "svelte";
  import { HOSE_SIZES, type FittingKind } from "$hydraulics/references.ts";
  import { joints, type Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import {
    PX_PER_M,
    drawnHose,
    fillViewport,
    fitBounds,
    growBounds,
    jointAngle,
    layoutWorld,
    snapHeightM,
    type Bounds,
    type PathAttachment,
  } from "$lib/geometry/world.ts";
  import { jointName, jointNameIn } from "$lib/names.ts";
  import { junctionsOf, type Junction } from "$lib/branch-edit.ts";
  import type { Selection } from "$lib/selection.ts";
    import ContextMenu from "./ContextMenu.svelte";
  import Actions from "./Actions.svelte";
  import type { Action, Target } from "$lib/actions.ts";
  import Gauge from "./Gauge.svelte";
  import JointControls from "./JointControls.svelte";
  import NozzleDrawing from "./NozzleDrawing.svelte";
  import WyeDrawing from "./WyeDrawing.svelte";
  import { hoseVelocityMps } from "$hydraulics/velocity.ts";

  // The canvas (UX.md §2, polish §10.8): one uniform scale, the lay auto-fitted
  // to the space available; gauges, labels, handles and the nozzle keep their
  // screen size at any zoom. A press that moves under 6 px is a tap (select; on
  // the coupling, open its fittings; the bale is its own target); more is a drag
  // (move the coupling). Right click, or a long press on touch, opens a context
  // menu for what is under it. The canvas owns its touches (UX.md §8.1): one
  // finger on empty canvas or a hose pans, two fingers pan and pinch; a mouse
  // wheel zooms, a trackpad swipe or Shift + wheel pans; the page never
  // scrolls from here.
  //
  // A drag freezes the whole mapping for its duration: bounds, filled bounds,
  // zoom and camera are captured at press start, and the pointer's *deltas* map
  // to run and height. Nothing re-fits or re-centres between press and release.
  let {
    scenario,
    result,
    selection,
    floorM = 3,
    resetKey,
    onToggleLock,
    onSelect,
    onMove,
    onToggleNozzle,
    onHoseSize,
    onLength,
    onToggleFitting,
    onAction,
    fitSignal = 0,
    phone = false,
    wide = false,
    coverPx = 0,
    onTapEmpty,
    onDeselect,
    others = [],
    onPick,
    onOtherNozzle,
    onGate,
    editedPath = [],
    editedName = "",
    linePaths = [],
  }: {
    scenario: Scenario;
    result: SeriesResult;
    selection: Selection | null;
    floorM?: number;
    /** Changes when a new lay is loaded: auto-fit is restored. */
    resetKey: string;
    /** Lock or unlock the length of section `i` (UX.md §2). */
    onToggleLock: (i: number) => void;
    /** Select; `open` false when a drag selects, so the phone's sheet stays shut over the canvas. */
    onSelect: (s: Selection, open?: boolean) => void;
    /** Move the coupling at the end of a section to a horizontal run and height (edit.moveCoupling). */
    onMove: (sectionIndex: number, runM: number, elevationM: number) => void;
    onToggleNozzle: () => void;
    onHoseSize: (sectionIndex: number, hoseSizeId: string) => void;
    onLength: (sectionIndex: number, lengthM: number) => void;
    /** Place or remove a fitting at a joint (0 = pump outlet). */
    onToggleFitting: (joint: number, kind: FittingKind) => void;
    /** Run an action from lib/actions.ts (toolbars, menu). */
    onAction: (action: Action, target: Target) => void;
    /** Changes when "Ver toda la línea" runs from the action list: the whole lay is shown. */
    fitSignal?: number;
    /** Phone layout (UX.md §8): the canvas fills its container and the bottom sheet replaces the floating toolbars. */
    phone?: boolean;
    /** Desktop three-column layout (UX.md §4): the canvas takes the window's height. */
    wide?: boolean;
    /** Pixels of the canvas's foot under the phone's open sheet (UX.md §10.3 T1). */
    coverPx?: number;
    /** A tap on empty canvas (the phone's sheet closes). */
    onTapEmpty?: () => void;
    /** The floating toolbars' ×. */
    onDeselect: () => void;
    /**
     * A branched lay's other lines (owner, 2026-10-17: every line drawn), each
     * as its own one-line scenario and reading; drawn from `from`, the joint of
     * the wye it leaves the edited line at, in its own lane below.
     */
    others?: { path: string[]; name: string; scenario: Scenario; result: SeriesResult; from: number; shut: boolean }[];
    /** A tap on another line: edit that line, with this selected (its own coordinates). */
    onPick?: (path: string[], selection: Selection) => void;
    onOtherNozzle?: (path: string[]) => void;
    /** Open or shut a wye outlet's valve (its lever on the side-view wye). */
    onGate?: (path: string[]) => void;
    /** The edited line's path and name, and every line's path in outlet order. */
    editedPath?: string[];
    editedName?: string;
    linePaths?: string[][];
  } = $props();

  const TAP_PX = 6;
  /** Room kept under the lay for the ground line and its caption (§10.8). */
  const BOTTOM_INSET_PX = 64;
  /** Below this the constant-size gauges crowd each other. */
  const MIN_FIT_ZOOM = 0.12;

  let viewWidth = $state(0);
  let viewHeight = $state(0);
  let windowHeight = $state(800);
  let scroller: HTMLDivElement | undefined = $state();
  let svg: SVGSVGElement | undefined = $state();
  let stage: HTMLDivElement | undefined = $state();

  // Mounted markup and bind:clientWidth start at 0: measure on mount so the first fit is right.
  $effect(() => {
    if (scroller && viewWidth === 0) viewWidth = scroller.clientWidth;
  });

  // Reduced motion: camera glides and CSS transitions are presentation only (§10.8).
  let reducedMotion = $state(false);
  $effect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = mq.matches;
    const on = () => (reducedMotion = mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  });

  /**
   * The camera (owner, 2026-10-16): no native scrolling. camX / camY are the
   * stage's offset in screen px, free to move past the world's edges (see
   * moveCamera). `locked` makes it follow the selection, or the truck.
   */
  let camX = $state(0);
  let camY = $state(0);
  let locked = $state(false);
  /** Programmatic moves glide; a finger or wheel moves it directly. */
  let glide = $state(false);
  let glideTimer: ReturnType<typeof setTimeout> | undefined;
  /**
   * Move the camera, kept inside the world (owner, 2026-10-16: zooming out
   * showed empty space above and left of the truck). The world always fills
   * the view (fillViewport), so the view never shows past its edges.
   */
  function moveCamera(x: number, y: number, smooth = false) {
    const stageW = layout.widthPx * zoom;
    const stageH = layout.heightPx * zoom + coverPx;
    camX = Math.min(Math.max(0, stageW - viewWidth), Math.max(0, x));
    camY = Math.min(Math.max(0, stageH - viewHeight), Math.max(0, y));
    clearTimeout(glideTimer);
    glide = smooth && !reducedMotion;
    if (glide) glideTimer = setTimeout(() => (glide = false), 300);
  }

  // A zoom or resize that shrinks the world pulls the camera back inside it.
  $effect(() => {
    const maxX = Math.max(0, layout.widthPx * zoom - viewWidth);
    const maxY = Math.max(0, layout.heightPx * zoom + coverPx - viewHeight);
    untrack(() => {
      if (camX < 0 || camX > maxX) camX = Math.min(maxX, Math.max(0, camX));
      if (camY < 0 || camY > maxY) camY = Math.min(maxY, Math.max(0, camY));
    });
  });

  /** The home view: the truck at the canvas's left edge, the ground at the foot. */
  async function goHome() {
    await tick();
    if (press || dragging !== null) return;
    moveCamera(0, Math.max(0, layout.heightPx * zoom - viewHeight), true);
  }
  /** "Ver todo" and a double tap: the whole lay, however small. */
  function showWhole() {
    manualZoom = null;
    showAll = true;
    locked = false;
    goHome();
  }

  let fittedFor = "";
  $effect(() => {
    if (resetKey !== fittedFor) {
      fittedFor = resetKey;
      manualZoom = null;
      showAll = false;
      // Start at the truck: the line reads from the pump (UX.md §8.1).
      requestAnimationFrame(() => {
        goHome();
      });
    }
  });
  let fitSeenHere = 0;
  $effect(() => {
    if (fitSignal !== fitSeenHere) {
      fitSeenHere = fitSignal;
      goHome();
    }
  });

  // View (UX.md §10.1): changes no number; remembered per browser.
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
    if (viewMenu) viewMenu.open = false;
  }
  let viewMenu: HTMLDetailsElement | undefined = $state();
  /** Drawn thickness over real thickness: the default exaggerates so a 1½″ hose is visible at a fitted zoom. */
  const EXAGGERATION = Math.round(4 / (0.0254 * PX_PER_M));
  const hoseWidth = (thicknessPx: number, diameterIn: number) =>
    trueScale ? Math.max(diameterIn * 0.0254 * PX_PER_M, k) : Math.max(thicknessPx, 3 * k);

  // A gauge tapped for its reading (Inspect, UX.md §10.1): read-only.
  let inspected = $state<number | null>(null);
  $effect(() => {
    void selection;
    inspected = null;
  });

  let fitSeen = 0;
  $effect(() => {
    if (fitSignal !== fitSeen) {
      fitSeen = fitSignal;
      manualZoom = null;
      showAll = true;
    }
  });

  const fitted = $derived(others.reduce((b, o) => growBounds(b, o.scenario.sections, floorM), fitBounds(scenario.sections, floorM)));
  // The canvas takes the height the window has (UX.md §2): the lay sits on the
  // ground at the bottom and the rest is building above it, so a rising hose
  // can be dragged up. Side by side, the header above the canvas and its toolbar take about 150 px and the floating pressure bar 70 px.
  const canvasHeight = $derived(
    phone ? Math.max(200, viewHeight) : Math.max(260, wide ? windowHeight - 220 : windowHeight * 0.5),
  );
  const fitZoom = $derived.by(() => {
    if (viewWidth === 0) return 1;
    const w = (fitted.maxX - fitted.minX) * PX_PER_M;
    const h = (fitted.maxY - fitted.minY) * PX_PER_M;
    // Fit inside the usable height: the bottom inset keeps the ground caption clear.
    const avail = Math.max(80, canvasHeight - BOTTOM_INSET_PX);
    return Math.min(2.2, Math.max(MIN_FIT_ZOOM, Math.min(viewWidth / w, avail / h)));
  });

  // A drag or a press freezes the mapping: bounds, filled bounds and zoom are
  // captured at press start and held until release (§10.8). No fit, follow or
  // centring runs inside that window.
  type Press = {
    node: number;
    pointerId: number;
    x: number;
    y: number;
    runM: number;
    elevationM: number;
    upElevationM: number;
    zoom: number;
    bounds: Bounds;
    filled: Bounds;
  };
  let press = $state.raw<Press | null>(null);
  let dragging = $state<number | null>(null);
  let frozen = $state<{ bounds: Bounds; filled: Bounds; zoom: number } | null>(null);
  /** The requested coupling is past its hose's reach: show "Límite de manguera" (§10.8). */
  let constrained = $state(false);
  /** Set by − / +, the wheel or a pinch; null means automatic. */
  let manualZoom = $state<number | null>(null);
  /**
   * The automatic zoom starts close enough that every floor is named (owner,
   * 2026-10-16: a phone fitting the whole lay opened at 29 %, a floor 18 px
   * tall); the lay then reads from the truck and the rest is a pan away.
   * "Ver todo" and a double tap show the whole lay instead.
   */
  let showAll = $state(false);
  const readableZoom = $derived(24 / (floorM * PX_PER_M));
  const autoZoom = $derived(showAll ? fitZoom : Math.min(2.2, Math.max(fitZoom, readableZoom)));

  const bounds = $derived(frozen?.bounds ?? fitted);
  const zoom = $derived(frozen?.zoom ?? manualZoom ?? autoZoom);
  /** Multiply screen-size things by k so they stay the same size at any zoom. */
  const k = $derived(1 / zoom);
  /**
   * Gauges shrink with the zoom below 80 %, down to 75 % of their size, so
   * they never cover the equipment at a fitted zoom yet stay readable.
   */
  const gaugeK = $derived(k * Math.min(1, Math.max(0.75, zoom / 0.8)));
  /** Floor labels are constant-size: every Nth floor is named so two labels are never under 22 px apart. */
  const labelEvery = $derived.by(() => {
    const need = Math.ceil(22 / (floorM * PX_PER_M * zoom));
    return [1, 2, 5, 10, 20, 50].find((n) => n >= need) ?? 100;
  });

  // The fill reserves the bottom inset for the ground caption (§10.8); during a
  // press the frozen fill is used so the mapping cannot shift under the pointer.
  // Half a view of building past the nozzle, so centring on it (the start
  // view no longer fits a long lay) never shows the world's edge.
  const filled = $derived.by(() => {
    if (frozen) return frozen.filled;
    const f = fillViewport(bounds, viewWidth, viewHeight, zoom, BOTTOM_INSET_PX);
    return { ...f, maxX: Math.max(f.maxX, bounds.maxX + viewWidth / (2 * PX_PER_M * zoom)) };
  });
  const layout = $derived(
    layoutWorld(
      scenario.sections,
      result.nodes.map((n) => n.pressurePsi),
      filled,
      floorM,
      filled.maxY,
    ),
  );
  const last = $derived(layout.nodes.length - 1);
  const isSection = (i: number) => selection?.kind === "section" && selection.index === i;
  const outletIn = $derived(scenario.source.outletSizeIn);
  // A wye on a branched lay's drawn path (UX.md §2) is drawn by itself, not as an adapter.
  const junctions = $derived(junctionsOf(scenario));
  const junctionAtJoint = (i: number): Junction | undefined => junctions.find((j) => j.joint === i);
  // The other lines of a branched lay, each laid out like the edited one: the
  // shared feed lands on the same pixels and every line sits at its true
  // height, so lines on one floor overlap like hoses lying together (owner,
  // 2026-10-17). What hides behind is reached by hover (desktop), a second
  // tap on the same spot, the long-press list, or the "×2" badge.
  const otherLines = $derived(
    others.map((o) => ({ ...o, key: o.path.join("/"), layout: layoutWorld(o.scenario.sections, o.result.nodes.map((n) => n.pressurePsi), filled, floorM, filled.maxY) })),
  );
  const editedKey = $derived(editedPath.join("/"));
  const lineOrder = $derived(linePaths.map((p) => p.join("/")));
  const nameOf = (key: string) => (key === editedKey ? editedName : (otherLines.find((o) => o.key === key)?.name ?? ""));
  const pathOf = (key: string) => (key === editedKey ? editedPath : (otherLines.find((o) => o.key === key)?.path ?? []));

  /** The lines under a point, front first, with the hose under it in each line's own numbering. */
  function linesAt(x: number, y: number) {
    const out: { key: string; index: number }[] = [];
    for (const el of document.elementsFromPoint(x, y)) {
      const key = (el as HTMLElement).dataset?.line;
      if (key !== undefined && !out.some((o) => o.key === key)) out.push({ key, index: Number((el as HTMLElement).dataset.index) });
    }
    return out;
  }

  // Hover (mouse only): where lines overlap, the one behind comes forward
  // with a tag; a click then edits it. Kept while the pointer stays on it.
  let peek = $state<{ key: string; x: number; y: number } | null>(null);
  function hoverLines(e: PointerEvent) {
    if (e.pointerType !== "mouse" || !otherLines.length || press || dragging !== null) return;
    const stack = linesAt(e.clientX, e.clientY);
    const rect = scroller!.getBoundingClientRect();
    const at = { x: e.clientX - rect.left + camX, y: e.clientY - rect.top + camY };
    if (stack.length < 2) peek = null;
    else if (peek && stack.some((l) => l.key === peek!.key)) peek = { key: peek.key, ...at };
    else {
      const behind = stack.find((l) => l.key !== editedKey);
      peek = behind ? { key: behind.key, ...at } : null;
    }
  }

  // A second tap on the same overlap edits the next line there, in outlet
  // order. "Same" means the same hoses, not the same pixels: on a phone the
  // first tap opens the sheet and the drawing moves up.
  let lastTap: { spot: string; t: number } | null = null;
  let toast = $state("");
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  function say(text: string) {
    toast = text;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = ""), 2500);
  }
  function cycleClick(e: MouseEvent) {
    if (!otherLines.length) return;
    const stack = linesAt(e.clientX, e.clientY);
    if (stack.length < 2) return void (lastTap = null);
    const spot = stack.map((l) => `${l.key}#${l.index}`).sort().join(",");
    const repeat = lastTap !== null && lastTap.spot === spot && e.timeStamp - lastTap.t < 4000;
    lastTap = { spot, t: e.timeStamp };
    const here = lineOrder.filter((k) => stack.some((l) => l.key === k));
    if (!repeat) {
      if (!peek) say(`${here.length} líneas aquí · toca de nuevo para la siguiente`);
      return;
    }
    const next = here[(here.indexOf(editedKey) + 1) % here.length];
    if (next === editedKey) return;
    e.stopPropagation();
    e.preventDefault();
    onPick?.(pathOf(next), { kind: "section", index: stack.find((l) => l.key === next)!.index });
    say(`${nameOf(next)} · toca de nuevo para la siguiente`);
  }

  /** Line ends that coincide on screen: a "×n" badge there picks the next line's nozzle. */
  const endGroups = $derived.by(() => {
    const ends = [
      { key: editedKey, x: layout.nodes[layout.nodes.length - 1].x, y: layout.nodes[layout.nodes.length - 1].y },
      ...otherLines.map((o) => ({ key: o.key, x: o.layout.nodes.at(-1)!.x, y: o.layout.nodes.at(-1)!.y })),
    ];
    const groups: (typeof ends)[] = [];
    for (const e of ends) {
      const g = groups.find((g) => Math.hypot(g[0].x - e.x, g[0].y - e.y) * zoom < 10);
      if (g) g.push(e);
      else groups.push([e]);
    }
    return groups.filter((g) => g.length > 1);
  });
  function nextNozzle(group: { key: string }[]) {
    const keys = lineOrder.filter((k) => group.some((g) => g.key === k));
    const next = keys[(keys.indexOf(editedKey) + 1) % keys.length];
    onPick?.(pathOf(next), { kind: "nozzle" });
    say(`Pitón de ${nameOf(next)}`);
  }

  const js = $derived(joints(scenario).map((j) => (junctionAtJoint(j.index) ? { ...j, mismatch: false, auto: false, missing: false, placed: [] } : j)));
  const missing = $derived(js.filter((j) => j.missing));

  // Context menu (UX.md §2): right click, or a press held still for 0.5 s on touch.
  const HOLD_MS = 500;
  let menu = $state<{ target: Target; x: number; y: number; choices: { label: string; run: () => void }[] } | null>(null);
  let hold: { timer: ReturnType<typeof setTimeout>; x: number; y: number } | null = null;
  /** The press that opened the menu must not also count as a tap when it lifts. */
  let held = false;

  /** Where lines overlap, the menu also lists the others under the finger. */
  const overlapChoices = (x: number, y: number) =>
    linesAt(x, y)
      .filter((l) => l.key !== editedKey)
      .map((l) => ({ label: `Editar ${nameOf(l.key)}`, run: () => onPick?.(pathOf(l.key), { kind: "section", index: l.index }) }));

  function openMenu(event: MouseEvent, target: Target) {
    event.preventDefault();
    event.stopPropagation();
    // On touch, browsers that fire contextmenu on a long press beat our timer.
    held = hold !== null;
    cancelHold();
    press = null;
    dragging = null;
    frozen = null;
    constrained = false;
    menu = { target, x: event.clientX, y: event.clientY, choices: overlapChoices(event.clientX, event.clientY) };
    if (target.kind !== "line") onSelect(target);
  }

  function holdStart(event: PointerEvent, target: Target) {
    if (hold || press) return;
    held = false;
    if (event.pointerType === "mouse") return;
    const { clientX: x, clientY: y } = event;
    hold = {
      x,
      y,
      timer: setTimeout(() => {
        hold = null;
        held = true;
        press = null;
        dragging = null;
        frozen = null;
        constrained = false;
        menu = { target, x, y, choices: overlapChoices(x, y) };
        if (target.kind !== "line") onSelect(target);
      }, HOLD_MS),
    };
  }

  function holdMove(event: PointerEvent) {
    if (hold && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) >= TAP_PX) cancelHold();
  }

  function cancelHold() {
    if (hold) clearTimeout(hold.timer);
    hold = null;
  }

  /** A tap, unless it was the end of a long press. */
  const tap = (run: () => void) => () => {
    if (held) held = false;
    else run();
  };

  const nodeTarget = (node: number): Selection => (node === last ? { kind: "nozzle" } : { kind: "joint", index: node });

  function setManualZoom(z: number) {
    manualZoom = Math.min(3, Math.max(0.1, z));
  }

  // Pan and zoom (UX.md §8.1). Pointers are followed on the window, not
  // captured, so a tap still reaches the hose or engine under it.
  const pointers = new Map<number, { x: number; y: number }>();
  let gesture:
    | { kind: "pan"; x: number; y: number; left: number; top: number; moved: boolean; empty: boolean }
    | { kind: "pinch"; distance: number; zoom: number; anchor: { x: number; y: number } }
    | null = null;
  /** A pan or pinch happened: the click that ends it must not select anything. */
  let panned = false;
  let grabbing = $state(false);
  let lastEmptyTap = 0;

  /** Nothing to select under the press: the sky, the ground, a floor. */
  const isEmpty = (el: Element) => {
    const hit = el.closest("[role], button, .hose-bar");
    return !hit || hit === svg || hit === scroller;
  };
  const centre = () => {
    const [a, b] = [...pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, distance: Math.hypot(a.x - b.x, a.y - b.y) };
  };

  /** The world point (metres) under a window point, to hold it still while zooming. */
  function anchorAt(clientX: number, clientY: number) {
    const rect = scroller!.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    return {
      x: filled.minX + (camX + px) / (PX_PER_M * zoom),
      y: filled.maxY - (camY + py) / (PX_PER_M * zoom),
      px,
      py,
    };
  }

  async function zoomAround(z: number, anchor: { x: number; y: number; px: number; py: number }) {
    setManualZoom(z);
    await tick();
    if (!scroller) return;
    moveCamera((anchor.x - filled.minX) * PX_PER_M * zoom - anchor.px, (filled.maxY - anchor.y) * PX_PER_M * zoom - anchor.py);
  }

  function startGesture(empty: boolean) {
    if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      gesture = { kind: "pan", x: p.x, y: p.y, left: camX, top: camY, moved: false, empty };
    } else if (pointers.size === 2) {
      cancelHold();
      panned = true;
      const c = centre();
      gesture = { kind: "pinch", distance: c.distance, zoom, anchor: anchorAt(c.x, c.y) };
    }
  }

  function gestureDown(event: PointerEvent) {
    const el = event.target as Element;
    // Handles drag couplings; a press already dragging one owns the touch.
    if (el.closest(".handle") || press || dragging !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (pointers.size === 0) panned = false;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    startGesture(isEmpty(el));
  }

  function gestureMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId) || !gesture || !scroller) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (gesture.kind === "pan") {
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.moved && Math.hypot(dx, dy) < TAP_PX) return;
      gesture.moved = true;
      panned = true;
      grabbing = true;
      locked = false;
      moveCamera(gesture.left - dx, gesture.top - dy);
    } else if (pointers.size === 2) {
      const c = centre();
      const rect = scroller.getBoundingClientRect();
      // Two fingers: the point first under them follows their centre (pan) at the pinched zoom.
      zoomAround(gesture.zoom * (c.distance / gesture.distance), { ...gesture.anchor, px: c.x - rect.left, py: c.y - rect.top });
    }
  }

  function gestureUp(event: PointerEvent) {
    if (!pointers.delete(event.pointerId)) return;
    if (gesture?.kind === "pan" && !gesture.moved && gesture.empty && pointers.size === 0 && !held) {
      const now = performance.now();
      if (now - lastEmptyTap < 300) {
        showWhole();
        lastEmptyTap = 0;
      } else {
        lastEmptyTap = now;
        onTapEmpty?.();
      }
    }
    gesture = null;
    grabbing = false;
    // One finger left of a pinch carries on panning from where it is.
    if (pointers.size > 0) startGesture(false);
  }

  function swallowClick(event: MouseEvent) {
    if (!panned) return;
    panned = false;
    event.stopPropagation();
    event.preventDefault();
  }

  // A mouse wheel zooms around the pointer, like a map (owner, 2026-10-16);
  // so does a trackpad pinch, which browsers send as Ctrl + wheel. A trackpad
  // swipe and Shift + wheel pan. A trackpad is told apart by sideways motion
  // or fine, fractional steps: a wheel notch is a whole line or a coarse step.
  // A handle press owns the touch: wheel is ignored.
  const isTrackpad = (e: WheelEvent) =>
    e.deltaMode === 0 && (e.deltaX !== 0 || !Number.isInteger(e.deltaY) || Math.abs(e.deltaY) < 40);
  $effect(() => {
    if (!scroller) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (press || dragging !== null) return;
      const step = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY;
      if (event.ctrlKey) zoomAround(zoom * Math.exp(-step * 0.002), anchorAt(event.clientX, event.clientY));
      else if (!event.shiftKey && !isTrackpad(event)) zoomAround(zoom * Math.exp(-step * 0.0015), anchorAt(event.clientX, event.clientY));
      else {
        locked = false;
        moveCamera(camX + (event.shiftKey ? event.deltaY : event.deltaX), camY + (event.shiftKey ? 0 : event.deltaY));
      }
    };
    scroller.addEventListener("wheel", wheel, { passive: false });
    return () => scroller?.removeEventListener("wheel", wheel);
  });

  /** The rendered stage transform is captured into camX/Y before a press, so interrupting a glide cannot jump. */
  function freezeCamera() {
    clearTimeout(glideTimer);
    glide = false;
    if (!stage) return;
    const t = getComputedStyle(stage).transform;
    if (t && t !== "none") {
      const m = new DOMMatrixReadOnly(t);
      camX = -m.m41;
      camY = -m.m42;
    }
  }

  /**
   * The joint handle nearest the pointer centre, on rendered screen positions
   * (overlapping handles, §10.8). Node 0 is included so a short hose can't hide
   * the outlet; `preferred` (the handle actually pressed) wins a tie within
   * 0.5 screen px, so a coupling folded exactly onto the outlet can be dragged
   * back out — while a short-but-distinct span still selects the nearer one.
   */
  function nearestNode(cx: number, cy: number, rect: DOMRect, preferred: number) {
    let best: number | null = null;
    let bestD = Infinity;
    let preferredD = Infinity;
    for (let i = 0; i < layout.nodes.length; i++) {
      const n = layout.nodes[i];
      const d = Math.hypot(cx - (n.x * zoom - camX + rect.left), cy - (n.y * zoom - camY + rect.top));
      if (i === preferred) preferredD = d;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return preferredD <= bestD + 0.5 ? preferred : best;
  }

  function down(event: PointerEvent, node: number) {
    if (event.button !== 0) return;
    // The first press owns the pointer: a second touch must not start a drag.
    if (press) return;
    freezeCamera();
    const rect = scroller!.getBoundingClientRect();
    // Resolve the nearest handle (including the outlet) before arming hold/menu.
    const i = nearestNode(event.clientX, event.clientY, rect, node) ?? node;
    holdStart(event, nodeTarget(i));
    const movable = i > 0;
    press = {
      node: i,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      // Node 0 (the outlet) is fixed: harmless dummy run/height.
      runM: movable ? layout.nodes[i].distanceM - layout.nodes[i - 1].distanceM : 0,
      elevationM: movable ? layout.nodes[i].elevationM : layout.nodes[0].elevationM,
      upElevationM: movable ? layout.nodes[i - 1].elevationM : layout.nodes[0].elevationM,
      zoom,
      bounds: fitted,
      filled,
    };
    // Freeze the mapping from the press itself, not from the first movement.
    frozen = { bounds: press.bounds, filled: press.filled, zoom: press.zoom };
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent) {
    if (!press || event.pointerId !== press.pointerId) return;
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    // The outlet doesn't move: a drag there is a no-select drag, not an edit.
    if (press.node === 0) {
      if (Math.hypot(dx, dy) < TAP_PX) return;
      cancelHold();
      press = null;
      frozen = null;
      constrained = false;
      return;
    }
    if (dragging === null) {
      if (Math.hypot(dx, dy) < TAP_PX) return;
      cancelHold();
      dragging = press.node;
      onSelect(dragging === last ? { kind: "nozzle" } : { kind: "section", index: dragging - 1 }, false);
    }
    const i = dragging - 1;
    // Pointer deltas over the pressed zoom: the mapping never moves mid-drag.
    const run = Math.max(0, Math.round((press.runM + dx / (press.zoom * PX_PER_M)) * 2) / 2);
    // The upper reach is the visible canvas (many floors above), not the fitted bounds.
    const height = snapHeightM(
      Math.max(press.bounds.minY, Math.min(press.filled.maxY, press.elevationM - dy / (press.zoom * PX_PER_M))),
      floorM,
    );
    // A locked hose can't reach past its own length from its upstream coupling.
    const section = scenario.sections[i];
    constrained = !section.lengthFree && Math.hypot(run, height - press.upElevationM) > section.lengthM + 0.05;
    const node = layout.nodes[dragging];
    if (run !== Math.round((node.distanceM - layout.nodes[i].distanceM) * 2) / 2 || height !== node.elevationM) {
      onMove(i, run, height);
    }
  }

  function endPress(select: boolean) {
    cancelHold();
    const p = press;
    const wasDragging = dragging;
    press = null;
    dragging = null;
    frozen = null;
    constrained = false;
    held = false;
    // A cancellation (pointercancel, long press) must not select or toggle.
    if (select && p && wasDragging === null) onSelect(nodeTarget(p.node));
  }

  function up(event: PointerEvent) {
    // A second pointer's release must not end the owning drag.
    if (press && event.pointerId !== press.pointerId) return;
    endPress(!held);
  }

  /** Root/window cancellation: clean up without selecting. */
  function cancelPress(event?: PointerEvent) {
    if (press && event && event.pointerId !== press.pointerId) return;
    endPress(false);
  }

  function keyMove(event: KeyboardEvent, node: number) {
    const i = node - 1;
    const run = layout.nodes[node].distanceM - layout.nodes[i].distanceM;
    const height = layout.nodes[node].elevationM;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [run, height + 0.5],
      ArrowDown: [run, height - 0.5],
      ArrowRight: [run + 1, height],
      ArrowLeft: [Math.max(0, run - 1), height],
    };
    const step = moves[event.key];
    if (step) {
      event.preventDefault();
      onMove(i, step[0], step[1]);
    } else if (event.key === "Enter") {
      onSelect(nodeTarget(node));
    }
  }

  /** "piso 3 · 9 m": the floor first, since its label hides at a fitted zoom (UX.md §10.3 T3). */
  const floorName = (m: number) => {
    const n = Math.round((m / floorM) * 1000) / 1000;
    if (!Number.isInteger(n)) return m <= 0 ? `${m} m` : n < 1 ? `sobre planta baja · ${m} m` : `sobre piso ${Math.floor(n)} · ${m} m`;
    return n === 0 ? "planta baja · 0 m" : n < 0 ? `${m} m` : `piso ${n} · ${m} m`;
  };
  const sizeLabel = (d: number) => `${d.toString().replace(".5", "½").replace(".75", "¾")}″`;
  const fraction = (s: string) => s.replace("1-1/2", "1½").replace("1-3/4", "1¾").replace("2-1/2", "2½").replace('"', "″");
  /** 3" hoses come with two coupling sizes: "3″ (2½″)" names the coupling. */
  const chipLabel = (h: (typeof HOSE_SIZES)[number]) =>
    h.couplings ? `${fraction(h.diameter)} (${fraction(h.couplings)})` : fraction(h.diameter);
  // Water particles (MODEL.md §3.7): one per GALLONS_PER_PARTICLE, moving at
  // the real mean velocity v = Q/A. Their spacing, gallons / A, doesn't depend
  // on Q: a narrow hose shows faster, sparser particles for the same flow.
  const GALLONS_PER_PARTICLE = 1.25;
  function particles(diameterIn: number, flowGpm = result.flowGpm) {
    const seconds = (60 * GALLONS_PER_PARTICLE) / flowGpm;
    return { gapPx: hoseVelocityMps(flowGpm, diameterIn) * seconds * PX_PER_M, seconds };
  }
  /** A hose's own flow: on a branched lay the feed carries every open line's water. */
  const sectionFlow = (r: SeriesResult, i: number) => {
    const t = r.terms.find((t) => t.lawId === "hose.friction" && t.sectionIndex === i);
    return t?.lawId === "hose.friction" ? t.inputs.flowGpm : r.flowGpm;
  };

  const selectedHose = $derived(selection?.kind === "section" ? layout.hoses[selection.index] : undefined);
  // The nozzle joint's fittings are edited in the inspector: its handle works the bale.
  const selectedJoint = $derived(selection?.kind === "joint" && selection.index < last && !junctionAtJoint(selection.index) ? layout.nodes[selection.index] : undefined);
  /** Where a selection is drawn, in world px. */
  function selectionPoint(sel: Selection) {
    if (sel.kind === "section") {
      const h = layout.hoses[sel.index];
      return h ? { x: h.labelX, y: h.labelY } : null;
    }
    if (sel.kind === "joint") return layout.nodes[sel.index] ?? null;
    if (sel.kind === "nozzle") return { x: layout.nodes[last].x + 40 * k, y: layout.nodes[last].y };
    return { x: layout.xAt(-5.75), y: layout.groundY - 1.6 * PX_PER_M };
  }

  /** Move the camera so a world point sits in the middle of the visible canvas; only if it is near an edge, unless `always`. */
  function centreOn(p: { x: number; y: number }, cover: number, always = false) {
    const x = p.x * zoom;
    const y = p.y * zoom;
    const visible = viewHeight - cover;
    const margin = 40;
    const outY = y < camY + margin || y > camY + visible - margin;
    const outX = x < camX + margin || x > camX + viewWidth - margin;
    if (always || outX || outY) moveCamera(always || outX ? x - viewWidth / 2 : camX, always || outY ? y - visible / 2 : camY, true);
  }

  // Locked: the camera stays on the selection, or on the truck when nothing is
  // selected. Suppressed for the whole press/drag (§10.8).
  $effect(() => {
    if (!locked || press || dragging !== null) return;
    const sel = selection;
    void layout;
    void zoom;
    untrack(() => {
      const p = selectionPoint(sel ?? { kind: "pump" } as Selection);
      if (p) centreOn(p, coverPx, true);
    });
  });

  // Keep the selection in sight above the phone's sheet: the stage grows by
  // the covered height so it can scroll up, and a selection under the sheet
  // (or off screen) is scrolled to the middle of what stays visible. Queued
  // centring is cancelled on cleanup and re-checks the press (§10.8).
  $effect(() => {
    const sel = selection;
    const cover = coverPx;
    void press;
    void dragging;
    if (!sel || !scroller || locked || press || dragging !== null) return;
    const raf = requestAnimationFrame(() => {
      if (press || dragging !== null) return;
      const p = selectionPoint(sel);
      if (p) centreOn(p, cover);
    });
    return () => cancelAnimationFrame(raf);
  });

  // Nothing selected: an opening sheet lifts the drawing by what it covers, so
  // the ground and the line stay above it (UX.md §8.2); closing lowers it back.
  let lastCover = 0;
  $effect(() => {
    const cover = coverPx;
    untrack(() => {
      const delta = cover - lastCover;
      lastCover = cover;
      if (delta !== 0 && !selection && !locked) moveCamera(camX, camY + delta, true);
    });
  });

  /** "Acercar a la selección" (View): about 1.5 times closer than the fit, at least 100 %, centred on it. */
  async function zoomToSelection() {
    if (viewMenu) viewMenu.open = false;
    if (!selection) return;
    setManualZoom(Math.max(1, fitZoom * 1.5, zoom));
    await tick();
    const p = selectionPoint(selection);
    if (p) centreOn(p, coverPx, true);
  }

  /** A gauge's centre: above its coupling; the pump's above the truck, its reading clear of the roof (UX.md §8.1). */
  const gauges = $derived.by(() => {
    const truckTop = layout.groundY - 3.2 * PX_PER_M;
    const at = layout.nodes.map((n, i) => {
      const x = i === 0 ? layout.xAt(-1.5) : n.x;
      let y = i === 0 ? Math.min(layout.groundY - 4.6 * PX_PER_M, truckTop - 42 * gaugeK) : n.y - 72 * gaugeK;
      // The nozzle gauge clears the bale above it (§10.8).
      if (i === last) y -= 34 * gaugeK;
      return { x, y };
    });
    // Greedy clearance: while a candidate overlaps an earlier gauge (within
    // ~70 × 68 screen px) or its numeric/readout box (x ± 36k, y − 24k …
    // + 40k) covers a sampled hose contour point, lift it a whole gauge height
    // and retry. Bounded by the node count, so a coil can't loop forever.
    const hosePts = layout.hoses.flatMap((h) => h.geom.points);
    const placed: { x: number; y: number }[] = [];
    for (const g of at) {
      let guard = at.length + 1;
      while (
        guard-- > 0 &&
        (placed.some((p) => Math.abs(p.x - g.x) * zoom < 70 && Math.abs(p.y - g.y) * zoom < 68) ||
          hosePts.some((p) => Math.abs(p.x - g.x) <= 36 * k && p.y >= g.y - 24 * k && p.y <= g.y + 40 * k))
      ) {
        g.y -= 68 * k;
      }
      placed.push({ x: g.x, y: g.y });
    }
    return at;
  });
  const gaugeAt = (i: number) => gauges[i];
  /** Every line's gauges (owner, 2026-10-17: none hidden), lifted clear of those already placed and tagged with the line. */
  const otherGauges = $derived.by(() => {
    const placed = gauges.map((g) => ({ x: g.x, y: g.y }));
    return otherLines.map((o) =>
      o.layout.nodes.map((n, i) => {
        if (i <= o.from || !Number.isFinite(o.result.nodes[i]?.pressurePsi)) return null;
        const g = { x: n.x, y: n.y - 72 * gaugeK - (i === o.layout.nodes.length - 1 ? 34 * gaugeK : 0) };
        let guard = placed.length + 1;
        while (guard-- > 0 && placed.some((p) => Math.abs(p.x - g.x) * zoom < 70 && Math.abs(p.y - g.y) * zoom < 68)) g.y -= 68 * k;
        placed.push(g);
        return g;
      }),
    );
  });
  /** On a branched lay the edited line's gauges past its first wye carry its name too. */
  const firstWye = $derived(junctions[0]?.joint ?? Infinity);

  const nodeName = (i: number) => (i === 0 ? "la bomba" : jointNameIn(scenario, i));

  // ── One cached list of joint drawings and hose contours (UX.md §10.8) ──────
  // A joint's rigid parts are laid out along a single axis; internal joints use
  // the bisector (`jointAngle`), the pump and nozzle keep a horizontal port.
  // Every hose is drawn once from the exact faces they meet, and that same path
  // drives the hose, its particles, its selection outline and its hit target.

  type JointPart =
    | { kind: "adapter"; x: number; len: number; l: number; r: number; auto: boolean; upIn: number; downIn: number }
    | { kind: "coupling" }
    | { kind: "valve"; x: number }
    | { kind: "missing"; upIn: number; downIn: number };
  type JointDrawing = { x: number; y: number; angle: number; beforeX: number; afterX: number; axialScale: number; parts: JointPart[] };

  /** Half the drawn thickness, in the joint's local (screen) units. */
  const halfWidth = (h: number) => {
    const hose = layout.hoses[h];
    return hose ? hoseWidth(hose.thicknessPx, scenario.sections[h].diameterIn) / 2 / k : 3;
  };

  /**
   * The rigid fitting at joint i: one axis, a before/after envelope along it, and
   * the parts that fill it. Adapter cones and rings keep their radius cues; the
   * body compresses along the axis when the neighbouring spans are very short so
   * envelopes never cross a neighbouring joint.
   */
  function buildJoint(i: number): JointDrawing {
    const n = layout.nodes[i];
    const j = js[i];
    const angle = i === 0 || i === last ? 0 : jointAngle(layout.hoses, i);
    const parts: JointPart[] = [];
    let beforeX = 0;
    let afterX = 0;
    if (junctionAtJoint(i)) {
      // The wye's side view: inlet swivel to outlet couplings (WyeDrawing).
      beforeX = -14;
      afterX = 19;
    } else if (j.auto || j.placed.includes("adapter")) {
      const ratio = (j.upIn ?? 1) / (j.downIn || 1);
      const l = i > 0 ? halfWidth(i - 1) : halfWidth(i) * ratio;
      const r = i < last ? halfWidth(i) : l / ratio;
      // Long enough for the taper to read as a cone (screen px); radii never shrink.
      const len = Math.max(12, 2 * (l + r));
      // Pump adapter starts at the outlet; nozzle adapter ends at x = −2 so its right ring reaches x = 0.
      const x = i === 0 ? 0 : i === last ? -len - 2 : -len / 2;
      parts.push({ kind: "adapter", x, len, l, r, auto: j.auto, upIn: j.upIn ?? 0, downIn: j.downIn ?? 0 });
      beforeX = x - 2;
      afterX = x + len + 2;
    } else if (i > 0 && i < last) {
      // A plain coupling joins the two hoses: 7 screen px wide, faces at ±3.5.
      parts.push({ kind: "coupling" });
      beforeX = -3.5;
      afterX = 3.5;
    }
    if (j.placed.includes("valve")) {
      // Inline: downstream of the adapter/coupling, or upstream at the nozzle; never over the cone.
      const vx = i === last ? beforeX - 6 : afterX + 6;
      parts.push({ kind: "valve", x: vx });
      if (i === last) beforeX = vx - 6;
      else afterX = vx + 6;
    }
    if (j.missing) parts.push({ kind: "missing", upIn: j.upIn ?? 0, downIn: j.downIn ?? 0 });

    // Compress the whole body along its axis so the full envelope (coupling,
    // valve, rings and all) stays within ~0.35 of each adjacent screen span.
    // Radii keep their size; the axial scale is applied to the whole group.
    const chordPrev = i > 0 ? Math.hypot(n.x - layout.nodes[i - 1].x, n.y - layout.nodes[i - 1].y) : Infinity;
    const chordNext = i < last ? Math.hypot(layout.nodes[i + 1].x - n.x, layout.nodes[i + 1].y - n.y) : Infinity;
    const capBefore = Number.isFinite(chordPrev) ? Math.max(0.5, 0.35 * chordPrev * zoom) : Infinity;
    const capAfter = Number.isFinite(chordNext) ? Math.max(0.5, 0.35 * chordNext * zoom) : Infinity;
    let axialScale = 1;
    if (beforeX < 0) axialScale = Math.min(axialScale, capBefore / -beforeX);
    if (afterX > 0) axialScale = Math.min(axialScale, capAfter / afterX);
    // Finite, never zero: a degenerate span still draws a hairline, not NaN.
    axialScale = Math.max(0.02, Math.min(1, axialScale));
    return { x: n.x, y: n.y, angle, beforeX, afterX, axialScale, parts };
  }

  /** A face at `offset` along a joint's axis (local units → world px via k·axialScale), with the axis as its tangent. */
  function attachment(j: JointDrawing, offset: number): PathAttachment {
    const rad = (j.angle * Math.PI) / 180;
    const w = offset * j.axialScale * k;
    return { point: { x: j.x + w * Math.cos(rad), y: j.y + w * Math.sin(rad) }, angle: j.angle };
  }

  const drawing = $derived.by(() => {
    const jn = layout.nodes.map((_, i) => buildJoint(i));
    // Particle phase in dimensionless cycles, so it stays continuous across a
    // diameter (and therefore spacing) change: offset = gap · frac(cycles).
    let cycles = 0;
    const hoses = layout.hoses.map((h, idx) => {
      const s = scenario.sections[h.index];
      const width = hoseWidth(h.thicknessPx, s.diameterIn);
      const start = attachment(jn[idx], jn[idx].afterX);
      const end = attachment(jn[idx + 1], jn[idx + 1].beforeX);
      const startTrim = Math.hypot(h.geom.a.x - start.point.x, h.geom.a.y - start.point.y);
      const endTrim = Math.hypot(h.geom.b.x - end.point.x, h.geom.b.y - end.point.y);
      const { d, lengthPx } = drawnHose(h.geom, startTrim, endTrim, start, end);
      const q = sectionFlow(result, h.index);
      const p = q > 0.5 ? particles(s.diameterIn, q) : { gapPx: 0, seconds: 0 };
      // Phase on the shared stream: whole particle cycles already travelled, so
      // inserted paths read as one continuous stream even across a size change.
      const offsetPx = p.gapPx > 0 ? p.gapPx * (((cycles % 1) + 1) % 1) : 0;
      if (p.gapPx > 0) cycles += lengthPx / p.gapPx;
      return { index: idx, d, lengthPx, width, gapPx: p.gapPx, seconds: p.seconds, offsetPx };
    });
    return { joints: jn, hoses };
  });

  // Hose labels (UX.md §10.8): screen-aware placement, so a coiled or short
  // section's caption never covers another, never leaves the canvas, and never
  // steals a tap. Text is formatted once here, from the same values the
  // inspector shows; the DOM only renders it.
  const LABEL_PX_PER_CHAR = 7;
  const hoseLabelText = (s: Scenario["sections"][number], slackM: number) =>
    `${s.lengthFree ? "🔓" : "🔒"} ${s.lengthM} m · ${sizeLabel(s.diameterIn)}${slackM >= 0.5 ? ` · holgura ${slackM.toFixed(1)} m` : ""}`;
  const measureLabel = (text: string) => LABEL_PX_PER_CHAR * text.length + 8;

  type HoseLabel = { index: number; text: string; x: number; y: number; angle: number };

  const hoseLabels = $derived.by(() => {
    const out: HoseLabel[] = [];
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    const maxW = Math.max(0, viewWidth - 16);
    for (const h of layout.hoses) {
      const s = scenario.sections[h.index];
      const full = hoseLabelText(s, h.slackM);
      let text = full;
      let w = measureLabel(full);
      if (w > maxW) {
        // Too wide for the canvas: compact, and let the inspector keep the rest.
        text = `Tramo ${h.index + 1} · ${s.lengthM} m`;
        w = measureLabel(text);
      }
      const chord = Math.hypot(h.geom.b.x - h.geom.a.x, h.geom.b.y - h.geom.a.y);
      const low = h.geom.piled || chord * zoom < 44;
      // A scene point in view: only then is the label clamped inside the canvas,
      // so an offscreen hose keeps its own place rather than pinning to the edge.
      const inView = [
        [h.geom.a.x, h.geom.a.y],
        [h.geom.b.x, h.geom.b.y],
        [h.labelX, h.labelY],
      ].some(([wx, wy]) => {
        const sx = wx * zoom - camX;
        const sy = wy * zoom - camY;
        return sx >= -40 && sx <= viewWidth + 40 && sy >= -40 && sy <= viewHeight + 40;
      });
      // A coiled or very short hose labels on the ground lane, horizontal; a
      // regular hose keeps its chord angle only when that fits the canvas.
      let angle = !low && Math.abs(h.angle) <= 60 ? h.angle : 0;
      const spanOf = (a: number) => {
        const r = (a * Math.PI) / 180;
        return Math.abs(w * Math.cos(r)) + Math.abs(16 * Math.sin(r));
      };
      if (angle !== 0 && spanOf(angle) > maxW) angle = 0;
      const rad = (angle * Math.PI) / 180;
      const bw = Math.abs(w * Math.cos(rad)) + Math.abs(16 * Math.sin(rad));
      const bh = Math.abs(w * Math.sin(rad)) + Math.abs(16 * Math.cos(rad));
      const baseX = h.labelX * zoom - camX;
      const baseY = (low ? layout.groundY + 32 * k : h.labelY + 32 * k) * zoom - camY;
      const clampX = (sx: number) => (inView ? Math.max(8 + bw / 2, Math.min(viewWidth - 8 - bw / 2, sx)) : sx);
      const clear = (sx: number, sy: number) => {
        if (inView && (sy < 8 || sy > viewHeight - 8)) return false;
        return !boxes.some((b) => sx - bw / 2 < b.x + b.w && sx + bw / 2 > b.x && sy - bh / 2 < b.y + b.h && sy + bh / 2 > b.y);
      };
      const offsets = low ? [0] : [0, 18, -18, 36, -36];
      let sx = clampX(baseX);
      let sy = baseY;
      let found = false;
      for (const off of offsets) {
        const cy = baseY + off;
        const cx = clampX(baseX);
        if (clear(cx, cy)) {
          sx = cx;
          sy = cy;
          found = true;
          break;
        }
      }
      // Nothing clear: keep it in view, but never off the canvas.
      if (!found && inView) sy = Math.max(8 + bh / 2, Math.min(viewHeight - 8 - bh / 2, baseY));
      boxes.push({ x: sx - bw / 2, y: sy - bh / 2, w: bw, h: bh });
      out.push({ index: h.index, text, x: (sx + camX) / zoom, y: (sy + camY) / zoom, angle });
    }
    return out;
  });

  /**
   * Aligns a particle path to the document timeline so all sections share one
   * phase (UX.md §10.8). `startTime = 0` refers to the timeline origin, not the
   * path's insertion time, so stream pieces stay in step; the rAF is cancelled
   * on destroy and never runs per frame.
   */
  function waterPhase(node: SVGPathElement) {
    let raf = 0;
    const sync = () => {
      const animations = node.getAnimations?.();
      if (animations) for (const a of animations) a.startTime = 0;
    };
    raf = requestAnimationFrame(sync);
    return {
      update: () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      },
      destroy: () => cancelAnimationFrame(raf),
    };
  }

  // Floating overlays are clamped to the visible canvas in screen space, then
  // mapped back into stage coordinates (§10.8, UX-05). The old translate(-50%)
  // let a bar clip past x = 0.
  let hoseBarW = $state(0);
  let hoseBarH = $state(0);
  let jointBarW = $state(0);
  let jointBarH = $state(0);
  let readingW = $state(0);
  let readingH = $state(0);
  function overlayPos(sx: number, sy: number, w: number, h: number, prefer: "above" | "below") {
    const margin = 8;
    const maxW = Math.max(120, viewWidth - margin * 2);
    const bw = Math.min(w || maxW, maxW);
    let top = prefer === "above" ? sy - h - margin : sy + margin;
    if (top < margin) top = sy + margin;
    if (top + h > viewHeight - margin) top = Math.max(margin, sy - h - margin);
    const left = Math.max(margin, Math.min(viewWidth - bw - margin, sx - bw / 2));
    return { left: left + camX, top: top + camY, maxWidth: maxW };
  }
</script>

<svelte:window
  onkeydown={(e) => {
    const t = e.target as Element;
    if (e.key.toLowerCase() === "y" && !e.ctrlKey && !e.metaKey && !t.closest("input, textarea, select, [contenteditable]")) locked = !locked;
  }}
  bind:innerHeight={windowHeight}
  onpointermove={gestureMove}
  onpointerup={gestureUp}
  onpointercancel={(e) => {
    if (press && press.pointerId === e.pointerId) cancelPress();
    gestureUp(e);
  }}
/>

<div class="canvas" class:phone style:--k={k}>
  <div
    class="scroller"
    class:grabbing
    role="group"
    aria-label="Lienzo: un dedo o arrastrar desplaza, dos dedos acercan"
    style:height={phone ? undefined : `${canvasHeight}px`}
    style:--ground-screen={`${layout.groundY * zoom - camY}px`}
    bind:this={scroller}
    bind:clientWidth={viewWidth}
    bind:clientHeight={viewHeight}
    onpointerdown={gestureDown}
    onclickcapture={swallowClick}
  >
    <div class="ground-back" aria-hidden="true"></div>
    <div
      class="stage"
      class:glide
      style:width={`${layout.widthPx * zoom}px`}
      style:height={`${layout.heightPx * zoom + coverPx}px`}
      style:transform={`translate(${-camX}px, ${-camY}px)`}
      bind:this={stage}
    >
      <svg
        bind:this={svg}
        width={layout.widthPx * zoom}
        height={layout.heightPx * zoom}
        viewBox={`0 0 ${layout.widthPx} ${layout.heightPx}`}
        role="application"
        aria-label="Vista lateral de la línea"
        oncontextmenu={(e) => openMenu(e, { kind: "line" })}
        onpointerdown={(e) => holdStart(e, { kind: "line" })}
        onpointerleave={() => (peek = null)}
        onclickcapture={cycleClick}
        onpointermove={(e) => (holdMove(e), hoverLines(e))}
        onpointerup={cancelHold}
        onpointercancel={cancelHold}
      >
        <!-- Floors: bands, lines, labels -->
        {#each layout.floors as f (f.elevationM)}
          {#if f.number > 0 && f.number % 2 === 1}
            <rect class="band" x="0" y={f.y - floorM * PX_PER_M} width={layout.widthPx} height={floorM * PX_PER_M} />
          {/if}
        {/each}
        <rect class="ground" x="0" y={layout.groundY} width={layout.widthPx} height={layout.heightPx - layout.groundY} />
        {#each layout.floors as f (f.elevationM)}
          {#if f.number > 0}
            <line class="floor" x1="0" x2={layout.widthPx} y1={f.y} y2={f.y} stroke-width={k} />
          {/if}
        {/each}
        <line class="ground-line" x1="0" x2={layout.widthPx} y1={layout.groundY} y2={layout.groundY} stroke-width={1.5 * k} />
        <!-- The ground caption sits on its own lance, pinned near the visible right edge (§10.8). -->
        <text
          class="floor-label caption"
          x={(camX + viewWidth) / zoom - 12 * k}
          y={layout.groundY + 64 * k}
          text-anchor="end"
        >Planta baja · 0 m</text>

        <!-- Engine: tap to select the pump -->
        <g
          class="pump"
          role="button"
          tabindex="0"
          aria-label="Bomba: elegir salida"
          onclick={tap(() => onSelect({ kind: "pump" }))}
          onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "pump" })}
          oncontextmenu={(e) => openMenu(e, { kind: "pump" })}
          onpointerdown={(e) => holdStart(e, { kind: "pump" })}
        >
          <rect class="truck" class:selected={selection?.kind === "pump"} x={layout.xAt(-9.5)} y={layout.groundY - 3.2 * PX_PER_M} width={7 * PX_PER_M} height={2.6 * PX_PER_M} rx="5" />
          <rect class="window" x={layout.xAt(-8.9)} y={layout.groundY - 2.8 * PX_PER_M} width={1.6 * PX_PER_M} height={0.9 * PX_PER_M} rx="2" />
          <circle class="wheel" cx={layout.xAt(-8)} cy={layout.groundY - 0.5 * PX_PER_M} r={0.5 * PX_PER_M} />
          <circle class="wheel" cx={layout.xAt(-4)} cy={layout.groundY - 0.5 * PX_PER_M} r={0.5 * PX_PER_M} />
        </g>
        <rect class="outlet" x={layout.xAt(-2.5)} y={layout.nodes[0].y - 0.25 * PX_PER_M} width={layout.nodes[0].x - layout.xAt(-2.5)} height={0.5 * PX_PER_M} />
        <text class="tag" x={layout.xAt(-5.75)} y={layout.groundY + 16 * k}>Bomba{outletIn ? ` · salida ${sizeLabel(outletIn)}` : ""}</text>

        <!-- The other lines (owner, 2026-10-17): hoses, couplings and nozzle at their true height.
             A tap makes that line the edited one; the edited line draws on top with its handles. -->
        {#snippet otherLine(o: (typeof otherLines)[number], peeked: boolean)}
          {@const end = o.layout.nodes[o.layout.nodes.length - 1]}
          {@const lastSection = o.scenario.sections.length - 1}
          <g class="other-line" class:peeked>
            {#each o.layout.hoses.filter((h) => h.index >= o.from) as h (h.index)}
              {@const sec = o.scenario.sections[h.index]}
              <!-- The first hose starts at the wye's outlet coupling, not under the casting. -->
              {@const d = drawnHose(h.geom, h.index === o.from ? 19 * k : 0).d}
              {@const q = sectionFlow(o.result, h.index)}
              {@const p = q > 0.5 ? particles(sec.diameterIn, q) : null}
              {#if peeked}<path class="peek-outline" {d} stroke-width={hoseWidth(h.thicknessPx, sec.diameterIn) + 6 * k} />{/if}
              <path class="hose" class:idle={!p} {d} stroke-width={hoseWidth(h.thicknessPx, sec.diameterIn)} />
              {#if p}<path class="particles" {d} stroke-width={Math.max(2, hoseWidth(h.thicknessPx, sec.diameterIn) * 0.3)} style:--offset="0px" style:--gap={`${p.gapPx}px`} style:--period={`${p.seconds}s`} use:waterPhase />{/if}
              <path
                class="hit"
                {d}
                data-line={o.key}
                data-index={h.index}
                stroke-width={36 * k}
                role="button"
                tabindex="0"
                aria-label={`${o.name}, tramo ${h.index - o.from + 1}: ${sec.lengthM} m de ${sizeLabel(sec.diameterIn)}. Tocar para editar esta línea`}
                onclick={tap(() => onPick?.(o.path, { kind: "section", index: h.index }))}
                onkeydown={(e) => e.key === "Enter" && onPick?.(o.path, { kind: "section", index: h.index })}
                oncontextmenu={(e) => (onPick?.(o.path, { kind: "section", index: h.index }), openMenu(e, { kind: "section", index: h.index }))}
              />
            {/each}
            {#each o.layout.nodes as n, i (i)}
              {#if i > o.from && i <= lastSection}<circle class="lane-coupling" cx={n.x} cy={n.y} r={4 * k} />{/if}
            {/each}
            <g transform={`translate(${end.x} ${end.y}) scale(${k})`}>
              <NozzleDrawing nozzle={o.scenario.nozzle} flowGpm={o.result.flowGpm} x={0} y={0} selected={false} onToggle={() => onOtherNozzle?.(o.path)} />
            </g>
          </g>
        {/snippet}
        {#each otherLines.filter((o) => o.key !== peek?.key) as o (o.key)}{@render otherLine(o, false)}{/each}

        <!-- Hoses: one contour for the hose, the particles, the selection and the hit path -->
        {#each drawing.hoses as hd (hd.index)}
          {@const s = scenario.sections[hd.index]}
          {@const lbl = hoseLabels[hd.index]}
          <path class="hose" d={hd.d} stroke-width={hd.width} />
          {#if hd.gapPx > 0}
            <path
              class="particles"
              d={hd.d}
              stroke-width={Math.max(2, hd.width * 0.3)}
              style:--offset={`${hd.offsetPx}px`}
              style:--gap={`${hd.gapPx}px`}
              style:--period={`${hd.seconds}s`}
              use:waterPhase
            />
          {/if}
          {#if isSection(hd.index)}<path class="hose-selected" d={hd.d} stroke-width={hd.width + 6 * k} />{/if}
          <path
            class="hit"
            d={hd.d}
            data-line={editedKey}
            data-index={hd.index}
            stroke-width={44 * k}
            role="button"
            tabindex="0"
            aria-label={`Tramo ${hd.index + 1}: ${s.lengthM} m de ${sizeLabel(s.diameterIn)}`}
            onclick={tap(() => onSelect({ kind: "section", index: hd.index }))}
            onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "section", index: hd.index })}
            oncontextmenu={(e) => openMenu(e, { kind: "section", index: hd.index })}
            onpointerdown={(e) => holdStart(e, { kind: "section", index: hd.index })}
          />
          <text class="tag" transform={`translate(${lbl.x} ${lbl.y}) rotate(${lbl.angle})`}>{lbl.text}</text>
        {/each}

        <!-- Hovered: the line behind comes forward over the edited one. -->
        {#each otherLines.filter((o) => o.key === peek?.key) as o (o.key)}{@render otherLine(o, true)}{/each}

        <!-- Couplings and their fittings (MODEL.md §3.10): adapters where coupling sizes differ, valves -->
        {#each drawing.joints as jd, i (i)}
          <g
            class="fittings"
            aria-hidden="true"
            transform={`translate(${jd.x} ${jd.y}) rotate(${jd.angle}) scale(${k * jd.axialScale} ${k})`}
            onpointerdown={(e) => down(e, i)}
            onpointermove={move}
            onpointerup={up}
            onpointercancel={cancelPress}
            oncontextmenu={(e) => openMenu(e, nodeTarget(i))}
          >
            {#each jd.parts as part}
              {#if part.kind === "adapter"}
                <path class="adapter" class:auto={part.auto} d={`M ${part.x} ${-part.l} L ${part.x + part.len} ${-part.r} L ${part.x + part.len} ${part.r} L ${part.x} ${part.l} Z`}>
                  <title>{part.auto ? "Adaptador automático" : "Adaptador"} {sizeLabel(part.upIn)} → {sizeLabel(part.downIn)}</title>
                </path>
                {#if i > 0 && i < last}
                  <!-- The steel coupling rings sit on the cone's outer faces, each as tall as the hose it meets -->
                  <rect class="coupling" x={part.x - 2} y={-part.l - 2} width="3.5" height={2 * part.l + 4} rx="1.5" />
                  <rect class="coupling" x={part.x + part.len - 1.5} y={-part.r - 2} width="3.5" height={2 * part.r + 4} rx="1.5" />
                {/if}
              {:else if part.kind === "coupling"}
                <rect class="coupling" x="-3.5" y="-9" width="7" height="18" rx="1.5" />
              {:else if part.kind === "valve"}
                <g class="valve" transform={`translate(${part.x} 0)`}>
                  <path d="M -6 -6 L 6 6 L 6 -6 L -6 6 Z" />
                  <line x1="0" y1="0" x2="0" y2="-11" />
                  <line x1="-5" y1="-11" x2="5" y2="-11" />
                  <title>Válvula en línea</title>
                </g>
              {:else if part.kind === "missing"}
                <g class="missing">
                  <circle cx="0" cy="0" r="10" />
                  <text x="0" y="4.5">!</text>
                  <title>Falta adaptador {sizeLabel(part.upIn)} → {sizeLabel(part.downIn)}</title>
                </g>
              {/if}
            {/each}
          </g>
        {/each}

        <!-- The pump outlet's joint: tap only (the outlet doesn't move) -->
        <circle
          class="handle joint0"
          class:selected={selection?.kind === "joint" && selection.index === 0}
          cx={layout.nodes[0].x}
          cy={layout.nodes[0].y}
          r={22 * k}
          stroke-width={1.5 * k}
          role="button"
          tabindex="0"
          aria-label="Salida de la bomba: accesorios"
          onclick={tap(() => onSelect({ kind: "joint", index: 0 }))}
          onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "joint", index: 0 })}
          oncontextmenu={(e) => openMenu(e, { kind: "joint", index: 0 })}
          onpointerdown={(e) => holdStart(e, { kind: "joint", index: 0 })}
        />

        <!-- Handles: tap selects, drag moves. The three states read apart. -->
        {#each layout.nodes as n, i (i)}
          {#if i > 0}
            <circle
              class="handle"
              class:selected={i === last ? selection?.kind === "nozzle" : selection?.kind === "joint" && selection.index === i}
              class:active={dragging === i}
              class:constrained={dragging === i && constrained}
              cx={n.x}
              cy={n.y}
              r={22 * k}
              stroke-width={1.5 * k}
              role="slider"
              tabindex="0"
              aria-label={i === last ? "Pitón: tocar selecciona, arrastrar mueve" : `${jointName(scenario, i)}: tocar selecciona, arrastrar mueve`}
              aria-valuenow={n.elevationM}
              aria-valuetext={`${scenario.sections[i - 1].lengthM} m de largo, ${n.elevationM} m de altura`}
              onpointerdown={(e) => down(e, i)}
              onpointermove={move}
              onpointerup={up}
              onpointercancel={cancelPress}
              oncontextmenu={(e) => openMenu(e, nodeTarget(i))}
              onkeydown={(e) => keyMove(e, i)}
            />
            {#if dragging === i}
              <text class="drag-label" class:constrained x={n.x} y={n.y + 40 * k}>
                {scenario.sections[i - 1].lengthM} m · {floorName(n.elevationM)}{constrained ? " · Límite de manguera" : ""}
              </text>
            {/if}
          {/if}
        {/each}

        <!-- Wyes (UX.md §2 "Branched lays"): the body at its coupling; a gate handle on every outlet
             (along the hose: open; across: shut); the drawn outlet continues as the line, the others
             are stubs whose label draws that line instead. Stubs are symbols, not to scale. -->
        {#each junctions as wye (wye.joint)}
          {@const jd = drawing.joints[wye.joint]}
          {#if jd}
            <g transform={`translate(${jd.x} ${jd.y}) scale(${k}) rotate(${jd.angle})`}>
              <WyeDrawing outlets={wye.outlets} onGate={(path: string[]) => tap(() => onGate?.(path))()} />
            </g>
          {/if}
        {/each}

        <!-- Gauges above the line; tap one for its reading. The nozzle comes after, so its bale takes the tap. -->
        <!-- The height axis (owner, 2026-10-16): pinned to the view's left edge, over the drawing (a halo keeps it legible on the truck), under the gauges, which float above it. -->
        {#each layout.floors as f (f.elevationM)}
          {#if f.number > 0 && f.number % labelEvery === 0}<text class="floor-label axis" x={camX / zoom + 8 * k} y={f.y + 14 * k}>Piso {f.number} · {f.elevationM} m</text>{/if}
        {/each}
        {#if showGauges}
          {#each layout.nodes as n, i (i)}
            {@const g = gaugeAt(i)}
            <!-- Behind a shut gate the pressure is unknown (MODEL.md §2): no gauge rather than a made-up reading. -->
            {#if Number.isFinite(n.pressurePsi)}
            <g class="gauge" transform={`translate(${g.x} ${g.y}) scale(${gaugeK})`}>
              <Gauge psi={n.pressurePsi} mark={i === last ? scenario.nozzle.ratedPressurePsi : undefined} />
              {#if i > firstWye && editedName}<text class="gauge-tag" x="-36" y="4">{editedName}</text>{/if}
              <circle
                class="gauge-hit"
                r={Math.max(24, 22 / (gaugeK * zoom))}
                role="button"
                tabindex="0"
                aria-label={`Manómetro: ${n.pressurePsi.toFixed(0)} psi, ver lectura`}
                onclick={tap(() => (inspected = inspected === i ? null : i))}
                onkeydown={(e) => e.key === "Enter" && (inspected = i)}
              />
            </g>
            {/if}
          {/each}
        {/if}
        {#if showGauges}
          {#each otherLines as o, li (o.key)}
            {#each o.layout.nodes as n, i (i)}
              {@const g = otherGauges[li]?.[i]}
              {#if g}
                <g class="gauge other-gauge" transform={`translate(${g.x} ${g.y}) scale(${gaugeK})`}>
                  <Gauge psi={o.result.nodes[i].pressurePsi} mark={i === o.layout.nodes.length - 1 ? o.scenario.nozzle.ratedPressurePsi : undefined} />
                  <text class="gauge-tag" x="-36" y="4">{o.name}</text>
                </g>
              {/if}
            {/each}
          {/each}
        {/if}
        <!-- Where line ends coincide: "×n", a tap edits the next line's nozzle. -->
        {#each endGroups as group, gi (gi)}
          <g
            class="stack-badge"
            role="button"
            tabindex="0"
            aria-label={`${group.length} pitones aquí: elegir el siguiente`}
            transform={`translate(${group[0].x - 6 * k} ${group[0].y + 22 * k}) scale(${k})`}
            onclick={tap(() => nextNozzle(group))}
            onkeydown={(e) => e.key === "Enter" && nextNozzle(group)}
          >
            <rect x="-15" y="-11" width="30" height="22" rx="11" />
            <text y="4.5">×{group.length}</text>
          </g>
        {/each}
        <!-- The nozzle above its handle and the gauges: the highest event layer -->
        <g transform={`translate(${layout.nodes[last].x} ${layout.nodes[last].y}) scale(${k})`}>
          <NozzleDrawing
            nozzle={scenario.nozzle}
            flowGpm={result.flowGpm}
            x={0}
            y={0}
            selected={selection?.kind === "nozzle"}
            onToggle={onToggleNozzle}
          />
        </g>

      </svg>
      {#if peek}
        <div class="peek-tag" style:left={`${peek.x + 14}px`} style:top={`${peek.y - 34}px`}>{nameOf(peek.key)} · clic para editarla</div>
      {/if}

      {#if selectedHose && dragging === null && !phone}
        {@const i = selectedHose.index}
        {@const s = scenario.sections[i]}
        {@const pos = overlayPos(selectedHose.labelX * zoom - camX, selectedHose.labelY * zoom - camY, hoseBarW, hoseBarH, "below")}
        <div
          class="hose-bar"
          style:left={`${pos.left}px`}
          style:top={`${pos.top}px`}
          style:max-width={`${pos.maxWidth}px`}
          bind:clientWidth={hoseBarW}
          bind:clientHeight={hoseBarH}
        >
          <button type="button" class="bar-close" aria-label="Quitar selección (Esc)" title="Quitar selección (Esc)" onclick={onDeselect}>×</button>
          <div class="chips" role="radiogroup" aria-label="Diámetro del tramo">
            {#each HOSE_SIZES as size (size.id)}
              <button type="button" role="radio" aria-checked={s.hoseSizeId === size.id} class:on={s.hoseSizeId === size.id} onclick={() => onHoseSize(i, size.id)}>{chipLabel(size)}</button>
            {/each}
          </div>
          <div class="chips">
            <button type="button" aria-label="Acortar 15 m" onclick={() => onLength(i, s.lengthM - 15)}>−15 m</button>
            <span class="len">{s.lengthM} m</span>
            <button type="button" aria-label="Alargar 15 m" onclick={() => onLength(i, s.lengthM + 15)}>+15 m</button>
            <button type="button" class="lock" class:on={!s.lengthFree} aria-pressed={!s.lengthFree} onclick={() => onToggleLock(i)}>{s.lengthFree ? "🔓 Libre" : "🔒 Largo fijo"}</button>
          </div>
          <Actions target={{ kind: "section", index: i }} {scenario} requiredPsi={result.requiredPumpPressurePsi} place="quick" {onAction} />
        </div>
      {/if}

      {#if selectedJoint && dragging === null && selection?.kind === "joint" && !phone}
        {@const pos = overlayPos(selectedJoint.x * zoom - camX, selectedJoint.y * zoom - camY, jointBarW, jointBarH, "below")}
        <div
          class="hose-bar joint-bar"
          style:left={`${pos.left}px`}
          style:top={`${pos.top}px`}
          style:max-width={`${pos.maxWidth}px`}
          bind:clientWidth={jointBarW}
          bind:clientHeight={jointBarH}
        >
          <button type="button" class="bar-close" aria-label="Quitar selección (Esc)" title="Quitar selección (Esc)" onclick={onDeselect}>×</button>
          <JointControls {scenario} flowGpm={result.flowGpm} joint={selection.index} onToggle={(kind) => onToggleFitting(selection.index, kind)} />
          <Actions target={selection} {scenario} requiredPsi={result.requiredPumpPressurePsi} place="quick" {onAction} />
        </div>
      {/if}
      {#if inspected !== null && showGauges && inspected < layout.nodes.length}
        {@const i = inspected}
        {@const g = gaugeAt(i)}
        {@const friction = result.terms.find((t) => t.lawId === "hose.friction" && t.sectionIndex === i - 1)}
        {@const pos = overlayPos(g.x * zoom - camX, (g.y - 30 * gaugeK) * zoom - camY, readingW, readingH, "above")}
        <div
          class="reading"
          role="status"
          style:left={`${pos.left}px`}
          style:top={`${pos.top}px`}
          style:max-width={`${pos.maxWidth}px`}
          bind:clientWidth={readingW}
          bind:clientHeight={readingH}
        >
          <button type="button" class="bar-close" aria-label="Cerrar lectura" onclick={() => (inspected = null)}>×</button>
          <span>Presión en {nodeName(i)}</span>
          <b>{result.nodes[i].pressurePsi.toFixed(1)} psi</b>
          {#if i > 0}
            <span>{(result.nodes[i - 1].pressurePsi - result.nodes[i].pressurePsi).toFixed(1)} psi menos que en {nodeName(i - 1)}</span>
            {#if friction}<span>Fricción del tramo {i}: {friction.valuePsi.toFixed(1)} psi; el resto, desnivel y accesorios</span>{/if}
          {/if}
          {#if i === last}<span>Nominal del pitón: {scenario.nozzle.ratedPressurePsi} psi (marca en el dial)</span>{/if}
        </div>
      {/if}
    </div>
  </div>
  {#if toast}<div class="toast" role="status">{toast}</div>{/if}
  <!-- Controls live below the drawing, never over it. -->
  <div class="toolbar">
  {#if missing.length > 0}
    <button type="button" class="missing-note" onclick={() => onSelect({ kind: "joint", index: missing[0].index })}>
      ⚠ Falta adaptador en {missing.map((j) => (j.index === 0 ? "la salida" : j.index === last ? "el pitón" : `el acople ${j.index}`)).join(", ")}
    </button>
  {/if}
  {#if !phone}<span class="hint">Clic derecho o mantener pulsado: más opciones</span>{/if}
  <span class="badge">{Math.round(zoom * 100)} %{manualZoom === null ? (showAll ? " · todo" : " · auto") : ""}{trueScale ? "" : ` · grosor ×${EXAGGERATION}`}</span>
  <div class="zoom">
    <button type="button" aria-label="Alejar" onclick={() => setManualZoom(zoom / 1.25)}>−</button>
    <button type="button" aria-label="Acercar" onclick={() => setManualZoom(zoom * 1.25)}>+</button>
    <button type="button" onclick={showWhole}>Ver todo</button>
    <button type="button" class="camera-lock" class:on={locked} aria-pressed={locked} title="Fijar la cámara en la selección (Y)" onclick={() => (locked = !locked)}>Cámara</button>
    <details class="view" bind:this={viewMenu}>
      <summary aria-label="Vista" title="Vista">Vista</summary>
      <div class="view-menu">
        <button type="button" disabled={!selection} onclick={zoomToSelection}>Acercar a la selección</button>
        <button type="button" role="menuitemcheckbox" aria-checked={showGauges} onclick={() => setView("gauges", !showGauges)}>{showGauges ? "☑" : "☐"} Manómetros</button>
        <button type="button" role="menuitemcheckbox" aria-checked={trueScale} onclick={() => setView("scale", !trueScale)}>{trueScale ? "☑" : "☐"} Grosor real de la manguera</button>
      </div>
    </details>
  </div>
  </div>
</div>

{#if menu}
  <ContextMenu target={menu.target} x={menu.x} y={menu.y} choices={menu.choices} {scenario} requiredPsi={result.requiredPumpPressurePsi} {onAction} onClose={() => (menu = null)} />
{/if}

<style>
  .canvas { position: relative; background: var(--surface); border-radius: var(--radius); overflow: hidden; }
  /* Background sky/ground continue behind the stage when the camera pans (§10.8). */
  .scroller {
    position: relative;
    width: 100%;
    overflow: hidden;
    transition: height 0.2s ease;
    touch-action: none;
    overscroll-behavior: contain;
    cursor: grab;
    background: linear-gradient(to bottom, var(--surface) 0, var(--surface) var(--ground-screen, 100%), var(--ground) var(--ground-screen, 100%), var(--ground) 100%);
  }
  .scroller.grabbing { cursor: grabbing; }
  .ground-back { position: absolute; left: 0; right: 0; top: var(--ground-screen, 0px); height: 1.5px; background: var(--ink); opacity: 0.35; pointer-events: none; }
  .canvas.phone { height: 100%; display: flex; flex-direction: column; }
  .canvas.phone .scroller { flex: 1; min-height: 0; transition: none; }
  .canvas.phone .toolbar { padding: 6px 8px; }
  .stage { position: relative; will-change: transform; }
  .stage.glide { transition: transform 0.25s ease; }
  svg { display: block; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
  .band { fill: var(--band); }
  .ground { fill: var(--ground); }
  .floor { stroke: var(--line); stroke-dasharray: 4 4; }
  .ground-line { stroke: var(--ink); }
  .floor-label, .tag { font-size: calc(11px * var(--k)); fill: var(--muted); pointer-events: none; }
  .axis { paint-order: stroke; stroke: var(--bg); stroke-width: calc(3px * var(--k)); stroke-linejoin: round; }
  .tag { text-anchor: middle; font-size: calc(12px * var(--k)); paint-order: stroke; stroke: var(--ground); stroke-width: calc(3px * var(--k)); stroke-linejoin: round; }
  .pump { cursor: pointer; outline: none; }
  .truck { fill: var(--pump); }
  .truck.selected, .pump:focus-visible .truck { stroke: var(--accent); stroke-width: calc(3px * var(--k)); }
  .window { fill: #f8d7d3; }
  .wheel { fill: var(--ink); }
  .outlet, .coupling { fill: var(--steel); }
  .gauge { pointer-events: none; }
  /* Painted fittings are real targets (the ≥44 px handle circle stays as padding & keyboard focus). */
  .fittings { pointer-events: visiblePainted; }
  .gauge-hit { fill: transparent; pointer-events: auto; cursor: pointer; outline: none; }
  .gauge-hit:focus-visible { stroke: var(--accent); stroke-width: 2; }
  .reading { position: absolute; z-index: 3; min-width: 200px; display: grid; gap: 2px; padding: 8px 34px 8px 10px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); font-size: 13px; color: var(--muted); }
  .reading b { color: var(--ink); font-size: 15px; }
  .view { position: relative; }
  .view summary { list-style: none; display: grid; place-items: center; min-width: 44px; height: 44px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; font-size: 14px; }
  .view summary::-webkit-details-marker { display: none; }
  .view-menu { position: absolute; right: 0; bottom: 50px; z-index: 30; min-width: 220px; display: grid; padding: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
  .view-menu button { min-height: 44px; padding: 0 12px; text-align: left; border: 0; border-radius: 6px; background: transparent; color: var(--ink); font-size: 14px; cursor: pointer; }
  .view-menu button:hover:not(:disabled) { background: var(--accent-soft); }
  .view-menu button:disabled { opacity: 0.4; cursor: default; }
  .fittings title { pointer-events: auto; }
  .adapter { fill: var(--fitting); stroke: var(--fitting); stroke-width: 1; }
  .adapter.auto { fill: color-mix(in srgb, var(--fitting) 55%, transparent); stroke-dasharray: 2 2; }
  .valve path { fill: var(--fitting); }
  .valve line { stroke: var(--fitting); stroke-width: 2; }
  .missing circle { fill: var(--warn); }
  .hose.idle { opacity: 0.55; }
  .lane-coupling { fill: var(--steel); pointer-events: none; }
  .peek-outline { fill: none; stroke: var(--accent); opacity: 0.55; pointer-events: none; }
  .gauge-tag { font-size: 11px; font-weight: 700; text-anchor: end; fill: var(--ink); paint-order: stroke; stroke: var(--bg); stroke-width: 3px; pointer-events: none; }
  .stack-badge { cursor: pointer; outline: none; }
  .stack-badge rect { fill: var(--ink); }
  .stack-badge text { fill: var(--bg); font-size: 12px; font-weight: 700; text-anchor: middle; }
  .stack-badge:focus-visible rect { stroke: var(--accent); stroke-width: 3; }
  .peek-tag { position: absolute; z-index: 6; padding: 4px 8px; border-radius: 6px; background: var(--ink); color: var(--bg); font-size: 12px; font-weight: 600; white-space: nowrap; pointer-events: none; }
  .toast { position: absolute; z-index: 7; left: 50%; top: 10px; transform: translateX(-50%); padding: 6px 12px; border-radius: 8px; background: var(--ink); color: var(--bg); font-size: 13px; pointer-events: none; }
  .missing text { fill: #fff; font-size: 14px; font-weight: 800; text-anchor: middle; }
  .hose { stroke: var(--hose); stroke-linecap: butt; fill: none; }
  .particles { fill: none; stroke: #fff; stroke-opacity: 0.85; stroke-linecap: round; stroke-dasharray: 0 var(--gap); animation: water var(--period) linear infinite; pointer-events: none; }
  @keyframes water {
    from { stroke-dashoffset: var(--offset, 0px); }
    to { stroke-dashoffset: calc(var(--offset, 0px) - var(--gap)); }
  }
  @media (prefers-reduced-motion: reduce) { .particles { animation: none; } .stage.glide { transition: none; } }
  .hose-selected { fill: none; stroke: var(--accent); stroke-opacity: 0.35; stroke-linecap: round; pointer-events: none; }
  .hit { fill: none; stroke: transparent; cursor: pointer; outline: none; }
  .hit:focus-visible { stroke: var(--accent); stroke-opacity: 0.2; }
  .handle { fill: transparent; stroke: var(--ink); stroke-opacity: 0.3; stroke-dasharray: 3 3; cursor: grab; touch-action: none; outline: none; }
  .handle.selected { stroke: var(--accent); stroke-opacity: 0.7; }
  .handle.active, .handle:focus-visible { stroke: var(--accent); stroke-opacity: 1; cursor: grabbing; }
  .handle.constrained { stroke: var(--warn); stroke-opacity: 1; stroke-width: 3px; }
  .drag-label { font-size: calc(13px * var(--k)); font-weight: 700; text-anchor: middle; fill: var(--accent); pointer-events: none; }
  .drag-label.constrained { fill: var(--warn); }
  .hose-bar { position: absolute; display: grid; gap: 4px; justify-items: center; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 6px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); z-index: 2; }
  .chips { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; justify-content: center; }
  .chips button { min-height: 36px; min-width: 40px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; font-size: 13px; cursor: pointer; }
  .chips button:disabled { opacity: 0.4; cursor: default; }
  .hint { font-size: 12px; color: var(--muted); }
  .chips .on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .len { font-weight: 700; min-width: 3.5rem; text-align: center; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px 10px; border-top: 1px solid var(--line); }
  .badge { font-size: 12px; color: var(--muted); margin-left: auto; }
  .missing-note { min-height: 44px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; font-size: 13px; cursor: pointer; }
  .missing-note { border-color: var(--warn); color: var(--warn); }
  .joint-bar { justify-items: stretch; padding: 10px; }
  .hose-bar { padding-right: 34px; }
  .bar-close { position: absolute; top: 2px; right: 2px; width: 30px; height: 30px; border: 0; border-radius: 6px; background: transparent; font-size: 18px; color: var(--muted); cursor: pointer; }
  .bar-close:hover { background: var(--band); color: var(--ink); }
  .joint0 { cursor: pointer; }
  .lock.on { background: var(--surface); border-color: var(--accent); }
  .zoom { display: flex; gap: 4px; }
  .zoom button { min-width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
  .camera-lock.on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
</style>
