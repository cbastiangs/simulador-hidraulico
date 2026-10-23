import type { NozzleArt } from "./types.ts";

/**
 * Task Force Tips ThunderFog FTS200PS, 1 1/2 in NH pistol grip, from the
 * refs photo set (tft-fts200ps_00-10, t-600-fts200ps_00-10): black one-piece
 * body with a swivel inlet and rocker lugs, a ball valve worked by the big
 * ribbed bale loop over the body, a raked pistol grip, the white THUNDERFOG
 * band and the black numbered flow ring (30/60/95/125/150/200 GPM), the
 * ridged pattern collar and the wide bell bumper with its metal teeth.
 */

/** A single grip rib across the paddle. */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 61,
    exit: { x: 60, half: 4 },
    flowLabel: { x: 42, y: -21.0 },
    shell: [
      // Coupling face and swivel, with the rocker lugs.
      { role: "steel", d: "M 0 -9.1 L 3 -9.1 L 3 9.1 L 0 9.1 Z" },
      { role: "dark", d: "M 2 -9.5 Q 2 -10.5 3 -10.5 L 9.5 -10.5 Q 12.5 -10.5 12.5 -8 L 12.5 8 Q 12.5 10.5 9.5 10.5 L 3 10.5 Q 2 10.5 2 9.5 Z" },
      { role: "dark", d: "M 3 -10.5 L 8.5 -10.5 L 8.5 -14 Q 8.5 -15 7.5 -15 L 4 -15 Q 3 -15 3 -14 Z" },
      { role: "dark", d: "M 3 10.5 L 8.5 10.5 L 8.5 14 Q 8.5 15 7.5 15 L 4 15 Q 3 15 3 14 Z" },
      // Body with the cast 100 PSI plate, the pistol grip and the bale's pivot.
      { role: "dark", d: "M 11 -10.81 Q 11 -11.55 11.8 -11.55 L 29.4 -11.55 Q 30.4 -11.55 30.4 -10.08 L 30.4 10.08 Q 30.4 11.55 29.4 11.55 L 11.8 11.55 Q 11 11.55 11 10.81 Z" },
      { role: "label", d: "M 14 -4.5 L 21 -4.5 L 21 0.5 L 14 0.5 Z" },
      { role: "steel", d: "M 11.5 -12.5 L 17 -12.5 L 17 -8.6 L 11.5 -8.6 Z" },
      { role: "grip", d: "M 14 8.8 L 22 8.8 L 21 16 Q 20.5 19 17.5 19 L 15.5 19 Q 13.5 19 13.5 16.5 Z" },
      // White band, the black numbered flow ring, and the ridged pattern collar.
      { role: "label", d: "M 29.4 -10.5 L 37.8 -10.5 L 37.8 10.5 L 29.4 10.5 Z" },
      { role: "dark", d: "M 37.4 -11.44 Q 37.4 -11.9 38 -11.9 L 47 -11.9 Q 47.6 -11.9 47.6 -11.44 L 47.6 11.44 Q 47.6 11.9 47 11.9 L 38 11.9 Q 37.4 11.9 37.4 11.44 Z" },
      { role: "dark", d: "M 47 -12.05 Q 47 -12.6 47.8 -12.6 L 53.6 -12.6 Q 54.4 -12.6 54.4 -11.61 L 54.4 11.61 Q 54.4 12.6 53.6 12.6 L 47.8 12.6 Q 47 12.6 47 12.05 Z" },
      { role: "steel", d: "M 48.8 -12.6 L 49.4 -12.6 L 49.4 12.6 L 48.8 12.6 Z", opacity: 0.35 },
      { role: "steel", d: "M 50.8 -12.6 L 51.4 -12.6 L 51.4 12.6 L 50.8 12.6 Z", opacity: 0.35 },
      { role: "steel", d: "M 52.8 -17.99 L 53.4 -17.99 L 53.4 17.99 L 52.8 17.99 Z", opacity: 0.35 },
      // Bell bumper with its front grooves, and the metal teeth at the mouth.
      { role: "dark", d: "M 53.5 -12.22 L 57.2 -16.88 Q 59.8 -17.99 60.2 -13.33 L 60.2 13.33 Q 59.8 17.99 57.2 16.88 L 53.5 12.22 Z" },
      { role: "steel", d: "M 55.6 -17.99 L 56.1 -17.99 L 56.1 17.99 L 55.6 17.99 Z", opacity: 0.3 },
      { role: "steel", d: "M 57.4 -17.99 L 57.9 -17.99 L 57.9 17.99 L 57.4 17.99 Z", opacity: 0.3 },
      { role: "steel", d: "M 57.4 -12.2 L 60.2 -9.8 L 57.4 -7.4 Z" },
      { role: "steel", d: "M 57.4 -3 L 60.2 -1.6 L 60.2 1.6 L 57.4 3 Z" },
      { role: "steel", d: "M 57.4 7.4 L 60.2 9.8 L 57.4 12.2 Z" },
      { role: "dark", d: HUB, t: "translate(14 -8)" },
    ],
    shutoff: {
      hit: { x: 14, y: -12, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(14 -8) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(14 -8) rotate(175)" }],
    },
  },
  top: {
    tipX: 179,
    ring: { from: 126, to: 148, r: 16, ink: "#eef1f3" },
    pressure: null,
    collar: { from: 148, to: 162, r: 17, ribs: 12, ink: "#5b656f" },
    shutoff: { kind: "bale", pivotX: 72, arm: 46, offset: 17 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs, ball-lever boss.
      { role: "steel", d: "M 36 75 L 41 75 L 41 101 L 36 101 Z" },
      { role: "dark", d: "M 40 74 Q 40 73 42 73 L 66 73 Q 68 73 68 75 L 68 101 Q 68 103 66 103 L 42 103 Q 40 103 40 101 Z" },
      { role: "dark", d: "M 45 73 L 56 73 L 56 67 Q 56 65.5 54.5 65.5 L 47.5 65.5 Q 46 65.5 46 67 Z" },
      { role: "dark", d: "M 45 103 L 56 103 L 56 109 Q 56 110.5 54.5 110.5 L 47.5 110.5 Q 46 110.5 46 109 Z" },
      { role: "dark", d: "M 64 73 Q 64 71.5 66 71.5 L 104 71.5 Q 106 71.5 106 73.5 L 106 102.5 Q 106 104.5 104 104.5 L 66 104.5 Q 64 104.5 64 103 Z" },
      { role: "steel", d: "M 80.5 83.5 L 87.5 83.5 L 87.5 92.5 L 80.5 92.5 Z" },
      // White THUNDERFOG band, then the numbered flow ring and the pattern collar.
      { role: "label", d: "M 106 73 L 126 73 L 126 103 L 106 103 Z" },
      { role: "dark", d: "M 125.6 72 Q 125.6 71 127 71 L 147 71 Q 148.4 71 148.4 72 L 148.4 104 Q 148.4 105 147 105 L 127 105 Q 125.6 105 125.6 104 Z" },
      { role: "dark", d: "M 148 71 Q 148 70 149 70 L 161 70 Q 162 70 162 71 L 162 105 Q 162 106 161 106 L 149 106 Q 148 106 148 105 Z" },
      { role: "steel", d: "M 151 70.5 L 151.9 70.5 L 151.9 105.5 L 151 105.5 Z", opacity: 0.4 },
      { role: "steel", d: "M 154.5 70.5 L 155.4 70.5 L 155.4 105.5 L 154.5 105.5 Z", opacity: 0.4 },
      { role: "steel", d: "M 158 70.5 L 158.9 70.5 L 158.9 105.5 L 158 105.5 Z", opacity: 0.4 },
      // Bell bumper, its grooves, inner bore, and the fixed metal teeth.
      { role: "dark", d: "M 160 71 L 174 63.5 Q 179 62.3 179 70 L 179 106 Q 179 113.7 174 112.5 L 160 105 Z" },
      { role: "steel", d: "M 164 66.5 L 175 65.3 L 175 66.5 L 164 67.7 Z", opacity: 0.3 },
      { role: "steel", d: "M 164 109.3 L 175 110.5 L 175 111.7 L 164 110.5 Z", opacity: 0.3 },
      { role: "dark", d: "M 172 78 L 179 78 L 179 98 L 172 98 Z" },
      { role: "steel", d: "M 167 68 L 175 70.5 L 167 73 Z" },
      { role: "steel", d: "M 167 103 L 175 105.5 L 167 108 Z" },
      { role: "steel", d: "M 167 76.5 L 174 78 L 174 80.5 L 167 79 Z" },
      { role: "steel", d: "M 167 97 L 174 95.5 L 174 93 L 167 94.5 Z" },
    ],
  },
} satisfies NozzleArt;
