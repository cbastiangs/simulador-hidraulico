<script lang="ts">
  import { resolve } from "$app/paths";
  import type { AppDocument } from "$lib/document.ts";

  let { examples, practices, current, onPick }: {
    examples: { id: string; scenario: AppDocument }[];
    practices: { id: string; scenario: AppDocument }[];
    current: string | null;
    onPick: (id: string) => void;
  } = $props();

  let dialog: HTMLDialogElement;
  let group = $state<"examples" | "practices">("examples");
  let content: HTMLDivElement;

  export function show(next: typeof group) {
    group = next;
    dialog.showModal();
    content.scrollTop = 0;
  }

  function switchGroup(next: typeof group) {
    group = next;
    content.scrollTop = 0;
  }

  const descriptions: Record<string, string> = {
    "practica-diametro": "Compara fricción y entrega con dos diámetros de manguera.",
    "practica-piton": "Compara el ajuste nominal con el caudal que entrega el pitón.",
    "practica-descargas": "Abre otra descarga con la bomba cerca de su límite.",
    "practica-descargas-reserva": "Repite el ejercicio 3 con capacidad disponible.",
    "practica-nfa": "Estima el caudal de referencia a partir del área afectada.",
    "cambia-diametro": "Observa la fricción y el caudal al cambiar de manguera.",
    "alcance-turbojet": "Explora el alcance de un chorro directo con datos publicados.",
    "gira-selector": "Observa cómo cambia la entrega al girar el anillo del pitón.",
    "sube-piso": "Compara presión y caudal al subir el pitón.",
    "segunda-descarga": "Observa el reparto de caudal en una bomba con dos descargas.",
  };

  function pick(id: string) {
    dialog.close();
    onPick(id);
  }
</script>

<dialog bind:this={dialog} aria-labelledby="picker-title">
  <header>
    <h2 id="picker-title">Elegir tendida</h2>
    <button class="close" type="button" aria-label="Cerrar selector de tendidas" onclick={() => dialog.close()}>✕</button>
  </header>
  <div class="groups" role="group" aria-label="Tipo de tendida">
    <button type="button" aria-pressed={group === "examples"} onclick={() => switchGroup("examples")}>Ejemplos</button>
    <button type="button" aria-pressed={group === "practices"} onclick={() => switchGroup("practices")}>Prácticas guiadas</button>
  </div>
  <div class="choices" bind:this={content}>
    {#each (group === "examples" ? examples : practices) as item (item.id)}
      <button type="button" class="option" aria-current={item.id === current} onclick={() => pick(item.id)}>
        <strong>{item.id === "practica-descargas-reserva" ? "Variante · capacidad disponible" : item.scenario.scenario.name.replace(/^Práctica · /, "")}</strong>
        {#if descriptions[item.id]}<span>{descriptions[item.id]}</span>{/if}
        {#if item.id === current}<span class="current">Tendida actual</span>{/if}
      </button>
    {/each}
    {#if group === "practices"}
      <a class="option practice-link" href={resolve("/hidrante")}>
        <strong>Abastecimiento desde hidrante</strong>
        <span>Compara una línea, dos entradas y una siamesa de 2½″.</span>
      </a>
      <a class="option practice-link" href={resolve("/piscina")}>
        <strong>Abastecimiento desde piscina</strong>
        <span>Varía la altura de aspiración con la bomba a rpm fijas.</span>
      </a>
    {/if}
  </div>
</dialog>

<style>
  dialog { width: min(540px, calc(100% - 24px)); max-height: calc(100dvh - 24px); padding: 0; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); color: var(--ink); }
  dialog[open] { display: flex; flex-direction: column; }
  dialog::backdrop { background: #0007; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 14px 6px; }
  h2 { font-size: 20px; margin: 0; }
  button { min-height: 44px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); cursor: pointer; }
  .close { min-width: 44px; }
  .groups { display: flex; gap: 6px; padding: 0 14px 10px; }
  .groups button { flex: 1; padding: 5px; font-weight: 600; }
  .groups button[aria-pressed=true], .option[aria-current=true] { border-color: var(--accent); background: var(--accent-soft); }
  .choices { min-height: 0; overflow: auto; display: grid; gap: 6px; padding: 2px 14px 14px; overscroll-behavior: contain; }
  .option { display: grid; gap: 2px; min-width: 0; padding: 8px 12px; text-align: left; overflow-wrap: anywhere; }
  .practice-link { min-height: 44px; color: inherit; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; text-decoration: none; }
  .option:hover { background: var(--accent-soft); }
  .option span { color: var(--muted); font-size: 13px; }
  .option .current { font-weight: 600; }
</style>
