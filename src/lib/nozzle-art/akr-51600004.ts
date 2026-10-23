import type { NozzleArt } from "./types.ts";

/**
 * Akron Akromatic 1250 Style 5160 (AKR-51600004), from the refs2 photo set
 * (akr-akromatic-1/5): the master-stream combination nozzle, mostly black —
 * a 2.5 in swivel inlet, a tapered body carrying a hex bolt, the wide flared
 * scalloped-finger-grip skirt that turns for pattern, a white "AKROMATIC
 * STYLE 5160" label band on the regulator housing, a stepped upper barrel and
 * a stepped metal tip with fixed teeth. No shutoff (the master valve is
 * upstream) and no gallonage ring: automatic 250-1250 gpm.
 */

export default {
  side: {
    length: 65.5,
    exit: { x: 65.5, half: 3.4 },
    flowLabel: { x: 50, y: -16 },
    shell: [
      // Swivel inlet: the coupling face, its body and the two rocker lugs.
      { role: "steel", d: "M 0 -9 L 3 -9 L 3 9 L 0 9 Z" },
      { role: "dark", d: "M 2 -8.5 Q 2 -9.5 3 -9.5 L 9.5 -9.5 Q 11 -9.5 11 -8 L 11 8 Q 11 9.5 9.5 9.5 L 3 9.5 Q 2 9.5 2 8.5 Z" },
      { role: "dark", d: "M 3 -9.5 L 9 -9.5 L 9 -13 Q 9 -14 8 -14 L 4 -14 Q 3 -14 3 -13 Z" },
      { role: "dark", d: "M 3 9.5 L 9 9.5 L 9 13 Q 9 14 8 14 L 4 14 Q 3 14 3 13 Z" },
      // The inlet body, widening up to the skirt, with the hex bolt on it.
      { role: "dark", d: "M 10 -9.5 L 34 -11.5 Q 35 -11.8 35 -10.8 L 35 10.8 Q 35 11.8 34 11.5 L 10 9.5 Z" },
      { role: "steel", d: "M 27.2 9 L 25.6 6.2 L 22.4 6.2 L 20.8 9 L 22.4 11.8 L 25.6 11.8 Z" },
      // The flared, scalloped pattern skirt: a brim opening toward the tip.
      { role: "dark", d: "M 34 -11.5 Q 36 -18 40.5 -19.8 Q 43 -20 44 -13.5 L 44 13.5 Q 43 20 40.5 19.8 Q 36 18 34 11.5 Z" },
      // The regulator housing with the white label band.
      { role: "dark", d: "M 43.5 -13.4 Q 43.5 -14 44.5 -14 L 54 -14 Q 55 -14 55 -13.4 L 55 13.4 Q 55 14 54 14 L 44.5 14 Q 43.5 14 43.5 13.4 Z" },
      { role: "label", d: "M 46.5 -13.5 L 51.5 -13.5 L 51.5 13.5 L 46.5 13.5 Z" },
      // The upper barrel, then the stepped metal tip with its fixed teeth.
      { role: "dark", d: "M 54 -6.8 Q 54 -7.5 55 -7.5 L 59.5 -7.5 Q 60.5 -7.5 60.5 -6.8 L 60.5 6.8 Q 60.5 7.5 59.5 7.5 L 55 7.5 Q 54 7.5 54 6.8 Z" },
      { role: "steel", d: "M 59.5 -5.6 Q 59.5 -6 60.3 -6 L 62 -6 L 62 6 L 60.3 6 Q 59.5 6 59.5 5.6 Z" },
      { role: "steel", d: "M 62 -4.1 Q 62 -4.5 62.6 -4.5 L 64.2 -4.5 Q 65 -4.5 65 -3.7 L 65 3.7 Q 65 4.5 64.2 4.5 L 62.6 4.5 Q 62 4.5 62 4.1 Z" },
      { role: "steel", d: "M 64.2 -4.5 L 65.5 -3 L 64.2 -1.5 L 65.5 0 L 64.2 1.5 L 65.5 3 L 64.2 4.5 Z" },
    ],
    shutoff: null,
  },
  top: {
    tipX: 288,
    ring: null,
    pressure: null,
    collar: { from: 172, to: 204, r: 39, ribs: 14, ink: "#5b656e" },
    shutoff: { kind: "none" },
    shell: [
      // Swivel inlet: steel coupling ring, black body, the two rocker lugs.
      { role: "steel", d: "M 36 70.5 L 40 70.5 L 40 105.5 L 36 105.5 Z" },
      { role: "dark", d: "M 39 71 Q 39 70.5 40 70.5 L 78.5 70.5 Q 80 70.5 80 72 L 80 104 Q 80 105.5 78.5 105.5 L 40 105.5 Q 39 105.5 39 105 Z" },
      { role: "dark", d: "M 70 70.5 L 78 70.5 L 78 66.5 Q 78 65.5 77 65.5 L 71 65.5 Q 70 65.5 70 66.5 Z" },
      { role: "dark", d: "M 70 105.5 L 78 105.5 L 78 109.5 Q 78 110.5 77 110.5 L 71 110.5 Q 70 110.5 70 109.5 Z" },
      // The inlet body, widening toward the skirt, and its hex bolt.
      { role: "dark", d: "M 79 69.5 L 169 65.2 Q 172 65 172 68 L 172 108 Q 172 111 169 110.8 L 79 106.5 Z" },
      { role: "steel", d: "M 135 66.5 L 131.5 60.4 L 124.5 60.4 L 121 66.5 L 124.5 72.6 L 131.5 72.6 Z" },
      // The flared pattern skirt (its ridges slide round as it turns).
      { role: "dark", d: "M 170 65 Q 177 53 186 48.5 Q 194 45.5 200 50 Q 205 54 206 63.5 L 206 112.5 Q 205 122 200 126 Q 194 130.5 186 127.5 Q 177 123 170 111 Z" },
      // The regulator housing with the white label band.
      { role: "dark", d: "M 204 64 Q 204 62.5 205.5 62.5 L 255.5 62.5 Q 257 62.5 257 64 L 257 112 Q 257 113.5 255.5 113.5 L 205.5 113.5 Q 204 113.5 204 112 Z" },
      { role: "label", d: "M 220 62.5 L 240 62.5 L 240 113.5 L 220 113.5 Z" },
      // The upper barrel, then the stepped metal tip with its fixed teeth.
      { role: "dark", d: "M 255 74.8 Q 255 73.8 256 73.8 L 265 73.8 Q 266 73.8 266 74.8 L 266 101.2 Q 266 102.2 265 102.2 L 256 102.2 Q 255 102.2 255 101.2 Z" },
      { role: "steel", d: "M 264 79.5 Q 264 79 264.8 79 L 278.2 79 Q 279 79 279 79.8 L 279 96.2 Q 279 97 278.2 97 L 264.8 97 Q 264 97 264 96.5 Z" },
      { role: "steel", d: "M 279 82.2 Q 279 81.8 279.7 81.8 L 285.2 81.8 Q 286 81.8 286 82.5 L 286 93.5 Q 286 94.2 285.2 94.2 L 279.7 94.2 Q 279 94.2 279 93.8 Z" },
      { role: "steel", d: "M 283.5 82.6 L 288 84 L 283.5 85.4 Z" },
      { role: "steel", d: "M 283.5 86.6 L 288 88 L 283.5 89.4 Z" },
      { role: "steel", d: "M 283.5 90.6 L 288 92 L 283.5 93.4 Z" },
    ],
  },
} satisfies NozzleArt;
