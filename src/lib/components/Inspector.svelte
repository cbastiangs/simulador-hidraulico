<script lang="ts">
  import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
  import { HOSE_SIZES } from "$hydraulics/references.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import * as edit from "$lib/edit.ts";
  import type { Selection } from "$lib/selection.ts";
  import NumberField from "./NumberField.svelte";

  // Edits whatever is selected in the drawing. Every change goes through
  // lib/edit.ts and comes back as a whole new scenario.
  let {
    scenario,
    selection,
    floorHeightM = 3,
    onchange,
    onSelect,
  }: {
    scenario: Scenario;
    selection: Selection;
    floorHeightM?: number;
    onchange: (scenario: Scenario) => void;
    onSelect: (selection: Selection) => void;
  } = $props();

  const last = $derived(scenario.sections.length - 1);
  const floorOf = (m: number) => (m / floorHeightM).toFixed(1).replace(/\.0$/, "");
  const hoseLabel = (h: (typeof HOSE_SIZES)[number]) => (h.couplings ? `${h.diameter} (acoples ${h.couplings})` : h.diameter);
</script>

<div class="inspector">
  {#if selection.kind === "section"}
    {@const i = selection.index}
    {@const section = scenario.sections[i]}
    <h3>Tramo {i + 1} de {scenario.sections.length}</h3>
    <label class="field">
      <span class="label">Diámetro</span>
      <select
        value={section.hoseSizeId ?? ""}
        onchange={(e) => onchange(edit.setSectionHose(scenario, i, e.currentTarget.value))}
      >
        {#if section.hoseSizeId === null}<option value="">{section.diameterIn}" (manual)</option>{/if}
        {#each HOSE_SIZES as size (size.id)}
          <option value={size.id}>{hoseLabel(size)} · C = {size.frictionCoefficient}</option>
        {/each}
      </select>
    </label>
    <NumberField
      label="Largo"
      value={section.lengthM}
      unit="m"
      step={1}
      bigStep={{ size: 15, label: "15" }}
      onchange={(m) => onchange(edit.setSectionLength(scenario, i, m))}
    />
    <NumberField
      label={`Altura al final del tramo (≈ piso ${floorOf(section.endElevationM)})`}
      value={section.endElevationM}
      unit="m"
      step={0.5}
      bigStep={{ size: floorHeightM, label: "piso" }}
      onchange={(m) => onchange(edit.setEndElevation(scenario, i, m))}
    />
    <div class="actions">
      <button
        type="button"
        disabled={scenario.sections.length <= 1}
        onclick={() => {
          onchange(edit.removeSection(scenario, i));
          onSelect({ kind: "section", index: Math.max(0, i - 1) });
        }}>Quitar tramo</button
      >
    </div>
  {:else}
    {@const nozzle = scenario.nozzle}
    <h3>Pitón</h3>
    <button
      type="button"
      class="bale"
      class:open={nozzle.open}
      aria-pressed={nozzle.open}
      onclick={() => onchange(edit.setNozzleOpen(scenario, !nozzle.open))}
    >
      {nozzle.open ? "Abierto: cerrar" : "Cerrado: abrir"}
    </button>
    <label class="field">
      <span class="label">Modelo</span>
      <select value={nozzle.specId ?? ""} onchange={(e) => onchange(edit.setNozzleSpec(scenario, e.currentTarget.value))}>
        {#if nozzle.specId === null}<option value="">Personalizado</option>{/if}
        {#each NOZZLE_SPECS as spec (spec.id)}
          <option value={spec.id}>{spec.label}</option>
        {/each}
      </select>
    </label>
    <NumberField
      label="Caudal nominal"
      value={nozzle.ratedFlowGpm}
      unit="gpm"
      step={5}
      digits={0}
      onchange={(q) => onchange(edit.setNozzleRating(scenario, { ratedFlowGpm: q }))}
    />
    <NumberField
      label="Presión nominal"
      value={nozzle.ratedPressurePsi}
      unit="psi"
      step={5}
      digits={0}
      onchange={(p) => onchange(edit.setNozzleRating(scenario, { ratedPressurePsi: p }))}
    />
    <NumberField
      label={`Altura del pitón (≈ piso ${floorOf(scenario.sections[last].endElevationM)})`}
      value={scenario.sections[last].endElevationM}
      unit="m"
      step={0.5}
      bigStep={{ size: floorHeightM, label: "piso" }}
      onchange={(m) => onchange(edit.setEndElevation(scenario, last, m))}
    />
  {/if}
</div>

<style>
  .inspector { display: grid; gap: 0.75rem; align-content: start; }
  h3 { margin: 0; font-size: 1rem; }
  .field { display: grid; gap: 0.25rem; }
  .label { font-size: 0.8rem; color: var(--muted); }
  select, button { font: inherit; min-height: 2.5rem; padding: 0 0.5rem; border-radius: 6px; border: 1px solid var(--grid); background: var(--surface); color: var(--ink); }
  .actions { display: flex; gap: 0.5rem; }
  .bale { font-weight: 600; background: var(--surface); }
  .bale.open { background: var(--water); color: #fff; border-color: var(--water); }
</style>
