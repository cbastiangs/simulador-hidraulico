import type { NozzleArt } from "./types.ts";

/**
 * POK Slide-O-Matic 150 (POK-SOM-150), from the refs2 photo set (pok-som-0/1/2):
 * a 1½ in NST/NH swivel handline combination nozzle. Black/olive body with a
 * steel swivel inlet, a slide shutoff whose handle carries the 20/40/60/80/100%
 * flow index, a yellow 50/100 psi selection band, and a ribbed orange pattern
 * collar/bumper at the tip. No grip, no teeth. True scale: 14 units = 1 inch,
 * so the 1½ in inlet is 21 units tall.
 */


/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 58,
    exit: { x: 58, half: 3 },
    flowLabel: { x: 32, y: -18.4 },
    shell: [
      // Steel swivel face, then the black inlet body.
      { role: "steel", d: "M 0 -7.35 L 3 -7.35 L 3 7.35 L 0 7.35 Z" },
      { role: "dark", d: "M 2.5 -7.76 Q 2.5 -8.54 3.5 -8.54 L 7 -8.54 Q 8 -8.54 8 -7.76 L 8 7.76 Q 8 8.54 7 8.54 L 3.5 8.54 Q 2.5 8.54 2.5 7.76 Z" },
      // Main body, with its flow index ticks on top.
      { role: "dark", d: "M 7 -8.5 Q 7 -9.24 8 -9.24 L 20 -9.24 L 20 9.24 L 8 9.24 Q 7 9.24 7 8.5 Z" },
      { role: "steel", d: "M 8 -13 L 21 -13 L 21 -11 L 8 -11 Z", opacity: 0.35 },
      { role: "label", d: "M 8 -15 L 9.4 -15 L 9.4 -12 L 8 -12 Z" },
      { role: "label", d: "M 11.25 -15 L 12.65 -15 L 12.65 -12 L 11.25 -12 Z" },
      { role: "label", d: "M 14.5 -15 L 15.9 -15 L 15.9 -12 L 14.5 -12 Z" },
      { role: "label", d: "M 17.75 -15 L 19.15 -15 L 19.15 -12 L 17.75 -12 Z" },
      { role: "label", d: "M 21 -15 L 22.4 -15 L 22.4 -12 L 21 -12 Z" },
      // Yellow 50/100 psi band, the black neck, then the ribbed orange collar.
      { role: "yellow", d: "M 20 -9.1 L 45 -9.1 L 45 9.1 L 20 9.1 Z" },
      { role: "dark", d: "M 44 -8.05 L 48 -8.05 L 48 8.05 L 44 8.05 Z" },
      { role: "orange", d: "M 46 -14.44 Q 46 -15.4 47 -15.4 L 55 -15.4 Q 58 -15.4 58 -11.55 L 58 11.55 Q 58 15.4 55 15.4 L 47 15.4 Q 46 15.4 46 14.44 Z" },
      // Dark front face and its steel tip ring.
      { role: "dark", d: "M 54 -14.12 Q 54 -15.4 55 -15.4 L 58 -15.4 L 58 15.4 L 55 15.4 Q 54 15.4 54 14.12 Z" },
      { role: "steel", d: "M 56 -15.4 L 58 -15.4 L 58 15.4 L 56 15.4 Z" },
      { role: "dark", d: HUB, t: "translate(14 -11)" },
    ],
    shutoff: {
      hit: { x: 14, y: -15, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(14 -11) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(14 -11) rotate(175)" }],
    },
  },
  top: {
    tipX: 176,
    ring: null,
    pressure: { from: 84, to: 146, r: 13, ink: "#1a1a1a" },
    collar: { from: 148, to: 176, r: 22, ribs: 12, ink: "#3a2a10" },
    shutoff: { kind: "bale", pivotX: 64, arm: 46, offset: 17 },
    shell: [
      // Steel swivel coupling, black inlet body, then the main body.
      { role: "steel", d: "M 36 77.5 L 41.5 77.5 L 41.5 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 40.5 77 Q 40.5 75.8 41.7 75.8 L 52 75.8 Q 53.2 75.8 53.2 77 L 53.2 99 Q 53.2 100.2 52 100.2 L 41.7 100.2 Q 40.5 100.2 40.5 99 Z" },
      { role: "dark", d: "M 52 76 Q 52 74.8 53.2 74.8 L 84 74.8 L 84 101.2 L 53.2 101.2 Q 52 101.2 52 100 Z" },
      // The static flow index: a recessed plate with five 20/40/60/80/100% ticks for the knob to cross.
      { role: "steel", d: "M 49 80.5 Q 49 79.5 50 79.5 L 82 79.5 Q 83 79.5 83 80.5 L 83 95 L 49 95 Z", opacity: 0.16 },
      { role: "label", d: "M 50 80.5 L 51.6 80.5 L 51.6 82.5 L 50 82.5 Z" },
      { role: "label", d: "M 57.5 80.5 L 59.1 80.5 L 59.1 82.5 L 57.5 82.5 Z" },
      { role: "label", d: "M 65 80.5 L 66.6 80.5 L 66.6 82.5 L 65 82.5 Z" },
      { role: "label", d: "M 72.5 80.5 L 74.1 80.5 L 74.1 82.5 L 72.5 82.5 Z" },
      { role: "label", d: "M 80 80.5 L 81.6 80.5 L 81.6 82.5 L 80 82.5 Z" },
      // The yellow 50/100 psi selection band, the black neck, then the ribbed orange collar.
      { role: "yellow", d: "M 84 75 L 146 75 L 146 101 L 84 101 Z" },
      { role: "dark", d: "M 144 76.5 L 152 76.5 L 152 99.5 L 144 99.5 Z" },
      { role: "orange", d: "M 148 68 Q 148 66 150 66 L 170 66 Q 176 66 176 73 L 176 103 Q 176 110 170 110 L 150 110 Q 148 110 148 108 Z" },
      // Dark front face and steel tip ring.
      { role: "dark", d: "M 168 74 Q 168 72 170 72 L 176 72 L 176 104 Q 176 106 174 106 L 170 106 Q 168 106 168 104 Z" },
      { role: "steel", d: "M 171 73 L 176 73 L 176 103 L 171 103 Z" },
    ],
  },
} satisfies NozzleArt;
