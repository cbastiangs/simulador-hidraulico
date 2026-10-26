<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import { readLibrary, writeLibrary, downloadScenario, type SavedLay } from "$lib/library.ts";
  let { open, scenario, onOpen, onClose }: { open: boolean; scenario: Scenario; onOpen: (s: Scenario) => void; onClose: () => void } = $props();
  let dialog: HTMLDialogElement | undefined = $state();
  let rows = $state<SavedLay[]>([]);
  let name = $state("");
  let message = $state("");
  let removed = $state<SavedLay | null>(null);
  let ready = $state(false);
  $effect(() => {
    if (open && dialog && !dialog.open) {
      name = scenario.name; message = ""; removed = null;
      try { rows = readLibrary(); ready = true; }
      catch { ready = false; message = "No se pudieron leer las líneas guardadas. Puedes exportar la tendida actual; no se sobrescribirá la biblioteca."; }
      dialog.showModal();
    } else if (!open && dialog?.open) dialog.close();
  });
  function store(next: SavedLay[], text: string) {
    try { writeLibrary(next); rows = next; message = text; return true; }
    catch { message = "No se pudo guardar en este navegador. Exporta un archivo para conservar la línea."; return false; }
  }
  function save(s: Scenario, title: string) {
    if (!title.trim()) return;
    const copy = { ...s, name: title.trim().slice(0, 200) };
    store([{ id: crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16)).join("-"), name: copy.name, updatedAt: new Date().toISOString(), scenario: copy }, ...rows], "Copia guardada en este navegador.");
  }
  function rename(row: SavedLay, title: string) {
    if (!title.trim() || title.trim() === row.name) return;
    store(rows.map(r => r.id === row.id ? { ...r, name: title.trim(), scenario: { ...r.scenario, name: title.trim() }, updatedAt: new Date().toISOString() } : r), "Nombre actualizado.");
  }
</script>
<dialog bind:this={dialog} onclose={onClose} onclick={e => e.target === dialog && onClose()} aria-labelledby="saved-title">
  <div class="box">
    <header><h2 id="saved-title">Mis líneas</h2><button type="button" onclick={onClose} aria-label="Cerrar Mis líneas">✕</button></header>
    <p>Copias en este navegador. Exporta un archivo para conservarlas fuera de este dispositivo.</p>
    <form onsubmit={e => { e.preventDefault(); save(scenario, name); }}>
      <label>Guardar la tendida actual<input aria-label="Nombre de la copia" bind:value={name} maxlength="80" required /></label>
      <button type="submit" class="primary" disabled={!ready || !name.trim()}>Guardar copia</button>
    </form>
    <button type="button" onclick={() => downloadScenario(scenario)}>Exportar tendida actual (.json)</button>
    {#if message}<p class="message" role="status">{message}</p>{/if}
    {#if removed}<button type="button" onclick={() => { if (store([removed!, ...rows], "Línea recuperada.")) removed = null; }}>Deshacer eliminación de {removed.name}</button>{/if}
    {#if ready && !rows.length}<p>Todavía no tienes líneas guardadas.</p>{/if}
    {#each rows as row (row.id)}
      <article>
        <input aria-label={`Nombre de ${row.name}`} value={row.name} maxlength="80" onchange={e => rename(row, e.currentTarget.value)} />
        <p>{new Date(row.updatedAt).toLocaleDateString("es-PE")}</p>
        <div class="actions">
          <button type="button" class="primary" onclick={() => { onOpen(row.scenario); onClose(); }}>Abrir {row.name}</button>
          <button type="button" onclick={() => save(row.scenario, `${row.name} (copia)`)}>Duplicar</button>
          <button type="button" onclick={() => downloadScenario(row.scenario)}>Exportar</button>
          <button type="button" onclick={() => { if (store(rows.filter(r => r.id !== row.id), "Línea eliminada.")) removed = row; }}>Eliminar</button>
        </div>
      </article>
    {/each}
  </div>
</dialog>
<style>
  dialog { width: min(540px, calc(100% - 24px)); max-height: calc(100dvh - 24px); padding: 0; border: 0; border-radius: 14px; background: var(--surface); color: var(--ink); } dialog::backdrop { background: #0007; }
  .box { padding: 16px; display: grid; gap: 12px; } header { display: flex; justify-content: space-between; align-items: center; gap: 8px; } h2,p { margin: 0; } h2 { font-size: 20px; } p { color: var(--muted); font-size: 13px; }
  form,label { display: grid; gap: 8px; } label { font-size: 13px; } input,button { min-height: 44px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); font: inherit; } input { width: 100%; box-sizing: border-box; min-width: 0; } button { cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
  article { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--line); border-radius: 10px; }.actions { display: flex; flex-wrap: wrap; gap: 8px; }.actions button { overflow-wrap: anywhere; text-align: left; }.primary { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }.message { color: var(--ink); }
</style>
