import { parseDocument, portableDocument, type AppDocument } from "$lib/document.ts";

const WORKING = "simulador.working.v1";
const LIBRARY = "simulador.library.v1";
export type SavedLay = { id: string; name: string; updatedAt: string; scenario: AppDocument };

/** Parse all persisted documents at the boundary, just like shared links. */
export function workingLay(): AppDocument | null {
  const text = localStorage.getItem(WORKING);
  return text ? parseDocument(JSON.parse(text)) : null;
}
export function saveWorking(scenario: AppDocument) {
  localStorage.setItem(WORKING, JSON.stringify(portableDocument(parseDocument(scenario))));
}
export function readLibrary(): SavedLay[] {
  const text = localStorage.getItem(LIBRARY);
  if (!text) return [];
  const rows = JSON.parse(text);
  if (!Array.isArray(rows)) throw new Error("Invalid local library");
  return rows.map(row => {
    if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.updatedAt !== "string") throw new Error("Invalid saved lay");
    return { id: row.id, name: row.name, updatedAt: row.updatedAt, scenario: parseDocument(row.scenario) };
  });
}
export function writeLibrary(rows: SavedLay[]) { localStorage.setItem(LIBRARY, JSON.stringify(rows)); }
export function downloadScenario(scenario: AppDocument) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(portableDocument(scenario), null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${scenario.scenario.name.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 80) || "escenario"}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
