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
    onGrab,
    color = null,
  }: {
    nozzle: ScenarioNozzle;
    flowGpm: number;
    x: number;
    y: number;
    selected: boolean;
    onToggle: () => void;
    /** A press on the nozzle's body: the canvas drags it like its coupling handle. */
    onGrab?: (e: PointerEvent) => void;
    /** The line's colour on a branched lay (line-colors.ts): a band at the inlet, like tape on a coupling. */
    color?: string | null;
  } = $props();

  // Fog: body, gallonage ring, pattern collar. Smooth bore: shutoff and a
  // tapered tip, a solid stream. Open end: only the coupling; the stream
  // leaves as wide as the bore and spreads ragged (MODEL.md §3.4d). Lengths
  // stay illustrative.
  const design = $derived(nozzle.design ?? "fog");
  const bale = Tween.of(() => (nozzle.open ? -62 : 8), { duration: 220 });
  // An open end has no rating; its stream grows with flow against a typical handline flow.
  const flow = Tween.of(() => Math.min(flowGpm / (design === "open-end" ? 250 : nozzle.ratedFlowGpm), 1.3), { duration: 300 });
  const pattern = Tween.of(() => (design === "fog" ? nozzle.pattern : 0), { duration: 200 });
  /** Where the water leaves the drawing, and how wide it is there. */
  const exit = $derived(design === "open-end" ? { x: 6, half: 6 } : design === "smooth-bore" ? { x: 44, half: 3 } : { x: 50, half: 0 });

  const stream = $derived.by(() => {
    const spread = design === "open-end" ? 7 : 4 + pattern.current * 41;
    const halfAngle = (spread * Math.PI) / 180;
    const length = (design === "open-end" ? 90 : 140) * (1 - 0.45 * pattern.current) * flow.current;
    const dy = exit.half + Math.tan(halfAngle) * length;
    return { length, dy, core: exit.half * 0.6 + (dy - exit.half) * 0.35 };
  });
</script>

<g transform={`translate(${x} ${y})`}>
  {#if selected}<rect class="selection" x="-10" y="-34" width="80" height="54" rx="8" />{/if}
  {#if stream.length > 1}
    {@const x0 = exit.x}
    {@const x1 = exit.x + stream.length}
    <path class="spray" class:solid={design !== "fog"} d={`M ${x0} ${-exit.half} L ${x1} ${-stream.dy} L ${x1} ${stream.dy} L ${x0} ${exit.half} Z`} />
    <path class="core" d={`M ${x0} ${-exit.half * 0.6} L ${x1} ${-stream.core} L ${x1} ${stream.core} L ${x0} ${exit.half * 0.6} Z`} />
  {/if}
  {#if design === "open-end"}
    <!-- Only the hose's own coupling. -->
    <rect class="ring" x="-2" y="-10" width="8" height="20" rx="2" />
    {#if color}<rect class="band" x="-8" y="-9" width="6" height="18" rx="2" fill={color} />{/if}
  {:else}
    <path class="body" d="M 0 -7 L 22 -9 L 22 9 L 0 7 Z" />
    {#if color}<rect class="band" x="-1" y="-10" width="7" height="20" rx="2" fill={color} />{/if}
    {#if design === "smooth-bore"}
      <!-- The stacked tip: a cone narrowing to the bore. -->
      <path class="tip" d="M 22 -9 L 44 -3.5 L 44 3.5 L 22 9 Z" />
    {:else}
      <rect class="ring" x="22" y="-11" width="10" height="22" rx="2" />
      {#if nozzle.kind === "selectable"}<text class="ring-label" x="27" y="-15">{nozzle.ratedFlowGpm}</text>{/if}
      <rect class="collar" x="32" y="-12" width="18" height="24" rx="3" />
    {/if}
  {/if}
  <!-- The whole body drags (owner, 2026-10-17); the bale above it still takes its tap. Pointer only: the coupling handle is the keyboard slider. -->
  {#if onGrab}<rect class="grab" role="presentation" x="-12" y="-14" width={design === "open-end" ? 32 : 64} height="28" rx="6" onpointerdown={onGrab} />{/if}
  <!-- The bale: tap to open or shut. An open end has none. -->
  {#if design !== "open-end"}
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
  {/if}
</g>

<style>
  /* Only the bale takes pointer input; the rest lets drags reach the coupling handle beneath. */
  .selection, .spray, .core, .body, .ring, .ring-label, .collar, .tip { pointer-events: none; }
  .tip { fill: var(--steel); }
  .spray.solid { fill: var(--water); opacity: 0.45; }
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
  .grab { fill: transparent; cursor: grab; touch-action: none; }
  .band { stroke: var(--surface); stroke-width: 1.5; pointer-events: none; }
</style>
