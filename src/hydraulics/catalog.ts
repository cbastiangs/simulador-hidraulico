import type { SourceId } from "./references.ts";

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
  kind: "fixed-orifice";
  ratedFlowGpm: number;
  ratedPressurePsi: number;
  provenance: { ratedFlowGpm: Provenance; ratedPressurePsi: Provenance };
};

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
    id: "fog-100",
    label: "Pitón de niebla 100 gpm @ 100 psi",
    kind: "fixed-orifice",
    ratedFlowGpm: 100,
    ratedPressurePsi: 100,
    provenance: { ratedFlowGpm: GENERIC_FLOW, ratedPressurePsi: FOG_PRESSURE },
  },
  {
    id: "fog-150",
    label: "Pitón de niebla 150 gpm @ 100 psi",
    kind: "fixed-orifice",
    ratedFlowGpm: 150,
    ratedPressurePsi: 100,
    provenance: { ratedFlowGpm: GENERIC_FLOW, ratedPressurePsi: FOG_PRESSURE },
  },
  {
    id: "fog-250",
    label: "Pitón de niebla 250 gpm @ 100 psi",
    kind: "fixed-orifice",
    ratedFlowGpm: 250,
    ratedPressurePsi: 100,
    provenance: { ratedFlowGpm: GENERIC_FLOW, ratedPressurePsi: FOG_PRESSURE },
  },
];
