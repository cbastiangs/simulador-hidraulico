import type { Scenario } from "$hydraulics/scenario.ts";
import * as edit from "$lib/edit.ts";
import type { Selection } from "$lib/selection.ts";
import { insertWyeAtJoint, junctionAt, junctionsOf, wyeLimit } from "$lib/branch-edit.ts";

/**
 * Every verb the screen offers, defined once (UX.md §10.5). The context
 * menu, the floating toolbar (the phone's sheet at peek) and the selection
 * panel all draw from this list, so a label, an enabled check or what gets
 * selected afterwards cannot differ between them.
 *
 * Actions that add or remove a piece (`placed`) happen on the canvas: the
 * Piezas strip has them all, and the right-click / long-press menu keeps
 * the ones for what is selected, for the keyboard and screen readers; the
 * toolbar and the panel don't repeat them (owner, 2026-10-18). Settings of
 * the whole lay live in Ajustes (UX.md §10.1), not here. Values edited directly (hose size, length,
 * pressure, nozzle ring and pattern) are fields, not actions; an action the
 * panel already offers as a field is marked `field` and skipped there.
 */

/** What an action applies to: a selected element, or the whole line (empty canvas, the Línea section). */
export type Target = Selection | { kind: "line" };

export type ActionContext = {
  scenario: Scenario;
  target: Target;
  /** The pressure the line needs at the pump, for "apply required". */
  requiredPsi: number;
};

export type Outcome = {
  scenario?: Scenario;
  /** An edit of the whole lay's tree (a new wye), not of the drawn line, and the line to draw after it. */
  tree?: { tree: Scenario; path: string[] };
  /** What to select afterwards; null clears the selection; absent keeps it. */
  select?: Selection | null;
  /** A view change: no edit, no undo step. */
  view?: "fit";
};

export type Action = {
  id: string;
  label: string | ((c: ActionContext) => string);
  /** The toolbar's shorter wording. */
  short?: string | ((c: ActionContext) => string);
  on: Target["kind"][];
  /** In the floating toolbar / sheet at peek: at most QUICK_MAX per target. */
  quick?: boolean;
  /** In the right-click / long-press menu. */
  menu?: boolean;
  /** The panel offers it as a field (a lever, a switch, a chip): no extra button there. */
  field?: boolean;
  /**
   * Adds or removes a piece, which the canvas does (the Piezas strip; the
   * menu too): never in the toolbar or the panel (owner, 2026-10-18).
   */
  placed?: boolean;
  /** Removes something: red, last. Undo covers it like every edit. */
  danger?: boolean;
  /** Why it can't run now, shown beside it; null when it can. */
  blocked?: (c: ActionContext) => string | null;
  run: (c: ActionContext) => Outcome;
};

export type Place = "quick" | "menu" | "panel";

export const QUICK_MAX = 4;

const index = (t: Target) => ("index" in t ? t.index : 0);
const count = (c: ActionContext) => c.scenario.sections.length;
// A branched lay's drawn line (UX.md §2): hoses never merge across a wye,
// and each of its lines keeps at least one hose.
const acrossWye = (c: ActionContext, joint: number) => (junctionAt(c.scenario, joint) ? "Un bifurco separa estos tramos" : null);
function aloneInItsLine(c: ActionContext, i: number) {
  const wyes = junctionsOf(c.scenario).map((j) => j.joint);
  const start = Math.max(0, ...wyes.filter((j) => j <= i));
  const end = Math.min(count(c), ...wyes.filter((j) => j > i));
  return end - start <= 1;
}

const insertAt = (c: ActionContext, at: number): Outcome => ({
  scenario: edit.insertSection(c.scenario, at),
  select: { kind: "section", index: at },
});

