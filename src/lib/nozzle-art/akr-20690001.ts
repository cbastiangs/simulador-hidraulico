import type { NozzleArt } from "./types.ts";

/**
 * Akron 4AN Navy nozzle, style 2069 (AKR-20690001), from the refs2 photo set
 * (akr-4an-0/1/3/4): a one-piece sand-cast BRASS handline. Octagonal swivel
 * inlet, a long plain body with a cast panel, the big brass bale loop (two
 * windows, pivoting on a side bolt high on the body), then the pattern collar
 * ahead of a knurled front ring whose face is the perforated fog plate.
 * Single fixed 52 gpm: no gallonage ring, no pressure selector, no teeth, and
 * no pistol grip. The bale is drawn dark so it reads against the brass.
 */

/** The bale loop, drawn about the pivot at the origin extending backward (−x), with two windows cut out. */
const LEVER =
  "M 0 -5 L -20 -5 Q -24 -5 -24 -1.5 L -24 1.5 Q -24 5 -20 5 L 0 5 Q 3 5 3 1.5 L 3 -1.5 Q 3 -5 0 -5 Z M -20 -3 L -13 -3 L -13 3 L -20 3 Z M -11 -3 L -4 -3 L -4 3 L -11 3 Z";
/** Its hub over the pivot bolt. */
const HUB =
  "M -4 -4 Q -4 -5.5 -2.5 -5.5 L 2.5 -5.5 Q 4 -5.5 4 -4 L 4 4 Q 4 5.5 2.5 5.5 L -2.5 5.5 Q -4 5.5 -4 4 Z";

export default {
  side: {
    length: 57,
    exit: { x: 57, half: 8 },
    flowLabel: { x: 44, y: -20 },
    shell: [
      // Inlet face and octagonal swivel coupling, proud of the body.
      { role: "steel", d: "M 0 -10 L 1.5 -10 L 1.5 10 L 0 10 Z" },
      { role: "brass", d: "M 0 -10 L 2 -12 L 6 -12 L 8 -10 L 8 10 L 6 12 L 2 12 L 0 10 Z" },
      { role: "steel", d: "M 8 -10.5 L 9.5 -10.5 L 9.5 10.5 L 8 10.5 Z", opacity: 0.4 },
      // Long cast body, with the panel and the pivot lug on top.
      { role: "brass", d: "M 9 -9.5 Q 9 -10.5 10.5 -10.5 L 26 -10.5 Q 30 -11 32 -10.5 Q 34 -10.5 34 -9 L 34 9 Q 34 10.5 32 10.5 Q 30 11 26 10.5 L 10.5 10.5 Q 9 10.5 9 9.5 Z" },
      { role: "steel", d: "M 12 -5.5 Q 12 -6.5 13.5 -6.5 L 25 -6.5 Q 26.5 -6.5 26.5 -5.5 L 26.5 -0.5 Q 26.5 0.5 25 0.5 L 13.5 0.5 Q 12 0.5 12 -0.5 Z", opacity: 0.45 },
      { role: "brass", d: "M 13 -10 Q 13 -13.5 16 -13.5 L 18 -13.5 Q 21 -13.5 21 -10 Z" },
      // Pattern collar, with its knurl ridges, then the knurled front ring.
      { role: "brass", d: "M 34 -10.5 Q 34 -12.5 36 -12.5 L 44 -12.5 Q 46 -12.5 46 -10.5 L 46 10.5 Q 46 12.5 44 12.5 L 36 12.5 Q 34 12.5 34 10.5 Z" },
      { role: "steel", d: "M 37 -12 L 38 -12 L 38 12 L 37 12 Z", opacity: 0.35 },
      { role: "steel", d: "M 39.5 -12 L 40.5 -12 L 40.5 12 L 39.5 12 Z", opacity: 0.35 },
      { role: "steel", d: "M 42 -12 L 43 -12 L 43 12 L 42 12 Z", opacity: 0.35 },
      { role: "steel", d: "M 44.5 -12 L 45.5 -12 L 45.5 12 L 44.5 12 Z", opacity: 0.35 },
      { role: "brass", d: "M 45 -10.5 Q 45 -11.5 46 -11.5 L 49 -11.5 Q 50 -11.5 50 -10.5 L 50 10.5 Q 50 11.5 49 11.5 L 46 11.5 Q 45 11.5 45 10.5 Z" },
      // Front barrel and the steel rim of the fog plate.
      { role: "brass", d: "M 49 -10.5 L 55 -10.5 Q 57 -10.5 57 -9 L 57 9 Q 57 10.5 55 10.5 L 49 10.5 Z" },
      { role: "steel", d: "M 55 -9 L 57 -9 L 57 9 L 55 9 Z", opacity: 0.55 },
      // Pivot hub and bolt (the bale's two poses swing here).
      { role: "dark", d: HUB, t: "translate(17 -11)" },
      { role: "steel", d: "M 15 -11 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 Z" },
    ],
    shutoff: {
      hit: { x: 17, y: -12, r: 16 },
      open: [{ role: "dark", d: LEVER, t: "translate(17 -11) rotate(30)" }],
      closed: [{ role: "dark", d: LEVER, t: "translate(17 -11) rotate(160)" }],
    },
  },
  top: {
    tipX: 155,
    ring: null,
    pressure: null,
    collar: { from: 102, to: 126, r: 12, ribs: 12, ink: "#55606a" },
    shutoff: { kind: "bale", pivotX: 64, arm: 64, offset: 12 },
    shell: [
      // Swivel coupling, its seam, and the long body with its cast panel.
      { role: "brass", d: "M 36 78 Q 36 77.5 37 77.5 L 43 77.5 Q 44 77.5 44 78.5 L 44 97.5 Q 44 98.5 43 98.5 L 37 98.5 Q 36 98.5 36 97.5 Z" },
      { role: "steel", d: "M 42 78 L 44 78 L 44 98 L 42 98 Z", opacity: 0.4 },
      { role: "brass", d: "M 43 78 Q 44 77 46 77 L 98 77 Q 102 77 102 80 L 102 96 Q 102 99 98 99 L 46 99 Q 44 99 43 98 Z" },
      { role: "steel", d: "M 52 83 L 72 83 L 72 93 L 52 93 Z", opacity: 0.4 },
      // Bale pivot boss on the lever flank, and the through-bolt end opposite.
      { role: "steel", d: "M 59.5 78 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0 Z" },
      { role: "steel", d: "M 59.5 98 a 4.5 4.5 0 1 0 9 0 a 4.5 4.5 0 1 0 -9 0 Z" },
      // Pattern collar band, ringed by its steel end seams.
      { role: "brass", d: "M 100 76.5 Q 100 76 102 76 L 126 76 Q 128 76 128 78 L 128 98 Q 128 100 126 100 L 102 100 Q 100 100 100 98.5 Z" },
      { role: "steel", d: "M 100 76.5 L 101.5 76.5 L 101.5 99.5 L 100 99.5 Z", opacity: 0.4 },
      { role: "steel", d: "M 126.5 76 L 128 76 L 128 100 L 126.5 100 Z", opacity: 0.4 },
      // Front ring, then the steel rim of the fog plate at the tip.
      { role: "brass", d: "M 126 77.5 Q 126 76.5 127 76.5 L 151 76.5 Q 153 76.5 153 78 L 153 98 Q 153 99.5 151 99.5 L 127 99.5 Q 126 99.5 126 98.5 Z" },
      { role: "steel", d: "M 151 77 L 155 77 L 155 99 L 151 99 Z", opacity: 0.55 },
    ],
  },
} satisfies NozzleArt;
