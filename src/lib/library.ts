import { parseScenario, type Scenario } from "$hydraulics/scenario.ts";

const WORKING = "simulador.working.v1";
const LIBRARY = "simulador.library.v1";
export type SavedLay = { id: string; name: string; updatedAt: string; scenario: Scenario };

/** Parse all persisted documents at the boundary, just like shared links. */
export function workingLay(): Scenario | null {
  const text = localStorage.getItem(WORKING);
  return text ? parseScenario(JSON.parse(text)) : null;
}
export function saveWorking(scenario: Scenario) {
  localStorage.setItem(WORKING, JSON.stringify(parseScenario(scenario)));
}
export function readLibrary(): SavedLay[] {
  const text = localStorage.getItem(LIBRARY);
  if (!text) return [];
  const rows = JSON.parse(text);
  if (!Array.isArray(rows)) throw new Error("Invalid local library");
  return rows.map(row => {
    if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.updatedAt !== "string") throw new Error("Invalid saved lay");
    return { id: row.id, name: row.name, updatedAt: row.updatedAt, scenario: parseScenario(row.scenario) };
  });
}
export function writeLibrary(rows: SavedLay[]) { localStorage.setItem(LIBRARY, JSON.stringify(rows)); }
export function downloadScenario(scenario: Scenario) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(scenario, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${scenario.name.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 80) || "escenario"}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
