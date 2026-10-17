<script lang="ts">
  // A gated wye on the side-view canvas (UX.md §2 "Branched lays"), in
  // screen px with the flow to the right, drawn as one reads from the side:
  // the inlet swivel with its rocker lugs, the round casting, the outlets
  // leaving it one behind the other (the far one shaded and a little higher),
  // and on top each outlet's valve bonnet with its quarter-turn lever. Open,
  // the lever lies along the hose; shut, it turns across it, toward the eye
  // (its red end). A tap works it; the close-up from above does the same.
  let {
    outlets,
    onGate,
  }: {
    outlets: { id: string; path: string[]; name: string; open: boolean }[];
    onGate: (path: string[]) => void;
  } = $props();

  /** Bonnets staggered along the casting so each lever is its own target. */
  const STEP = 11;
  const bonnet = (i: number) => -4 + i * STEP;
  /** Far outlets, drawn behind the near one (the edited line's). */
  const far = $derived(Math.max(0, outlets.length - 1));
</script>

<g class="wye-side">
  <!-- Far outlets behind, each a little higher, so the split reads. -->
  {#each Array.from({ length: far }, (_, i) => far - i) as n (n)}
    <rect class="spout far" x="6" y={-4 - 4 * n} width="15" height="8" rx="2" />
    <rect class="ring far" x="19" y={-6 - 4 * n} width="5" height="12" rx="1.5" />
  {/each}
  <!-- Inlet swivel with its rocker lugs. -->
  <rect class="swivel" x="-19" y="-9" width="10" height="18" rx="2.5" />
  <rect class="lug" x="-16" y="-13.5" width="4" height="5" rx="1" />
  <rect class="lug" x="-16" y="8.5" width="4" height="5" rx="1" />
  <!-- The casting, then the near outlet in line with the hose. -->
  <ellipse class="casting" cx="1" cy="0" rx="11" ry="9.5" />
  <rect class="spout" x="7" y="-4" width="14" height="8" rx="2" />
  <rect class="ring" x="19" y="-6" width="5" height="12" rx="1.5" />
  {#each outlets as o, i (o.id)}
    <rect class="bonnet" x={bonnet(i) - 2.5} y="-14" width="5" height="6" rx="1" />
    <g
      class="valve"
      class:shut={!o.open}
      role="switch"
      tabindex="0"
      aria-checked={o.open}
      aria-label={`Válvula de ${o.name}: ${o.open ? "abierta, tocar para cerrar" : "cerrada, tocar para abrir"}`}
      transform={`translate(${bonnet(i)} -14)`}
      onclick={(e) => (e.stopPropagation(), onGate(o.path))}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onGate(o.path))}
    >
      <rect class="hit" x={-STEP / 2} y="-10" width={STEP} height="14" />
      {#if o.open}
        <line class="lever" x1="-1" y1="-1.5" x2="6.5" y2="-1.5" />
      {:else}
        <circle class="end" cx="0" cy="-3" r="3.2" />
      {/if}
    </g>
  {/each}
</g>

<style>
  .swivel, .lug, .casting, .spout, .ring, .bonnet { pointer-events: none; stroke: #2b3036; stroke-linejoin: round; }
  .swivel { fill: #7b848c; stroke-width: 1.5; }
  .lug { fill: #2b3036; stroke: none; }
  .casting { fill: #a7afb6; stroke-width: 1.5; }
  .spout { fill: #a7afb6; stroke-width: 1.2; }
  .spout.far { fill: #7b848c; }
  .ring { fill: #6b747d; stroke-width: 1; }
  .ring.far { fill: #565e66; }
  .bonnet { fill: #8a939b; stroke-width: 1; }
  .valve { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .lever { stroke: #1b2128; stroke-width: 3.2; stroke-linecap: round; pointer-events: none; }
  .end { fill: #c0392b; stroke: #2b3036; stroke-width: 1; pointer-events: none; }
  .valve:focus-visible .hit { stroke: var(--accent); stroke-width: 2; }
</style>
