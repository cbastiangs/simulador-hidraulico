// scripts/lib/release.mjs
// Pure helpers and file operations behind `pnpm release`. Ported from
// fd-app's release workflow (same catalog shape and calendar ids) without its
// account and audience parts. UX.md §8.6 says how the app shows the catalog.
//
// A Release is:
//   { id, date, published_at, items: [{ kind, text, href? }] }
// id is padded YYYY.MM.DD (or ".N", N >= 2, for a second release that day),
// date is YYYY-MM-DD, published_at is an ISO UTC string or null (null = draft,
// never shown in the app).

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const RELEASES_PATH = "data/releases.json";
export const PACKAGE_PATH = "package.json";

const ID_RE = /^(\d{4})\.(\d{2})\.(\d{2})(?:\.(\d+))?$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const KINDS = new Set(["new", "fix"]);

export function todayUtc(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/** Padded id + calendar validation; the repeat suffix is an integer >= 2. */
export function parseReleaseId(id) {
  if (typeof id !== "string") throw new Error(`Release id must be a string, got ${typeof id}.`);
  const match = ID_RE.exec(id);
  if (!match) throw new Error(`Release id "${id}" must be YYYY.MM.DD or YYYY.MM.DD.N.`);
  const [, y, mo, d, suffix] = match;
  const year = Number(y), month = Number(mo), day = Number(d);
  const asDate = new Date(Date.UTC(year, month - 1, day));
  if (asDate.getUTCFullYear() !== year || asDate.getUTCMonth() !== month - 1 || asDate.getUTCDate() !== day) {
    throw new Error(`Release id "${id}" is not a real calendar date.`);
  }
  const repeat = suffix === undefined ? 1 : Number(suffix);
  if (suffix !== undefined && (suffix.startsWith("0") || !Number.isSafeInteger(repeat) || repeat < 2)) {
    throw new Error(`Release id "${id}" repeat suffix must be an integer >= 2 without leading zeros.`);
  }
  return { id, date: `${y}-${mo}-${d}`, year, month, day, repeat };
}

/** Orders ids by date, then repeat: "2026.10.10" > "2026.10.2", "2026.10.2.2" > "2026.10.2". */
export function compareIds(a, b) {
  const x = parseReleaseId(a), y = parseReleaseId(b);
  return x.year - y.year || x.month - y.month || x.day - y.day || x.repeat - y.repeat;
}

export function releaseIdForDate(date, repeat = 1) {
  const match = DATE_RE.exec(date);
  if (!match) throw new Error(`Release date "${date}" must be YYYY-MM-DD.`);
  const base = `${match[1]}.${match[2]}.${match[3]}`;
  return repeat > 1 ? `${base}.${repeat}` : base;
}

/** The next id for a date: bare on the first release that day, ".N" after. */
export function nextReleaseId(catalog, date) {
  const sameDay = catalog.filter((release) => release.date === date);
  if (sameDay.length === 0) return releaseIdForDate(date, 1);
  return releaseIdForDate(date, Math.max(...sameDay.map((release) => parseReleaseId(release.id).repeat)) + 1);
}

/** First release that day -> unpadded YYYY.M.D; a repeat -> +release.N (SemVer build metadata). */
export function packageVersionFor(id) {
  const { year, month, day, repeat } = parseReleaseId(id);
  const base = `${year}.${month}.${day}`;
  return repeat > 1 ? `${base}+release.${repeat}` : base;
}

export function validateItem(item, where = "item") {
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`${where}: must be an object.`);
  if (!KINDS.has(item.kind)) throw new Error(`${where}: kind must be "new" or "fix".`);
  if (typeof item.text !== "string" || item.text.trim() === "") throw new Error(`${where}: text must be a non-empty string.`);
  if (/[\r\n]/.test(item.text)) throw new Error(`${where}: text must be a single line.`);
  if (item.href !== undefined) {
    if (typeof item.href !== "string" || !item.href.startsWith("/") || item.href.startsWith("//") || /[\s\\\0-\x1f]/.test(item.href)) {
      throw new Error(`${where}: href must be an internal path starting with a single "/", without spaces.`);
    }
  }
  const extra = Object.keys(item).filter((key) => !["kind", "text", "href"].includes(key));
  if (extra.length > 0) throw new Error(`${where}: unknown field ${extra.join(", ")}.`);
  return item;
}

export function validateRelease(release, where = "release") {
  if (!release || typeof release !== "object" || Array.isArray(release)) throw new Error(`${where}: must be an object.`);
  const parsed = parseReleaseId(release.id);
  if (release.date !== parsed.date) throw new Error(`${where} ${release.id}: date must be ${parsed.date}.`);
  if (release.published_at !== null &&
      (typeof release.published_at !== "string" || !release.published_at.endsWith("Z") || Number.isNaN(Date.parse(release.published_at)))) {
    throw new Error(`${where} ${release.id}: published_at must be an ISO UTC string or null.`);
  }
  if (!Array.isArray(release.items)) throw new Error(`${where} ${release.id}: items must be an array.`);
  release.items.forEach((item, i) => validateItem(item, `${where} ${release.id} item ${i}`));
  return release;
}

export function validateCatalog(catalog) {
  if (!Array.isArray(catalog)) throw new Error(`${RELEASES_PATH}: must be a JSON array.`);
  const seen = new Set();
  let drafts = 0;
  for (const release of catalog) {
    validateRelease(release);
    if (seen.has(release.id)) throw new Error(`${RELEASES_PATH}: duplicate release id ${release.id}.`);
    seen.add(release.id);
    if (release.published_at === null) drafts += 1;
  }
  if (drafts > 1) throw new Error(`${RELEASES_PATH}: at most one draft (published_at null) is allowed.`);
  return catalog;
}

