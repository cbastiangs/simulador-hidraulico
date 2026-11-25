<script lang="ts">
  import { PIECES, type PieceId, type Piece } from "$lib/pieces.ts";

  // The "Piezas" strip (UX.md §2 "Pieces"): a column on the canvas's left
  // edge on wider screens, a row in the phone's tray. Tapping a piece picks
  // it (the canvas lights where it can go); tapping it again puts it back.
  let {
    armed,
    onPick,
    row = false,
    available = PIECES,
  }: {
    armed: PieceId | null;
    onPick: (piece: PieceId | null) => void;
    /** The phone's tray: one scrolling row instead of a column. */
    row?: boolean;
    available?: readonly Piece[];
  } = $props();
</script>

{#snippet icon(id: PieceId)}
  <svg viewBox="0 0 36 24" width="36" height="24" aria-hidden="true">
    {#if id === "hose-1-1/2" || id === "hose-2-1/2"}
      {@const w = id === "hose-1-1/2" ? 5 : 8}
      {@const axis = 'M4 13 C12 13 12 9 19 10 S26 13 32 12'}
      <path class="outline" d={axis} stroke-width={w + 1.8} />
      <path class="hose" d={axis} stroke-width={w} />
      {#each [4, 32] as x}
        <rect class="steel" x={x-2.5} y={(x === 4 ? 13 : 12) - w / 2 - 2} width="5" height={w + 4} rx="1" />
      {/each}
    {:else if id === "wye" || id === "trifurca"}
      {#each (id === 'trifurca' ? [-29, 0, 29] : [-29, 29]) as angle}
        <g transform={`rotate(${angle} 13 12)`}>
          <path class="steel" d="M12 9h17v6H12z"/>
          <rect class="steel" x="27" y="8.2" width="4" height="7.6" rx=".8"/>
          <path class="handle" d="M18 10h6"/>
        </g>
      {/each}
      <path class="steel" d="M4 9h5q3-3 7-1l3 4-3 4q-4 2-7-1H4Z"/>
      <rect class="steel" x="2" y="7" width="5" height="10" rx="1"/>
    {:else if id === "fog" || id === "smooth-bore"}
      {#if id === "fog"}
        <path class="spray" d="m24 11 11-5v14l-11-5Z"/>
        <rect class="rubber" x="17" y="8" width="8" height="10" rx="2"/>
      {:else}
        <path class="jet" d="M25 13h9"/>
        <path class="steel" d="m16 9 10 2.5v3L16 17Z"/>
      {/if}
      <path class="steel" d="m5 10 12-1v8L5 16Z"/>
      <path class="bale" d="M8 10 6 5q0-1 2-1h6l3 5"/>
      <rect class="steel" x="2" y="8.5" width="4" height="9" rx="1"/>
    {:else}
      <circle class="erase" cx="18" cy="12" r="9" />
      <path class="erase-x" d="M 14 8 L 22 16 M 22 8 L 14 16" />
    {/if}
  </svg>
{/snippet}

<div class="strip" style:--piece-count={available.length} class:row role="toolbar" aria-label="Piezas: elige una y toca dónde ponerla">
  {#if !row}<span class="title">Piezas</span>{/if}
  {#each available as p (p.id)}
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
  .strip.row { display: grid; grid-template-columns: repeat(var(--piece-count, 7), minmax(0, 1fr)); width: auto; overflow: hidden; padding: 6px 4px; border-right: 0; border-top: 1px solid var(--line); }
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
  svg { stroke-linejoin: round; }
  .outline { fill: none; stroke: var(--equipment-edge); }
  .steel { fill: var(--equipment-metal); stroke: var(--equipment-edge); stroke-width: 1.1; }
  .rubber { fill: var(--equipment-rubber); stroke: var(--equipment-metal); stroke-width: 1; }
  .handle { stroke: var(--equipment-paint); stroke-width: 2.1; stroke-linecap: round; }
  .bale { fill: none; stroke: var(--ink); stroke-width: 1.8; }
  .spray { fill: var(--water); opacity: 0.6; }
  .jet { stroke: var(--water); stroke-width: 3; stroke-linecap: round; }
  .erase { fill: none; stroke: var(--warn); stroke-width: 2; }
  .erase-x { stroke: var(--warn); stroke-width: 2.4; stroke-linecap: round; }
</style>
