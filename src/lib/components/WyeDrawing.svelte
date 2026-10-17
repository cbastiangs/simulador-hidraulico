<script lang="ts">
  // A wye on the side-view canvas (UX.md §2 "Branched lays"), in screen px
  // with the flow to the right: inlet swivel, casting and outlet coupling,
  // and on top each outlet's quarter-turn valve lever, as a gated wye shows
  // them from the side. Open, the lever lies along the hose (a bar); shut, it
  // turns across the hose, toward the eye (its end, red). A tap works it; the
  // close-up seen from above (WyeCloseUp) does the same.
  let {
    outlets,
    onGate,
  }: {
    outlets: { id: string; path: string[]; name: string; open: boolean }[];
    onGate: (path: string[]) => void;
  } = $props();

  /** Stems staggered along the body so each lever is its own target. */
  const STEP = 13;
  const stem = (i: number) => -1 + i * STEP;
  const right = $derived(Math.max(14, stem(outlets.length - 1) + 9));
</script>

<g class="wye-side">
  <rect class="swivel" x="-14" y="-8" width="9" height="16" rx="2" />
  <path class="body" d={`M -5 -7 L ${right - 6} -7 L ${right} -5 L ${right} 5 L ${right - 6} 7 L -5 7 Z`} />
  <rect class="coupling" x={right} y="-6" width="5" height="12" rx="1.5" />
  {#each outlets as o, i (o.id)}
    <g
      class="valve"
      class:shut={!o.open}
      role="switch"
      tabindex="0"
      aria-checked={o.open}
      aria-label={`Válvula de ${o.name}: ${o.open ? "abierta, tocar para cerrar" : "cerrada, tocar para abrir"}`}
      transform={`translate(${stem(i)} -7)`}
      onclick={(e) => (e.stopPropagation(), onGate(o.path))}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onGate(o.path))}
    >
      <rect class="hit" x="-6" y="-16" width={STEP} height="18" />
      <line class="stem" x1="0" y1="0" x2="0" y2="-4" />
      {#if o.open}
        <line class="lever" x1="-1" y1="-5" x2="10" y2="-5" />
      {:else}
        <circle class="end" cx="0" cy="-6" r="3.5" />
      {/if}
    </g>
  {/each}
</g>

<style>
  .swivel, .body, .coupling, .stem { pointer-events: none; }
  .swivel { fill: #6b747d; stroke: #2b3036; stroke-width: 1.5; }
  .body { fill: #9aa3ab; stroke: #2b3036; stroke-width: 1.5; stroke-linejoin: round; }
  .coupling { fill: #6b747d; stroke: #2b3036; stroke-width: 1; }
  .valve { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .stem { stroke: #2b3036; stroke-width: 2; }
  .lever { stroke: #1b2128; stroke-width: 3.5; stroke-linecap: round; pointer-events: none; }
  .end { fill: #c0392b; stroke: #2b3036; stroke-width: 1; pointer-events: none; }
  .valve:focus-visible .stem { stroke: var(--accent); stroke-width: 3; }
</style>
