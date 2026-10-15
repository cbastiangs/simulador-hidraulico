import { LITERS_PER_US_GALLON, METERS_PER_INCH, PASCALS_PER_PSI } from "./units.ts";

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

/**
 * Speed of the jet leaving a nozzle whose inlet pressure is `nozzlePressurePsi`
 * (docs/MODEL.md §3.7, §3.13): Bernoulli with the pressure turned into speed,
 * v = √(2·P/ρ), water at 1000 kg/m³. It is 12.18·√NP in ft/s and depends on NP
 * only, not on the flow. Illustrative for a real stream (losses inside the nozzle).
 */
export function nozzleExitVelocityMps(nozzlePressurePsi: number) {
  return Math.sqrt((2 * Math.max(0, nozzlePressurePsi) * PASCALS_PER_PSI) / 1000);
}
