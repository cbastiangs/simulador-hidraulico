import { parsePump, type PumpConfig } from "$hydraulics/pump.ts";
import { parseScenario, type Scenario, type ScenarioDischarge } from "$hydraulics/scenario.ts";
import { flattenSegments } from "$lib/branch-edit.ts";
import generic from "../../data/apparatus/generic.json";

export type Apparatus = {
  schema: "simulador-hidraulico/apparatus"; version: 1; id: string; name: string;
  outlets: { name: string; sizeIn: number }[];
  pump?: PumpConfig; tankCapacityGal?: number;
};
const KEY = "simulador.apparatus.v1";
const label = (s: unknown): s is string => typeof s === "string" && !!s.trim() && s.length <= 80;
export function parseApparatus(value: unknown): Apparatus {
  const p = value as Apparatus;
  if (!p || p.schema !== "simulador-hidraulico/apparatus" || p.version !== 1 || !label(p.id) || !label(p.name) ||
      !Array.isArray(p.outlets) || p.outlets.length < 1 || p.outlets.length > 8 ||
      p.outlets.some(o => !o || !label(o.name) || !Number.isFinite(o.sizeIn) || o.sizeIn <= 0) ||
      (p.tankCapacityGal !== undefined && (!Number.isFinite(p.tankCapacityGal) || p.tankCapacityGal <= 0))) {
    throw new Error("Revisa el nombre, las descargas y la capacidad: los valores deben ser positivos.");
  }
  return { schema: p.schema, version: 1, id: p.id, name: p.name.trim(),
    outlets: p.outlets.map(o => ({ name: o.name.trim(), sizeIn: o.sizeIn })),
    ...(p.pump === undefined ? {} : { pump: parsePump(p.pump) }),
    ...(p.tankCapacityGal === undefined ? {} : { tankCapacityGal: p.tankCapacityGal }) };
}
export const BUILTIN_APPARATUS = [parseApparatus(generic)];
export function readApparatus(): Apparatus[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error("Invalid apparatus library");
  const profiles = rows.map(parseApparatus);
  const ids = profiles.map(p => p.id);
  if (new Set(ids).size !== ids.length || ids.some(id => BUILTIN_APPARATUS.some(p => p.id === id))) throw new Error("Duplicate apparatus identity");
  return profiles;
}
export function writeApparatus(rows: Apparatus[]) {
  localStorage.setItem(KEY, JSON.stringify(rows.map(parseApparatus)));
}

/** Copy equipment, preserving connected branches and stable branch IDs by position. */
export function applyApparatus(scenario: Scenario, value: Apparatus): Scenario {
  const profile = parseApparatus(value);
  const used = new Set(flattenSegments(scenario).flatMap(e => e.path));
  const nextId = () => { let i = 1; while (used.has(`line-${i}`)) i++; const id = `line-${i}`; used.add(id); return id; };
  const existing: ScenarioDischarge[] = scenario.discharges ?? [{
    id: nextId(), name: "Descarga 1", open: true, outletSizeIn: 2.5,
    sections: scenario.sections, nozzle: scenario.nozzle, wye: scenario.wye, fittings: scenario.source.fittings,
  }];
  if (existing.slice(profile.outlets.length).some(o => o.sections.length || o.wye)) {
    throw new Error("Desconecta primero las líneas de las descargas que vas a quitar.");
  }
  const discharges = profile.outlets.map((outlet, i): ScenarioDischarge => ({
    ...(existing[i] ?? { id: nextId(), open: false, sections: [], nozzle: { ...scenario.nozzle, design: "open-end", open: true } }),
    name: outlet.name, outletSizeIn: outlet.sizeIn,
  }));
  return parseScenario({ ...scenario, apparatusName: profile.name, sections: [], wye: undefined, discharges,
    source: { ...scenario.source, outletSizeIn: undefined, fittings: undefined, pump: profile.pump,
      tank: profile.tankCapacityGal === undefined ? undefined : { capacityGal: profile.tankCapacityGal, remainingGal: profile.tankCapacityGal } } });
}
