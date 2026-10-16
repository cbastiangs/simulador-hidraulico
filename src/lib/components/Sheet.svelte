<script lang="ts" module>
  export type SheetState = "closed" | "peek" | "full";
  /** Height of the closed sheet; the page keeps this much free below the canvas. */
  export const CLOSED_PX = 80;
  /** Each state's height in a window this tall. */
  export const sheetHeights = (windowHeight: number): Record<SheetState, number> => ({
    closed: CLOSED_PX,
    peek: Math.min(windowHeight * 0.5, 440),
    full: windowHeight - 56,
  });
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  // The phone's bottom sheet (UX.md §8.2): closed shows a handle and a
  // summary line; peek, the selected element's controls; full, everything.
  // Drag the handle to resize (it snaps to the nearest height) or tap it.
  let {
    sheet,
    onSheet,
    summary,
    children,
  }: {
    sheet: SheetState;
    onSheet: (s: SheetState) => void;
    summary: Snippet;
    children: Snippet;
  } = $props();

  let windowHeight = $state(800);
  /** The closed sheet grows to its summary when that runs to two lines (UX-07), never below CLOSED_PX. */
  let gripHeight = $state(0);
  const heights = $derived({ ...sheetHeights(windowHeight), closed: Math.max(CLOSED_PX, Math.ceil(gripHeight)) });

  let drag: { y: number; from: number; moved: boolean } | null = $state(null);
  let dragHeight = $state(0);
  const height = $derived(drag ? dragHeight : heights[sheet]);
  let body: HTMLDivElement | undefined = $state();

  // A new state starts at the top of its content.
  $effect(() => {
    if (sheet && body) body.scrollTop = 0;
  });

  function down(event: PointerEvent) {
    drag = { y: event.clientY, from: heights[sheet], moved: false };
    dragHeight = heights[sheet];
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent) {
    if (!drag) return;
    const dy = drag.y - event.clientY;
    if (Math.abs(dy) >= 6) drag.moved = true;
    dragHeight = Math.min(heights.full, Math.max(heights.closed, drag.from + dy));
  }

  function up() {
    if (!drag) return;
    if (!drag.moved) onSheet(sheet === "closed" ? "peek" : "closed");
    else {
      const nearest = (Object.keys(heights) as SheetState[]).reduce((a, b) =>
        Math.abs(heights[b] - dragHeight) < Math.abs(heights[a] - dragHeight) ? b : a,
      );
      onSheet(nearest);
    }
    drag = null;
  }
</script>

<svelte:window bind:innerHeight={windowHeight} />

<section class="sheet" class:dragging={drag} style:height={`${height}px`} aria-label="Panel">
  <div
    class="grip"
    class:room={sheet !== "closed"}
    bind:offsetHeight={gripHeight}
    role="button"
    tabindex="0"
    aria-label={sheet === "closed" ? "Abrir panel" : "Cerrar panel"}
    aria-expanded={sheet !== "closed"}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    onkeydown={(e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      onSheet(sheet === "closed" ? "peek" : "closed");
    }}
  >
    <span class="bar"></span>
    {@render summary()}
  </div>
  <!-- Expand / shrink, always at hand: a button beside the grip, not after the results (UX-03). -->
  {#if sheet !== "closed"}
    <button
      type="button"
      class="expand"
      aria-label={sheet === "full" ? "Reducir panel" : "Ampliar panel"}
      title={sheet === "full" ? "Reducir panel" : "Ampliar panel"}
      onclick={() => onSheet(sheet === "full" ? "peek" : "full")}>{sheet === "full" ? "▾" : "▴"}</button
    >
  {/if}
  <!-- Closed, the body is out of view: out of Tab order and the accessibility tree too (UX-07). -->
  <div class="body" bind:this={body} inert={sheet === "closed"}>
    {@render children()}
  </div>
</section>

<style>
  .sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; flex-direction: column; background: var(--bg); border-radius: 16px 16px 0 0; box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.18); transition: height 0.22s ease; padding-bottom: env(safe-area-inset-bottom); }
  .sheet.dragging { transition: none; }
  .grip { flex: none; padding: 6px 10px 8px; touch-action: none; cursor: grab; display: grid; gap: 6px; }
  .bar { justify-self: center; width: 40px; height: 5px; border-radius: 3px; background: var(--muted); opacity: 0.5; }
  .body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 0 8px 12px; display: grid; gap: 8px; align-content: start; }
  .grip.room { padding-right: 50px; }
  .expand { position: absolute; top: 4px; right: 4px; width: 44px; height: 44px; border: 0; border-radius: 8px; background: transparent; color: var(--muted); font-size: 16px; cursor: pointer; }
</style>
