<script lang="ts">
  import { Tween } from "svelte/motion";
  import type { ScenarioNozzle } from "$hydraulics/scenario.ts";
  import { anatomyOf } from "$lib/nozzle-anatomy.ts";
  import { topArtOf } from "$lib/nozzle-art/index.ts";

  // The nozzle's Close-up (UX.md §10.1 Operate, Close-up): drawn large and
  // worked like the real one. The model's own top view (nozzle-art/, owner
  // 2026-10-19) carries the static shell at its true proportions — 14 units
  // to the inch, hose at the left — and anchors the working controls: its
  // gallonage ring, pressure ring, pattern collar and shutter. Anything not
  // drawn yet keeps the generic handline (the drawing before 2026-10-19).
  // Tap or pull the shutoff; turn the gallonage ring and the pattern collar by
  // dragging up or down across them. The ring's numbers sit around its
  // circumference and turn with it — the selected one upright at the index —
  // and a floating readout rides above the ring while it is switched, since
  // the turning numbers are not all readable. A readout with ‹ › buttons sits
  // under each drawn control, so every state is also one tap away. Each motion
  // shows a state the model has; the stream is illustrative (its length grows
  // with flow, no reach is claimed; MODEL.md §6).
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
  // The model's own art; null keeps the generic handline shape.
  const art = $derived(topArtOf(nozzle));

  // Seen from above, hose on the left, tip on the right; the axis never moves.
  const AXIS = 88;

  // Each working control's geometry: the model's own, or the generic anchors.
  const ringGeo = $derived(
    art ? art.ring : anatomy.flow === "ring" ? { from: 162, to: 202, r: 18, ink: "#4a535c" } : null,
  );
  const pressGeo = $derived(
    art ? art.pressure : anatomy.pressureRing ? { from: 162, to: 202, r: 18, ink: "#4a535c" } : null,
  );
  const collarGeo = $derived(
    art ? art.collar : anatomy.pattern ? { from: 204, to: 274, r: 24, ribs: 7, ink: "#5b656e" } : null,
  );
  const shut = $derived(
    art
      ? art.shutoff
      : anatomy.shutoff === "bale"
        ? ({ kind: "bale", pivotX: 97, arm: 60, offset: 14 } as const)
        : anatomy.shutoff === "slide"
          ? ({ kind: "slide", railFrom: 66, railTo: 126, railY: 88, knobW: 28, knobH: 24 } as const)
          : anatomy.shutoff === "ball"
            ? ({ kind: "ball", pivotX: 97, barLen: 52 } as const)
            : ({ kind: "none" } as const),
  );
  const shutKind = $derived(shut.kind);
  /** Where the water leaves the drawing: the model's tip, or the generic collar's. */
  const tipX = $derived(art ? art.tipX : anatomy.pattern && anatomy.teeth === "none" ? 274 : 282);
  /** Where the generic barrel starts, after the ring or pressure ring (the fallback shell only). */
  const barrelFrom = $derived(ringGeo ? ringGeo.from : pressGeo ? pressGeo.from : 130);
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
    const length = Math.min(96 * (1 - 0.4 * (anatomy.pattern ? collar.current : 0)) * flow.current, 396 - tipX);
    const dy = Math.tan(halfAngle) * length;
    return { length, dy, core: dy * 0.35 };
  });

  // The ring's numbers, each at its own angular place on the ring: upright and
  // at the centre of the band when selected, tilted and sliding across the
  // band's width as the ring turns, gone (edge-on) past the shoulders. They
  // paint far-to-near, so the ones off the near shoulder lie on top.
  const OPEN_DEG = -72;
  const CLOSED_DEG = 72;
  // Numbers are printed round the ring, so their height runs across the band: never taller than it is wide.
  const ringFont = $derived(ringGeo ? Math.max(8, Math.min(14, ringGeo.r * 0.62, (ringGeo.to - ringGeo.from) * 0.7)) : 13);
  /** A glyph printed on a ring's surface, seen from above as the person holding the nozzle sees it (behind it, tip ahead): the digits face them, their tops toward the tip and the baseline running round the circumference (down the screen, ascending values downward), squashed by cos θ as the ring turns it away. */
  const onRing = (cx: number, r: number, th: number) =>
    `translate(${cx} ${AXIS + r * Math.sin((th * Math.PI) / 180)}) scale(1 ${Math.cos((th * Math.PI) / 180)}) rotate(90)`;
  const ringDigits = $derived.by(() => {
    if (!ringGeo || !settings.length) return [];
    const cx = (ringGeo.from + ringGeo.to) / 2;
    const step = 360 / settings.length;
    return settings
      .map((q, i) => {
        const th = (i - ring.current) * step;
        const rad = (th * Math.PI) / 180;
        return { q, now: i === settingIndex, th, x: cx, op: Math.max(0.12, Math.cos(rad)), front: Math.sin(rad) };
      })
      .filter((d) => Math.abs(d.th) < 88)
      .sort((a, b) => a.front - b.front);
  });
  /** The horizontal readout above the ring: the ring's own numbers keep their
   *  physical orientation, so the selected value is read here instead. */
  const toast = $derived.by(() => {
    if (!ringGeo) return null;
    const w = 30 + 9 * `${nozzle.ratedFlowGpm}`.length;
    return { x: 14 + w / 2, w, y: 40 };
  });

  const baleDeg = $derived(dragDeg ?? (CLOSED_DEG + (OPEN_DEG - CLOSED_DEG) * motion.current));
  const crossbar = $derived.by(() => {
    if (shut.kind !== "bale") return { x: 0, w: 0 };
    const r = (baleDeg * Math.PI) / 180;
    const w = Math.max(12, Math.abs(shut.arm * Math.sin(r)));
    return { x: shut.pivotX + (shut.arm * Math.sin(r)) / 2 - w / 2, w };
  });

  /** Half the loop's span: the arms ride the body's flanks, on both sides of the axis. */
  const baleHalf = $derived(shut.kind === "bale" ? Math.abs(shut.offset ?? 16) : 0);
  /** The crossbar's place: the free end of the arms, ahead of the pivot when shut, behind it when open. */
  const baleEnd = $derived(baleDeg >= 0 ? crossbar.x + crossbar.w - 3.5 : crossbar.x + 3.5);

  // Slide valve travel: the knob's centre, forward (shut) to back (open).
  const slideCentres = $derived.by(() => {
    if (shut.kind !== "slide") return { closed: 0, open: 0 };
    const m = shut.knobW / 2 - 2;
    return { closed: shut.railTo - m, open: shut.railFrom + m };
  });
  const slideX = $derived(slideCentres.closed + (slideCentres.open - slideCentres.closed) * (dragF ?? motion.current));
  // Ball valve: 90° across the body (shut) to along it (open).
  const ballRot = $derived(-90 + 90 * (dragF ?? motion.current));

  const patternName = (p: number) => (p < 0.08 ? "Chorro directo" : p < 0.55 ? "Neblina estrecha" : "Neblina amplia");
  const shutoffName = $derived(shutKind === "slide" ? "Palanca" : shutKind === "ball" ? "Palanca" : "Manija");

  let svg: SVGSVGElement | undefined = $state();
  function toSvg(e: PointerEvent) {
    const m = svg!.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  }

  // The shutoff: a tap toggles it; a pull follows the finger and snaps to the nearer end.
  let shutDownAt: { x: number; y: number; moved: boolean } | null = null;
  function shutDown(e: PointerEvent) {
    shutDownAt = { x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }
  function shutMove(e: PointerEvent) {
    if (!shutDownAt) return;
    if (Math.hypot(e.clientX - shutDownAt.x, e.clientY - shutDownAt.y) > 6) shutDownAt.moved = true;
    if (!shutDownAt.moved) return;
    const p = toSvg(e);
    if (shut.kind === "bale") {
      const deg = (Math.asin(Math.min(1, Math.max(-1, (p.x - shut.pivotX) / shut.arm))) * 180) / Math.PI;
      dragDeg = Math.min(CLOSED_DEG, Math.max(OPEN_DEG, deg));
    } else if (shut.kind === "slide") {
      // The knob follows the pointer's place along its rail.
      dragF = Math.min(1, Math.max(0, (slideCentres.closed - p.x) / (slideCentres.closed - slideCentres.open)));
    } else if (shut.kind === "ball") {
      // The lever follows the pointer's place along the body.
      dragF = Math.min(1, Math.max(0, (shut.pivotX + 17 - p.x) / 34));
    }
  }
  function shutUp() {
    if (!shutDownAt) return;
    if (!shutDownAt.moved) onOpen(!nozzle.open);
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
    shutDownAt = null;
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
  const ribs = $derived.by(() => {
    if (!collarGeo || !collarGeo.ribs) return [];
    return Array.from({ length: collarGeo.ribs }, (_, k) => {
      const a = (k / collarGeo.ribs) * Math.PI * 2 + collar.current * Math.PI * 1.5;
      return { y: AXIS - collarGeo.r * 0.83 * Math.sin(a), shown: Math.cos(a) > 0, depth: Math.cos(a) };
    });
  });

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

    <!-- Hose, then the model's own top view at its true proportions
         (nozzle-art/), or the generic handline for anything not drawn yet. -->
    <rect class="hose" x="0" y="77" width="38" height="22" />
    <text class="tag" x="4" y="132">Manguera</text>
    {#if art}
      {#each art.shell as p, i (i)}
        <path class={p.role} d={p.d} transform={p.t} opacity={p.opacity ?? 1} />
      {/each}
    {:else}
      <rect class="lug" x="43" y="64" width="14" height="8" rx="2" />
      <rect class="lug" x="43" y="104" width="14" height="8" rx="2" />
      <rect class="swivel" x="36" y="70" width="28" height="36" rx="4" />
      {#each [44, 50, 56] as x (x)}<line class="knurl" x1={x} y1="72" x2={x} y2="104" />{/each}
      <rect class="body" x="64" y="73" width="66" height="30" rx="7" />
      <rect class="barrel" x={barrelFrom} y="79" width={282 - barrelFrom} height="18" />
    {/if}

    <!-- Gallonage ring: its numbers sit around the ring's circumference; the
         selected one stands at the index, the others tilt and slide across the
         band as the ring turns. The generic ring brings its own band. -->
    {#if ringGeo}
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
        <rect class="hit" x={ringGeo.from - 10} y="40" width={ringGeo.to - ringGeo.from + 20} height="96" />
        {#if !art}
          <rect class="ring-body" x={ringGeo.from} y={AXIS - ringGeo.r} width={ringGeo.to - ringGeo.from} height={ringGeo.r * 2} rx="4" />
        {/if}
        {#if settings.length}
          {#each ringDigits as d (d.q)}
            <text
              class="ring-num"
              class:now={d.now}
              font-size={ringFont}
              text-anchor="middle"
              dominant-baseline="central"
              opacity={d.op}
              style="fill: {ringGeo.ink}"
              transform={onRing(d.x, ringGeo.r, d.th)}
            >{d.q}</text>
          {/each}
        {:else}
          <text class="ring-num now" font-size={ringFont} text-anchor="middle" dominant-baseline="central" style="fill: {ringGeo.ink}" transform={onRing((ringGeo.from + ringGeo.to) / 2, ringGeo.r, 0)}>{nozzle.ratedFlowGpm}</text>
        {/if}
        <path class="mark" d={`M ${ringGeo.from - 7} ${AXIS - 5} L ${ringGeo.from - 1} ${AXIS} L ${ringGeo.from - 7} ${AXIS + 5} Z`} />
      </g>
    {/if}
    {#if pressGeo && anatomy.pressureRing}
      <!-- The model's pressure-selection ring (POK: 50/100 psi): drawn, not worked until the rating story is decided. -->
      <g class="pressure-ring" aria-hidden="true">
        {#if !art}
          <rect class="ring-body" x={pressGeo.from} y={AXIS - pressGeo.r} width={pressGeo.to - pressGeo.from} height={pressGeo.r * 2} rx="4" />
          <rect class="pressure-half" x={(pressGeo.from + pressGeo.to) / 2} y={AXIS - pressGeo.r} width={(pressGeo.to - pressGeo.from) / 2} height={pressGeo.r * 2} rx="4" />
        {/if}
        <!-- The two ratings sit round the ring, 76° apart, each reading along the circumference. -->
        {#each [[anatomy.pressureRing[0], -38], [anatomy.pressureRing[1], 38]] as [q, th] (q)}
          <text class="ring-num now" font-size={Math.min(12, (pressGeo.to - pressGeo.from) * 0.6)} text-anchor="middle" dominant-baseline="central" style="fill: {pressGeo.ink}" transform={onRing((pressGeo.from + pressGeo.to) / 2, pressGeo.r, Number(th))}>{q}</text>
        {/each}
      </g>
    {/if}
    {#if !art && anatomy.flow === "slide-index"}
      <!-- The slide valve's own index marks (POK: 20/40/60/80/100%). -->
      {#each [0, 1, 2, 3, 4] as k (k)}
        <line class="index" x1={74 + k * 12} y1="74" x2={74 + k * 12} y2="80" />
      {/each}
    {/if}

    <!-- Pattern collar: the model's own bumper (art); the ridges slide round it as it turns. -->
    {#if collarGeo}
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
        <rect class="hit" x={collarGeo.from - 6} y="40" width={collarGeo.to - collarGeo.from + 10} height="96" />
        {#if !art}
          {#if anatomy.teeth === "metal"}
            {#each TEETH as y (y)}<path class="tooth" d={`M 268 ${y - 4} L 282 ${y} L 268 ${y + 4} Z`} />{/each}
          {:else if anatomy.teeth === "rubber"}
            {#each TEETH as y (y)}<rect class="tooth-rubber" x="268" y={y - 3} width="12" height="6" rx="3" />{/each}
          {/if}
          <rect class="collar" x={collarGeo.from} y={AXIS - collarGeo.r} width={collarGeo.to - collarGeo.from} height={collarGeo.r * 2} rx="8" />
        {/if}
        {#each ribs as r, k (k)}
          {#if r.shown}<line class="rib" x1={collarGeo.from + 6} y1={r.y} x2={collarGeo.to - 6} y2={r.y} stroke={collarGeo.ink} opacity={0.25 + 0.6 * r.depth} />{/if}
        {/each}
      </g>
      <text class="tag" x={tipX} y="134" text-anchor="end">Punta</text>
    {/if}

    <!-- The shutoff, in the model's own kind. -->
    {#if shutKind !== "none" && shut.kind === "bale"}
      <g
        class="bale"
        role="switch"
        tabindex="0"
        aria-checked={nozzle.open}
        aria-label={nozzle.open ? `${shutoffName} abierta: tocar para cerrar` : `${shutoffName} cerrada: tocar para abrir`}
        onpointerdown={shutDown}
        onpointermove={shutMove}
        onpointerup={shutUp}
        onpointercancel={shutUp}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(!nozzle.open))}
      >
        <rect class="hit" x={crossbar.x - 10} y={AXIS - baleHalf - 16} width={crossbar.w + 20} height={2 * baleHalf + 32} />
        <!-- Seen from above a bale is a U: an arm along each flank of the body, joined by the crossbar at its free end. -->
        <rect class="grip" x={crossbar.x} y={AXIS - baleHalf - 3.5} width={crossbar.w} height="7" rx="3.5" />
        <rect class="grip" x={crossbar.x} y={AXIS + baleHalf - 3.5} width={crossbar.w} height="7" rx="3.5" />
        <rect class="grip" x={baleEnd - 3.5} y={AXIS - baleHalf - 3.5} width="7" height={2 * baleHalf + 7} rx="3.5" />
        <circle class="pin" cx={shut.pivotX} cy={AXIS - baleHalf} r="3" />
        <circle class="pin" cx={shut.pivotX} cy={AXIS + baleHalf} r="3" />
      </g>
    {:else if shutKind !== "none" && shut.kind === "slide"}
      <g
        class="bale"
        role="switch"
        tabindex="0"
        aria-checked={nozzle.open}
        aria-label={nozzle.open ? `${shutoffName} abierta: tocar para cerrar` : `${shutoffName} cerrada: tocar para abrir`}
        onpointerdown={shutDown}
        onpointermove={shutMove}
        onpointerup={shutUp}
        onpointercancel={shutUp}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(!nozzle.open))}
      >
        <rect class="hit" x={shut.railFrom - 6} y={shut.railY - 16} width={shut.railTo - shut.railFrom + 12} height={shut.knobH + 20} />
        <rect class="slide-rail" x={shut.railFrom} y={shut.railY - 4} width={shut.railTo - shut.railFrom} height="8" rx="4" />
        <rect class="slider" x={slideX - shut.knobW / 2} y={shut.railY - shut.knobH / 2} width={shut.knobW} height={shut.knobH} rx="6" />
      </g>
    {:else if shutKind !== "none" && shut.kind === "ball"}
      <g
        class="bale"
        role="switch"
        tabindex="0"
        aria-checked={nozzle.open}
        aria-label={nozzle.open ? `${shutoffName} abierta: tocar para cerrar` : `${shutoffName} cerrada: tocar para abrir`}
        onpointerdown={shutDown}
        onpointermove={shutMove}
        onpointerup={shutUp}
        onpointercancel={shutUp}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(!nozzle.open))}
      >
        <rect class="hit" x={shut.pivotX - 36} y="48" width="72" height="80" />
        <g transform={`rotate(${ballRot} ${shut.pivotX} ${AXIS})`}>
          <rect class="ball-bar" x={shut.pivotX - shut.barLen / 2} y={AXIS - 5} width={shut.barLen} height="10" rx="5" />
        </g>
        <circle class="pin" cx={shut.pivotX} cy={AXIS} r="4" />
      </g>
    {/if}

    <!-- The floating readout: the number being selected, readable while the
         ring's own numbers are moving. -->
    {#if toast}
      <g class="toast" aria-hidden="true">
        <rect x={toast.x - toast.w / 2} y={toast.y - 13} width={toast.w} height="26" rx="7" />
        <text x={toast.x} y={toast.y} text-anchor="middle" dominant-baseline="central">{nozzle.ratedFlowGpm} <tspan class="unit">gpm</tspan></text>
      </g>
    {/if}
  </svg>

  <div class="readouts">
    {#if shutKind !== "none"}
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
    {#if shutKind === "bale"}Toca la manija o deslízala: hacia la manguera abre, hacia la punta cierra.
    {:else if shutKind === "slide"}Desliza la palanca: hacia la manguera abre, hacia la punta cierra.
    {:else if shutKind === "ball"}Gira la palanca: a lo largo abre, cruzada cierra.{/if}
    {#if settings.length && anatomy.flow === "ring"}Gira el anillo arrastrando arriba o abajo: el número elegido queda a la vista.{/if}
    {#if anatomy.pattern}Gira el collar arrastrando arriba o abajo.{/if}
  </p>
</div>

<style>
  .closeup { display: grid; gap: 8px; }
  svg { width: 100%; max-width: 400px; justify-self: center; height: auto; background: var(--band); border-radius: 12px; touch-action: none; user-select: none; }
  .spray, .core, .flow, .tag, .hose, .lug, .swivel, .knurl, .body, .barrel, .grip2, .trim, .ring-body, .ring-num, .mark, .collar, .rib, .tooth, .tooth-rubber, .shadow, .pin, .slide-rail, .index, .pressure-half,
  .dark, .steel, .brass, .label, .red, .yellow, .orange, .blue { pointer-events: none; }
  /* The product's own colours, fixed in both themes (the art palette, nozzle-art/types.ts). */
  .dark { fill: #2b2f33; }
  .steel { fill: #8f989f; }
  .brass { fill: #b08d57; }
  .label { fill: #e8eaec; }
  .red { fill: #c0392b; }
  .yellow { fill: #e8c02a; }
  .orange { fill: #e07f2a; }
  .blue { fill: #2aa7c4; }
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
  .ring-num { font-weight: 700; fill: #4a535c; font-variant-numeric: tabular-nums; }
  .mark { fill: var(--warn); }
  .pressure-half { fill: #aeb7bf; }
  .collar { fill: #2b2f33; }
  .rib { stroke: #5b656e; stroke-width: 2; }
  .tooth { fill: #2b2f33; }
  .tooth-rubber { fill: #2b2f33; }
  .grip { fill: #2b2f33; stroke: #11151a; stroke-width: 1; }
  .pin { fill: #2b2f33; }
  .slide-rail { fill: #8f989f; }
  .slider { fill: #2b2f33; stroke: #11151a; stroke-width: 1; }
  .ball-bar { fill: #9aa3ab; stroke: #11151a; stroke-width: 1; }
  .index { stroke: var(--muted); stroke-width: 2; }
  .hit { fill: transparent; }
  .toast rect { fill: var(--ink); }
  .toast text { fill: var(--band); font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .toast .unit { font-size: 9px; font-weight: 400; }
  .bale, .turn { cursor: grab; outline: none; }
  .bale:focus-visible .grip, .bale:focus-visible .slider, .bale:focus-visible .ball-bar, .turn:focus-visible .collar, .turn:focus-visible .ring-body { stroke: var(--accent); stroke-width: 3; }
  /* The focus ring rides the hit area, so it shows over every model's own art too. */
  .bale:focus-visible .hit, .turn:focus-visible .hit { fill: none; stroke: var(--accent); stroke-width: 2; stroke-dasharray: 5 4; }
  /* Patrón, always last, takes the room its two-word names need ("Neblina estrecha") between its arrows. */
  .readouts { display: flex; flex-wrap: wrap; gap: 6px; }
  .readouts > .readout { flex: 1 1 84px; }
  .readouts > .readout:last-child { flex: 1.6 1 180px; }
  .readout { min-width: 0; }
  .readout { display: grid; gap: 4px; align-content: start; }
  .label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .state { min-height: 44px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); font-weight: 700; cursor: pointer; }
  .state.on { background: var(--water); border-color: var(--water); color: #fff; }
  .step { display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: center; min-height: 44px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
  .step b { text-align: center; font-size: 13px; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .track { display: block; position: relative; height: 3px; margin: 4px 6px 0; border-radius: 2px; background: var(--line); }
  .track span { position: absolute; top: -2px; width: 7px; height: 7px; margin-left: -3.5px; border-radius: 50%; background: var(--water); }
  .step small { font-weight: 400; color: var(--muted); }
  .step button { height: 44px; border: 0; background: transparent; font-size: 20px; color: var(--ink); cursor: pointer; }
  .step button:disabled { opacity: 0.3; cursor: default; }
  @media (max-width: 1023.98px) {
    .readouts { order: -1; }
    svg { max-width: 300px; }
  }
  .hint { margin: 0; font-size: 12px; color: var(--muted); }
</style>
