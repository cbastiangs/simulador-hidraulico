<script lang="ts">
  import { untrack } from 'svelte';
  import type { ScenarioTreeResult } from '$hydraulics/scenario.ts';
  import type { SeriesResult } from '$hydraulics/series.ts';
  import { METERS_PER_FOOT } from '$hydraulics/units.ts';
  import { SOURCES } from '../../extinguishment/references.ts';
  import { pathKey, type AppDocument, type Assignment, type Exercise } from '$lib/document.ts';
  import { exerciseReadings } from '$lib/fire-flow.ts';
  import { u } from '$lib/display-units.svelte.ts';
  import { exerciseFloor } from '$lib/geometry/exercise.ts';
  import NumberField from './NumberField.svelte';
  let { open, doc, result, network, resetKey, onClose, onAdd, onchange }: {
    open: boolean; doc: AppDocument; result: SeriesResult; network: ScenarioTreeResult | null; resetKey: number;
    onClose: () => void; onAdd: () => void; onchange: (e: Exercise | undefined, key?: string) => void;
  } = $props();
  let dialog: HTMLDialogElement | undefined = $state();
  let revealed = $state(false);
  let exploring = $state(false);
  let areaGuessM2 = $state<number | null>(null);
  let flowGuessGpm = $state<number | null>(null);
  const e = $derived(doc.exercise);
  const readings = $derived(exerciseReadings(doc, result, network));
  const areaUnit = $derived(u.length === 'ft' ? 'ft²' : 'm²');
  const areaFactor = $derived(u.length === 'ft' ? 1 / METERS_PER_FOOT ** 2 : 1);
  const area = (m2: number) => (m2 * areaFactor).toFixed(1);
  const signed = (n: number, format: (v: number) => string) => `${n > 0 ? '+' : ''}${format(n)}`;
  function retry() { revealed = false; exploring = false; areaGuessM2 = null; flowGuessGpm = null; }
  const estimateKey = $derived([resetKey, e?.lengthM, e?.widthM, e?.involvedFraction].join(':'));
  $effect(() => { void estimateKey; untrack(retry); });
  $effect(() => {
    if (open && dialog && !dialog.open) dialog.showModal();
    else if (!open && dialog?.open) dialog.close();
  });
  function dimension(key: 'lengthM' | 'widthM', value: number) {
    if (e) onchange({ ...e, [key]: Math.min(1000, Math.max(0.1, value)) }, `exercise:${key}`);
  }
  function assign(path: string[], role: Assignment['role'] | null) {
    if (!e) return;
    const assignments = e.assignments.filter(a => pathKey(a.path) !== pathKey(path));
    if (role) assignments.push({ path, role });
    onchange({ ...e, assignments });
  }
  const floor = $derived(e ? exerciseFloor(e.lengthM, e.widthM) : { width: 280, height: 180 });
</script>

