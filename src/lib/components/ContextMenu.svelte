<script lang="ts" module>
  /** What a right click or long press landed on (UX.md §2). Joint 0 is the pump outlet. */
  export type MenuTarget =
    | { kind: "section"; index: number }
    | { kind: "joint"; index: number }
    | { kind: "nozzle" }
    | { kind: "pump" }
    | { kind: "empty" };
</script>

<script lang="ts">
  import type { Scenario } from "$hydraulics/scenario.ts";
  import * as edit from "$lib/edit.ts";
  import type { Selection } from "$lib/selection.ts";

  // The canvas's context menu: right click, or a long press on touch. Every
  // entry is also reachable from a visible control (the hose and coupling
  // toolbars, the inspector), so nothing lives only here.
  let {
    target,
    x,
    y,
    scenario,
    onEdit,
    onSelect,
    onFit,
    onClose,
  }: {
    target: MenuTarget;
    /** Where it opened, in window pixels. */
    x: number;
    y: number;
    scenario: Scenario;
    onEdit: (next: Scenario, select?: Selection) => void;
    onSelect: (s: Selection) => void;
    onFit: () => void;
    onClose: () => void;
  } = $props();

  type Item = { label: string; run: () => void; disabled?: boolean; danger?: boolean };

  const n = $derived(scenario.sections.length);
  const insert = (at: number) => () => onEdit(edit.insertSection(scenario, at), { kind: "section", index: at });

  const items = $derived.by((): Item[] => {
    switch (target.kind) {
      case "section": {
        const i = target.index;
        const s = scenario.sections[i];
        return [
          { label: "Insertar tramo antes", run: insert(i) },
          { label: "Insertar tramo después", run: insert(i + 1) },
          { label: "Dividir en dos", run: () => onEdit(edit.splitSection(scenario, i), { kind: "section", index: i }), disabled: s.lengthM < 2 },
          { label: s.lengthFree ? "Bloquear largo" : "Desbloquear largo", run: () => onEdit(edit.toggleLengthLock(scenario, i)) },
          { label: "Quitar tramo", run: () => onEdit(edit.removeSection(scenario, i), { kind: "section", index: Math.max(0, i - 1) }), disabled: n <= 1, danger: true },
        ];
      }
      case "joint": {
        const j = target.index;
        if (j === 0) return pumpItems();
        return [
          { label: "Insertar tramo aquí", run: insert(j) },
          { label: "Unir los dos tramos", run: () => onEdit(edit.mergeAtJoint(scenario, j), { kind: "section", index: j - 1 }) },
          { label: "Accesorios…", run: () => onSelect({ kind: "joint", index: j }) },
        ];
      }
      case "nozzle":
        return [
          { label: "Añadir tramo antes del pitón", run: insert(n) },
          { label: scenario.nozzle.open ? "Cerrar pitón" : "Abrir pitón", run: () => onEdit(edit.setNozzleOpen(scenario, !scenario.nozzle.open)) },
          { label: "Cambiar pitón…", run: () => onSelect({ kind: "nozzle" }) },
        ];
      case "pump":
        return pumpItems();
      case "empty":
        return [
          { label: "Añadir tramo al final", run: insert(n) },
          { label: "Ajustar vista", run: onFit },
        ];
    }
  });

  function pumpItems(): Item[] {
    return [
      { label: "Insertar tramo en la salida", run: insert(0) },
      { label: "Accesorios de la salida…", run: () => onSelect({ kind: "joint", index: 0 }) },
      { label: "Bomba…", run: () => onSelect({ kind: "pump" }) },
    ];
  }

  const title = $derived(
    target.kind === "section" ? `Tramo ${target.index + 1}`
    : target.kind === "joint" ? (target.index === 0 ? "Salida de la bomba" : `Acople ${target.index}`)
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
  {#each items as item (item.label)}
    <button
      type="button"
      role="menuitem"
      class:danger={item.danger}
      disabled={item.disabled}
      onclick={() => {
        item.run();
        onClose();
      }}>{item.label}</button
    >
  {/each}
</div>

<style>
  .menu { position: fixed; z-index: 30; min-width: 200px; display: grid; padding: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
  .title { margin: 2px 8px 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
  button { min-height: 44px; padding: 0 12px; text-align: left; border: 0; border-radius: 6px; background: transparent; color: var(--ink); font-size: 14px; cursor: pointer; }
  button:hover:not(:disabled), button:focus-visible { background: var(--accent-soft); outline: none; }
  button:disabled { opacity: 0.4; cursor: default; }
  .danger { color: var(--warn); }
</style>
