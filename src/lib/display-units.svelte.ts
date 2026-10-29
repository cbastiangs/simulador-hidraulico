import { psiToBar, barToPsi, gpmToLitersPerMinute, litersPerMinuteToGpm, metersToFeet, feetToMeters } from "$hydraulics/units.ts";

type Preferences = { pressure: "psi" | "bar"; flow: "gpm" | "L/min"; length: "m" | "ft" };
const KEY = "view.units.v1";
function stored(): Preferences {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { pressure: p?.pressure === "bar" ? "bar" : "psi", flow: p?.flow === "L/min" ? "L/min" : "gpm", length: p?.length === "ft" ? "ft" : "m" };
  } catch { return { pressure: "psi", flow: "gpm", length: "m" }; }
}
const prefs = $state(stored());
const status = $state({ error: "" });
const format = (n: number | null | undefined, convert: (n: number) => number, digits: number) =>
  n == null || !Number.isFinite(n) ? "—" : convert(n).toFixed(digits);

/** All inputs/outputs of the app's edit/solve boundary remain in station units. */
export const u = {
  get pressure() { return prefs.pressure; },
  get flow() { return prefs.flow; },
  get length() { return prefs.length; },
  get error() { return status.error; },
  set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    prefs[key] = value;
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); status.error = ""; }
    catch { status.error = "Las unidades cambiaron para esta visita, pero no se pudieron guardar en el navegador."; }
  },
  unit(unit: string) { return unit === "psi" ? prefs.pressure : unit === "gpm" ? prefs.flow : unit === "m" ? prefs.length : unit; },
  to(value: number, unit: string) {
    return unit === "psi" && prefs.pressure === "bar" ? psiToBar(value)
      : unit === "gpm" && prefs.flow === "L/min" ? gpmToLitersPerMinute(value)
      : unit === "m" && prefs.length === "ft" ? metersToFeet(value) : value;
  },
  from(value: number, unit: string) {
    return unit === "psi" && prefs.pressure === "bar" ? barToPsi(value)
      : unit === "gpm" && prefs.flow === "L/min" ? litersPerMinuteToGpm(value)
      : unit === "m" && prefs.length === "ft" ? feetToMeters(value) : value;
  },
  p(n: number | null | undefined, digits = 1): string { return format(n, v => u.to(v, "psi"), prefs.pressure === "bar" ? Math.max(2, digits) : digits); },
  q(n: number | null | undefined, digits = 1): string { return format(n, v => u.to(v, "gpm"), digits); },
  l(n: number | null | undefined, digits = 1): string { return format(n, v => u.to(v, "m"), prefs.length === "ft" ? Math.max(1, digits) : digits); },
};
