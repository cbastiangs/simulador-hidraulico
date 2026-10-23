import type { NozzleArt } from "./types.ts";

/**
 * Protek Style 368 high-range selectable (PRO-368), from the truck reference photo
 * (docs/reference/nozzles/photos/truck/protek-368.jpg): black 2½ in handline — large swivel inlet with rocker lugs,
 * big bale loop on the valve body, raked pistol grip, red numbered
 * 95/125/150/200/250 gallonage band, red pattern collar, and the wide grooved
 * bumper with spinning stainless teeth. The 2½ in inlet and the large bumper
 * are the family's defining proportions.
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -5 -7 L -24 -7 Q -29 -7 -29 -2 L -29 2 Q -29 7 -24 7 L -5 7 Z M -7 -2.4 L -7 2.4 L -24.5 2.4 L -24.5 -2.4 Z";
const HUB = "M -5 -5 Q -5 -7 -3 -7 L 3 -7 Q 5 -7 5 -5 L 5 5 Q 5 7 3 7 L -3 7 Q -5 7 -5 5 Z";

export default {
  side: {
    length: 60,
    exit: { x: 60, half: 4 },
    flowLabel: { x: 42, y: -21 },
    shell: [
      // 2½ in coupling face and swivel, with the rocker lugs.
      { role: "steel", d: "M 0 -14.7 L 4 -14.7 L 4 14.7 L 0 14.7 Z" },
      { role: "dark", d: "M 2 13.91 Q 2 14.7 3 14.7 L 10 14.7 Q 13 14.7 13 12.32 L 13 -12.32 Q 13 -14.7 10 -14.7 L 3 -14.7 Q 2 -14.7 2 -13.91 Z" },
      { role: "dark", d: "M 3 -18.5 L 9 -18.5 L 9 -22 Q 9 -23 8 -23 L 4.5 -23 Q 3 -23 3 -22 Z" },
      { role: "dark", d: "M 3 18.5 L 9 18.5 L 9 22 Q 9 23 8 23 L 4.5 23 Q 3 23 3 22 Z" },
      // Valve body under the bale, with its plate, and the raked pistol grip.
      { role: "dark", d: "M 12 -9.75 Q 12 -10.5 13 -10.5 L 29 -10.5 Q 32 -10.5 32 -8.25 L 32 8.25 Q 32 10.5 29 10.5 L 13 10.5 Q 12 10.5 12 9.75 Z" },
      { role: "label", d: "M 17 -9 L 27 -9 L 27 -2 L 17 -2 Z" },
      { role: "steel", d: "M 15 -16.5 L 21 -16.5 L 21 -12 L 15 -12 Z" },
      { role: "dark", d: HUB, t: "translate(18 -12)" },
      { role: "grip", d: "M 15 13.5 L 25 13.5 L 24 20 Q 23.5 23 20.5 23 L 18 23 Q 15.5 23 15.5 19.5 Z" },
      // Barrel, then the red gallonage band with dark knurled edges.
      { role: "dark", d: "M 31 -11.55 L 34 -11.55 L 34 11.55 L 31 11.55 Z" },
      { role: "dark", d: "M 33 -11.09 Q 33 -11.55 34 -11.55 L 38 -11.55 L 38 11.55 L 34 11.55 Q 33 11.55 33 11.09 Z" },
      { role: "red", d: "M 37 -12.95 L 43 -12.95 L 43 12.95 L 37 12.95 Z" },
      { role: "dark", d: "M 37 -11.55 L 38.2 -11.55 L 38.2 11.55 L 37 11.55 Z" },
      { role: "dark", d: "M 41.8 -12.95 L 43 -12.95 L 43 12.95 L 41.8 12.95 Z" },
      // Red pattern collar with dark ribs, then the wide bumper.
      { role: "dark", d: "M 42 -12.45 Q 42 -12.95 43 -12.95 L 47 -12.95 L 47 12.95 L 43 12.95 Q 42 12.95 42 12.45 Z" },
      { role: "red", d: "M 46 -15.05 L 50 -15.05 L 50 15.05 L 46 15.05 Z" },
      { role: "dark", d: "M 47.4 -15.05 L 48.3 -15.05 L 48.3 15.05 L 47.4 15.05 Z", opacity: 0.5 },
      { role: "dark", d: "M 49 -15.05 L 49.9 -15.05 L 49.9 15.05 L 49 15.05 Z", opacity: 0.5 },
      { role: "dark", d: "M 49 -15.05 L 56 -15.05 Q 60 -15.05 60 -10.62 L 60 10.62 Q 60 15.05 56 15.05 L 49 15.05 Z" },
      // Bumper grooves and the spinning metal teeth.
      { role: "steel", d: "M 51 -15.05 L 52 -15.05 L 52 15.05 L 51 15.05 Z", opacity: 0.45 },
      { role: "steel", d: "M 55 -15.05 L 56 -15.05 L 56 15.05 L 55 15.05 Z", opacity: 0.45 },
      { role: "steel", d: "M 56 -16.5 L 60 -16.5 L 60 -11 L 56 -11 Z" },
      { role: "steel", d: "M 56 -8 L 59 -8 L 59 -4 L 56 -4 Z" },
      { role: "steel", d: "M 56 4 L 59 4 L 59 8 L 56 8 Z" },
      { role: "steel", d: "M 56 11 L 60 11 L 60 16.5 L 56 16.5 Z" },
    ],
    shutoff: {
      hit: { x: 18, y: -15, r: 19 },
      open: [{ role: "dark", d: LEVER, t: "translate(18 -12) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(18 -12) rotate(175)" }],
    },
  },
  top: {
    tipX: 190,
    ring: { from: 108, to: 130, r: 17, ink: "#f7f3ec" },
    pressure: null,
    collar: { from: 134, to: 154, r: 20, ribs: 10, ink: "#2b2f33" },
    shutoff: { kind: "bale", pivotX: 80, arm: 58, offset: -20 },
    shell: [
      // 2½ in swivel: steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 70.5 L 40 70.5 L 40 105.5 L 36 105.5 Z" },
      { role: "dark", d: "M 39 70.5 Q 39 67 42.5 67 L 60 67 Q 63 67 63 70.5 L 63 105.5 Q 63 109 60 109 L 42.5 109 Q 39 109 39 105.5 Z" },
      { role: "dark", d: "M 46 67 L 56 67 L 56 61 Q 56 59.5 54 59.5 L 48 59.5 Q 46 59.5 46 61 Z" },
      { role: "dark", d: "M 46 109 L 56 109 L 56 115 Q 56 116.5 54 116.5 L 48 116.5 Q 46 116.5 46 115 Z" },
      { role: "dark", d: "M 62 73 L 104 73 Q 106 73 106 75 L 106 101 Q 106 103 104 103 L 62 103 Z" },
      { role: "steel", d: "M 82 105 a 2.5 2.5 0 1 0 0 5 a 2.5 2.5 0 1 0 0 -5 Z" },
      // Red gallonage band with dark knurled edges.
      { role: "dark", d: "M 105 73 L 118 73 L 118 103 L 105 103 Z" },
      { role: "red", d: "M 110 71.5 L 130 71.5 L 130 104.5 L 110 104.5 Z" },
      { role: "dark", d: "M 112 71.5 L 113.5 71.5 L 113.5 104.5 L 112 104.5 Z", opacity: 0.4 },
      { role: "dark", d: "M 126.5 71.5 L 128 71.5 L 128 104.5 L 126.5 104.5 Z", opacity: 0.4 },
      // Dark gap, then the red pattern collar with dark ribs.
      { role: "dark", d: "M 130 71.5 L 134 71.5 L 134 104.5 L 130 104.5 Z" },
      { role: "red", d: "M 134 69.5 L 154 69.5 Q 156 69.5 156 72 L 156 104 Q 156 106.5 154 106.5 L 134 106.5 Z" },
      { role: "dark", d: "M 136 69.5 L 137.2 69.5 L 137.2 106.5 L 136 106.5 Z", opacity: 0.5 },
      { role: "dark", d: "M 140 69.5 L 141.2 69.5 L 141.2 106.5 L 140 106.5 Z", opacity: 0.5 },
      { role: "dark", d: "M 144 69.5 L 145.2 69.5 L 145.2 106.5 L 144 106.5 Z", opacity: 0.5 },
      { role: "dark", d: "M 148 69.5 L 149.2 69.5 L 149.2 106.5 L 148 106.5 Z", opacity: 0.5 },
      { role: "dark", d: "M 152 69.5 L 153.2 69.5 L 153.2 106.5 L 152 106.5 Z", opacity: 0.5 },
      // Wide bumper with grooves and the spinning teeth at the tip face.
      { role: "dark", d: "M 154 66.5 L 176 66.5 Q 190 66.5 190 76 L 190 100 Q 190 109.5 176 109.5 L 154 109.5 Z" },
      { role: "steel", d: "M 158 66.5 L 159.2 66.5 L 159.2 109.5 L 158 109.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 166 66.5 L 167.2 66.5 L 167.2 109.5 L 166 109.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 174 66.5 L 175.2 66.5 L 175.2 109.5 L 174 109.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 181 74 L 190 77.5 L 181 81 Z" },
      { role: "steel", d: "M 181 87 L 187 87 L 187 90 L 181 90 Z" },
      { role: "steel", d: "M 181 92.5 L 190 96 L 181 99.5 Z" },
    ],
  },
} satisfies NozzleArt;
