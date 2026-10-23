import type { NozzleArt } from "./types.ts";

/**
 * MAFCO SS Series S402 (MAF-SS402), from the truck reference photo (docs/reference/nozzles/photos/truck/mafco-ss602-21.jpg):
 * black 1½ in handline — swivel inlet with rocker lugs, a bale handle
 * (a loop pivoting on both flanks of the body, as in the photo) on the
 * valve body, raked pistol grip, the bright cyan numbered
 * 30/60/95/125/150 gallonage band, a black pattern collar, and the grooved
 * bumper with stainless turbine teeth. The SS602 photo is the same body in
 * the 2½ in build; the 1½ in S402 keeps these proportions with a smaller
 * inlet and bumper. The owner confirmed (2026-10-21) the station's SS402 has a
 * bale handle on top, not a sliding lever; Safequip's "integral slide valve"
 * names the valve inside, not the handle.
 */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 56,
    exit: { x: 55, half: 2.8 },
    flowLabel: { x: 38, y: -15.2 },
    shell: [
      // Coupling face and swivel, with the rocker lugs.
      { role: "steel", d: "M 0 -11.55 L 3 -11.55 L 3 11.55 L 0 11.55 Z" },
      { role: "dark", d: "M 2 10.45 Q 2 11.55 3 11.55 L 9 11.55 Q 12 11.55 12 8.8 L 12 -8.8 Q 12 -11.55 9 -11.55 L 3 -11.55 Q 2 -11.55 2 -10.45 Z" },
      { role: "dark", d: "M 3 -10.5 L 8.5 -10.5 L 8.5 -13.5 Q 8.5 -14.5 7.5 -14.5 L 4 -14.5 Q 3 -14.5 3 -13.5 Z" },
      { role: "dark", d: "M 3 10.5 L 8.5 10.5 L 8.5 13.5 Q 8.5 14.5 7.5 14.5 L 4 14.5 Q 3 14.5 3 13.5 Z" },
      // Valve body under the bale, its plate, the bale hub, and the raked pistol grip.
      { role: "dark", d: "M 11 -8.26 Q 11 -8.75 12 -8.75 L 28 -8.75 Q 30 -8.75 30 -6.81 L 30 6.81 Q 30 8.75 28 8.75 L 12 8.75 Q 11 8.75 11 8.26 Z" },
      { role: "label", d: "M 14 -5.5 L 22 -5.5 L 22 0 L 14 0 Z" },
      { role: "dark", d: HUB, t: "translate(18 -8)" },
      { role: "grip", d: "M 14 8.5 L 22 8.5 L 21 16 Q 20.5 19 17.5 19 L 15.5 19 Q 13.5 19 13.5 16.5 Z" },
      // Barrel, the cyan gallonage band with dark knurled edges.
      { role: "dark", d: "M 29 -9.45 L 32 -9.45 L 32 9.45 L 29 9.45 Z" },
      { role: "dark", d: "M 31 -9.55 Q 31 -10.15 32 -10.15 L 34 -10.15 L 34 10.15 L 32 10.15 Q 31 10.15 31 9.55 Z" },
      { role: "blue", d: "M 33 -10.15 L 41 -10.15 L 41 10.15 L 33 10.15 Z" },
      { role: "dark", d: "M 33 -10.15 L 34 -10.15 L 34 10.15 L 33 10.15 Z" },
      { role: "dark", d: "M 40 -12.25 L 41 -12.25 L 41 12.25 L 40 12.25 Z" },
      // Black pattern collar with ribs, then the bumper.
      { role: "dark", d: "M 40 -12.25 L 46 -12.25 L 46 12.25 L 40 12.25 Z" },
      { role: "steel", d: "M 41.5 -12.25 L 42.3 -12.25 L 42.3 12.25 L 41.5 12.25 Z", opacity: 0.4 },
      { role: "steel", d: "M 44 -12.25 L 44.8 -12.25 L 44.8 12.25 L 44 12.25 Z", opacity: 0.4 },
      { role: "dark", d: "M 45 -12.25 L 51 -12.25 Q 55 -12.25 55 -7.8 L 55 7.8 Q 55 12.25 51 12.25 L 45 12.25 Z" },
      // Bumper grooves and the stainless turbine teeth.
      { role: "steel", d: "M 47 -12.25 L 48 -12.25 L 48 12.25 L 47 12.25 Z", opacity: 0.45 },
      { role: "steel", d: "M 51 -12.25 L 52 -12.25 L 52 12.25 L 51 12.25 Z", opacity: 0.45 },
      { role: "steel", d: "M 51 -9 L 55 -9 L 55 -5 L 51 -5 Z" },
      { role: "steel", d: "M 51 -2 L 54 -2 L 54 2 L 51 2 Z" },
      { role: "steel", d: "M 51 5 L 55 5 L 55 9 L 51 9 Z" },
    ],
    shutoff: {
      hit: { x: 18, y: -12, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(18 -8) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(18 -8) rotate(175)" }],
    },
  },
  top: {
    tipX: 174,
    ring: { from: 96, to: 116, r: 12.5, ink: "#f7f3ec" },
    pressure: null,
    collar: { from: 116, to: 132, r: 14, ribs: 10, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 70, arm: 46, offset: 17 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 79 L 40 79 L 40 97 L 36 97 Z" },
      { role: "dark", d: "M 39 75 Q 39 71.5 42.5 71.5 L 57 71.5 Q 60 71.5 60 75 L 60 101 Q 60 104.5 57 104.5 L 42.5 104.5 Q 39 104.5 39 101 Z" },
      { role: "dark", d: "M 46 71.5 L 56 71.5 L 56 66 Q 56 64.5 54 64.5 L 48 64.5 Q 46 64.5 46 66 Z" },
      { role: "dark", d: "M 46 104.5 L 56 104.5 L 56 110 Q 56 111.5 54 111.5 L 48 111.5 Q 46 111.5 46 110 Z" },
      { role: "dark", d: "M 59 75.5 L 94 75.5 Q 96 75.5 96 77.5 L 96 98.5 Q 96 100.5 94 100.5 L 59 100.5 Z" },
      // Cyan gallonage band with dark knurled edges.
      { role: "dark", d: "M 95 75 L 102 75 L 102 101 L 95 101 Z" },
      { role: "blue", d: "M 99 74.5 L 116 74.5 L 116 101.5 L 99 101.5 Z" },
      { role: "dark", d: "M 100 74.5 L 101 74.5 L 101 101.5 L 100 101.5 Z", opacity: 0.4 },
      { role: "dark", d: "M 114 74.5 L 115 74.5 L 115 101.5 L 114 101.5 Z", opacity: 0.4 },
      // Black pattern collar with ribs.
      { role: "dark", d: "M 116 73.5 L 134 73.5 Q 136 73.5 136 76 L 136 100 Q 136 102.5 134 102.5 L 116 102.5 Z" },
      { role: "steel", d: "M 119 73.5 L 120 73.5 L 120 102.5 L 119 102.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 124 73.5 L 125 73.5 L 125 102.5 L 124 102.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 129 73.5 L 130 73.5 L 130 102.5 L 129 102.5 Z", opacity: 0.35 },
      // Bumper with grooves and the turbine teeth at the tip face.
      { role: "dark", d: "M 132 70.5 L 158 70.5 Q 174 70.5 174 78.5 L 174 97.5 Q 174 105.5 158 105.5 L 132 105.5 Z" },
      { role: "steel", d: "M 136 70.5 L 137.2 70.5 L 137.2 105.5 L 136 105.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 144 70.5 L 145.2 70.5 L 145.2 105.5 L 144 105.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 152 70.5 L 153.2 70.5 L 153.2 105.5 L 152 105.5 Z", opacity: 0.35 },
      { role: "steel", d: "M 160 77.5 L 174 81 L 160 84.5 Z" },
      { role: "steel", d: "M 160 87 L 168 87 L 168 90 L 160 90 Z" },
      { role: "steel", d: "M 160 92.5 L 174 96 L 160 99.5 Z" },
    ],
  },
} satisfies NozzleArt;
