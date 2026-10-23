import type { BalanceIssue } from "$hydraulics/balance.ts";

/** Format an engine reading without turning an unavailable value into a number. */
export const reading = (value: number | null | undefined, digits = 1) =>
  value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);

export function balanceMessage(issue: BalanceIssue): string {
  if (issue.code === "high-point") return `El caudal exigiría presión negativa en un acople (${reading(issue.residualPsi)} psi); la línea no entrega agua.`;
  if (issue.code === "allowance-gap") return "La pérdida fija o escalonada de los accesorios no permite un caudal exacto con esta presión.";
  return "No se encontró un caudal que equilibre la presión de la línea.";
}
