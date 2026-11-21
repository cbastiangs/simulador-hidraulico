<script lang="ts">
  /** A screen-sized source symbol, not a physical rear-port arrangement. */
  let { ports = [{ name: 'Salida', open: true, active: true }], selected = false }: {
    ports?: { name: string; open: boolean; active?: boolean }[];
    selected?: boolean;
  } = $props();
  const height = $derived(Math.max(88, 54 + ports.length * 14));
</script>

<g class="rear-truck" class:selected>
  <title>Camión visto desde atrás. Salidas esquemáticas; no representan su ubicación física.</title>
  <rect class="tire" x="5" y={height - 20} width="12" height="23" rx="4" />
  <rect class="tire" x="51" y={height - 20} width="12" height="23" rx="4" />
  <rect class="body" x="2" y="2" width="64" height={height - 6} rx="7" />
  <rect class="light" x="9" y="7" width="13" height="5" rx="2" />
  <rect class="light" x="46" y="7" width="13" height="5" rx="2" />
  <rect class="shutter" x="12" y="18" width="44" height="14" rx="2" />
  <text class="schematic" x="34" y="28">ESQUEMA</text>
  <rect class="panel" x="10" y="36" width="48" height={height - 50} rx="3" />
  {#each ports as port, i}
    {@const y = 44 + i * 14}
    <g class:active={port.active} class:closed={!port.open}>
      <title>{i + 1}. {port.name} · {port.open ? 'abierta' : 'cerrada'}</title>
      <text x="23" {y} dominant-baseline="middle">{i + 1}</text>
      <circle class="port" cx="45" cy={y} r="5" />
      {#if !port.open}<path class="cap" d={`M42 ${y - 3} L48 ${y + 3}`} />{/if}
    </g>
  {/each}
  <path class="chevron" d={`M8 ${height - 11} l12 5 14 -5 14 5 12 -5`} />
  <rect class="bumper" x="0" y={height - 3} width="68" height="6" rx="2" />
</g>
<style>
  .body { fill: var(--pump); stroke: var(--panel-line); stroke-width: 1.5; }
  .selected .body { stroke: var(--accent); stroke-width: 3; }
  .tire { fill: var(--ink); }
  .light { fill: #ffe5a3; }
  .shutter, .bumper { fill: var(--steel); }
  .schematic { fill: #fff; font-size: 8px; letter-spacing: .3px; }
  .panel { fill: var(--panel-well); }
  text { fill: var(--panel-muted); font: 600 11px system-ui, sans-serif; text-anchor: middle; }
  .port { fill: var(--panel-2); stroke: var(--panel-muted); stroke-width: 2; }
  .active .port { fill: var(--water); stroke: var(--panel-ink); }
  .active text { fill: var(--panel-ink); }
  .closed .port { fill: var(--panel-well); }
  .cap { stroke: var(--panel-muted); stroke-width: 1.5; }
  .chevron { fill: none; stroke: #ffe5a3; stroke-width: 3; }
</style>
