<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { replaceState } from "$app/navigation";
  import { CAPACITY, HYDRANT_OUTLETS, HYDRANT_CASES, MAX_REFERENCE_PSI, solveHydrantSupply, type HydrantCase, type HydrantSupply } from "$hydraulics/hydrant.ts";
  import { u } from "$lib/display-units.svelte.ts";
  import HydrantControls from "$lib/components/HydrantControls.svelte";
  import RearTruck from "$lib/components/RearTruck.svelte";

  const captions = {
    single: ["A", "Una línea", "Una línea a una entrada"],
    separate: ["B", "Dos entradas", "Dos líneas a dos entradas independientes"],
    siamese: ["C", "Siamesa", "Dos líneas a una entrada con siamesa"],
  } as const;
  const query = $derived(new URLSearchParams(page.state.hydrantQuery ?? page.url.search));
  const layout = $derived(HYDRANT_CASES.find(id => id === query.get("caso")) ?? "single");
  function reference(key: string) {
    const p = Number(query.get(key));
    return Number.isFinite(p) && p >= 0 && p <= MAX_REFERENCE_PSI ? p : 0;
  }
  const intake = $derived(reference("entrada"));
  const siamese = $derived(reference("siamesa"));
  const outlet = $derived(HYDRANT_OUTLETS.find(id => id === query.get("salida")) ?? "ideal");
  const largeOutlet = $derived(outlet === "4" || outlet === "4.5");
  const capacity = $derived.by(() => {
    const value = Number(query.get("capacidad"));
    return value >= CAPACITY.min && value <= CAPACITY.max ? value : CAPACITY.default;
  });
  const supply = $derived({ layout, outlet, testFlowGpm: capacity, intakeRefPsi: intake, siameseRefPsi: siamese });
  function changeSupply(changes: Partial<HydrantSupply>) {
    const keys = { layout: "caso", outlet: "salida", testFlowGpm: "capacidad", intakeRefPsi: "entrada", siameseRefPsi: "siamesa" };
    for (const [key, value] of Object.entries(changes)) update(keys[key as keyof HydrantSupply], value);
  }
  const cases = $derived(HYDRANT_CASES.map(id => ({ id, ...solveHydrantSupply(id, intake, siamese, outlet, capacity) })));
  const selected = $derived(cases.find(c => c.id === layout)!);
  function update(key: string, value: string | number) {
    const url = new URL(page.url);
    url.search = query.toString();
    url.searchParams.set(key, String(value));
    replaceState(url, { ...page.state, hydrantQuery: url.search });
  }
  function select(id: HydrantCase) { update("caso", id); }
</script>

