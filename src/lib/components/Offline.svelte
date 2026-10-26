<script lang="ts">
  import { dev } from "$app/environment";
  type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
  let prompt = $state<InstallPrompt | null>(null);
  let status = $state("Preparando uso sin conexión…");
  $effect(() => {
    if (dev) { status = "Modo desarrollo · sin caché offline"; return; }
    if (!("serviceWorker" in navigator) || !isSecureContext) { status = "Sin conexión: requiere HTTPS o localhost y un navegador compatible."; return; }
    let alive = true;
    navigator.serviceWorker.ready.then(() => { if (alive) status = "Listo para abrir sin conexión"; }).catch(() => { if (alive) status = "No se pudo preparar el uso sin conexión."; });
    const install = (e: Event) => { e.preventDefault(); prompt = e as InstallPrompt; };
    const installed = () => { prompt = null; status = "Instalado · listo sin conexión"; };
    addEventListener("beforeinstallprompt", install); addEventListener("appinstalled", installed);
    return () => { alive = false; removeEventListener("beforeinstallprompt", install); removeEventListener("appinstalled", installed); };
  });
  async function install() {
    if (!prompt) return;
    const event = prompt; prompt = null;
    try { await event.prompt(); await event.userChoice; }
    catch { status = "Puedes instalar desde el menú del navegador."; }
  }
</script>
<div class="offline">
  <p role="status">{status}</p>
  {#if prompt}<button type="button" onclick={install}>Instalar simulador</button>{:else if !dev}<p class="hint">Instalar: menú del navegador → Añadir a pantalla de inicio. Las fuentes externas necesitan conexión.</p>{/if}
</div>
<style>
  .offline { padding: 8px 12px; display: grid; gap: 8px; } p { margin: 0; font-size: 12px; color: var(--muted); }.hint { max-width: 300px; }
  button { min-height: 44px; border: 1px solid var(--accent); background: var(--accent-soft); color: var(--accent); border-radius: 8px; padding: 8px 12px; text-align: left; font: inherit; cursor: pointer; }
</style>
