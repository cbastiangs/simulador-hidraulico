import { LITERS_PER_US_GALLON, METERS_PER_INCH } from "./units.ts";

/**
 * Mean water velocity in a hose (docs/MODEL.md §3.7, `flow.velocity`):
 * continuity, v = Q / A. Drawing only: particle speed on the canvas. In the
 * feet form, v = 0.4085 · Q / d² ft/s (gpm, in).
 */
export function hoseVelocityMps(flowGpm: number, diameterIn: number) {
  const cubicMetersPerSecond = (flowGpm * LITERS_PER_US_GALLON) / 1000 / 60;
  const areaM2 = (Math.PI / 4) * (diameterIn * METERS_PER_INCH) ** 2;
  return cubicMetersPerSecond / areaM2;
}
