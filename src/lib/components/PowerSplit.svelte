<script lang="ts">
  import { kilowatts, type PowerSplit } from "$hydraulics/power.ts";
  import { GPM_PSI_PER_HORSEPOWER } from "$hydraulics/units.ts";

  // Where the pump's work goes across the whole lay (MODEL.md §3.8, UX.md §3):
  // the one quantity that adds up across lines. Percentages lead; hp and kW
  // sit one tap away with what power is, never a bare "hp" (owner, 2026-10-17).
  // Shown on branched lays only: on a single line it repeats the pressure split.
  type LineRow = { key: string; name: string; color: string; openEnd: boolean };
  let {
    split,
    flowGpm,
    pumpPsi,
    lines,
    reference = null,
    referenceLabel = "",
  }: {
    split: PowerSplit;
    /** The pump's total flow and discharge pressure, for the formula. */
    flowGpm: number;
    pumpPsi: number;
    lines: LineRow[];
    /** The "Comparar con" method's split, or null when comparing is off. */
    reference?: PowerSplit | null;
    referenceLabel?: string;
  } = $props();

  const flowing = $derived(split.wholeHp > 0);
  /** In the 350 gpm rule's gap the parts don't quite add up to the pump (MODEL.md §2). */
  const approx = $derived(Math.abs(split.residualHp) > 0.01 ? "≈ " : "");
  const share = (hp: number) => (split.wholeHp > 0 ? (Math.max(0, hp) / split.wholeHp) * 100 : 0);
  const pct = (hp: number) => `${share(hp).toFixed(0)} %`;
  const width = (hp: number) => `${share(hp)}%`;
  const hp = (v: number) => v.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const kw = (v: number) => hp(kilowatts(v));
  const lineOf = (path: string[]) => lines.find((l) => l.key === path.join("/"));
  const allOpen = $derived(lines.length > 0 && lines.every((l) => l.openEnd));
  const streamWord = $derived(allOpen ? "las puntas abiertas" : "los chorros");
  /** The sentence's parts, largest first after the streams; empty ones left out. */
  const spent = $derived(
    [
      { hp: split.frictionHp, text: "se pierde en fricción" },
      { hp: split.heightHp, text: "sube el agua" },
      { hp: split.fittingsHp, text: "en accesorios" },
    ].filter((p) => share(p.hp) >= 0.5),
  );
</script>

