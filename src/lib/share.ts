import { parseScenario, ScenarioError, type Scenario } from "$hydraulics/scenario.ts";

/**
 * Copy, paste and share links (ROADMAP §10e item 2, UX.md §4 "One Escenario
 * menu"). The scenario document is the only thing that travels: the lay,
 * its method, floor height and fittings mode, never the viewer's Vista
 * settings (owner, 2026-10-18). Whatever comes in passes `parseScenario`,
 * the same gate as the presets.
 *
 * A link carries the document in the URL's fragment, so it never reaches a
 * server and works offline: `#e=` deflate-raw then base64url (short enough
 * for a chat message), or `#j=` plain base64url JSON where the browser has
 * no CompressionStream.
 */

export const toText = (scenario: Scenario) => JSON.stringify(scenario, null, 2);

const toBase64Url = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = (text: string) => {
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/** The fragment that rebuilds this scenario, without the "#". */
export async function fragmentOf(scenario: Scenario): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(scenario));
  if (typeof CompressionStream === "undefined") return `j=${toBase64Url(json)}`;
  return `e=${toBase64Url(await pipe(json, new CompressionStream("deflate-raw")))}`;
}

export async function linkOf(scenario: Scenario, base: string): Promise<string> {
  return `${base.split("#")[0]}#${await fragmentOf(scenario)}`;
}

/** Why a pasted text or a link can't be opened, for the person. */
export class ShareError extends Error {}

/** The scenario in a link's fragment ("#e=…", "#j=…"), or null when the fragment carries none. */
export async function fromFragment(fragment: string): Promise<Scenario | null> {
  const m = /(?:^#?|&)([ej])=([A-Za-z0-9_-]+)/.exec(fragment);
  if (!m) return null;
  let json: string;
  try {
    const bytes = fromBase64Url(m[2]);
    if (m[1] === "e" && typeof DecompressionStream === "undefined") throw new ShareError("Este navegador no puede abrir enlaces comprimidos.");
    json = new TextDecoder().decode(m[1] === "e" ? await pipe(bytes, new DecompressionStream("deflate-raw")) : bytes);
  } catch (error) {
    if (error instanceof ShareError) throw error;
    throw new ShareError("El enlace está incompleto o dañado.");
  }
  return fromJson(json);
}

function fromJson(json: string): Scenario {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new ShareError("No es un escenario: el texto no es JSON válido.");
  }
  try {
    return parseScenario(value);
  } catch (error) {
    // The parser's wording is the engine's (English); the person gets the field it stopped at.
    if (error instanceof ScenarioError) {
      throw new ShareError(error.path === "schema" ? "No es un escenario del simulador." : `El escenario no es válido: revisa «${error.path}».`);
    }
    throw error;
  }
}

/** A pasted text: the scenario's JSON, or a link to one. */
export async function fromText(text: string): Promise<Scenario> {
  const t = text.trim();
  if (!t) throw new ShareError("No hay nada que pegar.");
  if (t.startsWith("{")) return fromJson(t);
  const hash = t.indexOf("#");
  const scenario = hash >= 0 ? await fromFragment(t.slice(hash)) : null;
  if (!scenario) throw new ShareError("No es un escenario: pega el texto copiado o un enlace del simulador.");
  return scenario;
}
