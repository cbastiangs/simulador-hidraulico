<script lang="ts">
  import { Tween } from "svelte/motion";
  import type { ScenarioNozzle } from "$hydraulics/scenario.ts";
  import { smoothBoreFlowGpm } from "$hydraulics/nozzle.ts";
  import { anatomyOf } from "$lib/nozzle-anatomy.ts";
  import { sideArtOf } from "$lib/nozzle-art/index.ts";
  import { REACH_ANGLE_DEG } from "$hydraulics/reach.ts";
  import type { WaterMotion } from "$lib/water-motion.ts";

  // The nozzle on the canvas (UX.md §3): the model's own side view
  // (nozzle-art/, owner 2026-10-19) when one is drawn — its shell, its shutoff
  // in its two poses, where its stream leaves — and the generic drawing
  // before 2026-10-19 for anything else: a shutoff it really has (bale, slide
  // or ball), its pistol grip, gallonage ring, pressure ring, pattern collar
  // and teeth. The cone is the spray at the tip (illustrative: it grows with
  // flow); the arc beyond it is the stream in world metres (MODEL.md §3.14),
  // drawn in the canvas's frame, which tilts the nozzle to the data's 32°.
  let {
    nozzle,
    flowGpm,
    x,
    y,
    selected,
    onToggle,
    onGrab,
    color = null,
    small = false,
    jet = null,
    view = null,
    waterPhase,
  }: {
    nozzle: ScenarioNozzle;
    flowGpm: number;
    x: number;
    y: number;
    selected: boolean;
    onToggle: () => void;
    /** A press on the nozzle's body: the canvas drags it like its coupling handle. */
    onGrab?: (e: PointerEvent) => void;
    /** The line's colour on a branched lay (line-colors.ts): a band at the inlet, like tape on a coupling. */
    color?: string | null;
    /** Drawn too small to aim a finger at: on touch screens the bale is drawing only (UX.md §8.1). */
    small?: boolean;
    /** The stream (Canvas.svelte jetOf): engine reach, icon units per metre, its label and its drops. */
    jet?: { reachM: number; fitted: boolean; unitsPerM: number; screen: number; label: string; numbered: boolean; drops: WaterMotion } | null;
    /** The visible canvas's right and top edges, icon units from the nozzle, so the stream's label stays on screen. */
    view?: { right: number; top: number } | null;
    /** The canvas's shared water clock (water-motion.ts). */
    waterPhase?: (node: SVGPathElement, value: WaterMotion) => { update(v: WaterMotion): void; destroy(): void };
  } = $props();

  const design = $derived(nozzle.design ?? "fog");
  const anatomy = $derived(anatomyOf(nozzle));
  const art = $derived(sideArtOf(nozzle));
  const fog = $derived(design !== "open-end" && design !== "smooth-bore");
  // One 0 → 1 tween; each shutoff reads its own motion out of it.
  const motion = Tween.of(() => (nozzle.open ? 1 : 0), { duration: 220 });
  // An open end has no rating; its stream grows with flow against a typical handline flow.
  const ratedFlow = $derived(design === "smooth-bore" ? smoothBoreFlowGpm(nozzle.tipIn!, nozzle.ratedPressurePsi) : nozzle.ratedFlowGpm);
  const flow = Tween.of(() => Math.min(flowGpm / (design === "open-end" ? 250 : ratedFlow), 1.3), { duration: 300 });
  const reach = Tween.of(() => jet?.reachM ?? 0, { duration: 300 });
  const pattern = Tween.of(() => (fog && anatomy.pattern ? nozzle.pattern : 0), { duration: 200 });

  // Stations along the axis, hose at 0: valve body to 22, the gallonage ring
  // (or a plain barrel when the model has none), then the collar.
  const ringEnd = $derived(anatomy.flow === "ring" ? 32 : 22);
  const barrelEnd = $derived(anatomy.flow === "ring" ? ringEnd : ringEnd + 14);
  const collarEnd = $derived(anatomy.pattern ? barrelEnd + 18 : barrelEnd + 2);
  /** Where the water leaves the drawing, and how wide it is there. */
  const exit = $derived(
    art
      ? art.exit
      : design === "open-end"
        ? { x: 6, half: 6 }
        : design === "smooth-bore"
          ? { x: 44, half: 3 }
          : { x: collarEnd, half: 0 },
  );
  /** The drawing's own length: the model's, or the generic shape's. */
  const length = $derived(art ? art.length : design === "open-end" ? 14 : collarEnd);

  const stream = $derived.by(() => {
    const spread = design === "open-end" ? 7 : 4 + pattern.current * 41;
    const halfAngle = (spread * Math.PI) / 180;
    const streamLength = (design === "open-end" ? 90 : 140) * (1 - 0.45 * pattern.current) * flow.current;
    const dy = exit.half + Math.tan(halfAngle) * streamLength;
    return { length: streamLength, dy, core: exit.half * 0.6 + (dy - exit.half) * 0.35 };
  });

  /**
   * The arc, in a level frame at the tip: it leaves along the nozzle at 32°,
   * peaks past the middle and falls more steeply than it rose, as drag makes a
   * real stream do, landing at the nozzle's height. Its shape is illustrative;
   * the landing distance is the engine's.
   */
  const arc = $derived.by(() => {
    if (!jet) return null;
    const r = reach.current * jet.unitsPerM;
    if (r < 1) return null;
    const t = Math.tan((REACH_ANGLE_DEG * Math.PI) / 180);
    const d = `M 0 0 C ${0.4 * r} ${-0.4 * r * t} ${0.8 * r} ${-0.25 * r * t} ${r} 0`;
    // Drops: a streak a third of their spacing, centred on their place.
    const gap = jet.drops.gapPx;
    const w = Math.min(3 * jet.screen, 0.4 * gap);
    const dash = Math.max(0, 0.33 * gap - w);
    return { r, d, w, px: jet.screen, dasharray: `${dash} ${gap - dash}`, drops: { ...jet.drops, offsetPx: dash / 2 } };
  });

  /**
   * The stream's label sits at the landing or, when that is off screen, where
   * the arc leaves the canvas (owner, 2026-11-06: a phone never showed it).
   * Only a label with a number moves: "ilustrativo" says nothing worth covering a gauge's reading.
   * Icon units in the jet's own frame.
   */
  const labelAt = $derived.by(() => {
    if (!jet || !arc) return null;
    const { r, px } = arc;
    const angle = (REACH_ANGLE_DEG * Math.PI) / 180;
    const right = view && jet.numbered ? view.right - exit.x * Math.cos(angle) - 8 * px : r;
    const top = view && jet.numbered ? view.top + exit.x * Math.sin(angle) + 14 * px : -Infinity;
    const x = Math.min(r, Math.max(right, 0));
    // The arc's height at that x: its Bézier (above) solved for s, since x grows with s.
    const xAt = (s: number) => r * s * (1.2 * (1 - s) ** 2 + 2.4 * s * (1 - s) + s * s);
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20; i++) {
      const s = (lo + hi) / 2;
      if (xAt(s) < x) lo = s;
      else hi = s;
    }
    const s = (lo + hi) / 2;
    const y = -r * Math.tan(angle) * s * (1 - s) * (1.2 * (1 - s) + 0.75 * s);
    // Close to the edge the full wording would run over the nozzle: the number alone.
    const text = x < r && x < 200 * px ? jet.label.replace("alcance ", "") : jet.label;
    return { x, y: Math.max(y - 12 * px, top), text };
  });

  const shutoffLabel = $derived(
    nozzle.open
      ? `${anatomy.shutoff === "bale" ? "Manija" : "Palanca"} abierta: tocar para cerrar`
      : `${anatomy.shutoff === "bale" ? "Manija" : "Palanca"} cerrada: tocar para abrir`,
  );
