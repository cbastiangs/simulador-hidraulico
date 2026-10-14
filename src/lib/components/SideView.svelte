<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import { layoutProfile, snapM, type ElevationRange } from "$lib/geometry/profile.ts";
  import type { Selection } from "$lib/selection.ts";
  import Gauge from "./Gauge.svelte";

  let {
    scenario,
    result,
    floorHeightM = 3,
    selection,
    onSelect,
    onElevationChange,
    onToggleNozzle,
  }: {
    scenario: Scenario;
    result: SeriesResult;
    floorHeightM?: number;
    selection: Selection;
    onSelect: (selection: Selection) => void;
    onElevationChange: (sectionIndex: number, endElevationM: number) => void;
    onToggleNozzle: () => void;
  } = $props();

  const isSelectedSection = (i: number) => selection.kind === "section" && selection.index === i;

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
    onSelect(node === layout.nodes.length - 1 ? { kind: "nozzle" } : { kind: "section", index: node - 1 });
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
      {@const i = hose.sectionIndex}
      <line
        class="hose"
        class:selected={isSelectedSection(i)}
        x1={hose.x1}
        y1={hose.y1}
        x2={hose.x2}
        y2={hose.y2}
        stroke-width={hose.strokePx}
      />
      <!-- A wide invisible stroke makes the hose easy to tap. -->
      <line
        class="hit"
        x1={hose.x1}
        y1={hose.y1}
        x2={hose.x2}
        y2={hose.y2}
        role="button"
        tabindex="0"
        aria-label={`Tramo ${i + 1}`}
        onclick={() => onSelect({ kind: "section", index: i })}
        onkeydown={(e) => e.key === "Enter" && onSelect({ kind: "section", index: i })}
      />
      <text class="tag" x={(hose.x1 + hose.x2) / 2} y={(hose.y1 + hose.y2) / 2 + 22}>
        {scenario.sections[i].lengthM} m · {scenario.sections[i].hoseSizeId ?? `${scenario.sections[i].diameterIn}"`}
      </text>
      {#if i > 0 && scenario.sections[i].diameterIn !== scenario.sections[i - 1].diameterIn}
        <rect class="reducer" x={hose.x1 - 6} y={hose.y1 - 10} width="12" height="20" rx="2">
          <title>Reducción</title>
        </rect>
      {/if}
    {/each}

    {#each layout.nodes as node, i (i)}
      {#if i === 0}
        <rect class="pump" x={node.x - 14} y={node.y - 14} width="28" height="28" rx="4" />
        <text class="tag" x={node.x} y={node.y + 30}>Bomba</text>
      {:else}
        <circle
          class="handle"
          class:active={dragging === i}
          class:selected={i === layout.nodes.length - 1 ? selection.kind === "nozzle" : isSelectedSection(i - 1)}
          cx={node.x}
          cy={node.y}
          r="12"
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
          {@const open = scenario.nozzle.open}
          <!-- Tapping the nozzle works its bale: open or shut. -->
          <g
            class="nozzle"
            class:open
            role="switch"
            tabindex="0"
            aria-checked={open}
            aria-label="Pitón: tocar para abrir o cerrar"
            onclick={onToggleNozzle}
            onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onToggleNozzle())}
          >
            <rect class="nozzle-hit" x={node.x + 8} y={node.y - 18} width="56" height="36" />
            <path class="nozzle-body" d={`M ${node.x + 10} ${node.y - 7} L ${node.x + 30} ${node.y - 4} L ${node.x + 30} ${node.y + 4} L ${node.x + 10} ${node.y + 7} Z`} />
            {#if open}
              {#each [-12, -6, 0, 6, 12] as spread (spread)}
                <line class="spray" x1={node.x + 32} y1={node.y} x2={node.x + 58} y2={node.y + spread} />
              {/each}
            {/if}
          </g>
          <text class="tag" x={node.x + 20} y={node.y + 30}>{open ? "Pitón abierto" : "Pitón cerrado"}</text>
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
  .hose.selected { stroke: var(--accent); }
  .hit { stroke: transparent; stroke-width: 28; cursor: pointer; }
  .hit:focus-visible { stroke: var(--accent); stroke-opacity: 0.25; outline: none; }
  .reducer { fill: var(--ink); }
  .nozzle { cursor: pointer; }
  .nozzle:focus-visible { outline: none; }
  .nozzle:focus-visible .nozzle-body { stroke: var(--accent); stroke-width: 3; }
  .nozzle-hit { fill: transparent; }
  .nozzle-body { fill: var(--ink); }
  .spray { stroke: var(--water); stroke-width: 2; stroke-linecap: round; }
  .pump { fill: var(--pump); }
  .handle { fill: var(--surface); stroke: var(--ink); stroke-width: 2; cursor: ns-resize; }
  .handle.active, .handle.selected, .handle:focus-visible { stroke: var(--accent); stroke-width: 3; outline: none; }
  .tag { font-size: 11px; text-anchor: middle; fill: var(--muted); }
</style>