<dialog bind:this={dialog} onclose={onClose} onclick={event => event.target === dialog && onClose()} aria-labelledby="practice-title">
  <div class="practice">
    <header><div><span class="eyebrow">ESTIMAR · ELEGIR · COMPROBAR</span><h2 id="practice-title">Práctica NFA</h2></div><button type="button" aria-label="Cerrar práctica" onclick={onClose}>✕</button></header>
    {#if !e || !readings}
      <p>Estima el área afectada y su caudal de referencia. Después compara con el agua que entregan los pitones de tu tendida.</p>
      <button type="button" class="primary" onclick={onAdd}>Añadir práctica a esta tendida</button>
      <p class="note">Empieza con un piso de 40 × 30 ft al 25 %. Tú eliges las líneas que participan.</p>
    {:else}
      <div class="intro"><p>¿Cuánta agua pide el área afectada y cuánta entrega tu tendida?</p><span class="badge">Un piso · convención de entrenamiento</span></div>
      <div class="columns">
        <section class="building" aria-label="Área del ejercicio">
          <h3>1. Observa el piso</h3>
          <svg viewBox="0 0 360 260" role="img" aria-label={`Piso de ${u.l(e.lengthM, 3)} por ${u.l(e.widthM, 3)} ${u.length}, ${Number((e.involvedFraction * 100).toFixed(2))} % afectado`}>
            <defs><pattern id="practice-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6" stroke="currentColor" stroke-width="2" /></pattern></defs>
            <rect class="floor" x="45" y="35" width={floor.width} height={floor.height} rx="2" />
            <rect class="affected" x="45" y="35" width={floor.width * e.involvedFraction} height={floor.height} fill="url(#practice-hatch)" />
            <text x={45 + floor.width / 2} y="24" text-anchor="middle">{u.l(e.lengthM, 3)} {u.length}</text>
            <text transform={`translate(30 ${35 + floor.height / 2}) rotate(-90)`} text-anchor="middle">{u.l(e.widthM, 3)} {u.length}</text>
            <text x="45" y="244">Rayado: {Number((e.involvedFraction * 100).toFixed(2))} % afectado</text>
          </svg>
          <div class="dimensions">
            <NumberField label="Largo del piso" value={e.lengthM} unit="m" digits={3} step={1} onchange={v => dimension('lengthM', v)} />
            <NumberField label="Ancho del piso" value={e.widthM} unit="m" digits={3} step={1} onchange={v => dimension('widthM', v)} />
          </div>
          <label class="percent">Porcentaje afectado<input type="number" min="0" max="100" step="1" value={Number((e.involvedFraction * 100).toFixed(2))} oninput={event => { const v = event.currentTarget.valueAsNumber; if (Number.isFinite(v)) onchange({ ...e, involvedFraction: Math.max(0, Math.min(100, v)) / 100 }, 'exercise:fraction'); }} /><span>%</span></label>
          <p class="note">El rayado representa una fracción del área. Cambiar el piso no modifica las mangueras.</p>
        </section>
        <section class="estimate" aria-label="Estimación y referencia">
          <h3>2. Haz tu estimación</h3>
          {#if !revealed}
            <label>Área afectada estimada ({areaUnit})<input type="number" min="0" step="any" value={areaGuessM2 === null ? '' : Number(area(areaGuessM2))} oninput={event => { const v = event.currentTarget.valueAsNumber; areaGuessM2 = Number.isFinite(v) && v >= 0 ? v / areaFactor : null; }} /></label>
            <label>Caudal estimado ({u.flow})<input type="number" min="0" step="any" value={flowGuessGpm === null ? '' : Number(u.q(flowGuessGpm))} oninput={event => { const v = event.currentTarget.valueAsNumber; flowGuessGpm = Number.isFinite(v) && v >= 0 ? u.from(v, 'gpm') : null; }} /></label>
            <p class="note">Puedes dejar las respuestas en blanco. Tu estimación no cambia el caudal de la tendida.</p>
            <div class="buttons"><button type="button" class="primary" onclick={() => revealed = true}>Comprobar</button><button type="button" onclick={() => { exploring = true; revealed = true; }}>Explorar sin estimar</button></div>
          {:else}
            <div class="reference" data-testid="nfa-reference"><span>Caudal de referencia NFA</span><strong>{u.q(readings.reference.requiredFlowGpm)} <small>{u.flow}</small></strong></div>
            <p>Área afectada: <b>{area(e.lengthM * e.widthM * e.involvedFraction)} {areaUnit}</b></p>
            <p class="formula">Q = {readings.reference.floorAreaFt2.toFixed(1)} ft² ÷ 3 × {Number(e.involvedFraction.toFixed(6))} = {readings.reference.requiredFlowGpm.toFixed(1)} US gpm</p>
            <p class="note">La fórmula usa el área total del piso en ft² y aplica una sola vez la fracción afectada. Las dimensiones en metros se convierten antes de calcular.</p>
            {#if !exploring && (areaGuessM2 !== null || flowGuessGpm !== null)}
              <div class="errors"><b>Tu estimación − referencia</b>
                {#if areaGuessM2 !== null}<p>Área: {signed(areaGuessM2 - e.lengthM * e.widthM * e.involvedFraction, area)} {areaUnit}</p>{/if}
                {#if flowGuessGpm !== null}<p>Caudal: {signed(flowGuessGpm - readings.reference.requiredFlowGpm, u.q)} {u.flow}</p>{/if}
              </div>
            {/if}
            <button type="button" onclick={retry}>Reintentar</button>
          {/if}
        </section>
      </div>
      <section class="delivery" aria-label="Líneas del ejercicio">
        <h3>3. Elige las líneas que participan</h3>
        <p class="note">Suma de pitones asignados para ataque, confinamiento y respaldo. Las salidas vacías y las puntas abiertas quedan fuera.</p>
        {#each readings.lines as line (pathKey(line.path))}
          <div class="assignment">
            <label><input type="checkbox" checked={!!line.assigned} onchange={event => assign(line.path, event.currentTarget.checked ? 'attack' : null)} /><span>{line.name}<small>{line.status ? `${line.status} · ` : ''}{line.flowGpm === null ? 'Sin resultado disponible' : `${u.q(line.flowGpm)} ${u.flow} entregados`}</small></span></label>
            {#if line.assigned}<select aria-label={`Función de ${line.name}`} value={line.assigned.role} onchange={event => assign(line.path, event.currentTarget.value as Assignment['role'])}><option value="attack">Ataque</option><option value="confinement">Confinamiento</option><option value="backup">Respaldo</option></select>{/if}
          </div>
        {:else}<p>No hay pitones elegibles. Añade una manguera y un pitón a la tendida.</p>{/each}
        {#if revealed}
          {#if readings.comparison}
            {@const c = readings.comparison}
            <div class="comparison" data-testid="nfa-comparison" aria-live="polite">
              <div><span>Entrega seleccionada</span><b>{u.q(c.deliveredFlowGpm)} {u.flow}</b></div>
              <div><span>{c.marginGpm < 0 ? 'Falta para la referencia' : 'Exceso sobre la referencia'}</span><b>{u.q(Math.abs(c.marginGpm))} {u.flow}</b></div>
              <div><span>Entrega / referencia</span><b>{c.coverageRatio === null ? 'Sin demanda de referencia' : `${(c.coverageRatio * 100).toFixed(0)} %`}</b></div>
            </div>
          {:else if readings.unavailable.length}<p role="status">Comparación no disponible: {readings.unavailable.join(', ')} sin resultado resuelto.</p>
          {:else}<p role="status">Selecciona al menos un pitón para comparar su entrega con la referencia.</p>{/if}
        {/if}
      </section>
      <section class="next"><h3>4. Cambia una cosa</h3><p>Vuelve a la tendida y cambia 1½″ por 2½″, manteniendo bomba, largo y pitón. Observa fricción y entrega. Después prueba otro pitón o una segunda línea: ¿qué limita ahora el caudal?</p><button type="button" class="primary" onclick={onClose}>Volver a la tendida</button></section>
      <details class="scope"><summary>Alcance y fuente de la referencia</summary><p>Convención NFA para un piso y el conjunto de líneas de confinamiento, extinción y respaldo. Igualar la referencia no demuestra extinción ni determina una táctica segura.</p><p>La regla pierde precisión por encima del 50 % de afectación o 1000 US gpm y con techos de más de 10 ft. No se aplican topes ni reducciones automáticas. Otros pisos y exposiciones quedan fuera de este ejercicio.</p><a href={SOURCES.nfaInitialCompanyOperations.url} target="_blank" rel="noreferrer">NFA · Strategy and Tactics, 2016 · SM2-28–30</a></details>
      <button type="button" class="remove" onclick={() => onchange(undefined)}>Quitar práctica de esta tendida</button>
    {/if}
  </div>
</dialog>
<style>
  dialog { width: min(800px, calc(100% - 24px)); max-height: calc(100dvh - 24px); padding: 0; border: 1px solid var(--line); border-radius: 16px; background: var(--surface); color: var(--ink); }
  dialog::backdrop { background: #10253699; }
  .practice { padding: 20px; display: grid; gap: 20px; } header { display: flex; align-items: center; justify-content: space-between; gap: 12px; } h2,h3,p { margin: 0; } h2 { font-size: 25px; } h3 { font-size: 16px; margin-bottom: 12px; } p { line-height: 1.5; font-size: 14px; } .eyebrow { font-size: 10px; font-weight: 800; letter-spacing: .1em; color: var(--muted); }
  button,input,select { font: inherit; min-height: 44px; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; color: var(--ink); background: var(--surface); box-sizing: border-box; } button { cursor: pointer; } input,select { min-width: 0; max-width: 100%; } .primary { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); font-weight: 700; } label { font-size: 13px; display: grid; gap: 6px; }
  .intro { display: grid; gap: 8px; } .badge { font-size: 11px; font-weight: 700; color: var(--muted); } .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .columns > section { min-width: 0; } .building { padding: 14px; background: var(--band); border-radius: 12px; } svg { display: block; width: 100%; max-height: 230px; color: var(--accent); } svg text { fill: var(--ink); font-size: 13px; } .floor { fill: var(--surface); stroke: var(--ink); stroke-width: 2; } .dimensions { display: grid; gap: 8px; } .percent { display: grid; grid-template-columns: 1fr 72px auto; align-items: center; margin: 12px 0; } .note { color: var(--muted); font-size: 12px; } .estimate { display: flex; flex-direction: column; gap: 12px; } .buttons { display: flex; flex-wrap: wrap; gap: 8px; } .reference { padding: 16px; border-radius: 12px; background: var(--accent-soft); color: var(--accent); display: grid; gap: 4px; } .reference span { font-size: 12px; font-weight: 700; } .reference strong { font-size: 32px; } .reference small { font-size: 16px; } .formula { font-size: 13px; } .errors { border-left: 3px solid var(--line); padding-left: 12px; font-size: 13px; } .delivery,.next,.scope { border-top: 1px solid var(--line); padding-top: 16px; } .assignment { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); } .assignment label { display: flex; align-items: center; gap: 10px; min-height: 44px; cursor: pointer; } .assignment input { width: 20px; height: 20px; min-height: 20px; accent-color: var(--accent); } .assignment small { display: block; font-size: 12px; color: var(--muted); margin-top: 4px; } .comparison { margin-top: 16px; padding: 14px; display: grid; gap: 10px; background: var(--band); border-radius: 10px; } .comparison div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 12px; font-size: 14px; } .next p,.scope p { margin-bottom: 12px; } summary { min-height: 44px; cursor: pointer; font-size: 13px; } a { color: var(--accent); font-size: 13px; } .remove { justify-self: start; font-size: 12px; color: var(--muted); }
  .dimensions :global(input) { width: 6.5rem; min-width: 6.5rem; }
  @media(max-width: 650px) { .practice { padding: 16px; gap: 16px; } .columns { grid-template-columns: 1fr; } .assignment { flex-wrap: wrap; } .assignment select { margin-left: 30px; } }
</style>
