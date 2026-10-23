import type { NozzleArt } from "./types.ts";

/**
 * Elkhart Select-O-Matic XD, high-range (ELK-SM-XD-HIGH, 75–325 gpm) from the
 * refs2 elk-som-xd photos (2 shows the 75–325 GPM face, 5 the 100 psi / 125
 * GPM face): the same black automatic handline as the mid — swivel inlet with
 * rocker lugs, elk-heart body, round ELKHART BRASS pivot boss, loop bale, the
 * black SELECT-O-MATIC XD / AUTO band, the blue pattern collar, yellow
 * one-piece bumper and metal teeth — but a longer barrel and a taller bumper.
 * No gallonage ring (`flow` none); the AUTO band is plain shell decoration.
 */

/** The bale loop, drawn about the pivot at the origin, arching upward (−y) with its strap. */
const LEVER =
  "M -6.5 2 L -6.5 -13 Q -6.5 -22 0 -22 Q 6.5 -22 6.5 -13 L 6.5 2 L 4 2 L 4 -12.5 Q 4 -18.5 0 -18.5 Q -4 -18.5 -4 -12.5 L -4 2 Z";

export default {
  side: {
    length: 64,
    exit: { x: 64, half: 4.5 },
    flowLabel: { x: 44, y: -21.2 },
    shell: [
      // Inlet coupling face and the swivel with its rocker lugs.
      { role: "steel", d: "M 0 -10.5 L 3 -10.5 L 3 10.5 L 0 10.5 Z" },
      { role: "dark", d: "M 2 9.5 Q 2 10.5 3 10.5 L 9 10.5 Q 12 10.5 12 8 L 12 -8 Q 12 -10.5 9 -10.5 L 3 -10.5 Q 2 -10.5 2 -9.5 Z" },
      { role: "dark", d: "M 3 -10.5 L 8.5 -10.5 L 8.5 -13.5 Q 8.5 -14.5 7.5 -14.5 L 4 -14.5 Q 3 -14.5 3 -13.5 Z" },
      { role: "dark", d: "M 3 10.5 L 8.5 10.5 L 8.5 13.5 Q 8.5 14.5 7.5 14.5 L 4 14.5 Q 3 14.5 3 13.5 Z" },
      // Body, the elk-heart plate, then the round bale pivot boss and its pin.
      { role: "dark", d: "M 11 -9.28 Q 11 -9.8 12 -9.8 L 30 -9.8 Q 32 -9.8 32 -7.74 L 32 7.74 Q 32 9.8 30 9.8 L 12 9.8 Q 11 9.8 11 9.28 Z" },
      { role: "label", d: "M 27 3.5 Q 26 2.5 25 3.5 Q 24.3 4.5 25.5 5.5 L 27 7 L 28.5 5.5 Q 29.7 4.5 29 3.5 Q 28 2.5 27 3.5 Z" },
      { role: "dark", d: "M 12 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0 Z" },
      { role: "steel", d: "M 14.7 0 a 4.3 4.3 0 1 0 8.6 0 a 4.3 4.3 0 1 0 -8.6 0 Z" },
      { role: "brass", d: "M 17.5 0 a 1.5 1.5 0 1 0 3 0 a 1.5 1.5 0 1 0 -3 0 Z" },
      // Barrel: the AUTO / SELECT-O-MATIC band, then the blue pattern collar with its ribs.
      { role: "dark", d: "M 31 -9.8 L 35 -9.8 L 35 9.8 L 31 9.8 Z" },
      { role: "dark", d: "M 34 -9.8 L 43 -9.8 L 43 9.8 L 34 9.8 Z" },
      { role: "steel", d: "M 36.5 -9.8 L 37.5 -9.8 L 37.5 9.8 L 36.5 9.8 Z", opacity: 0.5 },
      { role: "steel", d: "M 40.5 -9.8 L 41.5 -9.8 L 41.5 9.8 L 40.5 9.8 Z", opacity: 0.5 },
      { role: "steel", d: "M 42 -9.8 L 51 -9.8 L 51 9.8 L 42 9.8 Z" },
      { role: "dark", d: "M 44.5 -9.8 L 45.4 -9.8 L 45.4 9.8 L 44.5 9.8 Z", opacity: 0.6 },
      { role: "dark", d: "M 47 -9.1 L 47.9 -9.1 L 47.9 9.1 L 47 9.1 Z", opacity: 0.6 },
      { role: "dark", d: "M 49.5 -18.2 L 50.4 -18.2 L 50.4 18.2 L 49.5 18.2 Z", opacity: 0.6 },
      // Yellow one-piece bumper, its axial grooves, and the fixed metal teeth.
      { role: "yellow", d: "M 50 -12.6 L 54 -12.6 Q 61 -13.3 63 -18.2 L 63.5 -18.2 Q 64 -18.2 64 -17.5 L 64 17.5 Q 64 18.2 63.5 18.2 L 63 18.2 Q 61 13.3 54 12.6 L 50 12.6 Z" },
      { role: "steel", d: "M 54 -18.2 L 54.8 -18.2 L 54.8 18.2 L 54 18.2 Z", opacity: 0.3 },
      { role: "steel", d: "M 57 -18.2 L 57.8 -18.2 L 57.8 18.2 L 57 18.2 Z", opacity: 0.3 },
      { role: "steel", d: "M 60.5 -18.2 L 61.3 -18.2 L 61.3 18.2 L 60.5 18.2 Z", opacity: 0.3 },
      { role: "steel", d: "M 60 -8 L 64 -6 L 60 -4 Z" },
      { role: "steel", d: "M 60 -3 L 64 -1 L 60 1 Z" },
      { role: "steel", d: "M 60 2 L 64 4 L 60 6 Z" },
    ],
    shutoff: {
      hit: { x: 19, y: -8, r: 17 },
      open: [{ role: "dark", d: LEVER, t: "translate(19 0) rotate(-38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(19 0) rotate(38)" }],
    },
  },
  top: {
    tipX: 218,
    ring: null,
    pressure: null,
    collar: { from: 140, to: 170, r: 15, ribs: 12, ink: "#e8eaec" },
    shutoff: { kind: "bale", pivotX: 86, arm: 50, offset: -17 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs.
      { role: "steel", d: "M 36 77.5 L 40 77.5 L 40 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 39 77 Q 39 73 43 73 L 61 73 Q 65 73 65 77 L 65 99 Q 65 103 61 103 L 43 103 Q 39 103 39 99 Z" },
      { role: "dark", d: "M 46 73 L 58 73 L 58 66 Q 58 64 56 64 L 48 64 Q 46 64 46 66 Z" },
      { role: "dark", d: "M 46 103 L 58 103 L 58 110 Q 58 112 56 112 L 48 112 Q 46 112 46 110 Z" },
      { role: "dark", d: "M 64 74 L 112 74 Q 116 74 116 78 L 116 98 Q 116 102 112 102 L 64 102 Z" },
      // The ELKHART BRASS pivot disc on the bale's flank.
      { role: "dark", d: "M 81 71 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 Z" },
      // Barrel: the AUTO / SELECT-O-MATIC band, then the blue pattern collar.
      { role: "dark", d: "M 115 75 Q 115 74 117 74 L 138 74 L 138 102 L 117 102 Q 115 102 115 100 Z" },
      { role: "steel", d: "M 120 74 L 121.5 74 L 121.5 102 L 120 102 Z", opacity: 0.5 },
      { role: "steel", d: "M 135 74 L 136.5 74 L 136.5 102 L 135 102 Z", opacity: 0.5 },
      { role: "steel", d: "M 140 74 L 170 74 L 170 102 L 140 102 Z" },
      { role: "dark", d: "M 168 75 L 176 75 L 176 101 L 168 101 Z" },
      // Yellow bumper, its grooves, and the metal teeth on the tip face.
      { role: "yellow", d: "M 172 66 Q 172 62 176 62 L 198 62 Q 214 62 218 70 L 218 106 Q 214 114 198 114 L 176 114 Q 172 114 172 110 Z" },
      { role: "steel", d: "M 180 64 L 180.8 64 L 180.8 112 L 180 112 Z", opacity: 0.3 },
      { role: "steel", d: "M 187 63 L 187.8 63 L 187.8 113 L 187 113 Z", opacity: 0.3 },
      { role: "steel", d: "M 194 62.5 L 194.8 62.5 L 194.8 113.5 L 194 113.5 Z", opacity: 0.3 },
      { role: "dark", d: "M 209 75 L 216 78 L 209 81 Z" },
      { role: "dark", d: "M 209 84 L 216 86 L 209 88 Z" },
      { role: "dark", d: "M 209 91 L 216 93 L 209 95 Z" },
      { role: "dark", d: "M 209 98 L 216 101 L 209 103 Z" },
    ],
  },
} satisfies NozzleArt;