</script>

<g transform={`translate(${x} ${y})`}>
  {#if selected}<rect class="selection" x="-10" y="-34" width={length + 14} height="54" rx="8" />{/if}
  {#if jet && arc}
    <g class="jet" transform={`translate(${exit.x} 0) rotate(${REACH_ANGLE_DEG})`}>
      <path class="arc-soft" d={arc.d} stroke-width={(8 + 16 * pattern.current) * arc.px} />
      <path class="arc" d={arc.d} stroke-width={3 * arc.px} />
      {#if waterPhase && arc.drops.gapPx > 0}
        <path class="drops" d={arc.d} stroke-width={arc.w} stroke-dasharray={arc.dasharray} use:waterPhase={arc.drops} />
      {/if}
      <text class="reach" class:fitted={jet.fitted} transform={`translate(${labelAt?.x ?? arc.r} ${labelAt?.y ?? 0}) scale(${arc.px})`}>{labelAt?.text ?? jet.label}</text>
    </g>
  {/if}
  {#if stream.length > 1}
    {@const x0 = exit.x}
    {@const x1 = exit.x + stream.length}
    <path class="spray" class:solid={design !== "fog"} d={`M ${x0} ${-exit.half} L ${x1} ${-stream.dy} L ${x1} ${stream.dy} L ${x0} ${exit.half} Z`} />
    <path class="core" d={`M ${x0} ${-exit.half * 0.6} L ${x1} ${-stream.core} L ${x1} ${stream.core} L ${x0} ${exit.half * 0.6} Z`} />
  {/if}
  {#if art}
    <!-- The model's own shell, then the line's colour band at the inlet. -->
    {#each art.shell as p, i (i)}
      <path class={p.role} d={p.d} transform={p.t} opacity={p.opacity ?? 1} />
    {/each}
    {#if color}<rect class="band" x="-1" y="-10" width="7" height="20" rx="2" fill={color} />{/if}
    {#if art.flowLabel && nozzle.kind === "selectable"}
      <text class="ring-label" x={art.flowLabel.x} y={art.flowLabel.y}>{nozzle.ratedFlowGpm}</text>
    {/if}
  {:else if design === "open-end"}
    <!-- Only the hose's own coupling. -->
    <rect class="ring" x="-2" y="-10" width="8" height="20" rx="2" />
    {#if color}<rect class="band" x="-8" y="-9" width="6" height="18" rx="2" fill={color} />{/if}
  {:else}
    <path class="body" d="M 0 -7 L 22 -9 L 22 9 L 0 7 Z" />
    {#if color}<rect class="band" x="-1" y="-10" width="7" height="20" rx="2" fill={color} />{/if}
    {#if design === "smooth-bore"}
      <!-- The stacked tip: a cone narrowing to the bore. -->
      <path class="tip" d="M 22 -9 L 44 -3.5 L 44 3.5 L 22 9 Z" />
    {:else}
      {#if anatomy.flow === "ring"}
        <rect class="ring" x="22" y="-11" width="10" height="22" rx="2" />
        {#if nozzle.kind === "selectable"}<text class="ring-label" x="27" y="-15">{nozzle.ratedFlowGpm}</text>{/if}
      {:else}
        <!-- No gallonage ring: a plain barrel where it would sit. -->
        <rect class="barrel" x="22" y="-9" width="14" height="18" />
      {/if}
      {#if anatomy.pressureRing}
        <!-- The pressure-selection ring (POK: 50/100 psi), a band of the body. -->
        <rect class="pressure" x={ringEnd + 2} y="-10" width="3" height="20" rx="1" />
      {/if}
      {#if anatomy.pattern}
        <rect class="collar" x={barrelEnd} y="-12" width="18" height="24" rx="3" />
        {#if anatomy.teeth !== "none"}
          {#each [-8, -4, 0, 4, 8] as ty (ty)}
            {#if anatomy.teeth === "metal"}
              <path class="tooth" d={`M ${collarEnd - 5} ${ty - 2.4} L ${collarEnd - 0.5} ${ty} L ${collarEnd - 5} ${ty + 2.4} Z`} />
            {:else}
              <rect class="tooth-rubber" x={collarEnd - 5} y={ty - 1.8} width="4.5" height="3.6" rx="1.8" />
            {/if}
          {/each}
        {/if}
      {:else}
        <rect class="barrel" x={barrelEnd} y="-9" width={collarEnd - barrelEnd} height="18" />
      {/if}
    {/if}
    {#if anatomy.grip}
      <!-- Pistol grip, under the valve body. -->
      <path class="grip" d="M 7 8 L 15 8 L 13 17 Q 11 18.5 9 17 Z" />
    {/if}
    {#if anatomy.flow === "slide-index"}
      <!-- The slide valve's own index marks (POK: 20/40/60/80/100%). -->
      {#each [6, 11, 16, 21] as tx (tx)}<line class="index" x1={tx} y1="-8.5" x2={tx} y2="-13" />{/each}
    {/if}
  {/if}
  <!-- The whole body drags (owner, 2026-10-17); the bale above it still takes its tap. Pointer only: the coupling handle is the keyboard slider. -->
  {#if onGrab}<rect class="grab" role="presentation" x="-12" y="-14" width={length + 12} height="28" rx="6" onpointerdown={onGrab} />{/if}
  <!-- The shutoff: tap to open or shut. An open end has none. -->
  {#if design !== "open-end" && anatomy.shutoff !== "none"}
  <g
    class="bale"
    class:small
    role="switch"
    tabindex="0"
    aria-checked={nozzle.open}
    aria-label={shutoffLabel}
    onclick={onToggle}
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onToggle())}
  >
    {#if art?.shutoff}
      <!-- The model's own moving part, crossfaded between its end poses. -->
      <circle class="hit" cx={art.shutoff.hit.x} cy={art.shutoff.hit.y} r={art.shutoff.hit.r} />
      <g class="pose" class:on={!nozzle.open}>{#each art.shutoff.closed as p, i (i)}<path class={p.role} d={p.d} transform={p.t} opacity={p.opacity ?? 1} />{/each}</g>
      <g class="pose" class:on={nozzle.open}>{#each art.shutoff.open as p, i (i)}<path class={p.role} d={p.d} transform={p.t} opacity={p.opacity ?? 1} />{/each}</g>
    {:else if anatomy.shutoff === "bale"}
      <circle class="hit" cx="10" cy="-32" r="22" />
      <g transform={`rotate(${8 - 70 * motion.current} 10 -6)`}>
        <line class="lever" x1="10" y1="-6" x2="10" y2="-30" />
        <circle class="knob" cx="10" cy="-30" r="4" />
      </g>
    {:else if anatomy.shutoff === "slide"}
      <circle class="hit" cx="4" cy="-14" r="17" />
      <g transform={`translate(${6 - 12 * motion.current} 0)`}>
        <rect class="slider" x="0" y="-17" width="14" height="7" rx="3.5" />
        <line class="stem" x1="7" y1="-10" x2="7" y2="-2" />
      </g>
    {:else}
      <circle class="hit" cx="10" cy="-22" r="18" />
      <g transform={`rotate(${-76 * motion.current} 10 -6)`}>
        <line class="lever" x1="10" y1="-6" x2="10" y2="-25" />
        <circle class="knob" cx="10" cy="-25" r="4" />
      </g>
    {/if}
  </g>
  {/if}
</g>

<style>
  /* Only the shutoff takes pointer input; the rest lets drags reach the coupling handle beneath. */
  .selection, .jet, .spray, .core, .body, .ring, .ring-label, .collar, .tip, .barrel, .pressure, .tooth, .tooth-rubber, .grip, .index,
  .dark, .steel, .brass, .label, .red, .yellow, .orange, .blue, .pose { pointer-events: none; }
  /* The product's own colours, fixed in both themes: a black nozzle stays black (the art palette, nozzle-art/types.ts). */
  .dark { fill: #2b2f33; }
  .steel { fill: #8f989f; }
  .brass { fill: #b08d57; }
  .label { fill: #e8eaec; }
  .red { fill: #c0392b; }
  .yellow { fill: #e8c02a; }
  .orange { fill: #e07f2a; }
  .blue { fill: #2aa7c4; }
  .tip { fill: var(--steel); }
  .barrel { fill: var(--ink); }
  .spray.solid { fill: var(--water); opacity: 0.45; }
  .selection { fill: none; stroke: var(--accent); stroke-width: 2; stroke-dasharray: 5 4; }
  .spray { fill: var(--water-soft); opacity: 0.8; }
  .arc-soft { fill: none; stroke: var(--water-soft); stroke-linecap: round; opacity: 0.55; }
  .arc { fill: none; stroke: var(--water); stroke-linecap: round; opacity: 0.7; }
  .drops { fill: none; stroke: #fff; stroke-linecap: round; stroke-opacity: 0.95; }
  .reach { font-size: 11px; font-weight: 600; text-anchor: end; fill: var(--muted); paint-order: stroke; stroke: var(--surface); stroke-width: 3px; }
  .reach.fitted { fill: var(--ink); }
  @media (prefers-reduced-motion: reduce) { .drops { display: none; } }
  .core { fill: var(--water); opacity: 0.6; }
  .body { fill: var(--ink); }
  .ring { fill: var(--steel); }
  .ring-label { font-size: 10px; font-weight: 700; text-anchor: middle; fill: var(--ink); }
  .collar { fill: var(--water); }
  .pressure { fill: var(--steel); }
  .tooth { fill: var(--steel); }
  .tooth-rubber { fill: var(--water); }
  .grip { fill: var(--ink); }
  .index { stroke: var(--water); stroke-width: 1.5; }
  .lever { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
  .knob { fill: var(--ink); }
  .slider { fill: var(--ink); }
  .stem { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; }
  .pose { opacity: 0; transition: opacity 180ms ease; }
  .pose.on { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .pose { transition: none; } }
  .bale { cursor: pointer; outline: none; }
  /* A finger's tap near a tiny bale is a tap on the nozzle: touch adjustment would otherwise snap it to the bale. */
  @media (pointer: coarse) { .bale.small { pointer-events: none; } }
  .bale:focus-visible .lever, .bale:focus-visible .stem { stroke: var(--accent); }
  .bale:focus-visible .slider { fill: var(--accent); }
  /* The focus ring rides the hit area, so it shows over every model's own art too. */
  .bale:focus-visible .hit { fill: none; stroke: var(--accent); stroke-width: 2; stroke-dasharray: 4 3; }
  .hit { fill: transparent; }
  .grab { fill: transparent; cursor: grab; touch-action: none; }
  .band { stroke: var(--surface); stroke-width: 1.5; pointer-events: none; }
</style>
