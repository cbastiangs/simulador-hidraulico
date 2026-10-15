import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
import { HOSE_SIZES, type FittingKind } from "$hydraulics/references.ts";
import { joints, type Scenario, type ScenarioSection } from "$hydraulics/scenario.ts";
import { runsOf, tautRunM } from "$lib/geometry/world.ts";

/**
 * Edits to a scenario. Each returns a new document and never changes the
 * one it was given, so the page can keep a history for undo and the
 * solver always sees a whole, consistent document. Each also clamps its
 * value to what parseScenario accepts, so an edit can't produce a document
 * a share link would reject.
 */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const LIMITS = {
  pressurePsi: { min: 0, max: 400 },
  lengthM: { min: 1, max: 1000 },
  elevationM: { min: -100, max: 300 },
  ratedFlowGpm: { min: 1, max: 2000 },
  ratedPressurePsi: { min: 1, max: 200 },
} as const;

const within = (value: number, limit: { min: number; max: number }) => clamp(value, limit.min, limit.max);

function withSection(scenario: Scenario, index: number, change: (s: ScenarioSection) => ScenarioSection): Scenario {
  return { ...scenario, sections: scenario.sections.map((s, i) => (i === index ? change(s) : s)) };
}

/** Discharge outlet size (inches), or undefined for "same as the hose". */
export function setOutletSize(scenario: Scenario, outletSizeIn: number | undefined): Scenario {
  const { outletSizeIn: _, ...source } = scenario.source;
  return pruneAdapters({ ...scenario, source: outletSizeIn === undefined ? source : { ...source, outletSizeIn } });
}

// Fittings (MODEL.md §3.10, UX.md §2). Joint 0 is stored on the source,
// joint i on the end of section i − 1.

const placedAt = (scenario: Scenario, joint: number) =>
  (joint === 0 ? scenario.source.fittings : scenario.sections[joint - 1].endFittings) ?? [];

const ORDER: readonly FittingKind[] = ["adapter", "valve"];

function withFittings(scenario: Scenario, joint: number, kinds: readonly FittingKind[]): Scenario {
  const list = ORDER.filter((k) => kinds.includes(k));
  const set = <T extends { fittings?: FittingKind[]; endFittings?: FittingKind[] }>(o: T, key: "fittings" | "endFittings"): T => {
    const { [key]: _, ...rest } = o;
    return (list.length ? { ...rest, [key]: list } : rest) as T;
  };
  return joint === 0
    ? { ...scenario, source: set(scenario.source, "fittings") }
    : withSection(scenario, joint - 1, (s) => set(s, "endFittings"));
}

/** Places or removes a fitting at a joint. An adapter only goes where coupling sizes differ, and only by hand. */
export function toggleFitting(scenario: Scenario, joint: number, kind: FittingKind): Scenario {
  const placed = placedAt(scenario, joint);
  if (placed.includes(kind)) return withFittings(scenario, joint, placed.filter((k) => k !== kind));
  if (kind === "adapter" && (scenario.autoFittings !== false || !joints(scenario)[joint].mismatch)) return scenario;
  return withFittings(scenario, joint, [...placed, kind]);
}

/** Drops hand-placed adapters where the sizes now match: they would join nothing. */
function pruneAdapters(scenario: Scenario): Scenario {
  return joints(scenario).reduce(
    (s, j) => (j.placed.includes("adapter") && !j.mismatch ? withFittings(s, j.index, j.placed.filter((k) => k !== "adapter")) : s),
    scenario,
  );
}

/**
 * "Accesorios automáticos". Turning it off stores the adapters it had
 * derived, so the line stays connected; turning it on drops stored adapters,
 * which it derives again.
 */
