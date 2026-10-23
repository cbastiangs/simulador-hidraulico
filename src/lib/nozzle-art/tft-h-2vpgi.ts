import type { NozzleArt } from "./types.ts";

/**
 * TFT Handline H-2VPGI (2½ in, 95–300 gpm automatic), from the 2vpgi-grip and
 * h-2vpgi photo set: the same black one-piece build as the HM-VPGI, one size
 * up — a visibly fatter inlet coupling, a longer loop handle on the slide
 * valve, the white/red "AUTO" band, and the big grooved rubber bumper with
 * rubber teeth. No selector ring: the automatic sets the flow.
 */

/** The slide handle loop and its hand hole, drawn about the valve pivot. */
const LOOP =
  "M -9.5 -13.5 Q -9.5 -16.6 -6 -16.6 L 16.5 -16.6 Q 20 -16.6 20 -13.5 L 20 -12.5 Q 20 -9.5 16.5 -9.5 L -6 -9.5 Q -9.5 -9.5 -9.5 -12.5 Z M -5.5 -11 L 16 -11 L 16 -14 L -5.5 -14 Z";
/** The two struts dropping from the loop onto the body top. */
const STRUTS = "M -3.5 -9.5 L 3.5 -9.5 L 5 0 L -5 0 Z M 13 -9.5 L 18 -9.5 L 16.5 0 L 11.5 0 Z";

