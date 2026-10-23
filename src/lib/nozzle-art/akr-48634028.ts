import type { NozzleArt } from "./types.ts";

/**
 * Akron Mid-Range Assault, style 48634028, from the refs2 photo set
 * (akr-assault-0/2/3/4): the compact matte-black Pyrolite handline — a 1.5 in
 * NH swivel inlet, a plain cylindrical body with the square bale pivot and a
 * backward-raked rubber pistol grip, a yellow instruction band, a quarter-turn
 * ridged pattern collar, and the fat rounded rubber bumper tip (no teeth).
 * Fixed 175 gpm at 50 psi; 9 in (222 mm) long.
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (-x) with its slot cut out. */
const LEVER =
  "M -4 -8.5 L -20 -8.5 Q -26 -8.5 -26 -3 L -26 3 Q -26 8.5 -20 8.5 L -4 8.5 Z M -6 -5 L -6 5 L -19.5 5 L -19.5 -5 Z";
/** Its hub over the pivot bolt. */
const HUB = "M -4 -4 Q -4 -6 -2 -6 L 2 -6 Q 4 -6 4 -4 L 4 4 Q 4 6 2 6 L -2 6 Q -4 6 -4 4 Z";

export default {
  side: {
    length: 62,
    exit: { x: 62, half: 2 },
    flowLabel: { x: 46, y: -20.5 },
    shell: [
      // Coupling face and the long swivel inlet.
      { role: "steel", d: "M 0 -14.35 L 3 -14.35 L 3 14.35 L 0 14.35 Z" },
      { role: "dark", d: "M 2 -12.98 Q 2 -14.35 3 -14.35 L 8 -14.35 Q 11 -14.35 11 -10.93 L 11 10.93 Q 11 14.35 8 14.35 L 3 14.35 Q 2 14.35 2 12.98 Z" },
      { role: "steel", d: "M 10 -14.35 L 11.5 -14.35 L 11.5 14.35 L 10 14.35 Z", opacity: 0.4 },
      // Body, its FM plate, and the backward-raked pistol grip.
      { role: "dark", d: "M 11 -11.27 Q 11 -12.6 12 -12.6 L 28 -12.6 Q 30 -12.6 30 -9.95 L 30 9.95 Q 30 12.6 28 12.6 L 12 12.6 Q 11 12.6 11 11.27 Z" },
      { role: "label", d: "M 16 1 L 24 1 L 24 6 L 16 6 Z" },
      // Pivot plate on the body top, boss over it (the lever swings here).
      { role: "steel", d: "M 12.5 -11.5 L 19.5 -11.5 L 19.5 -8 L 12.5 -8 Z" },
      { role: "dark", d: HUB, t: "translate(16 -9)" },
      { role: "grip", d: "M 13 9 L 23 9 L 22.5 14 Q 21 20 15.5 20 L 12 20 Q 11 20 11.5 16 Z" },
      // Yellow instruction band around the body.
      { role: "yellow", d: "M 29 -12.95 L 37 -12.95 L 37 12.95 L 29 12.95 Z" },
      // Quarter-turn pattern collar, ridged along the axis.
      { role: "dark", d: "M 36 -15.4 L 45 -15.4 Q 46 -15.4 46 -13.93 L 46 13.93 Q 46 15.4 45 15.4 L 36 15.4 Z" },
      { role: "steel", d: "M 38 -15.4 L 39 -15.4 L 39 15.4 L 38 15.4 Z", opacity: 0.35 },
      { role: "steel", d: "M 41 -15.4 L 42 -15.4 L 42 15.4 L 41 15.4 Z", opacity: 0.35 },
      { role: "steel", d: "M 44 -15.4 L 45 -15.4 L 45 15.4 L 44 15.4 Z", opacity: 0.35 },
      // The fat rounded rubber bumper, with axial grooves and the front lip.
      { role: "dark", d: "M 45 -16.04 Q 45 -17.5 46 -17.5 L 56 -17.5 Q 62 -17.5 62 -10.21 L 62 10.21 Q 62 17.5 56 17.5 L 46 17.5 Q 45 17.5 45 16.04 Z" },
      { role: "steel", d: "M 49 -15.4 L 49.8 -15.4 L 49.8 15.4 L 49 15.4 Z", opacity: 0.32 },
      { role: "steel", d: "M 53 -17.5 L 53.8 -17.5 L 53.8 17.5 L 53 17.5 Z", opacity: 0.32 },
      { role: "steel", d: "M 57 -17.5 L 57.8 -17.5 L 57.8 17.5 L 57 17.5 Z", opacity: 0.32 },
      { role: "steel", d: "M 59 -12 L 62 -12 L 62 12 L 59 12 Z" },
      { role: "dark", d: "M 60.5 -2.5 L 62 -1.5 L 62 1.5 L 60.5 2.5 Z" },
    ],
    shutoff: {
      hit: { x: 10, y: -16, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(16 -9) rotate(40)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(16 -9) rotate(166)" }],
    },
  },
  top: {
    tipX: 162,
    ring: null,
    pressure: null,
    collar: { from: 108, to: 140, r: 20, ribs: 10, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 74, arm: 54, offset: -16.5 },
    shell: [
      // Swivel: steel coupling ring, black body, bale pin on the flank.
      { role: "steel", d: "M 36 79 L 40 79 L 40 97 L 36 97 Z" },
      { role: "dark", d: "M 39 71 Q 39 67.5 42.5 67.5 L 57 67.5 Q 60 67.5 60 71 L 60 105 Q 60 108.5 57 108.5 L 42.5 108.5 Q 39 108.5 39 105 Z" },
      { role: "dark", d: "M 58 72 Q 58 70 60 70 L 90 70 Q 93 70 93 73 L 93 103 Q 93 106 90 106 L 60 106 Q 58 106 58 104 Z" },
      { role: "steel", d: "M 74 69 a 2.5 2.5 0 1 0 0 5 a 2.5 2.5 0 1 0 0 -5 Z" },
      // Yellow instruction band, then the collar base and its dark ridged band.
      { role: "yellow", d: "M 92 70 L 104 70 L 104 106 L 92 106 Z" },
      { role: "dark", d: "M 103 69.5 L 108 69.5 L 108 106.5 L 103 106.5 Z" },
      { role: "dark", d: "M 106 68 Q 106 66 108 66 L 138 66 Q 140 66 140 68 L 140 108 Q 140 110 138 110 L 108 110 Q 106 110 106 108 Z" },
      // The fat rounded bumper, its axial grooves, and the front lip.
      { role: "dark", d: "M 138 65 Q 138 63 140 63 L 150 63 Q 162 63 162 76 L 162 100 Q 162 113 150 113 L 140 113 Q 138 113 138 111 Z" },
      { role: "steel", d: "M 144 67 L 146 67 L 146 109 L 144 109 Z", opacity: 0.28 },
      { role: "steel", d: "M 151 66 L 153 66 L 153 110 L 151 110 Z", opacity: 0.28 },
      { role: "steel", d: "M 158 68 L 160 68 L 160 108 L 158 108 Z", opacity: 0.28 },
      { role: "steel", d: "M 154 75 L 162 75 L 162 101 L 154 101 Z", opacity: 0.5 },
    ],
  },
} satisfies NozzleArt;