export function setAutoFittings(scenario: Scenario, on: boolean): Scenario {
  if (on) {
    const { autoFittings: _, ...rest } = scenario;
    return joints(scenario).reduce(
      (s, j) => (j.placed.includes("adapter") ? withFittings(s, j.index, j.placed.filter((k) => k !== "adapter")) : s),
      rest as Scenario,
    );
  }
  return joints(scenario).reduce(
    (s, j) => (j.auto ? withFittings(s, j.index, [...j.placed, "adapter"]) : s),
    { ...scenario, autoFittings: false } as Scenario,
  );
}

export function setSourcePressure(scenario: Scenario, pressurePsi: number): Scenario {
  return { ...scenario, source: { ...scenario.source, pressurePsi: within(pressurePsi, LIMITS.pressurePsi) } };
}

/**
 * How dragging or editing a coupling treats hose length (docs/UX.md §2):
 * - `tether`: the hose length is fixed. The coupling moves within the hose's
 *   reach; slack sags; a rise can't exceed the hose length.
 * - `free`: the hose resizes to span the gap, taut (straight-line distance,
 *   rounded up to 0.5 m).
 */
export type LengthMode = "tether" | "free";

/** A hose's length lock is its own property: locked unless `lengthFree`. */
export const modeOf = (section: { lengthFree?: boolean }): LengthMode => (section.lengthFree ? "free" : "tether");

/** Locks or unlocks the length of section `i` (a lock icon on the hose). */
export function toggleLengthLock(scenario: Scenario, i: number): Scenario {
  return withSection(scenario, i, (s) => (s.lengthFree ? { ...s, lengthFree: false } : { ...s, lengthFree: true }));
}

const startElevationM = (scenario: Scenario, i: number) => (i === 0 ? 0 : scenario.sections[i - 1].endElevationM);

/**
 * Moves the coupling at the end of section `i` to a horizontal run and a
 * height. Everything downstream moves with it: later sections keep their own
 * runs and rises.
 */
export function moveCoupling(
  scenario: Scenario,
  i: number,
  target: { runM: number; elevationM: number },
): Scenario {
  const section = scenario.sections[i];
  const mode = modeOf(section);
  const start = startElevationM(scenario, i);
  let run = Math.max(0, target.runM);
  let rise = within(target.elevationM, LIMITS.elevationM) - start;
  let length = section.lengthM;
  if (mode === "tether") {
    // The hose can't climb more than its own length, nor reach further than it.
    rise = clamp(rise, -length, length);
    run = Math.min(run, tautRunM(length, rise));
  } else {
    length = within(Math.ceil(Math.hypot(run, rise) * 2) / 2, LIMITS.lengthM);
  }
  const end = start + rise;
  const shift = end - section.endElevationM;
  return {
    ...scenario,
    sections: scenario.sections.map((s, k) =>
      k < i ? s : k === i ? { ...s, lengthM: length, endElevationM: end, runM: run } : { ...s, endElevationM: s.endElevationM + shift },
    ),
  };
}

/**
 * Sets a coupling's height. With fixed length, a taut hose stays taut (it
 * slides along its reach) and a slack one keeps its horizontal position;
 * free mode keeps the position and resizes the hose.
 */
export function setEndElevation(scenario: Scenario, i: number, endElevationM: number): Scenario {
  const section = scenario.sections[i];
  const mode = modeOf(section);
  const run = runsOf(scenario.sections)[i];
  const rise = section.endElevationM - startElevationM(scenario, i);
  const taut = section.lengthM - Math.hypot(run, rise) < 0.05;
  const newRise = within(endElevationM, LIMITS.elevationM) - startElevationM(scenario, i);
  const runM = mode === "tether" && taut ? tautRunM(section.lengthM, newRise) : run;
  return moveCoupling(scenario, i, { runM, elevationM: endElevationM });
}

/**
 * Sets a section's hose length. It can't be shorter than the section's rise.
 * A taut section (no stored run) stays taut and reaches further; a section
 * with a stored run keeps it, gaining slack, or is pulled in if the hose no
 * longer reaches.
 */
