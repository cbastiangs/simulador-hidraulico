import { WYE_DEVICES, type WyeDevice } from "$hydraulics/catalog.ts";
import { HOSE_SIZES } from "$hydraulics/references.ts";
import { couplingOf, type Scenario, type ScenarioBranch, type ScenarioNozzle } from "$hydraulics/scenario.ts";
import { attachNozzle } from "$lib/edit.ts";

/** A path is a list of stable branch IDs; the empty path is the shared feed. */
export type BranchPath = string[];
export type ScenarioSegment = Scenario | ScenarioBranch;

export function segmentAt(scenario: Scenario, path: readonly string[]): ScenarioSegment | undefined {
  let segment: ScenarioSegment = scenario;
  for (const id of path) {
    const branches: ScenarioBranch[] = segment.wye?.branches ?? [];
    const branch: ScenarioBranch | undefined = branches.find((candidate) => candidate.id === id);
    if (!branch) return undefined;
    segment = branch;
  }
  return segment;
}

/** Changes one segment without replacing its ancestors or siblings. */
export function editSegment(
  scenario: Scenario,
  path: readonly string[],
  change: (segment: ScenarioSegment) => ScenarioSegment,
): Scenario {
  if (!segmentAt(scenario, path)) return scenario;
  function visit(segment: ScenarioSegment, depth: number): ScenarioSegment {
    if (depth === path.length) return change(segment);
    return {
      ...segment,
      wye: {
        ...segment.wye!,
        branches: segment.wye!.branches.map((branch) =>
          branch.id === path[depth] ? (visit(branch, depth + 1) as ScenarioBranch) : branch,
        ),
      },
    };
  }
  return visit(scenario, 0) as Scenario;
}

export const segmentEndElevation = (segment: ScenarioSegment) => segment.sections.at(-1)!.endElevationM;

/** Stored heights are always relative to the pump, including nested branches. */
export function segmentStartElevation(scenario: Scenario, path: readonly string[]): number {
  if (path.length === 0) return 0;
  const parent = segmentAt(scenario, path.slice(0, -1));
  return parent ? segmentEndElevation(parent) : 0;
}

/** Moving a junction carries all descendants, keeping every hose's own rise. */
export function shiftBranch(branch: ScenarioBranch, deltaM: number): ScenarioBranch {
  if (deltaM === 0) return branch;
  return {
    ...branch,
    sections: branch.sections.map((section) => ({ ...section, endElevationM: section.endElevationM + deltaM })),
    ...(branch.wye ? { wye: { ...branch.wye, branches: branch.wye.branches.map((child) => shiftBranch(child, deltaM)) } } : {}),
  };
}

export type SegmentEntry = {
  path: BranchPath;
  segment: ScenarioSegment;
  label: string;
  depth: number;
  /** An ancestor gate is shut; this branch's own gate is still independently editable. */
  upstreamClosed: boolean;
};

export function flattenSegments(scenario: Scenario): SegmentEntry[] {
  const entries: SegmentEntry[] = [];
  function visit(segment: ScenarioSegment, path: BranchPath, upstreamClosed: boolean) {
    entries.push({ path, segment, label: path.length ? segment.name : "Alimentación", depth: path.length, upstreamClosed });
    for (const branch of segment.wye?.branches ?? []) {
      visit(branch, [...path, branch.id], upstreamClosed || ("open" in segment && !segment.open));
    }
  }
  visit(scenario, [], false);
  return entries;
}

const copyNozzle = (nozzle: ScenarioNozzle): ScenarioNozzle => ({ ...nozzle, settingsGpm: [...nozzle.settingsGpm] });

function nextId(scenario: Scenario, reservedIds: readonly string[]) {
  const used = new Set([...flattenSegments(scenario).flatMap(({ path }) => path), ...reservedIds]);
  let number = 1;
  while (used.has(`line-${number}`)) number++;
  return number;
}

function defaultHose(endElevationM: number) {
  const hose = HOSE_SIZES.find((size) => size.id === "1-1/2")!;
  return { hoseSizeId: hose.id, diameterIn: hose.nominalDiameterIn, frictionCoefficient: hose.frictionCoefficient, lengthM: 30, endElevationM };
}

