<script lang="ts">
  // A number you can type or step (UX.md §1.2): [−big] [−] value unit [+] [+big].
  // Commits every valid keystroke; an empty or invalid entry is ignored (edit.ts clamps the rest).
  let {
    label,
    value,
    unit,
    step = 1,
    bigStep,
    digits = 1,
    dark = false,
    hideLabel = false,
    compact = false,
    onchange,
  }: {
    label: string;
    value: number;
    unit: string;
    step?: number;
    bigStep?: { size: number; label: string };
    digits?: number;
    dark?: boolean;
    hideLabel?: boolean;
    /** Narrower input, for the phone's pump strip. */
    compact?: boolean;
    onchange: (value: number) => void;
  } = $props();

  const round = (n: number) => Number(n.toFixed(digits));
</script>

<div class="field" class:dark class:compact>
  {#if !hideLabel}<span class="label">{label}</span>{/if}
  <div class="row">
    {#if bigStep}<button type="button" onclick={() => onchange(round(value - bigStep.size))}>−{bigStep.label}</button>{/if}
    <button type="button" aria-label={`Bajar ${step} ${unit}`} onclick={() => onchange(round(value - step))}>−</button>
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
    <button type="button" aria-label={`Subir ${step} ${unit}`} onclick={() => onchange(round(value + step))}>+</button>
    {#if bigStep}<button type="button" onclick={() => onchange(round(value + bigStep.size))}>+{bigStep.label}</button>{/if}
  </div>
</div>

<style>
  .field { display: grid; gap: 6px; min-width: 0; }
  .label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .row { display: flex; align-items: center; gap: 4px; }
  button { min-width: 44px; height: 44px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-weight: 600; cursor: pointer; }
  button:active { background: var(--band); }
  input { width: 4.4rem; min-width: 0; height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); text-align: right; padding: 0 8px; font-size: 18px; font-weight: 700; }
  .unit { color: var(--muted); margin: 0 2px; }
  .dark .label { color: var(--panel-muted); }
  .dark button { background: var(--panel-2); border-color: var(--panel-line); color: var(--panel-ink); }
  .dark button:active { background: var(--panel-line); }
  .dark input { background: var(--panel-well); border-color: var(--panel-line); color: var(--panel-ink); font-size: 20px; width: 6.5rem; }
  .dark .unit { color: var(--panel-muted); }
  .compact .row { gap: 4px; }
  .compact input { width: 4.125rem; padding: 0 2px; font-size: 18px; appearance: textfield; -moz-appearance: textfield; }
  .compact input::-webkit-outer-spin-button,
  .compact input::-webkit-inner-spin-button { appearance: none; -webkit-appearance: none; margin: 0; }
  .compact .unit { margin: 0; font-size: 12px; }
</style>
