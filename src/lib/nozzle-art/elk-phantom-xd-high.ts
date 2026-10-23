import type { NozzleArt } from "./types.ts";

/**
 * Elkhart Phantom XD high-range, from docs/reference/nozzles/photos/refs2/elk-phantom-xd-0/1/3/4: the same
 * black one-piece family as the mid-range, scaled up around the 2½ in inlet
 * (35 u) — wider body and collar, a larger bale loop, the black gallonage band
 * (125/150/200/250) and a taller red bumper with fixed metal teeth. Side
 * length is compressed; every diameter stays true to the 2½ in inlet.
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M 3 -6.5 L -18 -9.5 Q -24 -10 -24.5 -4 L -24.5 1 Q -24 7.5 -18 7 L 3 4 Z M -4 -2 L -4 2.5 L -18.5 4.8 L -18.5 0.5 Z";
/** Its hub over the pivot at the top of the side boss. */
const HUB =
  "M 12 -12 Q 12 -13.5 13.5 -13.5 L 20.5 -13.5 Q 22 -13.5 22 -12 L 22 -10.5 Q 22 -9 20.5 -9 L 13.5 -9 Q 12 -9 12 -10.5 Z";

export default {
  side: {
    length: 65,
    exit: { x: 64, half: 3 },
    flowLabel: { x: 54, y: -25.1 },
    shell: [
      // Swivel: 2½ in coupling face, black body and the rocker lugs.
      { role: "steel", d: "M 0 -15.75 L 3 -15.75 L 3 15.75 L 0 15.75 Z" },
      { role: "dark", d: "M 2 14.4 Q 2 15.75 3.5 15.75 L 10 15.75 Q 14 15.75 14 12.6 L 14 -12.6 Q 14 -15.75 10 -15.75 L 3.5 -15.75 Q 2 -15.75 2 -14.4 Z" },
      { role: "dark", d: "M 3 -17.5 L 10 -17.5 L 10 -22 Q 10 -23 8.5 -23 L 4.5 -23 Q 3 -23 3 -22 Z" },
      { role: "dark", d: "M 3 17.5 L 10 17.5 L 10 22 Q 10 23 8.5 23 L 4.5 23 Q 3 23 3 22 Z" },
      // Body and the white maker's mark on its crown.
      { role: "dark", d: "M 13 -13.44 Q 13 -14 14 -14 L 32 -14 Q 34 -14 34 -11.76 L 34 11.76 Q 34 14 32 14 L 14 14 Q 13 14 13 13.44 Z" },
      { role: "label", d: "M 23 -9.4 Q 26.5 -9.4 26.5 -6.6 Q 26.5 -3.8 23 -3.8 Q 19.5 -3.8 19.5 -6.6 Q 19.5 -9.4 23 -9.4 Z", opacity: 0.8 },
      // The larger round pivot boss, its bolt, and the bale hub on top.
      { role: "steel", d: "M 9 -4 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0 Z" },
      { role: "dark", d: "M 10.5 -4 a 6.5 6.5 0 1 0 13 0 a 6.5 6.5 0 1 0 -13 0 Z" },
      { role: "brass", d: "M 15.4 -4 a 1.6 1.6 0 1 0 3.2 0 a 1.6 1.6 0 1 0 -3.2 0 Z" },
      { role: "dark", d: HUB },
      // Barrel, gallonage band with steel edges, ribbed collar and its flush tab.
      { role: "dark", d: "M 34 -14.7 L 38 -14.7 L 38 14.7 L 34 14.7 Z" },
      { role: "dark", d: "M 37 -22 L 43 -22 L 43 22 L 37 22 Z" },
      { role: "steel", d: "M 37 -14.7 L 38 -14.7 L 38 14.7 L 37 14.7 Z", opacity: 0.45 },
      { role: "steel", d: "M 42 -22 L 43 -22 L 43 22 L 42 22 Z", opacity: 0.45 },
      { role: "dark", d: "M 43 -21.09 Q 43 -22.05 44 -22.05 L 49 -22.05 Q 50 -22.05 50 -21.09 L 50 21.09 Q 50 22.05 49 22.05 L 44 22.05 Q 43 22.05 43 21.09 Z" },
      { role: "steel", d: "M 45 -11.5 L 49 -11.5 L 49 -14 Q 49 -15 47.5 -15 L 46 -15 Q 45 -15 45 -14 Z" },
      // Red bumper, axial grooves and the fixed teeth at the tip face.
      { role: "red", d: "M 49 -22.05 L 58 -22.05 Q 64 -22.05 64 -12.25 L 64 12.25 Q 64 22.05 58 22.05 L 49 22.05 Z" },
      { role: "steel", d: "M 53 -22.05 L 54 -22.05 L 54 22.05 L 53 22.05 Z", opacity: 0.4 },
      { role: "steel", d: "M 57 -22.05 L 58 -22.05 L 58 22.05 L 57 22.05 Z", opacity: 0.4 },
      { role: "steel", d: "M 61 -22.05 L 62 -22.05 L 62 22.05 L 61 22.05 Z", opacity: 0.4 },
      { role: "steel", d: "M 59.5 -8 L 64 -6 L 59.5 -4 Z" },
      { role: "steel", d: "M 59.5 -2 L 64 -2 L 64 2 L 59.5 2 Z" },
      { role: "steel", d: "M 59.5 4 L 64 6 L 59.5 8 Z" },
    ],
    shutoff: {
      hit: { x: 17, y: -14, r: 18 },
      open: [{ role: "dark", d: LEVER, t: "translate(17 -12) rotate(28)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(17 -12) rotate(150)" }],
    },
  },
  top: {
    tipX: 204,
    ring: { from: 112, to: 136, r: 21, ink: "#e8eaec" },
    pressure: null,
    collar: { from: 140, to: 196, r: 27, ribs: 10, ink: "#7a1d15" },
    shutoff: { kind: "bale", pivotX: 64, arm: 66, offset: -24 },
    shell: [
      // Swivel: 2½ in steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 70.5 L 41 70.5 L 41 105.5 L 36 105.5 Z" },
      { role: "dark", d: "M 39 69 Q 39 65.5 42.5 65.5 L 52.5 65.5 Q 56 65.5 56 69 L 56 107 Q 56 110.5 52.5 110.5 L 42.5 110.5 Q 39 110.5 39 107 Z" },
      { role: "dark", d: "M 44 65.5 L 51 65.5 L 51 60 Q 51 58.5 49 58.5 L 46 58.5 Q 44 58.5 44 60 Z" },
      { role: "dark", d: "M 44 110.5 L 51 110.5 L 51 116 Q 51 117.5 49 117.5 L 46 117.5 Q 44 117.5 44 116 Z" },
      // Body and the pivot axle's far end.
      { role: "dark", d: "M 54 67 Q 54 65.5 56 65.5 L 84 65.5 Q 86 65.5 86 67 L 86 109 Q 86 110.5 84 110.5 L 56 110.5 Q 54 110.5 54 109 Z" },
      { role: "steel", d: "M 61.5 64 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0 Z" },
      // Ribbed body section and the gallonage band; the pattern collar ribs sit on the bumper's front.
      { role: "dark", d: "M 85 68 L 112 68 L 112 108 L 85 108 Z" },
      { role: "dark", d: "M 111 67 L 137 67 L 137 109 L 111 109 Z" },
      { role: "steel", d: "M 110.5 66.5 L 112 66.5 L 112 109.5 L 110.5 109.5 Z", opacity: 0.5 },
      { role: "steel", d: "M 136 66.5 L 137.5 66.5 L 137.5 109.5 L 136 109.5 Z", opacity: 0.5 },
      // Red bumper with its axial grooves.
      { role: "red", d: "M 136 56.5 L 190 56.5 Q 204 56.5 204 72 L 204 104 Q 204 119.5 190 119.5 L 136 119.5 Z" },
      { role: "steel", d: "M 143 62 L 192 62 L 192 63.5 L 143 63.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 143 70 L 194 70 L 194 71.5 L 143 71.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 143 105 L 194 105 L 194 106.5 L 143 106.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 143 113 L 192 113 L 192 114.5 L 143 114.5 Z", opacity: 0.35 },
      // Muzzle recess and the fixed steel teeth.
      { role: "dark", d: "M 192 70 L 204 70 L 204 106 L 192 106 Z" },
      { role: "steel", d: "M 193 72.5 L 203 77 L 193 81.5 Z" },
      { role: "steel", d: "M 193 85 L 199 85 L 199 91 L 193 91 Z" },
      { role: "steel", d: "M 193 94.5 L 203 99 L 193 103.5 Z" },
    ],
  },
} satisfies NozzleArt;
