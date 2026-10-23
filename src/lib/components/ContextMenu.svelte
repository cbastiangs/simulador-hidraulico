<script lang="ts">
  import { jointName } from "$lib/names.ts";
  import type { Scenario } from "$hydraulics/scenario.ts";
  import { actionsFor, labelOf, type Action, type Target } from "$lib/actions.ts";

  // The canvas's context menu: right click, or a long press on touch. Its
  // entries come from lib/actions.ts, where every one is also in the
  // selection panel, so nothing lives only here.
  let {
    target,
    x,
    y,
    scenario,
    requiredPsi,
    onAction,
    onClose,
    choices = [],
  }: {
    target: Target;
    /** Where it opened, in window pixels. */
    x: number;
    y: number;
    scenario: Scenario;
    requiredPsi: number | null;
    onAction: (action: Action, target: Target) => void;
    onClose: () => void;
    /** Other lines under the pointer, where lines overlap (UX.md §2). */
    choices?: { label: string; run: () => void }[];
  } = $props();

  const ctx = $derived({ scenario, target, requiredPsi });
  const items = $derived(actionsFor(target, "menu").map((a) => ({ a, label: labelOf(a, ctx, "menu"), why: a.blocked?.(ctx) ?? null })));

  const title = $derived(
    target.kind === "section" ? `Tramo ${target.index + 1}`
    : target.kind === "joint" ? jointName(scenario, target.index)
    : target.kind === "nozzle" ? "Pitón"
    : target.kind === "pump" ? "Bomba"
    : "Línea",
  );

  let menu: HTMLDivElement | undefined = $state();
  let width = $state(0);
  let height = $state(0);
  let windowWidth = $state(1200);
  let windowHeight = $state(800);
  // Opens toward the room there is: flipped left or up near the window's edge.
  const left = $derived(Math.max(8, x + width + 8 > windowWidth ? x - width : x));
  const top = $derived(Math.max(8, y + height + 8 > windowHeight ? y - height : y));

  $effect(() => {
    menu?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  });

  function outside(event: PointerEvent) {
    if (menu && !menu.contains(event.target as Node)) onClose();
  }

  function key(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const buttons = [...(menu?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[(at + (event.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length]?.focus();
  }
</script>

<svelte:window
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  onpointerdowncapture={outside}
  onkeydown={key}
  onresize={onClose}
/>

<div
  class="menu"
  role="menu"
  aria-label={title}
  tabindex="-1"
  bind:this={menu}
  bind:clientWidth={width}
  bind:clientHeight={height}
  style:left={`${left}px`}
  style:top={`${top}px`}
  oncontextmenu={(e) => e.preventDefault()}
>
  <p class="title">{title}</p>
  {#each choices as c (c.label)}
    <button type="button" role="menuitem" class="choice" onclick={() => (c.run(), onClose())}>{c.label}</button>
  {/each}
  {#each items as { a, label, why } (a.id)}
    <button
      type="button"
      role="menuitem"
      class:danger={a.danger}
      disabled={why !== null}
      onclick={() => {
        onAction(a, target);
        onClose();
      }}>{label}{#if why}<small>{why}</small>{/if}</button
    >
  {/each}
</div>

<style>
  .menu { position: fixed; z-index: 30; min-width: 200px; display: grid; padding: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
  .title { margin: 2px 8px 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
  button { min-height: 44px; padding: 4px 12px; display: grid; align-content: center; text-align: left; border: 0; border-radius: 6px; background: transparent; color: var(--ink); font-size: 14px; cursor: pointer; }
  button:hover:not(:disabled), button:focus-visible { background: var(--accent-soft); outline: none; }
  button:disabled { opacity: 0.4; cursor: default; }
  .danger { color: var(--warn); }
  .choice { color: var(--accent); font-weight: 600; border-bottom: 1px solid var(--line); border-radius: 0; }
  small { font-size: 11px; color: var(--muted); }
</style>
