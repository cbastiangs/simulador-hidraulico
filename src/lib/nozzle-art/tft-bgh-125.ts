import type { NozzleArt } from "./types.ts";

/**
 * Task Force Tips BGH-125 Ultimatic (TFT-BGH-125), from the t-600-bgh-125 and
 * tft-bgh-125-1/3 refs: black one-piece handline with a swivel inlet and
 * rocker lugs, a low body carrying the slide rail, a raked pistol grip, a big
 * ribbed slide handle over the barrel, the blue/white AUTO band, and the deep
 * grooved bumper with a ring of rubber teeth. Automatic 10–125 gpm; no
 * gallonage ring.
 */

/** The dark rubber pads on the handle's crown. */

/** The bale loop, drawn about the pivot at the origin, extending backward (−x) with its slot cut out. */
const LEVER =
  "M -4 -5.5 L -18 -5.5 Q -22 -5.5 -22 -1.5 L -22 1.5 Q -22 5.5 -18 5.5 L -4 5.5 Z M -6 -1.8 L -6 1.8 L -18.5 1.8 L -18.5 -1.8 Z";
const HUB = "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 63,
    exit: { x: 62.5, half: 3 },
    flowLabel: { x: 52, y: -21.2 },
    shell: [
      // Swivel inlet: steel face, black coupling, rocker lugs.
      { role: "steel", d: "M 0 -7.7 L 2.5 -7.7 L 2.5 7.7 L 0 7.7 Z" },
      { role: "dark", d: "M 2 -10.5 Q 2 -11.55 3.5 -11.55 L 10 -11.55 Q 12 -11.55 12 -8.92 L 12 8.92 Q 12 11.55 10 11.55 L 3.5 11.55 Q 2 11.55 2 10.5 Z" },
      { role: "dark", d: "M 3 -11 L 8 -11 L 8 -14 Q 8 -15 6.5 -15 L 4.5 -15 Q 3 -15 3 -14 Z" },
      { role: "dark", d: "M 3 11 L 8 11 L 8 14 Q 8 15 6.5 15 L 4.5 15 Q 3 15 3 14 Z" },
      // Body and its small maker's plate.
      { role: "dark", d: "M 11 -9.95 Q 11 -10.5 12 -10.5 L 30 -10.5 Q 32 -10.5 32 -8.29 L 32 8.29 Q 32 10.5 30 10.5 L 12 10.5 Q 11 10.5 11 9.95 Z" },
      { role: "steel", d: "M 14 -7 L 23 -7 L 23 -2.5 L 14 -2.5 Z", opacity: 0.85 },
      { role: "dark", d: "M 15 -6 L 21 -6 L 21 -5 L 15 -5 Z M 15 -4 L 19 -4 L 19 -3.2 L 15 -3.2 Z" },
      // Raked pistol grip with finger grooves and a butt pad.
      { role: "grip", d: "M 15 8.5 L 24 8.5 L 22.5 15 Q 22 18.5 19.5 19 L 16.5 19 Q 14 18.5 13.5 15 Z" },
      { role: "dark", d: "M 13.2 14.5 L 22.8 14.5 L 22.5 16 L 13.5 16 Z" },
      { role: "grip", d: "M 13 17 Q 12.5 20 16 20 L 20 20 Q 23.5 20 23 17 Z" },
      // Knurled collar, the AUTO band, and the second knurl.
      { role: "dark", d: "M 30 -9.8 L 33.5 -9.8 L 33.5 9.8 L 30 9.8 Z" },
      { role: "steel", d: "M 30.5 -9.8 L 31.2 -9.8 L 31.2 9.8 L 30.5 9.8 Z", opacity: 0.45 },
      { role: "label", d: "M 33 -10.5 L 41 -10.5 L 41 10.5 L 33 10.5 Z" },
      { role: "red", d: "M 35.5 -10.5 L 38.5 -10.5 L 38.5 10.5 L 35.5 10.5 Z" },
      { role: "dark", d: "M 33.8 -10.5 L 34.5 -10.5 L 34.5 10.5 L 33.8 10.5 Z M 39.5 -10.5 L 40.2 -10.5 L 40.2 10.5 L 39.5 10.5 Z" },
      { role: "dark", d: "M 40.5 -9.8 L 44 -9.8 L 44 9.8 L 40.5 9.8 Z" },
      { role: "steel", d: "M 41 -9.8 L 41.7 -9.8 L 41.7 9.8 L 41 9.8 Z M 43 -9.8 L 43.6 -9.8 L 43.6 9.8 L 43 9.8 Z", opacity: 0.4 },
      // Bumper with its axial grooves, then the rubber teeth and steel orifice.
      { role: "dark", d: "M 43.5 -18.2 L 53 -18.2 Q 59 -18.2 61 -11.58 L 61 11.58 Q 59 18.2 53 18.2 L 43.5 18.2 Z" },
      { role: "steel", d: "M 46 -18.2 L 47 -18.2 L 47 18.2 L 46 18.2 Z M 50 -18.2 L 51 -18.2 L 51 18.2 L 50 18.2 Z M 54 -17.87 L 55 -17.87 L 55 17.87 L 54 17.87 Z", opacity: 0.35 },
      { role: "steel", d: "M 60 -18.2 L 61.5 -18.2 L 61.5 18.2 L 60 18.2 Z", opacity: 0.55 },
      { role: "grip", d: "M 55 -11 Q 61 -11 62 -9 L 62 -7 Q 61 -5.5 55 -5.5 Z" },
      { role: "grip", d: "M 55 11 Q 61 11 62 9 L 62 7 Q 61 5.5 55 5.5 Z" },
      { role: "steel", d: "M 59 -2.5 Q 61 -2.5 61 0 Q 61 2.5 59 2.5 Z" },
      { role: "dark", d: HUB, t: "translate(20 -8)" },
    ],
    shutoff: {
      hit: { x: 20, y: -12, r: 15 },
      open: [{ role: "dark", d: LEVER, t: "translate(20 -8) rotate(38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(20 -8) rotate(175)" }],
    },
  },
  top: {
    tipX: 176,
    ring: null,
    pressure: null,
    collar: { from: 133, to: 176, r: 26, ribs: 14, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 72, arm: 46, offset: 17 },
    shell: [
      // Swivel: steel coupling, black body, rocker lugs.
      { role: "steel", d: "M 36 77 L 40 77 L 40 99 L 36 99 Z" },
      { role: "dark", d: "M 39 74 Q 39 71.5 42 71.5 L 59 71.5 Q 62 71.5 62 74.5 L 62 101.5 Q 62 104.5 59 104.5 L 42 104.5 Q 39 104.5 39 101.5 Z" },
      { role: "dark", d: "M 46 71.5 L 57 71.5 L 57 66 Q 57 64 55 64 L 48 64 Q 46 64 46 66 Z" },
      { role: "dark", d: "M 46 104.5 L 57 104.5 L 57 110 Q 57 112 55 112 L 48 112 Q 46 112 46 110 Z" },
      // Body.
      { role: "dark", d: "M 61 73 L 102 73 Q 105 73 105 76 L 105 100 Q 105 103 102 103 L 61 103 Z" },
      // Barrel: knurl, AUTO band with its red block, second knurl.
      { role: "dark", d: "M 103 74 L 110 74 L 110 102 L 103 102 Z" },
      { role: "steel", d: "M 105 74 L 105.8 74 L 105.8 102 L 105 102 Z", opacity: 0.4 },
      { role: "label", d: "M 109 73 L 129 73 L 129 103 L 109 103 Z" },
      { role: "red", d: "M 116 73 L 120 73 L 120 103 L 116 103 Z" },
      { role: "dark", d: "M 111 73 L 112 73 L 112 103 L 111 103 Z M 126 73 L 127 73 L 127 103 L 126 103 Z" },
      { role: "dark", d: "M 128 74 L 134 74 L 134 102 L 128 102 Z" },
      { role: "steel", d: "M 130 74 L 130.8 74 L 130.8 102 L 130 102 Z M 132.5 74 L 133.2 74 L 133.2 102 L 132.5 102 Z", opacity: 0.4 },
      // Bumper with its axial ribs and rubber teeth around the orifice.
      { role: "dark", d: "M 133 62 L 160 62 Q 176 62 176 72 L 176 104 Q 176 114 160 114 L 133 114 Z" },
      { role: "steel", d: "M 136 70 L 172 70 L 172 71.2 L 136 71.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 136 79 L 174 79 L 174 80.2 L 136 80.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 136 96 L 174 96 L 174 97.2 L 136 97.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 136 105 L 172 105 L 172 106.2 L 136 106.2 Z", opacity: 0.35 },
      { role: "steel", d: "M 169 62 L 173 62 L 173 114 L 169 114 Z", opacity: 0.5 },
      { role: "steel", d: "M 168 83 L 174 88 L 168 93 Z" },
    ],
  },
} satisfies NozzleArt;