function newBranch(scenario: Scenario, parent: ScenarioSegment, reservedIds: string[] = []): ScenarioBranch {
  const number = nextId(scenario, reservedIds);
  return {
    id: `line-${number}`,
    name: `Línea ${number}`,
    open: true,
    sections: [defaultHose(segmentEndElevation(parent))],
    nozzle: copyNozzle(parent.nozzle),
  };
}

/**
 * An empty outlet (MODEL.md §2): no hose, gate shut, an open end that keeps
 * the nozzle it will get when a line is connected.
 */
function newOutlet(scenario: Scenario, parent: ScenarioSegment, reservedIds: string[]): ScenarioBranch {
  const number = nextId(scenario, reservedIds);
  return { id: `line-${number}`, name: `Línea ${number}`, open: false, sections: [], nozzle: { ...copyNozzle(parent.nozzle), design: "open-end", open: true } };
}

export const isEmptyOutlet = (segment: ScenarioSegment) => segment.sections.length === 0;

/** The device's other outlets, empty, after `first`. */
function outletsAfter(scenario: Scenario, parent: ScenarioSegment, first: ScenarioBranch, device: WyeDevice): ScenarioBranch[] {
  const out = [first];
  while (out.length < WYE_DEVICES[device].outlets) out.push(newOutlet(scenario, parent, out.map((b) => b.id)));
  return out;
}

/**
 * A wye at a segment's coupling `at` (1 … its hose count; UX.md §2): the
 * hoses after it, with the nozzle or wye they lead to, become the first
 * outlet and the others start empty. At the segment's end the first outlet
 * is a new hose carrying the line's nozzle. The segment keeps its old nozzle
 * as the inactive value `removeWye` restores.
 */
export function insertWye(scenario: Scenario, path: readonly string[], at: number, device: WyeDevice = "wye"): Scenario {
  const segment = segmentAt(scenario, path);
  if (!segment || at < 1 || at > segment.sections.length || (at === segment.sections.length && segment.wye)) return scenario;
  const number = nextId(scenario, []);
  const first: ScenarioBranch = at === segment.sections.length
    ? newBranch(scenario, segment)
    : {
        id: `line-${number}`, name: `Línea ${number}`, open: true,
        sections: segment.sections.slice(at), nozzle: copyNozzle(segment.nozzle),
        ...(segment.wye ? { wye: segment.wye } : {}),
      };
  return editSegment(scenario, path, (s) => ({
    ...s,
    sections: s.sections.slice(0, at),
    wye: { ...(device === "wye" ? {} : { device }), branches: outletsAfter(scenario, s, first, device) },
  }));
}

/** A wye at the end of the segment: its first outlet continues the line. */
export const addWye = (scenario: Scenario, path: readonly string[], device: WyeDevice = "wye") =>
  insertWye(scenario, path, segmentAt(scenario, path)?.sections.length ?? 0, device);

/**
 * Takes the wye away. With one outlet connected, that line rejoins the
 * segment (the inverse of `insertWye`); with more, every line goes with it.
 */
export function removeWye(scenario: Scenario, path: readonly string[]): Scenario {
  return editSegment(scenario, path, (segment) => {
    const { wye, ...rest } = segment;
    const connected = wye?.branches.filter((b) => !isEmptyOutlet(b)) ?? [];
    if (connected.length !== 1) return rest;
    const only = connected[0];
    return { ...rest, sections: [...segment.sections, ...only.sections], nozzle: only.nozzle, ...(only.wye ? { wye: only.wye } : {}) };
  });
}

/** Connects a line to an empty outlet: a hose and the nozzle it kept. Its gate stays as it was. */
export function connectOutlet(scenario: Scenario, path: readonly string[]): Scenario {
  const start = segmentStartElevation(scenario, path);
  return editSegment(scenario, path, (segment) => {
    if (!isEmptyOutlet(segment)) return segment;
    const fitted = attachNozzle({ ...scenario, wye: undefined, sections: [defaultHose(start)], nozzle: segment.nozzle });
    return { ...segment, sections: fitted.sections, nozzle: fitted.nozzle };
  });
}

