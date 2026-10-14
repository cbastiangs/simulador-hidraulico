<script lang="ts">
  import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
  import { HOSE_SIZES } from "$hydraulics/references.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import * as edit from "$lib/edit.ts";
  import type { Selection } from "$lib/selection.ts";
  import NumberField from "./NumberField.svelte";

  // Edits what is selected on the canvas (UX.md §3, design/main-screen.html).
  // Every change goes through lib/edit.ts and comes back as a new scenario.
  let {
    scenario,
    selection,
    floorM = 3,
    onchange,
    onSelect,
  }: {
    scenario: Scenario;
    selection: Selection;
    floorM?: number;
    onchange: (s: Scenario) => void;
    onSelect: (s: Selection) => void;
  } = $props();

  const last = $derived(scenario.sections.length - 1);
  const floorOf = (m: number) => {
    const n = m / floorM;
    return Number.isInteger(n) ? (n === 0 ? "planta baja" : `piso ${n}`) : `entre pisos (${n.toFixed(1)})`;
  };
  const sizeName = (h: (typeof HOSE_SIZES)[number]) => (h.couplings ? `${h.diameter} (acoples ${h.couplings})` : h.diameter);
  const nozzleKind = $derived(
    scenario.nozzle.kind === "selectable" ? "Selector de caudal" : "Caudal fijo",
  );
</script>

<aside class="inspector">
  {#if selection.kind === "nozzle"}
    {@const n = scenario.nozzle}
    <header>
      <h3>{n.kind === "selectable" ? "Pitón combinado" : "Pitón"}</h3>
      <p>{nozzleKind} · {n.ratedPressurePsi} psi nominal{n.specId === null ? " · personalizado" : " · genérico"}</p>
    </header>

    <div>
      <div class="label">Manija</div>
      <div class="lever" role="radiogroup" aria-label="Manija">
        <button type="button" role="radio" aria-checked={!n.open} class:on={!n.open} onclick={() => onchange(edit.setNozzleOpen(scenario, false))}>Cerrado</button>
        <button type="button" role="radio" aria-checked={n.open} class:on={n.open} onclick={() => onchange(edit.setNozzleOpen(scenario, true))}>Abierto</button>
      </div>
    </div>

    {#if n.kind === "selectable"}
      <div>
        <div class="label">Caudal (anillo) · gpm</div>
        <div class="seg" role="radiogroup" aria-label="Caudal">
          {#each n.settingsGpm as q (q)}
            <button type="button" role="radio" aria-checked={q === n.ratedFlowGpm} class:on={q === n.ratedFlowGpm} onclick={() => onchange(edit.setNozzleSetting(scenario, q))}>{q}</button>
          {/each}
        </div>
      </div>
    {/if}

    <div>
      <div class="label">Patrón</div>
      <input
        class="pattern"
        type="range"
        min="0"
        max="1"
        step="0.01"
        aria-label="Patrón: chorro directo a niebla amplia"
        value={n.pattern}
        oninput={(e) => onchange(edit.setNozzlePattern(scenario, e.currentTarget.valueAsNumber))}
      />
      <div class="ends"><span>Chorro directo</span><span>Niebla amplia</span></div>
    </div>

    <NumberField
      label="Altura"
      value={scenario.sections[last].endElevationM}
      unit="m"
      step={0.5}
      bigStep={{ size: floorM, label: "piso" }}
      onchange={(m) => onchange(edit.setEndElevation(scenario, last, m))}
    />
    <p class="note">{floorOf(scenario.sections[last].endElevationM)} · arrastra el pitón para moverlo</p>

    <details>
      <summary>Ajustes avanzados</summary>
      <label class="field">
        <span class="label">Modelo</span>
        <select value={n.specId ?? ""} onchange={(e) => onchange(edit.setNozzleSpec(scenario, e.currentTarget.value))}>
          {#if n.specId === null}<option value="">Personalizado</option>{/if}
          {#each NOZZLE_SPECS as spec (spec.id)}<option value={spec.id}>{spec.label}</option>{/each}
        </select>
      </label>
      <NumberField label="Caudal nominal" value={n.ratedFlowGpm} unit="gpm" step={5} digits={0} onchange={(q) => onchange(edit.setNozzleRating(scenario, { ratedFlowGpm: q }))} />
      <NumberField label="Presión nominal" value={n.ratedPressurePsi} unit="psi" step={5} digits={0} onchange={(p) => onchange(edit.setNozzleRating(scenario, { ratedPressurePsi: p }))} />
    </details>
  {:else}
    {@const i = selection.index}
    {@const s = scenario.sections[i]}
    <header>
      <h3>Tramo {i + 1} de {scenario.sections.length}</h3>
      <p>C = {s.frictionCoefficient} · {s.hoseSizeId ? "valor publicado" : "valor manual"}</p>
    </header>
    <label class="field">
      <span class="label">Diámetro</span>
      <select value={s.hoseSizeId ?? ""} onchange={(e) => onchange(edit.setSectionHose(scenario, i, e.currentTarget.value))}>
        {#if s.hoseSizeId === null}<option value="">{s.diameterIn}″ (manual)</option>{/if}
        {#each HOSE_SIZES as size (size.id)}<option value={size.id}>{sizeName(size)}</option>{/each}
      </select>
    </label>
    <NumberField label="Largo" value={s.lengthM} unit="m" step={1} bigStep={{ size: 15, label: "15" }} digits={0} onchange={(m) => onchange(edit.setSectionLength(scenario, i, m))} />
    <NumberField label="Altura al final" value={s.endElevationM} unit="m" step={0.5} bigStep={{ size: floorM, label: "piso" }} onchange={(m) => onchange(edit.setEndElevation(scenario, i, m))} />
    <p class="note">{floorOf(s.endElevationM)} · arrastra el acople: a los lados cambia el largo, arriba y abajo la altura</p>
    <button
      type="button"
      class="secondary"
      disabled={scenario.sections.length <= 1}
      onclick={() => {
        onchange(edit.removeSection(scenario, i));
        onSelect({ kind: "section", index: Math.max(0, i - 1) });
      }}>Quitar tramo</button
    >
  {/if}
</aside>

<style>
  .inspector { background: var(--surface); border-radius: var(--radius); padding: 14px; display: grid; gap: 14px; align-content: start; min-width: 0; }
  .inspector > * { min-width: 0; }
  header h3 { margin: 0; font-size: 16px; }
  header p { margin: 2px 0 0; color: var(--muted); font-size: 13px; }
  .label { font-size: 12px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
  .field { display: grid; gap: 6px; }
  .field .label { margin: 0; }
  select { height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); padding: 0 10px; }
  .lever { display: grid; grid-template-columns: 1fr 1fr; background: var(--band); border-radius: 12px; padding: 4px; }
  .lever button { min-height: 44px; border: 0; border-radius: 9px; background: transparent; font-weight: 700; color: var(--muted); cursor: pointer; }
  .lever .on { background: var(--water); color: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); }
  .seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; }
  .seg button { min-height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; cursor: pointer; }
  .seg .on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .pattern { width: 100%; accent-color: var(--water); height: 32px; }
  .ends { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
  .note { margin: -8px 0 0; font-size: 12px; color: var(--muted); }
  details { display: grid; gap: 10px; }
  details[open] { padding-bottom: 4px; }
  summary { cursor: pointer; color: var(--accent); font-size: 14px; margin-bottom: 10px; }
  .secondary { justify-self: start; min-height: 44px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
  .secondary:disabled { opacity: 0.5; cursor: default; }
</style>
