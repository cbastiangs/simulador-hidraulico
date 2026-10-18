import type { WyeDevice } from "$hydraulics/catalog.ts";
import { HOSE_SIZES } from "$hydraulics/references.ts";
import { joints, type Scenario } from "$hydraulics/scenario.ts";
import * as branch from "$lib/branch-edit.ts";
import * as edit from "$lib/edit.ts";
import type { Selection } from "$lib/selection.ts";

/**
 * The "Piezas" strip (UX.md §2 "Pieces"): pick a piece, then tap one of the
 * spots it lights on the drawing. Each piece knows where it can go on the
 * drawn line and what dropping it there does; the canvas only draws the
 * spots and the page applies the outcome. Placing is one undo step, like
 * every edit. "Quitar" is the eraser: its spots are what can be taken away.
 *
 * Everything works on the drawn line's scenario (branch-edit.ts `pathView`),
 * so a spot's index is counted along that line; edits that change the lay
 * itself (a wye, an outlet) go through the tree it was drawn from.
 */

export type PieceId = "hose-1-1/2" | "hose-2-1/2" | "wye" | "trifurca" | "fog" | "smooth-bore" | "eraser";

export type Piece = {
  id: PieceId;
  /** The strip's label: short, under the icon. */
  label: string;
  /** What it is, for the banner while it is picked and for screen readers. */
  name: string;
};

export const PIECES: readonly Piece[] = [
  { id: "hose-1-1/2", label: "1½″", name: "Tramo de 1½″" },
  { id: "hose-2-1/2", label: "2½″", name: "Tramo de 2½″" },
  { id: "wye", label: "Bifurco", name: "Bifurco" },
  { id: "trifurca", label: "Trifurco", name: "Trifurco" },
  { id: "fog", label: "Neblina", name: "Pitón combinado" },
  { id: "smooth-bore", label: "Liso", name: "Pitón de chorro sólido" },
  { id: "eraser", label: "Quitar", name: "Quitar" },
];

/**
 * Where a piece can go, along the drawn line. `joint` 0 is the pump outlet
 * and `joint` = sections.length the nozzle end; at a wye, a hose goes in
 * before it (the hoses after it are reached at the next coupling).
 * `outlet` is an empty outlet of a wye on the line, the `slot`-th spout
 * behind the drawn one.
 */
export type Spot =
  | { kind: "joint"; index: number }
  | { kind: "section"; index: number }
  | { kind: "outlet"; path: string[]; joint: number; slot: number };

export type SpotChoice = {
  spot: Spot;
  /** What a tap does, as a sentence ("Quitar tramo 2"). */
  label: string;
  /** Why it can't go here now, or null. A blocked spot is drawn dimmed and a tap says why. */
  blocked: string | null;
};

/** A placement's result: a line edit (`hint` is where a hose was added or removed), or a tree edit. */
export type Placed = {
  scenario?: Scenario;
  hint?: number;
  tree?: { tree: Scenario; path: string[] };
  /** What to select afterwards; null clears the selection. */
  select?: Selection | null;
};

const HOSE_OF: Partial<Record<PieceId, string>> = { "hose-1-1/2": "1-1/2", "hose-2-1/2": "2-1/2" };
const DEVICE_OF: Partial<Record<PieceId, WyeDevice>> = { wye: "wye", trifurca: "trifurca" };
const DEVICE_NAME: Record<WyeDevice, string> = { wye: "bifurco", trifurca: "trifurco" };

export const isAdding = (piece: PieceId) => piece !== "eraser";

/** The smooth bore that fits the line's last coupling: 15/16″ on 1½″, 1⅛″ on 2½″ and up (catalog.ts). */
function smoothBoreFor(line: Scenario) {
  const coupling = HOSE_SIZES.find((h) => h.id === line.sections.at(-1)?.hoseSizeId)?.couplingIn ?? 1.5;
  return coupling === 1.5 ? "smooth-bore-15-16" : "smooth-bore-1-1-8";
}
const specFor = (piece: PieceId, line: Scenario) => (piece === "fog" ? "combination-selectable" : smoothBoreFor(line));

const sectionsFull = (line: Scenario) =>
  branch.totalSections(branch.treeOf(line)) >= branch.BRANCH_LIMITS.sections ? `Máximo ${branch.BRANCH_LIMITS.sections} tramos en total.` : null;

/** The line's hoses between wyes: the first and one-past-last section of the run holding section `i`. */
function runOf(line: Scenario, i: number) {
  const wyes = branch.junctionsOf(line).map((j) => j.joint);
  return { start: Math.max(0, ...wyes.filter((j) => j <= i)), end: Math.min(line.sections.length, ...wyes.filter((j) => j > i)) };
}

