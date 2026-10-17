import { METERS_PER_FOOT } from "../hydraulics/units.ts";
import { FIRE_FLOW_CONVENTION, NFA_SQUARE_FEET_PER_GPM, type SourceId } from "./references.ts";

/**
 * The NFA fire-flow convention (docs/MODEL.md §3.12,
 * docs/extinguishment-research.md), `extinguish.fire-flow`: a training rule
 * for the flow a fire needs, not a hydraulic law and not a prediction of
 * extinguishment. Required flow
 *
 *   Q = A_ft² / 3 × f,
 *
 * Q in US gpm, A_ft² the area of **one fully involved floor** in square feet,
 * f the fraction involved (0–1). The scenario carries area in m²; the law
 * converts once, with the engine's foot (`hydraulics/units.ts`). The
 * hydraulics never import this module.
 */

export type NfaFireFlowInput = {
   /** Total area of one floor, m², before applying involvedFraction. */
  floorAreaM2: number;
  /** Fraction of that floor involved, 0–1 (1 = fully involved). */
  involvedFraction: number;
};

export type NfaFireFlow = {
  /** Law id, shared with docs/MODEL.md and the screen. */
  lawId: "extinguish.fire-flow";
  /** Basis tag: a fire-service convention, never a law of nature. */
  classification: "convention";
  /** Primary source of the convention (references.ts SOURCES). */
  sourceId: SourceId;
  /** Floor area in the law's units, ft². */
  floorAreaFt2: number;
  /** Involved area, floorAreaFt2 × involvedFraction, ft². */
  involvedAreaFt2: number;
  /** Required flow, involvedAreaFt2 / 3, US gpm. */
  requiredFlowGpm: number;
};

function requireFinite(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite, got ${value}`);
  }
}

function requireFiniteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite number ≥ 0, got ${value}`);
  }
}

/** The NFA required flow for one floor at the given involvement (MODEL.md §3.12). */
export function calculateNfaFireFlow({ floorAreaM2, involvedFraction }: NfaFireFlowInput): NfaFireFlow {
  requireFiniteNonNegative(floorAreaM2, "floorAreaM2");
  if (!Number.isFinite(involvedFraction) || involvedFraction < 0 || involvedFraction > 1) {
    throw new RangeError(`involvedFraction must be a finite number in [0, 1], got ${involvedFraction}`);
  }
  const floorAreaFt2 = floorAreaM2 / METERS_PER_FOOT ** 2;
  const involvedAreaFt2 = floorAreaFt2 * involvedFraction;
  const requiredFlowGpm = involvedAreaFt2 / NFA_SQUARE_FEET_PER_GPM;
  requireFinite(floorAreaFt2, "floorAreaFt2");
  requireFinite(involvedAreaFt2, "involvedAreaFt2");
  requireFinite(requiredFlowGpm, "requiredFlowGpm");
  return {
    lawId: FIRE_FLOW_CONVENTION.lawId,
    classification: FIRE_FLOW_CONVENTION.classification,
    sourceId: FIRE_FLOW_CONVENTION.sourceId,
    floorAreaFt2,
    involvedAreaFt2,
    requiredFlowGpm,
  };
}

export type NfaFireFlowComparison = NfaFireFlow & {
  /**
   * The caller's aggregate solved nozzle flow, US gpm, allocated to confinement,
   * extinguishment and backup; not pump output or an initial attack line alone.
   */
  deliveredFlowGpm: number;
  /** Delivered − required; negative means short. */
  marginGpm: number;
  /** Shortfall, max(0, required − delivered); 0 when covered. */
  deficitGpm: number;
  /** Delivered / required; null when nothing is required (required = 0). */
  coverageRatio: number | null;
};

/**
 * Compare a caller-supplied delivered flow against the NFA required flow. It
 * is a comparison, not a prediction: there is no extinguished or safe state
 * (docs/extinguishment-research.md §4).
 */
export function compareNfaFireFlow(
  input: NfaFireFlowInput,
  deliveredFlowGpm: number,
): NfaFireFlowComparison {
  const calculation = calculateNfaFireFlow(input);
  requireFiniteNonNegative(deliveredFlowGpm, "deliveredFlowGpm");
  const marginGpm = deliveredFlowGpm - calculation.requiredFlowGpm;
  const deficitGpm = Math.max(0, -marginGpm);
  const coverageRatio =
    calculation.requiredFlowGpm === 0 ? null : deliveredFlowGpm / calculation.requiredFlowGpm;
  requireFinite(marginGpm, "marginGpm");
  requireFinite(deficitGpm, "deficitGpm");
  if (coverageRatio !== null) requireFinite(coverageRatio, "coverageRatio");
  return { ...calculation, deliveredFlowGpm, marginGpm, deficitGpm, coverageRatio };
}
