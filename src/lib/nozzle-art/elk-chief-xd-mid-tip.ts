import type { NozzleArt } from "./types.ts";

/**
 * Elkhart Chief XD mid-range fixed tip (ELK-CHIEF-XD-MID-TIP), from the refs2
 * photo set (elk-chief-xd-0/2/4/5): black handline on a 1.5 in rigid swivel
 * inlet with rocker lugs, a big loop bale pivoting on the round "ELKHART
 * BRASS" side cap over the valve, fixed single flow (no selector ring), and a
 * large orange pattern bumper with a ring of fixed metal teeth around a plain
 * center opening. This build has no pistol grip.
 */

/** Bale loop, pivot at the origin, rising and reaching forward (+x); the slot is the reverse-wound second subpath. */
const LEVER =
  "M 0 0 Q -3 0 -3 -3 L -3 -6 Q -3 -9 0 -9 L 18 -9 Q 22 -9 22 -6 L 22 -3 Q 22 0 18 0 Z M 1 -2 L 17 -2 L 17 -6 L 1 -6 Z";

export default {
  side: {
    length: 58,
    exit: { x: 57, half: 3 },
    flowLabel: { x: 44, y: -23 },
    shell: [
      // Coupling face and swivel, with the rocker lugs.
      { role: "steel", d: "M 0 -12.25 L 3 -12.25 L 3 12.25 L 0 12.25 Z" },
      { role: "dark", d: "M 2 11.18 Q 2 12.25 3 12.25 L 9 12.25 Q 12 12.25 12 9.59 L 12 -9.59 Q 12 -12.25 9 -12.25 L 3 -12.25 Q 2 -12.25 2 -11.18 Z" },
      { role: "dark", d: "M 3 -11.5 L 8.5 -11.5 L 8.5 -14.5 Q 8.5 -15.5 7.5 -15.5 L 4 -15.5 Q 3 -15.5 3 -14.5 Z" },
      { role: "dark", d: "M 3 11.5 L 8.5 11.5 L 8.5 14.5 Q 8.5 15.5 7.5 15.5 L 4 15.5 Q 3 15.5 3 14.5 Z" },
      // Valve body, and the round "ELKHART BRASS" side cap the bale pivots on.
      { role: "dark", d: "M 11 -9.35 Q 11 -9.8 12 -9.8 L 30 -9.8 Q 32 -9.8 32 -8.02 L 32 8.02 Q 32 9.8 30 9.8 L 12 9.8 Q 11 9.8 11 9.35 Z" },
      { role: "steel", d: "M 9 -4 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 Z" },
      { role: "dark", d: "M 11 -4 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 Z" },
      { role: "brass", d: "M 13.6 -4 a 1.4 1.4 0 1 0 2.8 0 a 1.4 1.4 0 1 0 -2.8 0 Z" },
      // Barrel, the pattern collar, then the big bumper.
      { role: "dark", d: "M 30 -9.1 L 43 -9.1 L 43 9.1 L 30 9.1 Z" },
      { role: "dark", d: "M 42 -17.15 L 47.5 -17.15 L 47.5 17.15 L 42 17.15 Z" },
      { role: "orange", d: "M 46 -9.72 L 49.5 -16.01 Q 50 -17.15 51.5 -17.15 L 55.5 -17.15 Q 58 -17.15 58 -13.72 L 58 13.72 Q 58 17.15 55.5 17.15 L 51.5 17.15 Q 50 17.15 49.5 16.01 L 46 9.72 Z" },
      // Tip face and the ring of fixed metal teeth; the stream leaves the center.
      { role: "dark", d: "M 55 -17.15 L 58 -17.15 L 58 17.15 L 55 17.15 Z" },
      { role: "steel", d: "M 54 -17.15 L 54 -13.6 L 58 -15.38 Z M 54 -13.01 L 54 -9.46 L 58 -11.24 Z M 54 -8.87 L 54 -5.32 L 58 -7.1 Z M 54 5.32 L 54 8.87 L 58 7.1 Z M 54 9.46 L 54 13.01 L 58 11.24 Z M 54 13.6 L 54 17.15 L 58 15.38 Z" },
    ],
    shutoff: {
      hit: { x: 24, y: -12, r: 16 },
      open: [{ role: "dark", d: LEVER, t: "translate(15 -7) rotate(-30)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(15 -7) rotate(0)" }],
    },
  },
  top: {
    tipX: 204,
    ring: null,
    pressure: null,
    collar: { from: 150, to: 204, r: 16, ribs: 12, ink: "#3a3f45" },
    shutoff: { kind: "bale", pivotX: 80, arm: 50, offset: -16 },
    shell: [
      // Swivel: steel coupling ring, black body, rocker lugs, bale pin.
      { role: "steel", d: "M 36 77.5 L 40 77.5 L 40 98.5 L 36 98.5 Z" },
      { role: "dark", d: "M 39 74 Q 39 70.5 42.5 70.5 L 60 70.5 Q 63 70.5 63 74 L 63 102 Q 63 105.5 60 105.5 L 42.5 105.5 Q 39 105.5 39 102 Z" },
      { role: "dark", d: "M 46 70.5 L 56 70.5 L 56 65.5 Q 56 64 54 64 L 48 64 Q 46 64 46 65.5 Z" },
      { role: "dark", d: "M 46 105.5 L 56 105.5 L 56 110.5 Q 56 112 54 112 L 48 112 Q 46 112 46 110.5 Z" },
      { role: "dark", d: "M 62 74 L 106 74 Q 110 74 110 78 L 110 98 Q 110 102 106 102 L 62 102 Z" },
      { role: "steel", d: "M 77.5 72 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0 Z" },
      // Barrel, the pattern collar, then the big bumper.
      { role: "dark", d: "M 108 77 L 140 77 L 140 99 L 108 99 Z" },
      { role: "dark", d: "M 138 75 L 150 75 L 150 101 L 138 101 Z" },
      { role: "orange", d: "M 148 75 L 156 65 Q 157 63.5 160 63.5 L 196 63.5 Q 204 63.5 204 71 L 204 105 Q 204 112.5 196 112.5 L 160 112.5 Q 157 112.5 156 111 L 148 101 Z" },
      // Inset tip face and fixed metal teeth.
      { role: "dark", d: "M 197 68 Q 204 68 204 76 L 204 100 Q 204 108 197 108 Z" },
      { role: "steel", d: "M 197 64 L 204 64 L 204 67 L 197 67 Z M 197 71 L 202 71 L 202 74 L 197 74 Z M 197 102 L 202 102 L 202 105 L 197 105 Z M 197 109 L 204 109 L 204 112 L 197 112 Z" },
    ],
  },
} satisfies NozzleArt;
