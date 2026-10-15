import { NOZZLE_SPECS } from "./catalog.ts";
import { HOSE_SIZES, METHODS, type FittingKind, type MethodId } from "./references.ts";
import { solveSeriesLine, type Fitting, type SeriesLine, type SeriesResult } from "./series.ts";

/**
 * The scenario document: everything that decides a lay's hydraulics, as
 * plain JSON. It is what presets, share links, saved files and undo store,
 * and the only input the app hands the solver.
 *
 * - **Values, not references.** A section carries its own C and diameter;
 *   `hoseSizeId` and `specId` only record where they came from. Editing a
 *   value never touches the catalog, and a document stays solvable even if
 *   the catalog later changes.
 * - **Station units**, like the engine: metres for length and height,
 *   inches for diameter, psi, US gpm. Other display units (bar, L/min, ft)
 *   are converted at the screen's edge (units.ts).
 * - **No layout.** The side view derives positions from lengths and
 *   heights; the top-down view's layout will be a separate, optional part.
 * - **Untrusted until parsed.** A link or file can contain anything.
 *   `parseScenario` is the only way in: it checks every field and returns a
 *   fresh object, so code past it may trust the document.
 */

export const SCENARIO_SCHEMA = "simulador-hidraulico/scenario";

/**
 * Where the line starts: a pump outlet, or a standpipe outlet on the fire
 * floor. Either way a set pressure; heights are measured from it.
 */
export type ScenarioSource = {
  kind: "fixed-pressure";
  pressurePsi: number;
  /**
   * Discharge outlet size, inches. Absent: the same as the first hose's
   * coupling. A different size needs an adapter at joint 0 (see `joints`).
   */
  outletSizeIn?: number;
  /** Fittings at the pump outlet (joint 0). */
  fittings?: FittingKind[];
};

export type ScenarioSection = {
  /** Catalog row (references.ts HOSE_SIZES) the values came from; null when entered by hand. */
  hoseSizeId: string | null;
  diameterIn: number;
  frictionCoefficient: number;
  lengthM: number;
  /** Height of the section's downstream coupling above the source, metres. */
  endElevationM: number;
  /**
   * Horizontal distance this section covers, metres: drawing only (the
   * hydraulics use length and height). Absent means taut: √(L² − Δh²). Less
   * than that means the hose has slack and is drawn sagging.
   */
  runM?: number;
  /**
   * Whether dragging a coupling may resize this hose (UX.md §2). Absent or
   * false: the length is locked (a real hose does not stretch). Drawing and
   * editing only; the hydraulics are unaffected.
   */
  lengthFree?: boolean;
  /** Fittings placed by hand at this section's downstream coupling (joint i + 1). */
  endFittings?: FittingKind[];
};

/**
 * `fixed-orifice`: one rating. `selectable`: a gallonage ring; each setting is
 * a fixed orifice at the same rated pressure, and `ratedFlowGpm` is the one
 * selected (MODEL.md §3.5). The solver sees only the selected rating.
 */
export type ScenarioNozzle = {
  kind: "fixed-orifice" | "selectable";
  /** Catalog spec (catalog.ts NOZZLE_SPECS) the values came from; null when entered by hand. */
  specId: string | null;
  /** The ring's settings, ascending; empty for a fixed orifice. */
  settingsGpm: number[];
  ratedFlowGpm: number;
  ratedPressurePsi: number;
  /** 0 straight stream … 1 wide fog. Drawing only: the flow does not depend on it (MODEL.md §3.5). */
  pattern: number;
  open: boolean;
};

export type Scenario = {
  schema: typeof SCENARIO_SCHEMA;
  version: 1;
  name: string;
  methodId: MethodId;
  /**
   * "Accesorios automáticos" (ROADMAP §11, decision 6). Absent or true: every
   * coupling-size mismatch gets an adapter, derived, never stored. False:
   * adapters are placed by hand, and a mismatch without one leaves the line
   * unconnected (`missingAdapters`).
   */
  autoFittings?: boolean;
  source: ScenarioSource;
  sections: ScenarioSection[];
  nozzle: ScenarioNozzle;
};

/** A document that can't be used, with the path of the first bad field (e.g. `sections[1].lengthM`). */
export class ScenarioError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "ScenarioError";
    this.path = path;
  }
}

const MAX_SECTIONS = 100;

function record(value: unknown, path: string) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ScenarioError(path, "must be an object");
  }
  return value as Record<string, unknown>;
}

type NumberRule = "finite" | "zero or more" | "greater than zero";

function number(value: unknown, path: string, rule: NumberRule) {
  const valid =
    typeof value === "number" &&
    Number.isFinite(value) &&
    (rule === "finite" || (rule === "zero or more" ? value >= 0 : value > 0));
  if (!valid) throw new ScenarioError(path, `must be a number, ${rule}`);
  return value;
}

