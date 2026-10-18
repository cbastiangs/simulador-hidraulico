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

  // Seen from above, hose on the left, tip on the right. The bale is a U
  // pivoting on both sides of the valve body: pushed forward (toward the tip)
  // it lies over the barrel and the valve is shut; pulled back (toward the
  // hose) it is open. Angles are from upright, positive toward the tip.
  const OPEN_DEG = -72;
  const CLOSED_DEG = 72;
  const PIVOT = { x: 97, y: 88 };
  const ARM = 60;
  const AXIS = 88;
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

  // The bale's crossbar, projected from above: it travels along the axis and
  // looks thickest, with the longest shadow, when upright (nearest the eye).
  const crossbar = $derived.by(() => {
    const r = (baleDeg * Math.PI) / 180;
    return { x: PIVOT.x + ARM * Math.sin(r), lift: Math.cos(r) };
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
    const deg = (Math.asin(Math.min(1, Math.max(-1, (p.x - PIVOT.x) / ARM))) * 180) / Math.PI;
    dragDeg = Math.min(CLOSED_DEG, Math.max(OPEN_DEG, deg));
  }
  function baleUp() {
    if (!baleDrag) return;
    if (!baleDrag.moved) onOpen(!nozzle.open);
    else if (dragDeg !== null) {
      const open = dragDeg < 0;
      if (open !== nozzle.open) onOpen(open);
    }
    // Hand the lever back to the tween from where the finger left it.
    if (dragDeg !== null) bale.set(dragDeg, { duration: 0 }).then(() => bale.set(nozzle.open ? OPEN_DEG : CLOSED_DEG));
    dragDeg = null;
    baleDrag = null;
  }

  // Ring and collar turn about the nozzle's axis, so from above their surface
  // moves up or down: they turn with a vertical drag.
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
      return { y: AXIS - 20 * Math.sin(a), shown: Math.cos(a) > 0, depth: Math.cos(a) };
    }),
  );
</script>

