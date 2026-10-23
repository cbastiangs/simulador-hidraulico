/** Shared acceptance criteria for the series and tree solvers (MODEL.md §2). */
export const PRESSURE_TOLERANCE_PSI = 1e-7;

export type BalanceIssue = {
  code: "allowance-gap" | "high-point" | "pressure-balance";
  residualPsi: number;
};

export const pressureBalanced = (residualPsi: number) =>
  Number.isFinite(residualPsi) && Math.abs(residualPsi) <= PRESSURE_TOLERANCE_PSI;