function oneOf<T extends string>(value: unknown, path: string, allowed: readonly T[]) {
  if (!allowed.includes(value as T)) throw new ScenarioError(path, `must be one of ${allowed.join(", ")}`);
  return value as T;
}

/**
 * Any id string, known or not: ids are provenance only, and a row the
 * catalog drops later must not make old documents unreadable.
 */
function boolFlag(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new ScenarioError(path, "must be true or false");
  return value;
}

const FITTING_KINDS = ["adapter", "valve"] as const satisfies readonly FittingKind[];

/** At most one of each kind per joint, in a fixed order. */
function fittingList(value: unknown, path: string): FittingKind[] {
  if (!Array.isArray(value)) throw new ScenarioError(path, "must be a list of fittings");
  const kinds = value.map((v: unknown, i) => oneOf(v, `${path}[${i}]`, FITTING_KINDS));
  return FITTING_KINDS.filter((k) => kinds.includes(k));
}

function idOrNull(value: unknown, path: string) {
  if (value === null) return null;
  if (typeof value !== "string" || value.length > 100) throw new ScenarioError(path, "must be an id or null");
  return value;
}

export function parseScenario(value: unknown): Scenario {
  const doc = record(value, "scenario");
  if (doc.schema !== SCENARIO_SCHEMA) throw new ScenarioError("schema", `must be "${SCENARIO_SCHEMA}"`);
  if (doc.version !== 1) throw new ScenarioError("version", "must be 1");
  if (typeof doc.name !== "string" || doc.name.length > 200) {
    throw new ScenarioError("name", "must be text of at most 200 characters");
  }

  const source = record(doc.source, "source");
  const nozzle = record(doc.nozzle, "nozzle");
  if (!Array.isArray(doc.sections) || doc.sections.length === 0 || doc.sections.length > MAX_SECTIONS) {
    throw new ScenarioError("sections", `must be a list of 1 to ${MAX_SECTIONS} sections`);
  }
  if (typeof nozzle.open !== "boolean") throw new ScenarioError("nozzle.open", "must be true or false");
  const nozzleKind = oneOf(nozzle.kind, "nozzle.kind", ["fixed-orifice", "selectable"] as const);
  const ratedFlowGpm = number(nozzle.ratedFlowGpm, "nozzle.ratedFlowGpm", "greater than zero");
  if (!Array.isArray(nozzle.settingsGpm) || nozzle.settingsGpm.length > 12) {
    throw new ScenarioError("nozzle.settingsGpm", "must be a list of at most 12 flows");
  }
  const settingsGpm = nozzle.settingsGpm.map((q: unknown, i) =>
    number(q, `nozzle.settingsGpm[${i}]`, "greater than zero"),
  );
  if (nozzleKind === "fixed-orifice" && settingsGpm.length > 0) {
    throw new ScenarioError("nozzle.settingsGpm", "must be empty for a fixed-orifice nozzle");
  }
  if (nozzleKind === "selectable" && (settingsGpm.length < 2 || !settingsGpm.includes(ratedFlowGpm))) {
    throw new ScenarioError("nozzle.settingsGpm", "must list 2 or more settings, including ratedFlowGpm");
  }
  const pattern = number(nozzle.pattern, "nozzle.pattern", "zero or more");
  if (pattern > 1) throw new ScenarioError("nozzle.pattern", "must be between 0 and 1");

  return {
    schema: SCENARIO_SCHEMA,
    version: 1,
    name: doc.name,
    methodId: oneOf(doc.methodId, "methodId", Object.keys(METHODS) as MethodId[]),
    ...(doc.autoFittings === undefined ? {} : { autoFittings: boolFlag(doc.autoFittings, "autoFittings") }),
    source: {
      kind: oneOf(source.kind, "source.kind", ["fixed-pressure"] as const),
      pressurePsi: number(source.pressurePsi, "source.pressurePsi", "zero or more"),
      ...(source.outletSizeIn === undefined
        ? {}
        : { outletSizeIn: number(source.outletSizeIn, "source.outletSizeIn", "greater than zero") }),
      ...(source.fittings === undefined ? {} : { fittings: fittingList(source.fittings, "source.fittings") }),
    },
    sections: doc.sections.map((raw: unknown, i) => {
      const path = `sections[${i}]`;
      const section = record(raw, path);
      return {
        hoseSizeId: idOrNull(section.hoseSizeId, `${path}.hoseSizeId`),
        diameterIn: number(section.diameterIn, `${path}.diameterIn`, "greater than zero"),
        frictionCoefficient: number(section.frictionCoefficient, `${path}.frictionCoefficient`, "zero or more"),
        lengthM: number(section.lengthM, `${path}.lengthM`, "zero or more"),
        endElevationM: number(section.endElevationM, `${path}.endElevationM`, "finite"),
        ...(section.lengthFree === undefined ? {} : { lengthFree: boolFlag(section.lengthFree, `${path}.lengthFree`) }),
        ...(section.runM === undefined ? {} : { runM: number(section.runM, `${path}.runM`, "zero or more") }),
        ...(section.endFittings === undefined ? {} : { endFittings: fittingList(section.endFittings, `${path}.endFittings`) }),
      };
    }),
    nozzle: {
      kind: nozzleKind,
      specId: idOrNull(nozzle.specId, "nozzle.specId"),
      settingsGpm: [...settingsGpm].sort((a, b) => a - b),
      ratedFlowGpm,
      ratedPressurePsi: number(nozzle.ratedPressurePsi, "nozzle.ratedPressurePsi", "greater than zero"),
      pattern,
      open: nozzle.open,
    },
  };
}

