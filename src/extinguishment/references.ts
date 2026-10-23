/**
 * The published sources and conventions behind the extinguishment engine
 * (docs/MODEL.md §3.12, docs/extinguishment-research.md). Kept separate from
 * `src/hydraulics/references.ts`: nothing here is a hydraulic constant, and
 * the hydraulics never import it.
 *
 * Each value names where it comes from; a value nobody can trace does not
 * belong here.
 */

export type Source = {
  title: string;
  publisher: string;
  published: string;
  /** Absent when the document is not openly published. */
  url?: string;
};

export const SOURCES = {
  /**
   * Primary: the NFA fire-flow formula, SM2-27–30 (PDF pp. 101–103). The one
   * the convention is tagged with.
   */
  nfaInitialCompanyOperations: {
    title: "Strategy and Tactics for Initial Company Operations, Student Manual",
    publisher: "FEMA / US Fire Administration / National Fire Academy",
    published: "2016-07",
    url: "https://apps.usfa.fema.gov/ax/sm/sm_0455.pdf",
  },
  /**
   * Secondary: an independent teaching source that reproduces the same number
   * (40 ft × 30 ft at 25 % = 100 gpm). A cross-check, not the authority.
   */
  jibcFireServiceHydraulics: {
    title: "Fire Service Hydraulics (FIRE-1114), ch. 5: Calculating Fire Flow",
    publisher: "Justice Institute of British Columbia",
    published: "n.d.",
    url: "https://pressbooks.bccampus.ca/esm1/chapter/chapter-5-calculating-fire-flow/",
  },
  /**
   * The water states behind the full-vaporization reference: liquid at 20 °C
   * to vapor at 100 °C, both at 101.325 kPa absolute.
   */
  nistWaterStates: {
    title: "Thermophysical Properties of Fluid Systems: water at 20–100 °C and 101.325 kPa",
    publisher: "NIST Chemistry WebBook, SRD 69",
    published: "n.d.",
    url: "https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm",
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/**
 * How a law is classified (docs/MODEL.md §0 basis tags): a fire-service
 * convention is kept as a method, never as a law of nature.
 */
export type FireFlowConvention = {
  /** Law id, shared with docs/MODEL.md and the screen. */
  lawId: "extinguish.fire-flow";
  classification: "convention";
  sourceId: SourceId;
};

export const FIRE_FLOW_CONVENTION: FireFlowConvention = {
  lawId: "extinguish.fire-flow",
  classification: "convention",
  sourceId: "nfaInitialCompanyOperations",
};

/**
 * The NFA formula divides the involved area in square feet by 3 to get US gpm
 * (SM2-28, PDF p. 102).
 */
export const NFA_SQUARE_FEET_PER_GPM = 3;

/**
 * How the absorption reference is classified: a physical calculation over
 * declared water states, not a measured fireground effectiveness.
 */
export type AbsorptionReference = {
  /** Law id, shared with docs/MODEL.md and the screen. */
  lawId: "extinguish.absorption";
  classification: "physical";
  sourceId: SourceId;
};

export const ABSORPTION_REFERENCE: AbsorptionReference = {
  lawId: "extinguish.absorption",
  classification: "physical",
  sourceId: "nistWaterStates",
};

/**
 * The declared endpoints and NIST properties used by the reference capacity
 * (MODEL.md §3.12): liquid water at 20 °C to vapor at 100 °C, both at
 * 101.325 kPa absolute. Enthalpy is the change over that path, not a value at
 * one state; density is the 20 °C inlet density.
 */
export const WATER_REFERENCE = {
  liquidCelsius: 20,
  vaporCelsius: 100,
  pressureKPa: 101.325,
  enthalpyKjPerKg: 2591.5757,
  densityKgPerM3: 998.2072,
} as const;
