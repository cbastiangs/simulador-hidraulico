<script lang="ts">
  import { u } from "$lib/display-units.svelte.ts";
  import { hoseSizeName, jointName } from "$lib/names.ts";
  import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
  import { HOSE_SIZES, SOURCES, type Source } from "$hydraulics/references.ts";
  import { couplingOf, endBoreIn, reactionAt, resolvedNozzle, type Scenario } from "$hydraulics/scenario.ts";
  import { sectionFlowGpm, jointFlowGpm } from "$lib/readings.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import * as edit from "$lib/edit.ts";
  import { runsOf } from "$lib/geometry/world.ts";
  import type { Selection } from "$lib/selection.ts";
  import type { Action, Target } from "$lib/actions.ts";
  import Actions from "./Actions.svelte";
  import JointControls from "./JointControls.svelte";
  import NumberField from "./NumberField.svelte";
  import NozzleCloseUp from "./NozzleCloseUp.svelte";
  import JunctionPanel from "./JunctionPanel.svelte";
  import { junctionAt } from "$lib/branch-edit.ts";
  import { prefs, setControls } from "$lib/prefs.svelte.ts";

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
    branched = false,
    tree,
    outlets = {},
    onTree,
    onLine,
  }: {
    scenario: Scenario;
    /** Null: nothing selected; the panel lists what can be. */
    selection: Selection | null;
    floorM?: number;
    onchange: (s: Scenario) => void;
    onSelect: (s: Selection) => void;
    requiredPsi: number | null;
    result: SeriesResult;
    /** Run an action from lib/actions.ts: the panel shows every action for the selection. */
    onAction: (action: Action, target: Target) => void;
    /** The header's ×: clear the selection. */
    onClose: () => void;
    branched?: boolean;
    /** A branched lay (UX.md §2): `scenario` is its drawn path; `tree` the whole lay, for the wye's panel. */
    tree?: Scenario;
    outlets?: Record<string, { flowGpm: number; isolated: boolean; nozzlePsi: number | null }>;
    onTree?: (s: Scenario) => void;
    onLine?: (path: string[]) => void;
  } = $props();

  const unavailable = $derived(result.pump?.pressurePsi === null && result.pump?.status !== "empty");
  const last = $derived(scenario.sections.length - 1);
  const floorOf = (m: number) => {
    const n = Math.round((m / floorM) * 1000) / 1000;
    if (n < 0) return Number.isInteger(n) ? `piso ${n}` : `entre pisos (${n.toFixed(1)})`;
    return Number.isInteger(n) ? `piso ${n + 1}` : `entre pisos (${(n + 1).toFixed(1)})`;
  };
  const specShort = (spec: (typeof NOZZLE_SPECS)[number]) =>
    spec.design === "open-end"
      ? scenario.nozzle.design === "open-end" ? "Punta abierta" : "Quitar pitón"
      : spec.design === "smooth-bore"
        ? `${tipName(spec.tipIn ?? 0)} · ${u.q(spec.ratedFlowGpm)} ${u.flow}`
        : spec.kind === "selectable" ? `Selector ${u.q(spec.settingsGpm[0], 0)}–${u.q(spec.settingsGpm.at(-1), 0)} ${u.flow}` : `${u.q(spec.ratedFlowGpm)} ${u.flow}`;
  const design = $derived(scenario.nozzle.design ?? "fog");
  const displayNozzle = $derived(resolvedNozzle(scenario.sections, scenario.nozzle));
  const nozzleSpec = $derived(NOZZLE_SPECS.find((spec) => spec.id === scenario.nozzle.specId));
  const manufacturer: Source | null = $derived(nozzleSpec?.manufacturerSource ? SOURCES[nozzleSpec.manufacturerSource] : null);
  const nozzleInlet = $derived(scenario.nozzle.inletIn ?? nozzleSpec?.inletIn);
  const hoseCoupling = $derived(couplingOf(scenario.sections[last]));
  const manufacturerSpecs = NOZZLE_SPECS.filter((spec) => spec.manufacturerSource);

  /** Below its rating by more than 5 %: it gives less than its rated flow (MODEL §3.13). An open end has no rating. */
  const short = $derived(
    design !== "open-end" && result.state === "flowing" && result.nozzlePressurePsi !== null && result.nozzlePressurePsi < scenario.nozzle.ratedPressurePsi * 0.95,
  );
  const nozzleKind = $derived(
    design === "smooth-bore"
      ? `Boquilla ${tipName(scenario.nozzle.tipIn ?? 0)} · ${u.q(displayNozzle.ratedFlowGpm)} ${u.flow}`
      : scenario.nozzle.kind === "selectable" ? "Selector de caudal" : "Caudal fijo",
  );
  /** The engine's reaction at the solved flow (MODEL.md §3.6); the panel only formats it. */
  const reaction = $derived(reactionAt(scenario, result, scenario.methodId));
  const fmt = (x: number, digits = 2) => x.toLocaleString("es-PE", { maximumFractionDigits: digits });
  function tipName(d: number) {
    const eighths = Math.round(d * 16);
    const whole = Math.floor(eighths / 16);
    const rest = eighths % 16;
    const g = rest === 0 ? 1 : rest % 8 === 0 ? 8 : rest % 4 === 0 ? 4 : rest % 2 === 0 ? 2 : 1;
    const frac = rest === 0 ? "" : `${rest / g}/${16 / g}`;
    return `${whole ? whole + (frac ? " " : "") : ""}${frac}″`;
  }
  const specGroups = $derived([
    { label: "Combinado", design: "fog" },
    { label: `Chorro sólido · ${u.p(50, 0)} ${u.pressure}`, design: "smooth-bore" },
    { label: "Sin pitón", design: "open-end" },
  ] as const);
