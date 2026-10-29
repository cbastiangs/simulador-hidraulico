<script lang="ts">
  import { u } from "$lib/display-units.svelte.ts";
  import { WATEROUS_CX, type PumpOperation, type PumpPoint } from "$hydraulics/pump.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import NumberField from "./NumberField.svelte";
  let { scenario, operation, onchange }: { scenario: Scenario; operation?: PumpOperation; onchange: (s: Scenario) => void } = $props();
  const pump = $derived(scenario.source.pump);
  function choose(real: boolean) {
    onchange({ ...scenario, source: { ...scenario.source, pump: real
      ? { curve: structuredClone(WATEROUS_CX), mode: "pressure", speedRpm: 4000 } : undefined } });
  }
  function control(changes: Partial<NonNullable<typeof pump>>) {
    if (pump) onchange({ ...scenario, source: { ...scenario.source, pump: { ...pump, ...changes } } });
  }
  const maxQ = $derived(Math.max(1, ...(operation?.curve.map(p => p.flowGpm) ?? [])));
  const maxP = $derived(Math.max(1, ...(operation?.curve.map(p => p.pressurePsi) ?? [])));
  const x = (q: number) => 44 + 260 * q / maxQ;
  const y = (p: number) => 174 - 140 * p / maxP;
  const points = (ps: PumpPoint[]) => ps.map(p => `${x(p.flowGpm)},${y(p.pressurePsi)}`).join(" ");
  const systemPath = (ps: (PumpPoint | null)[]) => ps.map((p, i) => p
    ? `${i === 0 || ps[i - 1] === null ? "M" : "L"}${x(p.flowGpm)},${y(p.pressurePsi)}` : "").join(" ");
  const status = $derived(operation ? {
    empty: "Tanque vacío · sin entrega",
    holding: "Mantiene la presión solicitada", limited: "Capacidad alcanzada · la presión cae",
    rpm: "RPM fijas · la presión depende de la tendida", stopped: "Bomba detenida",
    "outside-curve": "Fuera de la curva publicada · sin resultado", unbalanced: "Sin equilibrio exacto · revisa la tendida",
  }[operation.status] : "");
