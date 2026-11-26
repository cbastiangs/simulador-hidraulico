<script lang="ts">
  import { u } from "$lib/display-units.svelte.ts";
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
  <circle class="bezel" r={r - 2} />
  {#each ticks as t (t)}
    <line class="tick" x1="0" y1={-(r - 3)} x2="0" y2={-(r - 7)} transform={`rotate(${t})`} />
  {/each}
  {#if mark !== undefined}
    <path class="mark" d={`M 0 ${-(r + 1)} L -3 ${-(r + 6)} L 3 ${-(r + 6)} Z`} transform={`rotate(${-135 + (Math.min(Math.max(mark, 0), MAX) / MAX) * 270})`}><title>{markTitle} {u.p(mark, 0)} {u.pressure}</title></path>
  {/if}
  {#if psi !== null}
    <path class="needle" d={`M0 ${4-r} L1.8 0 1 4h-2l-.8-4Z`} transform={`rotate(${angle})`} />
    <circle class="hub" r={r / 8} />
  {:else}
    <text class="unknown" text-anchor="middle" dominant-baseline="central">—</text>
  {/if}
  {#if label}<text class="value" y={r + 16}>{u.p(psi, 0)} {u.pressure}</text>{/if}
</g>

<style>
  /* Gauges float above the drawing and the height axis (owner, 2026-10-16): a shadow lifts the face, a halo keeps the reading clear of what is under it. */
  .face { fill: var(--equipment-paper); stroke: var(--equipment-edge); stroke-width: 1.6; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)); }
  .unknown { fill: var(--ink); font-weight: bold; }
  .dark .unknown { fill: var(--panel-ink); }
  .bezel { fill: none; stroke: var(--equipment-metal); stroke-width: 1; }
  .tick { stroke: var(--ink); stroke-width: 1.5; }
  .needle { fill: var(--needle); }
  .hub { fill: var(--ink); }
  .value { font-size: 13px; font-weight: 700; text-anchor: middle; fill: var(--ink); paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
  .dark .face { fill: var(--panel-well); stroke: var(--panel-line); stroke-width: 2; filter: none; }
  .dark .bezel { stroke: var(--equipment-seam); }
  .dark .needle { fill: #fa816b; }
  .dark .tick { stroke: var(--panel-ink); }
  .dark .hub { fill: var(--panel-ink); }
  .negative .face { stroke: var(--warn); }
  .negative .value { fill: var(--warn); }
  .mark { fill: var(--accent); }
</style>
