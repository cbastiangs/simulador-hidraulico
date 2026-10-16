<script lang="ts">
  import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
  import { HOSE_SIZES } from "$hydraulics/references.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import * as edit from "$lib/edit.ts";
  import { runsOf } from "$lib/geometry/world.ts";
  import type { Selection } from "$lib/selection.ts";
  import type { Action, Target } from "$lib/actions.ts";
  import Actions from "./Actions.svelte";
  import JointControls from "./JointControls.svelte";
  import NumberField from "./NumberField.svelte";

  // Edits what is selected on the canvas (UX.md §3, design/main-screen.html).
  // Every change goes through lib/edit.ts and comes back as a new scenario.
  let {
    scenario,
    selection,
    floorM = 3,
    onchange,
    onSelect,
    requiredPsi,
    result,
    onAction,
    onClose,
  }: {
    scenario: Scenario;
    /** Null: nothing selected; the panel lists what can be. */
    selection: Selection | null;
    floorM?: number;
    onchange: (s: Scenario) => void;
    onSelect: (s: Selection) => void;
    requiredPsi: number;
    result: SeriesResult;
    /** Run an action from lib/actions.ts: the panel shows every action for the selection. */
    onAction: (action: Action, target: Target) => void;
    /** The header's ×: clear the selection. */
    onClose: () => void;
  } = $props();

  const last = $derived(scenario.sections.length - 1);
  const floorOf = (m: number) => {
    const n = Math.round((m / floorM) * 1000) / 1000;
    return Number.isInteger(n) ? (n === 0 ? "planta baja" : `piso ${n}`) : `entre pisos (${n.toFixed(1)})`;
  };
  const sizeName = (h: (typeof HOSE_SIZES)[number]) => (h.couplings ? `${h.diameter} (acoples ${h.couplings})` : h.diameter);
  const specShort = (spec: (typeof NOZZLE_SPECS)[number]) =>
    spec.kind === "selectable" ? `Selector ${spec.settingsGpm[0]}–${spec.settingsGpm[spec.settingsGpm.length - 1]}` : `${spec.ratedFlowGpm} gpm`;
  /** Below its rating by more than 5 %: it gives less than its rated flow (MODEL §3.13). */
  const short = $derived(
    result.state === "flowing" && result.nozzlePressurePsi < scenario.nozzle.ratedPressurePsi * 0.95,
  );
  const nozzleKind = $derived(
    scenario.nozzle.kind === "selectable" ? "Selector de caudal" : "Caudal fijo",
  );
</script>

