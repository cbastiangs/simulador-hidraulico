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