function jointLabel(line: Scenario, j: number) {
  const n = line.sections.length;
  if (j === 0) return "en la salida de la bomba";
  if (j === n) return line.nozzle.design === "open-end" ? "al final de la línea" : "antes del pitón";
  if (branch.junctionAt(line, j)) return "antes del bifurco";
  return `en el acople ${j}`;
}

/** Every spot the piece can go to on the drawn line, blocked ones included. */
export function spotsFor(piece: PieceId, line: Scenario): SpotChoice[] {
  const n = line.sections.length;
  const junctions = branch.junctionsOf(line);
  const out: SpotChoice[] = [];
  const hose = HOSE_OF[piece];
  const device = DEVICE_OF[piece];
  if (hose) {
    const full = sectionsFull(line);
    for (let j = 0; j <= n; j++) out.push({ spot: { kind: "joint", index: j }, label: `Poner un tramo ${jointLabel(line, j)}`, blocked: full });
    for (const jn of junctions) {
      const behind = jn.outlets.filter((o) => !o.active);
      behind.forEach((o, k) => {
        if (o.empty) out.push({ spot: { kind: "outlet", path: o.path, joint: jn.joint, slot: k + 1 }, label: "Conectar una línea a la salida vacía", blocked: full });
      });
    }
  } else if (device) {
    for (let j = 1; j <= n; j++) {
      if (branch.junctionAt(line, j)) continue;
      out.push({ spot: { kind: "joint", index: j }, label: `Poner un ${DEVICE_NAME[device]} ${j === n ? "al final de la línea" : `en el acople ${j}`}`, blocked: branch.wyeLimit(line, j, device) });
    }
  } else if (piece === "fog" || piece === "smooth-bore") {
    const id = specFor(piece, line);
    const same = line.nozzle.design !== "open-end" && line.nozzle.specId === id;
    const verb = line.nozzle.design === "open-end" ? "Poner" : "Cambiar por";
    out.push({ spot: { kind: "joint", index: n }, label: `${verb} ${piece === "fog" ? "un pitón combinado" : "un pitón de chorro sólido"}`, blocked: same ? "Ya tiene este pitón" : null });
  } else {
    // The eraser: hoses, wyes, hand-placed fittings, the nozzle.
    line.sections.forEach((_, i) => {
      const { start, end } = runOf(line, i);
      const alone = end - start <= 1;
      if (n <= 1) out.push({ spot: { kind: "section", index: i }, label: "Quitar tramo", blocked: "Una línea necesita al menos un tramo" });
      else if (alone && start === 0) out.push({ spot: { kind: "section", index: i }, label: "Quitar tramo", blocked: "Pon al menos un tramo antes del bifurco" });
      else if (alone) {
        const path = branch.junctionAt(line, start)!.outlets.find((o) => o.active)!.path;
        out.push({ spot: { kind: "section", index: i }, label: "Quitar el tramo y desconectar la línea", blocked: branch.disconnectLimit(branch.treeOf(line), path) });
      } else out.push({ spot: { kind: "section", index: i }, label: `Quitar tramo ${i + 1}`, blocked: null });
    });
    for (const jn of junctions) {
      const connected = jn.outlets.filter((o) => !o.empty).length;
      const what = DEVICE_NAME[jn.device];
      out.push({ spot: { kind: "joint", index: jn.joint }, label: connected === 1 ? `Quitar el ${what} (la línea sigue)` : `Quitar el ${what} y sus ${connected} líneas`, blocked: null });
    }
    for (const j of joints(line)) {
      if (j.index === n || branch.junctionAt(line, j.index) || j.placed.length === 0) continue;
      out.push({ spot: { kind: "joint", index: j.index }, label: `Quitar ${j.placed.includes("valve") ? "la válvula" : "el adaptador"} ${jointLabel(line, j.index)}`, blocked: null });
    }
    if (line.nozzle.design !== "open-end") out.push({ spot: { kind: "joint", index: n }, label: "Quitar el pitón (punta abierta)", blocked: null });
  }
  return out;
}

/**
 * Quitar on a plain coupling, which the eraser's spots leave out (it would
 * light every coupling beside every hose): removing it joins the two hoses.
 * Only hoses of one size join; anything else would quietly resize one.
 */
function couplingRemoval(line: Scenario, j: number): SpotChoice | null {
  if (j <= 0 || j >= line.sections.length || branch.junctionAt(line, j) || joints(line)[j].placed.length) return null;
  const [a, b] = [line.sections[j - 1], line.sections[j]];
  const blocked = a.hoseSizeId !== b.hoseSizeId || a.diameterIn !== b.diameterIn ? "Solo se unen tramos del mismo diámetro" : null;
  return { spot: { kind: "joint", index: j }, label: "Quitar el acople (une los dos tramos)", blocked };
}

/**
 * What "Quitar" does to the selection (UX.md §2 "Pieces": every selectable
 * thing offers it, where it is). Quitar's own spots where it has one, the
 * coupling's join, else a refusal that says why (`spot` null).
 */
