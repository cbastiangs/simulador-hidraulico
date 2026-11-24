<script lang="ts">
  import { CAPACITY, LOSS_REFERENCE_GPM, MAX_REFERENCE_PSI, type HydrantSupply, type HydrantOutlet } from "$hydraulics/supply.ts";
  import { u } from "$lib/display-units.svelte.ts";
  let { supply, onchange, losses = false }: {
    supply: HydrantSupply; onchange: (changes: Partial<HydrantSupply>) => void; losses?: boolean;
  } = $props();
  const id = $props.id();
</script>
{#if losses}
  <details>
    <summary>Variar pérdidas de entrada y siamesa</summary>
    <p>Pérdida supuesta a {u.q(LOSS_REFERENCE_GPM,0)} {u.flow}. En la siamesa se usa el caudal total de las dos ramas. La pérdida varía con el cuadrado del caudal.</p>
    {#each [["intakeRefPsi","Por entrada"], ["siameseRefPsi","Siamesa"]] as [field, label]}
      {@const key = field as "intakeRefPsi" | "siameseRefPsi"}
      <label for={id+key}>{label}<b>{u.p(supply[key])} {u.pressure}</b></label>
      <input id={id+key} type="range" min="0" max={MAX_REFERENCE_PSI} step="0.5" value={supply[key]}
        aria-valuetext={`${u.p(supply[key])} ${u.pressure}`} oninput={e => onchange({ [key]: e.currentTarget.valueAsNumber })}/>
    {/each}
  </details>
{:else}
  <label for={id+"outlet"}>Salida del hidrante</label>
  <select id={id+"outlet"} value={supply.outlet} onchange={e => onchange({ outlet: e.currentTarget.value as HydrantOutlet })}>
    <option value="ideal">Ideal · sin pérdida</option><option value="2.5">2½″ · una salida por línea</option>
    <option value="4">4″ · salida común</option><option value="4.5">4½″ · salida común</option>
  </select>
  <label for={id+"capacity"}>Caudal de la red a {u.p(30,0)} {u.pressure}<b>{u.q(supply.testFlowGpm,0)} {u.flow}</b></label>
  <input id={id+"capacity"} type="range" min={CAPACITY.min} max={CAPACITY.max} step="10" value={supply.testFlowGpm}
    aria-valuetext={`${u.q(supply.testFlowGpm,0)} ${u.flow}`} oninput={e => onchange({ testFlowGpm: e.currentTarget.valueAsNumber })}/>
{/if}
<style>
  label { display:flex; justify-content:space-between; gap:8px; font-weight:600; }
  input, select { width:100%; min-height:44px; margin:0; accent-color:var(--accent); }
  select { padding:4px 8px; background:var(--surface); border:1px solid var(--line); border-radius:7px; }
  details { background:var(--surface); border:1px solid var(--line); padding:0 12px; border-radius:10px; margin:8px 0; }
  summary { cursor:pointer; font-weight:600; padding:12px 0; }
</style>
