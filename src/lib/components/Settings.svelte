<script lang="ts">
  import { isAuto, type Scenario } from "$hydraulics/scenario.ts";
  import type { MethodId } from "$hydraulics/references.ts";
  import * as edit from "$lib/edit.ts";
  import { METHOD_IDS, METHOD_LABELS } from "$lib/methods.ts";
  import NumberField from "$lib/components/NumberField.svelte";

  // "Ajustes" (UX.md §10.1): choices about the whole simulation, not about a
  // piece. Escenario is saved with the lay (an undo step each); Vista stays
  // in this browser and changes no number.
  let {
    open,
    onClose,
    scenario,
    onScenario,
    compareId,
    onCompare,
    showGauges,
    trueScale,
    onView,
  }: {
    open: boolean;
    onClose: () => void;
    scenario: Scenario;
    /** `key` groups a burst of edits (typing a floor height) into one undo step. */
    onScenario: (next: Scenario, key?: string) => void;
    /** The second method solved beside the first, or null. */
    compareId: MethodId | null;
    onCompare: (id: MethodId | null) => void;
    showGauges: boolean;
    trueScale: boolean;
    onView: (key: "gauges" | "scale", on: boolean) => void;
  } = $props();

  let dialog: HTMLDialogElement | undefined = $state();
  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  });
  const auto = $derived(isAuto(scenario));
</script>

<dialog bind:this={dialog} onclose={onClose} onclick={(e) => e.target === dialog && onClose()} aria-labelledby="settings-title">
  <div class="box">
    <header>
      <h2 id="settings-title">Ajustes</h2>
      <button type="button" class="done" onclick={onClose}>Listo</button>
    </header>

    <section aria-labelledby="settings-scenario">
      <h3 id="settings-scenario">Escenario <small>se guarda con el escenario</small></h3>
      <div class="field">
        <span>Método de cálculo</span>
        <div class="seg" role="radiogroup" aria-label="Método de cálculo">
          {#each METHOD_IDS as id (id)}
            <button type="button" role="radio" aria-checked={scenario.methodId === id} class:on={scenario.methodId === id} onclick={() => onScenario(edit.setMethod(scenario, id))}>{METHOD_LABELS[id]}</button>
          {/each}
        </div>
      </div>
      <NumberField label="Altura de piso" value={edit.floorOf(scenario)} unit="m" step={0.1} onchange={(m) => onScenario(edit.setFloorHeight(scenario, m), "floor")} />
      <label class="switch">
        <input type="checkbox" checked={auto} onchange={() => onScenario(edit.setAutoFittings(scenario, !auto))} />
        <span>
          <strong>Accesorios automáticos</strong>
          <small>Pone un adaptador donde cambia el tamaño del acople. Sin esto, lo pones tú con «Piezas» y, si falta, no pasa agua.</small>
        </span>
      </label>
    </section>

    <section aria-labelledby="settings-view">
      <h3 id="settings-view">Vista <small>solo en este navegador</small></h3>
      <div class="field">
        <span>Comparar con</span>
        <div class="seg" role="radiogroup" aria-label="Comparar con">
          <button type="button" role="radio" aria-checked={compareId === null} class:on={compareId === null} onclick={() => onCompare(null)}>Nada</button>
          {#each METHOD_IDS.filter((id) => id !== scenario.methodId) as id (id)}
            <button type="button" role="radio" aria-checked={compareId === id} class:on={compareId === id} onclick={() => onCompare(id)}>{METHOD_LABELS[id]}</button>
          {/each}
        </div>
      </div>
      <label class="switch">
        <input type="checkbox" checked={showGauges} onchange={() => onView("gauges", !showGauges)} />
        <span><strong>Manómetros</strong><small>Las lecturas de presión sobre cada acople.</small></span>
      </label>
      <label class="switch">
        <input type="checkbox" checked={trueScale} onchange={() => onView("scale", !trueScale)} />
        <span><strong>Grosor real de la manguera</strong><small>Sin exagerar: a zoom alejado casi no se ve.</small></span>
      </label>
    </section>

    <section aria-labelledby="settings-about">
      <h3 id="settings-about">Acerca de</h3>
      <p class="about">© 2026 Sebastián Gonzales. Todos los derechos reservados sobre el código y la documentación originales. El modelo hidráulico se compila de fuentes citadas en cada valor (manual CGBVP 2019, Colorado DFPC y otras), que pertenecen a sus autores. Consultas sobre licencias: <a href="mailto:sebasgonsot@gmail.com">sebasgonsot@gmail.com</a>.</p>
    </section>
  </div>
</dialog>

<style>
  dialog { width: min(440px, calc(100% - 24px)); max-height: calc(100dvh - 24px); overflow: auto; padding: 0; border: 0; border-radius: 14px; background: var(--surface); color: var(--ink); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3); }
  dialog::backdrop { background: rgba(0, 0, 0, 0.35); }
  .box { display: grid; gap: 18px; padding: 14px 16px 18px; }
  header { display: flex; align-items: center; justify-content: space-between; }
  h2 { margin: 0; font-size: 18px; }
  .done { min-height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--accent); background: var(--accent); color: #fff; font-weight: 700; cursor: pointer; }
  section { display: grid; gap: 12px; }
  h3 { margin: 0; padding-bottom: 6px; border-bottom: 1px solid var(--line); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
  h3 small { margin-left: 6px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .field { display: grid; gap: 6px; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; }
  .seg button { min-height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; font-size: 13px; cursor: pointer; text-transform: none; letter-spacing: 0; color: var(--ink); }
  .seg .on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .switch { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start; min-height: 44px; cursor: pointer; }
  .switch input { width: 22px; height: 22px; margin: 2px 0 0; accent-color: var(--accent); }
  .switch span { display: grid; gap: 2px; font-size: 14px; }
  .switch small { color: var(--muted); font-size: 12px; }
  .about { margin: 0; font-size: 13px; line-height: 1.5; color: var(--muted); }
  .about a { color: var(--accent); }
</style>
