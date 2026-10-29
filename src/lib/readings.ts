import { u } from "$lib/display-units.svelte.ts";
import type { BalanceIssue } from "$hydraulics/balance.ts";
import type { SeriesResult } from "$hydraulics/series.ts";
import { SECONDS_PER_MINUTE } from "$hydraulics/units.ts";

/** Format an engine reading without turning an unavailable value into a number. */
export const reading = (value: number | null | undefined, digits = 1) =>
  value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);

/** Keep a short, positive endurance visible instead of rounding it to 0.0 min. */
export const enduranceLabel = (minutes: number) => minutes < 1
  ? `${Math.ceil(minutes * SECONDS_PER_MINUTE)} s`
  : `${minutes.toFixed(1)} min`;

/** Read the solver's local flow, which can exceed the selected nozzle's flow. */
export function sectionFlowGpm(result: SeriesResult, index: number): number | null {
  if (result.pump?.flowGpm === null || result.state === "unbalanced") return null;
  const term = result.terms.find(t => t.lawId === "hose.friction" && t.sectionIndex === index);
  return term?.lawId === "hose.friction" ? term.inputs.flowGpm : result.flowGpm;
}

/** Prefer the fitting's own term, including a shared-feed fitting at a wye. */
export function jointFlowGpm(result: SeriesResult, index: number): number | null {
  if (result.pump?.flowGpm === null || result.state === "unbalanced") return null;
  const term = result.terms.find(t => t.lawId === "appliance.step" && t.joint === index);
  if (term?.lawId === "appliance.step") return term.inputs.flowGpm;
  // With no stepped term, the joint feeds its downstream hose or the nozzle.
  return sectionFlowGpm(result, index);
}

export function balanceMessage(issue: BalanceIssue): string {
  if (issue.code === "high-point") return `El caudal exigiría presión negativa en un acople (${u.p(issue.residualPsi)} ${u.pressure}); la línea no entrega agua.`;
  if (issue.code === "allowance-gap") return "La pérdida fija o escalonada de los accesorios no permite un caudal exacto con esta presión.";
  return "No se encontró un caudal que equilibre la presión de la línea.";
}
