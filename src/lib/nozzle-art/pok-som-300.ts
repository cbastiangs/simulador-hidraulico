import type { NozzleArt } from "./types.ts";

/**
 * POK Slide-O-Matic 300 (POK-SOM-300), from the refs2 photo set (pok-som-0/1/2):
 * the same slide-valve combination nozzle as the 150, but on a 2½ in swivel and
 * rated to 300 gpm — visibly larger throughout. Steel swivel inlet, a slide
 * shutoff whose handle carries the 20/40/60/80/100% flow index, a yellow 50/100
 * psi selection band, and a ribbed orange pattern collar/bumper. No grip, no
 * teeth. True scale: 14 units = 1 inch, so the 2½ in inlet is 35 units tall.
 */


/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -5 -7 L -24 -7 Q -29 -7 -29 -2 L -29 2 Q -29 7 -24 7 L -5 7 Z M -7 -2.4 L -7 2.4 L -24.5 2.4 L -24.5 -2.4 Z";
const HUB = "M -5 -5 Q -5 -7 -3 -7 L 3 -7 Q 5 -7 5 -5 L 5 5 Q 5 7 3 7 L -3 7 Q -5 7 -5 5 Z";

export default {
  side: {
    length: 62,
    exit: { x: 62, half: 3.5 },
    flowLabel: { x: 35, y: -23.3 },
    shell: [
      // Steel swivel face, then the black inlet body.
      { role: "steel", d: "M 0 -12.25 L 3 -12.25 L 3 12.25 L 0 12.25 Z" },
      { role: "dark", d: "M 2.5 -12.89 Q 2.5 -13.65 3.5 -13.65 L 8 -13.65 Q 9 -13.65 9 -12.89 L 9 12.89 Q 9 13.65 8 13.65 L 3.5 13.65 Q 2.5 13.65 2.5 12.89 Z" },
      // Main body, with its flow index ticks on top.
      { role: "dark", d: "M 8 -13.59 Q 8 -14.35 9 -14.35 L 25 -14.35 L 25 14.35 L 9 14.35 Q 8 14.35 8 13.59 Z" },
      { role: "steel", d: "M 8 -19.5 L 24 -19.5 L 24 -17.5 L 8 -17.5 Z", opacity: 0.35 },
      { role: "label", d: "M 9 -22 L 10.5 -22 L 10.5 -18.5 L 9 -18.5 Z" },
      { role: "label", d: "M 12.75 -22 L 14.25 -22 L 14.25 -18.5 L 12.75 -18.5 Z" },
      { role: "label", d: "M 16.5 -22 L 18 -22 L 18 -18.5 L 16.5 -18.5 Z" },
      { role: "label", d: "M 20.25 -22 L 21.75 -22 L 21.75 -18.5 L 20.25 -18.5 Z" },
      { role: "label", d: "M 24 -22 L 25.5 -22 L 25.5 -18.5 L 24 -18.5 Z" },
      // Yellow 50/100 psi band, the black neck, then the ribbed orange collar.
      { role: "yellow", d: "M 25 -14 L 48 -14 L 48 14 L 25 14 Z" },
      { role: "dark", d: "M 47 -12.95 L 50 -12.95 L 50 12.95 L 47 12.95 Z" },
      { role: "orange", d: "M 49 -19.28 Q 49 -20.3 50 -20.3 L 59 -20.3 Q 62 -20.3 62 -15.22 L 62 15.22 Q 62 20.3 59 20.3 L 50 20.3 Q 49 20.3 49 19.28 Z" },
      // Dark front face and its steel tip ring.
      { role: "dark", d: "M 58 -18.95 Q 58 -20.3 59 -20.3 L 62 -20.3 L 62 20.3 L 59 20.3 Q 58 20.3 58 18.95 Z" },
      { role: "steel", d: "M 60 -20.3 L 62 -20.3 L 62 20.3 L 60 20.3 Z" },
      { role: "dark", d: HUB, t: "translate(16 -17)" },
    ],
    shutoff: {
      hit: { x: 16, y: -21, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(16 -17) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(16 -17) rotate(175)" }],
    },
  },
  top: {
    tipX: 204,
    ring: null,
    pressure: { from: 105, to: 167, r: 20, ink: "#1a1a1a" },
    collar: { from: 168, to: 204, r: 29, ribs: 14, ink: "#3a2a10" },
    shutoff: { kind: "bale", pivotX: 66, arm: 46, offset: 22 },
    shell: [
      // Steel swivel coupling, black inlet body, then the main body.
      { role: "steel", d: "M 36 70.5 L 43 70.5 L 43 105.5 L 36 105.5 Z" },
      { role: "dark", d: "M 42 70 Q 42 68.5 43.5 68.5 L 56 68.5 Q 57.5 68.5 57.5 70 L 57.5 106 Q 57.5 107.5 56 107.5 L 43.5 107.5 Q 42 107.5 42 106 Z" },
      { role: "dark", d: "M 56 69 Q 56 67.5 57.5 67.5 L 105 67.5 L 105 108.5 L 57.5 108.5 Q 56 108.5 56 107 Z" },
      // The static flow index: a recessed plate with five 20/40/60/80/100% ticks for the knob to cross.
      { role: "steel", d: "M 52 82 Q 52 81 53 81 L 103 81 Q 104 81 104 82 L 104 94 L 52 94 Z", opacity: 0.16 },
      { role: "label", d: "M 56 82 L 58 82 L 58 84 L 56 84 Z" },
      { role: "label", d: "M 67.5 82 L 69.5 82 L 69.5 84 L 67.5 84 Z" },
      { role: "label", d: "M 79 82 L 81 82 L 81 84 L 79 84 Z" },
      { role: "label", d: "M 90.5 82 L 92.5 82 L 92.5 84 L 90.5 84 Z" },
      { role: "label", d: "M 102 82 L 104 82 L 104 84 L 102 84 Z" },
      // The yellow 50/100 psi selection band, the black neck, then the ribbed orange collar.
      { role: "yellow", d: "M 105 68 L 167 68 L 167 108 L 105 108 Z" },
      { role: "dark", d: "M 165 69.5 L 170 69.5 L 170 106.5 L 165 106.5 Z" },
      { role: "orange", d: "M 168 61 Q 168 59 170 59 L 197 59 Q 204 59 204 67 L 204 109 Q 204 117 197 117 L 170 117 Q 168 117 168 115 Z" },
      // Dark front face and steel tip ring.
      { role: "dark", d: "M 195 66 Q 195 64 197 64 L 204 64 L 204 112 Q 204 114 202 114 L 197 114 Q 195 114 195 112 Z" },
      { role: "steel", d: "M 198 65 L 204 65 L 204 111 L 198 111 Z" },
    ],
  },
} satisfies NozzleArt;
