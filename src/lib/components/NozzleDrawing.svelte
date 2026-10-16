<script lang="ts">
  import { Tween } from "svelte/motion";
  import type { ScenarioNozzle } from "$hydraulics/scenario.ts";

  // The nozzle on the canvas (UX.md §3): bale lever, gallonage ring, pattern
  // collar and stream. Tapping the bale opens or shuts it. The stream's length
  // is illustrative (it grows with flow); real reach needs manufacturer data
  // (MODEL.md §6), so no distance is claimed.
  let {
    nozzle,
    flowGpm,
    x,
    y,
    selected,
    onToggle,
  }: {
    nozzle: ScenarioNozzle;
    flowGpm: number;
    x: number;
    y: number;
    selected: boolean;
    onToggle: () => void;
  } = $props();

  const bale = Tween.of(() => (nozzle.open ? -62 : 8), { duration: 220 });
  const flow = Tween.of(() => Math.min(flowGpm / nozzle.ratedFlowGpm, 1.3), { duration: 300 });
  const pattern = Tween.of(() => nozzle.pattern, { duration: 200 });

  const stream = $derived.by(() => {
    const halfAngle = ((4 + pattern.current * 41) * Math.PI) / 180;
    const length = 140 * (1 - 0.45 * pattern.current) * flow.current;
    const dy = Math.tan(halfAngle) * length;
    return { length, dy, core: dy * 0.35 };
  });
</script>

<g transform={`translate(${x} ${y})`}>
  {#if selected}<rect class="selection" x="-10" y="-34" width="80" height="54" rx="8" />{/if}
  {#if stream.length > 1}
    <path class="spray" d={`M 50 0 L ${50 + stream.length} ${-stream.dy} L ${50 + stream.length} ${stream.dy} Z`} />
    <path class="core" d={`M 50 0 L ${50 + stream.length} ${-stream.core} L ${50 + stream.length} ${stream.core} Z`} />
  {/if}
  <path class="body" d="M 0 -7 L 22 -9 L 22 9 L 0 7 Z" />
  <rect class="ring" x="22" y="-11" width="10" height="22" rx="2" />
  {#if nozzle.kind === "selectable"}<text class="ring-label" x="27" y="-15">{nozzle.ratedFlowGpm}</text>{/if}
  <rect class="collar" x="32" y="-12" width="18" height="24" rx="3" />
  <!-- The bale: tap to open or shut. -->
  <g
    class="bale"
    role="switch"
    tabindex="0"
    aria-checked={nozzle.open}
    aria-label={nozzle.open ? "Manija abierta: tocar para cerrar" : "Manija cerrada: tocar para abrir"}
    onclick={onToggle}
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onToggle())}
  >
    <circle class="hit" cx="10" cy="-32" r="22" />
    <g transform={`rotate(${bale.current} 10 -6)`}>
      <line class="lever" x1="10" y1="-6" x2="10" y2="-30" />
      <circle class="knob" cx="10" cy="-30" r="4" />
    </g>
  </g>
</g>

<style>
  /* Only the bale takes pointer input; the rest lets drags reach the coupling handle beneath. */
  .selection, .spray, .core, .body, .ring, .ring-label, .collar { pointer-events: none; }
  .selection { fill: none; stroke: var(--accent); stroke-width: 2; stroke-dasharray: 5 4; }
  .spray { fill: var(--water-soft); opacity: 0.8; }
  .core { fill: var(--water); opacity: 0.6; }
  .body { fill: var(--ink); }
  .ring { fill: var(--steel); }
  .ring-label { font-size: 10px; font-weight: 700; text-anchor: middle; fill: var(--ink); }
  .collar { fill: var(--water); }
  .lever { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
  .knob { fill: var(--ink); }
  .bale { cursor: pointer; outline: none; }
  .bale:focus-visible .lever { stroke: var(--accent); }
  .hit { fill: transparent; }
</style>