/** Why an outlet's line can't be disconnected, or null. */
export function disconnectLimit(scenario: Scenario, path: readonly string[]): string | null {
  const parent = segmentAt(scenario, path.slice(0, -1));
  const connected = parent?.wye?.branches.filter((b) => !isEmptyOutlet(b)) ?? [];
  return connected.length <= 1 ? "Es la única salida con manguera: quita el bifurco en su lugar" : null;
}

/** Takes an outlet's line off (hoses, nozzle, any wye after it); the gate shuts first. */
export function disconnectOutlet(scenario: Scenario, path: readonly string[]): Scenario {
  if (!path.length || disconnectLimit(scenario, path)) return scenario;
  return editSegment(scenario, path, (segment) => {
    const { wye: _, ...rest } = segment as ScenarioBranch;
    return { ...rest, open: false, sections: [], nozzle: { ...segment.nozzle, design: "open-end", open: true } };
  });
}

/** Why the wye at `path` can't become `device`, or null. */
export function deviceLimit(scenario: Scenario, path: readonly string[], device: WyeDevice): string | null {
  const wye = segmentAt(scenario, path)?.wye;
  if (!wye) return "Esta sección no tiene un bifurco.";
  const spare = wye.branches.length - WYE_DEVICES[device].outlets;
  if (spare > 0 && wye.branches.filter(isEmptyOutlet).length < spare) return "Desconecta una salida primero";
  if (spare < 0 && flattenSegments(scenario).length - 1 - spare > BRANCH_LIMITS.branches) return `Máximo ${BRANCH_LIMITS.branches} líneas en total.`;
  return null;
}

/** Bifurco ↔ trifurco: a new outlet starts empty; going down drops the last empty one. */
export function setDevice(scenario: Scenario, path: readonly string[], device: WyeDevice): Scenario {
  if (deviceLimit(scenario, path, device)) return scenario;
  return editSegment(scenario, path, (segment) => {
    let branches = [...segment.wye!.branches];
    while (branches.length > WYE_DEVICES[device].outlets) {
      const i = branches.findLastIndex(isEmptyOutlet);
      branches = branches.filter((_, j) => j !== i);
    }
    while (branches.length < WYE_DEVICES[device].outlets) branches.push(newOutlet(scenario, segment, branches.map((b) => b.id)));
    return { ...segment, wye: { ...(device === "wye" ? {} : { device }), branches } };
  });
}

export function toggleGate(scenario: Scenario, path: readonly string[]): Scenario {
  if (!path.length) return scenario;
  return editSegment(scenario, path, (segment) => ({ ...segment, open: !(segment as ScenarioBranch).open }));
}

/**
 * The parser's structural limits (scenario.ts): put a wye or a branch in the
 * UI only when the document it builds still parses. A UI that offers an edit
 * the parser rejects is a bug, not a hydraulic state.
 */
export const BRANCH_LIMITS = {
  /** At most 8 nested wyes; a wye at depth 8 is the last the parser accepts. */
  wyeDepth: 8,
  /** At most 64 branches in the whole tree. */
  branches: 64,
  /** At most 100 sections from the source across the whole tree. */
  sections: 100,
} as const;

function maxWyeDepth(segment: ScenarioSegment): number {
  if (!segment.wye) return 0;
  return 1 + Math.max(...segment.wye.branches.map(maxWyeDepth));
}

export const totalSections = (scenario: Scenario) => flattenSegments(scenario).reduce((sum, { segment }) => sum + segment.sections.length, 0);

/**
 * Why a wye can't go at the drawn line's coupling `joint`, or null. Mirrors
 * the parser's own checks (depth, branch and section counts); a UI that
 * offers an edit the parser rejects is a bug, not a hydraulic state.
 */