<div class="closeup">
  <svg bind:this={svg} viewBox="0 0 400 176" role="group" aria-label="Pitón visto desde arriba">
    <!-- Stream (illustrative). -->
    {#if stream.length > 1}
      <path class="spray" d={`M 282 ${AXIS} L ${282 + stream.length} ${AXIS - stream.dy} L ${282 + stream.length} ${AXIS + stream.dy} Z`} />
      <path class="core" d={`M 282 ${AXIS} L ${282 + stream.length} ${AXIS - stream.core} L ${282 + stream.length} ${AXIS + stream.core} Z`} />
    {/if}
    {#if nozzle.open && flowGpm > 0}<text class="flow" x="392" y="168">{flowGpm.toFixed(0)} gpm</text>{/if}

    <!-- Hose, inlet swivel with its rocker lugs, valve body with the bale's pivot bosses, barrel. -->
    <rect class="hose" x="0" y="77" width="38" height="22" />
    <text class="tag" x="4" y="132">Manguera</text>
    <rect class="lug" x="43" y="64" width="14" height="8" rx="2" />
    <rect class="lug" x="43" y="104" width="14" height="8" rx="2" />
    <rect class="swivel" x="36" y="70" width="28" height="36" rx="4" />
    {#each [44, 50, 56] as x (x)}<line class="knurl" x1={x} y1="72" x2={x} y2="104" />{/each}
    <rect class="body" x="64" y="73" width="66" height="30" rx="7" />
    <circle class="boss" cx={PIVOT.x} cy="68" r="6" />
    <circle class="boss" cx={PIVOT.x} cy="108" r="6" />
    <rect class="barrel" x="130" y="79" width="32" height="18" />

    <!-- Gallonage ring: its numbers roll past the mark as it turns. -->
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
        <rect class="hit" x="160" y="40" width="44" height="96" />
        <rect class="ring-body" x="162" y="70" width="40" height="36" rx="4" />
        <clipPath id="ring-window"><rect x="162" y="72" width="40" height="32" /></clipPath>
        <g clip-path="url(#ring-window)">
          {#each settings as q, i (q)}
            {@const dy = (i - ring.current) * 15}
            <text class="ring-num" class:now={i === settingIndex} x="182" y={AXIS + 5 + dy} opacity={Math.max(0, 1 - Math.abs(dy) / 20)}>{q}</text>
          {/each}
        </g>
        <path class="mark" d={`M 155 ${AXIS - 5} L 161 ${AXIS} L 155 ${AXIS + 5} Z`} />
      </g>
    {:else}
      <rect class="ring-body fixed" x="162" y="70" width="40" height="36" rx="4" />
      <text class="ring-num now" x="182" y={AXIS + 5}>{nozzle.ratedFlowGpm}</text>
    {/if}

    <!-- Pattern collar: the rubber bumper, ribs sliding round as it turns, teeth at the tip. -->
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
      <rect class="hit" x="204" y="40" width="80" height="96" />
      {#each [70, 79, 88, 97, 106] as y (y)}<rect class="tooth" x="270" y={y - 3} width="12" height="6" rx="2" />{/each}
      <rect class="collar" x="204" y="64" width="70" height="48" rx="8" />
      {#each ribs as r, k (k)}
        {#if r.shown}<line class="rib" x1="210" y1={r.y} x2="268" y2={r.y} opacity={0.25 + 0.6 * r.depth} />{/if}
      {/each}
    </g>
    <text class="tag" x="278" y="134" text-anchor="end">Punta</text>

    <!-- The bale: two arms from the pivots, joined by the grip across the top. -->
    <g
      class="bale"
      role="switch"
      tabindex="0"
      aria-checked={nozzle.open}
      aria-label={nozzle.open ? "Manija abierta: tocar o empujar hacia la punta para cerrar" : "Manija cerrada: tocar o tirar hacia la manguera para abrir"}
      onpointerdown={baleDown}
      onpointermove={baleMove}
      onpointerup={baleUp}
      onpointercancel={baleUp}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(!nozzle.open))}
    >
      <rect class="hit" x={crossbar.x - 22} y="50" width="44" height="76" />
      <rect class="shadow" x={crossbar.x - 6 + 10 * crossbar.lift} y={60 + 6 * crossbar.lift} width="12" height="56" rx="6" />
      <line class="arm" x1={PIVOT.x} y1="68" x2={crossbar.x} y2="64" />
      <line class="arm" x1={PIVOT.x} y1="108" x2={crossbar.x} y2="112" />
      <rect class="grip" x={crossbar.x - 6 - 3 * crossbar.lift} y={58 - 2 * crossbar.lift} width={12 + 6 * crossbar.lift} height={60 + 4 * crossbar.lift} rx="6" />
      <circle class="pin" cx={PIVOT.x} cy="68" r="2.5" />
      <circle class="pin" cx={PIVOT.x} cy="108" r="2.5" />
    </g>
  </svg>

  <div class="readouts">
    <div class="readout" data-tour="manija">
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
  <p class="hint">Vista desde arriba. Toca la manija o deslízala: hacia la manguera abre, hacia la punta cierra. Gira el anillo y el collar arrastrando arriba o abajo.</p>
</div>

<style>
  .closeup { display: grid; gap: 8px; }
  svg { width: 100%; height: auto; background: var(--band); border-radius: 12px; touch-action: none; user-select: none; }
  .spray, .core, .flow, .tag, .hose, .lug, .swivel, .knurl, .body, .boss, .barrel, .ring-body, .ring-num, .mark, .collar, .rib, .tooth, .shadow, .pin { pointer-events: none; }
  .spray { fill: var(--water-soft); opacity: 0.8; }
  .core { fill: var(--water); opacity: 0.6; }
  .flow { font-size: 12px; font-weight: 700; text-anchor: end; fill: var(--water); font-variant-numeric: tabular-nums; }
  .tag { font-size: 10px; fill: var(--muted); }
  .hose { fill: var(--hose); }
  .swivel, .lug { fill: var(--steel); }
  .knurl { stroke: rgba(0, 0, 0, 0.25); stroke-width: 2; }
  .body { fill: #c0392b; }
  .boss { fill: var(--steel); stroke: #2b2f33; stroke-width: 1.5; }
  .barrel { fill: #8f989f; }
  .ring-body { fill: #c9ced3; stroke: var(--steel); stroke-width: 1.5; }
  .ring-num { font-size: 13px; font-weight: 700; text-anchor: middle; fill: #4a535c; font-variant-numeric: tabular-nums; }
  .ring-num.now { fill: #111; }
  .mark { fill: var(--warn); }
  .collar { fill: #2b2f33; }
  .rib { stroke: #5b656e; stroke-width: 2; }
  .tooth { fill: #2b2f33; }
  .shadow { fill: #000; opacity: 0.18; }
  .arm { stroke: #a9b1b8; stroke-width: 5; stroke-linecap: round; }
  .grip { fill: #2b2f33; stroke: #11151a; stroke-width: 1; }
  .pin { fill: #2b2f33; }
  .hit { fill: transparent; }
  .bale, .turn { cursor: grab; outline: none; }
  .bale:focus-visible .grip, .turn:focus-visible .collar, .turn:focus-visible .ring-body { stroke: var(--accent); stroke-width: 3; }
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
