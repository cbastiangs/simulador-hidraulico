<script lang="ts">
  // Horizontal tangents at both ends seat the curved hose squarely in its collars.
  let { drop = 33 }: { drop?: number } = $props();
  const end = $derived(19 + drop);
  const axis = $derived(`M20 19 C78 19 86 ${end} 146 ${end} H166`);
</script>

<svg viewBox={`0 0 186 ${end + 20}`} role="img" aria-label="Manguerote de succión con anillos de refuerzo y uniones metálicas">
  <g fill="none">
    <path d={axis} stroke="#253334" stroke-width="15"/>
    <path d={axis} stroke="#4b6360" stroke-width="12"/>
    <path d={axis} stroke="#96a69b" stroke-width="17" stroke-dasharray="2.8 3.2"/>
    <path d={axis} stroke="#586f69" stroke-width="3" stroke-dasharray="2.8 3.2" transform="translate(0 5)"/>
    <path d={axis} stroke="#c3cec2" stroke-width="3" stroke-dasharray="2.8 3.2" transform="translate(0 -3)"/>
  </g>
  {#each ['translate(2 19)', `translate(184 ${end}) scale(-1 1)`] as position}
    <g transform={position} stroke="var(--equipment-edge)" stroke-linejoin="round">
      <path fill="var(--equipment-metal)" d="M1-8h4l2-3h7l2 4h5V7h-5l-2 4H7L5 8H1Z"/>
      <path fill="var(--equipment-seam)" stroke="none" d="M2 4h18v2h-5l-2 4H8L6 7H2Z"/>
      <path fill="#d4dddc" d="M7-12h6v5H7zm0 19h6v5H7Z"/>
      <path stroke="#e5eae8" d="M3-5h12"/>
      <path d="M4-8V8m12-15V7"/>
    </g>
  {/each}
</svg>