<section class="power">
  <div class="row">
    <span>¿En qué se gasta lo que entrega la bomba?</span>
    <span class="scope">Toda la tendida</span>
  </div>
  {#if flowing}
    <div class="bar" aria-hidden="true">
      <div class="nozzle" style:width={width(split.streamsHp)}>Chorros {pct(split.streamsHp)}</div>
      <div class="friction" style:width={width(split.frictionHp)}>Fricción {pct(split.frictionHp)}</div>
      {#if split.fittingsHp > 0}<div class="fittings" style:width={width(split.fittingsHp)}>{pct(split.fittingsHp)}</div>{/if}
      {#if split.heightHp > 0}<div class="elevation" style:width={width(split.heightHp)}>{pct(split.heightHp)}</div>{/if}
    </div>
    <p class="sentence">
      De todo lo que entrega la bomba, {approx}<b>{pct(split.streamsHp)}</b> llega a {streamWord}{#each spent as p, i}{i === spent.length - 1 ? " y " : ", "}<b>{pct(p.hp)}</b> {p.text}{/each}.
      {#if split.creditHp > 0}La bajada devuelve el equivalente a {pct(split.creditHp)} (no ocupa barra).{/if}
    </p>
    <p class="efficiency">
      <b>Eficiencia de la tendida: {approx}{pct(split.streamsHp)}</b>
      <span>· la parte del trabajo de la bomba que termina en {streamWord}{#if reference}; {referenceLabel}: {reference.wholeHp > 0 ? `${(reference.efficiency * 100).toFixed(0)} %` : "sin caudal"}{/if}</span>
    </p>
    {#if split.streams.length > 1}
      <ul class="streams" aria-label="Chorros por línea">
        <li>Chorros por línea:</li>
        {#each split.streams as s (s.path.join("/"))}
          {@const l = lineOf(s.path)}
          <li><span class="line-dot" style:background={l?.color ?? "var(--muted)"}></span>{l?.name ?? s.path.join(" › ")}{l?.openEnd ? " (punta abierta)" : ""} <b>{pct(s.hp)}</b></li>
        {/each}
      </ul>
    {/if}
    <details>
      <summary>Ver en potencia (hp y kW)</summary>
      <p>
        <b>Potencia = caudal × presión.</b> Es el trabajo que la bomba hace sobre el agua por minuto: la presión dice con
        cuánta fuerza empuja, el caudal cuánta agua mueve, la potencia es las dos cosas juntas. Cada psi que la barra de presión
        muestra gastado es trabajo que pierde cada galón; la potencia es eso por los galones de cada minuto.
      </p>
      <p>
        En el curso se calcula con presión porque es lo que el operador fija y lee. Pero las presiones de dos líneas no se suman
        (cada una gasta toda la presión de la bomba en su camino); la potencia sí: la alimentación cuenta con el caudal total y
        cada línea con el suyo. Por eso esta barra es la de toda la tendida.
      </p>
      <table>
        <tbody>
          <tr><td><span class="swatch nozzle"></span>Chorros</td><td>{hp(split.streamsHp)} hp</td><td>{kw(split.streamsHp)} kW</td></tr>
          <tr><td><span class="swatch friction"></span>Fricción</td><td>{hp(split.frictionHp)} hp</td><td>{kw(split.frictionHp)} kW</td></tr>
          {#if split.fittingsHp > 0}<tr><td><span class="swatch fittings"></span>Accesorios</td><td>{hp(split.fittingsHp)} hp</td><td>{kw(split.fittingsHp)} kW</td></tr>{/if}
          {#if split.heightHp > 0}<tr><td><span class="swatch elevation"></span>Desnivel</td><td>{hp(split.heightHp)} hp</td><td>{kw(split.heightHp)} kW</td></tr>{/if}
          {#if split.creditHp > 0}<tr><td>La bajada devuelve</td><td>−{hp(split.creditHp)} hp</td><td>−{kw(split.creditHp)} kW</td></tr>{/if}
          <tr class="total"><td>Bomba</td><td>{hp(split.pumpHp)} hp</td><td>{kw(split.pumpHp)} kW</td></tr>
        </tbody>
      </table>
      <p class="formula">
        W = Q · P / {GPM_PSI_PER_HORSEPOWER.toFixed(0)} = {flowGpm.toFixed(1)} gpm × {pumpPsi.toFixed(1)} psi / {GPM_PSI_PER_HORSEPOWER.toFixed(0)} = {hp(split.pumpHp)} hp.
        Cada parte, igual con el caudal que pasa por ella. 1 hp = 0,7457 kW.{#if approx} Con la regla de 350 gpm las partes no suman exacto la bomba.{/if}
      </p>
    </details>
  {:else}
    <p class="small">Sin caudal la bomba no entrega trabajo: solo sostiene la presión.</p>
  {/if}
</section>

<style>
  .power { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; display: grid; gap: 8px; }
  .row { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); font-size: 14px; }
  .scope { color: var(--ink); font-weight: 600; white-space: nowrap; }
  .bar { display: flex; height: 28px; border-radius: 6px; overflow: hidden; font-size: 12px; font-weight: 700; color: #fff; background: var(--band); }
  .bar div { display: flex; align-items: center; padding: 0 8px; white-space: nowrap; overflow: hidden; transition: width 250ms; }
  .sentence, .efficiency, .small, details p { margin: 0; font-size: 13px; color: var(--muted); }
  .sentence b, .efficiency b { color: var(--ink); }
  .streams { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 13px; color: var(--muted); }
  .streams li { display: flex; align-items: center; gap: 2px; }
  .streams b { color: var(--ink); margin-left: 4px; }
  details { display: grid; gap: 6px; }
  summary { cursor: pointer; color: var(--accent); font-size: 14px; }
  details[open] { gap: 8px; }
  details[open] summary { margin-bottom: 4px; }
  details p + p, details table, .formula { margin-top: 8px; }
  table { border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
  td { padding: 2px 12px 2px 0; }
  td + td { text-align: right; }
  tr.total td { border-top: 1px solid var(--band); font-weight: 700; padding-top: 4px; }
  .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
  .formula { font-family: ui-monospace, monospace; font-size: 12px; }
  .nozzle { background: var(--water); }
  .friction { background: var(--friction); }
  .elevation { background: var(--elevation); }
  .fittings { background: var(--fitting); }
</style>
