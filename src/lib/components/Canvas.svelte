<script lang="ts">
  import { tick, untrack } from "svelte";
  import { HOSE_SIZES, type FittingKind } from "$hydraulics/references.ts";
  import { joints, type Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import {
    PX_PER_M,
    fillViewport,
    fitBounds,
    layoutWorld,
    snapHeightM,
    type Bounds,
  } from "$lib/geometry/world.ts";
  import type { Selection } from "$lib/selection.ts";
    import ContextMenu from "./ContextMenu.svelte";
  import Actions from "./Actions.svelte";
  import type { Action, Target } from "$lib/actions.ts";
  import Gauge from "./Gauge.svelte";
  import JointControls from "./JointControls.svelte";
  import NozzleDrawing from "./NozzleDrawing.svelte";
  import { hoseVelocityMps } from "$hydraulics/velocity.ts";

  // The canvas (UX.md §2): one uniform scale, the lay auto-fitted to the
  // space available; gauges, labels, handles and the nozzle keep their screen
  // size at any zoom. A press that moves under 6 px is a tap (select; on the
  // coupling, open its fittings; the bale is its own target); more is a drag
  // (move the coupling). Right click, or a long press on touch, opens a
  // context menu for what is under it. The canvas owns its touches (UX.md
  // §8.1): one finger on empty canvas or a hose pans, two fingers pan and
  // pinch, Ctrl + wheel zooms; the page never scrolls from here.
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
    /** Changes when "Ajustar vista" runs from the action list: auto-fit is restored. */
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
  } = $props();

  const TAP_PX = 6;

  let viewWidth = $state(0);
  let viewHeight = $state(0);
  let windowHeight = $state(800);
  let scroller: HTMLDivElement | undefined = $state();
  /** Below this the constant-size gauges crowd each other; the canvas scrolls sideways instead. */
  const MIN_FIT_ZOOM = 0.12;
  /** Height of the on-canvas hose toolbar, to open it upward when there is no room below. */
  const HOSE_BAR_PX = 225;
  let svg: SVGSVGElement | undefined = $state();

  // Dragging freezes the world and the zoom: refitting under the pointer would move the target.
  let press: { node: number; x: number; y: number } | null = null;
  let dragging = $state<number | null>(null);
  let frozen = $state<{ bounds: Bounds; zoom: number } | null>(null);
  /** Set by − / +; null means auto-fit. */
  let manualZoom = $state<number | null>(null);

  // Server-rendered markup and bind:clientWidth start at 0: measure on mount so the first fit is right.
  $effect(() => {
    if (scroller && viewWidth === 0) viewWidth = scroller.clientWidth;
  });

  let fittedFor = "";
  $effect(() => {
    if (resetKey !== fittedFor) {
      fittedFor = resetKey;
      manualZoom = null;
      // Start at the truck: the line reads from the pump (UX.md §8.1).
      requestAnimationFrame(() => {
        if (scroller) scroller.scrollLeft = 0;
      });
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
    }
  });

  const fitted = $derived(fitBounds(scenario.sections, floorM));
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
    return Math.min(2.2, Math.max(MIN_FIT_ZOOM, Math.min(viewWidth / w, canvasHeight / h)));
  });
  const bounds = $derived(frozen?.bounds ?? fitted);
  const zoom = $derived(frozen?.zoom ?? manualZoom ?? fitZoom);
  /** Multiply screen-size things by k so they stay the same size at any zoom. */
  const k = $derived(1 / zoom);
  /**
   * Gauges shrink with the zoom below 80 %, down to 75 % of their size, so
   * they never cover the equipment at a fitted zoom yet stay readable.
   */
  const gaugeK = $derived(k * Math.min(1, Math.max(0.75, zoom / 0.8)));
  /** Floor labels are constant-size: below this they would overlap, so they hide. */
  const showFloorLabels = $derived(floorM * PX_PER_M * zoom >= 20);

  const filled = $derived(fillViewport(bounds, viewWidth, viewHeight, zoom));
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
  const js = $derived(joints(scenario));
  const missing = $derived(js.filter((j) => j.missing));

  // Context menu (UX.md §2): right click, or a press held still for 0.5 s on touch.
  const HOLD_MS = 500;
  let menu = $state<{ target: Target; x: number; y: number } | null>(null);
  let hold: { timer: ReturnType<typeof setTimeout>; x: number; y: number } | null = null;
  /** The press that opened the menu must not also count as a tap when it lifts. */
  let held = false;

  function openMenu(event: MouseEvent, target: Target) {
    event.preventDefault();
    event.stopPropagation();
    // On touch, browsers that fire contextmenu on a long press beat our timer.
    held = hold !== null;
    cancelHold();
    press = null;
    menu = { target, x: event.clientX, y: event.clientY };
    if (target.kind !== "line") onSelect(target);
  }

  function holdStart(event: PointerEvent, target: Target) {
    if (hold) return;
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
        menu = { target, x, y };
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
      x: filled.minX + (scroller!.scrollLeft + px) / (PX_PER_M * zoom),
      y: filled.maxY - (scroller!.scrollTop + py) / (PX_PER_M * zoom),
      px,
      py,
    };
  }

  async function zoomAround(z: number, anchor: { x: number; y: number; px: number; py: number }) {
    setManualZoom(z);
    await tick();
    if (!scroller) return;
    scroller.scrollLeft = (anchor.x - filled.minX) * PX_PER_M * zoom - anchor.px;
    scroller.scrollTop = (filled.maxY - anchor.y) * PX_PER_M * zoom - anchor.py;
  }

  function startGesture(empty: boolean) {
    if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      gesture = { kind: "pan", x: p.x, y: p.y, left: scroller!.scrollLeft, top: scroller!.scrollTop, moved: false, empty };
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
      scroller.scrollLeft = gesture.left - dx;
      scroller.scrollTop = gesture.top - dy;
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
        manualZoom = null;
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

  // Ctrl + wheel (and a trackpad pinch, which browsers send as one) zooms around the pointer.
  $effect(() => {
    if (!scroller) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      zoomAround(zoom * Math.exp(-event.deltaY * 0.002), anchorAt(event.clientX, event.clientY));
    };
    scroller.addEventListener("wheel", wheel, { passive: false });
    return () => scroller?.removeEventListener("wheel", wheel);
  });

  function worldPoint(event: PointerEvent) {
    const rect = svg!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom };
  }

  function down(event: PointerEvent, node: number) {
    if (event.button !== 0) return;
    holdStart(event, nodeTarget(node));
    press = { node, x: event.clientX, y: event.clientY };
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent) {
    if (!press) return;
    if (dragging === null) {
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) < TAP_PX) return;
      cancelHold();
      dragging = press.node;
      frozen = { bounds: fitted, zoom };
      onSelect(dragging === last ? { kind: "nozzle" } : { kind: "section", index: dragging - 1 }, false);
    }
    const i = dragging - 1;
    const p = worldPoint(event);
    const run = Math.max(0, Math.round((layout.distanceAt(p.x) - layout.nodes[i].distanceM) * 2) / 2);
    const height = snapHeightM(Math.min(layout.elevationAt(0), Math.max(bounds.minY, layout.elevationAt(p.y))), floorM);
    const node = layout.nodes[dragging];
    if (run !== Math.round((node.distanceM - layout.nodes[i].distanceM) * 2) / 2 || height !== node.elevationM) {
      onMove(i, run, height);
    }
  }

  function up() {
    cancelHold();
    if (held) held = false;
    else if (press && dragging === null) {
      // A tap only selects (UX.md §10.1); the bale is its own target.
      onSelect(nodeTarget(press.node));
    }
    press = null;
    dragging = null;
    frozen = null;
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
  const particles = (diameterIn: number) => {
    const seconds = (60 * GALLONS_PER_PARTICLE) / result.flowGpm;
    return { gapPx: hoseVelocityMps(result.flowGpm, diameterIn) * seconds * PX_PER_M, seconds };
  };

  const selectedHose = $derived(selection?.kind === "section" ? layout.hoses[selection.index] : undefined);
  // The nozzle joint's fittings are edited in the inspector: its handle works the bale.
  const selectedJoint = $derived(selection?.kind === "joint" && selection.index < last ? layout.nodes[selection.index] : undefined);
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

  /** Scroll so a world point sits in the middle of the visible canvas; only if it is near an edge, unless `always`. */
  function centreOn(p: { x: number; y: number }, cover: number, always = false) {
    const el = scroller;
    if (!el) return;
    const x = p.x * zoom;
    const y = p.y * zoom;
    const visible = el.clientHeight - cover;
    const margin = 40;
    const outY = y < el.scrollTop + margin || y > el.scrollTop + visible - margin;
    const outX = x < el.scrollLeft + margin || x > el.scrollLeft + el.clientWidth - margin;
    const top = always || outY ? y - visible / 2 : el.scrollTop;
    const left = always || outX ? x - el.clientWidth / 2 : el.scrollLeft;
    if (top !== el.scrollTop || left !== el.scrollLeft) el.scrollTo({ top, left, behavior: "smooth" });
  }

  // Keep the selection in sight above the phone's sheet: the stage grows by
  // the covered height so it can scroll up, and a selection under the sheet
  // (or off screen) is scrolled to the middle of what stays visible.
  $effect(() => {
    const sel = selection;
    const cover = coverPx;
    if (!sel || !scroller) return;
    untrack(() => {
      const p = selectionPoint(sel);
      if (p) requestAnimationFrame(() => centreOn(p, cover));
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
  function gaugeAt(i: number) {
    const n = layout.nodes[i];
    const truckTop = layout.groundY - 3.2 * PX_PER_M;
    return i === 0
      ? { x: layout.xAt(-1.5), y: Math.min(layout.groundY - 4.6 * PX_PER_M, truckTop - 42 * gaugeK) }
      : { x: n.x, y: n.y - 72 * gaugeK };
  }
  const nodeName = (i: number) => (i === 0 ? "la bomba" : i === last ? "la entrada del pitón" : `el acople ${i}`);

  /** Where a joint's fittings are drawn: after the coupling ring, or just before the nozzle. */
  const fittingX = (i: number) => (i === last ? -16 : i === 0 ? -2 : 4);
</script>

<svelte:window
  bind:innerHeight={windowHeight}
  onpointermove={gestureMove}
  onpointerup={gestureUp}
  onpointercancel={gestureUp}
/>

<div class="canvas" class:phone style:--k={k}>
  <div
    class="scroller"
    class:grabbing
    role="group"
    aria-label="Lienzo: un dedo o arrastrar desplaza, dos dedos acercan"
    style:height={phone ? undefined : `${canvasHeight}px`}
    bind:this={scroller}
    bind:clientWidth={viewWidth}
    bind:clientHeight={viewHeight}
    onpointerdown={gestureDown}
    onclickcapture={swallowClick}
  >
    <div class="stage" style:width={`${layout.widthPx * zoom}px`} style:height={`${layout.heightPx * zoom + coverPx}px`}>
      <svg
        bind:this={svg}
        width={layout.widthPx * zoom}
        height={layout.heightPx * zoom}
        viewBox={`0 0 ${layout.widthPx} ${layout.heightPx}`}
        role="application"
        aria-label="Vista lateral de la línea"
        oncontextmenu={(e) => openMenu(e, { kind: "line" })}
        onpointerdown={(e) => holdStart(e, { kind: "line" })}
        onpointermove={holdMove}
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
            {#if showFloorLabels}<text class="floor-label" x={layout.xAt(0) + 6 * k} y={f.y + 14 * k}>Piso {f.number} · {f.elevationM} m</text>{/if}
          {/if}
        {/each}
        <line class="ground-line" x1="0" x2={layout.widthPx} y1={layout.groundY} y2={layout.groundY} stroke-width={1.5 * k} />
        {#if showFloorLabels}<text class="floor-label" x={layout.xAt(0) + 6 * k} y={layout.groundY + 16 * k}>Planta baja · 0 m</text>{/if}

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

        <!-- Hoses -->
        {#each layout.hoses as h (h.index)}
          {@const s = scenario.sections[h.index]}
          {@const width = hoseWidth(h.thicknessPx, s.diameterIn)}
          <path class="hose" d={h.d} stroke-width={width} />
          {#if result.flowGpm > 0.5}
            {@const p = particles(s.diameterIn)}
            <path class="particles" d={h.d} stroke-width={Math.max(2, width * 0.3)} style:--gap={`${p.gapPx}px`} style:--period={`${p.seconds}s`} />
          {/if}
          {#if isSection(h.index)}<path class="hose-selected" d={h.d} stroke-width={width + 6 * k} />{/if}
          <path
            class="hit"
            d={h.d}
            stroke-width={30 * k}
            role="button"
            tabindex="0"
            aria-label={`Tramo ${h.index + 1}: ${s.lengthM} m de ${sizeLabel(s.diameterIn)}`}
            onclick={tap(() => onSelect({ kind: "section", index: h.index }))}
            onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "section", index: h.index })}
            oncontextmenu={(e) => openMenu(e, { kind: "section", index: h.index })}
            onpointerdown={(e) => holdStart(e, { kind: "section", index: h.index })}
          />
          <text class="tag" transform={`translate(${h.labelX} ${h.labelY + 22 * k}) rotate(${Math.abs(h.angle) > 60 ? 0 : h.angle})`}>
            {s.lengthFree ? "🔓" : "🔒"} {s.lengthM} m · {sizeLabel(s.diameterIn)}{h.slackM >= 0.5 ? ` · holgura ${h.slackM.toFixed(1)} m` : ""}
          </text>
        {/each}

        <!-- Couplings and their fittings (MODEL.md §3.10): adapters where coupling sizes differ, valves -->
        {#each layout.nodes as n, i (i)}
          {@const j = js[i]}
          {#if i > 0 && i < last}
            <rect class="coupling" x={n.x - 3.5 * k} y={n.y - 9 * k} width={7 * k} height={18 * k} rx={1.5 * k} />
          {/if}
          <g transform={`translate(${n.x} ${n.y}) scale(${k})`} class="fittings">
            {#if j.auto || j.placed.includes("adapter")}
              {@const x = fittingX(i)}
              {@const big = 8}
              {@const small = 4.5}
              {@const [l, r] = (j.downIn ?? 0) < (j.upIn ?? 0) ? [big, small] : [small, big]}
              <path class="adapter" class:auto={j.auto} d={`M ${x} ${-l} L ${x + 10} ${-r} L ${x + 10} ${r} L ${x} ${l} Z`}>
                <title>{j.auto ? "Adaptador automático" : "Adaptador"} {sizeLabel(j.upIn ?? 0)} → {sizeLabel(j.downIn ?? 0)}</title>
              </path>
            {/if}
            {#if j.placed.includes("valve")}
              <g class="valve" transform={`translate(${i === last ? -30 : i === 0 ? 16 : 20} 0)`}>
                <path d="M -6 -6 L 6 6 L 6 -6 L -6 6 Z" />
                <line x1="0" y1="0" x2="0" y2="-11" />
                <line x1="-5" y1="-11" x2="5" y2="-11" />
                <title>Válvula en línea</title>
              </g>
            {/if}
            {#if j.missing}
              <g class="missing">
                <circle cx={fittingX(i) + 5} cy="0" r="10" />
                <text x={fittingX(i) + 5} y="4.5">!</text>
                <title>Falta adaptador {sizeLabel(j.upIn ?? 0)} → {sizeLabel(j.downIn ?? 0)}</title>
              </g>
            {/if}
          </g>
        {/each}


        <!-- The pump outlet's joint: tap only (the outlet doesn't move) -->
        <circle
          class="handle joint0"
          class:active={selection?.kind === "joint" && selection.index === 0}
          cx={layout.nodes[0].x}
          cy={layout.nodes[0].y}
          r={16 * k}
          stroke-width={1.5 * k}
          role="button"
          tabindex="0"
          aria-label="Salida de la bomba: accesorios"
          onclick={tap(() => onSelect({ kind: "joint", index: 0 }))}
          onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "joint", index: 0 })}
          oncontextmenu={(e) => openMenu(e, { kind: "joint", index: 0 })}
          onpointerdown={(e) => holdStart(e, { kind: "joint", index: 0 })}
        />

        <!-- Handles: tap selects, drag moves -->
        {#each layout.nodes as n, i (i)}
          {#if i > 0}
            <circle
              class="handle"
              class:active={dragging === i}
              cx={n.x}
              cy={n.y}
              r={22 * k}
              stroke-width={1.5 * k}
              role="slider"
              tabindex="0"
              aria-label={i === last ? "Pitón: tocar selecciona, arrastrar mueve" : `Acople ${i}: tocar muestra accesorios, arrastrar mueve`}
              aria-valuenow={n.elevationM}
              aria-valuetext={`${scenario.sections[i - 1].lengthM} m de largo, ${n.elevationM} m de altura`}
              onpointerdown={(e) => down(e, i)}
              onpointermove={move}
              onpointerup={up}
              onpointercancel={up}
              oncontextmenu={(e) => openMenu(e, nodeTarget(i))}
              onkeydown={(e) => keyMove(e, i)}
            />
            {#if dragging === i}
              <text class="drag-label" x={n.x} y={n.y + 40 * k}>{scenario.sections[i - 1].lengthM} m · {floorName(n.elevationM)}</text>
            {/if}
          {/if}
        {/each}

        <!-- Gauges above the line; tap one for its reading. The nozzle comes after, so its bale takes the tap. -->
        {#if showGauges}
          {#each layout.nodes as n, i (i)}
            <g class="gauge" transform={`translate(${gaugeAt(i).x} ${gaugeAt(i).y}) scale(${gaugeK})`}>
              <Gauge psi={n.pressurePsi} mark={i === last ? scenario.nozzle.ratedPressurePsi : undefined} />
              <circle
                class="gauge-hit"
                r="24"
                role="button"
                tabindex="0"
                aria-label={`Manómetro: ${n.pressurePsi.toFixed(0)} psi, ver lectura`}
                onclick={tap(() => (inspected = inspected === i ? null : i))}
                onkeydown={(e) => e.key === "Enter" && (inspected = i)}
              />
            </g>
          {/each}
        {/if}
        <!-- The nozzle above its handle and the gauges -->
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

      {#if selectedHose && dragging === null && !phone}
        {@const i = selectedHose.index}
        {@const s = scenario.sections[i]}
        {@const up = selectedHose.labelY * zoom + 34 + HOSE_BAR_PX > layout.heightPx * zoom}
        <div class="hose-bar" class:up style:left={`${selectedHose.labelX * zoom}px`} style:top={`${selectedHose.labelY * zoom + (up ? -26 : 34)}px`}>
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
        {@const up = selectedJoint.y * zoom + 40 + HOSE_BAR_PX > layout.heightPx * zoom}
        <div class="hose-bar joint-bar" class:up style:left={`${selectedJoint.x * zoom}px`} style:top={`${selectedJoint.y * zoom + (up ? -30 : 30)}px`}>
          <button type="button" class="bar-close" aria-label="Quitar selección (Esc)" title="Quitar selección (Esc)" onclick={onDeselect}>×</button>
          <JointControls {scenario} joint={selection.index} onToggle={(kind) => onToggleFitting(selection.index, kind)} />
          <Actions target={selection} {scenario} requiredPsi={result.requiredPumpPressurePsi} place="quick" {onAction} />
        </div>
      {/if}
      {#if inspected !== null && showGauges && inspected < layout.nodes.length}
        {@const i = inspected}
        {@const g = gaugeAt(i)}
        {@const friction = result.terms.find((t) => t.lawId === "hose.friction" && t.sectionIndex === i - 1)}
        <div class="reading" role="status" style:left={`${g.x * zoom}px`} style:top={`${(g.y - 30 * gaugeK) * zoom}px`}>
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
  <!-- Controls live below the drawing, never over it. -->
  <div class="toolbar">
  {#if missing.length > 0}
    <button type="button" class="missing-note" onclick={() => onSelect({ kind: "joint", index: missing[0].index })}>
      ⚠ Falta adaptador en {missing.map((j) => (j.index === 0 ? "la salida" : j.index === last ? "el pitón" : `acople ${j.index}`)).join(", ")}
    </button>
  {/if}
  {#if !phone}<span class="hint">Clic derecho o mantener pulsado: más opciones</span>{/if}
  <span class="badge">{Math.round(zoom * 100)} %{manualZoom === null ? " · auto" : ""}{trueScale ? "" : ` · grosor ×${EXAGGERATION}`}</span>
  <div class="zoom">
    <button type="button" aria-label="Alejar" onclick={() => setManualZoom(zoom / 1.25)}>−</button>
    <button type="button" aria-label="Acercar" onclick={() => setManualZoom(zoom * 1.25)}>+</button>
    <button type="button" onclick={() => (manualZoom = null)}>Ajustar</button>
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
  <ContextMenu target={menu.target} x={menu.x} y={menu.y} {scenario} requiredPsi={result.requiredPumpPressurePsi} {onAction} onClose={() => (menu = null)} />
{/if}

<style>
  .canvas { position: relative; background: var(--surface); border-radius: var(--radius); overflow: hidden; }
  .scroller { width: 100%; overflow: auto; transition: height 0.2s ease; touch-action: none; overscroll-behavior: contain; }
  .scroller.grabbing { cursor: grabbing; }
  .canvas.phone { height: 100%; display: flex; flex-direction: column; }
  .canvas.phone .scroller { flex: 1; min-height: 0; transition: none; }
  .canvas.phone .toolbar { padding: 6px 8px; }
  .stage { position: relative; }
  svg { display: block; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
  .band { fill: var(--band); }
  .ground { fill: var(--ground); }
  .floor { stroke: var(--line); stroke-dasharray: 4 4; }
  .ground-line { stroke: var(--ink); }
  .floor-label, .tag { font-size: calc(11px * var(--k)); fill: var(--muted); }
  .tag { text-anchor: middle; font-size: calc(12px * var(--k)); }
  .pump { cursor: pointer; outline: none; }
  .truck { fill: var(--pump); }
  .truck.selected, .pump:focus-visible .truck { stroke: var(--accent); stroke-width: calc(3px * var(--k)); }
  .window { fill: #f8d7d3; }
  .wheel { fill: var(--ink); }
  .outlet, .coupling { fill: var(--steel); }
  .fittings, .gauge { pointer-events: none; }
  .gauge-hit { fill: transparent; pointer-events: auto; cursor: pointer; outline: none; }
  .gauge-hit:focus-visible { stroke: var(--accent); stroke-width: 2; }
  .reading { position: absolute; transform: translate(-50%, -100%); z-index: 3; min-width: 200px; max-width: 260px; display: grid; gap: 2px; padding: 8px 34px 8px 10px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); font-size: 13px; color: var(--muted); }
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
  .missing text { fill: #fff; font-size: 14px; font-weight: 800; text-anchor: middle; }
  .hose { stroke: var(--hose); stroke-linecap: butt; fill: none; }
  .particles { fill: none; stroke: #fff; stroke-opacity: 0.85; stroke-linecap: round; stroke-dasharray: 0 var(--gap); animation: water var(--period) linear infinite; pointer-events: none; }
  @keyframes water { to { stroke-dashoffset: calc(-1 * var(--gap)); } }
  @media (prefers-reduced-motion: reduce) { .particles { animation: none; } }
  .hose-selected { fill: none; stroke: var(--accent); stroke-opacity: 0.35; stroke-linecap: round; pointer-events: none; }
  .hit { fill: none; stroke: transparent; cursor: pointer; outline: none; }
  .hit:focus-visible { stroke: var(--accent); stroke-opacity: 0.2; }
  .handle { fill: transparent; stroke: var(--ink); stroke-opacity: 0.3; stroke-dasharray: 3 3; cursor: grab; touch-action: none; outline: none; }
  .handle.active, .handle:focus-visible { stroke: var(--accent); stroke-opacity: 1; cursor: grabbing; }
  .drag-label { font-size: calc(13px * var(--k)); font-weight: 700; text-anchor: middle; fill: var(--accent); }
  .hose-bar.up { transform: translate(-50%, -100%); }
  .hose-bar { position: absolute; transform: translateX(-50%); display: grid; gap: 4px; justify-items: center; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 6px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); z-index: 2; }
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
</style>
