import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
import { HOSE_SIZES } from "$hydraulics/references.ts";
import type { Scenario, ScenarioSection } from "$hydraulics/scenario.ts";
import { runsOf, tautRunM } from "$lib/geometry/world.ts";

/**
 * Edits to a scenario. Each returns a new document and never changes the
 * one it was given, so the page can keep a history for undo later and the
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

/** Discharge outlet size (inches), or undefined for "same as the hose". Drawing only. */
export function setOutletSize(scenario: Scenario, outletSizeIn: number | undefined): Scenario {
  const { outletSizeIn: _, ...source } = scenario.source;
  return { ...scenario, source: outletSizeIn === undefined ? source : { ...source, outletSizeIn } };
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
  return withSection(scenario, index, (s) => ({
    ...s,
    hoseSizeId: size.id,
    diameterIn: size.nominalDiameterIn,
    frictionCoefficient: size.frictionCoefficient,
  }));
}

/** Appends a section like the last one, level with where the line ends. */
export function addSection(scenario: Scenario): Scenario {
  const last = scenario.sections[scenario.sections.length - 1];
  return { ...scenario, sections: [...scenario.sections, { ...last }] };
}

export function removeSection(scenario: Scenario, index: number): Scenario {
  if (scenario.sections.length <= 1) return scenario;
  return { ...scenario, sections: scenario.sections.filter((_, i) => i !== index) };
}

export function setNozzleOpen(scenario: Scenario, open: boolean): Scenario {
  return { ...scenario, nozzle: { ...scenario.nozzle, open } };
}

export function setNozzleSpec(scenario: Scenario, specId: string): Scenario {
  const spec = NOZZLE_SPECS.find((n) => n.id === specId);
  if (!spec) return scenario;
  return {
    ...scenario,
    nozzle: {
      ...scenario.nozzle,
      kind: spec.kind,
      specId: spec.id,
      settingsGpm: [...spec.settingsGpm],
      ratedFlowGpm: spec.ratedFlowGpm,
      ratedPressurePsi: spec.ratedPressurePsi,
    },
  };
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
  return {
    ...scenario,
    nozzle: {
      ...nozzle,
      specId: null,
      kind: typedFlow ? "fixed-orifice" : nozzle.kind,
      settingsGpm: typedFlow ? [] : nozzle.settingsGpm,
      ratedFlowGpm: within(rating.ratedFlowGpm ?? nozzle.ratedFlowGpm, LIMITS.ratedFlowGpm),
      ratedPressurePsi: within(rating.ratedPressurePsi ?? nozzle.ratedPressurePsi, LIMITS.ratedPressurePsi),
    },
  };
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
