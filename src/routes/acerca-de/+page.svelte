<script lang="ts">
  import { resolve } from "$app/paths";
  import { METHODS, SOURCES, type SourceId } from "$hydraulics/references.ts";
  import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
  import { NOZZLE_REACH } from "$hydraulics/reach.ts";
  import { SOURCES as PRACTICE_SOURCES } from "../../extinguishment/references.ts";
  import { METHOD_LABELS } from "$lib/methods.ts";
  import { currentVersion, releaseDate, releases } from "$lib/novedades.ts";
  import { version } from "../../../package.json";

  const sections = [
    { id: "metodos", label: "Métodos" },
    { id: "alcance", label: "Alcance del chorro" },
    { id: "limites", label: "Límites del modelo" },
    { id: "fuentes", label: "Fuentes" },
    { id: "novedades", label: "Versión y novedades" },
  ];
  const base = METHODS.physical;
  const cgbvp = METHODS["cgbvp-2019"];
  const hydraulicSources = ["cgbvpManual2019", "coloradoPumperChart", "tftReaction", "temeculaFireFlow"] satisfies SourceId[];
  const equipmentSources = [...new Set(NOZZLE_SPECS.flatMap(spec => spec.manufacturerSource ? [spec.manufacturerSource] : []))];
  const nfa = PRACTICE_SOURCES.nfaInitialCompanyOperations;
  const reachModels = NOZZLE_SPECS.filter(spec => Object.hasOwn(NOZZLE_REACH, spec.id));
  const reachLabel = (specId: string, label: string) => specId.startsWith("smooth-bore")
    ? label.split(" @ ")[0]
    : label.split(" · ")[0];
  const decimal = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 3 });
</script>

<svelte:head>
  <title>Acerca de · Simulador hidráulico</title>
  <meta name="description" content="Métodos de cálculo, fuentes y límites del simulador hidráulico de tendidas." />
</svelte:head>

