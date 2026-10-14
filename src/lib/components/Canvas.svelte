<script lang="ts">
  import { untrack } from "svelte";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import {
    VERTICAL_EXAGGERATION,
    SCALE,
    fillViewport,
    fitBounds,
    growBounds,
    layoutWorld,
    snapHeightM,
    snapLengthM,
    type Bounds,
  } from "$lib/geometry/world.ts";
  import type { Selection } from "$lib/selection.ts";
  import Gauge from "./Gauge.svelte";
  import NozzleDrawing from "./NozzleDrawing.svelte";

  // The canvas (UX.md §2): fixed scales, bounds that grow but never shrink
  // while editing, zoom only by the person. Drag a coupling sideways for the
  // length of the section ending there, up or down for its height.
  let {
    scenario,
    result,
    selection,
    floorM = 3,
    resetKey,
    onSelect,
    onLength,
    onElevation,
    onToggleNozzle,
  }: {
    scenario: Scenario;
    result: SeriesResult;
    selection: Selection;
    floorM?: number;
    /** Changes when a new lay is loaded: the world is refitted to it. */
    resetKey: string;
    onSelect: (s: Selection) => void;
    onLength: (sectionIndex: number, lengthM: number) => void;
    onElevation: (sectionIndex: number, elevationM: number) => void;
    onToggleNozzle: () => void;
  } = $props();

  let zoom = $state(1);
  let viewWidth = $state(0);
  let viewHeight = $state(0);
  let scroller: HTMLDivElement | undefined = $state();
  let svg: SVGSVGElement | undefined = $state();
  let dragging: number | null = $state(null);
  // The world starts fitted to the first lay; afterwards the effect below owns it.
  let bounds: Bounds = $state(untrack(() => fitBounds(scenario.sections, floorM)));
  let lastReset = untrack(() => resetKey);

  // A new lay refits the world; edits only grow it, and not while dragging,
  // because growing the top would move the same pointer position higher.
  // `bounds` is read untracked and written only when it changes, so the
  // effect can't retrigger itself.
  $effect(() => {
    const sections = scenario.sections;
    const reset = resetKey !== lastReset;
    if (!reset && dragging !== null) return;
    lastReset = resetKey;
    const current = untrack(() => bounds);
    const next = reset ? fitBounds(sections, floorM) : growBounds(current, sections, floorM);
    if (Object.entries(next).some(([k, v]) => current[k as keyof Bounds] !== v)) bounds = next;
  });

  const layout = $derived(
    layoutWorld(
      scenario.sections,
      result.nodes.map((n) => n.pressurePsi),
      fillViewport(bounds, viewWidth, viewHeight, zoom),
      floorM,
    ),
  );
  const last = $derived(layout.nodes.length - 1);
  const isSection = (i: number) => selection.kind === "section" && selection.index === i;

  function setZoom(z: number) {
    zoom = Math.min(2.5, Math.max(0.4, z));
  }

  function fit() {
    bounds = fitBounds(scenario.sections, floorM);
    if (scroller) setZoom(Math.min(1, Math.max(0.6, scroller.clientWidth / layout.widthPx)));
  }

  function worldPoint(event: PointerEvent) {
    const rect = svg!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom };
  }

  function startDrag(event: PointerEvent, node: number) {
    onSelect(node === last ? { kind: "nozzle" } : { kind: "section", index: node - 1 });
    dragging = node;
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent) {
    if (dragging === null) return;
    const i = dragging - 1;
    const p = worldPoint(event);
    const start = layout.nodes[i].distanceM;
    const length = snapLengthM(layout.distanceAt(p.x) - start);
    const height = snapHeightM(Math.min(bounds.maxY, Math.max(bounds.minY, layout.elevationAt(p.y))), floorM);
    if (length !== scenario.sections[i].lengthM) onLength(i, length);
    if (height !== scenario.sections[i].endElevationM) onElevation(i, height);
  }

  function endDrag() {
    dragging = null;
  }

  function keyMove(event: KeyboardEvent, node: number) {
    const i = node - 1;
    const s = scenario.sections[i];
    const moves: Record<string, () => void> = {
      ArrowUp: () => onElevation(i, s.endElevationM + 0.5),
      ArrowDown: () => onElevation(i, s.endElevationM - 0.5),
      ArrowRight: () => onLength(i, s.lengthM + 1),
      ArrowLeft: () => onLength(i, Math.max(1, s.lengthM - 1)),
    };
    if (moves[event.key]) {
      event.preventDefault();
      moves[event.key]();
    }
  }

  const angleOf = (h: { x1: number; y1: number; x2: number; y2: number }) =>
    (Math.atan2(h.y2 - h.y1, h.x2 - h.x1) * 180) / Math.PI;
  const sizeLabel = (d: number) => `${d.toString().replace(".5", "½").replace(".75", "¾")}″`;
