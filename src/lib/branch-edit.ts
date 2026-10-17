import { HOSE_SIZES } from "$hydraulics/references.ts";
import { couplingOf, type Scenario, type ScenarioBranch, type ScenarioNozzle } from "$hydraulics/scenario.ts";

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

function newBranch(scenario: Scenario, parent: ScenarioSegment, reservedIds: string[] = []): ScenarioBranch {
  const used = new Set([...flattenSegments(scenario).flatMap(({ path }) => path), ...reservedIds]);
  let number = 1;
  while (used.has(`line-${number}`)) number++;
  const hose = HOSE_SIZES.find((size) => size.id === "1-1/2")!;
  return {
    id: `line-${number}`,
    name: `Línea ${number}`,
    open: true,
    sections: [{
      hoseSizeId: hose.id,
      diameterIn: hose.nominalDiameterIn,
      frictionCoefficient: hose.frictionCoefficient,
      lengthM: 30,
      endElevationM: segmentEndElevation(parent),
    }],
    nozzle: copyNozzle(parent.nozzle),
  };
}

/** The old terminal nozzle stays in the feed as the value restored by removing the wye. */
export function addWye(scenario: Scenario, path: readonly string[]): Scenario {
  const parent = segmentAt(scenario, path);
  if (!parent || parent.wye) return scenario;
  const first = newBranch(scenario, parent);
  const second = newBranch(scenario, parent, [first.id]);
  return editSegment(scenario, path, (segment) => ({ ...segment, wye: { branches: [first, second] } }));
}

export function addBranch(scenario: Scenario, path: readonly string[]): Scenario {
  const parent = segmentAt(scenario, path);
  if (!parent?.wye) return scenario;
  const branch = newBranch(scenario, parent);
  return editSegment(scenario, path, (segment) => ({
    ...segment,
    wye: { ...segment.wye!, branches: [...segment.wye!.branches, branch] },
  }));
}

/** Keep at least two branches; removing the whole wye is a separate, undoable action. */
export function removeBranch(scenario: Scenario, path: readonly string[]): Scenario {
  if (!path.length) return scenario;
  const parentPath = path.slice(0, -1);
  const parent = segmentAt(scenario, parentPath);
  if (!parent?.wye || parent.wye.branches.length <= 2) return scenario;
  return editSegment(scenario, parentPath, (segment) => ({
    ...segment,
    wye: { ...segment.wye!, branches: segment.wye!.branches.filter((branch) => branch.id !== path.at(-1)) },
  }));
}

export function removeWye(scenario: Scenario, path: readonly string[]): Scenario {
  return editSegment(scenario, path, (segment) => {
    const { wye: _, ...rest } = segment;
    return rest;
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
  /** At most 32 branches on one wye (a "bifurca"). */
  childrenPerWye: 32,
} as const;

function maxWyeDepth(segment: ScenarioSegment): number {
  if (!segment.wye) return 0;
  return 1 + Math.max(...segment.wye.branches.map(maxWyeDepth));
}

const totalSections = (scenario: Scenario) => flattenSegments(scenario).reduce((sum, { segment }) => sum + segment.sections.length, 0);

function childCannotBranch(segment: ScenarioSegment, depth: number): boolean {
  if (!segment.wye) return false;
  if (depth > BRANCH_LIMITS.wyeDepth - 1) return true;
  return segment.wye.branches.some((child) => childCannotBranch(child, depth + 1));
}

function anyLeafClosed(segment: ScenarioSegment): boolean {
  if (!segment.wye) return !segment.nozzle.open;
  return segment.wye.branches.some(anyLeafClosed);
}

/**
 * Whether a branch-creating action is safe at `path`, and why not when it is
 * not. Mirrors the parser's own checks: depth, branch count, section count and
 * a wye's child count. A wye whose branches are all shut is allowed (the
 * parser does not require a connected path).
 */
export function addLimit(scenario: Scenario, path: readonly string[], kind: "wye" | "branch"): string | null {
  const segment = segmentAt(scenario, path);
  if (!segment) return null;
  if (kind === "wye") {
    if (segment.wye) return "Esta sección ya tiene una bifurca.";
    if (1 + maxWyeDepth(segment) > BRANCH_LIMITS.wyeDepth) return `Máximo ${BRANCH_LIMITS.wyeDepth} bifurcas encadenadas.`;
    if (totalSections(scenario) >= BRANCH_LIMITS.sections) return `Máximo ${BRANCH_LIMITS.sections} tramos en total.`;
    if (childCannotBranch(segment, 0)) return `Máximo ${BRANCH_LIMITS.wyeDepth} bifurcas encadenadas.`;
    return null;
  }
  if (!segment.wye) return "Esta sección no tiene una bifurca.";
  if (segment.wye.branches.length >= BRANCH_LIMITS.childrenPerWye) {
    return `Una bifurca admite como máximo ${BRANCH_LIMITS.childrenPerWye} líneas.`;
  }
  if (totalSections(scenario) >= BRANCH_LIMITS.sections) return `Máximo ${BRANCH_LIMITS.sections} tramos en total.`;
  if (flattenSegments(scenario).length >= BRANCH_LIMITS.branches) {
    return `Máximo ${BRANCH_LIMITS.branches} líneas en total.`;
  }
  if (anyLeafClosed(segment)) return "Abre el pitón de la bifurca antes de añadir una línea.";
  return null;
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
  outlets: { id: string; path: BranchPath; name: string; open: boolean; active: boolean }[];
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
/** The wyes on a drawn path's scenario; empty for a single line or an edited copy. */
export const junctionsOf = (scenario: Scenario): Junction[] => junctionJoints.get(scenario) ?? [];
export const junctionAt = (scenario: Scenario, joint: number) => junctionsOf(scenario).find((j) => j.joint === joint);

/** Extends a path through wyes to a nozzle: the remembered branch where it exists, else the first open one, else the first. */
export function leafPath(scenario: Scenario, path: readonly string[]): BranchPath {
  const out: string[] = [];
  let segment: ScenarioSegment = scenario;
  for (let depth = 0; segment.wye; depth++) {
    const branches: ScenarioBranch[] = segment.wye.branches;
    const next: ScenarioBranch = branches.find((b) => b.id === path[depth]) ?? branches.find((b) => b.open) ?? branches[0];
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
      outlets: chain[i].wye!.branches.map((b) => ({ id: b.id, path: [...owner, b.id], name: b.name, open: b.open, active: b.id === path[i] })),
    });
  }
  const { wye: _, ...base } = scenario;
  const view: Scenario = { ...base, sections: chain.flatMap((s) => s.sections), nozzle: chain.at(-1)!.nozzle };
  junctionJoints.set(view, junctions);
  return { path, scenario: view, junctions, counts };
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

/** Every pump-to-nozzle path of the lay, in outlet order. */
export function leafPaths(scenario: Scenario): BranchPath[] {
  const out: BranchPath[] = [];
  const visit = (segment: ScenarioSegment, path: BranchPath) => {
    if (!segment.wye) out.push(path);
    else for (const b of segment.wye.branches) visit(b, [...path, b.id]);
  };
  visit(scenario, []);
  return out;
}
