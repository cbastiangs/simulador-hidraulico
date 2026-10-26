<script lang="ts">
  import { onMount } from "svelte";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import { WATEROUS_CX, parsePump } from "$hydraulics/pump.ts";
  import { BUILTIN_APPARATUS, readApparatus, writeApparatus, parseApparatus, applyApparatus, type Apparatus } from "$lib/apparatus.ts";
  let { scenario, onchange }: { scenario: Scenario; onchange: (s: Scenario) => void } = $props();
  let saved = $state<Apparatus[]>([]);
  let draft = $state<Apparatus>(structuredClone(BUILTIN_APPARATUS[0]));
  let dirty = $state(false);
  let storageReady = $state(false);
  let message = $state("");
  let storageError = $state("");
  const builtin = $derived(BUILTIN_APPARATUS.some(p => p.id === draft.id));
  const profiles = $derived([...BUILTIN_APPARATUS, ...saved]);
  const applyError = $derived.by(() => {
    try { applyApparatus(scenario, draft); return ""; }
    catch (e) { return e instanceof Error ? e.message : "No se puede aplicar este camión."; }
  });
  onMount(() => {
    try { saved = readApparatus(); storageReady = true; }
    catch { storageError = "No se pudieron leer los camiones guardados. Se conservan los datos; no se guardarán cambios en esta visita."; }
  });
  function choose(id: string) {
    draft = parseApparatus(profiles.find(p => p.id === id)!); dirty = false; message = "";
  }
  function clone() {
    draft = { ...parseApparatus(draft), id: crypto.randomUUID(), name: `${draft.name.slice(0, 72)} · copia` };
    dirty = true; message = "Copia editable. Guarda el perfil antes de aplicarlo.";
  }
  function count(n: number) {
    if (!Number.isInteger(n) || n < 1 || n > 8) return;
    draft.outlets = Array.from({ length: n }, (_, i) => draft.outlets[i] ?? { name: `Descarga ${i + 1}`, sizeIn: 2.5 });
    dirty = true;
  }
  function save() {
    try {
      const p = parseApparatus(draft);
      const rows = [...saved.filter(row => row.id !== p.id), p];
      writeApparatus(rows); saved = rows; draft = structuredClone(p); dirty = false;
      message = "Perfil guardado en este navegador. La tendida aún no ha cambiado.";
    } catch (e) { message = `No se guardó el perfil. ${e instanceof Error ? e.message : "Almacenamiento no disponible."}`; }
  }
  function apply() {
    try { onchange(applyApparatus(scenario, draft)); message = "Camión aplicado. Sus valores quedan guardados en la tendida."; }
    catch (e) { message = e instanceof Error ? e.message : "No se pudo aplicar el camión."; }
  }
</script>

<section class="truck" aria-label="Configurar camión">
  <h3>Camión</h3>
  <p>En la tendida: <strong>{scenario.apparatusName ?? "Configuración de la tendida"}</strong>. Sus valores son independientes del perfil guardado.</p>
  <label>Perfil<select value={draft.id} disabled={dirty} onchange={e => choose(e.currentTarget.value)}>
    {#each profiles as p (p.id)}<option value={p.id}>{p.name}{BUILTIN_APPARATUS.some(b => b.id === p.id) ? " · incluido" : " · local"}</option>{/each}
    {#if !profiles.some(p => p.id === draft.id)}<option value={draft.id}>{draft.name} · sin guardar</option>{/if}
  </select></label>
  <div class="actions">
    <button type="button" disabled={dirty} onclick={clone}>Clonar perfil</button>
    {#if dirty}<button type="button" onclick={() => choose(saved.some(p => p.id === draft.id) ? draft.id : BUILTIN_APPARATUS[0].id)}>Descartar cambios</button>{/if}
  </div>
  <p>{builtin ? "Perfil incluido, de solo lectura. Clónalo para editarlo." : "Perfil local editable. Guardarlo no modifica la tendida."}</p>
  <fieldset disabled={builtin} oninput={() => dirty = true} onchange={() => dirty = true}>
    <legend>Equipo</legend>
    <label>Nombre del camión<input maxlength="80" bind:value={draft.name} /></label>
    <label>Bomba<select value={draft.pump ? "cx" : "ideal"} onchange={e => { draft.pump = e.currentTarget.value === "cx" ? parsePump({ curve: WATEROUS_CX, mode: "pressure", speedRpm: 4000 }) : undefined; }}>
      <option value="ideal">Presión ideal · sin límite de capacidad</option>
      <option value="cx">Waterous CX · modelo de familia</option>
    </select></label>
    {#if draft.pump}<p>CX de referencia, no calibrada para M11-5. Se aplica con gobernador de presión a 4000 rpm; opera el control en «Curva y control».</p>{/if}
    <label>Capacidad del tanque (US gal)<input type="number" min="1" step="any" placeholder="Desconocida / sin tanque" bind:value={draft.tankCapacityGal} /></label>
    <label>Número de descargas<select value={draft.outlets.length} onchange={e => count(Number(e.currentTarget.value))}>{#each [1,2,3,4,5,6,7,8] as n}<option value={n}>{n}</option>{/each}</select></label>
    {#each draft.outlets as outlet, i}
      <div class="outlet"><span>#{i + 1}</span><label>Nombre de descarga {i + 1}<input maxlength="80" bind:value={outlet.name} /></label><label>Diámetro {i + 1} (in)<input type="number" min="0.1" step="any" bind:value={outlet.sizeIn} /></label></div>
    {/each}
  </fieldset>
  {#if !builtin}<button type="button" disabled={!dirty || !storageReady} onclick={save}>Guardar perfil</button>{/if}
  {#if storageError}<p role="alert">{storageError}</p>{/if}
  <div class="apply">
    <p>Aplicar conserva las líneas en el orden de las descargas y la presión solicitada. Las salidas nuevas quedan cerradas. {draft.tankCapacityGal ? `El tanque comienza lleno (${draft.tankCapacityGal} gal).` : "Sin capacidad conocida, no se simula el vaciado del tanque."} El reloj se pausa.</p>
    {#if applyError}<p role="alert">{applyError}</p>{/if}
    <button type="button" class="primary" disabled={dirty || !!applyError} onclick={apply}>Aplicar camión a la tendida</button>
  </div>
  {#if message}<p role="status">{message}</p>{/if}
</section>

<style>
  .truck { padding: 14px; background: var(--surface); border-radius: var(--radius); display: grid; gap: 12px; min-width: 0; }
  h3, p { margin: 0; } h3 { font-size: 16px; } p { font-size: 13px; color: var(--muted); line-height: 1.5; }
  label { display: grid; gap: 5px; font-size: 13px; min-width: 0; }
  input, select, button { min-width: 0; width: 100%; min-height: 44px; box-sizing: border-box; border: 1px solid var(--line); border-radius: 8px; padding: 8px; font: inherit; color: var(--ink); background: var(--surface); }
  button { cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
  fieldset { margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: 10px; display: grid; gap: 12px; min-width: 0; }
  legend { font-size: 13px; padding: 0 4px; } fieldset:disabled { opacity: .75; }
  .outlet { display: grid; grid-template-columns: 22px minmax(0, 1fr) 95px; gap: 7px; align-items: end; }
  .outlet span { padding-bottom: 12px; font-size: 12px; color: var(--muted); }
  .actions { display: flex; gap: 8px; } .apply { display: grid; gap: 10px; border-top: 1px solid var(--line); padding-top: 12px; }
  .primary { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  [role=alert] { color: var(--warn); }
</style>