export default {
  side: {
    length: 64,
    exit: { x: 64, half: 3.5 },
    flowLabel: { x: 50, y: -21.9 },
    shell: [
      // Coupling face and swivel, with the rocker lugs.
      { role: "steel", d: "M 0 -12.25 L 3 -12.25 L 3 12.25 L 0 12.25 Z" },
      { role: "dark", d: "M 2 16.1 Q 2 17.5 3 17.5 L 10.5 17.5 Q 14 17.5 14 14 L 14 -14 Q 14 -17.5 10.5 -17.5 L 3 -17.5 Q 2 -17.5 2 -16.1 Z" },
      { role: "dark", d: "M 3 -12.5 L 9.5 -12.5 L 9.5 -15.5 Q 9.5 -16.5 8 -16.5 L 4 -16.5 Q 3 -16.5 3 -15.5 Z" },
      { role: "dark", d: "M 3 12.5 L 9.5 12.5 L 9.5 15.5 Q 9.5 16.5 8 16.5 L 4 16.5 Q 3 16.5 3 15.5 Z" },
      // Body, its valve boss, the pivot bolt, and the raked pistol grip.
      { role: "dark", d: "M 13 -12.7 Q 13 -13.3 14 -13.3 L 32 -13.3 Q 34.5 -13.3 34.5 -10.28 L 34.5 10.28 Q 34.5 13.3 32 13.3 L 14 13.3 Q 13 13.3 13 12.7 Z" },
      { role: "dark", d: "M 18 -13 L 31 -13 Q 32 -13 32 -12 L 32 -10.5 L 18 -10.5 Z" },
      { role: "steel", d: "M 13.5 -12.5 L 19 -12.5 L 19 -8 L 13.5 -8 Z" },
      { role: "grip", d: "M 17 10.5 L 26 10.5 L 25 17 Q 24.5 19.5 21 19.5 L 19 19.5 Q 17 19.5 16.5 16.5 Z" },
      { role: "steel", d: "M 18 13.5 L 24.5 13.5 L 24.5 14.4 L 18 14.4 Z", opacity: 0.35 },
      { role: "steel", d: "M 17.6 16 L 24 16 L 24 16.9 L 17.6 16.9 Z", opacity: 0.35 },
      // Barrel: knurled ring, the white/red AUTOMATIC band, another knurl.
      { role: "dark", d: "M 33 -14.7 L 37 -14.7 L 37 14.7 L 33 14.7 Z" },
      { role: "dark", d: "M 36 -14.3 Q 36 -15.05 37 -15.05 L 40 -15.05 L 40 15.05 L 37 15.05 Q 36 15.05 36 14.3 Z" },
      { role: "label", d: "M 39 -18 L 46 -18 L 46 18 L 39 18 Z" },
      { role: "red", d: "M 39 -9 L 46 -9 L 46 -5.5 L 39 -5.5 Z" },
      { role: "dark", d: "M 40.5 -2 L 44.5 -2 L 44.5 6 L 40.5 6 Z" },
      { role: "dark", d: "M 45.5 -18 Q 45.5 -18.9 46.5 -18.9 L 48.5 -18.9 L 48.5 18.9 L 46.5 18.9 Q 45.5 18.9 45.5 18 Z" },
      // Grooved rubber bumper, then the fixed rubber teeth round its mouth.
      { role: "dark", d: "M 47 -18.9 L 59 -18.9 Q 61.5 -18.9 62 -13.61 L 62 13.61 Q 61.5 18.9 59 18.9 L 47 18.9 Z" },
      { role: "steel", d: "M 50 -18.9 L 51.2 -18.9 L 51.2 18.9 L 50 18.9 Z", opacity: 0.35 },
      { role: "steel", d: "M 54.5 -18.9 L 55.7 -18.9 L 55.7 18.9 L 54.5 18.9 Z", opacity: 0.35 },
      { role: "dark", d: "M 60.5 -12 Q 64 -12 64 -9.5 L 64 -5.5 Q 64 -4.5 62.5 -4.5 L 60.5 -4.5 Z" },
      { role: "dark", d: "M 60.5 -2.5 Q 64 -2.5 64 0 Q 64 2.5 60.5 2.5 Z" },
      { role: "dark", d: "M 60.5 4.5 L 62.5 4.5 Q 64 4.5 64 5.5 L 64 9.5 Q 64 12 60.5 12 Z" },
    ],
    shutoff: {
      hit: { x: 22, y: -17, r: 19 },
      open: [
        { role: "dark", d: LOOP, t: "translate(12 -7) rotate(8)" },
        { role: "dark", d: STRUTS, t: "translate(12 -7) rotate(8)" },
      ],
      closed: [
        { role: "dark", d: LOOP, t: "translate(22 -7) rotate(-5)" },
        { role: "dark", d: STRUTS, t: "translate(22 -7) rotate(-5)" },
      ],
    },
  },
  top: {
    tipX: 176,
    ring: null,
    pressure: null,
    collar: { from: 134, to: 171, r: 22, ribs: 12, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 74, arm: 46, offset: 22 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 70.5 L 41 70.5 L 41 105.5 L 36 105.5 Z" },
      { role: "dark", d: "M 40 67 Q 40 63 44 63 L 56 63 Q 60 63 60 67 L 60 109 Q 60 113 56 113 L 44 113 Q 40 113 40 109 Z" },
      { role: "dark", d: "M 45 63 L 55 63 L 55 57 Q 55 55 52 55 L 48 55 Q 45 55 45 57 Z" },
      { role: "dark", d: "M 45 113 L 55 113 L 55 119 Q 55 121 52 121 L 48 121 Q 45 121 45 119 Z" },
      { role: "dark", d: "M 58 70 L 82 70 Q 86 70 86 74 L 86 102 Q 86 106 82 106 L 58 106 Z" },
      // Barrel: knurled ring, the white/red AUTOMATIC band, more knurl.
      { role: "dark", d: "M 86 69 L 95 69 L 95 107 L 86 107 Z" },
      { role: "steel", d: "M 88 69 L 89.2 69 L 89.2 107 L 88 107 Z", opacity: 0.35 },
      { role: "steel", d: "M 91 69 L 92.2 69 L 92.2 107 L 91 107 Z", opacity: 0.35 },
      { role: "steel", d: "M 93.5 69 L 94.5 69 L 94.5 107 L 93.5 107 Z", opacity: 0.35 },
      { role: "label", d: "M 94 67 L 120 67 L 120 109 L 94 109 Z" },
      { role: "red", d: "M 94 67 L 120 67 L 120 73 L 94 73 Z" },
      { role: "dark", d: "M 99 79 L 109 79 L 109 97 L 99 97 Z" },
      { role: "dark", d: "M 118 66.5 L 124 66.5 L 124 109.5 L 118 109.5 Z" },
      { role: "steel", d: "M 120 66.5 L 121.2 66.5 L 121.2 109.5 L 120 109.5 Z", opacity: 0.35 },
      // The grooved rubber bumper that carries the turning collar.
      { role: "dark", d: "M 122 61 L 164 61 Q 171 61 171 70 L 171 106 Q 171 115 164 115 L 122 115 Z" },
      { role: "steel", d: "M 127 66 L 164 66 L 164 67.4 L 127 67.4 Z", opacity: 0.3 },
      { role: "steel", d: "M 127 79 L 170 79 L 170 80.4 L 127 80.4 Z", opacity: 0.3 },
      { role: "steel", d: "M 127 96 L 170 96 L 170 97.4 L 127 97.4 Z", opacity: 0.3 },
      { role: "steel", d: "M 127 109 L 164 109 L 164 110.4 L 127 110.4 Z", opacity: 0.3 },
      // Fixed rubber teeth on the mouth, top and bottom and across the face.
      { role: "dark", d: "M 161 61 L 172 61 L 172 55.5 Q 172 53 168.5 53 L 165.5 53 Q 162 53 162 55.5 Z" },
      { role: "dark", d: "M 161 115 L 172 115 L 172 120.5 Q 172 123 168.5 123 L 165.5 123 Q 162 123 162 120.5 Z" },
      { role: "dark", d: "M 167 64 Q 176 65 176 69 Q 176 73 167 75 Z" },
      { role: "dark", d: "M 168 79 Q 176 81 176 86 Q 176 91 168 93 Z" },
      { role: "dark", d: "M 167 97 Q 176 99 176 103 Q 176 107 167 109 Z" },
    ],
  },
} satisfies NozzleArt;
