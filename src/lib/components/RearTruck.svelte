<script lang="ts">
  import { rearBodyHeight, rearOutletY, rearTruckHeight } from "$lib/geometry/rear-truck";

  let { ports = [{ name: 'Salida', open: true, active: true }], selected = false }: {
    ports?: { name: string; open: boolean; active?: boolean }[];
    selected?: boolean;
  } = $props();
</script>

<g class="rear-truck" class:selected>
  <title>Camión visto desde atrás. Descargas numeradas en esquema.</title>
  <g transform={`translate(-11 ${rearTruckHeight(ports.length) - rearBodyHeight})`}>
    <!-- Rear-left view. The cab sits beyond the hose bed, farther up the page. -->
    <g stroke-linejoin="round" stroke-linecap="round">
      <path fill="#3e4345" d="m3 43 17 11h35v11H20L3 54Z"/>
      <g fill="#262a2d" stroke="#202427">
        <ellipse cx="6.2" cy="48.8" rx="3.7" ry="7.7" transform="rotate(-9 6.2 48.8)"/>
        <path d="M46 57h9v9q0 4-3 4h-4q-2 0-2-4Z"/>
        <path d="m12 53 10 3v11q0 4-4 3l-3-1q-3-1-3-6Z"/>
      </g>

      <path class="body" d="M2 13 7 6h29l5 4v6h6l9 6v38l-3 4H20l-7-4v-4q0-8-4-9-2-1-2 3v3l-5-4Z"/>
      <!-- Receding cab roof, side glass and rectangular warning bar. -->
      <path fill="#fbecd0" stroke="#463b33" stroke-width="1.1" d="m2 13 5-7h29l5 4H11l-6 7-3-2Z"/>
      <path fill="#b73e30" d="M11 11h29v7H9Z"/>
      <path fill="#37494e" stroke="#483733" d="m3.5 16 5-5v12l-5 2Z"/>
      <path fill="#b4c8c4" d="m4.4 16.6 3-3.2v3.2l-3 3.8Z"/>
      <path fill="#48454a" d="M11 4h23v3H11z"/>
      <rect x="12" y="2" width="21" height="3.4" rx=".9" fill="#c24433" stroke="#513833" stroke-width=".9"/>
      <path fill="#fff0d2" d="M18 2.4h9v2.4h-9z"/>
      <path fill="#f8c873" d="m3 27 5-1v2l-5 1Z"/>

      <!-- Locker on the visible flank, a wheel under its arch, and running board. -->
      <path fill="#a5362b" d="m9 18 12 8v34l-6-4q-1-11-6-12Z"/>
      <path fill="#a8aba5" stroke="#553b35" stroke-width="1" d="m10 24 8 5v15l-8-5Z"/>
      <path fill="none" stroke="#687373" stroke-width="1" d="m11 29 6 4m-6 0 6 4m-6 0 6 4"/>
      <path fill="none" stroke="#efd2a2" stroke-width="1.4" d="m10 42 7 4"/>
      <ellipse cx="12.8" cy="56.7" rx="4.1" ry="8.1" transform="rotate(-11 12.8 56.7)" fill="#303438" stroke="#22262a"/>
      <ellipse cx="12.2" cy="56.4" rx="2.1" ry="4.3" transform="rotate(-11 12.2 56.4)" fill="#a3aaa8"/>
      <path fill="none" stroke="#cf6650" stroke-width="1.6" d="M8 49q.5-5 3-4 5 2 6 13"/>

      <!-- Longitudinal hose folds lie between raised steel bed rails. -->
      <path fill="#70372c" stroke="#503832" stroke-width="1" d="m10 17 31-1 13 8-34 4Z"/>
      <path fill="none" stroke="#d0a06a" stroke-width="3" d="m16 18 9 6m-2-6 9 6m-2-6 9 6m-2-6 9 6"/>
      <path fill="#ecd0a1" d="m15 17 3-.2 9 6h-3zm14 0h3l9 6h-3Z"/>
      <path fill="none" stroke="#deded1" stroke-width="1.8" d="m10 16 12 8m19-10 13 8"/>

      <!-- Rear face: a recessed hose opening above the reflective tailgate. -->
      <path fill="#d94d35" stroke="#58352f" stroke-width="1.2" d="m19 23 4-1 2 3h22l2-4h6l1 3v35H19Z"/>
      <path fill="#433a35" d="M24 25h23v12H24z"/>
      <g fill="none" stroke-width="2.7">
        <path stroke="#c59965" d="M26 27h10m3 0h6m-18 7h7m4 0h7"/>
        <path stroke="#f0cf9b" d="M26 30.5h6m3 0h10"/>
      </g>
      <path fill="none" stroke="#c3cac4" stroke-width="1.4" d="M23 26v11h24"/>
      <path fill="#be382b" d="M23 39h27v14H23z"/>
      <path fill="#ffce70" d="m23 45 13-7 14 7v4l-14-7-13 7Zm0 8 13-7 14 7v1h-6l-8-4-8 4h-5Z"/>

      <g fill="none" stroke="#453c39" stroke-width="3">
        <path d="M49 36V21q0-2 2-2m4 17V22q0-2-1-3"/>
      </g>
      <path fill="none" stroke="#e8e6d7" stroke-width="1.4"
        d="M49 36V21q0-2 2-2m4 17V22q0-2-1-3m-5 5h6m-6 5h6m-6 5h6"/>
      {#each [18.5, 51] as x}
        <g transform={`translate(${x} 40)`}>
          <rect width="5.3" height="12" rx="1.4" fill="#443a39"/>
          <rect x=".9" y="1" width="3.5" height="5" rx=".7" fill="#ff7856"/>
          <rect x=".9" y="7.2" width="3.5" height="3" rx=".6" fill="#fff0c5"/>
        </g>
      {/each}
      <rect x="19" y="54" width="37" height="8" rx="1" fill="#65322e"/>
      <text class="label" x="37.5" y="60.1">ESQUEMA</text>
      <path fill="#849090" stroke="#363b3d" stroke-width="1.1" d="m15 59 5 3h37v3l-2 2H21l-6-4Z"/>
      <path fill="none" stroke="#e2e2d4" stroke-width="1.5" d="m16 60 5 3h34"/>
    </g>
  </g>
  <rect class="strip" x="47" y="6" width="23" height={rearOutletY(ports.length - 1) + 3} rx="4"/>
  {#each ports as port, i}
    {@const y = rearOutletY(i)}
    <g class:active={port.active} class:closed={!port.open}>
      <title>{i + 1}. {port.name} · {port.open ? 'abierta' : 'cerrada'}</title>
      <text x="53" {y} dominant-baseline="middle">{i + 1}</text>
      <circle class="port" cx="64" cy={y} r="4.5"/>
      {#if !port.open}<path class="cap" d={`M61 ${y-3}l6 6`}/>{/if}
    </g>
  {/each}
</g>

<style>
  .body { fill: var(--equipment-paint); stroke: #3e2e2c; stroke-width: 1.7; stroke-linejoin: round; }
  .selected .body { stroke: var(--accent); stroke-width: 3; }
  .strip { fill: var(--panel-well); stroke: var(--steel); }
  text { fill: var(--panel-ink); font: 650 10px system-ui, sans-serif; text-anchor: middle; }
  .label { fill: #fff1d7; font-size: 6.2px; font-weight: 750; letter-spacing: .35px; }
  .port { fill: var(--panel-2); stroke: var(--panel-muted); stroke-width: 1.6; }
  .active .port { fill: var(--water); stroke: var(--panel-ink); }
  .closed .port { fill: var(--panel-well); }
  .cap { stroke: var(--panel-muted); stroke-width: 1.6; }
</style>
