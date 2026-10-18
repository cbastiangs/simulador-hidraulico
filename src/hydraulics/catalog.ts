import type { HoseSize, SourceId } from "./references.ts";
import { smoothBoreFlowGpm, type NozzleDesign } from "./nozzle.ts";

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
  /** Combination (fog), smooth bore, or none at all (MODEL.md §3.4b, §3.4d). */
  design: NozzleDesign;
  /** Smooth bore only: the tip, inches; the rating follows from it (§3.4). */
  tipIn?: number;
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

const SMOOTH_BORE_PRESSURE: Provenance = {
  sources: ["cgbvpManual2019"],
  note: "p. 72: 50 psi for a smooth-bore handline, a traditional default",
};

const FREEMAN: Provenance = {
  sources: ["coloradoPumperChart"],
  note: "p. 2: GPM = 29.7·d²·√NP from the tip; generic common tip sizes (MODEL.md §3.4)",
};

const OPEN_END: Provenance = {
  sources: ["temeculaFireFlow"],
  note: "no nozzle: Q = 29.84·c·d²·√p on the last hose's coupling, c = 0.90 assumed (MODEL.md §3.4d)",
};

/** Handline tips, inches, at 50 psi: generic common sizes; inlet 1½″ for the two small ones, 2½″ above (MODEL.md §3.4). */
const SMOOTH_BORE_TIPS: readonly { id: string; tipIn: number; name: string; inletIn: number }[] = [
  { id: "smooth-bore-7-8", tipIn: 7 / 8, name: "7/8″", inletIn: 1.5 },
  { id: "smooth-bore-15-16", tipIn: 15 / 16, name: "15/16″", inletIn: 1.5 },
  { id: "smooth-bore-1", tipIn: 1, name: "1″", inletIn: 2.5 },
  { id: "smooth-bore-1-1-8", tipIn: 9 / 8, name: "1⅛″", inletIn: 2.5 },
];

function smoothBore({ id, tipIn, name, inletIn }: (typeof SMOOTH_BORE_TIPS)[number]): NozzleSpec {
  return {
    id,
    label: `Chorro sólido, boquilla ${name} @ 50 psi`,
    design: "smooth-bore",
    tipIn,
    kind: "fixed-orifice",
    settingsGpm: [],
    ratedFlowGpm: Math.round(smoothBoreFlowGpm(tipIn, 50)),
    ratedPressurePsi: 50,
    inletIn,
    provenance: { ratedFlowGpm: FREEMAN, ratedPressurePsi: SMOOTH_BORE_PRESSURE, inletIn: GENERIC_INLET },
  };
}

export const NOZZLE_SPECS: readonly NozzleSpec[] = [
  {
    id: "combination-selectable",
    design: "fog",
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
    design: "fog",
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
    design: "fog",
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
    design: "fog",
    label: "Pitón combinado, caudal único 250 gpm @ 100 psi",
    kind: "fixed-orifice",
    settingsGpm: [],
    ratedFlowGpm: 250,
    ratedPressurePsi: 100,
    inletIn: 2.5,
    provenance: { ratedFlowGpm: GENERIC_FLOW, ratedPressurePsi: FOG_PRESSURE, inletIn: GENERIC_INLET },
  },
  ...SMOOTH_BORE_TIPS.map(smoothBore),
  {
    id: "open-end",
    label: "Sin pitón: el agua sale por el acople de la manguera",
    design: "open-end",
    kind: "fixed-orifice",
    settingsGpm: [],
    // The solver derives an open end's reference point from the coupling (nozzle.ts, ratingOf); these are placeholders.
    ratedFlowGpm: 1,
    ratedPressurePsi: 50,
    inletIn: 0,
    provenance: { ratedFlowGpm: OPEN_END, ratedPressurePsi: OPEN_END, inletIn: OPEN_END },
  },
];

/** A junction device (MODEL.md §2 "Devices and empty outlets"). */
export type WyeDevice = "wye" | "trifurca";

/**
 * Outlets per device, and the bore an empty outlet flows through (§3.4d):
 * 1½″ for both, a modelling choice to verify against the station's devices.
 */
export const WYE_DEVICES: Record<WyeDevice, { outlets: number; outletIn: number }> = {
  wye: { outlets: 2, outletIn: 1.5 },
  trifurca: { outlets: 3, outletIn: 1.5 },
};
