<script lang="ts">
  // A number you can type or nudge: − / value / + with its unit. Commits on
  // every valid keystroke and on each button press; an empty or invalid entry
  // is ignored rather than sent on (the edit functions clamp the rest).
  let {
    label,
    value,
    unit,
    step = 1,
    bigStep,
    digits = 1,
    onchange,
  }: {
    label: string;
    value: number;
    unit: string;
    step?: number;
    /** Optional second pair of buttons, e.g. ±10 psi or ±1 floor. */
    bigStep?: { size: number; label: string };
    digits?: number;
    onchange: (value: number) => void;
  } = $props();

  const round = (n: number) => Number(n.toFixed(digits));
</script>

<div class="field">
  <span class="label">{label}</span>
  <div class="row">
    {#if bigStep}
      <button type="button" onclick={() => onchange(round(value - bigStep.size))} aria-label={`− ${bigStep.label}`}>−{bigStep.label}</button>
    {/if}
    <button type="button" onclick={() => onchange(round(value - step))} aria-label={`− ${step} ${unit}`}>−</button>
    <input
      type="number"
      inputmode="decimal"
      value={round(value)}
      {step}
      aria-label={label}
      oninput={(e) => {
        const n = e.currentTarget.valueAsNumber;
        if (Number.isFinite(n)) onchange(n);
      }}
    />
    <span class="unit">{unit}</span>
    <button type="button" onclick={() => onchange(round(value + step))} aria-label={`+ ${step} ${unit}`}>+</button>
    {#if bigStep}
      <button type="button" onclick={() => onchange(round(value + bigStep.size))} aria-label={`+ ${bigStep.label}`}>+{bigStep.label}</button>
    {/if}
  </div>
</div>

<style>
  .field { display: grid; gap: 0.25rem; }
  .label { font-size: 0.8rem; color: var(--muted); }
  .row { display: flex; align-items: center; gap: 0.25rem; }
  input { width: 5.5rem; font: inherit; font-size: 1.1rem; padding: 0.35rem; text-align: right; font-variant-numeric: tabular-nums; }
  .unit { min-width: 2rem; color: var(--muted); }
  button { font: inherit; min-width: 2.5rem; min-height: 2.5rem; padding: 0 0.5rem; border: 1px solid var(--grid); border-radius: 6px; background: var(--surface); color: var(--ink); }
  button:active { background: var(--grid); }
</style>
