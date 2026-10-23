import type { NozzleArt } from "./types.ts";

/**
 * TFT Mid-Matic HM-VPGI (1½ in, 70–200 gpm automatic), from the refs2
 * hm-vpgi photo set: black one-piece handline — swivel inlet with rocker
 * lugs, pistol grip raked back, a wide loop handle riding the slide valve on
 * top, knurled ring, white/red "AUTO" band, and the big grooved rubber bumper
 * with fixed rubber teeth. No selector ring: the automatic sets the flow.
 */

/** The slide handle loop and its hand hole, drawn about the valve pivot. */
const LOOP =
  "M -9 -14 Q -9 -17.6 -5.5 -17.6 L 15.5 -17.6 Q 19 -17.6 19 -14 L 19 -12 Q 19 -8.5 15.5 -8.5 L -5.5 -8.5 Q -9 -8.5 -9 -12 Z M -5 -10.5 L 15 -10.5 L 15 -14.6 L -5 -14.6 Z";
/** The two struts dropping from the loop onto the body top. */
const STRUTS = "M -3 -8.5 L 3 -8.5 L 4.5 0 L -4.5 0 Z M 12 -8.5 L 17 -8.5 L 15.5 0 L 10.5 0 Z";

export default {
  side: {
    length: 58,
    exit: { x: 58, half: 3 },
    flowLabel: { x: 45, y: -16.3 },
    shell: [
      // Coupling face and swivel, with the rocker lugs.
      { role: "steel", d: "M 0 -7.35 L 3 -7.35 L 3 7.35 L 0 7.35 Z" },
      { role: "dark", d: "M 2 9.18 Q 2 10.15 3 10.15 L 9 10.15 Q 12 10.15 12 7.73 L 12 -7.73 Q 12 -10.15 9 -10.15 L 3 -10.15 Q 2 -10.15 2 -9.18 Z" },
      { role: "dark", d: "M 3 -10.5 L 8.5 -10.5 L 8.5 -13.5 Q 8.5 -14.5 7.5 -14.5 L 4 -14.5 Q 3 -14.5 3 -13.5 Z" },
      { role: "dark", d: "M 3 10.5 L 8.5 10.5 L 8.5 13.5 Q 8.5 14.5 7.5 14.5 L 4 14.5 Q 3 14.5 3 13.5 Z" },
      // Body, its valve boss, the pivot bolt, and the raked pistol grip.
      { role: "dark", d: "M 11 -7.93 Q 11 -8.4 12 -8.4 L 29 -8.4 Q 31 -8.4 31 -6.53 L 31 6.53 Q 31 8.4 29 8.4 L 12 8.4 Q 11 8.4 11 7.93 Z" },
      { role: "dark", d: "M 15 -11 L 28 -11 Q 29 -11 29 -10 L 29 -8.5 L 15 -8.5 Z" },
      { role: "steel", d: "M 11.5 -10.5 L 16 -10.5 L 16 -6.5 L 11.5 -6.5 Z" },
      { role: "grip", d: "M 14 8.5 L 22 8.5 L 21 16 Q 20.5 19 17.5 19 L 15.5 19 Q 13.5 19 13.5 16.5 Z" },
      { role: "steel", d: "M 15 11.5 L 20.5 11.5 L 20.5 12.3 L 15 12.3 Z", opacity: 0.35 },
      { role: "steel", d: "M 14.8 14 L 20 14 L 20 14.8 L 14.8 14.8 Z", opacity: 0.35 },
      { role: "steel", d: "M 14.2 16.5 L 19.2 16.5 L 19.2 17.3 L 14.2 17.3 Z", opacity: 0.35 },
      // Barrel: knurled ring, the white/red AUTOMATIC band, another knurl.
      { role: "dark", d: "M 30 -9.45 L 33.5 -9.45 L 33.5 9.45 L 30 9.45 Z" },
      { role: "dark", d: "M 32.5 -12.52 Q 32.5 -13.3 33.5 -13.3 L 36 -13.3 L 36 13.3 L 33.5 13.3 Q 32.5 13.3 32.5 12.52 Z" },
      { role: "label", d: "M 35 -13.3 L 41.5 -13.3 L 41.5 13.3 L 35 13.3 Z" },
      { role: "red", d: "M 35 -7.5 L 41.5 -7.5 L 41.5 -4.5 L 35 -4.5 Z" },
      { role: "dark", d: "M 36.5 -1.5 L 40 -1.5 L 40 5 L 36.5 5 Z" },
      { role: "dark", d: "M 41 -12.52 Q 41 -13.3 42 -13.3 L 44 -13.3 L 44 13.3 L 42 13.3 Q 41 13.3 41 12.52 Z" },
      // Grooved rubber bumper, then the fixed rubber teeth round its mouth.
      { role: "dark", d: "M 43 -13.3 L 54 -13.3 Q 56 -13.3 56.5 -9.31 L 56.5 9.31 Q 56 13.3 54 13.3 L 43 13.3 Z" },
      { role: "steel", d: "M 46 -13.3 L 47 -13.3 L 47 13.3 L 46 13.3 Z", opacity: 0.35 },
      { role: "steel", d: "M 50 -13.3 L 51 -13.3 L 51 13.3 L 50 13.3 Z", opacity: 0.35 },
      { role: "dark", d: "M 55 -9.5 Q 58 -9.5 58 -7.5 L 58 -4.5 Q 58 -3.5 56.5 -3.5 L 55 -3.5 Z" },
      { role: "dark", d: "M 55 -2 Q 58 -2 58 0 Q 58 2 55 2 Z" },
      { role: "dark", d: "M 55 3.5 L 56.5 3.5 Q 58 3.5 58 4.5 L 58 7.5 Q 58 9.5 55 9.5 Z" },
    ],
    shutoff: {
      hit: { x: 18, y: -16, r: 17 },
      open: [
        { role: "dark", d: LOOP, t: "translate(8 -6) rotate(8)" },
        { role: "dark", d: STRUTS, t: "translate(8 -6) rotate(8)" },
      ],
      closed: [
        { role: "dark", d: LOOP, t: "translate(18 -6) rotate(-5)" },
        { role: "dark", d: STRUTS, t: "translate(18 -6) rotate(-5)" },
      ],
    },
  },
  top: {
    tipX: 169,
    ring: null,
    pressure: null,
    collar: { from: 128, to: 164, r: 16, ribs: 10, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 72, arm: 46, offset: 18 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 77.5 L 41 77.5 L 41 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 40 76 Q 40 73.5 42.5 73.5 L 54 73.5 Q 57 73.5 57 76 L 57 100 Q 57 102.5 54 102.5 L 42.5 102.5 Q 40 102.5 40 100 Z" },
      { role: "dark", d: "M 44 74 L 52 74 L 52 69 Q 52 67.5 50 67.5 L 46 67.5 Q 44 67.5 44 69 Z" },
      { role: "dark", d: "M 56 76.5 L 76 76.5 Q 79 76.5 79 79 L 79 97 Q 79 99.5 76 99.5 L 56 99.5 Z" },
      // Barrel: knurled ring, the white/red AUTOMATIC band, more knurl.
      { role: "dark", d: "M 79 76 L 88 76 L 88 100 L 79 100 Z" },
      { role: "steel", d: "M 81 76 L 82 76 L 82 100 L 81 100 Z", opacity: 0.35 },
      { role: "steel", d: "M 84 76 L 85 76 L 85 100 L 84 100 Z", opacity: 0.35 },
      { role: "steel", d: "M 86.5 76 L 87.5 76 L 87.5 100 L 86.5 100 Z", opacity: 0.35 },
      { role: "label", d: "M 87 75 L 110 75 L 110 101 L 87 101 Z" },
      { role: "red", d: "M 87 75 L 110 75 L 110 79 L 87 79 Z" },
      { role: "dark", d: "M 91 82 L 99 82 L 99 94 L 91 94 Z" },
      { role: "dark", d: "M 108 74.5 L 113 74.5 L 113 101.5 L 108 101.5 Z" },
      { role: "steel", d: "M 109.5 74.5 L 110.5 74.5 L 110.5 101.5 L 109.5 101.5 Z", opacity: 0.35 },
      // The grooved rubber bumper that carries the turning collar.
      { role: "dark", d: "M 112 69 L 157 69 Q 164 69 164 77 L 164 99 Q 164 107 157 107 L 112 107 Z" },
      { role: "steel", d: "M 116 73 L 158 73 L 158 74.2 L 116 74.2 Z", opacity: 0.3 },
      { role: "steel", d: "M 116 82 L 162 82 L 162 83.2 L 116 83.2 Z", opacity: 0.3 },
      { role: "steel", d: "M 116 92 L 162 92 L 162 93.2 L 116 93.2 Z", opacity: 0.3 },
      { role: "steel", d: "M 116 102 L 158 102 L 158 103.2 L 116 103.2 Z", opacity: 0.3 },
      // Fixed rubber teeth on the mouth, top and bottom and across the face.
      { role: "dark", d: "M 156 69 L 165 69 L 165 65 Q 165 63 162 63 L 159 63 Q 156 63 156 65 Z" },
      { role: "dark", d: "M 156 107 L 165 107 L 165 111 Q 165 113 162 113 L 159 113 Q 156 113 156 111 Z" },
      { role: "dark", d: "M 160 71 Q 169 72 169 75.5 Q 169 79 160 80 Z" },
      { role: "dark", d: "M 161 83 Q 169 84.5 169 88 Q 169 91.5 161 93 Z" },
      { role: "dark", d: "M 160 96 Q 169 97 169 100.5 Q 169 104 160 105 Z" },
    ],
  },
} satisfies NozzleArt;
