<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import { jetBreakEven, WATEROUS_CX, type PumpOperation } from "$hydraulics/pump.ts";
  import { DEFAULT_HYDRANT, type HydrantCase, type HydrantSupply } from "$hydraulics/supply.ts";
  import { POOL, type PoolSupply } from "$hydraulics/pool.ts";
  import { assistedDraft } from "$hydraulics/jet-draft.ts";
  import { u } from "$lib/display-units.svelte.ts";
  import HydrantControls from "./HydrantControls.svelte";

  let { scenario, operation, onchange }: { scenario: Scenario; operation?: PumpOperation; onchange: (s: Scenario) => void } = $props();
  const source = $derived(scenario.source);
  let differentialPsi = $state(50);
  const comparison = $derived(source.pool?.diameterIn === 6 && source.pump && operation ?
    jetBreakEven(source.pump, operation, differentialPsi) : null);
  let measuredPsi = $state<number | undefined>();
  const assisted = $derived(measuredPsi !== undefined && Number.isFinite(measuredPsi) ?
    assistedDraft(scenario, measuredPsi, differentialPsi) : null);
  function connect(hydrant?: HydrantSupply, pool?: PoolSupply) {
    const pump = source.pump ?? (hydrant || pool ? { curve: WATEROUS_CX, mode: "rpm" as const, speedRpm: 4000 } : undefined);
    onchange({ ...scenario, source: { ...source, pump, hydrant, pool } });
  }
  function edit(changes: Partial<HydrantSupply>) {
    if (source.hydrant) connect({ ...source.hydrant, ...changes });
  }
</script>
<section>
  <label>Fuente de agua
    <select value={source.hydrant ? "hidrante" : source.pool ? "piscina" : "tanque"} onchange={e => connect(e.currentTarget.value === "hidrante" ? { ...DEFAULT_HYDRANT } : undefined, e.currentTarget.value === "piscina" ? { liftM: 1.5 } : undefined)}>
      <option value="tanque">{source.tank ? "Tanque" : "Tanque / volumen ilimitado"}</option>
      <option value="piscina">Piscina cebada</option>
      <option value="hidrante">Hidrante</option>
    </select>
  </label>
  {#if source.hydrant}
    <label>Conexión al camión
      <select value={source.hydrant.layout} onchange={e => edit({ layout: e.currentTarget.value as HydrantCase })}>
        <option value="single">Una línea → una entrada</option>
        <option value="separate">Dos líneas → dos entradas</option>
        <option value="siamese">Dos líneas → siamesa → una entrada</option>
      </select>
    </label>
    <p>Alimentación esquemática de 2½″, {u.l(30,0)} {u.length} por línea. Red a {u.p(65,0)} {u.pressure} en reposo.</p>
    <HydrantControls supply={source.hydrant} onchange={edit} />
    <HydrantControls supply={source.hydrant} onchange={edit} losses />
    {#if source.hydrant.layout !== "single" && source.hydrant.intakeRefPsi === 0 && source.hydrant.siameseRefPsi === 0}
      <p>Con pérdidas de entrada y siamesa en cero, las dos conexiones de doble línea dan la misma entrega.</p>
    {/if}
  {:else if source.pool}
    <label>Altura de aspiración · {u.l(source.pool.liftM)} {u.length}
      <input type="range" min={POOL.minLiftM} max={POOL.maxLiftM} step="0.1" value={source.pool.liftM}
        oninput={e => connect(undefined, { ...source.pool!, liftM: e.currentTarget.valueAsNumber })} />
    </label>
    <label>Succión rígida con canastilla
      <select value={source.pool.diameterIn ?? 5} onchange={e => connect(undefined,
        { ...source.pool!, diameterIn: e.currentTarget.value === "6" ? 6 : 5 })}>
        <option value={5}>5″ × 20 pies</option>
        <option value={6}>6″ × 20 pies</option>
      </select>
    </label>
    <p> Bomba y línea ya cebadas. Agua fría al nivel del mar.</p>
    <p>Caudal con datos de aspiración: {u.q(POOL.minGpm,0)}–{u.q(POOL.maxGpm,0)} {u.flow}.</p>
    {#if source.pool.diameterIn === 6}
      <details>
        <summary>Comparar asistencia por chorro de 1½″</summary>
        <p>Los manómetros muestran el tiro sin asistencia. Estima la admisión necesaria para mantener ese caudal de ataque al alimentar el chorro.</p>
        <label>Diferencia de presión en la boquilla de 1″ · {u.p(differentialPsi, 0)} {u.pressure}
          <input type="range" min="0" max="150" step="1" bind:value={differentialPsi} />
        </label>
        {#if comparison}
          <dl>
            <dt>Caudal de ataque a mantener</dt><dd>{u.q(comparison.attackGpm)} {u.flow}</dd>
            <dt>Retorno estimado por el chorro</dt><dd>{u.q(comparison.returnGpm)} {u.flow}</dd>
            <dt>Total que debe mover la bomba</dt><dd>{u.q(comparison.grossGpm)} {u.flow}</dd>
            <dt>Admisión sin asistencia</dt><dd>{u.p(operation?.intakePsi)} {u.pressure}</dd>
            <dt>Admisión necesaria con chorro</dt><dd>{u.p(comparison.requiredIntakePsi)} {u.pressure}</dd>
          </dl>
          <p>La presión que realmente alcanza la admisión requiere un ensayo del equipo conectado a la bomba.</p>
        {:else if source.pump?.mode !== "rpm"}
          <p>Selecciona RPM fijas en Curva y control para comparar a igual velocidad.</p>
        {:else}
          <p>Se necesita caudal de ataque con un punto de operación válido y caudal total dentro de las curvas.</p>
        {/if}
        {#if source.pump?.mode === "rpm"}
          <label>Admisión con chorro, medida o supuesta ({u.pressure})
            <input type="number" step="any" placeholder="Lectura del manómetro"
              value={measuredPsi === undefined ? "" : Number(u.p(measuredPsi, 2))}
              oninput={e => { const n = e.currentTarget.valueAsNumber; measuredPsi = Number.isFinite(n) ? u.from(n, "psi") : undefined; }} />
          </label>
          {#if assisted}
            <dl aria-live="polite">
              <dt>Ataque sin chorro</dt><dd>{u.q(operation?.flowGpm)} {u.flow}</dd>
              <dt>Ataque con esa admisión</dt><dd>{u.q(assisted.attackGpm)} {u.flow}</dd>
              <dt>Caudal total con chorro</dt><dd>{u.q(assisted.grossGpm)} {u.flow}</dd>
              <dt>Descarga con chorro</dt><dd>{u.p(assisted.dischargePsi)} {u.pressure}</dd>
            </dl>
          {:else if measuredPsi !== undefined}
            <p>Sin punto de operación dentro de las curvas para esa lectura.</p>
          {/if}
        {/if}
      </details>
    {/if}
  {:else if !source.pump}
    <p>Al conectar una fuente externa se activa la bomba CX a 4000 rpm fijas.</p>
  {/if}
</section>
<style>
  details[open] { display:grid; gap:8px; }
  summary { cursor:pointer; font-weight:600; }
  dl { display:grid; grid-template-columns:1fr auto; gap:5px 8px; margin:0; font-size:14px; }
  dd { margin:0; font-weight:700; }
  section { display:grid; gap:8px; padding:14px; border-radius:var(--radius); background:var(--surface); }
  label { display:grid; gap:4px; font-weight:600; }
  select { width:100%; min-height:44px; padding:6px; border:1px solid var(--line); border-radius:7px; background:var(--surface); }
  p { margin:0; font-size:13px; color:var(--muted); }
</style>