export function wyeLimit(line: Scenario, joint: number, device: WyeDevice = "wye"): string | null {
  if (joint === 0) return "Pon al menos un tramo antes del bifurco";
  if (junctionAt(line, joint)) return "Ya hay un bifurco aquí";
  const { tree, path, at } = locate(line, joint);
  const segment = segmentAt(tree, path)!;
  const below = at < segment.sections.length ? maxWyeDepth(segment) : 0;
  if (path.length + 1 + below > BRANCH_LIMITS.wyeDepth) return `Máximo ${BRANCH_LIMITS.wyeDepth} bifurcos encadenados.`;
  if (flattenSegments(tree).length - 1 + WYE_DEVICES[device].outlets > BRANCH_LIMITS.branches) return `Máximo ${BRANCH_LIMITS.branches} líneas en total.`;
  if (at === segment.sections.length && totalSections(tree) >= BRANCH_LIMITS.sections) return `Máximo ${BRANCH_LIMITS.sections} tramos en total.`;
  return null;
}

/**
 * The whole lay with a wye at the drawn line's coupling `joint`, and the
 * drawn path through it: the line goes on through the wye's first outlet.
 */
export function insertWyeAtJoint(line: Scenario, joint: number, device: WyeDevice = "wye"): { tree: Scenario; path: BranchPath } {
  const { tree, path, at } = locate(line, joint);
  const next = insertWye(tree, path, at, device);
  const first = segmentAt(next, path)?.wye?.branches[0].id;
  const drawn = drawnFrom.get(line)?.view.path ?? [];
  return { tree: next, path: next === tree || !first ? drawn : [...path, first, ...drawn.slice(path.length)] };
}

// ── The drawn path (UX.md §2 "Branched lays") ───────────────────────────────
// A branched lay is drawn and edited one pump-to-nozzle path at a time, in
// the same side view as a single line: the path's hoses are concatenated into
// an ordinary one-line scenario, each wye sits at a joint of it, and the
// other outlets are drawn as stubs. Edits made to that scenario map back here.

/** One wye on the drawn path, at `joint` (counted along the path). */
export type Junction = {
  joint: number;
  /** The segment that owns the wye. */
  owner: BranchPath;
  device: WyeDevice;
  /** `empty`: nothing connected (MODEL.md §2); never the drawn one. */
  outlets: { id: string; path: BranchPath; name: string; open: boolean; active: boolean; empty: boolean }[];
};

export type PathView = {
  /** The path ending at a nozzle (one branch id per wye). */
  path: BranchPath;
  scenario: Scenario;
  junctions: Junction[];
  /** Sections per segment along the path, feed first. */
  counts: number[];
};

const junctionJoints = new WeakMap<Scenario, Junction[]>();
/** The lay each drawn line came from, for edits that change the tree itself (a new wye). */
const drawnFrom = new WeakMap<Scenario, { tree: Scenario; view: PathView }>();

/** The segment holding the drawn line's coupling `joint` (1 … its hoses), and its place in it. */
function locate(line: Scenario, joint: number): { tree: Scenario; path: BranchPath; at: number } {
  const from = drawnFrom.get(line);
  if (!from) return { tree: line, path: [], at: joint };
  let start = 0;
  for (const [k, c] of from.view.counts.entries()) {
    if (joint <= start + c) return { tree: from.tree, path: from.view.path.slice(0, k), at: joint - start };
    start += c;
  }
  return { tree: from.tree, path: from.view.path, at: joint - start };
}
/** The whole lay a drawn line belongs to (itself for a single line), and the path it draws. */
export const treeOf = (line: Scenario): Scenario => drawnFrom.get(line)?.tree ?? line;
export const drawnPathOf = (line: Scenario): BranchPath => drawnFrom.get(line)?.view.path ?? [];
/** The wyes on a drawn path's scenario; empty for a single line or an edited copy. */
export const junctionsOf = (scenario: Scenario): Junction[] => junctionJoints.get(scenario) ?? [];
export const junctionAt = (scenario: Scenario, joint: number) => junctionsOf(scenario).find((j) => j.joint === joint);

/** Extends a path through wyes to a nozzle: the remembered branch where it exists, else the first open one, else the first. */
export function leafPath(scenario: Scenario, path: readonly string[]): BranchPath {
  const out: string[] = [];
  let segment: ScenarioSegment = scenario;
  for (let depth = 0; segment.wye; depth++) {
    const branches: ScenarioBranch[] = segment.wye.branches;
    const lines = branches.filter((b) => !isEmptyOutlet(b));
    const next: ScenarioBranch = lines.find((b) => b.id === path[depth]) ?? lines.find((b) => b.open) ?? lines[0];
    out.push(next.id);
    segment = next;
  }
  return out;
}

