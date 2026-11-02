<script lang="ts">
  import { releaseDate, releases as all, type Release } from "$lib/novedades.ts";

  // Novedades (UX.md §8.6). "update" lists what is new since the last visit
  // and opens by itself once after an update; "all" is the full list, from
  // the Escenario menu. Closing either counts as read.
  let { open, unread, onClose }: { open: boolean; unread: Release[]; onClose: () => void } = $props();

  const update = $derived(unread.length > 0);
  const shown = $derived(update ? unread : all);
  let dialog: HTMLDialogElement | undefined = $state();
  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  });
</script>

<dialog bind:this={dialog} onclose={onClose} onclick={(e) => e.target === dialog && onClose()} aria-labelledby="novedades-title">
  <div class="box">
    <header>
      <h2 id="novedades-title">{update ? "Novedades de esta versión" : "Novedades"}</h2>
      <button type="button" class="done" onclick={onClose}>{update ? "Entendido" : "Listo"}</button>
    </header>
    {#if shown.length === 0}
      <p class="empty">Aún no hay novedades publicadas.</p>
    {/if}
    {#each shown as release (release.id)}
      <section aria-label={`Versión ${release.id}`}>
        <h3>{releaseDate(release)} <small>versión {release.id}</small></h3>
        <ul>
          {#each release.items as item, i (i)}
            <li>
              <span class="kind" class:fix={item.kind === "fix"}>{item.kind === "new" ? "Nuevo" : "Corregido"}</span>
              <span>{item.text}{#if item.href} <a href={item.href}>Ver</a>{/if}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
    {#if update && all.length > unread.length}
      <p class="empty">Las anteriores están en Escenario → Novedades.</p>
    {/if}
  </div>
</dialog>

<style>
  dialog { width: min(440px, calc(100% - 24px)); max-height: calc(100dvh - 24px); overflow: auto; padding: 0; border: 0; border-radius: 14px; background: var(--surface); color: var(--ink); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3); }
  dialog::backdrop { background: rgba(0, 0, 0, 0.35); }
  .box { display: grid; gap: 18px; padding: 14px 16px 18px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  h2 { margin: 0; font-size: 18px; }
  .done { min-height: 44px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--accent); background: var(--accent); color: #fff; font-weight: 700; cursor: pointer; }
  section { display: grid; gap: 10px; }
  h3 { margin: 0; padding-bottom: 6px; border-bottom: 1px solid var(--line); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
  h3 small { margin-left: 6px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
  li { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: baseline; font-size: 14px; line-height: 1.45; }
  .kind { padding: 1px 6px; border-radius: 4px; background: var(--accent-soft); color: var(--accent); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .kind.fix { background: var(--line); color: var(--ink); }
  a { color: var(--accent); }
  .empty { margin: 0; font-size: 13px; color: var(--muted); }
</style>