<aside class="inspector">
  {#if selection}
    <button type="button" class="close" aria-label="Quitar selección (Esc)" title="Quitar selección (Esc)" onclick={onClose}>×</button>
  {/if}
  {#if selection === null}
    <header>
      <h3>Partes</h3>
      <p>Toca una parte, aquí o en el dibujo, para editarla. Clic derecho o mantener pulsado: más opciones.</p>
    </header>
    <nav class="parts" aria-label="Partes de la línea">
      <button type="button" onclick={() => onSelect({ kind: "pump" })}>Bomba · descargas</button>
      {#each scenario.sections as s, i (i)}
        <button type="button" onclick={() => onSelect({ kind: "section", index: i })}>Tramo {i + 1} · {s.lengthM} m de {s.diameterIn.toString().replace(".5", "½")}″</button>
        {#if i < last}<button type="button" class="joint" onclick={() => onSelect({ kind: "joint", index: i + 1 })}>Acople {i + 1}</button>{/if}
      {/each}
      <button type="button" onclick={() => onSelect({ kind: "nozzle" })}>Pitón · {scenario.nozzle.open ? "abierto" : "cerrado"}</button>
    </nav>
  {:else if selection.kind === "pump"}
    {@const outlet = scenario.source.outletSizeIn}
    <header>
      <h3>Bomba · descargas</h3>
      <p>Descarga 1 → línea de {scenario.sections.length} {scenario.sections.length === 1 ? "tramo" : "tramos"} · la presión, arriba</p>
    </header>
    <div>
      <div class="label">Tamaño de la salida</div>
      <div class="seg" role="radiogroup" aria-label="Tamaño de la salida">
        <button type="button" role="radio" aria-checked={outlet === undefined} class:on={outlet === undefined} onclick={() => onchange(edit.setOutletSize(scenario, undefined))}>Igual a la manguera</button>
        {#each [1.5, 2.5, 3] as d (d)}
          <button type="button" role="radio" aria-checked={outlet === d} class:on={outlet === d} onclick={() => onchange(edit.setOutletSize(scenario, d))}>{d.toString().replace(".5", "½")}″</button>
        {/each}
      </div>
    </div>
    <JointControls {scenario} joint={0} onToggle={(kind) => onchange(edit.toggleFitting(scenario, 0, kind))} />
  {:else if selection.kind === "nozzle"}
    {@const n = scenario.nozzle}
    <header>
      <h3>{n.kind === "selectable" ? "Pitón combinado" : "Pitón"}</h3>
      <p>{nozzleKind} · {n.ratedPressurePsi} psi nominal{n.specId === null ? " · personalizado" : " · genérico"}</p>
    </header>

    {#if short}
      <p class="warn" role="status">
        ⚠ {result.nozzlePressurePsi.toFixed(0)} psi en el pitón, por debajo de sus {n.ratedPressurePsi} psi nominales: da
        {result.flowGpm.toFixed(0)} gpm, no {n.ratedFlowGpm}. Sube la presión o toca «Ajustar».
      </p>
    {/if}

    <!-- Operating controls first, so they show at the phone sheet's peek (UX.md §10.7, UX-03); choosing the model is configuration and comes after. -->
    <section class="operate" aria-label="Operar el pitón">
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
    </section>

    <div>
      <div class="label">Modelo</div>
      <div class="seg wrap" role="radiogroup" aria-label="Modelo de pitón">
        {#each NOZZLE_SPECS as spec (spec.id)}
          <button type="button" role="radio" aria-checked={n.specId === spec.id} class:on={n.specId === spec.id} title={spec.label} onclick={() => onchange(edit.setNozzleSpec(scenario, spec.id))}>{specShort(spec)}</button>
        {/each}
        {#if n.specId === null}<button type="button" role="radio" aria-checked="true" class="on" disabled>Personalizado</button>{/if}
      </div>
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
      <NumberField label="Caudal nominal" value={n.ratedFlowGpm} unit="gpm" step={5} digits={0} onchange={(q) => onchange(edit.setNozzleRating(scenario, { ratedFlowGpm: q }))} />
      <NumberField label="Presión nominal" value={n.ratedPressurePsi} unit="psi" step={5} digits={0} onchange={(p) => onchange(edit.setNozzleRating(scenario, { ratedPressurePsi: p }))} />
    </details>

    <JointControls {scenario} joint={last + 1} onToggle={(kind) => onchange(edit.toggleFitting(scenario, last + 1, kind))} />
  {:else if selection.kind === "joint"}
    {@const j = selection.index}
    <header>
      <h3>{j === 0 ? "Salida de la bomba" : `Acople ${j}`} · accesorios</h3>
      <p>{j === 0 ? "Entre la bomba y el tramo 1" : `Entre el tramo ${j} y el tramo ${j + 1}`} · arrastra el acople para moverlo</p>
    </header>
    <JointControls {scenario} joint={j} onToggle={(kind) => onchange(edit.toggleFitting(scenario, j, kind))} />
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
    <div class="lock-row">
      <span class="label">Largo</span>
      <button type="button" class="secondary" class:on={!s.lengthFree} aria-pressed={!s.lengthFree} onclick={() => onchange(edit.toggleLengthLock(scenario, i))}>{s.lengthFree ? "🔓 Libre" : "🔒 Largo fijo"}</button>
    </div>
    <NumberField label="Largo" hideLabel value={s.lengthM} unit="m" step={1} bigStep={{ size: 15, label: "15" }} digits={0} onchange={(m) => onchange(edit.setSectionLength(scenario, i, m))} />
    <NumberField label="Altura al final" value={s.endElevationM} unit="m" step={0.5} bigStep={{ size: floorM, label: "piso" }} onchange={(m) => onchange(edit.setEndElevation(scenario, i, m))} />
    {@const run = runsOf(scenario.sections)[i]}
    {@const rise = s.endElevationM - (i === 0 ? 0 : scenario.sections[i - 1].endElevationM)}
    {@const slack = s.lengthM - Math.hypot(run, rise)}
    {@const loss = result.terms.find((t) => t.lawId === "hose.friction" && t.sectionIndex === i)}
    <p class="loss">Fricción en este tramo: <b>{(loss?.valuePsi ?? 0).toFixed(1)} psi</b> a {result.flowGpm.toFixed(0)} gpm</p>
    <p class="note">
      {floorOf(s.endElevationM)} · recorrido horizontal {run.toFixed(1)} m{slack >= 0.5 ? ` · holgura ${slack.toFixed(1)} m` : " · tenso"}
    </p>
    <p class="note">
      {edit.modeOf(s) === "tether"
        ? "Largo fijo: arrastra el acople dentro del alcance de la manguera; la altura no puede superar su largo."
        : "Libre: arrastra el acople y la manguera se ajusta al largo necesario."}
    </p>
  {/if}
  {#if selection}
    <Actions target={selection} {scenario} {requiredPsi} place="panel" {onAction} />
  {/if}
</aside>

<style>
  .inspector { position: relative; background: var(--surface); border-radius: var(--radius); padding: 14px; display: grid; gap: 14px; align-content: start; min-width: 0; }
  .inspector > * { min-width: 0; }
  .operate { display: grid; gap: 10px; }
  header h3 { margin: 0; font-size: 16px; padding-right: 40px; }
  .close { position: absolute; top: 6px; right: 6px; width: 44px; height: 44px; border: 0; border-radius: 8px; background: transparent; font-size: 22px; color: var(--muted); cursor: pointer; }
  .close:hover { background: var(--band); color: var(--ink); }
  .parts { display: grid; gap: 4px; }
  .parts button { min-height: 40px; padding: 0 12px; text-align: left; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); cursor: pointer; font-size: 14px; }
  .parts .joint { min-height: 32px; margin-left: 16px; font-size: 13px; color: var(--muted); border-style: dashed; }
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
  .seg.wrap { grid-auto-flow: row; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
  .warn { margin: 0; padding: 8px 10px; border-radius: 8px; background: color-mix(in srgb, var(--warn) 12%, transparent); color: var(--warn); font-size: 13px; }
  .loss { margin: -4px 0 0; font-size: 14px; color: var(--muted); }
  .loss b { color: var(--ink); }
  .note { margin: -8px 0 0; font-size: 12px; color: var(--muted); }
  details { display: grid; gap: 10px; }
  details[open] { padding-bottom: 4px; }
  summary { cursor: pointer; color: var(--accent); font-size: 14px; margin-bottom: 10px; }
  .secondary { justify-self: start; min-height: 44px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
  .lock-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: -8px; }
  .lock-row .label { margin: 0; }
  .secondary.on { border-color: var(--accent); color: var(--accent); }
  .secondary:disabled { opacity: 0.5; cursor: default; }
</style>
