/**
 * What the inspector is editing. A coupling's height belongs to the section
 * that ends there; its fittings belong to the joint (0 = pump outlet, last =
 * nozzle inlet).
 */
export type Selection =
  | { kind: "section"; index: number }
  | { kind: "joint"; index: number }
  | { kind: "nozzle" }
  | { kind: "pump" };
