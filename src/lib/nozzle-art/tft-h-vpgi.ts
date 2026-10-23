import type { NozzleArt } from "./types.ts";

/**
 * Task Force Tips H-VPGI (TFT-H-VPGI), from the t-600-h-vpgi and tft-h-vpgi-3
 * refs: the same black Ultimatic handline as the BGH but longer, with a bigger
 * bore. Swivel inlet with rocker lugs, slide rail and big ribbed slide handle
 * over the barrel, raked pistol grip, the blue/white AUTO band, and the deep
 * grooved bumper with a ring of rubber teeth. Automatic 95–300 gpm; no
 * gallonage ring.
 */

/** The dark rubber pads on the handle's crown. */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 65,
    exit: { x: 64.5, half: 4 },
    flowLabel: { x: 54, y: -22.6 },
    shell: [
      // Swivel inlet: steel face, black coupling, rocker lugs.
      { role: "steel", d: "M 0 -7.7 L 2.5 -7.7 L 2.5 7.7 L 0 7.7 Z" },
      { role: "dark", d: "M 2 -10.5 Q 2 -11.55 3.5 -11.55 L 10 -11.55 Q 12 -11.55 12 -8.92 L 12 8.92 Q 12 11.55 10 11.55 L 3.5 11.55 Q 2 11.55 2 10.5 Z" },
      { role: "dark", d: "M 3 -11 L 8 -11 L 8 -14 Q 8 -15 6.5 -15 L 4.5 -15 Q 3 -15 3 -14 Z" },
      { role: "dark", d: "M 3 11 L 8 11 L 8 14 Q 8 15 6.5 15 L 4.5 15 Q 3 15 3 14 Z" },
      // Body and its small maker's plate.
      { role: "dark", d: "M 11 -9.95 Q 11 -10.5 12 -10.5 L 31 -10.5 Q 33 -10.5 33 -8.29 L 33 8.29 Q 33 10.5 31 10.5 L 12 10.5 Q 11 10.5 11 9.95 Z" },
      { role: "steel", d: "M 14 -7 L 23 -7 L 23 -2.5 L 14 -2.5 Z", opacity: 0.85 },
      { role: "dark", d: "M 15 -6 L 21 -6 L 21 -5 L 15 -5 Z M 15 -4 L 19 -4 L 19 -3.2 L 15 -3.2 Z" },
      // Raked pistol grip with finger grooves and a butt pad.
      { role: "grip", d: "M 15 8.5 L 24.5 8.5 L 23 15 Q 22.5 18.5 20 19.2 L 16.8 19.2 Q 14.2 18.5 13.7 15 Z" },
      { role: "dark", d: "M 13.4 14.5 L 23.3 14.5 L 23 16 L 13.7 16 Z" },
      { role: "grip", d: "M 13.2 17 Q 12.7 20.2 16.3 20.2 L 20.3 20.2 Q 23.8 20.2 23.3 17 Z" },
      // Knurled collar, the AUTO band, and the second knurl.
      { role: "dark", d: "M 31 -10.5 L 34.5 -10.5 L 34.5 10.5 L 31 10.5 Z" },
      { role: "steel", d: "M 31.5 -9.8 L 32.2 -9.8 L 32.2 9.8 L 31.5 9.8 Z", opacity: 0.45 },
      { role: "label", d: "M 34 -10.5 L 42.5 -10.5 L 42.5 10.5 L 34 10.5 Z" },
      { role: "dark", d: "M 35 -10.5 L 36 -10.5 L 36 10.5 L 35 10.5 Z M 40.5 -10.5 L 41.5 -10.5 L 41.5 10.5 L 40.5 10.5 Z" },
      { role: "steel", d: "M 37.2 -10.5 L 38.4 -10.5 L 38.4 10.5 L 37.2 10.5 Z", opacity: 0.55 },
      { role: "dark", d: "M 42 -16 L 45.5 -16 L 45.5 16 L 42 16 Z" },
      { role: "steel", d: "M 42.5 -16 L 43.2 -16 L 43.2 16 L 42.5 16 Z M 44.5 -16 L 45.1 -16 L 45.1 16 L 44.5 16 Z", opacity: 0.4 },
      // Bumper with its axial grooves, then the rubber teeth and steel orifice.
      { role: "dark", d: "M 45 -19.6 L 55 -19.6 Q 62 -19.6 63 -12.25 L 63 12.25 Q 62 19.6 55 19.6 L 45 19.6 Z" },
      { role: "steel", d: "M 48 -19.6 L 49 -19.6 L 49 19.6 L 48 19.6 Z M 52 -19.6 L 53 -19.6 L 53 19.6 L 52 19.6 Z M 56 -19.27 L 57 -19.27 L 57 19.27 L 56 19.27 Z", opacity: 0.35 },
      { role: "steel", d: "M 61.5 -19.6 L 63 -19.6 L 63 19.6 L 61.5 19.6 Z", opacity: 0.55 },
      { role: "grip", d: "M 57 -12 Q 63 -12 64 -9.5 L 64 -7 Q 63 -5 57 -5 Z" },
      { role: "grip", d: "M 57 12 Q 63 12 64 9.5 L 64 7 Q 63 5 57 5 Z" },
      { role: "steel", d: "M 61 -8 Q 64 -8 64 0 Q 64 8 61 8 Z" },
      { role: "dark", d: HUB, t: "translate(20 -8)" },
    ],
    shutoff: {
      hit: { x: 20, y: -12, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(20 -8) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(20 -8) rotate(175)" }],
    },
  },
  top: {
    tipX: 183,
    ring: null,
    pressure: null,
    collar: { from: 136, to: 183, r: 28, ribs: 14, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 72, arm: 46, offset: 17 },
    shell: [
      // Swivel: steel coupling, black body, rocker lugs.
      { role: "steel", d: "M 36 77 L 40 77 L 40 99 L 36 99 Z" },
      { role: "dark", d: "M 39 74 Q 39 71.5 42 71.5 L 59 71.5 Q 62 71.5 62 74.5 L 62 101.5 Q 62 104.5 59 104.5 L 42 104.5 Q 39 104.5 39 101.5 Z" },
      { role: "dark", d: "M 46 71.5 L 57 71.5 L 57 66 Q 57 64 55 64 L 48 64 Q 46 64 46 66 Z" },
      { role: "dark", d: "M 46 104.5 L 57 104.5 L 57 110 Q 57 112 55 112 L 48 112 Q 46 112 46 110 Z" },
      // Body.
      { role: "dark", d: "M 61 73 L 103 73 Q 106 73 106 76 L 106 100 Q 106 103 103 103 L 61 103 Z" },
      // Barrel: knurl, AUTO band, second knurl.
      { role: "dark", d: "M 104 74 L 112 74 L 112 102 L 104 102 Z" },
      { role: "steel", d: "M 106 74 L 106.8 74 L 106.8 102 L 106 102 Z", opacity: 0.4 },
      { role: "label", d: "M 111 73 L 132 73 L 132 103 L 111 103 Z" },
      { role: "dark", d: "M 113 73 L 114 73 L 114 103 L 113 103 Z M 129 73 L 130 73 L 130 103 L 129 103 Z" },
      { role: "steel", d: "M 119 73 L 120.5 73 L 120.5 103 L 119 103 Z", opacity: 0.55 },
      { role: "dark", d: "M 131 74 L 136 74 L 136 102 L 131 102 Z" },
      { role: "steel", d: "M 132.5 74 L 133.3 74 L 133.3 102 L 132.5 102 Z M 135 74 L 135.7 74 L 135.7 102 L 135 102 Z", opacity: 0.4 },
      // Bumper with its axial ribs and rubber teeth around the orifice.
      { role: "dark", d: "M 136 60 L 163 60 Q 183 60 183 72 L 183 104 Q 183 116 163 116 L 136 116 Z" },
      { role: "steel", d: "M 139 68 L 179 68 L 179 69.2 L 139 69.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 139 78 L 181 78 L 181 79.2 L 139 79.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 139 97 L 181 97 L 181 98.2 L 139 98.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 139 107 L 179 107 L 179 108.2 L 139 108.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 175 60 L 180 60 L 180 116 L 175 116 Z", opacity: 0.5 },
      { role: "steel", d: "M 174 82 L 181 88 L 174 94 Z" },
    ],
  },
} satisfies NozzleArt;
