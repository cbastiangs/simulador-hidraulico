import type { StreamReach } from "$hydraulics/reach.ts";
import { POOL } from "$hydraulics/pool.ts";
import { u } from "$lib/display-units.svelte.ts";
import type { BalanceIssue } from "$hydraulics/balance.ts";
import type { HydrantLimit, PumpOperation } from "$hydraulics/pump.ts";
import type { SeriesResult } from "$hydraulics/series.ts";
import { SECONDS_PER_MINUTE } from "$hydraulics/units.ts";

/** Format an engine reading without turning an unavailable value into a number. */
export const reading = (value: number | null | undefined, digits = 1) =>
  value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);

/** Horizontal span from the tip to the end of the simulated stream. */
export function reachLabel(reach: StreamReach) {
  const distance = `${u.l(reach.reachM, 1)} ${u.length}`;
  if (reach.fitted) return `Alcance total ≈ ${distance}`;
  if (reach.angleProjectionM !== null) return `Proyección ≈ ${distance} · sin validar`;
  return `Dibujo ilustrativo · ${distance}`;
}

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

export function balanceMessage(issue: BalanceIssue, compact = false): string {
  if (issue.step) {
    const { device, aboveGpm, lossPsi } = issue.step;
    const part = device === "wye" ? "Bifurco" : device === "trifurca" ? "Trifurco" : "Accesorios";
    const threshold = `${u.q(aboveGpm, 0)} ${u.flow}`;
    if (compact) return `${part} · +${u.p(lossPsi, 0)} ${u.pressure} sobre ${threshold}`;
    const flow = device ? "el caudal total por el " + part.toLowerCase() : "el caudal por los accesorios";
    return `El modelo suma ${u.p(lossPsi, 0)} ${u.pressure} de pérdida cuando ${flow} supera ${threshold}. Sin esa pérdida se supera el umbral. Al aplicarla, el caudal cae hasta el umbral o por debajo.`;
  }
  if (issue.code === "high-point") return compact ? "Presión insuficiente en un acople" : `El caudal exigiría presión negativa en un acople (${u.p(issue.residualPsi)} ${u.pressure}).`;
  if (compact && issue.code === "allowance-gap") return "Pérdida por accesorios";
  if (issue.code === "allowance-gap") return "La pérdida fija o escalonada de los accesorios no permite un caudal exacto con esta presión.";
  return "No se encontró un caudal que equilibre la presión de la línea.";
}

/** Explain the boundary reported at the attempted pump/lay operating point. */
export function pumpLimitMessage(op: PumpOperation, compact = false): string {
  if (op.status === "empty") return compact ? "Tanque vacío" : "Tanque vacío. Rellena el tanque en Abastecimiento.";
  if (op.poolLimit) return compact ? "Caudal fuera de la tabla de aspiración" : poolRangeMessage();
  if (op.hydrantLimit) return hydrantLimitMessage(op.hydrantLimit);
  if (op.balanceIssue) return balanceMessage(op.balanceIssue, compact);
  if (op.status === "outside-curve") {
    const last = op.curve.at(-1);
    return last ? `La demanda supera la curva de ${u.q(last.flowGpm, 0)} ${u.flow} a este giro.` : "Caudal fuera de la curva de la bomba.";
  }
  return "La presión que entrega la bomba y la que necesita la tendida no coinciden a un mismo caudal.";
}

export const deliveredFlow = (result: SeriesResult) => result.pump?.flowGpm === null ? null : result.flowGpm;

export function hydrantLimitMessage(limit: HydrantLimit) {
  switch (limit) {
    case "intake-zero": return `Límite del modelo de hidrante: admisión a ${u.p(0, 0)} ${u.pressure} manométricos.`;
    case "test-flow": return "La demanda supera el intervalo de caudal del ensayo del hidrante.";
    case "below-inlet": return "La presión de descarga solicitada es menor que la presión de admisión.";
  }
}

export function poolRangeMessage() {
  return `Fuera del intervalo de aspiración con datos (${u.q(POOL.minGpm, 0)}–${u.q(POOL.maxGpm, 0)} ${u.flow}).`;
}
