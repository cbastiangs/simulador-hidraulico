<script lang="ts">
  import { jointName } from "$lib/names.ts";
  import { METHODS, type FittingKind } from "$hydraulics/references.ts";
  import { isAuto, joints, type Scenario } from "$hydraulics/scenario.ts";

  // A joint's fittings (UX.md §2 "Fittings"): the adapter its coupling sizes
  // need. Shown on the canvas toolbar and in the inspector.
  let {
    scenario,
    joint,
    onToggle,
    titled = true,
  }: {
    scenario: Scenario;
    joint: number;
    onToggle: (kind: FittingKind) => void;
    /** False where a header above already names the coupling. */
    titled?: boolean;
  } = $props();

  const j = $derived(joints(scenario)[joint]);
  const last = $derived(scenario.sections.length);
  /** Inner couplings carry their sizes in the name; the ends show them beside it. */
  const end = $derived(joint === 0 || joint === last);
  const size = (d: number) => `${d.toString().replace(".5", "½").replace(".75", "¾")}″`;
  const place = $derived(jointName(scenario, joint));
  const adapterName = $derived(
    j.upIn === undefined || j.downIn === undefined ? "Adaptador" : j.downIn < j.upIn ? "Reducción" : "Ampliación",
  );
  const hasAdapter = $derived(j.auto || j.placed.includes("adapter"));
  const loss = $derived(METHODS[scenario.methodId].fittingLossPsi);
  const reference = METHODS["cgbvp-2019"].fittingLossPsi!;
</script>

<div class="joint">
  {#if titled}
  <div class="title">
    <b>{place}</b>
    {#if end && j.upIn !== undefined && j.downIn !== undefined}<span>{size(j.upIn)} → {size(j.downIn)}</span>{/if}
  </div>
  {/if}

  {#if j.mismatch}
    {#if j.missing}
      <p class="missing" role="alert">Falta {adapterName.toLowerCase()} {size(j.upIn!)} → {size(j.downIn!)}: la línea no está conectada.</p>
    {/if}
    <button
      type="button"
      class:on={hasAdapter}
      aria-pressed={hasAdapter}
      disabled={isAuto(scenario)}
      onclick={() => onToggle("adapter")}
    >
      {hasAdapter ? "✓ " : "+ "}{adapterName} {size(j.upIn!)} → {size(j.downIn!)}{isAuto(scenario) ? " · automática" : ""}
    </button>
  {:else}
    <p class="note">Mismo acople a ambos lados: no hace falta adaptador.</p>
  {/if}

  <!-- No valve toggle (owner, 2026-10-16): an always-open valve only adds loss, and a valve is a kind of coupling, chosen as one when the picker exists. A document that already has one can still drop it. -->
  {#if j.placed.includes("valve")}
    <button type="button" class="on" onclick={() => onToggle("valve")}>✓ Válvula en línea (abierta) · quitar</button>
  {/if}

  <p class="note">
    Pérdida por accesorio: {loss ? `${loss.adapter} psi (fija)` : "sin dato en el modelo base, cuenta 0"} · CGBVP p. 45: {reference.adapter} psi.
    {#if isAuto(scenario) && j.mismatch}Desactiva «Accesorios automáticos» para colocarlo a mano.{/if}
  </p>
</div>

<style>
  .joint { display: grid; gap: 6px; min-width: 0; }
  .title { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
  .title span { color: var(--muted); font-size: 13px; }
  button { min-height: 40px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; font-size: 13px; cursor: pointer; text-align: left; }
  button.on { border-color: var(--fitting); color: var(--fitting); }
  button:disabled { cursor: default; opacity: 0.85; }
  .note { margin: 0; font-size: 12px; color: var(--muted); max-width: 34ch; }
  .missing { margin: 0; font-size: 13px; font-weight: 600; color: var(--warn); max-width: 34ch; }
</style>
