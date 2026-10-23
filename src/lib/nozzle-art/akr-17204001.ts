import type { NozzleArt } from "./types.ts";

/**
 * Akron Turbojet style 1720 (AKR-17204001), from the refs2 photo set
 * (akr-turbojet-1/3/4/5): black one-piece handline — swivel inlet with rocker
 * lugs, body with the FM plate, bale lever loop pivoting on a square bolt,
 * raked pistol grip, knurled dark rings around a red gallonage band, and the
 * big grooved bumper with fixed metal teeth. Settings A–D (30–150 gpm).
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
/** Its hub over the pivot bolt. */
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 62,
    exit: { x: 61, half: 2.5 },
    flowLabel: { x: 44, y: -15.2 },
    shell: [
      // Coupling face and swivel, with the rocker lugs.
      { role: "steel", d: "M 0 -11.55 L 3 -11.55 L 3 11.55 L 0 11.55 Z" },
      { role: "dark", d: "M 2 10.45 Q 2 11.55 3 11.55 L 9 11.55 Q 12 11.55 12 8.8 L 12 -8.8 Q 12 -11.55 9 -11.55 L 3 -11.55 Q 2 -11.55 2 -10.45 Z" },
      { role: "dark", d: "M 3 -10.5 L 8.5 -10.5 L 8.5 -13.5 Q 8.5 -14.5 7.5 -14.5 L 4 -14.5 Q 3 -14.5 3 -13.5 Z" },
      { role: "dark", d: "M 3 10.5 L 8.5 10.5 L 8.5 13.5 Q 8.5 14.5 7.5 14.5 L 4 14.5 Q 3 14.5 3 13.5 Z" },
      // Body under the bale, its FM plate, and the raked pistol grip.
      { role: "dark", d: "M 11 -8.26 Q 11 -8.75 12 -8.75 L 29 -8.75 Q 31 -8.75 31 -6.81 L 31 6.81 Q 31 8.75 29 8.75 L 12 8.75 Q 11 8.75 11 8.26 Z" },
      { role: "label", d: "M 15 -6 L 23.5 -6 L 23.5 0 L 15 0 Z" },
      // Pivot bolt: plate on the body top, boss over it (the lever swings here).
      { role: "steel", d: "M 12.5 -10.5 L 17.5 -10.5 L 17.5 -7 L 12.5 -7 Z" },
      { role: "dark", d: HUB, t: "translate(15 -8)" },
      { role: "grip", d: "M 14 8.5 L 22 8.5 L 21 16 Q 20.5 19 17.5 19 L 15.5 19 Q 13.5 19 13.5 16.5 Z" },
      // Barrel, the knurled rings around the red gallonage band, then the bumper.
      { role: "dark", d: "M 30 -9.8 L 33 -9.8 L 33 9.8 L 30 9.8 Z" },
      { role: "dark", d: "M 32 -9.22 Q 32 -9.8 33 -9.8 L 36 -9.8 L 36 9.8 L 33 9.8 Q 32 9.8 32 9.22 Z" },
      { role: "red", d: "M 35 -9.45 L 39.5 -9.45 L 39.5 9.45 L 35 9.45 Z" },
      { role: "dark", d: "M 39 -11.53 Q 39 -12.25 40 -12.25 L 43 -12.25 L 43 12.25 L 40 12.25 Q 39 12.25 39 11.53 Z" },
      { role: "dark", d: "M 42 -12.25 L 56 -12.25 Q 61 -12.25 61 -7 L 61 7 Q 61 12.25 56 12.25 L 42 12.25 Z" },
      // Bumper grooves (axial), and the fixed teeth at the tip.
      { role: "steel", d: "M 46 -12.25 L 47 -12.25 L 47 12.25 L 46 12.25 Z", opacity: 0.5 },
      { role: "steel", d: "M 51 -12.25 L 52 -12.25 L 52 12.25 L 51 12.25 Z", opacity: 0.5 },
      { role: "steel", d: "M 56 -12.25 L 57 -12.25 L 57 12.25 L 56 12.25 Z", opacity: 0.5 },
      { role: "steel", d: "M 56.5 -6 L 61 -6 L 61 -3 L 56.5 -3 Z" },
      { role: "steel", d: "M 56.5 -1.5 L 61 -1.5 L 61 1.5 L 56.5 1.5 Z" },
      { role: "steel", d: "M 56.5 3 L 61 3 L 61 6 L 56.5 6 Z" },
    ],
    shutoff: {
      hit: { x: 15, y: -12, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(15 -8) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(15 -8) rotate(175)" }],
    },
  },
  top: {
    tipX: 204,
    ring: { from: 119, to: 134, r: 14, ink: "#f7f3ec" },
    pressure: null,
    collar: { from: 144, to: 204, r: 17, ribs: 10, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 82, arm: 58, offset: -20 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs, bale pin.
      { role: "steel", d: "M 36 79 L 40 79 L 40 97 L 36 97 Z" },
      { role: "dark", d: "M 39 75 Q 39 71.5 42.5 71.5 L 60 71.5 Q 63 71.5 63 75 L 63 101 Q 63 104.5 60 104.5 L 42.5 104.5 Q 39 104.5 39 101 Z" },
      { role: "dark", d: "M 46 71.5 L 56 71.5 L 56 66 Q 56 64.5 54 64.5 L 48 64.5 Q 46 64.5 46 66 Z" },
      { role: "dark", d: "M 46 104.5 L 56 104.5 L 56 110 Q 56 111.5 54 111.5 L 48 111.5 Q 46 111.5 46 110 Z" },
      { role: "dark", d: "M 62 75.5 L 104 75.5 Q 106 75.5 106 77.5 L 106 98.5 Q 106 100.5 104 100.5 L 62 100.5 Z" },
      { role: "steel", d: "M 82 65.5 a 2.5 2.5 0 1 0 0 5 a 2.5 2.5 0 1 0 0 -5 Z" },
      // Barrel: red knurled ring, the numbered gallonage band, another knurl.
      { role: "red", d: "M 107 75 L 117 75 L 117 101 L 107 101 Z" },
      { role: "dark", d: "M 110 75 L 111.5 75 L 111.5 101 L 110 101 Z", opacity: 0.4 },
      { role: "dark", d: "M 114 75 L 115.5 75 L 115.5 101 L 114 101 Z", opacity: 0.4 },
      { role: "red", d: "M 118 74 L 135 74 L 135 102 L 118 102 Z" },
      { role: "dark", d: "M 136 74.5 L 144 74.5 L 144 101.5 L 136 101.5 Z" },
      { role: "steel", d: "M 139 74.5 L 140 74.5 L 140 101.5 L 139 101.5 Z", opacity: 0.4 },
      { role: "steel", d: "M 142 74.5 L 143 74.5 L 143 101.5 L 142 101.5 Z", opacity: 0.4 },
      // Bumper with its axial grooves, and the fixed teeth at the tip face.
      { role: "dark", d: "M 144 70.5 L 188 70.5 Q 204 70.5 204 78.5 L 204 97.5 Q 204 105.5 188 105.5 L 144 105.5 Z" },
      { role: "steel", d: "M 148 74 L 198 74 L 198 75.2 L 148 75.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 148 83 L 202 83 L 202 84.2 L 148 84.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 148 92 L 202 92 L 202 93.2 L 148 93.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 148 100.8 L 198 100.8 L 198 102 L 148 102 Z", opacity: 0.35 },
      { role: "steel", d: "M 196 77.5 L 204 80.5 L 196 83.5 Z" },
      { role: "steel", d: "M 196 88 L 202 88 L 202 91 L 196 91 Z" },
      { role: "steel", d: "M 196 92.5 L 204 95.5 L 196 98.5 Z" },
    ],
  },
} satisfies NozzleArt;
