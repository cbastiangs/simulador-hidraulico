import type { NozzleArt } from "./types.ts";

/**
 * Task Force Tips QuadraFog FQS125F (TFT-FQS125F), from the refs photo set
 * (tft-fqs125f, t-600-fqs125f, q-tft-quadrafog): black one-piece 1½ in
 * selectable handline with no pistol grip. Swivel inlet with rocker lugs, ball
 * shutoff worked by a bale loop on top (the spec page's "ball valve" is the valve inside; the loop is assumed from the family, no photo of it yet), white
 * QUADRAFOG label band, large ribbed pattern collar, and a fixed metal teeth
 * crown in the bumper. Flow ring 30/60/95/125 gpm at 100 psi.
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 62,
    exit: { x: 61, half: 2.5 },
    flowLabel: { x: 36, y: -17.0 },
    shell: [
      // Coupling face, swivel and rocker lugs (1½ in = 21 units true).
      { role: "steel", d: "M 0 -8.75 L 2.5 -8.75 L 2.5 8.75 L 0 8.75 Z" },
      { role: "dark", d: "M 2 8.57 Q 2 9.8 3.5 9.8 L 7.5 9.8 Q 10 9.8 10 7.76 L 10 -7.76 Q 10 -9.8 7.5 -9.8 L 3.5 -9.8 Q 2 -9.8 2 -8.57 Z" },
      { role: "dark", d: "M 3 -11.5 L 8.5 -11.5 L 8.5 -14 Q 8.5 -15 7.5 -15 L 4 -15 Q 3 -15 3 -14 Z" },
      { role: "dark", d: "M 3 11.5 L 8.5 11.5 L 8.5 14 Q 8.5 15 7.5 15 L 4 15 Q 3 15 3 14 Z" },
      { role: "steel", d: "M 3.4 -8.75 L 4.6 -8.75 L 4.6 8.75 L 3.4 8.75 Z", opacity: 0.5 },
      // Body, its side highlight, the fixed ON guard under the loop.
      { role: "dark", d: "M 9 -9.26 Q 9 -9.8 10 -9.8 L 30 -9.8 Q 32 -9.8 32 -7.62 L 32 7.62 Q 32 9.8 30 9.8 L 10 9.8 Q 9 9.8 9 9.26 Z" },
      { role: "steel", d: "M 12 -7.5 L 28 -7.5 L 28 -5.5 L 12 -5.5 Z", opacity: 0.22 },
      { role: "dark", d: "M 17 -8 L 18.5 -11.5 Q 19 -13 21 -13 L 27 -13 Q 29 -13 29.5 -11.5 L 31 -8 L 28.5 -8 L 27 -10.5 Q 26.6 -11 26 -11 L 22 -11 Q 21.4 -11 21 -10.5 L 19.5 -8 Z" },
      // Pivot boss and steel bolt for the loop.
      { role: "dark", d: "M 9.2 -7 a 4.8 4.8 0 1 0 9.6 0 a 4.8 4.8 0 1 0 -9.6 0 Z" },
      { role: "steel", d: "M 11.7 -7 a 2.3 2.3 0 1 0 4.6 0 a 2.3 2.3 0 1 0 -4.6 0 Z" },
      // Transition collar and the white QUADRAFOG / flow band.
      { role: "dark", d: "M 29 -10.33 Q 29 -10.85 30 -10.85 L 32 -10.85 L 32 10.85 L 30 10.85 Q 29 10.85 29 10.33 Z" },
      { role: "label", d: "M 31 -10.85 L 41 -10.85 L 41 10.85 L 31 10.85 Z" },
      { role: "steel", d: "M 33.2 -10.85 L 33.9 -10.85 L 33.9 10.85 L 33.2 10.85 Z", opacity: 0.35 },
      { role: "steel", d: "M 37.6 -10.15 L 38.3 -10.15 L 38.3 10.15 L 37.6 10.15 Z", opacity: 0.35 },
      // Knurled ring, big ribbed pattern collar, bumper.
      { role: "dark", d: "M 40.5 -12.72 Q 40.5 -13.3 41.5 -13.3 L 44 -13.3 L 44 13.3 L 41.5 13.3 Q 40.5 13.3 40.5 12.72 Z" },
      { role: "steel", d: "M 41.7 -13.3 L 42.4 -13.3 L 42.4 13.3 L 41.7 13.3 Z", opacity: 0.4 },
      { role: "steel", d: "M 43 -13.3 L 43.7 -13.3 L 43.7 13.3 L 43 13.3 Z", opacity: 0.4 },
      { role: "dark", d: "M 43 -9.75 Q 43 -13.3 48 -13.3 L 54 -13.3 Q 57 -13.3 57 -9.75 L 57 9.75 Q 57 13.3 54 13.3 L 48 13.3 Q 43 13.3 43 9.75 Z" },
      { role: "steel", d: "M 46 -13.3 L 46.8 -13.3 L 46.8 13.3 L 46 13.3 Z", opacity: 0.35 },
      { role: "steel", d: "M 49 -13.3 L 49.8 -13.3 L 49.8 13.3 L 49 13.3 Z", opacity: 0.35 },
      { role: "steel", d: "M 52 -14 L 52.8 -14 L 52.8 14 L 52 14 Z", opacity: 0.35 },
      { role: "steel", d: "M 55 -14 L 55.8 -14 L 55.8 14 L 55 14 Z", opacity: 0.35 },
      { role: "dark", d: "M 55 -13.13 L 56 -14 L 59 -14 Q 61 -14 61 -11.38 L 61 11.38 Q 61 14 59 14 L 56 14 L 55 13.13 Z" },
      // Fixed metal teeth in the bumper face, clear of the stream hole.
      { role: "steel", d: "M 55.5 -13 L 59 -10.5 L 55.5 -8.5 Z" },
      { role: "steel", d: "M 56.5 -6.5 L 61 -4.5 L 56.5 -3 Z" },
      { role: "steel", d: "M 56.5 3 L 61 4.5 L 56.5 6.5 Z" },
      { role: "steel", d: "M 55.5 8.5 L 59 10.5 L 55.5 13 Z" },
      { role: "dark", d: HUB, t: "translate(15 -9)" },
    ],
    shutoff: {
      hit: { x: 15, y: -13, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(15 -9) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(15 -9) rotate(175)" }],
    },
  },
  top: {
    tipX: 190,
    ring: { from: 108, to: 130, r: 15.5, ink: "#1f4e9c" },
    pressure: null,
    collar: { from: 135, to: 166, r: 19, ribs: 12, ink: "#aab2b8" },
    shutoff: { kind: "bale", pivotX: 60, arm: 46, offset: 17 },
    shell: [
      // Swivel: steel face (21 units = 1½ in), black body, rocker lugs.
      { role: "steel", d: "M 36 77.5 L 40 77.5 L 40 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 39 77 Q 39 75.5 40.5 75.5 L 50 75.5 Q 52 75.5 52 77.5 L 52 98.5 Q 52 100.5 50 100.5 L 40.5 100.5 Q 39 100.5 39 99 Z" },
      { role: "dark", d: "M 42 75.5 L 50 75.5 L 50 71.5 Q 50 70 48 70 L 44 70 Q 42 70 42 71.5 Z" },
      { role: "dark", d: "M 42 100.5 L 50 100.5 L 50 104.5 Q 50 106 48 106 L 44 106 Q 42 106 42 104.5 Z" },
      { role: "steel", d: "M 41.5 75.5 L 42.5 75.5 L 42.5 100.5 L 41.5 100.5 Z", opacity: 0.4 },
      // Body and the loop lever's pivot plate.
      { role: "dark", d: "M 50 75 Q 50 74 51 74 L 107 74 Q 109 74 109 76 L 109 100 Q 109 102 107 102 L 51 102 Q 50 102 50 100.5 Z" },
      { role: "steel", d: "M 58 83 a 5 5 0 1 0 0 10 a 5 5 0 1 0 0 -10 Z" },
      { role: "dark", d: "M 58 84.6 a 3.4 3.4 0 1 0 0 6.8 a 3.4 3.4 0 1 0 0 -6.8 Z" },
      { role: "steel", d: "M 58 86.4 a 1.6 1.6 0 1 0 0 3.2 a 1.6 1.6 0 1 0 0 -3.2 Z" },
      // Rear knurl, white flow band, front knurl.
      { role: "dark", d: "M 104 73.5 L 108 73.5 L 108 102.5 L 104 102.5 Z" },
      { role: "steel", d: "M 105.2 73.5 L 105.9 73.5 L 105.9 102.5 L 105.2 102.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 106.8 73.5 L 107.5 73.5 L 107.5 102.5 L 106.8 102.5 Z", opacity: 0.35 },
      { role: "label", d: "M 108 72.5 L 130 72.5 L 130 103.5 L 108 103.5 Z" },
      { role: "steel", d: "M 110 72.5 L 110.7 72.5 L 110.7 103.5 L 110 103.5 Z", opacity: 0.3 },
      { role: "steel", d: "M 127.3 72.5 L 128 72.5 L 128 103.5 L 127.3 103.5 Z", opacity: 0.3 },
      { role: "dark", d: "M 130 73.5 L 135 73.5 L 135 102.5 L 130 102.5 Z" },
      { role: "steel", d: "M 131.4 73.5 L 132.1 73.5 L 132.1 102.5 L 131.4 102.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 133.2 73.5 L 133.9 73.5 L 133.9 102.5 L 133.2 102.5 Z", opacity: 0.35 },
      // Big ribbed pattern collar and the bumper ring.
      { role: "dark", d: "M 135 73 Q 135 69 139 69 L 162 69 Q 166 69 166 73 L 166 103 Q 166 107 162 107 L 139 107 Q 135 107 135 103 Z" },
      { role: "steel", d: "M 140 69.6 L 161 69.6 L 161 70.6 L 140 70.6 Z", opacity: 0.3 },
      { role: "dark", d: "M 164 69 L 166 68 L 170 68 L 187 68 Q 190 68 190 71 L 190 105 Q 190 108 187 108 L 170 108 L 166 108 L 164 107 Z" },
      { role: "steel", d: "M 186.5 68.6 L 190 69.6 L 190 106.4 L 186.5 107.4 Z", opacity: 0.55 },
      // Fixed metal teeth crown at the tip face.
      { role: "steel", d: "M 190 73 L 181 77.5 L 190 82 Z" },
      { role: "steel", d: "M 190 84 L 184 88 L 190 92 Z" },
      { role: "steel", d: "M 190 94 L 181 98.5 L 190 103 Z" },
    ],
  },
} satisfies NozzleArt;
