import type { Scenario } from "$hydraulics/scenario.ts";
import { leafPaths } from "./branch-edit.ts";

// A colour per line of a branched lay (UX.md §2, owner 2026-10-17): a dot
// beside its name and its gauges, like the coloured discharges of a pump panel.
// Hoses stay hose-red. The colour follows the line's place in outlet order, so
// it doesn't change with which line is being edited; past the last token the
// cycle repeats, and the name tells those lines apart.
const COUNT = 6;

/** The colour of the line at `index` in outlet order, as a CSS value. */
export const lineColor = (index: number) => `var(--line-${(index % COUNT) + 1})`;

/** The colour of a pump-to-nozzle path, or null for a path that isn't a line (a feed, a wye's inlet). */
export function leafColor(scenario: Scenario, path: readonly string[]): string | null {
  const key = path.join("/");
  const i = leafPaths(scenario).findIndex((p) => p.join("/") === key);
  return i < 0 ? null : lineColor(i);
}
