<script lang="ts">
  import { PIECES, type PieceId } from "$lib/pieces.ts";

  // The "Piezas" strip (UX.md §2 "Pieces"): a column on the canvas's left
  // edge on wider screens, a row in the phone's tray. Tapping a piece picks
  // it (the canvas lights where it can go); tapping it again puts it back.
  let {
    armed,
    onPick,
    row = false,
  }: {
    armed: PieceId | null;
    onPick: (piece: PieceId | null) => void;
    /** The phone's tray: one scrolling row instead of a column. */
    row?: boolean;
  } = $props();
</script>

{#snippet icon(id: PieceId)}
  <svg viewBox="0 0 36 24" width="36" height="24" aria-hidden="true">
    {#if id === "hose-1-1/2" || id === "hose-2-1/2"}
      {@const w = id === "hose-1-1/2" ? 5 : 8}
      <path class="hose" d="M 6 12 L 30 12" stroke-width={w} />
      <rect class="steel" x="2" y={12 - w / 2 - 2} width="4" height={w + 4} rx="1" />
      <rect class="steel" x="30" y={12 - w / 2 - 2} width="4" height={w + 4} rx="1" />
    {:else if id === "wye" || id === "trifurca"}
      <path class="hose" d="M 2 12 L 14 12" stroke-width="5" />
      <path class="hose" d="M 16 12 L 33 4 M 16 12 L 33 20{id === 'trifurca' ? ' M 16 12 L 33 12' : ''}" stroke-width="3.5" />
      <circle class="steel" cx="15" cy="12" r="5" />
    {:else if id === "fog"}
      <path class="hose" d="M 1 12 L 8 12" stroke-width="5" />
      <path class="steel" d="M 8 8 L 20 9 L 20 15 L 8 16 Z" />
      <path class="spray" d="M 21 11 L 35 3 L 35 21 L 21 13 Z" />
    {:else if id === "smooth-bore"}
      <path class="hose" d="M 1 12 L 8 12" stroke-width="5" />
      <path class="steel" d="M 8 8 L 22 10.5 L 22 13.5 L 8 16 Z" />
      <path class="jet" d="M 23 12 L 35 12" />
    {:else}
      <circle class="erase" cx="18" cy="12" r="9" />
      <path class="erase-x" d="M 14 8 L 22 16 M 22 8 L 14 16" />
    {/if}
  </svg>
{/snippet}

<div class="strip" class:row role="toolbar" aria-label="Piezas: elige una y toca dónde ponerla">
  {#if !row}<span class="title">Piezas</span>{/if}
  {#each PIECES as p (p.id)}
    <button
      type="button"
      class="piece"
      class:on={armed === p.id}
      class:eraser={p.id === "eraser"}
      aria-pressed={armed === p.id}
      title={p.id === "eraser" ? "Quitar: toca lo que quieras quitar" : `${p.name}: toca dónde ponerlo`}
      onclick={() => onPick(armed === p.id ? null : p.id)}
    >
      {@render icon(p.id)}
      <span>{p.label}</span>
    </button>
  {/each}
</div>

<style>
  .strip { display: flex; flex-direction: column; gap: 4px; padding: 6px 4px; width: 78px; flex: none; overflow-y: auto; border-right: 1px solid var(--line); background: var(--surface); }
  /* The phone's tray: every piece in one row, no scrolling (390 px fits seven). */
  .strip.row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); width: auto; overflow: hidden; padding: 6px 4px; border-right: 0; border-top: 1px solid var(--line); }
  .row .piece { min-width: 0; font-size: 10px; padding: 4px 0; }
  .row svg { width: 32px; }
  .title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); text-align: center; padding: 2px 0; }
  .piece { display: grid; justify-items: center; gap: 1px; min-height: 52px; min-width: 68px; padding: 4px 2px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: var(--ink); font-size: 11px; font-weight: 600; cursor: pointer; flex: none; }
  .piece:hover { background: var(--band); }
  .piece.on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .piece.eraser { color: var(--warn); }
  .piece.eraser.on { border-color: var(--warn); background: color-mix(in srgb, var(--warn) 12%, transparent); }
  .piece:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  .hose { stroke: var(--hose); fill: none; stroke-linecap: butt; }
  .steel { fill: var(--steel); }
  .spray { fill: var(--water); opacity: 0.6; }
  .jet { stroke: var(--water); stroke-width: 3; stroke-linecap: round; }
  .erase { fill: none; stroke: var(--warn); stroke-width: 2; }
  .erase-x { stroke: var(--warn); stroke-width: 2.4; stroke-linecap: round; }
</style>
