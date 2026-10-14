import type { HoseSize, SourceId } from "./references.ts";

/**
 * Built-in equipment specs the app offers as starting points. Unlike
 * references.ts, a value here may be generic: a plausible default with no
 * published source. Each spec says which of its values are sourced, so the
 * app can show "generic" next to the rest. A person's edits never come back
 * here; they live in the scenario document (scenario.ts).
 *
 * Hose sizes need no entry: every row in references.ts HOSE_SIZES is
 * published.
 */

export type Provenance = {
  /** Empty means generic: no published source. */
  sources: readonly SourceId[];
  /** Where in the source, or why the value is generic. */
  note: string;
};

export type NozzleSpec = {
  id: string;
  /** Spanish: shown in the app as is. */
  label: string;
  kind: "fixed-orifice" | "selectable";
  /** Selectable only: the gallonage ring's settings; ratedFlowGpm is the default one. */
  settingsGpm: readonly number[];
  ratedFlowGpm: number;
  ratedPressurePsi: number;
  /**
   * Coupling size of the nozzle's inlet, inches. A physical fact of the
   * nozzle (datasheet or plate), not derived from its flow: the inlet decides
   * which line it goes on, and so bounds the flows a nozzle of that inlet
   * can be built for (MODEL.md §3.4c).
   */
  inletIn: number;
  provenance: { ratedFlowGpm: Provenance; ratedPressurePsi: Provenance; inletIn: Provenance };
};

const GENERIC_INLET: Provenance = {
  sources: [],
  note: "generic: 1-1/2\" inlet for nozzles up to 150 gpm, 2-1/2\" above; replace with the datasheet value",
};

/** "direct" if the nozzle screws on; "adapter" if it needs one (drawn, not costed). */
export function couplingFit(nozzleInletIn: number, hose: HoseSize): "direct" | "adapter" {
  return nozzleInletIn === hose.couplingIn ? "direct" : "adapter";
}

const FOG_PRESSURE: Provenance = {
  sources: ["cgbvpManual2019"],
  note: "p. 72: 100 psi for combination/fog nozzles, a traditional default, not a law",
};

const GENERIC_FLOW: Provenance = {
  sources: [],
  note: "generic rating; replace with the station's nozzle when known",
};

export const NOZZLE_SPECS: readonly NozzleSpec[] = [
  {
    id: "combination-selectable",
    label: "Pitón combinado, selector 30/60/95/125 gpm @ 100 psi",
    kind: "selectable",
    settingsGpm: [30, 60, 95, 125],
    ratedFlowGpm: 95,
    ratedPressurePsi: 100,
    inletIn: 1.5,
    provenance: {
      ratedFlowGpm: { sources: [], note: "generic gallonage settings; replace with the station's nozzle when known" },
      ratedPressurePsi: FOG_PRESSURE,
      inletIn: GENERIC_INLET,
    },
  },
  {
    id: "fog-100",
    label: "Pitón combinado, caudal único 100 gpm @ 100 psi",
    kind: "fixed-orifice",
    settingsGpm: [],
    ratedFlowGpm: 100,
    ratedPressurePsi: 100,
    inletIn: 1.5,
    provenance: { ratedFlowGpm: GENERIC_FLOW, ratedPressurePsi: FOG_PRESSURE, inletIn: GENERIC_INLET },
  },
  {
    id: "fog-150",
    label: "Pitón combinado, caudal único 150 gpm @ 100 psi",
    kind: "fixed-orifice",
    settingsGpm: [],
    ratedFlowGpm: 150,
    ratedPressurePsi: 100,
    inletIn: 1.5,
    provenance: { ratedFlowGpm: GENERIC_FLOW, ratedPressurePsi: FOG_PRESSURE, inletIn: GENERIC_INLET },
  },
  {
    id: "fog-250",
    label: "Pitón combinado, caudal único 250 gpm @ 100 psi",
    kind: "fixed-orifice",
    settingsGpm: [],
    ratedFlowGpm: 250,
    ratedPressurePsi: 100,
    inletIn: 2.5,
    provenance: { ratedFlowGpm: GENERIC_FLOW, ratedPressurePsi: FOG_PRESSURE, inletIn: GENERIC_INLET },
  },
];
