<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import type { SeriesResult } from "$hydraulics/series.ts";
  import { hoseVelocityMps, nozzleExitVelocityMps } from "$hydraulics/velocity.ts";

  // Pressure, flow and speed are three different things (MODEL.md §3.13), shown
  // with this scenario's own numbers. Every value comes from the engine's result.
  let { scenario, result }: { scenario: Scenario; result: SeriesResult } = $props();

  const f = (n: number, digits = 1) => n.toFixed(digits);
  const flowing = $derived(result.state === "flowing");
  const pump = $derived(result.nodes[0].pressurePsi);
  /** Pressure at the nozzle with no flow: the pump's pressure minus the height. */
  const staticPsi = $derived(pump - result.elevationPressurePsi);
  const last = $derived(scenario.sections[scenario.sections.length - 1]);
  const n = $derived(scenario.nozzle);
</script>

<details class="card">
  <summary>Conceptos · presión, caudal y velocidad (con los números de esta línea)</summary>
  <dl>
    <dt>Presión estática en el pitón <b>{f(staticPsi)} psi</b></dt>
    <dd>La que hay sin que corra agua: presión de la bomba menos la altura. Con el pitón cerrado es lo que marcan todos los manómetros.</dd>

    <dt>Presión de flujo en el pitón <b>{flowing ? `${f(result.nozzlePressurePsi)} psi` : "—"}</b></dt>
    <dd>
      Con agua corriendo: la estática menos la fricción de las mangueras. Es la presión en la <i>entrada</i> del pitón,
      detrás de la abertura. A poco caudal la fricción casi desaparece y esta presión se acerca a la estática:
      un manómetro «bueno» no dice cuánta agua llega.
    </dd>

    <dt>Presión a la salida <b>0 psi</b></dt>
    <dd>El chorro sale al aire: presión atmosférica, en cualquier ajuste. La presión se convirtió en velocidad.</dd>

    <dt>Caudal <b>{f(result.flowGpm)} gpm</b></dt>
    <dd>Volumen de agua por minuto. No se elige: lo resuelven la presión, la abertura del pitón y las mangueras.</dd>

    <dt>Velocidad en la manguera <b>{flowing ? `${f(hoseVelocityMps(result.flowGpm, last.diameterIn))} m/s` : "—"}</b></dt>
    <dd>Caudal ÷ sección de la manguera (continuidad). Una manguera más angosta con el mismo caudal va más rápida.</dd>

    <dt>Velocidad del chorro <b>{flowing ? `${f(nozzleExitVelocityMps(result.nozzlePressurePsi))} m/s` : "—"}</b></dt>
    <dd>
      Depende solo de la presión en el pitón (12,18·√NP ft/s), no del caudal. Un ajuste menor da un chorro más rápido
      pero más fino: velocidad no es caudal.
    </dd>

    <dt>Clasificación del fabricante <b>{n.ratedFlowGpm} gpm a {n.ratedPressurePsi} psi</b></dt>
    <dd>
      Es el par con que se calibró este ajuste: con {n.ratedPressurePsi} psi en la entrada, esta abertura deja pasar
      {n.ratedFlowGpm} gpm. No es la presión que tendrás: esa ({flowing ? `${f(result.nozzlePressurePsi)} psi` : "—"})
      sale de la bomba y la línea, y se calcula con Q ∝ √P. «Ajustar»
      ({f(result.requiredPumpPressurePsi)} psi, la presión requerida) pone la <b>bomba</b> en la presión con que el pitón trabaja en su clasificación.
    </dd>
  </dl>
</details>

<style>
  .card { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; }
  summary { cursor: pointer; color: var(--accent); }
  details[open] summary { margin-bottom: 8px; }
  dl { margin: 0; display: grid; gap: 2px; }
  dt { margin-top: 10px; font-weight: 600; display: flex; justify-content: space-between; gap: 12px; }
  dt b { font-variant-numeric: tabular-nums; }
  dd { margin: 2px 0 0; color: var(--muted); font-size: 14px; }
</style>
