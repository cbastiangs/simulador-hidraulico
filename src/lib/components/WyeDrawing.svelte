<script lang="ts">
  // A wye on the side-view canvas (UX.md §2 "Branched lays"), in screen px
  // with the flow to the right. From the side the outlets sit one behind the
  // other, so it is only a body: inlet swivel, casting, and an outlet
  // coupling at each line's lane offset. Its valves are worked in the wye's
  // close-up, drawn from above (WyeCloseUp).
  let { lanes }: { lanes: number[] } = $props();
  const bottom = $derived(Math.max(0, ...lanes));
</script>

<g class="wye-side" aria-hidden="true">
  <rect class="swivel" x="-14" y="-8" width="9" height="16" rx="2" />
  <path class="body" d={`M -5 -7 L 8 -7 L 14 -5 L 14 ${bottom + 5} L 8 ${bottom + 7} L -5 ${bottom + 7} Z`} />
  {#each lanes as dy, i (i)}<rect class="coupling" x="14" y={dy - 6} width="5" height="12" rx="1.5" />{/each}
</g>

<style>
  .wye-side { pointer-events: none; }
  .swivel { fill: #6b747d; stroke: #2b3036; stroke-width: 1.5; }
  .body { fill: #9aa3ab; stroke: #2b3036; stroke-width: 1.5; stroke-linejoin: round; }
  .coupling { fill: #6b747d; stroke: #2b3036; stroke-width: 1; }
</style>
