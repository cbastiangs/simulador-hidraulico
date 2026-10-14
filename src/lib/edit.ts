import type { Scenario } from "$hydraulics/scenario.ts";

/**
 * Edits to a scenario. Each returns a new document and never changes the
 * one it was given, so the page can keep a history for undo later and the
 * solver always sees a whole, consistent document.
 */

export function setSourcePressure(scenario: Scenario, pressurePsi: number): Scenario {
  return { ...scenario, source: { ...scenario.source, pressurePsi: Math.max(0, pressurePsi) } };
}

export function setEndElevation(scenario: Scenario, sectionIndex: number, endElevationM: number): Scenario {
  return {
    ...scenario,
    sections: scenario.sections.map((s, i) => (i === sectionIndex ? { ...s, endElevationM } : s)),
  };
}

export function setNozzleOpen(scenario: Scenario, open: boolean): Scenario {
  return { ...scenario, nozzle: { ...scenario.nozzle, open } };
}
