<script lang="ts">
  import { Tween } from "svelte/motion";
  import type { ScenarioNozzle } from "$hydraulics/scenario.ts";

  // The nozzle's Close-up (UX.md §10.1 Operate, Close-up): drawn large and
  // worked like the real one. Tap or pull the bale; turn the gallonage ring
  // and the pattern collar by dragging up or down across them. A readout with
  // ‹ › buttons sits under each drawn control, so every state is also one tap
  // away. Each motion shows a state the model has; the stream is illustrative
  // (its length grows with flow, no reach is claimed; MODEL.md §6).
  let {
    nozzle,
    flowGpm,
    onOpen,
    onSetting,
    onPattern,
  }: {
    nozzle: ScenarioNozzle;
    flowGpm: number;
    onOpen: (open: boolean) => void;
    onSetting: (gpm: number) => void;
    onPattern: (pattern: number) => void;
  } = $props();

  const reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ms = (d: number) => (reduced ? 0 : d);

  const OPEN_DEG = -18;
  const CLOSED_DEG = 64;
  const PIVOT = { x: 72, y: 94 };

  const settings = $derived(nozzle.kind === "selectable" ? nozzle.settingsGpm : []);
  const settingIndex = $derived(Math.max(0, settings.indexOf(nozzle.ratedFlowGpm)));

  let dragDeg: number | null = $state(null);
  const bale = Tween.of((): number => (nozzle.open ? OPEN_DEG : CLOSED_DEG), { duration: ms(220) });
  const baleDeg = $derived(dragDeg ?? bale.current);
  const ring = Tween.of(() => settingIndex, { duration: ms(200) });
  const collar = Tween.of(() => nozzle.pattern, { duration: ms(160) });
  const flow = Tween.of(() => Math.min(flowGpm / nozzle.ratedFlowGpm, 1.3), { duration: ms(300) });

  const stream = $derived.by(() => {
    const halfAngle = ((4 + collar.current * 41) * Math.PI) / 180;
    const length = 96 * (1 - 0.4 * collar.current) * flow.current;
    const dy = Math.tan(halfAngle) * length;
    return { length, dy, core: dy * 0.35 };
  });

  const patternName = (p: number) => (p < 0.08 ? "Chorro directo" : p < 0.55 ? "Niebla estrecha" : "Niebla amplia");

  let svg: SVGSVGElement | undefined = $state();
  function toSvg(e: PointerEvent) {
    const m = svg!.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  }

  // The bale: a tap toggles it; a pull follows the finger and snaps to the nearer end.
  let baleDrag: { x: number; y: number; moved: boolean } | null = null;
  function baleDown(e: PointerEvent) {
    baleDrag = { x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }
  function baleMove(e: PointerEvent) {
    if (!baleDrag) return;
    if (Math.hypot(e.clientX - baleDrag.x, e.clientY - baleDrag.y) > 6) baleDrag.moved = true;
    if (!baleDrag.moved) return;
    const p = toSvg(e);
    const deg = (Math.atan2(p.x - PIVOT.x, PIVOT.y - p.y) * 180) / Math.PI;
    dragDeg = Math.min(CLOSED_DEG, Math.max(OPEN_DEG, deg));
  }
  function baleUp() {
    if (!baleDrag) return;
    if (!baleDrag.moved) onOpen(!nozzle.open);
    else if (dragDeg !== null) {
      const open = dragDeg < (OPEN_DEG + CLOSED_DEG) / 2;
      if (open !== nozzle.open) onOpen(open);
    }
    // Hand the lever back to the tween from where the finger left it.
    if (dragDeg !== null) bale.set(dragDeg, { duration: 0 }).then(() => bale.set(nozzle.open ? OPEN_DEG : CLOSED_DEG));
    dragDeg = null;
    baleDrag = null;
  }

  // Ring and collar turn with a vertical drag, as a knob seen from the side.
  // Deltas are measured on screen, scaled to drawing units, so a warning
  // appearing above the drawing mid-drag cannot reverse the turn.
  let turn: { y: number; scale: number; from: number; kind: "ring" | "collar" } | null = null;
  function turnDown(kind: "ring" | "collar", e: PointerEvent) {
    turn = { y: e.clientY, scale: 1 / svg!.getScreenCTM()!.a, from: kind === "ring" ? settingIndex : nozzle.pattern, kind };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }
  function turnMove(e: PointerEvent) {
    if (!turn) return;
    const dy = (e.clientY - turn.y) * turn.scale;
    if (turn.kind === "ring") {
      // The numbers follow the finger: dragging down brings the lower setting into the window.
      const i = Math.min(settings.length - 1, Math.max(0, Math.round(turn.from - dy / 18)));
      if (settings[i] !== nozzle.ratedFlowGpm) onSetting(settings[i]);
    } else {
      const p = Math.min(1, Math.max(0, turn.from + dy / 90));
      if (Math.abs(p - nozzle.pattern) >= 0.01) onPattern(Math.round(p * 100) / 100);
    }
  }
  const turnUp = () => (turn = null);

  const stepSetting = (d: number) => {
    const i = settingIndex + d;
    if (i >= 0 && i < settings.length) onSetting(settings[i]);
  };
  const stepPattern = (d: number) => onPattern(Math.round(Math.min(1, Math.max(0, nozzle.pattern + d)) * 100) / 100);
  function sliderKeys(e: KeyboardEvent, step: (d: number) => void, size: number) {
    const d = e.key === "ArrowUp" || e.key === "ArrowRight" ? size : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -size : 0;
    if (!d) return;
    e.preventDefault();
    step(d);
  }

  // Collar ribs: ridges along the axis that slide round as it turns.
  const RIBS = 7;
  const ribs = $derived(
    Array.from({ length: RIBS }, (_, k) => {
      const a = (k / RIBS) * Math.PI * 2 + collar.current * Math.PI * 1.5;
      return { y: 110 - 21 * Math.sin(a), shown: Math.cos(a) > 0, depth: Math.cos(a) };
    }),
  );
</script>

<div class="closeup">
  <svg bind:this={svg} viewBox="0 0 400 176" role="group" aria-label="Pitón en primer plano">
    <!-- Stream (illustrative). -->
    {#if stream.length > 1}
      <path class="spray" d={`M 286 110 L ${286 + stream.length} ${110 - stream.dy} L ${286 + stream.length} ${110 + stream.dy} Z`} />
      <path class="core" d={`M 286 110 L ${286 + stream.length} ${110 - stream.core} L ${286 + stream.length} ${110 + stream.core} Z`} />
    {/if}
    {#if nozzle.open && flowGpm > 0}<text class="flow" x="392" y="164">{flowGpm.toFixed(0)} gpm</text>{/if}

    <!-- Inlet swivel and body. -->
    <rect class="swivel" x="8" y="90" width="36" height="40" rx="4" />
    {#each [17, 26, 35] as x (x)}<line class="knurl" x1={x} y1="92" x2={x} y2="128" />{/each}
    <path class="body" d="M 44 96 L 152 98 L 152 122 L 44 124 Z" />
    <rect class="boss" x="62" y="88" width="20" height="10" rx="3" />

    <!-- Gallonage ring. -->
    {#if settings.length}
      <g
        class="turn ring"
        role="slider"
        tabindex="0"
        aria-label="Anillo de caudal"
        aria-valuemin={settings[0]}
        aria-valuemax={settings.at(-1)}
        aria-valuenow={nozzle.ratedFlowGpm}
        aria-valuetext={`${nozzle.ratedFlowGpm} gpm`}
        onpointerdown={(e) => turnDown("ring", e)}
        onpointermove={turnMove}
        onpointerup={turnUp}
        onpointercancel={turnUp}
        onkeydown={(e) => sliderKeys(e, stepSetting, 1)}
      >
        <rect class="hit" x="150" y="62" width="40" height="96" />
        <rect class="ring-body" x="152" y="88" width="36" height="44" rx="4" />
        <clipPath id="ring-window"><rect x="152" y="91" width="36" height="38" /></clipPath>
        <g clip-path="url(#ring-window)">
          {#each settings as q, i (q)}
            {@const dy = (i - ring.current) * 15}
            <text class="ring-num" class:now={i === settingIndex} x="170" y={114 + dy} opacity={Math.max(0, 1 - Math.abs(dy) / 22)}>{q}</text>
          {/each}
        </g>
        <path class="mark" d="M 166 82 L 174 82 L 170 87 Z" />
      </g>
    {:else}
      <rect class="ring-body fixed" x="152" y="88" width="36" height="44" rx="4" />
      <text class="ring-num now" x="170" y="114">{nozzle.ratedFlowGpm}</text>
    {/if}

    <!-- Pattern collar. -->
    <g
      class="turn"
      role="slider"
      tabindex="0"
      aria-label="Collar de patrón: chorro directo a niebla amplia"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(nozzle.pattern * 100)}
      aria-valuetext={patternName(nozzle.pattern)}
      onpointerdown={(e) => turnDown("collar", e)}
      onpointermove={turnMove}
      onpointerup={turnUp}
      onpointercancel={turnUp}
      onkeydown={(e) => sliderKeys(e, stepPattern, 0.1)}
    >
      <rect class="hit" x="190" y="62" width="76" height="96" />
      <rect class="collar" x="192" y="86" width="72" height="48" rx="6" />
      {#each ribs as r, k (k)}
        {#if r.shown}<line class="rib" x1="196" y1={r.y} x2="260" y2={r.y} opacity={0.25 + 0.6 * r.depth} />{/if}
      {/each}
    </g>
    <!-- Bumper with teeth. -->
    <path class="bumper" d="M 264 90 L 284 94 L 284 126 L 264 130 Z" />
    {#each [98, 106, 114, 122] as y (y)}<line class="tooth" x1="272" y1={y} x2="284" y2={y} />{/each}

    <!-- The bale. -->
    <g
      class="bale"
      role="switch"
      tabindex="0"
      aria-checked={nozzle.open}
      aria-label={nozzle.open ? "Manija abierta: tocar o empujar para cerrar" : "Manija cerrada: tocar o tirar para abrir"}
      onpointerdown={baleDown}
      onpointermove={baleMove}
      onpointerup={baleUp}
      onpointercancel={baleUp}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(!nozzle.open))}
    >
      <g transform={`rotate(${baleDeg} ${PIVOT.x} ${PIVOT.y})`}>
        <rect class="hit" x={PIVOT.x - 24} y={PIVOT.y - 84} width="48" height="88" />
        <line class="lever" x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={PIVOT.y - 62} />
        <rect class="grip" x={PIVOT.x - 8} y={PIVOT.y - 74} width="16" height="18" rx="6" />
      </g>
      <circle class="pivot" cx={PIVOT.x} cy={PIVOT.y} r="5" />
    </g>
  </svg>

  <div class="readouts">
    <div class="readout">
      <span class="label">Manija</span>
      <button type="button" class="state" class:on={nozzle.open} aria-pressed={nozzle.open} onclick={() => onOpen(!nozzle.open)}>{nozzle.open ? "Abierta" : "Cerrada"}</button>
    </div>
    {#if settings.length}
      <div class="readout">
        <span class="label">Anillo</span>
        <div class="step">
          <button type="button" aria-label="Caudal menor" disabled={settingIndex === 0} onclick={() => stepSetting(-1)}>‹</button>
          <b>{nozzle.ratedFlowGpm} <small>gpm</small></b>
          <button type="button" aria-label="Caudal mayor" disabled={settingIndex === settings.length - 1} onclick={() => stepSetting(1)}>›</button>
        </div>
      </div>
    {/if}
    <div class="readout">
      <span class="label">Patrón</span>
      <div class="step">
        <button type="button" aria-label="Hacia chorro directo" disabled={nozzle.pattern <= 0} onclick={() => stepPattern(-0.1)}>‹</button>
        <b>{patternName(nozzle.pattern)}<span class="track"><span style:left={`${nozzle.pattern * 100}%`}></span></span></b>
        <button type="button" aria-label="Hacia niebla amplia" disabled={nozzle.pattern >= 1} onclick={() => stepPattern(0.1)}>›</button>
      </div>
    </div>
  </div>
  <p class="hint">Toca o tira de la manija; gira el anillo y el collar arrastrando arriba o abajo.</p>
</div>

<style>
  .closeup { display: grid; gap: 8px; }
  svg { width: 100%; height: auto; background: var(--band); border-radius: 12px; touch-action: none; user-select: none; }
  .spray, .core, .flow, .swivel, .knurl, .body, .boss, .ring-body, .ring-num, .mark, .collar, .rib, .bumper, .tooth, .pivot { pointer-events: none; }
  .spray { fill: var(--water-soft); opacity: 0.8; }
  .core { fill: var(--water); opacity: 0.6; }
  .flow { font-size: 12px; font-weight: 700; text-anchor: end; fill: var(--water); font-variant-numeric: tabular-nums; }
  .swivel { fill: var(--steel); }
  .knurl { stroke: rgba(0, 0, 0, 0.25); stroke-width: 2; }
  .body, .boss { fill: var(--ink); }
  .ring-body { fill: #c9ced3; stroke: var(--steel); stroke-width: 1.5; }
  .ring-num { font-size: 13px; font-weight: 700; text-anchor: middle; fill: #4a535c; font-variant-numeric: tabular-nums; }
  .ring-num.now { fill: #111; }
  .mark { fill: var(--warn); }
  .collar { fill: var(--water); }
  .rib { stroke: #0b3d6e; stroke-width: 2; }
  .bumper { fill: #2b2f33; }
  .tooth { stroke: #55606a; stroke-width: 2; }
  .lever { stroke: var(--ink); stroke-width: 7; stroke-linecap: round; }
  .grip { fill: #2b2f33; stroke: var(--ink); stroke-width: 1; }
  .pivot { fill: var(--steel); stroke: var(--ink); stroke-width: 2; }
  .hit { fill: transparent; }
  .bale, .turn { cursor: grab; outline: none; }
  .bale:focus-visible .lever, .turn:focus-visible .collar, .turn:focus-visible .ring-body { stroke: var(--accent); stroke-width: 3; }
  .readouts { display: grid; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); gap: 6px; }
  .readout { min-width: 0; }
  .readout { display: grid; gap: 4px; align-content: start; }
  .label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .state { min-height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); font-weight: 700; cursor: pointer; }
  .state.on { background: var(--water); border-color: var(--water); color: #fff; }
  .step { display: grid; grid-template-columns: 32px minmax(0, 1fr) 32px; align-items: center; min-height: 44px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
  .step b { text-align: center; font-size: 13px; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .track { display: block; position: relative; height: 3px; margin: 4px 6px 0; border-radius: 2px; background: var(--line); }
  .track span { position: absolute; top: -2px; width: 7px; height: 7px; margin-left: -3.5px; border-radius: 50%; background: var(--water); }
  .step small { font-weight: 400; color: var(--muted); }
  .step button { height: 44px; border: 0; background: transparent; font-size: 20px; color: var(--ink); cursor: pointer; }
  .step button:disabled { opacity: 0.3; cursor: default; }
  .hint { margin: 0; font-size: 12px; color: var(--muted); }
</style>
