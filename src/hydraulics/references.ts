import { METERS_PER_FOOT } from "./units.ts";

/**
 * The published constants the calculations rest on. Each value names where it
 * comes from; a value nobody can trace does not belong here.
 *
 * The CGBVP manual and IFSTA print the same friction coefficients, so the
 * hose table needs no choice of standard. They part ways on elevation: see
 * METHODS.
 */

export type Source = {
  title: string;
  publisher: string;
  published: string;
  /** Absent when the document is not openly published. */
  url?: string;
};

export const SOURCES = {
  /** Reviewed in docs/manual-summaries/hydraulics/. */
  cgbvpManual2019: {
    title: "Curso de Hidráulica aplicada a la lucha contra incendios, 4.ª versión",
    publisher: "CGBVP, Dirección General de Formación Académica",
    published: "2019-08",
  },
  coloradoPumperChart: {
    title: "Driver/Operator Pumper chart",
    publisher: "Colorado Division of Fire Prevention and Control",
    published: "2020-01",
    url: "https://cdpsdocs.state.co.us/dfpc/Website2.0/Sections/PQUAT/Proctor/DOPumper%20Chart%20Jan%202020.pdf",
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/**
 * A hose size with a published friction-loss coefficient C, for
 * FL = C × (Q/100)² × (L/100): FL in psi, Q in US gpm, L in feet -- the
 * units C is published in. The engine takes lengths in metres and converts
 * at the law (line.ts, frictionLossPsi).
 *
 * `diameter` is spelled as the catalog spells `Manguera.diametro`
 * (data/catalog/item-types.json), so a hose from a unit's inventory can be
 * matched to its row. A 3" hose matches two rows: C depends on its couplings,
 * which the catalog does not record. The CGBVP manual (p. 39) gives one 3"
 * value, 0.8.
 */
export type HoseSize = {
  id: string;
  diameter: string;
  couplings?: string;
  /**
   * Coupling size, inches: what a nozzle inlet or adapter screws onto. The
   * published C already includes the couplings (MODEL.md §3.4c), so this
   * decides fit only, never friction. `null` = not recorded (large-diameter
   * hose; not a handline connection). 1-3/4" on 1-1/2" is a `convention`
   * confirmed by the owner.
   */
  couplingIn: number | null;
  /** Nominal inside diameter, inches: what the drawing scales a hose's thickness by. */
  nominalDiameterIn: number;
  frictionCoefficient: number;
  sources: readonly SourceId[];
};

const BOTH: readonly SourceId[] = ["cgbvpManual2019", "coloradoPumperChart"];
const IFSTA_ONLY: readonly SourceId[] = ["coloradoPumperChart"];

export const HOSE_SIZES: readonly HoseSize[] = [
  { id: "1-1/2", couplingIn: 1.5, diameter: '1-1/2"', nominalDiameterIn: 1.5, frictionCoefficient: 24, sources: BOTH },
  { id: "1-3/4", couplingIn: 1.5, diameter: '1-3/4"', nominalDiameterIn: 1.75, frictionCoefficient: 15.5, sources: BOTH },
  { id: "2-1/2", couplingIn: 2.5, diameter: '2-1/2"', nominalDiameterIn: 2.5, frictionCoefficient: 2, sources: BOTH },
  { id: "3/2-1/2", couplingIn: 2.5, diameter: '3"', couplings: '2-1/2"', nominalDiameterIn: 3, frictionCoefficient: 0.8, sources: BOTH },
  { id: "3/3", couplingIn: 3, diameter: '3"', couplings: '3"', nominalDiameterIn: 3, frictionCoefficient: 0.677, sources: IFSTA_ONLY },
  { id: "4", couplingIn: null, diameter: '4"', nominalDiameterIn: 4, frictionCoefficient: 0.2, sources: BOTH },
  { id: "5", couplingIn: null, diameter: '5"', nominalDiameterIn: 5, frictionCoefficient: 0.08, sources: IFSTA_ONLY },
];

export type MethodId = "cgbvp-2019" | "physical";

/**
 * The calculation conventions a line is solved under. Each method only swaps
 * constants; the element laws stay the same. Today elevation is the only
 * constant that differs. Fixed appliance losses (5 psi per wye in the
 * manual, p. 45) will join it once lines can branch.
 */
export type Method = {
  id: MethodId;
  /** Pressure per metre of height between the pump and the nozzle. */
  psiPerMeterOfHeight: number;
  source: SourceId | null;
};

export const METHODS: Record<MethodId, Method> = {
  /**
   * The manual's quick rule, p. 44: 1.5 psi per metre (10 m = 15 psi). The
   * same page also mentions 1.4; its worked table uses 1.5. Which one is
   * examined today is unconfirmed.
   */
  "cgbvp-2019": { id: "cgbvp-2019", psiPerMeterOfHeight: 1.5, source: "cgbvpManual2019" },
  /**
   * Hydrostatics: 62.4 lb/ft³ over 144 in²/ft² = 0.433, published as 0.434
   * psi per foot; per metre, 0.434 / 0.3048 = 1.424.
   */
  physical: { id: "physical", psiPerMeterOfHeight: 0.434 / METERS_PER_FOOT, source: null },
};
