<script lang="ts">
  import { Tween } from "svelte/motion";
  import type { ScenarioNozzle } from "$hydraulics/scenario.ts";
  import { anatomyOf } from "$lib/nozzle-anatomy.ts";

  // The nozzle on the canvas (UX.md §3): drawn from its model's anatomy
  // (nozzle-anatomy.ts) — the shutoff it really has (bale, slide or ball), its
  // pistol grip, gallonage ring, pressure ring, pattern collar and teeth. The
  // stream's length is illustrative (it grows with flow); real reach needs
  // manufacturer data (MODEL.md §6), so no distance is claimed.
  let {
    nozzle,
    flowGpm,
    x,
    y,
    selected,
    onToggle,
    onGrab,
    color = null,
    small = false,
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
    /** Drawn too small to aim a finger at: on touch screens the bale is drawing only (UX.md §8.1). */
    small?: boolean;
  } = $props();

  const design = $derived(nozzle.design ?? "fog");
  const anatomy = $derived(anatomyOf(nozzle));
  const fog = $derived(design !== "open-end" && design !== "smooth-bore");
  // One 0 → 1 tween; each shutoff reads its own motion out of it.
  const motion = Tween.of(() => (nozzle.open ? 1 : 0), { duration: 220 });
  // An open end has no rating; its stream grows with flow against a typical handline flow.
  const flow = Tween.of(() => Math.min(flowGpm / (design === "open-end" ? 250 : nozzle.ratedFlowGpm), 1.3), { duration: 300 });
  const pattern = Tween.of(() => (fog && anatomy.pattern ? nozzle.pattern : 0), { duration: 200 });

  // Stations along the axis, hose at 0: valve body to 22, the gallonage ring
  // (or a plain barrel when the model has none), then the collar.
  const ringEnd = $derived(anatomy.flow === "ring" ? 32 : 22);
  const barrelEnd = $derived(anatomy.flow === "ring" ? ringEnd : ringEnd + 14);
  const collarEnd = $derived(anatomy.pattern ? barrelEnd + 18 : barrelEnd + 2);
  /** Where the water leaves the drawing, and how wide it is there. */
  const exit = $derived(
    design === "open-end" ? { x: 6, half: 6 } : design === "smooth-bore" ? { x: 44, half: 3 } : { x: collarEnd, half: 0 },
  );

  const stream = $derived.by(() => {
    const spread = design === "open-end" ? 7 : 4 + pattern.current * 41;
    const halfAngle = (spread * Math.PI) / 180;
    const length = (design === "open-end" ? 90 : 140) * (1 - 0.45 * pattern.current) * flow.current;
    const dy = exit.half + Math.tan(halfAngle) * length;
    return { length, dy, core: exit.half * 0.6 + (dy - exit.half) * 0.35 };
  });

  const shutoffLabel = $derived(
    nozzle.open
      ? `${anatomy.shutoff === "bale" ? "Manija" : "Palanca"} abierta: tocar para cerrar`
      : `${anatomy.shutoff === "bale" ? "Manija" : "Palanca"} cerrada: tocar para abrir`,
  );
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
      {#if anatomy.flow === "ring"}
        <rect class="ring" x="22" y="-11" width="10" height="22" rx="2" />
        {#if nozzle.kind === "selectable"}<text class="ring-label" x="27" y="-15">{nozzle.ratedFlowGpm}</text>{/if}
      {:else}
        <!-- No gallonage ring: a plain barrel where it would sit. -->
        <rect class="barrel" x="22" y="-9" width="14" height="18" />
      {/if}
      {#if anatomy.pressureRing}
        <!-- The pressure-selection ring (POK: 50/100 psi), a band of the body. -->
        <rect class="pressure" x={ringEnd + 2} y="-10" width="3" height="20" rx="1" />
      {/if}
      {#if anatomy.pattern}
        <rect class="collar" x={barrelEnd} y="-12" width="18" height="24" rx="3" />
        {#if anatomy.teeth !== "none"}
          {#each [-8, -4, 0, 4, 8] as ty (ty)}
            {#if anatomy.teeth === "metal"}
              <path class="tooth" d={`M ${collarEnd - 5} ${ty - 2.4} L ${collarEnd - 0.5} ${ty} L ${collarEnd - 5} ${ty + 2.4} Z`} />
            {:else}
              <rect class="tooth-rubber" x={collarEnd - 5} y={ty - 1.8} width="4.5" height="3.6" rx="1.8" />
            {/if}
          {/each}
        {/if}
      {:else}
        <rect class="barrel" x={barrelEnd} y="-9" width={collarEnd - barrelEnd} height="18" />
      {/if}
    {/if}
    {#if anatomy.grip}
      <!-- Pistol grip, under the valve body. -->
      <path class="grip" d="M 7 8 L 15 8 L 13 17 Q 11 18.5 9 17 Z" />
    {/if}
    {#if anatomy.flow === "slide-index"}
      <!-- The slide valve's own index marks (POK: 20/40/60/80/100%). -->
      {#each [6, 11, 16, 21] as tx (tx)}<line class="index" x1={tx} y1="-8.5" x2={tx} y2="-13" />{/each}
    {/if}
  {/if}
  <!-- The whole body drags (owner, 2026-10-17); the bale above it still takes its tap. Pointer only: the coupling handle is the keyboard slider. -->
  {#if onGrab}<rect class="grab" role="presentation" x="-12" y="-14" width={design === "open-end" ? 32 : 64} height="28" rx="6" onpointerdown={onGrab} />{/if}
  <!-- The shutoff: tap to open or shut. An open end has none. -->
  {#if design !== "open-end" && anatomy.shutoff !== "none"}
  <g
    class="bale"
    class:small
    role="switch"
    tabindex="0"
    aria-checked={nozzle.open}
    aria-label={shutoffLabel}
    onclick={onToggle}
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onToggle())}
  >
    {#if anatomy.shutoff === "bale"}
      <circle class="hit" cx="10" cy="-32" r="22" />
      <g transform={`rotate(${8 - 70 * motion.current} 10 -6)`}>
        <line class="lever" x1="10" y1="-6" x2="10" y2="-30" />
        <circle class="knob" cx="10" cy="-30" r="4" />
      </g>
    {:else if anatomy.shutoff === "slide"}
      <circle class="hit" cx="4" cy="-14" r="17" />
      <g transform={`translate(${6 - 12 * motion.current} 0)`}>
        <rect class="slider" x="0" y="-17" width="14" height="7" rx="3.5" />
        <line class="stem" x1="7" y1="-10" x2="7" y2="-2" />
      </g>
    {:else}
      <circle class="hit" cx="10" cy="-22" r="18" />
      <g transform={`rotate(${-76 * motion.current} 10 -6)`}>
        <line class="lever" x1="10" y1="-6" x2="10" y2="-25" />
        <circle class="knob" cx="10" cy="-25" r="4" />
      </g>
    {/if}
  </g>
  {/if}
</g>

<style>
  /* Only the shutoff takes pointer input; the rest lets drags reach the coupling handle beneath. */
  .selection, .spray, .core, .body, .ring, .ring-label, .collar, .tip, .barrel, .pressure, .tooth, .tooth-rubber, .grip, .index { pointer-events: none; }
  .tip { fill: var(--steel); }
  .barrel { fill: var(--ink); }
  .spray.solid { fill: var(--water); opacity: 0.45; }
  .selection { fill: none; stroke: var(--accent); stroke-width: 2; stroke-dasharray: 5 4; }
  .spray { fill: var(--water-soft); opacity: 0.8; }
  .core { fill: var(--water); opacity: 0.6; }
  .body { fill: var(--ink); }
  .ring { fill: var(--steel); }
  .ring-label { font-size: 10px; font-weight: 700; text-anchor: middle; fill: var(--ink); }
  .collar { fill: var(--water); }
  .pressure { fill: var(--steel); }
  .tooth { fill: var(--steel); }
  .tooth-rubber { fill: var(--water); }
  .grip { fill: var(--ink); }
  .index { stroke: var(--water); stroke-width: 1.5; }
  .lever { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
  .knob { fill: var(--ink); }
  .slider { fill: var(--ink); }
  .stem { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; }
  .bale { cursor: pointer; outline: none; }
  /* A finger's tap near a tiny bale is a tap on the nozzle: touch adjustment would otherwise snap it to the bale. */
  @media (pointer: coarse) { .bale.small { pointer-events: none; } }
  .bale:focus-visible .lever, .bale:focus-visible .stem { stroke: var(--accent); }
  .bale:focus-visible .slider { fill: var(--accent); }
  .hit { fill: transparent; }
  .grab { fill: transparent; cursor: grab; touch-action: none; }
  .band { stroke: var(--surface); stroke-width: 1.5; pointer-events: none; }
</style>
