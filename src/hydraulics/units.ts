/**
 * Unit conversions for the hydraulics module, and the only place they live.
 *
 * The engine works in the units the station uses: metres for length and
 * height, inches for diameters, psi, US gpm. Published constants are often
 * defined in feet (C per 100 ft, 0.434 psi/ft); each law converts its
 * constant once, where the law is defined, using these factors. Screens
 * convert to other display units (bar, L/min, ft) at their edge; nothing
 * else holds a conversion factor.
 *
 * Every factor below is exact by definition (NIST SP 811, Appendix B).
 */

/** The international foot (1959). */
export const METERS_PER_FOOT = 0.3048;

/** The international inch (1959). */
export const METERS_PER_INCH = 0.0254;

/** The US liquid gallon: 231 in³. */
export const LITERS_PER_US_GALLON = 3.785411784;

/** A cubic metre is 1000 litres by definition. */
export const LITERS_PER_CUBIC_METER = 1000;

/** A minute is 60 seconds by definition. */
export const SECONDS_PER_MINUTE = 60;

/** The international avoirdupois pound (1959): also kilograms-force per pound-force. */
export const KILOGRAMS_PER_POUND = 0.45359237;

/** One psi is one pound-force per square inch: 0.45359237 kg × 9.80665 m/s² over (0.0254 m)². */
export const PASCALS_PER_PSI = (KILOGRAMS_PER_POUND * 9.80665) / METERS_PER_INCH ** 2;

export const PASCALS_PER_BAR = 100_000;

/** Standard gravity, m/s² (CGPM 1901): the kilogram-force and the pound-force are defined by it. */
export const STANDARD_GRAVITY = 9.80665;

/**
 * The mechanical horsepower: 550 ft·lbf/s = 33 000 ft·lbf/min, in watts
 * (745.6999 W).
 */
export const WATTS_PER_HORSEPOWER = 550 * METERS_PER_FOOT * KILOGRAMS_PER_POUND * STANDARD_GRAVITY;

/**
 * gpm × psi per horsepower: Q·P/1714 (MODEL.md §3.8). One gallon is 231 in³,
 * so gpm × psi = 231 in·lbf/min = 231/12 ft·lbf/min; over 33 000 ft·lbf/min
 * per hp → 33 000 × 12 / 231 = 1714.29.
 */
export const GPM_PSI_PER_HORSEPOWER = (33_000 * 12) / 231;

export function metersToFeet(meters: number) {
  return meters / METERS_PER_FOOT;
}

export function feetToMeters(feet: number) {
  return feet * METERS_PER_FOOT;
}

export function barToPsi(bar: number) {
  return (bar * PASCALS_PER_BAR) / PASCALS_PER_PSI;
}

export function psiToBar(psi: number) {
  return (psi * PASCALS_PER_PSI) / PASCALS_PER_BAR;
}

export function litersPerMinuteToGpm(litersPerMinute: number) {
  return litersPerMinute / LITERS_PER_US_GALLON;
}

export function gpmToLitersPerMinute(gpm: number) {
  return gpm * LITERS_PER_US_GALLON;
}
