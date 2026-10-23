import type { NozzleArt } from "./types.ts";

/**
 * Akron Mid-Range Turbojet Style 1723P (AKR-1723P), from the truck reference photo
 * (docs/reference/nozzles/photos/truck/akron-1723.jpg): black 1½ in handline — swivel inlet with rocker
 * lugs, body with the FM plate, the ergonomic bale loop pivoting on a square
 * bolt, raked pistol grip, a red numbered 95/125/150/200 gallonage band, a
 * red pattern collar, and the big grooved bumper with spinning metal teeth.
 * Same length and family shell as the 1720; the bands and the four-setting
 * ring are the differences.
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
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
      // Barrel, then the red gallonage band with dark knurled edges.
      { role: "dark", d: "M 30 -9.45 L 33 -9.45 L 33 9.45 L 30 9.45 Z" },
      { role: "dark", d: "M 32 -8.89 Q 32 -9.45 33 -9.45 L 36 -9.45 L 36 9.45 L 33 9.45 Q 32 9.45 32 8.89 Z" },
      { role: "red", d: "M 35 -9.45 L 40 -9.45 L 40 9.45 L 35 9.45 Z" },
      { role: "dark", d: "M 35 -9.45 L 36 -9.45 L 36 9.45 L 35 9.45 Z" },
      { role: "dark", d: "M 39 -10.15 L 40 -10.15 L 40 10.15 L 39 10.15 Z" },
      // Red pattern collar with dark ribs, then the bumper.
      { role: "dark", d: "M 39 -9.55 Q 39 -10.15 40 -10.15 L 44 -10.15 L 44 10.15 L 40 10.15 Q 39 10.15 39 9.55 Z" },
      { role: "red", d: "M 43 -12.25 L 48 -12.25 L 48 12.25 L 43 12.25 Z" },
      { role: "dark", d: "M 44.5 -12.25 L 45.3 -12.25 L 45.3 12.25 L 44.5 12.25 Z", opacity: 0.5 },
      { role: "dark", d: "M 47 -12.25 L 47.8 -12.25 L 47.8 12.25 L 47 12.25 Z", opacity: 0.5 },
      { role: "dark", d: "M 47 -12.25 L 56 -12.25 Q 61 -12.25 61 -7 L 61 7 Q 61 12.25 56 12.25 L 47 12.25 Z" },
      // Bumper grooves (axial), and the spinning metal teeth at the tip.
      { role: "steel", d: "M 49 -12.25 L 50 -12.25 L 50 12.25 L 49 12.25 Z", opacity: 0.45 },
      { role: "steel", d: "M 53 -12.25 L 54 -12.25 L 54 12.25 L 53 12.25 Z", opacity: 0.45 },
      { role: "steel", d: "M 56 -12.25 L 57 -12.25 L 57 12.25 L 56 12.25 Z", opacity: 0.45 },
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
    tipX: 186.5,
    ring: { from: 104, to: 126, r: 14, ink: "#f7f3ec" },
    pressure: null,
    collar: { from: 130, to: 146, r: 17, ribs: 4, ink: "#2b2f33" },
    shutoff: { kind: "bale", pivotX: 82, arm: 58, offset: -20 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs, bale pin.
      { role: "steel", d: "M 36 79 L 40 79 L 40 97 L 36 97 Z" },
      { role: "dark", d: "M 39 75 Q 39 71.5 42.5 71.5 L 60 71.5 Q 63 71.5 63 75 L 63 101 Q 63 104.5 60 104.5 L 42.5 104.5 Q 39 104.5 39 101 Z" },
      { role: "dark", d: "M 46 71.5 L 56 71.5 L 56 66 Q 56 64.5 54 64.5 L 48 64.5 Q 46 64.5 46 66 Z" },
      { role: "dark", d: "M 46 104.5 L 56 104.5 L 56 110 Q 56 111.5 54 111.5 L 48 111.5 Q 46 111.5 46 110 Z" },
      { role: "dark", d: "M 62 75.5 L 102 75.5 Q 104 75.5 104 77.5 L 104 98.5 Q 104 100.5 102 100.5 L 62 100.5 Z" },
      { role: "steel", d: "M 82 65.5 a 2.5 2.5 0 1 0 0 5 a 2.5 2.5 0 1 0 0 -5 Z" },
      // Red gallonage band with dark knurled edges.
      { role: "dark", d: "M 103 75 L 108 75 L 108 101 L 103 101 Z" },
      { role: "red", d: "M 107 74.5 L 126 74.5 L 126 101.5 L 107 101.5 Z" },
      { role: "dark", d: "M 107 74.5 L 108.5 74.5 L 108.5 101.5 L 107 101.5 Z", opacity: 0.4 },
      { role: "dark", d: "M 124.5 74.5 L 126 74.5 L 126 101.5 L 124.5 101.5 Z", opacity: 0.4 },
      // Dark gap, then the red pattern collar with dark ribs.
      { role: "dark", d: "M 126 74.5 L 130 74.5 L 130 101.5 L 126 101.5 Z" },
      { role: "red", d: "M 130 73.5 L 146 73.5 Q 148 73.5 148 76 L 148 100 Q 148 102.5 146 102.5 L 130 102.5 Z" },
      { role: "dark", d: "M 132 73.5 L 133.2 73.5 L 133.2 102.5 L 132 102.5 Z", opacity: 0.5 },
      { role: "dark", d: "M 136 73.5 L 137.2 73.5 L 137.2 102.5 L 136 102.5 Z", opacity: 0.5 },
      { role: "dark", d: "M 140 73.5 L 141.2 73.5 L 141.2 102.5 L 140 102.5 Z", opacity: 0.5 },
      { role: "dark", d: "M 144 73.5 L 145.2 73.5 L 145.2 102.5 L 144 102.5 Z", opacity: 0.5 },
      // Bumper with its axial grooves, and the spinning teeth at the tip face.
      { role: "dark", d: "M 146 70.5 L 170 70.5 Q 186.5 70.5 186.5 78.5 L 186.5 97.5 Q 186.5 105.5 170 105.5 L 146 105.5 Z" },
      { role: "steel", d: "M 150 70.5 L 151.2 70.5 L 151.2 105.5 L 150 105.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 158 70.5 L 159.2 70.5 L 159.2 105.5 L 158 105.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 166 70.5 L 167.2 70.5 L 167.2 105.5 L 166 105.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 178 77.5 L 186.5 80.5 L 178 83.5 Z" },
      { role: "steel", d: "M 178 88 L 184 88 L 184 91 L 178 91 Z" },
      { role: "steel", d: "M 178 92.5 L 186.5 95.5 L 178 98.5 Z" },
    ],
  },
} satisfies NozzleArt;
