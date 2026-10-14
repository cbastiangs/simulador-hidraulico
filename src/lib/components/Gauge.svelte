<script lang="ts">
  import { Tween } from "svelte/motion";

  // A pressure gauge: needle over a 270° dial, 0 to `maxPsi`. Pressure is
  // always drawn as a gauge, never as hose thickness (ROADMAP §5).
  let { psi, x, y, r = 20, maxPsi = 300 }: { psi: number; x: number; y: number; r?: number; maxPsi?: number } =
    $props();

  // The needle eases to each new reading instead of jumping.
  const shown = Tween.of(() => psi, { duration: 250 });
  const angle = $derived(-135 + (Math.min(Math.max(shown.current, 0), maxPsi) / maxPsi) * 270);
  const negative = $derived(psi < 0);
</script>

<g transform={`translate(${x} ${y})`} class:negative>
  <circle class="face" {r} />
  <line class="needle" x1="0" y1="0" x2="0" y2={-(r - 4)} transform={`rotate(${angle})`} />
  <circle class="hub" r="2.5" />
  <text class="value" y={-r - 6}>{psi.toFixed(0)} psi</text>
</g>

<style>
  .face { fill: var(--gauge-face); stroke: var(--ink); stroke-width: 1.5; }
  .needle { stroke: var(--needle); stroke-width: 2; stroke-linecap: round; }
  .hub { fill: var(--ink); }
  .value { font-size: 11px; text-anchor: middle; fill: var(--ink); font-variant-numeric: tabular-nums; }
  .negative .face { stroke: var(--danger); }
  .negative .value { fill: var(--danger); }
</style>
