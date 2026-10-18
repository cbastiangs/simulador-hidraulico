import { METHODS, type MethodId } from "$hydraulics/references.ts";

/** On-screen names (MODEL.md §4): "physical" is shown as "Modelo base". */
export const METHOD_LABELS: Record<MethodId, string> = {
  physical: "Modelo base",
  "cgbvp-2019": "Manual de Hidráulica CGBVP 2019",
};

export const METHOD_IDS = Object.keys(METHODS) as MethodId[];
