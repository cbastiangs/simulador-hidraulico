/** What the inspector is editing. A coupling's height belongs to the section that ends there. */
export type Selection = { kind: "section"; index: number } | { kind: "nozzle" };
