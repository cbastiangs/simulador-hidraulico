import type { Method } from "./references.ts";
import { KILOGRAMS_PER_POUND } from "./units.ts";

/**
 * What sits at the end of a line (MODEL.md §3.4b): its **design** decides the
 * rating's origin and the reaction; to the solver every one is a fixed
 * orifice (§3.3), Q = Qr·√(NP/NPr).
 *
 *   fog          rated by the manufacturer (Qr at NPr)
 *   smooth-bore  rated by its tip: Qr = 29.7·d²·√NPr (Freeman, §3.4)
 *   open-end     no nozzle: the coupling's bore, Q = 29.84·c·d²·√p (§3.4d)
 */
export type NozzleDesign = "fog" | "smooth-bore" | "open-end";

/** Freeman's constant as the Colorado DFPC chart prints it, gpm per in²·√psi (MODEL.md §3.4). */
export const FREEMAN_GPM = 29.7;
/** The outlet-discharge constant NFPA 291 uses, as printed by Temecula's fire-flow sheet [E16]. */
export const OUTLET_GPM = 29.84;
/**
 * Discharge coefficient of an open hose butt: NFPA 291's smooth, round
 * hydrant outlet, the closest published analogue. A modelling choice, to
 * verify (MODEL.md §3.4d, §9).
 */
export const OPEN_END_COEFFICIENT = 0.9;
/** The pressure an open end's reference point is taken at; not a rating (MODEL.md §3.4d). */
export const OPEN_END_REFERENCE_PSI = 50;

export function smoothBoreFlowGpm(tipIn: number, nozzlePressurePsi: number) {
  return FREEMAN_GPM * tipIn ** 2 * Math.sqrt(nozzlePressurePsi);
}

export function openEndFlowGpm(boreIn: number, pressurePsi: number, coefficient = OPEN_END_COEFFICIENT) {
  return OUTLET_GPM * coefficient * boreIn ** 2 * Math.sqrt(pressurePsi);
}

/** The nozzle data a design needs; `tipIn` is a smooth bore's tip. */
export type NozzleShape = { design?: NozzleDesign; tipIn?: number; ratedFlowGpm: number; ratedPressurePsi: number };

/**
 * The fixed-orifice rating the solver uses. A fog nozzle's is its own; a
 * smooth bore's comes from its tip at its rated pressure; an open end's is a
 * reference point on its coupling's bore (`boreIn`).
 */
export function ratingOf(nozzle: NozzleShape, boreIn: number): { ratedFlowGpm: number; ratedPressurePsi: number } {
  if (nozzle.design === "smooth-bore" && nozzle.tipIn)
    return { ratedFlowGpm: smoothBoreFlowGpm(nozzle.tipIn, nozzle.ratedPressurePsi), ratedPressurePsi: nozzle.ratedPressurePsi };
  if (nozzle.design === "open-end")
    return { ratedFlowGpm: openEndFlowGpm(boreIn, OPEN_END_REFERENCE_PSI), ratedPressurePsi: OPEN_END_REFERENCE_PSI };
  return { ratedFlowGpm: nozzle.ratedFlowGpm, ratedPressurePsi: nozzle.ratedPressurePsi };
}

/** One reaction, with the law's inputs in its own units so the screen can show the formula (MODEL.md §3.6, §7). */
export type Reaction =
  | { law: "smooth-bore"; inputs: { tipIn: number; nozzlePressurePsi: number }; lbf: number; kgf: number }
  | { law: "fog"; inputs: { flowGpm: number; nozzlePressurePsi: number }; lbf: number; kgf: number }
  | { law: "fog-kg-per-gpm"; inputs: { flowGpm: number; kgfPerGpm: number; atPsi: number }; lbf: number; kgf: number }
  | { law: "open-end"; inputs: { boreIn: number; coefficient: number; pressurePsi: number }; lbf: number; kgf: number };

const fromLbf = <T extends object>(lbf: number, rest: T) => ({ ...rest, lbf, kgf: lbf * KILOGRAMS_PER_POUND });
const fromKgf = <T extends object>(kgf: number, rest: T) => ({ ...rest, lbf: kgf / KILOGRAMS_PER_POUND, kgf });

/**
 * The force on the crew (MODEL.md §3.6) at the **solved** flow and nozzle
 * pressure, never the rating. The design picks the law; the method only the
 * fog row. A shut or dry line pushes nothing.
 */
export function reactionOf(nozzle: NozzleShape, boreIn: number, flowGpm: number, nozzlePressurePsi: number, method: Method): Reaction {
  const q = flowGpm > 0 ? flowGpm : 0;
  const np = q > 0 && nozzlePressurePsi > 0 ? nozzlePressurePsi : 0;
  if (nozzle.design === "smooth-bore" && nozzle.tipIn)
    return fromLbf(1.57 * nozzle.tipIn ** 2 * np, { law: "smooth-bore" as const, inputs: { tipIn: nozzle.tipIn, nozzlePressurePsi: np } });
  if (nozzle.design === "open-end")
    return fromLbf(1.57 * OPEN_END_COEFFICIENT * boreIn ** 2 * np, {
      law: "open-end" as const,
      inputs: { boreIn, coefficient: OPEN_END_COEFFICIENT, pressurePsi: np },
    });
  if (method.fogReaction)
    return fromKgf(method.fogReaction.kgfPerGpm * q, {
      law: "fog-kg-per-gpm" as const,
      inputs: { flowGpm: q, kgfPerGpm: method.fogReaction.kgfPerGpm, atPsi: method.fogReaction.atPsi },
    });
  return fromLbf(0.0505 * q * Math.sqrt(np), { law: "fog" as const, inputs: { flowGpm: q, nozzlePressurePsi: np } });
}
