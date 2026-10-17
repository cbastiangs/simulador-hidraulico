<script lang="ts">
  import { jointName, jointNameIn } from "$lib/names.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import { LAWS, type Term } from "$hydraulics/laws.ts";
  import { METHODS, type MethodId, type SourceId } from "$hydraulics/references.ts";

  // Each applied law, with the engine's own inputs substituted (MODEL.md §7).
  // Nothing here computes hydraulics: every number comes from a Term.
  let { terms, methodId, scenario }: { terms: Term[]; methodId: MethodId; scenario: Scenario } = $props();

  const SOURCE_LABELS: Record<SourceId, string> = {
    cgbvpManual2019: "Manual CGBVP 2019",
    coloradoPumperChart: "Colorado DFPC, Pumper chart 2020",
    tftReaction: "Task Force Tips, reacción del pitón",
    temeculaFireFlow: "Temecula Fire Prevention Bureau (NFPA 291)",
  };

  const f = (n: number, digits = 1) => n.toFixed(digits);

  function sources(term: Term) {
    if (term.lawId === "nozzle.fixed-orifice") return "Ley del orificio (física): Q ∝ √P";
    if (term.lawId === "appliance.fixed") {
      return term.inputs.lossPsi === null
        ? "Sin dato publicado para el modelo base (MODEL.md §3.10)"
        : `${SOURCE_LABELS.cgbvpManual2019}, p. 45 (aproximación de entrenamiento)`;
    }
    if (term.lawId === "appliance.step") {
      return `${SOURCE_LABELS.coloradoPumperChart}, p. 1: «Appliances + 10 psi > 350 gpm» (asignación de entrenamiento; contar acoples como «appliances» es criterio del simulador)`;
    }
    if (term.lawId !== "elevation") return LAWS[term.lawId].sources.map((id) => SOURCE_LABELS[id]).join(" · ");
    const source = METHODS[methodId].source;
    return source ? `${SOURCE_LABELS[source]}, p. 44` : "Hidrostática: ρ·g·h";
  }
</script>

<ol class="terms">
  {#each terms as term, i (i)}
    <li>
      {#if term.lawId === "hose.friction"}
        {@const { frictionCoefficient: c, flowGpm: q, lengthFt: l } = term.inputs}
        <span class="name">Fricción, tramo {term.sectionIndex + 1}</span>
        <span class="formula">
          FL = C × (Q/100)<sup>2</sup> × (L/100) = {f(c, c < 1 ? 3 : 1)} × ({f(q)}/100)<sup>2</sup> × ({f(l)} ft/100)
          = <strong>{f(term.valuePsi)} psi</strong>
        </span>
      {:else if term.lawId === "elevation"}
        {@const { psiPerMeter: k, heightM: h } = term.inputs}
        <span class="name">Desnivel</span>
        <span class="formula">
          EP = k × h = {f(k, 3)} psi/m × {f(h)} m = <strong>{f(term.valuePsi)} psi</strong>
        </span>
      {:else if term.lawId === "appliance.fixed" || term.lawId === "appliance.step"}
        <span class="name">{term.kind === "wye" ? "Bifurca · caudal total de entrada" : term.kind === "adapter" && term.joint > 0 && term.joint < scenario.sections.length ? jointName(scenario, term.joint) : `${term.kind === "valve" ? "Válvula en línea" : "Adaptador"}, ${jointNameIn(scenario, term.joint)}`}</span>
        {#if term.lawId === "appliance.step"}
          {@const { aboveGpm: qs, stepPsi: dp, flowGpm: q } = term.inputs}
          <span class="formula">
            AL = 0 si Q ≤ {qs} gpm; {f(dp, 0)} psi si Q > {qs} gpm · Q = {f(q)} gpm → <strong>{f(term.valuePsi)} psi</strong>
          </span>
        {:else}
        <span class="formula">
          AL = {term.inputs.lossPsi === null ? "sin dato → " : ""}<strong>{f(term.valuePsi)} psi</strong>{term.inputs.lossPsi === null ? "" : " (fija mientras fluye)"}
        </span>
        {/if}
      {:else}
        {@const { ratedPressurePsi: npr, ratedFlowGpm: qr, flowGpm: q } = term.inputs}
        <span class="name">Pitón</span>
        <span class="formula">
          NP = NPr × (Q/Qr)<sup>2</sup> = {f(npr, 0)} × ({f(q)}/{f(qr, 0)})<sup>2</sup> = <strong>{f(term.valuePsi)} psi</strong>
        </span>
      {/if}
      <span class="source">Fuente: {sources(term)}</span>
    </li>
  {/each}
</ol>

<style>
  .terms { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.6rem; }
  li { display: grid; gap: 0.1rem; }
  .name { font-weight: 600; font-size: 0.85rem; }
  .formula { font-variant-numeric: tabular-nums; }
  .source { font-size: 0.75rem; color: var(--muted); }
</style>
