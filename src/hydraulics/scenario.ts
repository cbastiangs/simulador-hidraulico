import { METHODS, type MethodId } from "./references.ts";
import { solveSeriesLine, type SeriesLine, type SeriesResult } from "./series.ts";

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
export type ScenarioSource = { kind: "fixed-pressure"; pressurePsi: number };

export type ScenarioSection = {
  /** Catalog row (references.ts HOSE_SIZES) the values came from; null when entered by hand. */
  hoseSizeId: string | null;
  diameterIn: number;
  frictionCoefficient: number;
  lengthM: number;
  /** Height of the section's downstream coupling above the source, metres. */
  endElevationM: number;
};

export type ScenarioNozzle = {
  kind: "fixed-orifice";
  /** Catalog spec (catalog.ts NOZZLE_SPECS) the values came from; null when entered by hand. */
  specId: string | null;
  ratedFlowGpm: number;
  ratedPressurePsi: number;
  open: boolean;
};

export type Scenario = {
  schema: typeof SCENARIO_SCHEMA;
  version: 1;
  name: string;
  methodId: MethodId;
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

  return {
    schema: SCENARIO_SCHEMA,
    version: 1,
    name: doc.name,
    methodId: oneOf(doc.methodId, "methodId", Object.keys(METHODS) as MethodId[]),
    source: {
      kind: oneOf(source.kind, "source.kind", ["fixed-pressure"] as const),
      pressurePsi: number(source.pressurePsi, "source.pressurePsi", "zero or more"),
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
      };
    }),
    nozzle: {
      kind: oneOf(nozzle.kind, "nozzle.kind", ["fixed-orifice"] as const),
      specId: idOrNull(nozzle.specId, "nozzle.specId"),
      ratedFlowGpm: number(nozzle.ratedFlowGpm, "nozzle.ratedFlowGpm", "greater than zero"),
      ratedPressurePsi: number(nozzle.ratedPressurePsi, "nozzle.ratedPressurePsi", "greater than zero"),
      open: nozzle.open,
    },
  };
}

/** The engine's input for a parsed document. */
export function toSeriesLine(scenario: Scenario): SeriesLine {
  return {
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

/** Solves under the document's method, or another one (the reference shown beside it). */
export function solveScenario(scenario: Scenario, methodId: MethodId = scenario.methodId): SeriesResult {
  return solveSeriesLine(toSeriesLine(scenario), METHODS[methodId]);
}