export function removalFor(selection: Selection, line: Scenario): SpotChoice | { spot: null; label: string; blocked: string } {
  const n = line.sections.length;
  const spot: Spot | null =
    selection.kind === "section" ? { kind: "section", index: selection.index }
    : selection.kind === "joint" ? { kind: "joint", index: selection.index }
    : selection.kind === "nozzle" ? { kind: "joint", index: n }
    : null;
  const key = JSON.stringify(spot);
  const choice = spot && (spotsFor("eraser", line).find((c) => JSON.stringify(c.spot) === key) ?? (spot.kind === "joint" ? couplingRemoval(line, spot.index) : null));
  if (choice) return choice;
  if (selection.kind === "nozzle") return { spot: null, label: "Quitar", blocked: "Es la punta de la manguera: no hay pitón que quitar" };
  if (selection.kind === "joint" && selection.index === 0) return { spot: null, label: "Quitar", blocked: "La salida de la bomba no se quita: quita el tramo" };
  if (selection.kind === "joint") return { spot: null, label: "Quitar", blocked: "Este acople no se puede quitar" };
  return { spot: null, label: "Quitar", blocked: "La bomba no se quita" };
}

/** The hose's published size on section `i`, by the piece's catalog id. */
const sized = (scenario: Scenario, i: number, hoseSizeId: string) => edit.setSectionHose(scenario, i, hoseSizeId);

/** Drops the piece on the spot. A spot `spotsFor` didn't offer, or offered blocked, changes nothing. */
export function place(piece: PieceId, spot: Spot, line: Scenario): Placed {
  const same = (a: Spot, b: Spot) => JSON.stringify(a) === JSON.stringify(b);
  const choice = spotsFor(piece, line).find((c) => same(c.spot, spot)) ?? (piece === "eraser" && spot.kind === "joint" ? couplingRemoval(line, spot.index) : null);
  if (!choice || choice.blocked) return {};
  const n = line.sections.length;
  const hose = HOSE_OF[piece];
  const device = DEVICE_OF[piece];
  if (hose && spot.kind === "joint") {
    const j = spot.index;
    // At a wye the hose goes before it, into the run that ends there.
    const hint = branch.junctionAt(line, j) ? j - 1 : j;
    return { scenario: sized(edit.insertSection(line, j), j, hose), hint, select: { kind: "section", index: j } };
  }
  if (hose && spot.kind === "outlet") {
    const connected = branch.connectOutlet(branch.treeOf(line), spot.path);
    const tree = branch.editSegment(connected, spot.path, (s) => {
      const size = HOSE_SIZES.find((h) => h.id === hose)!;
      return { ...s, sections: s.sections.map((x) => ({ ...x, hoseSizeId: size.id, diameterIn: size.nominalDiameterIn, frictionCoefficient: size.frictionCoefficient })) };
    });
    return { tree: { tree, path: spot.path }, select: { kind: "section", index: spot.joint } };
  }
  if (device && spot.kind === "joint") {
    return { tree: branch.insertWyeAtJoint(line, spot.index, device), select: { kind: "joint", index: spot.index } };
  }
  if ((piece === "fog" || piece === "smooth-bore") && spot.kind === "joint") {
    return { scenario: edit.setNozzleSpec(line, specFor(piece, line)), select: { kind: "nozzle" } };
  }
  if (piece !== "eraser") return {};
  if (spot.kind === "section") {
    const { start, end } = runOf(line, spot.index);
    if (end - start > 1) return { scenario: edit.removeSection(line, spot.index), hint: spot.index, select: null };
    const jn = branch.junctionAt(line, start)!;
    const tree = branch.disconnectOutlet(branch.treeOf(line), jn.outlets.find((o) => o.active)!.path);
    return { tree: { tree, path: jn.owner }, select: null };
  }
  if (spot.kind !== "joint") return {};
  const jn = branch.junctionAt(line, spot.index);
  if (jn) {
    // One line connected: it rejoins and stays drawn; more: they all go, and the owner's line is drawn.
    const drawn = branch.drawnPathOf(line);
    const rejoins = jn.outlets.filter((o) => !o.empty).length === 1;
    const path = rejoins ? [...drawn.slice(0, jn.owner.length), ...drawn.slice(jn.owner.length + 1)] : jn.owner;
    return { tree: { tree: branch.removeWye(branch.treeOf(line), jn.owner), path }, select: null };
  }
  if (spot.index === n) return { scenario: edit.removeNozzle(line), select: null };
  const placed = joints(line)[spot.index].placed;
  if (placed.length === 0) return { scenario: edit.mergeAtJoint(line, spot.index), hint: spot.index, select: { kind: "section", index: spot.index - 1 } };
  return { scenario: placed.reduce((s, kind) => edit.toggleFitting(s, spot.index, kind), line), select: null };
}
