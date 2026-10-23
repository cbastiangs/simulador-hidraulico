import type { NozzleArt } from "./types.ts";

/**
 * Task Force Tips ThunderFog JTS250PS, from the refs2 photo set
 * (tft-jts250ps-1/2/4/5 and the catalog shots): black one-piece handline with a
 * 2.5 in NH rocker-swivel inlet, a ball-valve body with the pivoting lever, a
 * raked pistol grip, a white gallonage band with red trim and dark numerals
 * (95/125/150/200/250 gpm at 100 psi), a grooved barrel, and the big bumper
 * with its ring of spinning metal teeth.
 */


/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -5 -7 L -24 -7 Q -29 -7 -29 -2 L -29 2 Q -29 7 -24 7 L -5 7 Z M -7 -2.4 L -7 2.4 L -24.5 2.4 L -24.5 -2.4 Z";
const HUB = "M -5 -5 Q -5 -7 -3 -7 L 3 -7 Q 5 -7 5 -5 L 5 5 Q 5 7 3 7 L -3 7 Q -5 7 -5 5 Z";

export default {
  side: {
    length: 65,
    exit: { x: 65, half: 3.5 },
    flowLabel: { x: 52, y: -18.4 },
    shell: [
      // Coupling face and swivel, with the rocker lugs above and below.
      { role: "steel", d: "M 0 -13.65 L 3 -13.65 L 3 13.65 L 0 13.65 Z" },
      { role: "dark", d: "M 2 -10.07 Q 2 -11.9 4 -11.9 L 12 -11.9 Q 15 -11.9 15 -9.15 L 15 9.15 Q 15 11.9 12 11.9 L 4 11.9 Q 2 11.9 2 10.07 Z" },
      { role: "dark", d: "M 4 -13 L 10 -13 L 10 -16 Q 10 -17 9 -17 L 5 -17 Q 4 -17 4 -16 Z" },
      { role: "dark", d: "M 4 13 L 10 13 L 10 16 Q 10 17 9 17 L 5 17 Q 4 17 4 16 Z" },
      // The ball-valve body, its maker's plate and the stem housing on top.
      { role: "dark", d: "M 14 -11.36 Q 14 -11.9 15 -11.9 L 34 -11.9 Q 36 -11.9 36 -9.74 L 36 9.74 Q 36 11.9 34 11.9 L 15 11.9 Q 14 11.9 14 11.36 Z" },
      { role: "steel", d: "M 17 -7 L 25 -7 L 25 -1 L 17 -1 Z" },
      { role: "steel", d: "M 18 -13 L 26 -13 L 26 -11 L 18 -11 Z" },
      // The raked pistol grip, under the body.
      { role: "grip", d: "M 15 10.5 L 25 10.5 L 24 18 Q 23.5 20 21 20 L 18 20 Q 14.5 20 14 17.5 Z" },
      // Gallonage band: white with red end trim, on the barrel's shoulder.
      { role: "label", d: "M 36 -10.5 L 48 -10.5 L 48 10.5 L 36 10.5 Z" },
      { role: "red", d: "M 36 -10.5 L 38.5 -10.5 L 38.5 10.5 L 36 10.5 Z" },
      { role: "red", d: "M 45.5 -10.5 L 48 -10.5 L 48 10.5 L 45.5 10.5 Z" },
      // Grooved barrel, then the bumper with its axial grooves and the teeth at the tip.
      { role: "dark", d: "M 47 -15.4 L 56 -15.4 L 56 15.4 L 47 15.4 Z" },
      { role: "dark", d: "M 54 -15.4 L 62 -15.4 Q 65 -15.4 65 -9.86 L 65 9.86 Q 65 15.4 62 15.4 L 54 15.4 Z" },
      { role: "steel", d: "M 51 -15.4 L 52 -15.4 L 52 15.4 L 51 15.4 Z", opacity: 0.4 },
      { role: "steel", d: "M 55 -15.4 L 56 -15.4 L 56 15.4 L 55 15.4 Z", opacity: 0.4 },
      { role: "steel", d: "M 59 -15.4 L 60 -15.4 L 60 15.4 L 59 15.4 Z", opacity: 0.4 },
      { role: "steel", d: "M 60.5 -6 L 65 -6 L 65 -3 L 60.5 -3 Z" },
      { role: "steel", d: "M 60.5 -1.5 L 65 -1.5 L 65 1.5 L 60.5 1.5 Z" },
      { role: "steel", d: "M 60.5 3 L 65 3 L 65 6 L 60.5 6 Z" },
      { role: "dark", d: HUB, t: "translate(21 -9)" },
    ],
    shutoff: {
      hit: { x: 21, y: -13, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(21 -9) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(21 -9) rotate(175)" }],
    },
  },
  top: {
    tipX: 232,
    ring: { from: 104, to: 126, r: 17, ink: "#2b2f33" },
    pressure: null,
    collar: { from: 178, to: 222, r: 22, ribs: 8, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 76, arm: 46, offset: 22 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs, then the casting back to the valve.
      { role: "steel", d: "M 36 72 L 40 72 L 40 104 L 36 104 Z" },
      { role: "dark", d: "M 39 72 Q 39 68.5 42.5 68.5 L 55 68.5 Q 58 68.5 58 71.5 L 58 104.5 Q 58 107.5 55 107.5 L 42.5 107.5 Q 39 107.5 39 104 Z" },
      { role: "dark", d: "M 44 68.5 L 54 68.5 L 54 63 Q 54 61.5 52 61.5 L 46 61.5 Q 44 61.5 44 63 Z" },
      { role: "dark", d: "M 56 71 L 104 71 Q 106 71 106 73 L 106 103 Q 106 105 104 105 L 56 105 Z" },
      // Gallonage band: red underlay with the white numerals panel inside it.
      { role: "red", d: "M 103 71 L 127 71 L 127 105 L 103 105 Z" },
      { role: "label", d: "M 104 75 L 126 75 L 126 101 L 104 101 Z" },
      { role: "red", d: "M 104 71 L 107 71 L 107 105 L 104 105 Z" },
      // Barrel with its axial grooves, then the big bumper.
      { role: "dark", d: "M 125 73 L 176 73 L 176 103 L 125 103 Z" },
      { role: "steel", d: "M 133 75 L 134.5 75 L 134.5 101 L 133 101 Z", opacity: 0.35 },
      { role: "steel", d: "M 148 75 L 149.5 75 L 149.5 101 L 148 101 Z", opacity: 0.35 },
      { role: "steel", d: "M 163 75 L 164.5 75 L 164.5 101 L 163 101 Z", opacity: 0.35 },
      { role: "dark", d: "M 172 66 L 214 66 Q 222 66 222 74 L 222 102 Q 222 110 214 110 L 172 110 Z" },
      // The ring of spinning metal teeth at the bumper's front rim.
      { role: "steel", d: "M 206 70 L 220 70 L 220 106 L 206 106 Z", opacity: 0.5 },
      { role: "steel", d: "M 222 69 L 226 69 L 226 71 L 222 71 Z M 222 73 L 226 73 L 226 75 L 222 75 Z M 222 77 L 226 77 L 226 79 L 222 79 Z M 222 81 L 226 81 L 226 83 L 222 83 Z M 222 85 L 226 85 L 226 87 L 222 87 Z M 222 89 L 226 89 L 226 91 L 222 91 Z M 222 93 L 226 93 L 226 95 L 222 95 Z M 222 97 L 226 97 L 226 99 L 222 99 Z M 222 101 L 226 101 L 226 103 L 222 103 Z M 222 105 L 226 105 L 226 107 L 222 107 Z" },
      { role: "steel", d: "M 212 66 L 214 66 L 214 110 L 212 110 Z", opacity: 0.4 },
    ],
  },
} satisfies NozzleArt;