export function readCatalog(root) {
  const raw = readFileSync(join(root, RELEASES_PATH), "utf8");
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (error) { throw new Error(`${RELEASES_PATH}: invalid JSON: ${error.message}`); }
  return validateCatalog(parsed);
}

export function writeCatalog(root, catalog) {
  writeFileSync(join(root, RELEASES_PATH), JSON.stringify(catalog, null, 2) + "\n");
}

export function readPackage(root) {
  return JSON.parse(readFileSync(join(root, PACKAGE_PATH), "utf8"));
}

/** Splits `git log -z --format=%H%n%s%n%b` output on NUL; bodies may span lines. */
export function parseCommitLog(raw) {
  return raw
    .split("\0")
    .map((chunk) => chunk.replace(/^\n+|\n+$/g, ""))
    .filter((chunk) => chunk !== "")
    .map((chunk) => {
      const [hash, subject = "", ...body] = chunk.split("\n");
      return { hash, subject, body: body.join("\n") };
    });
}

export function conventionalType(subject) {
  const match = /^([a-zA-Z]+)(?:\([^)]*\))?!?:/.exec(subject ?? "");
  return match ? match[1].toLowerCase() : null;
}

/** `Novedad:` lines in a commit body: the only source of user-facing notes. */
export function novedadLines(body) {
  const lines = [];
  for (const line of (body ?? "").split("\n")) {
    const match = /^\s*Novedad:\s*(.+?)\s*$/.exec(line);
    if (match) lines.push(match[1]);
  }
  return lines;
}

/** feat -> new, fix -> fix; other commit types never produce a note. */
export function notesFromCommits(commits) {
  const notes = [];
  for (const commit of commits) {
    const type = conventionalType(commit.subject);
    const kind = type === "feat" ? "new" : type === "fix" ? "fix" : null;
    if (!kind) continue;
    for (const text of novedadLines(commit.body)) {
      notes.push(validateItem({ kind, text }, `Novedad in ${commit.hash.slice(0, 7)}`));
    }
  }
  return notes;
}

/** feat/fix commits in range that carry no `Novedad:` line: possible missing copy. */
export function commitsWithoutNotes(commits) {
  return commits
    .filter((commit) => ["feat", "fix"].includes(conventionalType(commit.subject)) && novedadLines(commit.body).length === 0)
    .map((commit) => ({ hash: commit.hash.slice(0, 7), subject: commit.subject }));
}

/** `Novedad:` lines on types that never produce a note: a workflow slip, not copy. */
export function commitsWithStrayNotes(commits) {
  return commits
    .filter((commit) => !["feat", "fix"].includes(conventionalType(commit.subject)) && novedadLines(commit.body).length > 0)
    .map((commit) => ({ hash: commit.hash.slice(0, 7), subject: commit.subject, notes: novedadLines(commit.body).length }));
}

/**
 * Creates the draft from the commits since the last release. An existing
 * draft is never rewritten (hand edits survive); instead the result lists
 * the notes in range that the draft does not contain yet, for the person to
 * copy in.
 */
export function prepare(root, { commits = [], date = todayUtc() } = {}) {
  const catalog = readCatalog(root);
  const notes = notesFromCommits(commits);
  const existing = catalog.find((release) => release.published_at === null);
  if (existing) {
    const texts = new Set(existing.items.map((item) => item.text));
    return {
      action: "existing-draft",
      release: existing,
      missing: notes.filter((note) => !texts.has(note.text)),
      uncovered: commitsWithoutNotes(commits),
      stray: commitsWithStrayNotes(commits),
    };
  }
  const release = { id: nextReleaseId(catalog, date), date, published_at: null, items: notes };
  const next = [...catalog, release];
  validateCatalog(next);
  writeCatalog(root, next);
  return {
    action: "created-draft",
    release,
    missing: [],
    uncovered: commitsWithoutNotes(commits),
    stray: commitsWithStrayNotes(commits),
  };
}

/**
 * Validates everything, then stamps the draft and sets package.json's version.
 * The catalog is written last: if the package write fails, nothing is published.
 */
export function publish(root, { now = new Date() } = {}) {
  const catalog = readCatalog(root);
  const draft = catalog.find((release) => release.published_at === null);
  if (!draft) throw new Error("No draft to publish. Run `pnpm release --draft` first.");
  if (draft.items.length === 0) throw new Error(`Draft ${draft.id} has no notes. Add at least one item before publishing.`);
  const newest = catalog.filter((release) => release !== draft).map((release) => release.id).sort(compareIds).at(-1);
  if (newest && compareIds(draft.id, newest) <= 0) throw new Error(`Draft ${draft.id} is not newer than published ${newest}.`);

  const published = { ...draft, published_at: now.toISOString() };
  const next = catalog.map((release) => (release === draft ? published : release));
  validateCatalog(next);

  const version = packageVersionFor(published.id);
  const pkg = readPackage(root);
  writeFileSync(join(root, PACKAGE_PATH), JSON.stringify({ ...pkg, version }, null, 2) + "\n");
  writeCatalog(root, next);

  return {
    release: published,
    version,
    stale: draft.date !== todayUtc(now),
    commands: [
      `git add ${RELEASES_PATH} ${PACKAGE_PATH}`,
      `git commit -m "chore(release): publish ${published.id}"`,
      `git tag v${published.id} HEAD   # right after that commit, on it`,
    ],
  };
}
