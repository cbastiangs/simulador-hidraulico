import type { NozzleArt } from "./types.ts";

/**
 * The station's smooth-bore handline: a Viper VB9520 1½ in bail shutoff with
 * pistol grip (AKR-1420), carrying the Akron Style 1420 triple stacked tips
 * (1 in outer, 1⅛ in middle, 1¼ in base). From the truck reference photos
 * (docs/reference/nozzles/photos/truck/viper-vb9520.jpg, akron-1420.jpg): black valve body with a full loop bail, raked
 * pistol grip, and the black Pyrolite stack with its knurled step collars.
 * The 1420 alone is tip-only; this art is the complete unit the truck carries.
 * Viper publishes no length, so the 14¼ in top-view length is inferred from
 * the 1420's 8¼ in and the Viper body in the photo.
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 64,
    exit: { x: 62, half: 3.5 },
    flowLabel: null,
    shell: [
      // 1½ in swivel inlet with rocker lugs.
      { role: "brass", d: "M 0 -11.55 L 3 -11.55 L 3 11.55 L 0 11.55 Z" },
      { role: "dark", d: "M 2 10.55 Q 2 11.55 3 11.55 L 9 11.55 Q 12 11.55 12 9.04 L 12 -9.04 Q 12 -11.55 9 -11.55 L 3 -11.55 Q 2 -11.55 2 -10.55 Z" },
      { role: "dark", d: "M 3 -11.5 L 8.5 -11.5 L 8.5 -14.5 Q 8.5 -15.5 7.5 -15.5 L 4 -15.5 Q 3 -15.5 3 -14.5 Z" },
      { role: "dark", d: "M 3 11.5 L 8.5 11.5 L 8.5 14.5 Q 8.5 15.5 7.5 15.5 L 4 15.5 Q 3 15.5 3 14.5 Z" },
      // Viper valve body, its plate, the bail pivot, and the pistol grip.
      { role: "dark", d: "M 11 -9.33 Q 11 -9.8 12 -9.8 L 29 -9.8 Q 32 -9.8 32 -7.47 L 32 7.47 Q 32 9.8 29 9.8 L 12 9.8 Q 11 9.8 11 9.33 Z" },
      { role: "label", d: "M 15 -6.5 L 25 -6.5 L 25 -1 L 15 -1 Z" },
      { role: "steel", d: "M 12.5 -12 L 18 -12 L 18 -8 L 12.5 -8 Z" },
      { role: "dark", d: HUB, t: "translate(15 -9)" },
      { role: "grip", d: "M 14 10 L 23 10 L 22 17.5 Q 21.5 20 18.5 20 L 16 20 Q 13.5 20 13.5 17 Z" },
      // Viper outlet, then the 1420 stack: 1¼ in base, 1⅛ in middle, 1 in outer.
      { role: "dark", d: "M 31 -6.65 L 36 -6.65 L 36 6.65 L 31 6.65 Z" },
      { role: "dark", d: "M 35 -5.25 L 44 -5.25 Q 46 -5.25 46 -4.14 L 46 4.14 Q 46 5.25 44 5.25 L 35 5.25 Z" },
      { role: "steel", d: "M 35 -7.7 L 36.5 -7.7 L 36.5 7.7 L 35 7.7 Z" },
      { role: "dark", d: "M 45 -4.55 L 52 -4.55 Q 54 -4.55 54 -3.48 L 54 3.48 Q 54 4.55 52 4.55 L 45 4.55 Z" },
      { role: "steel", d: "M 45 -4.55 L 46.5 -4.55 L 46.5 4.55 L 45 4.55 Z" },
      { role: "dark", d: "M 53 -4.55 L 60 -4.55 Q 62 -4.55 62 -3.34 L 62 3.34 Q 62 4.55 60 4.55 L 53 4.55 Z" },
      { role: "steel", d: "M 53 -4.55 L 54.5 -4.55 L 54.5 4.55 L 53 4.55 Z" },
      // The 1 in bore at the tip face.
      { role: "dark", d: "M 61 -3.5 L 62 -3.5 L 62 3.5 L 61 3.5 Z" },
      { role: "steel", d: "M 60 -4.55 L 62 -4.55 L 62 -2.45 L 60 -2.45 Z M 60 2.45 L 62 2.45 L 62 4.55 L 60 4.55 Z" },
    ],
    shutoff: {
      hit: { x: 15, y: -13, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(15 -9) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(15 -9) rotate(175)" }],
    },
  },
  top: {
    tipX: 235.5,
    ring: null,
    pressure: null,
    collar: null,
    shutoff: { kind: "bale", pivotX: 64, arm: 50, offset: -18 },
    shell: [
      // 1½ in swivel: steel coupling ring, black body, rocker lugs, bail pin.
      { role: "brass", d: "M 36 77.5 L 40 77.5 L 40 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 39 75 Q 39 71.5 42.5 71.5 L 60 71.5 Q 63 71.5 63 75 L 63 101 Q 63 104.5 60 104.5 L 42.5 104.5 Q 39 104.5 39 101 Z" },
      { role: "dark", d: "M 46 71.5 L 56 71.5 L 56 66 Q 56 64.5 54 64.5 L 48 64.5 Q 46 64.5 46 66 Z" },
      { role: "dark", d: "M 46 104.5 L 56 104.5 L 56 110 Q 56 111.5 54 111.5 L 48 111.5 Q 46 111.5 46 110 Z" },
      { role: "dark", d: "M 62 74 L 112 74 Q 114 74 114 76 L 114 100 Q 114 102 112 102 L 62 102 Z" },
      { role: "steel", d: "M 64 103 a 2.5 2.5 0 1 0 0 5 a 2.5 2.5 0 1 0 0 -5 Z" },
      // Viper outlet and the 1420 base collar (1½ in across the threads).
      { role: "dark", d: "M 112 76 L 120 76 L 120 100 L 112 100 Z" },
      { role: "steel", d: "M 118 74 L 121 74 L 121 102 L 118 102 Z" },
      // 1¼ in base step.
      { role: "dark", d: "M 120 78.5 L 150 78.5 Q 153 78.5 153 81.5 L 153 94.5 Q 153 97.5 150 97.5 L 120 97.5 Z" },
      { role: "steel", d: "M 149 77 L 152 77 L 152 99 L 149 99 Z" },
      // 1⅛ in middle step.
      { role: "dark", d: "M 152 80.5 L 180 80.5 Q 183 80.5 183 83.5 L 183 92.5 Q 183 95.5 180 95.5 L 152 95.5 Z" },
      { role: "steel", d: "M 179 79 L 182 79 L 182 97 L 179 97 Z" },
      // 1 in outer step, with the bore at the tip face.
      { role: "dark", d: "M 182 81.5 L 226 81.5 Q 229 81.5 229 84.5 L 229 91.5 Q 229 94.5 226 94.5 L 182 94.5 Z" },
      { role: "steel", d: "M 225 80 L 228 80 L 228 96 L 225 96 Z" },
      { role: "dark", d: "M 228 84.5 L 235.5 84.5 L 235.5 91.5 L 228 91.5 Z" },
      { role: "steel", d: "M 228 81.5 L 235.5 81.5 L 235.5 84.5 L 228 84.5 Z M 228 91.5 L 235.5 91.5 L 235.5 94.5 L 228 94.5 Z" },
    ],
  },
} satisfies NozzleArt;
