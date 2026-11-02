import catalog from "../../data/releases.json";

// Novedades (UX.md §8.6): what changed for the user, from the catalog that
// `pnpm release` maintains. Drafts (published_at null) are never shown.
// Whether a person has read them lives in this browser only.

export type ReleaseItem = { kind: "new" | "fix"; text: string; href?: string };
export type Release = { id: string; date: string; published_at: string | null; items: ReleaseItem[] };

const SEEN = "novedades.seen.v1";
/** At most this many releases open by themselves after an update; the rest are in the full list. */
export const SUMMARY_LIMIT = 3;

/** [year, month, day, repeat] for a calendar id; a numeric order, so 2026.10.10 > 2026.10.2. */
function parts(id: string): number[] {
  const [y, m, d, r] = id.split(".").map(Number);
  return [y, m, d, r ?? 1];
}
export function compareIds(a: string, b: string): number {
  const x = parts(a), y = parts(b);
  for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

/** Published releases, newest first. */
export const releases: Release[] = (catalog as Release[])
  .filter((r) => r.published_at !== null && r.items.length > 0)
  .sort((a, b) => compareIds(b.id, a.id));

/** The version this build announces, or null before the first release. */
export const currentVersion: string | null = releases[0]?.id ?? null;

function readSeen(): string | null {
  try { return localStorage.getItem(SEEN); } catch { return null; }
}

/** Records every published release as read. A failed write only means they may show again. */
export function markSeen() {
  if (!currentVersion) return;
  try { localStorage.setItem(SEEN, currentVersion); } catch { /* shown again next time */ }
}

/**
 * The releases to show on opening, newest first (at most SUMMARY_LIMIT).
 * `firstVisit` (no tour seen yet) marks everything read instead: a new user
 * meets the app as it is, not its history.
 */
export function unreadOnOpen(firstVisit: boolean): Release[] {
  if (!currentVersion) return [];
  if (firstVisit) { markSeen(); return []; }
  const seen = readSeen();
  return releases.filter((r) => seen === null || compareIds(r.id, seen) > 0).slice(0, SUMMARY_LIMIT);
}

/** "2 nov 2026": the release's calendar date, read as a date (no time zone shift). */
export function releaseDate(r: Release): string {
  const [y, m, d] = r.date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}