</script>

<div class="canvas">
  <div
    class="scroller"
    bind:this={scroller}
    bind:clientWidth={viewWidth}
    bind:clientHeight={viewHeight}
    onwheel={(e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
    }}
  >
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
          <rect class="band" x="0" y={f.y} width={layout.widthPx} height={floorM * SCALE.yPxPerM} />
        {/if}
      {/each}
      <rect class="ground" x="0" y={layout.groundY} width={layout.widthPx} height={layout.heightPx - layout.groundY} />
      {#each layout.floors as f (f.elevationM)}
        {#if f.number > 0}
          <line class="floor" x1="0" x2={layout.widthPx} y1={f.y} y2={f.y} />
          <text class="floor-label" x={layout.xAt(0) + 6} y={f.y + 14}>Piso {f.number} · {f.elevationM} m</text>
        {/if}
      {/each}
      <line class="ground-line" x1="0" x2={layout.widthPx} y1={layout.groundY} y2={layout.groundY} />
      <text class="floor-label" x={layout.xAt(0) + 6} y={layout.groundY + 40}>Planta baja · 0 m</text>

      <!-- Scale bar: 10 m -->
      <g transform={`translate(16 ${layout.heightPx - 16})`}>
        <line class="scale" x1="0" x2={10 * SCALE.xPxPerM} y1="0" y2="0" />
        <line class="scale" x1="0" x2="0" y1="-4" y2="4" />
        <line class="scale" x1={10 * SCALE.xPxPerM} x2={10 * SCALE.xPxPerM} y1="-4" y2="4" />
        <text class="floor-label" x={10 * SCALE.xPxPerM + 8} y="4">10 m</text>
      </g>

      <!-- Engine -->
      <g transform={`translate(${layout.xAt(-9.5)} ${layout.groundY - 46})`}>
        <rect class="truck" width="58" height="38" rx="5" />
        <rect class="window" x="6" y="6" width="18" height="12" rx="2" />
        <circle class="wheel" cx="12" cy="40" r="6" /><circle class="wheel" cx="46" cy="40" r="6" />
        <rect class="outlet" x="58" y="26" width={layout.nodes[0].x - layout.xAt(-9.5) - 58} height="7" />
      </g>
      <text class="tag" x={layout.xAt(-5)} y={layout.groundY + 22}>Bomba</text>

      <!-- Hoses -->
      {#each layout.hoses as h (h.index)}
        {@const s = scenario.sections[h.index]}
        {@const mid = { x: (h.x1 + h.x2) / 2, y: (h.y1 + h.y2) / 2 }}
        <line class="hose" x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} stroke-width={h.thicknessPx} />
        {#if isSection(h.index)}
          <line class="hose-selected" x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} stroke-width={h.thicknessPx + 6} />
        {/if}
        <line
          class="hit"
          x1={h.x1}
          y1={h.y1}
          x2={h.x2}
          y2={h.y2}
          role="button"
          tabindex="0"
          aria-label={`Tramo ${h.index + 1}: ${s.lengthM} m de ${sizeLabel(s.diameterIn)}`}
          onclick={() => onSelect({ kind: "section", index: h.index })}
          onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "section", index: h.index })}
        />
        <text class="tag" transform={`translate(${mid.x} ${mid.y + 22}) rotate(${angleOf(h)})`}>
          {s.lengthM} m · {sizeLabel(s.diameterIn)}
        </text>
      {/each}

      <!-- Couplings (and reducers where the size changes) with their drag handles -->
      {#each layout.nodes as n, i (i)}
        {#if i > 0 && i < last}
          <rect class="coupling" x={n.x - 3.5} y={n.y - 9} width="7" height="18" rx="1.5" />
          {#if scenario.sections[i].diameterIn !== scenario.sections[i - 1].diameterIn}
            <path class="coupling" d={`M ${n.x + 3.5} ${n.y - 8} L ${n.x + 13} ${n.y - 4} L ${n.x + 13} ${n.y + 4} L ${n.x + 3.5} ${n.y + 8} Z`} />
          {/if}
        {/if}
        {#if i > 0}
          <circle
            class="handle"
            class:active={dragging === i}
            cx={n.x}
            cy={n.y}
            r="22"
            role="slider"
            tabindex="0"
            aria-label={i === last ? "Posición del pitón" : `Acople ${i}`}
            aria-valuenow={n.elevationM}
            aria-valuetext={`${scenario.sections[i - 1].lengthM} m de largo, ${n.elevationM} m de altura`}
            onpointerdown={(e) => startDrag(e, i)}
            onpointermove={drag}
            onpointerup={endDrag}
            onpointercancel={endDrag}
            onkeydown={(e) => keyMove(e, i)}
          />
          {#if dragging === i}
            <text class="drag-label" x={n.x} y={n.y + 40}>{scenario.sections[i - 1].lengthM} m · {n.elevationM} m</text>
          {/if}
        {/if}
      {/each}

      <NozzleDrawing
        nozzle={scenario.nozzle}
        flowGpm={result.flowGpm}
        x={layout.nodes[last].x}
        y={layout.nodes[last].y}
        selected={selection.kind === "nozzle"}
        onToggle={onToggleNozzle}
      />

      <!-- Gauges last, so they sit above everything -->
      {#each layout.nodes as n, i (i)}
        <Gauge psi={n.pressurePsi} x={i === 0 ? layout.xAt(-5) : n.x} y={(i === 0 ? layout.groundY - 112 : n.y - 72)} />
      {/each}
    </svg>
  </div>
  <span class="badge">Escala vertical ×{VERTICAL_EXAGGERATION} · {Math.round(zoom * 100)} %</span>
  <div class="zoom">
    <button type="button" aria-label="Alejar" onclick={() => setZoom(zoom / 1.25)}>−</button>
    <button type="button" aria-label="Acercar" onclick={() => setZoom(zoom * 1.25)}>+</button>
    <button type="button" onclick={fit}>Ajustar</button>
  </div>
</div>

<style>
  .canvas { position: relative; background: var(--surface); border-radius: var(--radius); overflow: hidden; height: 100%; min-height: 360px; }
  .scroller { width: 100%; height: 100%; overflow: auto; }
  svg { display: block; user-select: none; }
  .band { fill: var(--band); }
  .ground { fill: var(--ground); }
  .floor { stroke: var(--line); stroke-dasharray: 4 4; }
  .ground-line { stroke: var(--ink); stroke-width: 1.5; }
  .floor-label, .tag { font-size: 11px; fill: var(--muted); }
  .tag { text-anchor: middle; font-size: 12px; }
  .scale { stroke: var(--ink); stroke-width: 2; }
  .truck { fill: var(--pump); }
  .window { fill: #f8d7d3; }
  .wheel { fill: var(--ink); }
  .outlet, .coupling { fill: var(--steel); }
  .hose { stroke: var(--hose); stroke-linecap: butt; }
  .hose-selected { stroke: var(--accent); stroke-opacity: 0.35; stroke-linecap: round; pointer-events: none; }
  .hit { stroke: transparent; stroke-width: 30; cursor: pointer; outline: none; }
  .hit:focus-visible { stroke: var(--accent); stroke-opacity: 0.2; }
  .handle { fill: transparent; stroke: var(--ink); stroke-opacity: 0.3; stroke-width: 1.5; stroke-dasharray: 3 3; cursor: grab; touch-action: none; outline: none; }
  .handle.active, .handle:focus-visible { stroke: var(--accent); stroke-opacity: 1; stroke-width: 2; cursor: grabbing; }
  .drag-label { font-size: 13px; font-weight: 700; text-anchor: middle; fill: var(--accent); }
  .badge { position: absolute; right: 10px; top: 10px; font-size: 12px; color: var(--muted); background: var(--band); border-radius: 6px; padding: 4px 8px; pointer-events: none; }
  .zoom { position: absolute; right: 10px; bottom: 10px; display: flex; gap: 4px; }
  .zoom button { min-width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
</style>
