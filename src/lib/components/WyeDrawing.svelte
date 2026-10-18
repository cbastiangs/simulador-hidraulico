<script lang="ts">
  // A gated wye on the side-view canvas (UX.md §2 "Branched lays"), in
  // screen px with the flow to the right, drawn as one reads from the side:
  // the inlet swivel with its rocker lugs, the round casting, the outlets
  // leaving it one behind the other (the far one shaded and a little higher),
  // and on top each outlet's quarter-turn ball-valve handle, straight on the
  // casting. The handle turns about its stem: open, it lies along the hose at
  // full length; shut, it has turned across the hose toward the eye, so from
  // the side it shrinks to its red grip. A tap turns it (animated); the
  // close-up from above does the same.
  //
  // An empty outlet (MODEL.md §2) is capped while shut; opened, it spills
  // through its port, with its flow beside it.
  let {
    outlets,
    flows = {},
    onGate,
  }: {
    outlets: { id: string; path: string[]; name: string; open: boolean; active?: boolean; empty?: boolean }[];
    /** Flow per outlet path ("a/b"), gpm. */
    flows?: Record<string, number>;
    onGate: (path: string[]) => void;
  } = $props();

  /** Stems staggered along the casting so each handle is its own target. */
  const STEP = 13;
  const stem = (i: number) => -4 + i * STEP;
  /** Far outlets, drawn behind the near one (the edited line's). */
  const far = $derived(Math.max(0, outlets.length - 1));
  /** The far spouts' outlets, nearest first: every outlet but the drawn one. */
  const behind = $derived(outlets.filter((o) => !o.active).slice(0, far));
  const spill = (n: number) => {
    const o = behind[n - 1];
    return o?.empty ? { open: o.open, gpm: flows[o.path.join("/")] ?? 0 } : null;
  };
</script>

<g class="wye-side">
  <!-- Far outlets behind, each a little higher, so the split reads. -->
  {#each Array.from({ length: far }, (_, i) => far - i) as n (n)}
    <rect class="spout far" x="6" y={-4 - 4 * n} width="15" height="8" rx="2" />
    <rect class="ring far" x="19" y={-6 - 4 * n} width="5" height="12" rx="1.5" />
    {@const sp = spill(n)}
    {#if sp && sp.gpm > 0}
      <path class="spill" d={`M 24 ${-6 - 4 * n} Q 44 ${-12 - 4 * n} 58 ${8 - 4 * n} L 50 ${14 - 4 * n} Q 40 ${2 - 4 * n} 24 ${-2 - 4 * n} Z`} />
      <text class="spill-tag" x="40" y={-14 - 4 * n}>{sp.gpm.toFixed(0)} gpm</text>
    {:else if sp}
      <rect class="cap" x="23" y={-6 - 4 * n} width="3" height="12" rx="1" />
    {/if}
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
    <g
      class="valve"
      class:shut={!o.open}
      role="switch"
      tabindex="0"
      aria-checked={o.open}
      aria-label={`Válvula de ${o.name}: ${o.open ? "abierta, tocar para cerrar" : "cerrada, tocar para abrir"}`}
      transform={`translate(${stem(i)} -9)`}
      onclick={(e) => (e.stopPropagation(), onGate(o.path))}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onGate(o.path))}
    >
      <rect class="hit" x={-STEP / 2} y="-9" width={STEP} height="12" />
      <!-- Stem nut on the casting, then the handle: turning it about the stem foreshortens it. -->
      <rect class="nut" x="-2.5" y="-3" width="5" height="3.5" rx="0.8" />
      <g class="handle" style:transform={`scaleX(${o.open ? 1 : 0.2})`}>
        <rect class="bar" x="-1" y="-6" width="12" height="3.5" rx="1.75" />
        <rect class="grip" x="6" y="-6.8" width="6" height="5" rx="2.2" />
      </g>
      <!-- Shut: the grip faces the eye. -->
      <circle class="grip end" class:on={!o.open} cx="1.5" cy="-4.3" r="3.4" />
    </g>
  {/each}
</g>

<style>
  .swivel, .lug, .casting, .spout, .ring, .nut { pointer-events: none; stroke: #2b3036; stroke-linejoin: round; }
  .swivel { fill: #7b848c; stroke-width: 1.5; }
  .lug { fill: #2b3036; stroke: none; }
  .casting { fill: #a7afb6; stroke-width: 1.5; }
  .spout { fill: #a7afb6; stroke-width: 1.2; }
  .spout.far { fill: #7b848c; }
  .ring { fill: #6b747d; stroke-width: 1; }
  .ring.far { fill: #565e66; }
  .nut { fill: #6b747d; stroke-width: 0.8; }
  .cap { fill: #2b3036; pointer-events: none; }
  .spill { fill: var(--water); opacity: 0.55; pointer-events: none; }
  .spill-tag { font-size: 8px; font-weight: 700; fill: var(--warn); text-anchor: middle; pointer-events: none; paint-order: stroke; stroke: var(--bg, #fff); stroke-width: 2px; }
  .valve { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .handle { transform-box: view-box; transform-origin: 0 0; transition: transform 0.22s ease; pointer-events: none; }
  .bar { fill: #1b2128; }
  .grip { fill: #c0392b; }
  .end { opacity: 0; transition: opacity 0.22s ease; pointer-events: none; stroke: #2b3036; stroke-width: 0.8; }
  .end.on { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .handle, .end { transition: none; } }
  .valve:focus-visible .hit { stroke: var(--accent); stroke-width: 2; }
</style>
