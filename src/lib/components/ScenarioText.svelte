<script lang="ts">
  // The Escenario menu's text box (lib/share.ts): "paste" takes a copied
  // scenario or a link; "copy" shows the text to copy by hand where the
  // browser keeps the clipboard closed (an http address on the station's
  // network, an older phone).
  let {
    mode,
    text = "",
    error = "",
    onOpen,
    onClose,
  }: {
    mode: "copy" | "paste" | null;
    /** What to copy, or what was read from the clipboard to paste. */
    text?: string;
    /** Why the last paste could not be opened. */
    error?: string;
    onOpen: (text: string) => void;
    onClose: () => void;
  } = $props();

  let dialog: HTMLDialogElement | undefined = $state();
  let area: HTMLTextAreaElement | undefined = $state();
  let draft = $state("");
  $effect(() => {
    if (!dialog) return;
    if (mode && !dialog.open) {
      draft = text;
      dialog.showModal();
      requestAnimationFrame(() => (mode === "copy" ? area?.select() : area?.focus()));
    } else if (!mode && dialog.open) dialog.close();
  });
</script>

<dialog bind:this={dialog} onclose={onClose} onclick={(e) => e.target === dialog && onClose()} aria-labelledby="scenario-text-title">
  <form
    class="box"
    onsubmit={(e) => {
      e.preventDefault();
      if (mode === "paste") onOpen(draft);
      else onClose();
    }}
  >
    <h2 id="scenario-text-title">{mode === "copy" ? "Copiar escenario" : "Pegar escenario"}</h2>
    <p>
      {#if mode === "copy"}
        El navegador no dejó copiar solo. Selecciona el texto y cópialo (Ctrl+C o mantener pulsado).
      {:else}
        Pega un escenario copiado o un enlace del simulador. Se abre como un cambio más: «Deshacer» vuelve atrás.
      {/if}
    </p>
    <textarea bind:this={area} bind:value={draft} readonly={mode === "copy"} rows="8" spellcheck="false" aria-label={mode === "copy" ? "Escenario para copiar" : "Escenario para pegar"}></textarea>
    {#if error && mode === "paste"}<p class="error" role="alert">{error}</p>{/if}
    <div class="row">
      <button type="button" onclick={onClose}>{mode === "copy" ? "Cerrar" : "Cancelar"}</button>
      {#if mode === "paste"}<button type="submit" class="primary" disabled={!draft.trim()}>Abrir</button>{/if}
    </div>
  </form>
</dialog>

<style>
  dialog { width: min(520px, calc(100% - 24px)); max-height: calc(100dvh - 24px); padding: 0; border: 0; border-radius: 14px; background: var(--surface); color: var(--ink); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3); }
  dialog::backdrop { background: rgba(0, 0, 0, 0.35); }
  .box { display: grid; gap: 10px; padding: 14px 16px 16px; }
  h2 { margin: 0; font-size: 18px; }
  p { margin: 0; font-size: 13px; color: var(--muted); }
  textarea { width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); padding: 8px; font: 12px/1.4 ui-monospace, monospace; resize: vertical; }
  .error { color: var(--warn); font-weight: 600; }
  .row { display: flex; justify-content: flex-end; gap: 8px; }
  .row button { min-height: 44px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-weight: 600; cursor: pointer; }
  .row .primary { border-color: var(--accent); background: var(--accent); color: #fff; }
  .row .primary:disabled { opacity: 0.45; cursor: default; }
</style>
