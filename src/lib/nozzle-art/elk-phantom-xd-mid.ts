import type { NozzleArt } from "./types.ts";

/**
 * Elkhart Phantom XD mid-range, from docs/reference/nozzles/photos/refs2/elk-phantom-xd-0/1/3/4: black
 * one-piece handline — 1½ in swivel inlet with rocker lugs, body with the
 * round ELKHART BRASS pivot boss, big bale loop over the top, ribbed pattern
 * collar with its flush tab, black gallonage band (30/60/95/125/150/200) and
 * the red bumper with fixed metal teeth. Side length is compressed; every
 * diameter stays true to the 1½ in inlet (21 u).
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M 3 -5.5 L -20 -8 Q -26 -8.5 -26.5 -3 L -26.5 1 Q -26 6.5 -20 6 L 3 3.5 Z M -4 -1.5 L -4 2 L -20.5 4 L -20.5 0.5 Z";
/** Its hub over the pivot at the top of the side boss. */
const HUB =
  "M 11.5 -8.5 Q 11.5 -10 13 -10 L 17 -10 Q 18.5 -10 18.5 -8.5 L 18.5 -7 Q 18.5 -5.5 17 -5.5 L 13 -5.5 Q 11.5 -5.5 11.5 -7 Z";

export default {
  side: {
    length: 62,
    exit: { x: 61, half: 2.5 },
    flowLabel: { x: 50, y: -21.9 },
    shell: [
      // Swivel: coupling face, black body and the two rocker lugs.
      { role: "steel", d: "M 0 -11.55 L 3 -11.55 L 3 11.55 L 0 11.55 Z" },
      { role: "dark", d: "M 2 10.45 Q 2 11.55 3 11.55 L 9.5 11.55 Q 12 11.55 12 8.8 L 12 -8.8 Q 12 -11.55 9.5 -11.55 L 3 -11.55 Q 2 -11.55 2 -10.45 Z" },
      { role: "dark", d: "M 3 -10.5 L 8.5 -10.5 L 8.5 -14 Q 8.5 -15 7.5 -15 L 4 -15 Q 3 -15 3 -14 Z" },
      { role: "dark", d: "M 3 10.5 L 8.5 10.5 L 8.5 14 Q 8.5 15 7.5 15 L 4 15 Q 3 15 3 14 Z" },
      // Body and the white maker's mark on its crown.
      { role: "dark", d: "M 11 -10.91 Q 11 -11.55 12 -11.55 L 30 -11.55 Q 32 -11.55 32 -8.98 L 32 8.98 Q 32 11.55 30 11.55 L 12 11.55 Q 11 11.55 11 10.91 Z" },
      { role: "label", d: "M 21 -6.6 Q 24 -6.6 24 -4.6 Q 24 -2.6 21 -2.6 Q 18 -2.6 18 -4.6 Q 18 -6.6 21 -6.6 Z", opacity: 0.8 },
      // The big round pivot boss, its bolt, and the bale hub on top of it.
      { role: "steel", d: "M 9 -2.5 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 Z" },
      { role: "dark", d: "M 10.2 -2.5 a 4.8 4.8 0 1 0 9.6 0 a 4.8 4.8 0 1 0 -9.6 0 Z" },
      { role: "brass", d: "M 13.7 -2.5 a 1.3 1.3 0 1 0 2.6 0 a 1.3 1.3 0 1 0 -2.6 0 Z" },
      { role: "dark", d: HUB },
      // Barrel, the black gallonage band with steel edges, the ribbed collar and its flush tab.
      { role: "dark", d: "M 30 -11.9 L 34 -11.9 L 34 11.9 L 30 11.9 Z" },
      { role: "dark", d: "M 35 -16 L 41 -16 L 41 16 L 35 16 Z" },
      { role: "steel", d: "M 35 -11.9 L 36 -11.9 L 36 11.9 L 35 11.9 Z", opacity: 0.45 },
      { role: "steel", d: "M 40 -16 L 41 -16 L 41 16 L 40 16 Z", opacity: 0.45 },
      { role: "dark", d: "M 41 -16 Q 41 -17 42 -17 L 47 -17 Q 48 -17 48 -16 L 48 16 Q 48 17 47 17 L 42 17 Q 41 17 41 16 Z" },
      { role: "steel", d: "M 43 -8.5 L 47 -8.5 L 47 -11 Q 47 -12 45.5 -12 L 44 -12 Q 43 -12 43 -11 Z" },
      // Red bumper, its axial grooves and the fixed teeth at the tip face.
      { role: "red", d: "M 46.5 -18.9 L 56 -18.9 Q 61 -18.9 61 -10.8 L 61 10.8 Q 61 18.9 56 18.9 L 46.5 18.9 Z" },
      { role: "steel", d: "M 50 -18.9 L 51 -18.9 L 51 18.9 L 50 18.9 Z", opacity: 0.4 },
      { role: "steel", d: "M 54 -18.9 L 55 -18.9 L 55 18.9 L 54 18.9 Z", opacity: 0.4 },
      { role: "steel", d: "M 58 -18.9 L 59 -18.9 L 59 18.9 L 58 18.9 Z", opacity: 0.4 },
      { role: "steel", d: "M 56.5 -6 L 61 -4.5 L 56.5 -3 Z" },
      { role: "steel", d: "M 56.5 -1.5 L 61 -1.5 L 61 1.5 L 56.5 1.5 Z" },
      { role: "steel", d: "M 56.5 3 L 61 4.5 L 56.5 6 Z" },
    ],
    shutoff: {
      hit: { x: 15, y: -11, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(15 -8.5) rotate(33)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(15 -8.5) rotate(150)" }],
    },
  },
  top: {
    tipX: 186,
    ring: { from: 104, to: 124, r: 16.8, ink: "#e8eaec" },
    pressure: null,
    collar: { from: 130, to: 180, r: 24, ribs: 10, ink: "#7a1d15" },
    shutoff: { kind: "bale", pivotX: 68, arm: 46, offset: -20 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 77.5 L 40 77.5 L 40 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 39 75 Q 39 71.5 42.5 71.5 L 51.5 71.5 Q 55 71.5 55 75 L 55 101 Q 55 104.5 51.5 104.5 L 42.5 104.5 Q 39 104.5 39 101 Z" },
      { role: "dark", d: "M 44 71.5 L 50 71.5 L 50 66 Q 50 64.5 48 64.5 L 46 64.5 Q 44 64.5 44 66 Z" },
      { role: "dark", d: "M 44 104.5 L 50 104.5 L 50 110 Q 50 111.5 48 111.5 L 46 111.5 Q 44 111.5 44 110 Z" },
      { role: "dark", d: "M 54 71.2 Q 54 69.5 56 69.5 L 80 69.5 Q 82 69.5 82 71.2 L 82 104.8 Q 82 106.5 80 106.5 L 56 106.5 Q 54 106.5 54 104.8 Z" },
      { role: "steel", d: "M 62 68 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 Z" },
      { role: "dark", d: "M 63.2 68 a 4.8 4.8 0 1 0 9.6 0 a 4.8 4.8 0 1 0 -9.6 0 Z" },
      { role: "brass", d: "M 66.7 68 a 1.3 1.3 0 1 0 2.6 0 a 1.3 1.3 0 1 0 -2.6 0 Z" },
      // Ribbed body section and the gallonage band; the pattern collar ribs sit on the bumper's front.
      { role: "dark", d: "M 81 71.5 L 104 71.5 L 104 104.5 L 81 104.5 Z" },
      { role: "dark", d: "M 103 71 L 125 71 L 125 105 L 103 105 Z" },
      { role: "steel", d: "M 102.5 70.5 L 104 70.5 L 104 105.5 L 102.5 105.5 Z", opacity: 0.5 },
      { role: "steel", d: "M 124 70.5 L 125.5 70.5 L 125.5 105.5 L 124 105.5 Z", opacity: 0.5 },
      // Red bumper with its axial grooves.
      { role: "red", d: "M 124 61 L 172 61 Q 186 61 186 75 L 186 101 Q 186 115 172 115 L 124 115 Z" },
      { role: "steel", d: "M 130 65.5 L 176 65.5 L 176 67 L 130 67 Z", opacity: 0.35 },
      { role: "steel", d: "M 130 72.5 L 178 72.5 L 178 74 L 130 74 Z", opacity: 0.35 },
      { role: "steel", d: "M 130 102 L 178 102 L 178 103.5 L 130 103.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 130 109 L 176 109 L 176 110.5 L 130 110.5 Z", opacity: 0.35 },
      // Muzzle recess and the fixed steel teeth.
      { role: "dark", d: "M 176 73 L 186 73 L 186 103 L 176 103 Z" },
      { role: "steel", d: "M 177 74.5 L 185 78 L 177 81.5 Z" },
      { role: "steel", d: "M 177 84 L 182 84 L 182 92 L 177 92 Z" },
      { role: "steel", d: "M 177 94.5 L 185 98 L 177 101.5 Z" },
    ],
  },
} satisfies NozzleArt;
