<script lang="ts">
  import { LAWS } from "$hydraulics/laws.ts";
  import { METHODS, SOURCES, type MethodId, type SourceId } from "$hydraulics/references.ts";
  import { METHOD_LABELS } from "$lib/methods.ts";

  // "Fuentes" (UX.md §10.2, Method → inspect): what each term of the pump
  // pressure rests on under the chosen method, and the documents cited.
  let { methodId }: { methodId: MethodId } = $props();

  const method = $derived(METHODS[methodId]);
  const name = (id: SourceId) => SOURCES[id].title;
  const cited = $derived(
    [...new Set<SourceId>([...LAWS["hose.friction"].sources, ...(method.source ? [method.source] : [])])],
  );
</script>

<details class="card">
  <summary>Fuentes · {METHOD_LABELS[methodId]}</summary>
  <dl>
    <dt>Pitón</dt>
    <dd>Ley del orificio (física): el caudal crece con la raíz de la presión, Q ∝ √P.</dd>
    <dt>Fricción</dt>
    <dd>FL = C × (Q/100)² × (L/100), con C publicado por manguera: {LAWS["hose.friction"].sources.map(name).join(" · ")}.</dd>
    <dt>Desnivel</dt>
    <dd>
      {method.psiPerMeterOfHeight.toFixed(method.source ? 1 : 3)} psi por metro ·
      {method.source ? `${name(method.source)}, p. 44 (regla de entrenamiento)` : "hidrostática: 0,434 psi por pie de agua"}.
    </dd>
    <dt>Accesorios</dt>
    <dd>
      {#if method.fittingLossPsi}
        {method.fittingLossPsi.adapter} psi por accesorio, fija · {method.source ? `${name(method.source)}, p. 45` : ""} (aproximación de entrenamiento).
      {:else}
        Sin dato publicado: cuentan 0 (MODEL.md §3.10).
      {/if}
    </dd>
  </dl>
  <h4>Documentos</h4>
  <ul>
    {#each cited as id (id)}
      {@const s = SOURCES[id]}
      <li>
        {#if "url" in s}<a href={s.url} target="_blank" rel="noopener">{s.title}</a>{:else}{s.title}{/if} · {s.publisher}, {s.published}
      </li>
    {/each}
  </ul>
</details>

<style>
  .card { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; }
  summary { cursor: pointer; color: var(--accent); }
  details[open] summary { margin-bottom: 10px; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 12px; margin: 0; font-size: 14px; }
  dt { font-weight: 700; }
  dd { margin: 0; color: var(--muted); }
  h4 { margin: 14px 0 6px; font-size: 13px; }
  ul { margin: 0; padding-left: 18px; font-size: 13px; color: var(--muted); display: grid; gap: 4px; }
  a { color: var(--accent); }
  @media (max-width: 600px) { dl { grid-template-columns: 1fr; } dd { margin-bottom: 6px; } }
</style>
