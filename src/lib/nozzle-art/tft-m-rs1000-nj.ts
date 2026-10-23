import type { NozzleArt } from "./types.ts";

/**
 * Task Force Tips Master Stream 1000, 2½ in NH (TFT-M-RS1000-NJ), from the
 * refs2 photo set (tft-m-rs1000-0/1/2/3) and the TFT plate render
 * (docs/reference/nozzles/photos/refs/tft-m-rs1000-nj_01-10.png): a long master stream with no shutoff and
 * no grip. Wide 2½ in NH swivel inlet with rocker lugs, the light blue/white
 * gallonage band (250/350/500/750/1000 gpm) just behind the inlet, the big
 * scalloped carrying/selection ring around the mid-body, a many-ribbed pattern
 * collar, and a wide bumper whose front rim carries a crown of about 48 thin black rubber fingers (blunt, parallel to the axis). Topped by a
 * ~100 psi operating band; the anatomy says shutoff "none".
 */
export default {
  side: {
    length: 64,
    exit: { x: 64, half: 3 },
    flowLabel: { x: 9, y: -14 },
    shell: [
      // 2½ in NH coupling face and the swivel body, with the rocker lugs.
      { role: "steel", d: "M 0 -8.5 L 2 -8.5 L 2 8.5 L 0 8.5 Z" },
      { role: "dark", d: "M 1.8 -8.5 Q 1.8 -9 2.3 -9 L 5 -9 Q 5.5 -9 5.5 -8.5 L 5.5 8.5 Q 5.5 9 5 9 L 2.3 9 Q 1.8 9 1.8 8.5 Z" },
      { role: "dark", d: "M 2.5 -9 L 4.8 -9 L 4.8 -11.8 Q 4.8 -12.3 4.3 -12.3 L 3 -12.3 Q 2.5 -12.3 2.5 -11.8 Z" },
      { role: "dark", d: "M 2.5 9 L 4.8 9 L 4.8 11.8 Q 4.8 12.3 4.3 12.3 L 3 12.3 Q 2.5 12.3 2.5 11.8 Z" },
      // Body under the gallonage band and the big selection ring.
      { role: "dark", d: "M 5 -8.5 L 13.5 -8.5 L 13.5 8.5 L 5 8.5 Z" },
      // The light gallonage band (the component prints the rated flow here).
      { role: "label", d: "M 5.5 -9 L 12.5 -9 L 12.5 9 L 5.5 9 Z" },
      { role: "dark", d: "M 5.5 -9 L 6.5 -9 L 6.5 9 L 5.5 9 Z", opacity: 0.4 },
      { role: "dark", d: "M 11.5 -9 L 12.5 -9 L 12.5 9 L 11.5 9 Z", opacity: 0.4 },
      // The big scalloped ring seen edge-on: its two lobes past the body.
      { role: "dark", d: "M 12.6 -8.5 Q 12.2 -14.2 15 -14.2 Q 17.8 -14.2 17.4 -8.5 Z" },
      { role: "dark", d: "M 12.6 8.5 Q 12.2 14.2 15 14.2 Q 17.8 14.2 17.4 8.5 Z" },
      { role: "dark", d: "M 17 -8.5 L 19 -8.5 L 19 8.5 L 17 8.5 Z" },
      // The many-ribbed pattern collar.
      { role: "dark", d: "M 18.8 -8.5 Q 18.8 -10.5 20 -10.5 L 30.3 -10.5 Q 31.5 -10.5 31.5 -8.5 L 31.5 8.5 Q 31.5 10.5 30.3 10.5 L 20 10.5 Q 18.8 10.5 18.8 8.5 Z" },
      { role: "steel", d: "M 21 -10.5 L 22 -10.5 L 22 10.5 L 21 10.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 23.5 -10.5 L 24.5 -10.5 L 24.5 10.5 L 23.5 10.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 26 -10.5 L 27 -10.5 L 27 10.5 L 26 10.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 28.5 -10.5 L 29.5 -10.5 L 29.5 10.5 L 28.5 10.5 Z", opacity: 0.35 },
      // Smooth barrel, then the wide bumper that carries the metal teeth.
      { role: "dark", d: "M 30.5 -8.5 L 47 -8.5 L 47 8.5 L 30.5 8.5 Z" },
      { role: "dark", d: "M 46 -8.5 L 49 -11.5 Q 49.5 -12.4 50.5 -12.4 L 58 -12.4 Q 61 -12.4 61 -9.4 L 61 9.4 Q 61 12.4 58 12.4 L 50.5 12.4 Q 49.5 12.4 49 11.5 L 46 8.5 Z" },
      { role: "steel", d: "M 51 -12.4 L 52 -12.4 L 52 12.4 L 51 12.4 Z", opacity: 0.4 },
      { role: "steel", d: "M 55 -12.4 L 56 -12.4 L 56 12.4 L 55 12.4 Z", opacity: 0.4 },
      { role: "steel", d: "M 59 -12.4 L 60 -12.4 L 60 12.4 L 59 12.4 Z", opacity: 0.4 },
      // Crown of thin rubber fingers around the mouth, seen from the side.
      { role: "dark", d: "M 61 -9 L 64 -9 L 64 -7.9 L 61 -7.9 Z M 61 -7 L 64 -7 L 64 -5.9 L 61 -5.9 Z M 61 -5 L 64 -5 L 64 -3.9 L 61 -3.9 Z M 61 -3 L 64 -3 L 64 -1.9 L 61 -1.9 Z M 61 -1 L 64 -1 L 64 0.1 L 61 0.1 Z M 61 1 L 64 1 L 64 2.1 L 61 2.1 Z M 61 3 L 64 3 L 64 4.1 L 61 4.1 Z M 61 5 L 64 5 L 64 6.1 L 61 6.1 Z M 61 7 L 64 7 L 64 8.1 L 61 8.1 Z" },
    ],
    // No valve: a master stream has no shutoff.
    shutoff: null,
  },
  top: {
    tipX: 247,
    ring: { from: 58, to: 80, r: 21, ink: "#1c3f6e" },
    pressure: null,
    collar: { from: 100, to: 142, r: 24, ribs: 20, ink: "#7d8790" },
    shutoff: { kind: "none" },
    shell: [
      // 2½ in NH coupling ring, swivel body, and the rocker lugs.
      { role: "steel", d: "M 36 67 L 41 67 L 41 109 L 36 109 Z" },
      { role: "dark", d: "M 40 66 Q 40 64 43 64 L 52 64 Q 56 64 56 68 L 56 108 Q 56 112 52 112 L 43 112 Q 40 112 40 108 Z" },
      { role: "dark", d: "M 43 56 L 50 56 Q 51 56 51 57.5 L 51 64 L 43 64 Z" },
      { role: "dark", d: "M 43 112 L 51 112 L 51 118.5 Q 51 120 50 120 L 43 120 Z" },
      // Body under the band and the big selection ring.
      { role: "dark", d: "M 55 68 L 100 68 L 100 108 L 55 108 Z" },
      // The light gallonage band the ring numbers print on.
      { role: "label", d: "M 58 67 L 80 67 L 80 109 L 58 109 Z" },
      { role: "dark", d: "M 58 67 L 59.5 67 L 59.5 109 L 58 109 Z", opacity: 0.4 },
      { role: "dark", d: "M 78.5 67 L 80 67 L 80 109 L 78.5 109 Z", opacity: 0.4 },
      // The big scalloped ring, edge-on: its lobes beyond the body.
      { role: "dark", d: "M 81 68 Q 81 57 86 57 Q 91 57 91 68 Z" },
      { role: "dark", d: "M 81 108 Q 81 119 86 119 Q 91 119 91 108 Z" },
      // The many-ribbed pattern collar (the component slides its ridges here).
      { role: "dark", d: "M 100 66 Q 100 62 104 62 L 138 62 Q 142 62 142 66 L 142 110 Q 142 114 138 114 L 104 114 Q 100 114 100 110 Z" },
      // Smooth barrel and the wide bumper that carries the teeth.
      { role: "dark", d: "M 141 68 L 194 68 L 194 108 L 141 108 Z" },
      { role: "dark", d: "M 192 68 L 202 60 Q 206 58 210 60 L 230 62 Q 236 62 236 67 L 236 109 Q 236 114 230 114 L 210 116 Q 206 118 202 116 L 192 108 Z" },
      { role: "steel", d: "M 204 62 L 205 62 L 205 114 L 204 114 Z", opacity: 0.3 },
      { role: "steel", d: "M 214 61 L 215 61 L 215 115 L 214 115 Z", opacity: 0.3 },
      { role: "steel", d: "M 224 63 L 225 63 L 225 113 L 224 113 Z", opacity: 0.3 },
      // Crown of thin rubber fingers on the bumper's front rim, parallel to the axis.
      { role: "dark", d: "M 236 64.0 L 247 64.0 L 247 65.7 L 236 65.7 Z M 236 67.6 L 247 67.6 L 247 69.3 L 236 69.3 Z M 236 71.2 L 247 71.2 L 247 72.9 L 236 72.9 Z M 236 74.8 L 247 74.8 L 247 76.5 L 236 76.5 Z M 236 78.4 L 247 78.4 L 247 80.1 L 236 80.1 Z M 236 82.0 L 247 82.0 L 247 83.7 L 236 83.7 Z M 236 85.6 L 247 85.6 L 247 87.3 L 236 87.3 Z M 236 89.2 L 247 89.2 L 247 90.9 L 236 90.9 Z M 236 92.8 L 247 92.8 L 247 94.5 L 236 94.5 Z M 236 96.4 L 247 96.4 L 247 98.1 L 236 98.1 Z M 236 100.0 L 247 100.0 L 247 101.7 L 236 101.7 Z M 236 103.6 L 247 103.6 L 247 105.3 L 236 105.3 Z M 236 107.2 L 247 107.2 L 247 108.9 L 236 108.9 Z M 236 110.8 L 247 110.8 L 247 112.5 L 236 112.5 Z" },
      { role: "steel", d: "M 246 64 L 247 64 L 247 112.4 L 246 112.4 Z", opacity: 0.3 },
    ],
  },
} satisfies NozzleArt;
