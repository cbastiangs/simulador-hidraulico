import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

// AGENTS.md: src/hydraulics/ imports only its own files, so it can become a
// package (or run in any host) unchanged. fd-app enforced this with ESLint;
// this repo has no linter, so the rule lives here.

const ENGINE = new URL("../src/hydraulics/", import.meta.url);
const EXTINGUISHMENT = new URL("../src/extinguishment/", import.meta.url);
const SPECIFIER = /\b(?:import|export)\b[^'"]*?\bfrom\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm;

test("the engine imports only sibling files inside src/hydraulics/", async () => {
  const files = (await readdir(ENGINE)).filter((name) => name.endsWith(".ts"));
  assert.ok(files.length > 0, "no engine files found");
  for (const name of files) {
    const source = await readFile(new URL(name, ENGINE), "utf8");
    for (const match of source.matchAll(SPECIFIER)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      assert.match(
        specifier,
        /^\.\/[\w.-]+\.ts$/,
        `${name} imports "${specifier}"; the engine may import only ./<file>.ts`,
      );
    }
  }
});

// AGENTS.md: src/extinguishment/ is its own folder, never imported by the
// hydraulics, and it imports the app's nothing. It may use its own siblings
// and the one conversion table the engine keeps (hydraulics/units.ts); it
// never reaches into another hydraulics file.
test("the extinguishment module imports only its siblings or ../hydraulics/units.ts", async () => {
  const files = (await readdir(EXTINGUISHMENT)).filter((name) => name.endsWith(".ts"));
  assert.ok(files.length > 0, "no extinguishment files found");
  for (const name of files) {
    const source = await readFile(new URL(name, EXTINGUISHMENT), "utf8");
    for (const match of source.matchAll(SPECIFIER)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      assert.match(
        specifier,
        /^(?:\.\/[\w.-]+\.ts|\.\.\/hydraulics\/units\.ts)$/,
        `${name} imports "${specifier}"; the extinguishment module may import only ./<file>.ts or ../hydraulics/units.ts`,
      );
    }
  }
});