export function pathView(scenario: Scenario, wanted: readonly string[]): PathView {
  const path = leafPath(scenario, wanted);
  const chain: ScenarioSegment[] = [scenario];
  for (const id of path) chain.push(chain.at(-1)!.wye!.branches.find((b) => b.id === id)!);
  const counts = chain.map((s) => s.sections.length);
  const junctions: Junction[] = [];
  let joint = 0;
  for (let i = 0; i < chain.length - 1; i++) {
    joint += counts[i];
    const owner = path.slice(0, i);
    junctions.push({
      joint,
      owner,
      device: chain[i].wye!.device ?? "wye",
      outlets: chain[i].wye!.branches.map((b) => ({ id: b.id, path: [...owner, b.id], name: b.name, open: b.open, active: b.id === path[i], empty: isEmptyOutlet(b) })),
    });
  }
  const { wye: _, ...base } = scenario;
  const view: Scenario = { ...base, sections: chain.flatMap((s) => s.sections), nozzle: chain.at(-1)!.nozzle };
  junctionJoints.set(view, junctions);
  const out = { path, scenario: view, junctions, counts };
  drawnFrom.set(view, { tree: scenario, view: out });
  return out;
}

/**
 * Maps an edit of the drawn path back into the tree. Hoses keep their
 * segment; a hose added or removed belongs to the segment holding `hint` (a
 * section or joint index along the path), else to the last segment. A
 * segment is never emptied. A moved wye carries its other outlets with it,
 * keeping each hose's own rise; the drawn outlet's hoses stay where the edit
 * put them, as on a single line.
 */
export function applyPathEdit(scenario: Scenario, view: PathView, edited: Scenario, hint?: number): Scenario {
  const counts = [...view.counts];
  const delta = edited.sections.length - view.scenario.sections.length;
  if (delta !== 0) {
    let k = counts.length - 1;
    if (hint !== undefined) {
      let end = 0;
      k = counts.findIndex((c) => (end += c) > Math.min(hint, view.scenario.sections.length - 1));
    }
    counts[k] += delta;
    if (counts[k] < 1) return scenario;
  }
  let start = 0;
  const slices = counts.map((c) => edited.sections.slice(start, (start += c)));
  function rebuild(segment: ScenarioSegment, depth: number): ScenarioSegment {
    const sections = slices[depth];
    if (depth === view.path.length) return { ...segment, sections, nozzle: edited.nozzle };
    const moved = sections.at(-1)!.endElevationM - segmentEndElevation(segment);
    return {
      ...segment,
      sections,
      wye: {
        ...segment.wye!,
        branches: segment.wye!.branches.map((b) => (b.id === view.path[depth] ? (rebuild(b, depth + 1) as ScenarioBranch) : shiftBranch(b, moved))),
      },
    };
  }
  const root = rebuild(scenario, 0) as Scenario;
  return {
    ...root,
    name: edited.name,
    source: edited.source,
    methodId: edited.methodId,
    autoFittings: edited.autoFittings,
    floorHeightM: edited.floorHeightM,
  };
}

/** A branch's name with what it is: "Línea 1 · 30 m de 1½″". */
export function branchLabel(segment: ScenarioSegment): string {
  const length = segment.sections.reduce((sum, s) => sum + s.lengthM, 0);
  const sizes = [...new Set(segment.sections.map((s) => s.diameterIn))].map((d) => `${d.toString().replace(".5", "½").replace(".75", "¾")}″`);
  return `${segment.name} · ${Math.round(length)} m de ${sizes.join(" + ")}`;
}

/** Every pump-to-nozzle path of the lay, in outlet order; empty outlets aren't lines. */
export function leafPaths(scenario: Scenario): BranchPath[] {
  const out: BranchPath[] = [];
  const visit = (segment: ScenarioSegment, path: BranchPath) => {
    if (isEmptyOutlet(segment)) return;
    if (!segment.wye) out.push(path);
    else for (const b of segment.wye.branches) visit(b, [...path, b.id]);
  };
  visit(scenario, []);
  return out;
}