export function setSectionLength(scenario: Scenario, i: number, lengthM: number): Scenario {
  const section = scenario.sections[i];
  const rise = section.endElevationM - startElevationM(scenario, i);
  const length = Math.max(within(lengthM, LIMITS.lengthM), Math.ceil(Math.abs(rise) * 2) / 2);
  const runM = section.runM === undefined ? undefined : Math.min(section.runM, tautRunM(length, rise));
  return withSection(scenario, i, (s) => ({ ...s, lengthM: length, ...(runM === undefined ? {} : { runM }) }));
}

/** Takes the size's published C and diameter; the catalog id records where they came from. */
export function setSectionHose(scenario: Scenario, index: number, hoseSizeId: string): Scenario {
  const size = HOSE_SIZES.find((h) => h.id === hoseSizeId);
  if (!size) return scenario;
  return pruneAdapters(
    withSection(scenario, index, (s) => ({
      ...s,
      hoseSizeId: size.id,
      diameterIn: size.nominalDiameterIn,
      frictionCoefficient: size.frictionCoefficient,
    })),
  );
}

/**
 * Inserts a hose at position `at` (0 = at the pump outlet, sections.length =
 * just before the nozzle), like its neighbour, level and taut, so nothing
 * else moves. Inserted before the nozzle, the nozzle's fittings move to the
 * new end with the nozzle.
 */
export function insertSection(scenario: Scenario, at: number): Scenario {
  const n = scenario.sections.length;
  if (at < 0 || at > n) return scenario;
  const like = scenario.sections[Math.min(at, n - 1)];
  const { endFittings: _, runM: __, lengthFree: ___, ...hose } = like;
  const added: ScenarioSection = { ...hose, endElevationM: startElevationM(scenario, at) };
  if (at < n) return { ...scenario, sections: [...scenario.sections.slice(0, at), added, ...scenario.sections.slice(at)] };
  const { endFittings, ...joined } = scenario.sections[n - 1];
  return {
    ...scenario,
    sections: [...scenario.sections.slice(0, -1), joined, endFittings ? { ...added, endFittings } : added],
  };
}

/** Appends a hose at the end, level with where the line ends. */
export const addSection = (scenario: Scenario) => insertSection(scenario, scenario.sections.length);

/**
 * Splits section `i` into two hoses of half its length (to 0.5 m), joined
 * halfway up its rise. The downstream coupling keeps its fittings.
 */
export function splitSection(scenario: Scenario, i: number): Scenario {
  const s = scenario.sections[i];
  const first = Math.round(s.lengthM) / 2;
  if (first < LIMITS.lengthM.min || s.lengthM - first < LIMITS.lengthM.min) return scenario;
  const start = startElevationM(scenario, i);
  const run = runsOf(scenario.sections)[i];
  const { endFittings: _, ...hose } = s;
  const half = (part: number) => (s.runM === undefined ? {} : { runM: (run * part) / s.lengthM });
  const a: ScenarioSection = { ...hose, lengthM: first, endElevationM: start + ((s.endElevationM - start) * first) / s.lengthM, ...half(first) };
  const b: ScenarioSection = { ...s, lengthM: s.lengthM - first, ...half(s.lengthM - first) };
  return { ...scenario, sections: [...scenario.sections.slice(0, i), a, b, ...scenario.sections.slice(i + 1)] };
}

/**
 * Joins the two hoses at coupling `joint` (1 … sections.length − 1) into one
 * of the upstream hose's size and their combined length. The fittings at that
 * coupling go with it.
 */
