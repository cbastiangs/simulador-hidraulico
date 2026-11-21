<script lang="ts">
  import type { PumpConfig, PumpOperation } from '$hydraulics/pump.ts';
  import { u } from '$lib/display-units.svelte.ts';
  let { values, baseline, canCapture, onCapture, pump, status, onCase }: {
    values: (number | null)[]; baseline: number[] | null;
    pump?: PumpConfig; status?: PumpOperation["status"]; onCase: (reserve: boolean) => void;
    canCapture: boolean; onCapture: () => void;
  } = $props();
  let dialog: HTMLDialogElement | undefined = $state();
  const labels = ['Descarga 1', 'Total bomba', 'Presión real'];
  function format(value: number | null, index: number) {
    return index === 2 ? u.p(value) : u.q(value);
  }
  function delta(value: number | null, index: number) {
    if (value === null || !baseline) return '—';
    const change = value - baseline[index];
    return `${change > 0 ? '+' : ''}${format(change, index)}`;
  }
</script>

<section class="comparison" aria-label="Cambios de descargas">
  {#if baseline}
    <dl aria-live="polite" aria-atomic="true">
      {#each ['Δ Descarga 1', 'Δ Total bomba', 'Δ Presión'] as label, index}
        <div><dt>{label}</dt><dd>{delta(values[index], index)} <small>{index === 2 ? u.pressure : u.flow}</small></dd></div>
      {/each}
    </dl>
  {/if}
  <div class="quick-actions">
    {#if !baseline}<button type="button" disabled={!canCapture || values.some(v => v === null)} onclick={onCapture}>Guardar lecturas iniciales</button>{/if}
    <button type="button" onclick={() => dialog?.showModal()}>{baseline ? 'Ver comparación y explicación' : 'Cómo comparar'} ›</button>
  </div>
  {#if !baseline && !canCapture}<p>Cierra Descarga 2 para guardar el inicio.</p>{/if}
  {#if values.some(v => v === null)}<p role="status">Comparación no disponible.</p>{/if}
</section>
<dialog bind:this={dialog} aria-label="Comparación de descargas" onclick={event => event.target === dialog && dialog?.close()}>
  <div class="dialog-content">
    <header><h2>Comparación de descargas</h2><button type="button" aria-label="Cerrar comparación" onclick={() => dialog?.close()}>✕</button></header>
  <strong>¿Qué cambia al abrir otra descarga?</strong>
  <p class="conditions">{pump ? (pump.mode === 'pressure' ? `Control de presión · límite ${pump.speedRpm} rpm del eje de bomba` : `RPM fijas · ${pump.speedRpm} rpm del eje de bomba`) : 'Fuente de presión ideal · sin límite de capacidad'}</p>
  {#if status === 'holding'}
    <p>La bomba mantiene la presión solicitada. Abrir otra descarga no reduce necesariamente el caudal de la primera línea.</p>
  {:else if status === 'limited'}
    <p>La bomba llegó al límite de giro: no alcanza la presión solicitada. La menor presión reduce el caudal de las líneas abiertas.</p>
  {:else if status === 'rpm'}
    <p>El giro permanece fijo: la presión depende de dónde se cruzan la curva de bomba y la demanda de las líneas.</p>
  {:else if status}
    <p>Sin comparación de capacidad en este estado: consulta el estado de la bomba.</p>
  {/if}
  {#if baseline}
    <table>
      <thead><tr><th scope="col">Lectura</th><th scope="col">Antes</th><th scope="col">Ahora</th><th scope="col">Cambio</th></tr></thead>
      <tbody>
        {#each labels as label, index}
          <tr><th scope="row">{label} <small>({index === 2 ? u.pressure : u.flow})</small></th><td>{format(baseline[index], index)}</td><td>{format(values[index], index)}</td><td>{delta(values[index], index)}</td></tr>
        {/each}
      </tbody>
    </table>

  {:else}
    <p>Con Descarga 2 cerrada, guarda las lecturas iniciales. Después abre esa descarga en la bomba y compara.</p>
  {/if}
  {#if values.some(v => v === null)}<p role="status">Comparación no disponible: falta un resultado hidráulico válido.</p>{/if}
  <details open={!baseline}><summary>Inicio y cómo repetir</summary>
  <p>Abre o cierra Descarga 2 en la bomba; mantén los demás ajustes.</p>
  <fieldset><legend>Repetir con otra condición</legend>
    <p>Carga la tendida genérica inicial con Descarga 2 cerrada y borra las lecturas iniciales. Curva CX de familia, sin calibración M11-5. Puedes deshacer.</p>
    <button type="button" onclick={() => onCase(true)}>Capacidad disponible · 4000 rpm</button>
    <button type="button" onclick={() => onCase(false)}>Límite al abrir · 3200 rpm</button>
  </fieldset>
  <button type="button" disabled={!canCapture || values.some(v => v === null)} onclick={onCapture}>{baseline ? 'Actualizar lecturas iniciales' : 'Guardar lecturas iniciales'}</button>
  {#if !canCapture}<p>Cierra Descarga 2 para guardar un nuevo inicio.</p>{/if}
  </details>

    <button type="button" class="return" onclick={() => dialog?.close()}>Volver a operar</button>
  </div>
</dialog>
<style>
  dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; padding-top: 6px; }
  dt { font-size: 11px; color: var(--muted); }
  dd { margin: 2px 0 0; font-size: 14px; font-weight: 700; overflow-wrap: anywhere; }
  dd small { font-size: 10px; }
  .quick-actions { display: flex; gap: 8px; }
  .quick-actions button { margin: 0; padding: 6px 2px; background: transparent; border: 0; }
  dialog { width: min(540px, calc(100vw - 24px)); max-height: calc(100dvh - 24px); padding: 0; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); color: var(--ink); }
  dialog::backdrop { background: #10182088; }
  .dialog-content { padding: 16px; font-size: 13px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  h2 { margin: 0; font-size: 18px; }
  header button { width: 44px; flex: none; margin: 0; }
  .return { font-weight: 700; }
  .comparison { padding: 0 10px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); font-size: 12px; }
  fieldset { margin: 8px 0; padding: 8px; border: 1px solid var(--line); min-width: 0; }
  .conditions { font-weight: 600; color: var(--ink); }
  strong { font-size: 13px; } p { margin: 8px 0; line-height: 1.4; color: var(--muted); }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-variant-numeric: tabular-nums; }
  th, td { text-align: right; padding: 6px 2px; border-bottom: 1px solid var(--line); }
  th:first-child { text-align: left; } small { display: inline; color: var(--muted); font-weight: 400; }
  summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; color: var(--accent); }
  button { min-height: 44px; width: 100%; margin-top: 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--accent-soft); color: var(--accent); font: inherit; cursor: pointer; }
  button:disabled { opacity: .55; cursor: default; }
</style>