{#snippet source(id: SourceId)}
  {@const s = SOURCES[id]}
  <li>
    {#if "url" in s}<a href={s.url}>{s.title}</a>{:else}<strong>{s.title}</strong>{/if}
    <span class="citation">{s.publisher}{#if !s.published.startsWith("read ")} · {s.published}{/if}</span>
  </li>
{/snippet}

<main class="about-page">
  <header>
    <a class="back" href={resolve("/")}>← Volver al simulador</a>
    <h1>Acerca del simulador hidráulico</h1>
    <p>Explora cómo la bomba, la manguera, el desnivel y el pitón determinan la presión y el caudal de una tendida. Está pensado para práctica y enseñanza.</p>
  </header>

  <div class="reference">
    <nav aria-label="En esta página">
      {#each sections as section (section.id)}
        <a href={"#" + section.id}>{section.label}</a>
      {/each}
    </nav>

    <div class="content">
      <section id="metodos">
        <h2>Métodos de cálculo</h2>
        <p>El modelo calcula el caudal equilibrando la presión de la bomba con la presión que llega al pitón, la fricción, el desnivel y los accesorios. En Ajustes puedes elegir un método y comparar los resultados con el otro.</p>
        <dl>
          <dt>{METHOD_LABELS.physical}</dt>
          <dd>Aplica la presión hidrostática de {decimal.format(base.psiPerMeterOfHeight)} psi por metro. Para accesorios aplica la regla de entrenamiento de Colorado: {base.fittingStep?.lossPsi} psi por encima de {base.fittingStep?.aboveGpm} US gpm de caudal local.</dd>
          <dt>{METHOD_LABELS["cgbvp-2019"]}</dt>
          <dd>Usa {decimal.format(cgbvp.psiPerMeterOfHeight)} psi por metro y una pérdida fija de {cgbvp.fittingLossPsi?.adapter} psi por reductor, válvula o bifurco con flujo. Son reglas de entrenamiento del manual (pp. 44–45).</dd>
        </dl>
        <p>Ambos usan coeficientes publicados para estimar la fricción de las mangueras. El caudal del pitón se calcula con su presión de entrada y su ajuste nominal. Las fórmulas con los valores de cada tendida están en los resultados del simulador.</p>
      </section>

      <section id="alcance">
        <h2>Alcance del chorro</h2>
        <p>El alcance aproxima la distancia horizontal desde la salida del pitón hasta las gotas más lejanas a la misma altura. El valor basado en la tabla se muestra cuando la inclinación coincide con el ángulo de ensayo, el chorro es directo y la presión y el caudal están dentro del rango tabulado para ese modelo.</p>
        <ul class="ranges">
          {#each reachModels as model (model.id)}
            {@const range = NOZZLE_REACH[model.id]}
            <li><strong>{reachLabel(model.id, model.label)}</strong><span>{range.psi[0]}–{range.psi[1]} psi · {range.gpm[0]}–{range.gpm[1]} US gpm · {range.testAngleDeg != null ? `ensayo a ${range.testAngleDeg}°` : "ángulo sin indicar"}</span></li>
          {/each}
        </ul>
        <p>La curva visual es ilustrativa. En neblina, con pitones sin tabla o fuera del rango publicado, la medida «Dibujo ilustrativo» indica la distancia horizontal dibujada desde la boca del pitón. Si solo cambia la inclinación respecto del ensayo documentado, la proyección usa la geometría del dibujo. En esa geometría, 30° y 60° dan la misma distancia horizontal. La tabla de un solo ángulo no permite validar ese resultado.</p>
        <p>El porcentaje del panel indica la mayor diferencia entre la fórmula y los puntos de su tabla. El margen de error en campo es desconocido. El simulador omite el viento de frente, de cola y lateral.</p>
        <ul>
          <li><a href="https://www.fireresponse.com.au/wp-content/uploads/2022/04/flow-reach-turbojet-100-psi.pdf">Akron Brass · tabla de caudal y alcance del Turbojet</a><span class="citation">Chorro a 32° en aire quieto.</span></li>
          <li><a href="https://www.firearmour.com.sg/product/protek-handline-nozzle-368/">Protek 368 · tabla de caudal y alcance</a><span class="citation">Publicada por Fire Armour. La tabla no indica el ángulo.</span></li>
          <li><a href="https://media.idexcorp.com/m/219b47fe497c7f8c/original/2018-Akron-Brass-Catalog.pdf#page=175">Catálogo Akron Brass 2018 · datos de chorro sólido</a><span class="citation">Boquillas de 7/8″ y 15/16″.</span></li>
        </ul>
      </section>

      <section id="limites">
        <h2>Límites del modelo</h2>
        <ul>
          <li>El cálculo representa condiciones estables. Quedan fuera los transitorios, como el golpe de ariete.</li>
          <li>La curva Waterous CX representa una familia de bombas. El perfil M11-5 es aproximado y su curva requiere validación en el equipo.</li>
          <li>El alcance de las gotas y la referencia de caudal NFA sirven para comparar escenarios de práctica. La extinción depende de condiciones que el simulador no representa.</li>
        </ul>
      </section>

      <section id="fuentes">
        <h2>Fuentes</h2>
        <h3>Hidráulica y práctica</h3>
        <ul>
          {#each hydraulicSources as id (id)}{@render source(id)}{/each}
          <li><a href="https://waterousco.com/media/pdfs/810304.pdf">Waterous · curva de rendimiento CX, 810304</a><span class="citation">Revisión del 4 de junio de 2020.</span></li>
          <li><a href={nfa.url}>{nfa.title}</a><span class="citation">{nfa.publisher} · {nfa.published} · SM2-27–30</span></li>
        </ul>
        <h3>Fichas de los pitones</h3>
        <ul>
          {#each equipmentSources as id (id)}{@render source(id)}{/each}
        </ul>
      </section>

      <section id="novedades">
        <h2>Versión y novedades</h2>
        <p>Versión {currentVersion ?? version}</p>
        {#each releases as release (release.id)}
          <details>
            <summary>{release.id} · {releaseDate(release)}</summary>
            <ul>
              {#each release.items as item}
                <li>{item.text}{#if item.href} <a href={item.href}>Ver detalle</a>{/if}</li>
              {/each}
            </ul>
          </details>
        {:else}
          <p>Aún no hay novedades publicadas.</p>
        {/each}
      </section>
    </div>
  </div>
</main>

<style>
  .about-page {
    width: min(100%, 1000px);
    margin: 0 auto;
    padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
      max(32px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
    line-height: 1.55;
    overflow-wrap: anywhere;
  }
  header { padding: 0 0 20px; }
  h1 { margin: 14px 0 8px; font-size: clamp(1.65rem, 4vw, 2.25rem); line-height: 1.15; }
  header p { max-width: 62ch; margin: 0; }
  a { color: var(--ink); text-underline-offset: .17em; }
  a:hover { text-decoration-thickness: 2px; }
  .back, nav a, summary { min-height: 44px; display: flex; align-items: center; }
  .back { width: fit-content; border: 1px solid var(--line); border-radius: 8px; padding: 0 12px; background: var(--surface); font-weight: 600; text-decoration: none; }
  .back:hover, nav a:hover { background: var(--accent-soft); }
  .reference, .content { display: grid; gap: 12px; min-width: 0; }
  nav, section { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); }
  nav { align-self: start; display: flex; flex-wrap: wrap; padding: 4px; }
  nav a { padding: 0 10px; border-radius: 6px; font-weight: 600; }
  section { padding: clamp(14px, 3vw, 24px); scroll-margin-top: 12px; }
  h2 { font-size: 1.25rem; margin: 0 0 10px; }
  h3 { font-size: 1rem; margin: 16px 0 6px; }
  p { margin: 0 0 12px; }
  p:last-child { margin-bottom: 0; }
  dl { margin: 12px 0; }
  dt { font-weight: 700; }
  dd { margin: 2px 0 12px; }
  ul { margin: 8px 0 0; padding-left: 20px; }
  li + li { margin-top: 6px; }
  .citation, .ranges span { display: block; color: var(--muted); font-size: .875rem; }
  .ranges { list-style: none; padding: 0; margin: 12px 0; }
  .ranges li { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px 12px; padding: 6px 0; border-bottom: 1px solid var(--line); margin: 0; }
  summary { cursor: pointer; font-weight: 600; border-top: 1px solid var(--line); }
  summary::before { content: "▸"; margin-right: 8px; }
  details[open] summary::before { content: "▾"; }
  details ul { margin-bottom: 12px; }
  @media (min-width: 800px) {
    .reference { grid-template-columns: 190px minmax(0, 1fr); gap: 20px; }
    nav { position: sticky; top: 16px; display: grid; }
  }
</style>
