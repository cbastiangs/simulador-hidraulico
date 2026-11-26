<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { replaceState } from "$app/navigation";
  import { POOL_RIG, solvePoolDraft } from "$hydraulics/drafting.ts";
  import { feetToMeters } from "$hydraulics/units.ts";
  import { u } from "$lib/display-units.svelte.ts";
  import RearTruck from "$lib/components/RearTruck.svelte";
  import HardSuctionHose from "$lib/components/HardSuctionHose.svelte";

  const lift = $derived.by(() => {
    const value = page.state.poolLiftM ?? Number(page.url.searchParams.get("altura"));
    return Number.isFinite(value) && value >= POOL_RIG.minLiftM && value <= POOL_RIG.maxLiftM
      ? value : POOL_RIG.minLiftM;
  });
  const result = $derived(solvePoolDraft(lift));
  const drop = $derived(16 + lift * 14);
  const waterY = $derived(83 + drop - 16);

  function changeLift(value: number) {
    const url = new URL(page.url);
    url.searchParams.set("altura", String(value));
    replaceState(url, { ...page.state, poolLiftM: value });
  }
</script>

<svelte:head><title>Abastecimiento desde piscina · Simulador hidráulico</title></svelte:head>

<main class="app">
  <a class="back" href={resolve("/")}>← Volver a la tendida</a>
  <h1>Abastecimiento desde piscina</h1>
  <p class="prompt">Si aumenta la distancia vertical entre la bomba y el agua, ¿qué pasará con el caudal del pitón?</p>
  <section class="rig" aria-label="Tendida de práctica">
    <header><strong>Waterous CX</strong><span>{POOL_RIG.shaftRpm} rpm de eje · bomba cebada</span></header>
    <svg class="scene" viewBox="0 0 400 184" role="img" aria-label={`Esquema de aspiración desde piscina. Altura: ${u.l(lift)} ${u.length}.`}>
      <path d="M0 97h138v86H0Z" fill="var(--ground)"/>
      <path d={`M138 ${waterY}H400V184H138Z`} fill="var(--water-soft)"/>
      <path d={`M138 ${waterY}H400`} stroke="var(--water)" stroke-width="1.5"/>
      <g transform="translate(43 25)"><RearTruck /></g>
      <path d="M113 40h24q13 0 13-13v-5h36" fill="none" stroke="var(--hose)" stroke-width="5"/>
      <path d="M182 18l13 2v4l-13 2Z" fill="var(--steel)"/>
      <text x="205" y="26">Al pitón</text>
      <svg x="76" y="64" width="186" height={39+drop}><HardSuctionHose {drop}/></svg>
      <g transform={`translate(260 ${83+drop})`}>
        <path d="M0-5h6l3-5h21l4 4v12l-4 4H9L6 5H0Z" fill="#526569" stroke="#293638"/>
        <path d="M12-6v12m5-12v12m5-12v12m5-12v12" stroke="#b9cccc" stroke-width="2"/>
      </g>
      <path d={`M336 83v${waterY-83}m-5 0h10M331 83h10`} stroke="var(--muted)" fill="none"/>
      <text x="348" y={(83+waterY)/2+4}>{u.l(lift)} {u.length}</text>
    </svg>
    <div class="readings" aria-live="polite">
      <div><span>Admisión</span><strong>{u.p(result.intakePsi)} <small>{u.pressure}</small></strong></div>
      <div><span>Descarga</span><strong>{u.p(result.dischargePsi)} <small>{u.pressure}</small></strong></div>
      <div><span>Caudal del pitón</span><strong>{u.q(result.flowGpm)} <small>{u.flow}</small></strong></div>
    </div>
    <div class="control">
      <label for="lift">Altura de aspiración <b>{u.l(lift)} {u.length}</b></label>
      <input id="lift" type="range" min={POOL_RIG.minLiftM} max={POOL_RIG.maxLiftM} step="0.1" value={lift}
        aria-valuetext={`${u.l(lift)} ${u.length}`} oninput={e => changeLift(e.currentTarget.valueAsNumber)}/>
      <div class="ends"><span>{u.l(POOL_RIG.minLiftM)} {u.length}</span><span>{u.l(POOL_RIG.maxLiftM)} {u.length}</span></div>
    </div>
  </section>
  <p>Manguerote de 5″ × {u.l(feetToMeters(20))} {u.length} con canastilla. Descarga por {u.l(POOL_RIG.hose.lengthM)} {u.length} de manguera de 2½″, a nivel, con el Protek 368 ajustado a {u.q(POOL_RIG.nozzle.ratedFlowGpm,0)} {u.flow} a {u.p(POOL_RIG.nozzle.ratedPressurePsi,0)} {u.pressure} nominales.</p>
  <details>
    <summary>Cómo interpretar las lecturas</summary>
    <p>La piscina está abierta a la atmósfera. Una admisión más negativa indica mayor vacío. A las mismas rpm, una mayor altura de aspiración reduce la presión de descarga y el caudal que llega al pitón.</p>
    <p>Modelo estacionario a nivel del mar, con agua fresca y canastilla limpia. El cálculo supone que la bomba ya está cebada y opera sin cavitación. Fuentes de Waterous: <a href="https://www.waterousco.com/media/pdfs/f2093.pdf">pérdidas de aspiración</a> y <a href="https://www.waterousco.com/media/pdfs/f2115.pdf">datos de la familia CX</a>.</p>
  </details>
</main>

<style>
  main { max-width: 710px; margin: auto; padding: clamp(14px, 4vw, 32px); }
  .back, a { color: var(--accent); }
  .back { display: inline-flex; align-items: center; min-height: 44px; }
  h1 { font-size: clamp(1.65rem, 4vw, 2.4rem); line-height: 1.1; margin: .6em 0 .3em; }
  p { line-height: 1.5; }
  .prompt { margin: 0 0 1.2rem; }
  .rig { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--surface); }
  header { padding: 12px 16px; display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px; border-bottom: 1px solid var(--line); }
  header span, .ends { color: var(--muted); font-size: .83rem; }
  .scene { display: block; width: 100%; background: var(--band); }
  .scene text { fill: var(--ink); font: 11px system-ui, sans-serif; }
  .readings { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--panel-line); color: var(--panel-ink); }
  .readings div { display: grid; align-content: start; gap: 5px; padding: 12px 8px; text-align: center; background: var(--panel); }
  .readings span { font-size: .78rem; }
  .readings strong { font-size: clamp(1.1rem, 3vw, 1.6rem); }
  small { font-size: .75rem; color: var(--panel-muted); }
  .control { padding: 16px; }
  label, .ends { display: flex; justify-content: space-between; }
  label { font-weight: 600; }
  input { width: 100%; height: 44px; margin: 0; accent-color: var(--accent); }
  summary { cursor: pointer; padding-block: 12px; font-weight: 600; }
</style>
