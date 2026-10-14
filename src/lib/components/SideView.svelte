<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import { layoutProfile, snapM, type ElevationRange } from "$lib/geometry/profile.ts";
  import Gauge from "./Gauge.svelte";

  let {
    scenario,
    result,
    floorHeightM = 3,
    onElevationChange,
  }: {
    scenario: Scenario;
    result: SeriesResult;
    floorHeightM?: number;
    onElevationChange: (sectionIndex: number, endElevationM: number) => void;
  } = $props();

  const height = 340;
  let width = $state(640);
  let svg: SVGSVGElement | undefined = $state();

  // Dragging a coupling (node i ≥ 1) sets the height of section i − 1's downstream end.
  // The height scale is frozen for the whole drag (geometry/profile.ts says why).
  let dragging: number | null = $state(null);
  let frozenRange: ElevationRange | undefined = $state();

  const layout = $derived(
    layoutProfile({
      sections: scenario.sections,
      pressuresPsi: result.nodes.map((n) => n.pressurePsi),
      width,
      height,
      floorHeightM,
      range: frozenRange,
    }),
  );

  function svgY(event: PointerEvent) {
    const rect = svg!.getBoundingClientRect();
    return ((event.clientY - rect.top) / rect.height) * height;
  }

  function start(event: PointerEvent, node: number) {
    dragging = node;
    frozenRange = layout.range;
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent) {
    if (dragging === null) return;
    // Clamped to the frozen range; the scale refits (and grows) on release.
    const { low, high } = layout.range;
    const elevation = snapM(Math.min(high, Math.max(low, layout.elevationAt(svgY(event)))));
    if (elevation !== scenario.sections[dragging - 1].endElevationM) onElevationChange(dragging - 1, elevation);
  }

  function end() {
    dragging = null;
    frozenRange = undefined;
  }

  function keyStep(event: KeyboardEvent, node: number) {
    const step = event.key === "ArrowUp" ? 0.5 : event.key === "ArrowDown" ? -0.5 : 0;
    if (!step) return;
    event.preventDefault();
    onElevationChange(node - 1, scenario.sections[node - 1].endElevationM + step);
  }
</script>

<div class="frame" bind:clientWidth={width}>
  <svg bind:this={svg} viewBox={`0 0 ${width} ${height}`} {height} role="img" aria-label="Vista lateral de la línea">
    {#each layout.floors as floor (floor.elevationM)}
      <line class="floor" class:ground={floor.elevationM === 0} x1="0" x2={width} y1={floor.y} y2={floor.y} />
      <text class="floor-label" x="4" y={floor.y - 3}>{floor.elevationM} m</text>
    {/each}

    {#each layout.hoses as hose (hose.sectionIndex)}
      <line class="hose" x1={hose.x1} y1={hose.y1} x2={hose.x2} y2={hose.y2} stroke-width={hose.strokePx} />
    {/each}

    {#each layout.nodes as node, i (i)}
      {#if i === 0}
        <rect class="pump" x={node.x - 14} y={node.y - 14} width="28" height="28" rx="4" />
        <text class="tag" x={node.x} y={node.y + 30}>Bomba</text>
      {:else}
        <circle
          class="handle"
          class:active={dragging === i}
          cx={node.x}
          cy={node.y}
          r="9"
          role="slider"
          tabindex="0"
          aria-label={i === layout.nodes.length - 1 ? "Altura del pitón" : `Altura del acople ${i}`}
          aria-valuenow={node.elevationM}
          aria-valuetext={`${node.elevationM} m`}
          onpointerdown={(e) => start(e, i)}
          onpointermove={move}
          onpointerup={end}
          onpointercancel={end}
          onkeydown={(e) => keyStep(e, i)}
        />
        {#if i === layout.nodes.length - 1}
          <text class="tag" x={node.x} y={node.y + 30}>Pitón</text>
        {/if}
      {/if}
      <Gauge psi={node.pressurePsi} x={node.x} y={node.y - 40} />
    {/each}
  </svg>
</div>

<style>
  .frame { width: 100%; touch-action: none; }
  svg { display: block; width: 100%; user-select: none; }
  .floor { stroke: var(--grid); stroke-dasharray: 4 4; }
  .floor.ground { stroke: var(--ink); stroke-dasharray: none; }
  .floor-label { font-size: 10px; fill: var(--muted); }
  .hose { stroke: var(--hose); stroke-linecap: round; }
  .pump { fill: var(--pump); }
  .handle { fill: var(--surface); stroke: var(--ink); stroke-width: 2; cursor: ns-resize; }
  .handle.active, .handle:focus-visible { stroke: var(--accent); stroke-width: 3; outline: none; }
  .tag { font-size: 11px; text-anchor: middle; fill: var(--muted); }
</style>
