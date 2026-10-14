import type { SourceId } from "./references.ts";

/**
 * The registry of laws by id (docs/MODEL.md §3). A solved line reports one
 * term per law it applied, with that law's inputs in the law's own units, so
 * the screen can show the formula with the engine's numbers substituted and
 * never recompute anything.
 */

export type LawId = "hose.friction" | "elevation" | "nozzle.fixed-orifice";

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
    };
