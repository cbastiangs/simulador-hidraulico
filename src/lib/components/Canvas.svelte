<script lang="ts">
  import { HOSE_SIZES } from "$hydraulics/references.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
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
  import Gauge from "./Gauge.svelte";
  import NozzleDrawing from "./NozzleDrawing.svelte";
  import { hoseVelocityMps } from "$hydraulics/velocity.ts";

  // The canvas (UX.md §2): one uniform scale, the lay auto-fitted to the
  // space available; gauges, labels, handles and the nozzle keep their screen
  // size at any zoom. A press that moves under 6 px is a tap (select; on the
  // nozzle, work the bale); more is a drag (move the coupling).
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
  }: {
    scenario: Scenario;
    result: SeriesResult;
    selection: Selection;
    floorM?: number;
    /** Changes when a new lay is loaded: auto-fit is restored. */
    resetKey: string;
    /** Lock or unlock the length of section `i` (UX.md §2). */
    onToggleLock: (i: number) => void;
    onSelect: (s: Selection) => void;
    /** Move the coupling at the end of a section to a horizontal run and height (edit.moveCoupling). */
    onMove: (sectionIndex: number, runM: number, elevationM: number) => void;
    onToggleNozzle: () => void;
    onHoseSize: (sectionIndex: number, hoseSizeId: string) => void;
    onLength: (sectionIndex: number, lengthM: number) => void;
  } = $props();

  const TAP_PX = 6;

  let viewWidth = $state(0);
  let viewHeight = $state(0);
  let windowHeight = $state(800);
  let windowWidth = $state(1200);
  let scroller: HTMLDivElement | undefined = $state();
  /** Below this the constant-size gauges crowd each other; the canvas scrolls sideways instead. */
  const MIN_FIT_ZOOM = 0.12;
  /** Height of the on-canvas hose toolbar, to open it upward when there is no room below. */
  const HOSE_BAR_PX = 180;
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
      // When the lay is wider than the canvas, start on the nozzle.
      requestAnimationFrame(() => {
        if (scroller) scroller.scrollLeft = scroller.scrollWidth;
      });
    }
  });

  const fitted = $derived(fitBounds(scenario.sections, floorM));
  // The canvas takes the height the window has (UX.md §2): the lay sits on the
  // ground at the bottom and the rest is building above it, so a rising hose
  // can be dragged up. Side by side, the page above the canvas is about 240 px.
  const canvasHeight = $derived(Math.max(260, windowWidth >= 1024 ? windowHeight - 240 : windowHeight * 0.55));
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
  const isSection = (i: number) => selection.kind === "section" && selection.index === i;
  const outletIn = $derived(scenario.source.outletSizeIn);
  const adapter = $derived(outletIn !== undefined && outletIn !== scenario.sections[0].diameterIn);

  function setManualZoom(z: number) {
    manualZoom = Math.min(3, Math.max(0.1, z));
  }

  function worldPoint(event: PointerEvent) {
    const rect = svg!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom };
  }

  function down(event: PointerEvent, node: number) {
    press = { node, x: event.clientX, y: event.clientY };
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent) {
    if (!press) return;
    if (dragging === null) {
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) < TAP_PX) return;
      dragging = press.node;
      frozen = { bounds: fitted, zoom };
      onSelect(dragging === last ? { kind: "nozzle" } : { kind: "section", index: dragging - 1 });
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
    if (press && dragging === null) {
      // A tap: select; on the nozzle, also work the bale.
      if (press.node === last) {
        onSelect({ kind: "nozzle" });
        onToggleNozzle();
      } else {
        onSelect({ kind: "section", index: press.node - 1 });
      }
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
    } else if (event.key === "Enter" && node === last) {
      onToggleNozzle();
    }
  }

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

  const selectedHose = $derived(selection.kind === "section" ? layout.hoses[selection.index] : undefined);
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<div class="canvas" style:--k={k}>
  <div class="scroller" style:height={`${canvasHeight}px`} bind:this={scroller} bind:clientWidth={viewWidth} bind:clientHeight={viewHeight}>
    <div class="stage" style:width={`${layout.widthPx * zoom}px`} style:height={`${layout.heightPx * zoom}px`}>
      <svg
        bind:this={svg}
        width={layout.widthPx * zoom}
        height={layout.heightPx * zoom}
        viewBox={`0 0 ${layout.widthPx} ${layout.heightPx}`}
        role="application"
        aria-label="Vista lateral de la línea"
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
          onclick={() => onSelect({ kind: "pump" })}
          onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "pump" })}
        >
          <rect class="truck" class:selected={selection.kind === "pump"} x={layout.xAt(-9.5)} y={layout.groundY - 3.2 * PX_PER_M} width={7 * PX_PER_M} height={2.6 * PX_PER_M} rx="5" />
          <rect class="window" x={layout.xAt(-8.9)} y={layout.groundY - 2.8 * PX_PER_M} width={1.6 * PX_PER_M} height={0.9 * PX_PER_M} rx="2" />
          <circle class="wheel" cx={layout.xAt(-8)} cy={layout.groundY - 0.5 * PX_PER_M} r={0.5 * PX_PER_M} />
          <circle class="wheel" cx={layout.xAt(-4)} cy={layout.groundY - 0.5 * PX_PER_M} r={0.5 * PX_PER_M} />
        </g>
        <rect class="outlet" x={layout.xAt(-2.5)} y={layout.nodes[0].y - 0.25 * PX_PER_M} width={layout.nodes[0].x - layout.xAt(-2.5)} height={0.5 * PX_PER_M} />
        {#if adapter}
          <path
            class="coupling"
            d={`M ${layout.nodes[0].x - 4 * k} ${layout.nodes[0].y - 9 * k} L ${layout.nodes[0].x + 6 * k} ${layout.nodes[0].y - 5 * k} L ${layout.nodes[0].x + 6 * k} ${layout.nodes[0].y + 5 * k} L ${layout.nodes[0].x - 4 * k} ${layout.nodes[0].y + 9 * k} Z`}
          >
            <title>Adaptador {sizeLabel(outletIn!)} → {sizeLabel(scenario.sections[0].diameterIn)}</title>
          </path>
        {/if}
        <text class="tag" x={layout.xAt(-5.75)} y={layout.groundY + 16 * k}>Bomba{outletIn ? ` · salida ${sizeLabel(outletIn)}` : ""}</text>

        <!-- Hoses -->
        {#each layout.hoses as h (h.index)}
          {@const s = scenario.sections[h.index]}
          {@const width = Math.max(h.thicknessPx, 3 * k)}
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
            onclick={() => onSelect({ kind: "section", index: h.index })}
            onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "section", index: h.index })}
          />
          <text class="tag" transform={`translate(${h.labelX} ${h.labelY + 22 * k}) rotate(${Math.abs(h.angle) > 60 ? 0 : h.angle})`}>
            {s.lengthFree ? "🔓" : "🔒"} {s.lengthM} m · {sizeLabel(s.diameterIn)}{h.slackM >= 0.5 ? ` · holgura ${h.slackM.toFixed(1)} m` : ""}
          </text>
        {/each}

        <!-- Couplings (and reducers where the size changes) -->
        {#each layout.nodes as n, i (i)}
          {#if i > 0 && i < last}
            <rect class="coupling" x={n.x - 3.5 * k} y={n.y - 9 * k} width={7 * k} height={18 * k} rx={1.5 * k} />
            {#if scenario.sections[i].diameterIn !== scenario.sections[i - 1].diameterIn}
              <path class="coupling" d={`M ${n.x + 3.5 * k} ${n.y - 8 * k} L ${n.x + 13 * k} ${n.y - 4 * k} L ${n.x + 13 * k} ${n.y + 4 * k} L ${n.x + 3.5 * k} ${n.y + 8 * k} Z`} />
            {/if}
          {/if}
        {/each}

        <g transform={`translate(${layout.nodes[last].x} ${layout.nodes[last].y}) scale(${k})`}>
          <NozzleDrawing
            nozzle={scenario.nozzle}
            flowGpm={result.flowGpm}
            x={0}
            y={0}
            selected={selection.kind === "nozzle"}
            onToggle={onToggleNozzle}
          />
        </g>

        <!-- Handles: tap to select (the nozzle's also works the bale), drag to move -->
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
              aria-label={i === last ? "Pitón: tocar abre o cierra, arrastrar mueve" : `Acople ${i}`}
              aria-valuenow={n.elevationM}
              aria-valuetext={`${scenario.sections[i - 1].lengthM} m de largo, ${n.elevationM} m de altura`}
              onpointerdown={(e) => down(e, i)}
              onpointermove={move}
              onpointerup={up}
              onpointercancel={up}
              onkeydown={(e) => keyMove(e, i)}
            />
            {#if dragging === i}
              <text class="drag-label" x={n.x} y={n.y + 40 * k}>{scenario.sections[i - 1].lengthM} m · {n.elevationM} m</text>
            {/if}
          {/if}
        {/each}

        <!-- Gauges last, so they sit above everything -->
        {#each layout.nodes as n, i (i)}
          <g transform={`translate(${i === 0 ? layout.xAt(-1.5) : n.x} ${(i === 0 ? layout.groundY - 4.6 * PX_PER_M : n.y) - (i === 0 ? 0 : 72 * k)}) scale(${k})`}>
            <Gauge psi={n.pressurePsi} />
          </g>
        {/each}
      </svg>

      {#if selectedHose && dragging === null}
        {@const i = selectedHose.index}
        {@const s = scenario.sections[i]}
        {@const up = selectedHose.labelY * zoom + 34 + HOSE_BAR_PX > layout.heightPx * zoom}
        <div class="hose-bar" class:up style:left={`${selectedHose.labelX * zoom}px`} style:top={`${selectedHose.labelY * zoom + (up ? -26 : 34)}px`}>
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
        </div>
      {/if}
    </div>
  </div>
  <!-- Controls live below the drawing, never over it. -->
  <div class="toolbar">
  <span class="badge">1:1 · {Math.round(zoom * 100)} %{manualZoom === null ? " · auto" : ""}</span>
  <div class="zoom">
    <button type="button" aria-label="Alejar" onclick={() => setManualZoom(zoom / 1.25)}>−</button>
    <button type="button" aria-label="Acercar" onclick={() => setManualZoom(zoom * 1.25)}>+</button>
    <button type="button" onclick={() => (manualZoom = null)}>Ajustar</button>
  </div>
  </div>
</div>

<style>
  .canvas { position: relative; background: var(--surface); border-radius: var(--radius); overflow: hidden; }
  .scroller { width: 100%; overflow: auto; transition: height 0.2s ease; }
  .stage { position: relative; }
  svg { display: block; user-select: none; }
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
  .chips .on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .len { font-weight: 700; min-width: 3.5rem; text-align: center; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px 10px; border-top: 1px solid var(--line); }
  .badge { font-size: 12px; color: var(--muted); margin-left: auto; }
  .lock.on { background: var(--surface); border-color: var(--accent); }
  .zoom { display: flex; gap: 4px; }
  .zoom button { min-width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
</style>