export function mergeAtJoint(scenario: Scenario, joint: number): Scenario {
  const n = scenario.sections.length;
  if (joint < 1 || joint > n - 1) return scenario;
  const [a, b] = [scenario.sections[joint - 1], scenario.sections[joint]];
  const runs = runsOf(scenario.sections);
  const { endFittings: _, runM: __, ...hose } = a;
  const merged: ScenarioSection = {
    ...hose,
    lengthM: within(a.lengthM + b.lengthM, LIMITS.lengthM),
    endElevationM: b.endElevationM,
    ...(a.runM === undefined && b.runM === undefined ? {} : { runM: runs[joint - 1] + runs[joint] }),
    ...(b.endFittings ? { endFittings: b.endFittings } : {}),
  };
  return pruneAdapters({ ...scenario, sections: [...scenario.sections.slice(0, joint - 1), merged, ...scenario.sections.slice(joint + 1)] });
}

/**
 * Removes a section; the line closes up, so everything downstream drops by
 * its rise. The fittings at its downstream coupling go with it, except at the
 * nozzle: removing the last hose, the nozzle keeps its fittings.
 */
export function removeSection(scenario: Scenario, index: number): Scenario {
  const n = scenario.sections.length;
  if (n <= 1 || index < 0 || index >= n) return scenario;
  const removed = scenario.sections[index];
  const rise = removed.endElevationM - startElevationM(scenario, index);
  const sections = scenario.sections
    .filter((_, i) => i !== index)
    .map((s, i) => (i < index ? s : { ...s, endElevationM: within(s.endElevationM - rise, LIMITS.elevationM) }));
  if (index === n - 1) {
    const { endFittings: _, ...last } = sections[n - 2];
    sections[n - 2] = removed.endFittings ? { ...last, endFittings: removed.endFittings } : last;
  }
  return pruneAdapters({ ...scenario, sections });
}

export function setNozzleOpen(scenario: Scenario, open: boolean): Scenario {
  return { ...scenario, nozzle: { ...scenario.nozzle, open } };
}

export function setNozzleSpec(scenario: Scenario, specId: string): Scenario {
  const spec = NOZZLE_SPECS.find((n) => n.id === specId);
  if (!spec) return scenario;
  return pruneAdapters({
    ...scenario,
    nozzle: {
      ...scenario.nozzle,
      kind: spec.kind,
      specId: spec.id,
      settingsGpm: [...spec.settingsGpm],
      ratedFlowGpm: spec.ratedFlowGpm,
      ratedPressurePsi: spec.ratedPressurePsi,
    },
  });
}

/**
 * A hand-entered rating: the values are the user's, so the catalog id no
 * longer applies. A typed flow makes it a single-rating nozzle; a typed
 * pressure keeps a gallonage ring (all its settings share the pressure).
 */
export function setNozzleRating(
  scenario: Scenario,
  rating: { ratedFlowGpm?: number; ratedPressurePsi?: number },
): Scenario {
  const { nozzle } = scenario;
  const typedFlow = rating.ratedFlowGpm !== undefined;
  // A hand-entered nozzle has no known inlet, so it fits any hose.
  return pruneAdapters({
    ...scenario,
    nozzle: {
      ...nozzle,
      specId: null,
      kind: typedFlow ? "fixed-orifice" : nozzle.kind,
      settingsGpm: typedFlow ? [] : nozzle.settingsGpm,
      ratedFlowGpm: within(rating.ratedFlowGpm ?? nozzle.ratedFlowGpm, LIMITS.ratedFlowGpm),
      ratedPressurePsi: within(rating.ratedPressurePsi ?? nozzle.ratedPressurePsi, LIMITS.ratedPressurePsi),
    },
  });
}

/** Turns the gallonage ring to one of its settings. */
export function setNozzleSetting(scenario: Scenario, flowGpm: number): Scenario {
  if (!scenario.nozzle.settingsGpm.includes(flowGpm)) return scenario;
  return { ...scenario, nozzle: { ...scenario.nozzle, ratedFlowGpm: flowGpm } };
}

/** 0 straight stream … 1 wide fog: drawing only. */
export function setNozzlePattern(scenario: Scenario, pattern: number): Scenario {
  return { ...scenario, nozzle: { ...scenario.nozzle, pattern: clamp(pattern, 0, 1) } };
}
