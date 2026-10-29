/** Presentation clock only: spacing and period are supplied by the canvas. */
type WaterMotion = {
  scope: string;
  stream: string;
  gapPx: number;
  offsetPx: number;
  seconds: number;
  reduced: boolean;
};

/** One action per canvas, with a shared phase for each hydraulic segment. */
export function createWaterMotion() {
  const clocks = new Map<string, { cycles: number; at: number; rate: number }>();
  let scope: string | undefined;

  return function waterMotion(node: SVGPathElement, initial: WaterMotion) {
    let value = initial;
    let animation: Animation | undefined;
    let frame = 0;

    function sync() {
      if (scope !== value.scope) {
        clocks.clear();
        scope = value.scope;
      }
      const now = Number(document.timeline.currentTime ?? 0);
      const rate = value.reduced || value.seconds <= 0 ? 0 : 1 / value.seconds;
      const clock = clocks.get(value.stream) ?? { cycles: 0, at: now, rate };
      // Integrate the OLD rate up to this change. Recomputing elapsed time
      // with the new rate makes dots jump whenever the pump/selector changes.
      clock.cycles = (clock.cycles + (now - clock.at) * clock.rate / 1000) % 1;
      clock.at = now;
      clock.rate = rate;
      clocks.set(value.stream, clock);

      const frames = [
        { strokeDashoffset: `${value.offsetPx}px` },
        { strokeDashoffset: `${value.offsetPx - value.gapPx}px` },
      ];
      if (!animation) {
        animation = node.animate(frames, { duration: 1000, iterations: Infinity });
      } else {
        (animation.effect as KeyframeEffect).setKeyframes(frames);
      }
      // Every path updated in this frame receives the same segment phase.
      // New paths (selection/peek/redraw) join that clock, not the page origin.
      animation.playbackRate = rate;
      animation.currentTime = clock.cycles * 1000;
      if (rate === 0) animation.pause();
      else animation.play();
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    }
    schedule();
    return {
      update(next: WaterMotion) { value = next; schedule(); },
      destroy() { cancelAnimationFrame(frame); animation?.cancel(); },
    };
  };
}