</script>

{#snippet closeSelection()}
  {#if selection}
    <button type="button" class="close" aria-label="Quitar selección (Esc)" title="Quitar selección (Esc)" onclick={onClose}>×</button>
  {/if}
{/snippet}

<aside class="inspector">
  {#if selection === null}
    <header class:sticky={selection !== null}>
      {@render closeSelection()}
      <h3>Partes</h3>
      <p>Toca una parte, aquí o en el dibujo, para editarla. Clic derecho o mantener pulsado: más opciones.</p>
    </header>
    <nav class="parts" aria-label="Partes de la línea">
      <button type="button" onclick={() => onSelect({ kind: "pump" })}>Bomba · descargas</button>
      {#each scenario.sections as s, i (i)}
        <button type="button" onclick={() => onSelect({ kind: "section", index: i })}>Tramo {i + 1} · {u.l(s.lengthM)} {u.length} de {s.diameterIn.toString().replace(".5", "½")}″</button>
        {#if i < last}<button type="button" class="joint" onclick={() => onSelect({ kind: "joint", index: i + 1 })}>{jointName(scenario, i + 1)}</button>{/if}
      {/each}
      {#if !scenario.wye}<button type="button" onclick={() => onSelect({ kind: "nozzle" })}>{scenario.nozzle.design === "open-end" ? "Punta abierta · sin pitón" : `Pitón · ${scenario.nozzle.open ? "abierto" : "cerrado"}`}</button>{/if}
    </nav>
  {:else if selection.kind === "pump"}
    {@const outlet = scenario.source.outletSizeIn}
    <header class:sticky={selection !== null}>
      {@render closeSelection()}
      <h3>Bomba · descargas</h3>
      <p>{tree?.discharges ? "Descarga seleccionada" : "Descarga 1"} → línea de {scenario.sections.length} {scenario.sections.length === 1 ? "tramo" : "tramos"} · la presión, arriba</p>
    </header>
    <div>
      <div class="label">Tamaño de la salida</div>
      <div class="seg" role="radiogroup" aria-label="Tamaño de la salida">
        {#if !tree?.discharges}<button type="button" role="radio" aria-checked={outlet === undefined} class:on={outlet === undefined} onclick={() => onchange(edit.setOutletSize(scenario, undefined))}>Igual a la manguera</button>{/if}
        {#each [1.5, 2.5, 3] as d (d)}
          <button type="button" role="radio" aria-checked={outlet === d} class:on={outlet === d} onclick={() => onchange(edit.setOutletSize(scenario, d))}>{d.toString().replace(".5", "½")}″</button>
        {/each}
      </div>
    </div>
    <JointControls {scenario} flowGpm={jointFlowGpm(result, 0)} joint={0} onToggle={(kind) => onchange(edit.toggleFitting(scenario, 0, kind))} />
  {:else if selection.kind === "nozzle"}
    {@const n = displayNozzle}
    <header class:sticky={selection !== null}>
      {@render closeSelection()}
      {#if design === "open-end"}
        <h3>Sin pitón</h3>
        <p>Punta abierta · el agua sale por el acople de {tipName(endBoreIn(scenario.sections))}</p>
      {:else}
        <h3>{manufacturer ? nozzleSpec?.label : design === "smooth-bore" ? "Pitón de chorro sólido" : n.kind === "selectable" ? "Pitón combinado" : "Pitón"}</h3>
        <p>{nozzleKind} · {u.p(n.ratedPressurePsi)} {u.pressure} nominal{manufacturer ? " · ficha del fabricante" : n.specId === null || !nozzleSpec ? " · personalizado" : " · genérico"}</p>
      {/if}
    </header>
    {#if design === "open-end"}
      <p class="note">
        No hay manija: la línea fluye mientras esté cargada, y se corta en la bomba. Sin boquilla, la manguera
        misma limita el caudal: mucha agua, poca presión en la punta y un chorro sin forma. Q = 29,84 · c · d² · √p
        con c = 0,90 supuesto (boca de hidrante, NFPA 291; no hay coeficiente publicado para una manguera abierta).
      </p>
    {:else if design === "smooth-bore"}
      <section class="operate" aria-label="Operar el pitón">
        <div>
          <div class="label">Manija</div>
          <div class="lever" role="radiogroup" aria-label="Manija" data-tour="manija">
            <button type="button" role="radio" aria-checked={!n.open} class:on={!n.open} onclick={() => onchange(edit.setNozzleOpen(scenario, false))}>Cerrado</button>
            <button type="button" role="radio" aria-checked={n.open} class:on={n.open} onclick={() => onchange(edit.setNozzleOpen(scenario, true))}>Abierto</button>
          </div>
        </div>
        <p class="note">Chorro sólido: sin anillo ni patrón; el caudal sale de la boquilla, Q = 29,7 · d² · √NP.</p>
      </section>
    {:else}

    <!-- Operating controls first, so they show at the phone sheet's peek (UX.md §10.7, UX-03); choosing the model is configuration and comes after. -->
    <!-- Drawn (Close-up) or plain controls, by preference; both complete (UX.md §10.1). -->
    {#if prefs.controls === "drawn"}
      <NozzleCloseUp
        nozzle={n}
        flowGpm={result.flowGpm}
        onOpen={(open) => onchange(edit.setNozzleOpen(scenario, open))}
        onSetting={(q) => onchange(edit.setNozzleSetting(scenario, q))}
        onPattern={(p) => onchange(edit.setNozzlePattern(scenario, p))}
      />
    {:else}
    <section class="operate" aria-label="Operar el pitón">
      <div>
        <div class="label">Manija</div>
        <div class="lever" role="radiogroup" aria-label="Manija" data-tour="manija">
          <button type="button" role="radio" aria-checked={!n.open} class:on={!n.open} onclick={() => onchange(edit.setNozzleOpen(scenario, false))}>Cerrado</button>
          <button type="button" role="radio" aria-checked={n.open} class:on={n.open} onclick={() => onchange(edit.setNozzleOpen(scenario, true))}>Abierto</button>
        </div>
      </div>

      {#if n.kind === "selectable"}
        <div>
          <div class="label">Caudal (anillo) · {u.flow}</div>
          <div class="seg" role="radiogroup" aria-label="Caudal">
            {#each n.settingsGpm as q (q)}
              <button type="button" role="radio" aria-checked={q === n.ratedFlowGpm} class:on={q === n.ratedFlowGpm} onclick={() => onchange(edit.setNozzleSetting(scenario, q))}>{u.q(q, 0)}</button>
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
          aria-label="Patrón: chorro directo a neblina amplia"
          value={n.pattern}
          oninput={(e) => onchange(edit.setNozzlePattern(scenario, e.currentTarget.valueAsNumber))}
        />
        <div class="ends"><span>Chorro directo</span><span>Neblina amplia</span></div>
      </div>
    </section>
    {/if}
    <div class="style-switch">
      <button type="button" onclick={() => setControls(prefs.controls === "drawn" ? "plain" : "drawn")}>{prefs.controls === "drawn" ? "Ver controles simples" : "Ver pitón dibujado"}</button>
    </div>
    {/if}

    {#if manufacturer && nozzleSpec && design !== "open-end"}
      <section class="equipment-rating" aria-label="Ficha del pitón">
        <div><span>Nominal seleccionado</span><b>{u.q(n.ratedFlowGpm)} {u.flow} a {u.p(n.ratedPressurePsi)} {u.pressure}</b></div>
        <div><span>Entrega calculada</span><b>{unavailable ? "—" : u.q(result.flowGpm)} {u.flow} · {u.p(result.nozzlePressurePsi)} {u.pressure}</b></div>
        <div><span>Entrada</span><b>{tipName(nozzleInlet ?? nozzleSpec.inletIn)} · {nozzleInlet === hoseCoupling ? "acople directo" : "requiere adaptador"}</b></div>
        <details>
          <summary>Ficha y alcance del modelo</summary>
          <p><a href={manufacturer.url} target="_blank" rel="noreferrer">{manufacturer.publisher}: {manufacturer.title}</a></p>
          <p>Fuera del punto nominal, el caudal se aproxima con Q ∝ √NP; no es una curva medida de este pitón. El patrón es visual y la reacción es calculada.</p>
          {#if n.kind === "selectable"}<p>Al elegir el modelo, el simulador inicia en {u.q(95, 0)} {u.flow}; no indica una posición de fábrica.</p>{/if}
          <p>La conexión compara diámetros; no verifica el tipo de rosca.</p>
        </details>
      </section>
    {/if}

    <!-- The force on the hands at the solved flow (MODEL.md §3.6, §7): the engine's numbers, formula substituted. -->
    {#if result.pump?.status === "empty"}<p class="warn" role="status">Tanque vacío · 0 {u.flow}. Rellena el tanque en Abastecimiento; la presión aguas abajo es desconocida.</p>{/if}
    {#if unavailable}
      <p class="warn" role="status">Sin resultado hidráulico: la tendida está fuera del modelo de bomba disponible.</p>
    {:else}
    <div class="reaction" role="status">
      <div><span class="label">Reacción</span> <b>{fmt(reaction.lbf, 0)} lbf</b> · {fmt(reaction.kgf, 0)} kgf</div>
      <div class="formula">
        <small>Fórmula de la fuente: diámetros en in, Q en US gpm, presión en psi.</small><br />
        {#if reaction.law === "smooth-bore"}
          NR = 1.57 · d² · NP = 1.57 × {fmt(reaction.inputs.tipIn, 4)}² × {fmt(reaction.inputs.nozzlePressurePsi, 1)} · Task Force Tips
        {:else if reaction.law === "fog"}
          NR = 0.0505 · Q · √NP = 0.0505 × {fmt(reaction.inputs.flowGpm, 1)} × √{fmt(reaction.inputs.nozzlePressurePsi, 1)} · Task Force Tips
        {:else if reaction.law === "fog-kg-per-gpm"}
          kg ≈ {fmt(reaction.inputs.kgfPerGpm)} × Q = {fmt(reaction.inputs.kgfPerGpm)} × {fmt(reaction.inputs.flowGpm, 1)} · Manual de Hidráulica CGBVP 2019, p. 46, válida a {u.p(reaction.inputs.atPsi)} {u.pressure}
        {:else}
          NR = 1.57 · c · d² · p = 1.57 × {fmt(reaction.inputs.coefficient)} × {fmt(reaction.inputs.boreIn, 3)}² × {fmt(reaction.inputs.pressurePsi, 1)} · cantidad de movimiento del chorro
        {/if}
      </div>
    </div>

    {/if}

    <!-- After the controls, so it appearing mid-turn doesn't move them under the finger. -->
    {#if short}
      <p class="warn" role="status">
        ⚠ {u.p(result.nozzlePressurePsi, 0)} {u.pressure} en el pitón, por debajo de sus {u.p(n.ratedPressurePsi)} {u.pressure} nominales: da
        {u.q(result.flowGpm, 0)} {u.flow}, no {u.q(n.ratedFlowGpm, 0)} {u.flow}. {branched ? "Sube la presión de la bomba o revisa las líneas abiertas." : "Sube la presión o toca «Ideal» en la bomba."}
      </p>
    {/if}

    <div>
      <label class="label" for="manufacturer-nozzle">Modelo de fabricante</label>
      <select id="manufacturer-nozzle" class="model-picker" value={manufacturer && design !== "open-end" ? n.specId ?? "" : ""}
        onchange={(e) => onchange(edit.setNozzleSpec(scenario, e.currentTarget.value))}>
        <option value="" disabled>Elegir modelo…</option>
        {#each [true, false] as direct}
          {@const options = manufacturerSpecs.filter((spec) => (spec.inletIn === hoseCoupling) === direct)}
          {#if options.length}
            <optgroup label={direct ? "Acople directo" : "Requiere adaptador"}>
              {#each options as spec (spec.id)}<option value={spec.id}>{spec.label}</option>{/each}
            </optgroup>
          {/if}
        {/each}
      </select>
      <div class="sublabel">Modelos genéricos</div>
      {#each specGroups as group (group.design)}
        <div class="sublabel">{group.label}</div>
        <div class="seg wrap" role="radiogroup" aria-label={`Modelo de pitón: ${group.label}`}>
          {#each NOZZLE_SPECS.filter((spec) => !spec.manufacturerSource && spec.design === group.design) as spec (spec.id)}
            {@const on = spec.design === "open-end" ? design === "open-end" : design !== "open-end" && n.specId === spec.id}
            <button type="button" role="radio" aria-checked={on} class:on title={spec.label} onclick={() => onchange(edit.setNozzleSpec(scenario, spec.id))}>{specShort(spec)}</button>
          {/each}
          {#if group.design === "fog" && n.specId === null && design === "fog"}<button type="button" role="radio" aria-checked="true" class="on" disabled>Personalizado</button>{/if}
        </div>
      {/each}
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

    {#if design === "fog"}
    <details>
      <summary>Ajustes avanzados</summary>
      <NumberField label="Caudal nominal" value={n.ratedFlowGpm} unit="gpm" step={5} digits={0} onchange={(q) => onchange(edit.setNozzleRating(scenario, { ratedFlowGpm: q }))} />
      <NumberField label="Presión nominal" value={n.ratedPressurePsi} unit="psi" step={5} digits={0} onchange={(p) => onchange(edit.setNozzleRating(scenario, { ratedPressurePsi: p }))} />
    </details>
    {/if}

    <JointControls {scenario} flowGpm={jointFlowGpm(result, last + 1)} joint={last + 1} onToggle={(kind) => onchange(edit.toggleFitting(scenario, last + 1, kind))} />
  {:else if selection.kind === "joint" && tree && onTree && onLine && junctionAt(scenario, selection.index) && !junctionAt(scenario, selection.index)?.pump}
    {@const wye = junctionAt(scenario, selection.index)!}
    <header class:sticky={selection !== null}>
      {@render closeSelection()}
      <h3>{jointName(scenario, selection.index)}</h3>
      <p>Cada salida tiene su válvula: toca la palanca para abrir o cerrar · arrastra el bifurco para moverlo</p>
    </header>
    <JunctionPanel {tree} junction={wye} {outlets} {onTree} {onLine} />
  {:else if selection.kind === "joint"}
    {@const j = selection.index}
    <header class:sticky={selection !== null}>
      {@render closeSelection()}
      <h3>{jointName(scenario, j)}</h3>
      <p>{j === 0 ? "Entre la bomba y el tramo 1" : `Entre el tramo ${j} y el tramo ${j + 1}`} · arrastra el acople para moverlo</p>
    </header>
    <JointControls {scenario} flowGpm={jointFlowGpm(result, j)} joint={j} titled={false} onToggle={(kind) => onchange(edit.toggleFitting(scenario, j, kind))} />
  {:else}
    {@const i = selection.index}
    {@const s = scenario.sections[i]}
    <header class:sticky={selection !== null}>
      {@render closeSelection()}
      <h3>Tramo {i + 1} de {scenario.sections.length}</h3>
      <p>C = {s.frictionCoefficient} · {s.hoseSizeId ? "valor publicado" : "valor manual"}</p>
    </header>
    <label class="field">
      <span class="label">Diámetro</span>
      <select value={s.hoseSizeId ?? ""} onchange={(e) => onchange(edit.setSectionHose(scenario, i, e.currentTarget.value))}>
        {#if s.hoseSizeId === null}<option value="">{s.diameterIn}″ (manual)</option>{/if}
        {#each HOSE_SIZES as size (size.id)}<option value={size.id}>{hoseSizeName(size, true)}</option>{/each}
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
    {#if !unavailable}<p class="loss">Fricción en este tramo: <b>{u.p((loss?.valuePsi ?? 0), 1)} {u.pressure}</b> a {u.q(sectionFlowGpm(result, i), 0)} {u.flow}</p>{/if}
    <p class="note">
      {floorOf(s.endElevationM)} · recorrido horizontal {u.l(run)} {u.length}{slack >= 0.5 ? ` · holgura ${u.l(slack, 1)} ${u.length}` : " · tenso"}
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
  .model-picker { width: 100%; min-height: 44px; margin: 6px 0 12px; padding: 8px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); font: inherit; }
  .equipment-rating { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--line); border-radius: 10px; font-size: 13px; }
  .equipment-rating > div { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .equipment-rating span { color: var(--muted); }
  .equipment-rating b { font-variant-numeric: tabular-nums; }
  .equipment-rating p { margin: 8px 0 0; }
  .equipment-rating a { color: var(--accent); }

  .inspector { position: relative; background: var(--surface); border-radius: var(--radius); padding: 14px; display: grid; gap: 14px; align-content: start; min-width: 0; }
  .inspector > * { min-width: 0; }
  .operate { display: grid; gap: 10px; }
  .reaction { display: grid; gap: 2px; padding: 8px 10px; border-radius: 8px; background: var(--band); }
  .reaction .formula { font-size: 12px; color: var(--muted); }
  .sublabel { font-size: 12px; color: var(--muted); margin: 6px 0 4px; }
  .style-switch { display: flex; justify-content: flex-end; margin: -8px 0 -6px; }
  .style-switch button { min-height: 44px; padding: 0 4px; border: 0; background: transparent; color: var(--accent); font-size: 13px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  header { position: relative; background: var(--surface); padding-bottom: 6px; }
  header.sticky { position: sticky; top: 0; z-index: 2; }
  .inspector :global(button), .inspector :global(input), .inspector :global(select) { scroll-margin-top: 100px; }
  header h3 { margin: 0; font-size: 16px; padding-right: 40px; }
  .close { position: absolute; top: -8px; right: -8px; width: 44px; height: 44px; border: 0; border-radius: 8px; background: transparent; font-size: 22px; color: var(--muted); cursor: pointer; }
  .close:hover { background: var(--band); color: var(--ink); }
  .parts { display: grid; gap: 4px; }
  .parts button { min-height: 44px; padding: 0 12px; text-align: left; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); cursor: pointer; font-size: 14px; }
  .parts .joint { min-height: 44px; margin-left: 16px; font-size: 13px; color: var(--muted); border-style: dashed; }
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