export const ACTIONS: Action[] = [
  // Hose
  {
    id: "hose.insert-before",
    placed: true,
    label: "Insertar tramo antes",
    on: ["section"],
    menu: true,
    run: (c) => insertAt(c, index(c.target)),
  },
  {
    id: "hose.insert-after",
    placed: true,
    label: "Insertar tramo después",
    on: ["section"],
    menu: true,
    run: (c) => insertAt(c, index(c.target) + 1),
  },
  {
    id: "hose.split",
    label: "Dividir en dos",
    short: "Dividir",
    on: ["section"],
    quick: true,
    menu: true,
    blocked: (c) => (c.scenario.sections[index(c.target)].lengthM < 2 ? "Muy corto para dividir (mínimo 2 m)" : null),
    run: (c) => ({ scenario: edit.splitSection(c.scenario, index(c.target)), select: c.target as Selection }),
  },
  {
    id: "hose.join-next",
    label: "Unir con el siguiente",
    on: ["section"],
    menu: true,
    blocked: (c) => (index(c.target) >= count(c) - 1 ? "Es el último tramo" : acrossWye(c, index(c.target) + 1)),
    run: (c) => ({ scenario: edit.mergeAtJoint(c.scenario, index(c.target) + 1), select: c.target as Selection }),
  },
  {
    id: "hose.lock",
    label: (c) => (c.scenario.sections[index(c.target)].lengthFree ? "Bloquear largo" : "Desbloquear largo"),
    on: ["section"],
    menu: true,
    field: true,
    run: (c) => ({ scenario: edit.toggleLengthLock(c.scenario, index(c.target)) }),
  },
  {
    id: "hose.remove",
    placed: true,
    label: "Quitar tramo",
    on: ["section"],
    menu: true,
    danger: true,
    blocked: (c) =>
      count(c) <= 1 ? "Una línea necesita al menos un tramo" : aloneInItsLine(c, index(c.target)) ? "Cada línea del bifurco necesita al menos un tramo" : null,
    run: (c) => ({
      scenario: edit.removeSection(c.scenario, index(c.target)),
      select: { kind: "section", index: Math.max(0, index(c.target) - 1) },
    }),
  },

  // Coupling (joint 0, the pump outlet, belongs to the pump)
  {
    id: "joint.insert",
    placed: true,
    label: "Insertar tramo aquí",
    on: ["joint"],
    menu: true,
    run: (c) => insertAt(c, index(c.target)),
  },
  {
    id: "joint.join",
    label: "Unir los dos tramos",
    short: "Unir tramos",
    on: ["joint"],
    quick: true,
    menu: true,
    blocked: (c) => (index(c.target) === 0 ? "La salida de la bomba no une tramos" : acrossWye(c, index(c.target))),
    run: (c) => ({
      scenario: edit.mergeAtJoint(c.scenario, index(c.target)),
      select: { kind: "section", index: index(c.target) - 1 },
    }),
  },
  // A wye or trifurco at any coupling (ROADMAP §10e item 0): the line goes on through its first outlet.
  {
    id: "joint.wye",
    placed: true,
    label: "Bifurco aquí",
    on: ["joint"],
    menu: true,
    blocked: (c) => wyeLimit(c.scenario, index(c.target), "wye"),
    run: (c) => ({ tree: insertWyeAtJoint(c.scenario, index(c.target), "wye") }),
  },
  {
    id: "joint.trifurca",
    placed: true,
    label: "Trifurco aquí",
    on: ["joint"],
    menu: true,
    blocked: (c) => wyeLimit(c.scenario, index(c.target), "trifurca"),
    run: (c) => ({ tree: insertWyeAtJoint(c.scenario, index(c.target), "trifurca") }),
  },
  {
    id: "joint.hose-before",
    label: (c) => `Ver tramo ${index(c.target)}`,
    on: ["joint"],
    blocked: (c) => (index(c.target) === 0 ? "No hay tramo antes de la bomba" : null),
    run: (c) => ({ select: { kind: "section", index: index(c.target) - 1 } }),
  },
  {
    id: "joint.hose-after",
    label: (c) => `Ver tramo ${index(c.target) + 1}`,
    on: ["joint"],
    run: (c) => ({ select: { kind: "section", index: index(c.target) } }),
  },

  // Nozzle
  {
    id: "nozzle.toggle",
    label: (c) => (c.scenario.nozzle.open ? "Cerrar pitón" : "Abrir pitón"),
    on: ["nozzle"],
    menu: true,
    field: true,
    blocked: (c) => (c.scenario.nozzle.design === "open-end" ? "Sin pitón no hay manija: se corta en la bomba" : null),
    run: (c) => ({ scenario: edit.setNozzleOpen(c.scenario, !c.scenario.nozzle.open) }),
  },
  {
    id: "nozzle.remove",
    placed: true,
    label: (c) => (c.scenario.nozzle.design === "open-end" ? "Poner pitón" : "Quitar pitón (punta abierta)"),
    on: ["nozzle"],
    menu: true,
    run: (c) => ({ scenario: c.scenario.nozzle.design === "open-end" ? edit.attachNozzle(c.scenario) : edit.removeNozzle(c.scenario) }),
  },

  // Pump
  {
    id: "pump.insert-at-outlet",
    placed: true,
    label: "Insertar tramo en la salida",
    on: ["pump"],
    menu: true,
    run: (c) => insertAt(c, 0),
  },
  {
    id: "pump.apply-required",
    label: (c) => `Ajustar a la presión necesaria (${c.requiredPsi.toFixed(0)} psi)`,
    on: ["pump"],
    menu: true,
    field: true,
    blocked: (c) => (c.scenario.nozzle.design === "open-end" ? "Sin pitón no hay presión nominal que alcanzar" : null),
    run: (c) => ({ scenario: edit.setSourcePressure(c.scenario, c.requiredPsi) }),
  },

  // The whole line
  {
    id: "view.fit",
    label: "Ver toda la línea",
    on: ["line"],
    menu: true,
    field: true,
    run: () => ({ view: "fit" }),
  },
];

/** The actions shown for a target in one place; danger last. */
export function actionsFor(target: Target, place: Place): Action[] {
  // The pump outlet's joint is the pump's.
  const kind = target.kind === "joint" && target.index === 0 ? "pump" : target.kind;
  return ACTIONS.filter(
    (a) =>
      a.on.includes(kind) && (place === "panel" ? !a.field && !a.placed : place === "quick" ? a.quick && !a.placed : a.menu),
  ).sort((a, b) => Number(!!a.danger) - Number(!!b.danger));
}

export const labelOf = (a: Action, c: ActionContext, place: Place = "panel") => {
  const text = place === "quick" && a.short ? a.short : a.label;
  return typeof text === "function" ? text(c) : text;
};

// The toolbar stays one short row (UX.md §10.1).
if (import.meta.env?.DEV) {
  for (const kind of ["section", "joint", "nozzle", "pump", "line"] as const) {
    const n = ACTIONS.filter((a) => a.quick && a.on.includes(kind)).length;
    if (n > QUICK_MAX) console.error(`actions.ts: ${n} quick actions on ${kind}, at most ${QUICK_MAX}`);
  }
}
