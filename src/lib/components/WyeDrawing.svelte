<script lang="ts">
  // A gated wye on the canvas (UX.md §2 "Branched lays"), in screen px with
  // the flow to the right: the inlet swivel with its lugs, the Y casting, and
  // on each outlet a ball valve whose quarter-turn lever lies along the hose
  // when open and across it when shut, as on a real gated wye. Each outlet
  // leaves at its own lane offset `dy`, where its line is drawn.
  let {
    outlets,
    onGate,
  }: {
    outlets: { id: string; path: string[]; name: string; open: boolean; dy: number }[];
    onGate: (path: string[]) => void;
  } = $props();

  const VALVE_X = 26;
  const OUT_X = 42;
  const tube = (dy: number) => `M -4 0 C 6 0, ${VALVE_X - 12} ${dy}, ${VALVE_X - 4} ${dy} L ${OUT_X} ${dy}`;
  /** A shut lever points away from the other arms: the lowest outlet's down, the rest up. */
  const lowest = $derived(Math.max(...outlets.map((o) => o.dy)));
  const span = $derived({ top: Math.min(0, ...outlets.map((o) => o.dy)), bottom: Math.max(0, ...outlets.map((o) => o.dy)) });
</script>

<g class="wye-drawing">
  <!-- The casting: an outline stroke under a lighter one, so the arms read as one body. -->
  {#each outlets as o (o.id)}<path class="casting-edge" d={tube(o.dy)} />{/each}
  <rect class="casting-edge" x="-7" y={span.top - 7} width="14" height={span.bottom - span.top + 14} rx="7" />
  {#each outlets as o (o.id)}<path class="casting" d={tube(o.dy)} />{/each}
  <rect class="casting" x="-5.5" y={span.top - 5.5} width="11" height={span.bottom - span.top + 11} rx="5.5" />
  <!-- Inlet swivel with its rocker lugs. -->
  <rect class="swivel" x="-21" y="-10" width="14" height="20" rx="2.5" />
  <rect class="lug" x="-17" y="-15" width="6" height="5" rx="1" />
  <rect class="lug" x="-17" y="10" width="6" height="5" rx="1" />
  {#each outlets as o (o.id)}
    <rect class="coupling" x={OUT_X - 6} y={o.dy - 7} width="6" height="14" rx="1.5" />
    <g
      class="valve"
      class:shut={!o.open}
      role="switch"
      tabindex="0"
      aria-checked={o.open}
      aria-label={`Válvula de ${o.name}: ${o.open ? "abierta, tocar para cerrar" : "cerrada, tocar para abrir"}`}
      transform={`translate(${VALVE_X} ${o.dy})`}
      onclick={(e) => (e.stopPropagation(), onGate(o.path))}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onGate(o.path))}
    >
      <circle class="hit" r="13" />
      <circle class="ball" r="5.5" />
      <!-- Quarter-turn lever from the stem: along the flow (open) or across it (shut). -->
      <g class="lever" style:transform={`rotate(${o.open ? 0 : o.dy === lowest && outlets.length > 1 ? 90 : -90}deg)`}>
        <line x1="0" y1="0" x2="19" y2="0" />
        <circle cx="19" cy="0" r="3" />
      </g>
    </g>
  {/each}
</g>

<style>
  .casting-edge { fill: none; stroke: #2b3036; stroke-width: 13; stroke-linecap: round; }
  rect.casting-edge { fill: #2b3036; stroke: none; }
  .casting { fill: none; stroke: #9aa3ab; stroke-width: 9.5; stroke-linecap: round; }
  rect.casting { fill: #9aa3ab; stroke: none; }
  .casting, .casting-edge, .swivel, .lug, .coupling { pointer-events: none; }
  .swivel { fill: #6b747d; stroke: #2b3036; stroke-width: 1.5; }
  .lug { fill: #2b3036; }
  .coupling { fill: #6b747d; stroke: #2b3036; stroke-width: 1; }
  .valve { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .ball { fill: #c9ced3; stroke: #2b3036; stroke-width: 1.5; pointer-events: none; }
  .lever { transition: transform 0.2s ease; pointer-events: none; }
  .lever line { stroke: #1b2128; stroke-width: 4; stroke-linecap: round; }
  .lever circle { fill: #c0392b; }
  .valve:focus-visible .ball { stroke: var(--accent); stroke-width: 3; }
  @media (prefers-reduced-motion: reduce) { .lever { transition: none; } }
</style>
