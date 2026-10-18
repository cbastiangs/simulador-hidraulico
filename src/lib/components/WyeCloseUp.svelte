<script lang="ts">
  // The wye's close-up (UX.md §10.1 Close-up, Operate), drawn from above:
  // the inlet swivel with its lugs on the left, the Y casting, and on each
  // arm a ball valve whose quarter-turn lever lies along the arm when open
  // and across it when shut, as on a real gated wye. A tap on a valve opens
  // or shuts it; each arm ends in its line's name and reading.
  let {
    outlets,
    onGate,
  }: {
    outlets: { id: string; path: string[]; name: string; open: boolean; reading: string }[];
    onGate: (path: string[]) => void;
  } = $props();

  const W = 360;
  const CY = $derived(Math.max(70, 34 + outlets.length * 26));
  const H = $derived(CY * 2);
  /** Arms fan out evenly, ±30° for two. */
  const angle = (i: number) => (outlets.length === 1 ? 0 : -30 + (60 * i) / (outlets.length - 1)) * (outlets.length > 2 ? 1.3 : 1);
  const arm = (i: number) => {
    const a = (angle(i) * Math.PI) / 180;
    const p = (r: number) => ({ x: 120 + r * Math.cos(a), y: CY + r * Math.sin(a) });
    return { a: angle(i), valve: p(52), end: p(100), label: p(118) };
  };
</script>

<svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Bifurco: vista desde arriba">
  <!-- Inlet swivel with its rocker lugs, then the casting's hub. -->
  <line class="hose" x1="0" y1={CY} x2="70" y2={CY} />
  <rect class="swivel" x="66" y={CY - 15} width="26" height="30" rx="4" />
  <rect class="lug" x="73" y={CY - 23} width="12" height="9" rx="2" />
  <rect class="lug" x="73" y={CY + 14} width="12" height="9" rx="2" />
  {#each outlets as _, i (i)}
    {@const g = arm(i)}
    <line class="arm-edge" x1="110" y1={CY} x2={g.end.x} y2={g.end.y} />
  {/each}
  <circle class="hub-edge" cx="112" cy={CY} r="17" />
  {#each outlets as _, i (i)}
    {@const g = arm(i)}
    <line class="arm" x1="110" y1={CY} x2={g.end.x} y2={g.end.y} />
  {/each}
  <circle class="hub" cx="112" cy={CY} r="15" />

  {#each outlets as o, i (o.id)}
    {@const g = arm(i)}
    <g transform={`translate(${g.end.x} ${g.end.y}) rotate(${g.a})`}>
      <rect class="coupling" x="-4" y="-13" width="10" height="26" rx="2" />
    </g>
    <text class="name" x={g.label.x} y={g.label.y - 3}>{o.name}</text>
    <text class="reading" class:off={!o.open} x={g.label.x} y={g.label.y + 13}>{o.reading}</text>
    <g
      class="valve"
      class:shut={!o.open}
      role="switch"
      tabindex="0"
      aria-checked={o.open}
      aria-label={`Válvula de ${o.name}: ${o.open ? "abierta, tocar para cerrar" : "cerrada, tocar para abrir"}`}
      transform={`translate(${g.valve.x} ${g.valve.y}) rotate(${g.a})`}
      onclick={() => onGate(o.path)}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onGate(o.path))}
    >
      <circle class="hit" r="24" />
      <circle class="ball" r="9" />
      <!-- Quarter-turn lever: along the arm (open) or across it (shut). -->
      <g class="lever" style:transform={`rotate(${o.open ? 0 : i === outlets.length - 1 && outlets.length > 1 ? 90 : -90}deg)`}>
        <rect x="-4" y="-4" width="36" height="8" rx="4" />
        <rect class="grip" x="18" y="-5.5" width="16" height="11" rx="5" />
      </g>
    </g>
  {/each}
</svg>

<style>
  svg { width: 100%; height: auto; background: var(--band); border-radius: 12px; user-select: none; }
  .hose { stroke: var(--hose); stroke-width: 14; }
  .swivel { fill: #6b747d; stroke: #2b3036; stroke-width: 2; }
  .lug { fill: #2b3036; }
  .arm-edge { stroke: #2b3036; stroke-width: 22; stroke-linecap: round; }
  .arm { stroke: #9aa3ab; stroke-width: 18; stroke-linecap: round; }
  .hub-edge { fill: #2b3036; }
  .hub { fill: #9aa3ab; }
  .coupling { fill: #6b747d; stroke: #2b3036; stroke-width: 1.5; }
  .hose, .swivel, .lug, .arm, .arm-edge, .hub, .hub-edge, .coupling, text { pointer-events: none; }
  .name { font-size: 13px; font-weight: 700; fill: var(--ink); }
  .reading { font-size: 12px; fill: var(--muted); font-variant-numeric: tabular-nums; }
  .reading.off { fill: var(--warn); }
  .valve { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .ball { fill: #c9ced3; stroke: #2b3036; stroke-width: 2; pointer-events: none; }
  .lever { transition: transform 0.2s ease; pointer-events: none; }
  .lever rect { fill: #1b2128; }
  .lever .grip { fill: #c0392b; }
  .valve:focus-visible .ball { stroke: var(--accent); stroke-width: 4; }
  @media (prefers-reduced-motion: reduce) { .lever { transition: none; } }
</style>
