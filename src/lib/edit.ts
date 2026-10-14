import { NOZZLE_SPECS } from "$hydraulics/catalog.ts";
import { HOSE_SIZES } from "$hydraulics/references.ts";
import type { Scenario, ScenarioSection } from "$hydraulics/scenario.ts";

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

export function setSourcePressure(scenario: Scenario, pressurePsi: number): Scenario {
  return { ...scenario, source: { ...scenario.source, pressurePsi: within(pressurePsi, LIMITS.pressurePsi) } };
}

export function setEndElevation(scenario: Scenario, index: number, endElevationM: number): Scenario {
  return withSection(scenario, index, (s) => ({ ...s, endElevationM: within(endElevationM, LIMITS.elevationM) }));
}

export function setSectionLength(scenario: Scenario, index: number, lengthM: number): Scenario {
  return withSection(scenario, index, (s) => ({ ...s, lengthM: within(lengthM, LIMITS.lengthM) }));
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
      ratedFlowGpm: spec.ratedFlowGpm,
      ratedPressurePsi: spec.ratedPressurePsi,
    },
  };
}

/** A hand-entered rating: the values are the user's, so the catalog id no longer applies. */
export function setNozzleRating(
  scenario: Scenario,
  rating: { ratedFlowGpm?: number; ratedPressurePsi?: number },
): Scenario {
  const { nozzle } = scenario;
  return {
    ...scenario,
    nozzle: {
      ...nozzle,
      specId: null,
      ratedFlowGpm: within(rating.ratedFlowGpm ?? nozzle.ratedFlowGpm, LIMITS.ratedFlowGpm),
      ratedPressurePsi: within(rating.ratedPressurePsi ?? nozzle.ratedPressurePsi, LIMITS.ratedPressurePsi),
    },
  };
}
