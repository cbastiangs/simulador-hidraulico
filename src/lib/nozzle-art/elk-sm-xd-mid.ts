import type { NozzleArt } from "./types.ts";

/**
 * Elkhart Select-O-Matic XD, mid-range (ELK-SM-XD-MID, 60–200 gpm) from the
 * refs2 elk-som-xd photos (0/2/3/5): black handline, swivel inlet with rocker
 * lugs, body carrying the elk-heart plate and the round ELKHART BRASS pivot
 * boss, and a big loop bale that swings over the top. The automatic barrel has
 * the black SELECT-O-MATIC XD / AUTO band, the blue pattern collar, and the
 * yellow one-piece bumper with fixed metal teeth. No gallonage ring (`flow`
 * none) — the AUTO band is plain shell decoration.
 */

/** The bale loop, drawn about the pivot at the origin, arching upward (−y) with its strap. */
const LEVER =
  "M -6.5 2 L -6.5 -13 Q -6.5 -22 0 -22 Q 6.5 -22 6.5 -13 L 6.5 2 L 4 2 L 4 -12.5 Q 4 -18.5 0 -18.5 Q -4 -18.5 -4 -12.5 L -4 2 Z";

export default {
  side: {
    length: 62,
    exit: { x: 62, half: 4 },
    flowLabel: { x: 42, y: -19.8 },
    shell: [
      // Inlet coupling face and the swivel with its rocker lugs.
      { role: "steel", d: "M 0 -9.8 L 3 -9.8 L 3 9.8 L 0 9.8 Z" },
      { role: "dark", d: "M 2 8.87 Q 2 9.8 3 9.8 L 9 9.8 Q 12 9.8 12 7.47 L 12 -7.47 Q 12 -9.8 9 -9.8 L 3 -9.8 Q 2 -9.8 2 -8.87 Z" },
      { role: "dark", d: "M 3 -10.5 L 8.5 -10.5 L 8.5 -13.5 Q 8.5 -14.5 7.5 -14.5 L 4 -14.5 Q 3 -14.5 3 -13.5 Z" },
      { role: "dark", d: "M 3 10.5 L 8.5 10.5 L 8.5 13.5 Q 8.5 14.5 7.5 14.5 L 4 14.5 Q 3 14.5 3 13.5 Z" },
      // Body, the elk-heart plate, then the round bale pivot boss and its pin.
      { role: "dark", d: "M 11 -8.59 Q 11 -9.1 12 -9.1 L 29 -9.1 Q 31 -9.1 31 -7.08 L 31 7.08 Q 31 9.1 29 9.1 L 12 9.1 Q 11 9.1 11 8.59 Z" },
      { role: "label", d: "M 26.5 3.5 Q 25.5 2.5 24.5 3.5 Q 23.8 4.5 25 5.5 L 26.5 7 L 28 5.5 Q 29.2 4.5 28.5 3.5 Q 27.5 2.5 26.5 3.5 Z" },
      { role: "dark", d: "M 11.5 0 a 6.5 6.5 0 1 0 13 0 a 6.5 6.5 0 1 0 -13 0 Z" },
      { role: "steel", d: "M 14 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 Z" },
      { role: "brass", d: "M 16.8 0 a 1.4 1.4 0 1 0 2.8 0 a 1.4 1.4 0 1 0 -2.8 0 Z" },
      // Barrel: the AUTO / SELECT-O-MATIC band, then the blue pattern collar with its ribs.
      { role: "dark", d: "M 30 -9.8 L 34 -9.8 L 34 9.8 L 30 9.8 Z" },
      { role: "dark", d: "M 33 -9.8 L 41 -9.8 L 41 9.8 L 33 9.8 Z" },
      { role: "steel", d: "M 35.3 -9.8 L 36.3 -9.8 L 36.3 9.8 L 35.3 9.8 Z", opacity: 0.5 },
      { role: "steel", d: "M 38.5 -9.8 L 39.5 -9.8 L 39.5 9.8 L 38.5 9.8 Z", opacity: 0.5 },
      { role: "steel", d: "M 40 -9.8 L 49 -9.8 L 49 9.8 L 40 9.8 Z" },
      { role: "dark", d: "M 42.4 -9.8 L 43.2 -9.8 L 43.2 9.8 L 42.4 9.8 Z", opacity: 0.6 },
      { role: "dark", d: "M 44.8 -9.8 L 45.6 -9.8 L 45.6 9.8 L 44.8 9.8 Z", opacity: 0.6 },
      { role: "dark", d: "M 47.2 -16.8 L 48 -16.8 L 48 16.8 L 47.2 16.8 Z", opacity: 0.6 },
      // Yellow one-piece bumper, its axial grooves, and the fixed metal teeth.
      { role: "yellow", d: "M 48 -11.9 L 52 -11.9 Q 59 -12.6 61 -16.8 L 61.5 -16.8 Q 62 -16.8 62 -16.1 L 62 16.1 Q 62 16.8 61.5 16.8 L 61 16.8 Q 59 12.6 52 11.9 L 48 11.9 Z" },
      { role: "steel", d: "M 52 -16.8 L 52.8 -16.8 L 52.8 16.8 L 52 16.8 Z", opacity: 0.3 },
      { role: "steel", d: "M 55 -16.8 L 55.8 -16.8 L 55.8 16.8 L 55 16.8 Z", opacity: 0.3 },
      { role: "steel", d: "M 58 -16.8 L 58.8 -16.8 L 58.8 16.8 L 58 16.8 Z", opacity: 0.3 },
      { role: "steel", d: "M 59 -7.5 L 62 -5.5 L 59 -3.5 Z" },
      { role: "steel", d: "M 59 -3 L 62 -1 L 59 1 Z" },
      { role: "steel", d: "M 59 1.5 L 62 3.5 L 59 5.5 Z" },
    ],
    shutoff: {
      hit: { x: 18, y: -8, r: 16 },
      open: [{ role: "dark", d: LEVER, t: "translate(18 0) rotate(-38)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(18 0) rotate(38)" }],
    },
  },
  top: {
    tipX: 206,
    ring: null,
    pressure: null,
    collar: { from: 134, to: 162, r: 14, ribs: 10, ink: "#e8eaec" },
    shutoff: { kind: "bale", pivotX: 84, arm: 46, offset: -15 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs, bale pivot pin.
      { role: "steel", d: "M 36 77.5 L 40 77.5 L 40 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 39 78 Q 39 74 43 74 L 59 74 Q 63 74 63 78 L 63 98 Q 63 102 59 102 L 43 102 Q 39 102 39 98 Z" },
      { role: "dark", d: "M 45 74 L 57 74 L 57 67 Q 57 65 55 65 L 47 65 Q 45 65 45 67 Z" },
      { role: "dark", d: "M 45 102 L 57 102 L 57 109 Q 57 111 55 111 L 47 111 Q 45 111 45 109 Z" },
      { role: "dark", d: "M 62 75 L 108 75 Q 113 75 113 79 L 113 97 Q 113 101 108 101 L 62 101 Z" },
      // The ELKHART BRASS pivot discs on the flanks (the bale swings here).
      { role: "dark", d: "M 79 73 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 Z" },
      { role: "dark", d: "M 79 103 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 Z" },
      { role: "steel", d: "M 81 103 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 Z" },
      { role: "brass", d: "M 83 103 a 1.2 1.2 0 1 0 2.4 0 a 1.2 1.2 0 1 0 -2.4 0 Z" },
      // Barrel: the AUTO / SELECT-O-MATIC band, then the blue pattern collar.
      { role: "dark", d: "M 112 76 Q 112 74 114 74 L 134 74 L 134 102 L 114 102 Q 112 102 112 100 Z" },
      { role: "steel", d: "M 116 74 L 117.5 74 L 117.5 102 L 116 102 Z", opacity: 0.5 },
      { role: "steel", d: "M 131 74 L 132.5 74 L 132.5 102 L 131 102 Z", opacity: 0.5 },
      { role: "steel", d: "M 134 74 L 162 74 L 162 102 L 134 102 Z" },
      { role: "dark", d: "M 160 75 L 168 75 L 168 101 L 160 101 Z" },
      // Yellow bumper, its grooves, and the metal teeth on the tip face.
      { role: "yellow", d: "M 166 68 Q 166 64 170 64 L 188 64 Q 202 64 206 72 L 206 104 Q 202 112 188 112 L 170 112 Q 166 112 166 108 Z" },
      { role: "steel", d: "M 172 66 L 172.8 66 L 172.8 110 L 172 110 Z", opacity: 0.3 },
      { role: "steel", d: "M 178 65 L 178.8 65 L 178.8 111 L 178 111 Z", opacity: 0.3 },
      { role: "steel", d: "M 184 64.5 L 184.8 64.5 L 184.8 111.5 L 184 111.5 Z", opacity: 0.3 },
      { role: "dark", d: "M 198 76 L 204 79 L 198 82 Z" },
      { role: "dark", d: "M 198 84 L 204 86 L 198 88 Z" },
      { role: "dark", d: "M 198 90 L 204 92 L 198 94 Z" },
      { role: "dark", d: "M 198 96 L 204 99 L 198 100 Z" },
    ],
  },
} satisfies NozzleArt;