<svelte:head><title>Abastecimiento desde hidrante · Simulador hidráulico</title></svelte:head>
<main class="app">
  <a class="back" href={resolve("/")}>← Volver a la tendida</a>
  <h1>Abastecimiento desde hidrante</h1>
  <p>Compara tres conexiones de 2½″ con el mismo hidrante, la misma bomba y el mismo pitón.</p>
  <div class="settings">
    <HydrantControls {supply} onchange={changeSupply} />
  </div>
  <section class="card" aria-label="Conexiones al camión">
    <nav aria-label="Configuración de alimentación">
      {#each HYDRANT_CASES as id}
        <button aria-pressed={layout === id} onclick={() => select(id)}><b>{captions[id][0]}</b> {captions[id][1]}</button>
      {/each}
    </nav>
    <h2>{captions[layout][2]}</h2>
    <svg class="scene" viewBox="0 0 420 112" role="img" aria-label={captions[layout][2]}>
      <path fill="var(--ground)" d="M0 94H420v18H0z"/>
      <g fill="#d58a3c" stroke="var(--equipment-edge)" stroke-width="1.5" stroke-linejoin="round">
        <path d="M29 91V49l-3-4 4-4q1-13 12-16h6q11 3 12 16l4 4-4 4v42Z"/>
        <path d="m52 49 6-2v43h-6Z" fill="#ae672f" stroke="none"/>
        <path d="m34 39 2-5 3-3m-6 22v32" fill="none" stroke="#f8c07e" stroke-width="2.5"/>
        <path d="m41 25 1-5 5-1 2 2v4Z" fill="var(--equipment-metal)"/>
        <path d="M25 41h38l2 3-2 3H25l-2-3Zm1 47h36l4 4v3H23v-3Z"/>
        <path d="M19 52h12v12H19Zm40-1h12v12H59Z"/>
        <path d="M19 51h4v14h-4zm48-1h4v14h-4Z" fill="var(--equipment-metal)"/>
        <circle cx="45" cy="73" r="9" fill="#c17b35"/>
        <path d="m41 70 4-2 4 2v5l-4 2-4-2Z" fill="#f2bb79"/>
      </g>
      <g transform="translate(310 22)"><RearTruck /></g>
      <g fill="none" stroke="var(--water-bar)" stroke-width="5" stroke-linejoin="round">
        <path d={layout === "siamese" ? "M71 57H232l24 10" : "M71 57H300"}/>
        {#if layout !== "single"}
          <path d={`${largeOutlet ? "M83 57l15 25" : "M45 73q5 9 20 9"} H${layout === "siamese" ? "232l24-15" : "261l19-7h20"}`}/>
        {/if}
        {#if layout === "siamese"}<path d="M256 67h44"/>{/if}
      </g>
      {#if largeOutlet}
        <rect x="69" y="52" width="14" height="10" rx="2" fill="var(--steel)"/>
      {/if}
      {#if layout === "siamese"}
        <path d="m236 54 21 9h10v8h-10l-20 12-4-6 17-11-17-7Z" fill="#a3b0b4" stroke="#42545a"/>
        <text x="228" y="44">Siamesa</text>
      {/if}
      {#each (layout === "separate" ? [57,75] : [layout === "siamese" ? 67 : 57]) as y}
        <rect x="296" y={y-5} width="10" height="10" rx="2" fill="#aab6bd" stroke="#42545a"/>
      {/each}
      <path d="M379 37h23" stroke="var(--hose)" stroke-width="5"/>
      <path d="m400 33 13 2v4l-13 2Z" fill="var(--steel)"/>
      <text x="85" y="44">{u.q(selected.perHoseGpm)} {u.flow} por línea</text>
    </svg>
    <div class="readings" aria-live="polite">
      <div><span>Hidrante</span><strong>{u.p(selected.hydrantPsi)} <small>{u.pressure}</small></strong></div>
      <div><span>Admisión</span><strong>{u.p(selected.intakePsi)} <small>{u.pressure}</small></strong></div>
      <div><span>Caudal del pitón</span><strong>{u.q(selected.totalGpm)} <small>{u.flow}</small></strong></div>
    </div>
    <p class="caption">Cada entrada utilizada recibe <b>{u.q(selected.portGpm)} {u.flow}</b>. La pérdida por manguera de alimentación es de {u.p(selected.hoseLossPsi)} {u.pressure}.</p>
  </section>
  <h2>¿Qué gana una segunda entrada?</h2>
  <p>Frente a la siamesa, dos entradas aportan <b>{u.q(cases[1].totalGpm - cases[2].totalGpm)} {u.flow}</b> más al pitón con estos ajustes. Con una sola entrada disponible, la siamesa cambia el caudal del caso A en <b>{u.q(cases[2].totalGpm - cases[0].totalGpm)} {u.flow}</b>.</p>
  <table>
    <thead><tr><th>Tendida</th><th>Por línea<br/>({u.flow})</th><th>Admisión<br/>({u.pressure})</th><th>Pitón<br/>({u.flow})</th></tr></thead>
    <tbody>{#each cases as c}
      <tr class:active={c.id === layout}><th scope="row">{captions[c.id][0]} · {captions[c.id][1]}</th><td>{u.q(c.perHoseGpm)}</td><td>{u.p(c.intakePsi)}</td><td>{u.q(c.totalGpm)}</td></tr>
    {/each}</tbody>
  </table>
  {#if !intake && !siamese}
    <p>Con pérdidas de entrada y siamesa en cero, B y C dan el mismo caudal. Es el límite ideal para estos accesorios.</p>
  {:else}
    <p>Comparación con pérdidas supuestas. En B cada entrada recibe la mitad del caudal. En C la siamesa y la entrada común reciben el caudal total.</p>
  {/if}
  <HydrantControls {supply} onchange={changeSupply} losses />
  <details>
    <summary>Equipo y datos del hidrante</summary>
    <p>Bomba CX genérica a 4000 rpm de eje. Cada línea de alimentación mide {u.l(30,0)} {u.length}. La descarga alimenta una línea nivelada de 2½″ de igual longitud, con pitón de {u.q(250,0)} {u.flow} a {u.p(100,0)} {u.pressure} nominales.</p>
    <p>La red entrega {u.p(65,0)} {u.pressure} en reposo y {u.p(30,0)} {u.pressure} a {u.q(capacity,0)} {u.flow} antes del hidrante. El punto de referencia publicado es de {u.q(500,0)} {u.flow}. Los demás caudales representan redes hipotéticas. El indicador «Hidrante» muestra la presión después de la salida. Las salidas con diámetro usan coeficientes del Kennedy K81-D. Para 4″ y 4½″ se supone un adaptador ideal, con bifurcación si se conectan dos líneas. Las pérdidas específicas del camión y de la siamesa están pendientes de medición.</p>
    <p><a href="https://www.usfa.dhs.gov/downloads/pdf/publications/Water_Supply_Systems_Volume_II.pdf">Ensayo de referencia USFA, diagrama 3-1</a> · <a href="https://www.kennedyvalve.com/upl/downloads/kenn/products/documents/product-brochure-5-1-4-kennedy-guardian-hydrant-models-k81d.pdf">Coeficientes del hidrante Kennedy</a></p>
  </details>
</main>
<style>
  main { max-width: 760px; margin: auto; padding: 14px clamp(12px,4vw,30px) 32px; }
  a { color: var(--accent); }
  .back, summary { min-height: 44px; align-content: center; }
  .back { display: inline-grid; }
  h1 { margin: .4em 0 .25em; font-size: clamp(1.65rem,4vw,2.2rem); line-height: 1.1; }
  h2 { margin: 1em 0 .5em; font-size: 1.06rem; }
  p { margin: .5em 0 1em; }
  .card, details { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  .settings { display: grid; gap: 4px; margin: 12px 0; }
  nav { display: flex; gap: 5px; padding: 8px; }
  button { flex: 1; cursor: pointer; min-height: 44px; background: var(--surface); border: 1px solid var(--line); border-radius: 7px; }
  button[aria-pressed=true] { background: var(--accent-soft); border-color: var(--accent); font-weight: 650; }
  .card h2 { margin: 0; padding: 9px 12px 0; background: var(--band); }
  .scene { display: block; width: 100%; background: var(--band); }
  .scene text { fill: var(--ink); font: 12px system-ui, sans-serif; }
  .readings { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--panel-line); color: var(--panel-ink); }
  .readings div { display: grid; gap: 3px; padding: 10px 4px; text-align: center; background: var(--panel); }
  .readings span, small { font-size: .8rem; }
  .readings strong { font-size: clamp(1.1rem,3vw,1.5rem); }
  .caption { padding: 10px 12px; margin: 0; }
  table { border-collapse: collapse; width: 100%; background: var(--surface); font-variant-numeric: tabular-nums; margin-bottom: 10px; }
  td, th { padding: 7px 6px; text-align: right; border-bottom: 1px solid var(--line); }
  th:first-child { text-align: left; }
  thead th { font-size: .8rem; }
  .active { background: var(--accent-soft); }
  details { margin-top: 8px; padding: 0 12px; }
  summary { cursor: pointer; font-weight: 600; }
</style>
