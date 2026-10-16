import type { FittingKind, SourceId } from "./references.ts";

/**
 * The registry of laws by id (docs/MODEL.md §3). A solved line reports one
 * term per law it applied, with that law's inputs in the law's own units, so
 * the screen can show the formula with the engine's numbers substituted and
 * never recompute anything.
 */

export type LawId = "hose.friction" | "elevation" | "nozzle.fixed-orifice" | "appliance.fixed" | "appliance.step";

export type Law = {
  id: LawId;
  /** Symbolic form, language-neutral; the screen supplies Spanish names for the variables. */
  formula: string;
  /** Empty when the source depends on the method (elevation: Method.source). */
  sources: readonly SourceId[];
  /** Section of docs/MODEL.md that states and justifies the law. */
  model: string;
};

export const LAWS: Record<LawId, Law> = {
  "hose.friction": {
    id: "hose.friction",
    formula: "FL = C · (Q/100)² · (L/100)",
    sources: ["cgbvpManual2019", "coloradoPumperChart"],
    model: "§3.1",
  },
  elevation: { id: "elevation", formula: "EP = k · h", sources: [], model: "§3.2" },
  "nozzle.fixed-orifice": {
    id: "nozzle.fixed-orifice",
    formula: "NP = NPr · (Q/Qr)²",
    sources: [],
    model: "§3.3",
  },
  "appliance.fixed": { id: "appliance.fixed", formula: "AL = Σ pérdida fija", sources: [], model: "§3.10" },
  "appliance.step": {
    id: "appliance.step",
    formula: "AL = 0 si Q ≤ Qs; ΔP si Q > Qs",
    sources: ["coloradoPumperChart"],
    model: "§3.10",
  },
};

/** One applied law: its inputs in the law's units, and the pressure it accounts for. */
export type Term =
  | {
      lawId: "hose.friction";
      sectionIndex: number;
      inputs: { frictionCoefficient: number; flowGpm: number; lengthFt: number };
      valuePsi: number;
    }
  | { lawId: "elevation"; inputs: { psiPerMeter: number; heightM: number }; valuePsi: number }
  | {
      lawId: "nozzle.fixed-orifice";
      inputs: { ratedPressurePsi: number; ratedFlowGpm: number; flowGpm: number };
      valuePsi: number;
    }
  | {
      lawId: "appliance.fixed";
      /** Joint 0 is the pump outlet, joint i the coupling after section i − 1, the last the nozzle inlet. */
      joint: number;
      kind: FittingKind;
      /** The method's value; null = "sin dato", counted as 0. */
      inputs: { lossPsi: number | null };
      valuePsi: number;
    }
  | {
      lawId: "appliance.step";
      joint: number;
      kind: FittingKind;
      /** The step: `stepPsi` once `flowGpm` is strictly above `aboveGpm`. */
      inputs: { aboveGpm: number; stepPsi: number; flowGpm: number };
      valuePsi: number;
    };
