<script lang="ts">
  import { Tween } from "svelte/motion";

  // A pressure gauge (UX.md §3): 0–300 psi over 270°, a tick every 50 psi,
  // the reading below. Pressure is always a gauge, never hose thickness.
  let {
    psi,
    x = 0,
    y = 0,
    r = 20,
    dark = false,
    label = true,
    mark,
    markTitle = "Nominal",
  }: {
    psi: number | null;
    x?: number;
    y?: number;
    r?: number;
    dark?: boolean;
    label?: boolean;
    /** A pressure to mark on the dial: the nozzle's rating (UX.md §10.3 T5), the pump's ideal pressure. */
    mark?: number;
    /** What the mark is, for its tooltip. */
    markTitle?: string;
  } = $props();

  const MAX = 300;
  const shown = Tween.of(() => psi ?? 0, { duration: 250 });
  const angle = $derived(-135 + (Math.min(Math.max(shown.current, 0), MAX) / MAX) * 270);
  const ticks = [-135, -90, -45, 0, 45, 90, 135];
</script>

<g transform={`translate(${x} ${y})`} class:dark class:negative={psi !== null && psi < 0}>
  <circle class="face" {r} />
  {#each ticks as t (t)}
    <line class="tick" x1="0" y1={-(r - 3)} x2="0" y2={-(r - 7)} transform={`rotate(${t})`} />
  {/each}
  {#if mark !== undefined}
    <path class="mark" d={`M 0 ${-(r + 1)} L -3 ${-(r + 6)} L 3 ${-(r + 6)} Z`} transform={`rotate(${-135 + (Math.min(Math.max(mark, 0), MAX) / MAX) * 270})`}><title>{markTitle} {mark.toFixed(0)} psi</title></path>
  {/if}
  {#if psi !== null}<line class="needle" x1="0" y1="0" x2="0" y2={-(r - 6)} transform={`rotate(${angle})`} />{/if}
  <circle class="hub" r={r / 8} />
  {#if label}<text class="value" y={r + 16}>{psi?.toFixed(0) ?? "—"} psi</text>{/if}
</g>

<style>
  /* Gauges float above the drawing and the height axis (owner, 2026-10-16): a shadow lifts the face, a halo keeps the reading clear of what is under it. */
  .face { fill: var(--surface); stroke: var(--ink); stroke-width: 1.5; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)); }
  .tick { stroke: var(--ink); stroke-width: 1.5; }
  .needle { stroke: var(--needle); stroke-width: 2.5; stroke-linecap: round; }
  .hub { fill: var(--ink); }
  .value { font-size: 13px; font-weight: 700; text-anchor: middle; fill: var(--ink); paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
  .dark .face { fill: var(--panel-well); stroke: var(--panel-line); stroke-width: 2; filter: none; }
  .dark .tick { stroke: var(--panel-muted); }
  .dark .hub { fill: var(--panel-ink); }
  .negative .face { stroke: var(--warn); }
  .negative .value { fill: var(--warn); }
  .mark { fill: var(--accent); }
</style>