</script>
<section class="pump-model" aria-label="Modelo de bomba">
  <label for="pump-model">Bomba</label>
  <select id="pump-model" value={pump ? "cx" : "ideal"} onchange={e => choose(e.currentTarget.value === "cx")}>
    <option value="ideal">Fuente ideal · presión fija</option>
    <option value="cx">Waterous CX · familia</option>
  </select>
  {#if pump}
    <p>Familia CX · no calibrada a M11-5. Admisión a {u.p(0, 0)} {u.pressure}; sin límite de potencia del motor ni de caudal de admisión.</p>
    <div class="modes" role="group" aria-label="Control de la bomba">
      <button type="button" aria-pressed={pump.mode === "pressure"} onclick={() => control({ mode: "pressure" })}>Presión</button>
      <button type="button" aria-pressed={pump.mode === "rpm"} onclick={() => control({ mode: "rpm" })}>RPM fijas</button>
    </div>
    <NumberField label={pump.mode === "pressure" ? "Límite de giro · eje de bomba" : "Giro · eje de bomba"}
      value={pump.speedRpm} unit="rpm" step={100} digits={0}
      onchange={n => control({ speedRpm: n <= 0 ? 0 : Math.min(pump!.curve.maxRpm, Math.max(pump!.curve.minRpm, n)) })} />
    <p>{pump.curve.minRpm}–{pump.curve.maxRpm} rpm de eje, no de motor; 0 detiene la bomba.</p>
    {#if operation}
      <strong class="status" role="status">{status}</strong>
      <div class="readings">
        <span>Solicitada: {pump.mode === "pressure" ? `${u.p(scenario.source.pressurePsi, 0)} ${u.pressure}` : "control por RPM"}</span>
        <b>Descarga: {u.p(operation.pressurePsi)} {u.pressure} · {u.q(operation.flowGpm)} {u.flow}</b>
      </div>
      {#if operation.status === "limited"}<p>La tendida demanda más agua de la que la bomba sostiene a la presión solicitada. La descarga real baja hasta equilibrarse. Cerrar una salida o cambiar el límite de giro cambia ese equilibrio.</p>
      {:else if operation.status === "outside-curve"}<p>La tendida exige un punto fuera de los datos disponibles. Reduce la demanda cerrando una salida o elige otra configuración; el modelo no puede afirmar cuánto entregaría aquí.</p>
      {:else if operation.status === "holding"}<p>La bomba puede sostener la presión solicitada con las salidas abiertas actualmente.</p>
      {:else if operation.status === "unbalanced"}<p>Las pérdidas o una condición de la manguera impiden equilibrar esta tendida. Revisa los avisos del cálculo y modifica la presión o la configuración.</p>{/if}
      {#if pump.speedRpm > 0 && operation.status !== "empty"}
        <svg viewBox="0 0 340 212" role="img" aria-label="Curva de bomba y demanda de la tendida, con el punto de operación">
          <path d="M44 28 V174 H312" class="axis" />
          <text x="8" y="22">{u.pressure}</text><text x="282" y="205">{u.flow}</text>
          <text x="36" y="178" text-anchor="end">0</text>
          <text x="36" y="38" text-anchor="end">{u.p(maxP, 0)}</text>
          <text x="304" y="190" text-anchor="end">{u.q(maxQ, 0)}</text>
          <polyline class="supply" points={points(operation.curve)} />
          <path class="system" d={systemPath(operation.system)} />
          {#if pump.mode === "pressure" && scenario.source.pressurePsi <= maxP}
            <line class="request" x1="44" x2="304" y1={y(scenario.source.pressurePsi)} y2={y(scenario.source.pressurePsi)} />
          {/if}
          {#if operation.pressurePsi !== null && operation.flowGpm !== null}
            <circle class="point" cx={x(operation.flowGpm)} cy={y(operation.pressurePsi)} r="5" />
          {/if}
        </svg>
        <div class="legend"><span class="supply-key">— Bomba</span><span class="system-key">– – Tendida</span><span>● Operación</span></div>
      {/if}
    {/if}
    <details>
      <summary>Fuente y límites</summary>
      <p><a href="https://waterousco.com/media/pdfs/810304.pdf" target="_blank" rel="noreferrer">Waterous 810304 · revisión 2020</a>, impulsores 71888/71896. Puntos leídos a 4000 rpm (aprox. ±3 psi), interpolación lineal; otras velocidades por leyes de afinidad.</p>
      <p>El límite de este modelo es 4800 rpm; el documento indica 5200 rpm y 350 psi máximos. No se extrapola más allá del caudal de la curva. No modela cavitación ni transitorios.</p>
    </details>
  {/if}
</section>
<style>
  .pump-model { background: var(--surface); border-radius: var(--radius); padding: 14px; display: grid; gap: 12px; }
  label { font-weight: 700; }
  .pump-model :global(input[type=number]) { width: 6rem; }
  select, button { min-height: 44px; background: var(--surface); color: var(--ink); border: 1px solid var(--line); border-radius: 8px; padding: 8px; font: inherit; }
  select { width: 100%; min-width: 0; }
  .modes { display: flex; gap: 8px; }.modes button { flex: 1; cursor: pointer; }
  button[aria-pressed=true] { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
  p { font-size: 13px; color: var(--muted); margin: 0; }
  .readings { display: grid; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
  .status { font-size: 14px; } svg { width: 100%; height: auto; } text { fill: var(--muted); font-size: 12px; }
  .axis { fill: none; stroke: var(--muted); }.supply, .system { fill: none; stroke-width: 2.5; }
  .supply { stroke: var(--accent); }.system { stroke: var(--warn); stroke-dasharray: 6 4; }
  .request { stroke: var(--muted); stroke-dasharray: 2 4; }.point { fill: var(--ink); stroke: var(--surface); stroke-width: 2; }
  .legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; }.supply-key { color: var(--accent); }.system-key { color: var(--warn); }
  summary { min-height: 44px; cursor: pointer; color: var(--accent); } details p + p { margin-top: 8px; } a { color: var(--accent); }
</style>
