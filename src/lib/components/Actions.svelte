<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import { actionsFor, labelOf, type Action, type Target } from "$lib/actions.ts";

  // A target's actions as a row of buttons (lib/actions.ts): "quick" for the
  // floating toolbar, "panel" for the selection panel and the Línea section.
  // A blocked action stays visible, disabled, with its reason beside it.
  let {
    target,
    scenario,
    requiredPsi,
    place,
    onAction,
  }: {
    target: Target;
    scenario: Scenario;
    requiredPsi: number | null;
    place: "quick" | "panel";
    onAction: (action: Action, target: Target) => void;
  } = $props();

  const ctx = $derived({ scenario, target, requiredPsi });
  const items = $derived(actionsFor(target, place).map((a) => ({ a, label: labelOf(a, ctx, place), why: a.blocked?.(ctx) ?? null })));
  const reasons = $derived(items.filter((i) => i.why).map((i) => `${labelOf(i.a, ctx)}: ${i.why}`));
</script>

{#if items.length > 0}
  <div class="actions {place}">
    <div class="row">
      {#each items as { a, label, why } (a.id)}
        <button type="button" class:danger={a.danger} disabled={why !== null} title={why ?? undefined} onclick={() => onAction(a, target)}>{label}</button>
      {/each}
    </div>
    {#if place === "panel" && reasons.length > 0}
      {#each reasons as r (r)}<p class="why">{r}</p>{/each}
    {/if}
  </div>
{/if}

<style>
  .actions { display: grid; gap: 4px; }
  .row { display: flex; flex-wrap: wrap; gap: 6px; }
  button { min-height: 44px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; font-size: 14px; }
  .quick .row { gap: 4px; justify-content: center; }
  .quick button { min-height: 36px; min-width: 40px; padding: 0 8px; font-weight: 600; font-size: 13px; }
  button:disabled { opacity: 0.45; cursor: default; }
  .danger { color: var(--warn); }
  .why { margin: 0; font-size: 12px; color: var(--muted); }
</style>
