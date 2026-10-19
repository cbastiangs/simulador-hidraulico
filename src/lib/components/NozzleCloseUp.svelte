<script lang="ts">
  import { Tween } from "svelte/motion";
  import type { ScenarioNozzle } from "$hydraulics/scenario.ts";
  import { anatomyOf } from "$lib/nozzle-anatomy.ts";
  import { silhouetteOf } from "$lib/nozzle-silhouettes.ts";

  // The nozzle's Close-up (UX.md §10.1 Operate, Close-up): drawn large and
  // worked like the real one. The model's anatomy (nozzle-anatomy.ts) decides
  // what is drawn: its own shutoff (bale lever, slide valve or ball valve),
  // pistol grip, gallonage ring, pressure ring, pattern collar and teeth.
  // Tap or pull the shutoff; turn the gallonage ring and the pattern collar by
  // dragging up or down across them. A readout with ‹ › buttons sits under
  // each drawn control, so every state is also one tap away. Each motion shows
  // a state the model has; the stream is illustrative (its length grows with
  // flow, no reach is claimed; MODEL.md §6).
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
  const anatomy = $derived(anatomyOf(nozzle));
  // The model's own static silhouette; null keeps the generic handline shape.
  const silhouette = $derived(silhouetteOf(nozzle));

  // Seen from above, hose on the left, tip on the right.
  // Bale: a U pivoting on both sides of the valve body; pushed forward (toward
  // the tip) it lies over the barrel and the valve is shut, pulled back it is
  // open. Slide valve: the knob rides the body, forward shut, back open. Ball
  // valve: the lever lies along the body when open, across it when shut.
  const OPEN_DEG = -72;
  const CLOSED_DEG = 72;
  const PIVOT = { x: 97, y: 88 };
  const ARM = 60;
  const AXIS = 88;
  const settings = $derived(nozzle.kind === "selectable" ? nozzle.settingsGpm : []);
  const settingIndex = $derived(Math.max(0, settings.indexOf(nozzle.ratedFlowGpm)));

  let dragDeg: number | null = $state(null);
  let dragF: number | null = $state(null);
  // One 0 (shut) → 1 (open) tween; each shutoff reads its own motion out of it.
  const motion = Tween.of<number>(() => (nozzle.open ? 1 : 0), { duration: ms(220) });
  const ring = Tween.of(() => settingIndex, { duration: ms(200) });
  const collar = Tween.of(() => nozzle.pattern, { duration: ms(160) });
  const flow = Tween.of(() => Math.min(flowGpm / nozzle.ratedFlowGpm, 1.3), { duration: ms(300) });

  const stream = $derived.by(() => {
    const halfAngle = ((4 + (anatomy.pattern ? collar.current : 0) * 41) * Math.PI) / 180;
    const length = 96 * (1 - 0.4 * (anatomy.pattern ? collar.current : 0)) * flow.current;
    const dy = Math.tan(halfAngle) * length;
    return { length, dy, core: dy * 0.35 };
  });

  // The bale's crossbar, projected from above: it travels along the axis and
  // looks thickest, with the longest shadow, when upright (nearest the eye).
  const baleDeg = $derived(dragDeg ?? (CLOSED_DEG + (OPEN_DEG - CLOSED_DEG) * motion.current));
  const crossbar = $derived.by(() => {
    const r = (baleDeg * Math.PI) / 180;
    return { x: PIVOT.x + ARM * Math.sin(r), lift: Math.cos(r) };
  });

  // Slide valve travel: the knob's centre, forward (shut) to back (open).
  const slideX = $derived(114 - 36 * (dragF ?? motion.current));
  // Ball valve: 90° across the body (shut) to along it (open).
  const ballRot = $derived(-90 + 90 * (dragF ?? motion.current));

  const patternName = (p: number) => (p < 0.08 ? "Chorro directo" : p < 0.55 ? "Neblina estrecha" : "Neblina amplia");
  const shutoffName = $derived(anatomy.shutoff === "slide" ? "Palanca" : anatomy.shutoff === "ball" ? "Palanca" : "Manija");
  /** Where the plain barrel starts: after the flow ring, or after the pressure ring that replaced it. */
  const barrelFrom = $derived(anatomy.flow === "ring" || anatomy.pressureRing ? 162 : 130);
  /** Where the water leaves the drawing: the collar's front edge, or the teeth when the model has them. */
  const tipX = $derived(anatomy.pattern && anatomy.teeth === "none" ? 274 : 282);

  let svg: SVGSVGElement | undefined = $state();
  function toSvg(e: PointerEvent) {
    const m = svg!.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  }

  // The shutoff: a tap toggles it; a pull follows the finger and snaps to the nearer end.
  let shut: { x: number; y: number; moved: boolean } | null = null;
  function shutDown(e: PointerEvent) {
    shut = { x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }
  function shutMove(e: PointerEvent) {
    if (!shut) return;
    if (Math.hypot(e.clientX - shut.x, e.clientY - shut.y) > 6) shut.moved = true;
    if (!shut.moved) return;
    const p = toSvg(e);
    if (anatomy.shutoff === "bale") {
      const deg = (Math.asin(Math.min(1, Math.max(-1, (p.x - PIVOT.x) / ARM))) * 180) / Math.PI;
      dragDeg = Math.min(CLOSED_DEG, Math.max(OPEN_DEG, deg));
    } else {
      // The knob or the lever follows the pointer's place along the axis.
      dragF = Math.min(1, Math.max(0, (114 - p.x) / 36));
    }
  }
  function shutUp() {
    if (!shut) return;
    if (!shut.moved) onOpen(!nozzle.open);
    else {
      const open = dragDeg !== null ? dragDeg < 0 : (dragF ?? 0) > 0.5;
      if (open !== nozzle.open) onOpen(open);
    }
    // Hand the control back to the tween from where the finger left it.
    if (dragDeg !== null || dragF !== null) {
      const settled = dragDeg !== null ? (CLOSED_DEG - dragDeg) / (CLOSED_DEG - OPEN_DEG) : (dragF ?? 0);
      motion.set(settled, { duration: 0 }).then(() => motion.set(nozzle.open ? 1 : 0));
    }
    dragDeg = null;
    dragF = null;
    shut = null;
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

  const TEETH = [70, 79, 88, 97, 106];
</script>

<div class="closeup">
  <svg bind:this={svg} viewBox="0 0 400 176" role="group" aria-label="Pitón visto desde arriba">
    <!-- Stream (illustrative). -->
    {#if stream.length > 1}
      <path class="spray" d={`M ${tipX} ${AXIS} L ${tipX + stream.length} ${AXIS - stream.dy} L ${tipX + stream.length} ${AXIS + stream.dy} Z`} />
      <path class="core" d={`M ${tipX} ${AXIS} L ${tipX + stream.length} ${AXIS - stream.core} L ${tipX + stream.length} ${AXIS + stream.core} Z`} />
    {/if}
    {#if nozzle.open && flowGpm > 0}<text class="flow" x="392" y="168">{flowGpm.toFixed(0)} gpm</text>{/if}

    <!-- Hose, then the model's own static silhouette — inlet swivel with its
         lugs, valve body, barrel, grip — or the generic handline when the
         model is not one of the researched ones. -->
    <rect class="hose" x="0" y="77" width="38" height="22" />
    <text class="tag" x="4" y="132">Manguera</text>
    {#if silhouette}
      {#each silhouette as p, i (i)}
        <path class={p.role === "grip" ? "grip2" : p.role} d={p.d} />
      {/each}
    {:else}
      <rect class="lug" x="43" y="64" width="14" height="8" rx="2" />
      <rect class="lug" x="43" y="104" width="14" height="8" rx="2" />
      <rect class="swivel" x="36" y="70" width="28" height="36" rx="4" />
      {#each [44, 50, 56] as x (x)}<line class="knurl" x1={x} y1="72" x2={x} y2="104" />{/each}
      <!-- The pistol grip, under the valve body (drawn first, so the body hides its top). -->
      {#if anatomy.grip}
        <path class="grip2" d="M 80 100 C 72 124 78 138 92 142 L 104 142 C 116 136 118 114 110 100 Z" />
      {/if}
      <rect class="body" x="64" y="73" width="66" height="30" rx="7" />
      <rect class="barrel" x={barrelFrom} y="79" width={282 - barrelFrom} height="18" />
    {/if}

    <!-- Gallonage ring: its numbers roll past the mark as it turns. -->
    {#if anatomy.flow === "ring"}
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
    {:else if anatomy.pressureRing}
      <!-- The model's pressure-selection ring (POK: 50/100 psi): drawn, not worked until the rating story is decided. -->
      <g class="pressure-ring" aria-hidden="true">
        <rect class="ring-body" x="162" y="70" width="40" height="36" rx="4" />
        <rect class="pressure-half" x="182" y="70" width="20" height="36" rx="4" />
        <text class="ring-num now" x="172" y={AXIS + 5}>{anatomy.pressureRing[0]}</text>
        <text class="ring-num now" x="192" y={AXIS + 5}>{anatomy.pressureRing[1]}</text>
      </g>
    {/if}
    {#if anatomy.flow === "slide-index"}
      <!-- The slide valve's own index marks (POK: 20/40/60/80/100%). -->
      {#each [0, 1, 2, 3, 4] as k (k)}
        <line class="index" x1={74 + k * 12} y1="74" x2={74 + k * 12} y2="80" />
      {/each}
    {/if}

    <!-- Pattern collar: the rubber bumper, ribs sliding round as it turns, teeth at the tip. -->
    {#if anatomy.pattern}
      <g
        class="turn"
        role="slider"
        tabindex="0"
        aria-label="Collar de patrón: chorro directo a neblina amplia"
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
        {#if anatomy.teeth === "metal"}
          {#each TEETH as y (y)}<path class="tooth" d={`M 268 ${y - 4} L 282 ${y} L 268 ${y + 4} Z`} />{/each}
        {:else if anatomy.teeth === "rubber"}
          {#each TEETH as y (y)}<rect class="tooth-rubber" x="268" y={y - 3} width="12" height="6" rx="3" />{/each}
        {/if}
        <rect class="collar" x="204" y="64" width="70" height="48" rx="8" />
        {#each ribs as r, k (k)}
          {#if r.shown}<line class="rib" x1="210" y1={r.y} x2="268" y2={r.y} opacity={0.25 + 0.6 * r.depth} />{/if}
        {/each}
      </g>
      <text class="tag" x="278" y="134" text-anchor="end">Punta</text>
    {/if}

    <!-- The shutoff, in the model's own kind. -->
    {#if anatomy.shutoff !== "none"}
      <g
        class="bale"
        role="switch"
        tabindex="0"
        aria-checked={nozzle.open}
        aria-label={nozzle.open
          ? `${shutoffName} abierta: tocar para cerrar`
          : `${shutoffName} cerrada: tocar para abrir`}
        onpointerdown={shutDown}
        onpointermove={shutMove}
        onpointerup={shutUp}
        onpointercancel={shutUp}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(!nozzle.open))}
      >
        {#if anatomy.shutoff === "bale"}
          <rect class="hit" x={crossbar.x - 22} y="50" width="44" height="76" />
          <rect class="shadow" x={crossbar.x - 6 + 10 * crossbar.lift} y={60 + 6 * crossbar.lift} width="12" height="56" rx="6" />
          <line class="arm" x1={PIVOT.x} y1="68" x2={crossbar.x} y2="64" />
          <line class="arm" x1={PIVOT.x} y1="108" x2={crossbar.x} y2="112" />
          <rect class="grip" x={crossbar.x - 6 - 3 * crossbar.lift} y={58 - 2 * crossbar.lift} width={12 + 6 * crossbar.lift} height={60 + 4 * crossbar.lift} rx="6" />
          <circle class="pin" cx={PIVOT.x} cy="68" r="2.5" />
          <circle class="pin" cx={PIVOT.x} cy="108" r="2.5" />
        {:else if anatomy.shutoff === "slide"}
          <rect class="hit" x="60" y="48" width="76" height="80" />
          <rect class="slide-rail" x="66" y="64" width="60" height="8" rx="4" />
          <rect class="slider" x={slideX - 14} y="56" width="28" height="24" rx="6" />
        {:else}
          <rect class="hit" x="60" y="48" width="76" height="80" />
          <g transform={`rotate(${ballRot} ${PIVOT.x} ${AXIS})`}>
            <rect class="ball-bar" x={PIVOT.x - 26} y={AXIS - 5} width="52" height="10" rx="5" />
          </g>
          <circle class="pin" cx={PIVOT.x} cy={AXIS} r="4" />
        {/if}
      </g>
    {/if}
  </svg>

  <div class="readouts">
    {#if anatomy.shutoff !== "none"}
      <div class="readout" data-tour="manija">
        <span class="label">{shutoffName}</span>
        <button type="button" class="state" class:on={nozzle.open} aria-pressed={nozzle.open} onclick={() => onOpen(!nozzle.open)}>{nozzle.open ? "Abierta" : "Cerrada"}</button>
      </div>
    {/if}
    {#if settings.length}
      <div class="readout">
        <span class="label">{anatomy.flow === "slide-index" ? "Caudal (índice)" : "Anillo"}</span>
        <div class="step">
          <button type="button" aria-label="Caudal menor" disabled={settingIndex === 0} onclick={() => stepSetting(-1)}>‹</button>
          <b>{nozzle.ratedFlowGpm} <small>gpm</small></b>
          <button type="button" aria-label="Caudal mayor" disabled={settingIndex === settings.length - 1} onclick={() => stepSetting(1)}>›</button>
        </div>
      </div>
    {/if}
    {#if anatomy.pattern}
      <div class="readout">
        <span class="label">Patrón</span>
        <div class="step">
          <button type="button" aria-label="Hacia chorro directo" disabled={nozzle.pattern <= 0} onclick={() => stepPattern(-0.1)}>‹</button>
          <b>{patternName(nozzle.pattern)}<span class="track"><span style:left={`${nozzle.pattern * 100}%`}></span></span></b>
          <button type="button" aria-label="Hacia neblina amplia" disabled={nozzle.pattern >= 1} onclick={() => stepPattern(0.1)}>›</button>
        </div>
      </div>
    {/if}
  </div>
  <p class="hint">
    Vista desde arriba.
    {#if anatomy.shutoff === "bale"}Toca la manija o deslízala: hacia la manguera abre, hacia la punta cierra.
    {:else if anatomy.shutoff === "slide"}Desliza la palanca: hacia la manguera abre, hacia la punta cierra.
    {:else if anatomy.shutoff === "ball"}Gira la palanca: a lo largo abre, cruzada cierra.{/if}
    {#if settings.length && anatomy.flow === "ring"}Gira el anillo arrastrando arriba o abajo.{/if}
    {#if anatomy.pattern}Gira el collar arrastrando arriba o abajo.{/if}
  </p>
</div>

<style>
  .closeup { display: grid; gap: 8px; }
  svg { width: 100%; height: auto; background: var(--band); border-radius: 12px; touch-action: none; user-select: none; }
  .spray, .core, .flow, .tag, .hose, .lug, .swivel, .knurl, .body, .barrel, .grip2, .trim, .ring-body, .ring-num, .mark, .collar, .rib, .tooth, .tooth-rubber, .shadow, .pin, .slide-rail, .index, .pressure-half { pointer-events: none; }
  .spray { fill: var(--water-soft); opacity: 0.8; }
  .core { fill: var(--water); opacity: 0.6; }
  .flow { font-size: 12px; font-weight: 700; text-anchor: end; fill: var(--water); font-variant-numeric: tabular-nums; }
  .tag { font-size: 10px; fill: var(--muted); }
  .hose { fill: var(--hose); }
  .swivel, .lug { fill: var(--steel); }
  .knurl { stroke: rgba(0, 0, 0, 0.25); stroke-width: 2; }
  .body { fill: #c0392b; }
  .barrel { fill: #8f989f; }
  .grip2 { fill: #2b2f33; }
  .trim { fill: #2b2f33; }
  .ring-body { fill: #c9ced3; stroke: var(--steel); stroke-width: 1.5; }
  .ring-num { font-size: 13px; font-weight: 700; text-anchor: middle; fill: #4a535c; font-variant-numeric: tabular-nums; }
  .ring-num.now { fill: #111; }
  .mark { fill: var(--warn); }
  .pressure-half { fill: #aeb7bf; }
  .collar { fill: #2b2f33; }
  .rib { stroke: #5b656e; stroke-width: 2; }
  .tooth { fill: #2b2f33; }
  .tooth-rubber { fill: #2b2f33; }
  .shadow { fill: #000; opacity: 0.18; }
  .arm { stroke: #a9b1b8; stroke-width: 5; stroke-linecap: round; }
  .grip { fill: #2b2f33; stroke: #11151a; stroke-width: 1; }
  .pin { fill: #2b2f33; }
  .slide-rail { fill: #8f989f; }
  .slider { fill: #2b2f33; stroke: #11151a; stroke-width: 1; }
  .ball-bar { fill: #2b2f33; stroke: #11151a; stroke-width: 1; }
  .index { stroke: var(--muted); stroke-width: 2; }
  .hit { fill: transparent; }
  .bale, .turn { cursor: grab; outline: none; }
  .bale:focus-visible .grip, .bale:focus-visible .slider, .bale:focus-visible .ball-bar, .turn:focus-visible .collar, .turn:focus-visible .ring-body { stroke: var(--accent); stroke-width: 3; }
  /* Patrón, always last, takes the room its two-word names need ("Neblina estrecha") between its arrows. */
  .readouts { display: flex; flex-wrap: wrap; gap: 6px; }
  .readouts > .readout { flex: 1 1 84px; }
  .readouts > .readout:last-child { flex: 1.6 1 132px; }
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
