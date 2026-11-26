// scripts/release.mjs
// `pnpm release` — preview, draft or publish the app's novedades
// (data/releases.json). It never runs git add/commit/tag/push and never
// deploys: it prints the git commands for you to run.

import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compareIds, nextReleaseId, packageVersionFor, parseCommitLog, prepare, publish, readCatalog, readPackage, todayUtc } from "./lib/release.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function git(gitArgs) {
  return execFileSync("git", gitArgs, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

/**
 * Commits since the newest release tag (v<id>, by id, not by graph distance).
 * Before the first release there is no tag and the whole history is read;
 * older commits carry no `Novedad:` lines, so nothing old is announced.
 */
function loadCommits() {
  if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
    throw new Error("Shallow git history: run `git fetch --unshallow` first.");
  }
  const ids = git(["tag", "--list", "v*"]).split("\n").map((t) => t.trim().slice(1)).filter((id) => {
    try { compareIds(id, id); return true; } catch { return false; }
  });
  const base = ids.sort(compareIds).at(-1);
  const range = base ? [`v${base}..HEAD`] : ["HEAD"];
  return { base: base ? `v${base}` : "(no release tag yet: whole history)", commits: parseCommitLog(git(["log", "-z", "--format=%H%n%s%n%b", ...range])) };
}

function printItems(items) {
  for (const item of items) console.log(`    [${item.kind}] ${item.text}${item.href ? ` -> ${item.href}` : ""}`);
}

function printUncovered(uncovered) {
  if (uncovered.length === 0) return;
  console.log(`  ${uncovered.length} feat/fix commit(s) without a \`Novedad:\` line (fine if users won't notice them):`);
  for (const c of uncovered) console.log(`    ${c.hash} ${c.subject}`);
}

function printStray(stray) {
  if (stray.length === 0) return;
  console.log(`  ${stray.length} non-feat/fix commit(s) carry \`Novedad:\` lines and are ignored by the catalog:`);
  for (const c of stray) console.log(`    ${c.hash} ${c.subject} (${c.notes} line(s))`);
}

function doPreview() {
  const catalog = readCatalog(root);
  console.log("Novedades — data/releases.json");
  console.log(`  package.json version: ${readPackage(root).version}`);
  if (catalog.length === 0) console.log("  (no releases yet)");
  for (const release of catalog) {
    console.log(`  ${release.id}  ${release.published_at === null ? "DRAFT" : `published ${release.published_at}`}  ${release.items.length} note(s)`);
  }
  const draft = catalog.find((release) => release.published_at === null);
  if (draft) printItems(draft.items);
  else {
    const id = nextReleaseId(catalog, todayUtc());
    console.log(`  Next draft would be ${id} (package version ${packageVersionFor(id)}).`);
  }
  console.log("\nCommands:");
  console.log("  pnpm release            preview (read-only)");
  console.log("  pnpm release --draft    draft from `Novedad:` lines; on an existing draft, report what it lacks");
  console.log("  pnpm release --publish  validate and stamp the draft, set package.json's version");
}

function doDraft() {
  const { base, commits } = loadCommits();
  const result = prepare(root, { commits });
  console.log(`Base ${base}: scanned ${commits.length} commit(s).`);
  if (result.action === "existing-draft") {
    console.log(`Draft ${result.release.id} already exists; it was not changed.`);
    printItems(result.release.items);
    if (result.missing.length > 0) {
      console.log(`  ${result.missing.length} \`Novedad:\` line(s) in range are not in the draft; copy in the ones that belong:`);
      printItems(result.missing);
    }
  } else {
    console.log(`Created draft ${result.release.id} with ${result.release.items.length} note(s):`);
    printItems(result.release.items);
  }
  printUncovered(result.uncovered);
  printStray(result.stray);
  console.log("Edit data/releases.json for wording and order, then run `pnpm release --publish`.");
}

function doPublish() {
  const result = publish(root);
  console.log(`Published ${result.release.id} at ${result.release.published_at}; package.json version -> ${result.version}.`);
  if (result.stale) console.log(`  Note: the draft is dated ${result.release.date}, not today.`);
  console.log("Nothing was committed. Run:");
  for (const command of result.commands) console.log(`  ${command}`);
  console.log("Users see the notes once the new build is deployed and their app updates.");
}

const KNOWN = new Set(["--draft", "--publish", "--help", "-h"]);
try {
  const unknown = args.filter((arg) => !KNOWN.has(arg));
  if (unknown.length > 0) throw new Error(`Unknown option ${unknown.join(", ")}. See \`pnpm release --help\`.`);
  if (args.includes("--draft") && args.includes("--publish")) throw new Error("Use --draft or --publish, not both.");
  if (args.includes("--publish")) doPublish();
  else if (args.includes("--draft")) doDraft();
  else doPreview();
} catch (error) {
  console.error(`release: ${error.message}`);
  process.exit(1);
}
