<script lang="ts">
  import { u } from "$lib/display-units.svelte.ts";
  import type { Scenario, ScenarioTreeResult } from "$hydraulics/scenario.ts";
  import { PIECES, type PieceId } from "$lib/pieces.ts";
  import PieceStrip from "./PieceStrip.svelte";
  let { scenario, network, onConnect, onGate, onPump }: {
    scenario: Scenario; network: ScenarioTreeResult;
    onConnect: (id: string, size: string) => void; onGate: (id: string) => void; onPump: () => void;
  } = $props();
  let armed = $state<PieceId | null>(null);
</script>
<section class="empty-canvas" aria-label="Bomba sin mangueras">
  <h2>Bomba sin mangueras</h2>
  <p>Elige una manguera en Piezas y toca la descarga donde quieres conectarla.</p>
  <button type="button" class="truck" aria-label="Bomba: elegir salida" onclick={onPump}>
    <svg viewBox="0 0 360 100" aria-hidden="true"><path d="M75 65V30h55l25 15h130v35H75Z" fill="var(--pump)"/><path d="M84 39h39l16 13H84Z" fill="var(--surface)"/><circle cx="110" cy="80" r="13" fill="var(--ink)"/><circle cx="255" cy="80" r="13" fill="var(--ink)"/></svg>
    Controlar bomba
  </button>
  <div class="ports">
    {#each scenario.discharges ?? [] as d (d.id)}
      {@const r = network.root.branches.find(b => b.id === d.id)}
      <div class="port">
        <button type="button" class="connection" class:armed={!!armed} aria-label={armed ? `Conectar una manguera a ${d.name}` : `${d.name}: salida vacía`} onclick={() => armed ? onConnect(d.id, armed === "hose-2-1/2" ? "2-1/2" : "1-1/2") : onPump()}>
          <span class="ring">{armed ? "+" : "○"}</span><b>{d.name}</b><span>{d.outletSizeIn.toString().replace(".5", "½")}″</span>
        </button>
        <span>{r?.result.pump?.pressurePsi === null && r?.result.pump?.status !== "empty" ? "—" : u.q(r?.flowGpm, 0)} {u.flow}</span>
        <button type="button" aria-label={`${d.open ? "Cerrar" : "Abrir"} ${d.name}`} aria-pressed={d.open} onclick={() => onGate(d.id)}>{d.open ? "Abierta" : "Cerrada"}</button>
      </div>
    {/each}
  </div>
  <div class="pieces"><h3>Piezas</h3><PieceStrip {armed} row available={PIECES.filter(p => p.id.startsWith("hose"))} onPick={p => armed = p} /></div>
</section>
<style>
  .empty-canvas { min-height: 360px; height: 100%; max-height: 700px; box-sizing: border-box; overflow: auto; padding: 18px; display: grid; align-content: center; gap: 12px; border-radius: var(--radius); background: var(--surface); }
  h2,h3,p { margin: 0; } h2 { font-size: 18px; } h3 { font-size: 12px; text-transform: uppercase; color: var(--muted); } p { color: var(--muted); font-size: 13px; }
  button { min-height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: inherit; font-size: 13px; padding: 6px; cursor: pointer; }
  .truck { border: 0; color: var(--accent); }.truck svg { display: block; width: 100%; max-height: 90px; }
  .ports { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; }.port { display: grid; gap: 6px; font-size: 13px; text-align: center; }.connection { display: grid; gap: 3px; }.ring { font-size: 24px; }.armed { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .pieces { display: grid; gap: 4px; }
  @media(max-width:1023px) { .empty-canvas { min-height: 0; padding: 12px; align-content: start; }.truck svg { max-height: 60px; } }
</style>