/** A hose's coupling size: its catalog row's, else its diameter (hand-entered or large-diameter hose). */
export function couplingOf(section: ScenarioSection): number {
  return HOSE_SIZES.find((h) => h.id === section.hoseSizeId)?.couplingIn ?? section.diameterIn;
}

/**
 * One joint of the line (MODEL.md §3.10): joint 0 is the pump outlet, joint
 * i the coupling after section i − 1, the last the nozzle inlet. `upIn` and
 * `downIn` are the coupling sizes that meet there; undefined means unknown
 * (a hand-entered nozzle) or "same as the hose" (pump outlet), which fits.
 */
export type Joint = {
  index: number;
  upIn?: number;
  downIn?: number;
  /** The coupling sizes differ: an adapter belongs here. */
  mismatch: boolean;
  /** Placed by hand (stored in the document). */
  placed: FittingKind[];
  /** Derived by "Accesorios automáticos": an adapter nobody stored. */
  auto: boolean;
  /** Manual mode, a mismatch and no adapter: the line isn't connected here. */
  missing: boolean;
};

export const isAuto = (scenario: Scenario) => scenario.autoFittings !== false;

export function joints(scenario: Scenario): Joint[] {
  const { sections, source, nozzle } = scenario;
  const nozzleInlet = NOZZLE_SPECS.find((n) => n.id === nozzle.specId)?.inletIn;
  const auto = isAuto(scenario);
  return Array.from({ length: sections.length + 1 }, (_, index) => {
    const upIn = index === 0 ? source.outletSizeIn : couplingOf(sections[index - 1]);
    const downIn = index === sections.length ? nozzleInlet : couplingOf(sections[index]);
    const placed = (index === 0 ? source.fittings : sections[index - 1].endFittings) ?? [];
    const mismatch = upIn !== undefined && downIn !== undefined && upIn !== downIn;
    const hasAdapter = placed.includes("adapter");
    return {
      index,
      upIn,
      downIn,
      mismatch,
      placed,
      auto: auto && mismatch && !hasAdapter,
      missing: !auto && mismatch && !hasAdapter,
    };
  });
}

/** The joints a manual-mode line can't be connected at. */
export const missingAdapters = (scenario: Scenario) => joints(scenario).filter((j) => j.missing);

/** Every fitting the line has, placed or derived, in joint order. */
export function fittingsOf(scenario: Scenario): Fitting[] {
  return joints(scenario).flatMap((j) => [
    ...(j.auto ? [{ joint: j.index, kind: "adapter" as const }] : []),
    ...j.placed.map((kind) => ({ joint: j.index, kind })),
  ]);
}

/** The engine's input for a parsed document. */
export function toSeriesLine(scenario: Scenario): SeriesLine {
  return {
    fittings: fittingsOf(scenario),
    pumpPressurePsi: scenario.source.pressurePsi,
    sections: scenario.sections.map(({ lengthM, frictionCoefficient, endElevationM }) => ({
      hose: { lengthM, frictionCoefficient },
      endElevationM,
    })),
    nozzle: {
      ratedFlowGpm: scenario.nozzle.ratedFlowGpm,
      ratedPressurePsi: scenario.nozzle.ratedPressurePsi,
      open: scenario.nozzle.open,
    },
  };
}

/**
 * Solves under the document's method, or another one (the reference shown
 * beside it). A line with a missing adapter isn't connected, so no water
 * flows: it is solved with the nozzle shut (static pressure only).
 */
export function solveScenario(scenario: Scenario, methodId: MethodId = scenario.methodId): SeriesResult {
  const line = toSeriesLine(scenario);
  const connected = missingAdapters(scenario).length === 0;
  return solveSeriesLine(connected ? line : { ...line, nozzle: { ...line.nozzle, open: false } }, METHODS[methodId]);
}
