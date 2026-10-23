import type { NozzleArt } from "./types.ts";

/**
 * Task Force Tips G-Force selectable GF3D2S (75 psi build), from the refs
 * photo set (tft-gf3c1s_00-94/96, tft-gf3d2s, wb-GF3D2S, q-tft-gforce):
 * black one-piece 1½ in handline — swivel inlet with rocker lugs, body with
 * the white G-Force plate, curved ribbed slide handle on the top rear, raked
 * pistol grip with finger grooves, a dark numbered gallonage ring
 * (30/60/95/125/150 gpm) with a red flash, the ribbed pattern collar, and the
 * big grooved bumper with spinning metal teeth at the tip. The 100 psi build
 * (GF3C2S) is the same shell; only the barrel's pressure label differs, and
 * that label is printed, not drawn here, so the two arts match.
 */

/** The knurl ridges along the handle's grip, carried with it in both poses. */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 58,
    exit: { x: 58, half: 3 },
    flowLabel: { x: 34, y: -16 },
    shell: [
      // Inlet coupling face, swivel boss, rocker lugs.
      { role: "steel", d: "M 0 -8.05 L 2.5 -8.05 L 2.5 8.05 L 0 8.05 Z" },
      { role: "dark", d: "M 1.5 7.28 Q 1.5 8.05 2.5 8.05 L 6.5 8.05 Q 9.5 8.05 9.5 5.75 L 9.5 -5.75 Q 9.5 -8.05 6.5 -8.05 L 2.5 -8.05 Q 1.5 -8.05 1.5 -7.28 Z" },
      { role: "dark", d: "M 3 -10.5 L 7 -10.5 L 7 -13.5 Q 7 -14.5 6 -14.5 L 4 -14.5 Q 3 -14.5 3 -13.5 Z" },
      { role: "dark", d: "M 3 10.5 L 7 10.5 L 7 13.5 Q 7 14.5 6 14.5 L 4 14.5 Q 3 14.5 3 13.5 Z" },
      // Body with the G-Force plate, and the valve housing under the slide.
      { role: "dark", d: "M 8 -7.65 Q 8 -8.05 9 -8.05 L 25 -8.05 Q 27 -8.05 27 -6.44 L 27 6.44 Q 27 8.05 25 8.05 L 9 8.05 Q 8 8.05 8 7.65 Z" },
      { role: "label", d: "M 12.5 -5 L 21 -5 L 21 0.5 L 12.5 0.5 Z" },
      { role: "dark", d: "M 10 -10 L 23 -10 L 23 -12 Q 23 -12.5 22 -12.5 L 11 -12.5 Q 10 -12.5 10 -12 Z" },
      // Pistol grip with its finger grooves.
      { role: "grip", d: "M 13 9.5 L 23 9.5 L 21 17 Q 20.5 19.5 17.5 19.5 L 15 19.5 Q 12.5 19.5 12.5 16.5 Z" },
      { role: "steel", d: "M 15 12 L 15.8 12 L 15.8 18 L 15 18 Z", opacity: 0.25 },
      { role: "steel", d: "M 18 11.5 L 18.8 11.5 L 18.8 18.5 L 18 18.5 Z", opacity: 0.25 },
      // Barrel and the flow index knob on its top.
      { role: "dark", d: "M 26 -7.35 L 31 -7.35 L 31 7.35 L 26 7.35 Z" },
      { role: "dark", d: "M 27 -8.5 L 33 -8.5 L 33 -11.5 Q 33 -12.5 32 -12.5 L 28 -12.5 Q 27 -12.5 27 -11.5 Z" },
      { role: "steel", d: "M 28 -12.5 L 32 -12.5 L 32 -11.8 L 28 -11.8 Z", opacity: 0.3 },
      // Dark numbered gallonage ring with a red flash and a knurl line.
      { role: "dark", d: "M 25 -6.98 Q 25 -7.35 26 -7.35 L 27 -7.35 L 27 7.35 L 26 7.35 Q 25 7.35 25 6.98 Z" },
      { role: "dark", d: "M 30 -8.75 L 39 -8.75 L 39 8.75 L 30 8.75 Z" },
      { role: "red", d: "M 30.5 -8.75 L 31.8 -8.75 L 31.8 8.75 L 30.5 8.75 Z" },
      { role: "steel", d: "M 36.5 -8.75 L 37.3 -8.75 L 37.3 8.75 L 36.5 8.75 Z", opacity: 0.35 },
      // Pattern collar with its ribs.
      { role: "dark", d: "M 38 -9.69 Q 38 -10.15 39 -10.15 L 45 -10.15 L 45 10.15 L 39 10.15 Q 38 10.15 38 9.69 Z" },
      { role: "steel", d: "M 40 -10.15 L 40.8 -10.15 L 40.8 10.15 L 40 10.15 Z", opacity: 0.35 },
      { role: "steel", d: "M 42 -10.15 L 42.8 -10.15 L 42.8 10.15 L 42 10.15 Z", opacity: 0.35 },
      { role: "steel", d: "M 44 -10.15 L 44.8 -10.15 L 44.8 10.15 L 44 10.15 Z", opacity: 0.35 },
      // Bumper with its axial grooves, and the spinning metal teeth at the tip.
      { role: "dark", d: "M 44 -12.25 L 52 -12.25 Q 58 -12.25 58 -6.6 L 58 6.6 Q 58 12.25 52 12.25 L 44 12.25 Z" },
      { role: "steel", d: "M 47 -12.25 L 47.8 -12.25 L 47.8 12.25 L 47 12.25 Z", opacity: 0.35 },
      { role: "steel", d: "M 50.5 -12.25 L 51.3 -12.25 L 51.3 12.25 L 50.5 12.25 Z", opacity: 0.35 },
      { role: "steel", d: "M 52.5 -12.25 Q 58 -12.25 58 -6.13 L 58 6.13 Q 58 12.25 52.5 12.25 Z M 53.5 8.17 Q 57 8.17 57 5.1 L 57 -5.1 Q 57 -8.17 53.5 -8.17 Z" },
      { role: "dark", d: HUB, t: "translate(17 -8)" },
    ],
    shutoff: {
      hit: { x: 17, y: -12, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(17 -8) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(17 -8) rotate(175)" }],
    },
  },
  top: {
    tipX: 176,
    ring: { from: 110, to: 130, r: 12.5, ink: "#e8eaec" },
    pressure: null,
    collar: { from: 130, to: 150, r: 14.5, ribs: 12, ink: "#6a737b" },
    shutoff: { kind: "bale", pivotX: 70, arm: 46, offset: 17 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 77.5 L 40 77.5 L 40 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 39 77.5 Q 39 76.5 40 76.5 L 56 76.5 Q 59 76.5 59 79.5 L 59 96.5 Q 59 99.5 56 99.5 L 40 99.5 Q 39 99.5 39 98.5 Z" },
      { role: "dark", d: "M 46 76.5 L 56 76.5 L 56 70.5 Q 56 68.5 53.5 68.5 L 48 68.5 Q 46 68.5 46 70.5 Z" },
      { role: "dark", d: "M 46 99.5 L 56 99.5 L 56 105.5 Q 56 107.5 53.5 107.5 L 48 107.5 Q 46 107.5 46 105.5 Z" },
      { role: "dark", d: "M 58 76.5 L 92 76.5 Q 94 76.5 94 78.5 L 94 97.5 Q 94 99.5 92 99.5 L 58 99.5 Z" },
      // Barrel and the flow index knob on top.
      { role: "dark", d: "M 92 77.5 L 112 77.5 L 112 98.5 L 92 98.5 Z" },
      { role: "dark", d: "M 99 80 L 107 80 Q 109 80 109 84 L 109 92 Q 109 96 107 96 L 99 96 Q 97 96 97 92 L 97 84 Q 97 80 99 80 Z" },
      { role: "steel", d: "M 100 80 L 106 80 L 106 81.4 L 100 81.4 Z", opacity: 0.3 },
      // Dark numbered gallonage ring with a red flash.
      { role: "dark", d: "M 110 75.5 L 130 75.5 L 130 100.5 L 110 100.5 Z" },
      { role: "red", d: "M 127.5 75.5 L 129 75.5 L 129 100.5 L 127.5 100.5 Z" },
      { role: "steel", d: "M 112 75.5 L 112.9 75.5 L 112.9 100.5 L 112 100.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 115 75.5 L 115.9 75.5 L 115.9 100.5 L 115 100.5 Z", opacity: 0.35 },
      // Pattern collar with its ribs.
      { role: "dark", d: "M 130 73.5 L 148 73.5 Q 150 73.5 150 76 L 150 100 Q 150 102.5 148 102.5 L 130 102.5 Z" },
      { role: "steel", d: "M 133 73.5 L 133.9 73.5 L 133.9 102.5 L 133 102.5 Z", opacity: 0.3 },
      { role: "steel", d: "M 137 73.5 L 137.9 73.5 L 137.9 102.5 L 137 102.5 Z", opacity: 0.3 },
      { role: "steel", d: "M 141 73.5 L 141.9 73.5 L 141.9 102.5 L 141 102.5 Z", opacity: 0.3 },
      { role: "steel", d: "M 145 73.5 L 145.9 73.5 L 145.9 102.5 L 145 102.5 Z", opacity: 0.3 },
      // Bumper with its axial grooves.
      { role: "dark", d: "M 150 70.5 L 168 70.5 Q 176 70.5 176 78.5 L 176 97.5 Q 176 105.5 168 105.5 L 150 105.5 Z" },
      { role: "steel", d: "M 154 71 L 154.9 71 L 154.9 105 L 154 105 Z", opacity: 0.3 },
      { role: "steel", d: "M 160 71 L 160.9 71 L 160.9 105 L 160 105 Z", opacity: 0.3 },
      { role: "steel", d: "M 164 71 L 164.9 71 L 164.9 105 L 164 105 Z", opacity: 0.3 },
      // Spinning metal teeth: a steel rim at the tip face, slotted into teeth.
      { role: "steel", d: "M 168 72 Q 176 72 176 78 L 176 98 Q 176 104 168 104 Z" },
      { role: "dark", d: "M 170 72 L 171.5 72 L 171.5 104 L 170 104 Z" },
      { role: "dark", d: "M 173.5 72 L 175 72 L 175 104 L 173.5 104 Z" },
    ],
  },
} satisfies NozzleArt;
