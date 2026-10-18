import { joints, type Scenario } from "$hydraulics/scenario.ts";
import { junctionAt } from "$lib/branch-edit.ts";

/** 2.5 → 2½″ */
export const sizeLabel = (d: number) => `${d.toString().replace(".5", "½").replace(".75", "¾")}″`;

/**
 * A coupling is named by what sits there (owner, 2026-10-16: "Acople 2" said
 * nothing): "Reducción 2½″ → 1½″", "Ampliación 1½″ → 2½″", "Válvula 2½″",
 * or a plain "Acople 2½″". The ends keep their place names.
 */
export function jointName(scenario: Scenario, index: number): string {
  const j = joints(scenario)[index];
  if (!j) return `Acople ${index}`;
  if (index === 0) return "Salida de la bomba";
  const wye = junctionAt(scenario, index);
  if (wye) return `${wye.device === "trifurca" ? "Trifurco" : "Bifurco"} · ${wye.outlets.length} salidas`;
  if (index === scenario.sections.length) return "Entrada del pitón";
  if (j.mismatch) {
    const kind = j.downIn! < j.upIn! ? "Reducción" : "Ampliación";
    return `${kind} ${sizeLabel(j.upIn!)} → ${sizeLabel(j.downIn!)}${j.missing ? " (falta)" : ""}`;
  }
  const size = j.upIn !== undefined ? ` ${sizeLabel(j.upIn)}` : "";
  return j.placed.includes("valve") ? `Válvula${size}` : `Acople${size}`;
}

/** The same name inside a sentence: "la reducción 2½″ → 1½″", "el acople 2½″". */
export function jointNameIn(scenario: Scenario, index: number): string {
  const name = jointName(scenario, index);
  const article = /^(Reducción|Ampliación|Válvula|Salida|Entrada)/.test(name) ? "la" : "el";
  return `${article} ${name[0].toLowerCase()}${name.slice(1)}`;
}
