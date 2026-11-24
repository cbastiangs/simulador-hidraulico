// Fixed equal-length hydrant comparison (MODEL §3.9).
import { frictionLossPsi } from "./line.ts";

export const HYDRANT_CASES = ["single", "separate", "siamese"] as const;
export type HydrantCase = typeof HYDRANT_CASES[number];
const supplyHose = { lengthM: 30, frictionCoefficient: 2 };
export const LOSS_REFERENCE_GPM = 350;
export const MAX_REFERENCE_PSI = 10;
export const HYDRANT_OUTLETS = ["ideal", "2.5", "4", "4.5"] as const;
export type HydrantOutlet = typeof HYDRANT_OUTLETS[number];
export const CAPACITY = { min: 400, max: 1500, default: 500 } as const;

/** Whole-hydrant Cv, using total flow even with both side outlets open. */
export function hydrantLossPsi(outlet: HydrantOutlet, layout: HydrantCase, totalGpm: number) {
  if (!(totalGpm >= 0 && Number.isFinite(totalGpm))) throw new RangeError("Invalid hydrant flow");
  switch (outlet) {
    case "ideal": return 0;
    case "2.5": return (totalGpm / (layout === "single" ? 379 : 488)) ** 2;
    case "4": return (totalGpm / 583) ** 2;
    case "4.5": return (totalGpm / 600) ** 2;
    default: throw new RangeError("Invalid hydrant outlet");
  }
}

export function hydrantPressurePsi(flowGpm: number, testFlowGpm: number = CAPACITY.default) {
  if (!(testFlowGpm >= CAPACITY.min && testFlowGpm <= CAPACITY.max && flowGpm >= 0 && flowGpm <= testFlowGpm)) throw new RangeError("Outside hydrant test interval");
  return 65 - 35 * (flowGpm / testFlowGpm) ** (1 / 0.54);
}

export type HydrantSupply = {
  layout: HydrantCase; outlet: HydrantOutlet; testFlowGpm: number; intakeRefPsi: number; siameseRefPsi: number;
};
export const DEFAULT_HYDRANT: HydrantSupply = {
  layout: "single", outlet: "2.5", testFlowGpm: CAPACITY.default, intakeRefPsi: 0, siameseRefPsi: 0,
};

export function parseHydrant(value: unknown): HydrantSupply {
  const h = value as HydrantSupply;
  if (!h || !HYDRANT_CASES.includes(h.layout) || !HYDRANT_OUTLETS.includes(h.outlet)
    || !Number.isFinite(h.testFlowGpm) || h.testFlowGpm < CAPACITY.min || h.testFlowGpm > CAPACITY.max
    || ![h.intakeRefPsi, h.siameseRefPsi].every(p => Number.isFinite(p) && p >= 0 && p <= MAX_REFERENCE_PSI)) {
    throw new RangeError("Invalid hydrant supply configuration");
  }
  const { layout, outlet, testFlowGpm, intakeRefPsi, siameseRefPsi } = h;
  return { layout, outlet, testFlowGpm, intakeRefPsi, siameseRefPsi };
}

export function supplyAtFlow({ layout, outlet, testFlowGpm, intakeRefPsi, siameseRefPsi }: HydrantSupply, totalGpm: number) {
  const perHoseGpm = layout === "single" ? totalGpm : totalGpm / 2;
  const portGpm = layout === "separate" ? perHoseGpm : totalGpm;
  const hydrantPsi = hydrantPressurePsi(totalGpm, testFlowGpm) - hydrantLossPsi(outlet, layout, totalGpm);
  const hoseLossPsi = frictionLossPsi(supplyHose, perHoseGpm);
  const intakeLossPsi = intakeRefPsi * (portGpm / LOSS_REFERENCE_GPM) ** 2;
  const siameseLossPsi = layout === "siamese" ? siameseRefPsi * (totalGpm / LOSS_REFERENCE_GPM) ** 2 : 0;
  const intakePsi = hydrantPsi - hoseLossPsi - intakeLossPsi - siameseLossPsi;
  return { perHoseGpm, portGpm, hydrantPsi, hoseLossPsi, intakePsi, intakeLossPsi, siameseLossPsi };
}
