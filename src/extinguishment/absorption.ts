import {
  LITERS_PER_CUBIC_METER,
  LITERS_PER_US_GALLON,
  SECONDS_PER_MINUTE,
} from "../hydraulics/units.ts";
import {
  ABSORPTION_REFERENCE,
  WATER_REFERENCE,
  type SourceId,
} from "./references.ts";

/**
 * The extinguishment heat reference (docs/MODEL.md §3.12,
 * docs/extinguishment-research.md), `extinguish.absorption`: the heat needed
 * to take liquid water at 20 °C to vapor at 100 °C, both at 101.325 kPa
 * absolute. It is a full-vaporization reference capacity, not measured
 * effectiveness.
 *
 * `compareHeatReference` accepts only an explicitly declared `etaHeat`; there
 * is no default, including no implicit 1. Its outputs compare two declared
 * power numbers. Equality is not an extinction criterion, and the module
 * exposes no residual HRR, safe state or time to knockdown.
 */

export type AssumedEtaHeat = {
  /** Fraction of the full-vaporization reference, 0–1. */
  value: number;
  basis: "assumed";
  /** Why this scenario uses this value; required, never inferred. */
  rationale: string;
};

export type SourcedEtaHeat = {
  /** Fraction of the full-vaporization reference, 0–1. */
  value: number;
  basis: "sourced";
  /** The source whose measured quantity and applicability match. */
  sourceUrl: string;
  /** Page, table or section locating the value. */
  locator: string;
  /** Why that measurement applies to this target, interval and water state. */
  applicability: string;
};

export type EtaHeat = AssumedEtaHeat | SourcedEtaHeat;

export type HeatReferenceInput = {
  /** Aggregate solved nozzle flow applied to the fire, US gpm. */
  deliveredAppliedFlowGpm: number;
  /** The reference fire's measured peak HRR, kW. */
  referenceHrrKw: number;
  /** Explicit effectiveness with provenance; there is no default. */
  etaHeat: EtaHeat;
};

export type HeatReferenceComparison = {
  lawId: "extinguish.absorption";
  classification: "physical";
  sourceId: SourceId;
  /** Q × 163.2099… kW/US gpm at the declared endpoints. */
  referenceCapacityKw: number;
  /** referenceCapacityKw × etaHeat.value. */
  adjustedCapacityKw: number;
  referenceHrrKw: number;
  /** adjustedCapacityKw − referenceHrrKw; negative means below the reference. */
  signedPowerDifferenceKw: number;
  /** adjustedCapacityKw / referenceHrrKw; a ratio of powers, not an outcome. */
  thermalRatio: number;
  /** The supplied provenance, preserved in the result. */
  etaHeat: EtaHeat;
};

const KILOGRAMS_PER_SECOND_PER_GPM =
  (WATER_REFERENCE.densityKgPerM3 * LITERS_PER_US_GALLON) /
  (LITERS_PER_CUBIC_METER * SECONDS_PER_MINUTE);

/**
 * Full-vaporization reference capacity for the declared endpoints: 2591.5757
 * kJ/kg × 0.0629770883 kg/s per US gpm.
 */
export const REFERENCE_COOLING_KW_PER_GPM =
  WATER_REFERENCE.enthalpyKjPerKg * KILOGRAMS_PER_SECOND_PER_GPM;

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

function requireFinitePositive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number > 0, got ${value}`);
  }
}

function requireText(value: string, name: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new RangeError(`${name} must be a non-empty string`);
  }
}

function requireEtaHeat(etaHeat: EtaHeat) {
  if (!Number.isFinite(etaHeat?.value) || etaHeat.value < 0 || etaHeat.value > 1) {
    throw new RangeError(
      `etaHeat.value must be a finite number in [0, 1], got ${etaHeat?.value}`,
    );
  }
  if (etaHeat.basis === "assumed") {
    requireText(etaHeat.rationale, "etaHeat.rationale");
  } else if (etaHeat.basis === "sourced") {
    requireText(etaHeat.sourceUrl, "etaHeat.sourceUrl");
    requireText(etaHeat.locator, "etaHeat.locator");
    requireText(etaHeat.applicability, "etaHeat.applicability");
  } else {
    throw new RangeError('etaHeat.basis must be "assumed" or "sourced"');
  }
}

/**
 * Full-vaporization cooling capacity of the applied flow, in kW. This is the
 * ideal reference; it applies no effectiveness factor and has no default.
 */
export function referenceCoolingCapacityKw(deliveredAppliedFlowGpm: number): number {
  requireFiniteNonNegative(deliveredAppliedFlowGpm, "deliveredAppliedFlowGpm");
  const capacityKw = deliveredAppliedFlowGpm * REFERENCE_COOLING_KW_PER_GPM;
  requireFinite(capacityKw, "referenceCapacityKw");
  return capacityKw;
}

/**
 * Compare an explicitly adjusted reference capacity with a measured peak HRR.
 * The caller supplies the applied flow, the reference HRR and an η with
 * provenance; a missing, out-of-range or undocumented η is rejected.
 */
export function compareHeatReference({
  deliveredAppliedFlowGpm,
  referenceHrrKw,
  etaHeat,
}: HeatReferenceInput): HeatReferenceComparison {
  const referenceCapacityKw = referenceCoolingCapacityKw(deliveredAppliedFlowGpm);
  requireFinitePositive(referenceHrrKw, "referenceHrrKw");
  requireEtaHeat(etaHeat);
  const adjustedCapacityKw = referenceCapacityKw * etaHeat.value;
  const signedPowerDifferenceKw = adjustedCapacityKw - referenceHrrKw;
  const thermalRatio = adjustedCapacityKw / referenceHrrKw;
  requireFinite(adjustedCapacityKw, "adjustedCapacityKw");
  requireFinite(signedPowerDifferenceKw, "signedPowerDifferenceKw");
  requireFinite(thermalRatio, "thermalRatio");
  return {
    lawId: ABSORPTION_REFERENCE.lawId,
    classification: ABSORPTION_REFERENCE.classification,
    sourceId: ABSORPTION_REFERENCE.sourceId,
    referenceCapacityKw,
    adjustedCapacityKw,
    referenceHrrKw,
    signedPowerDifferenceKw,
    thermalRatio,
    etaHeat,
  };
}
