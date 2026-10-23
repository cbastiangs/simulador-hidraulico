import type { NozzleArt } from "./types.ts";

/**
 * Elkhart Select-O-Flow CSW-LB, from the refs2 photo set
 * (elk-select-o-flow-0…4): a 2½ in brass master stream, no shutoff, with
 * the flow selector set at the inlet end (350/500/750/1000/1250), a smooth
 * cutwater body, two black folding handles on a brass collar, and the big
 * black fluted pattern bumper with a fixed metal sawtooth ring. The photos
 * stand the nozzle tip-up; both views draw it tip-right.
 */

const LEFT_GRIP =
  "M 39.5 -13 Q 39.5 -12 40.5 -12 L 46 -12 Q 47 -12 47 -13 L 47 -21 Q 47 -22 46 -22 L 40.5 -22 Q 39.5 -22 39.5 -21 Z";
const RIGHT_GRIP =
  "M 39.5 13 Q 39.5 12 40.5 12 L 46 12 Q 47 12 47 13 L 47 19 Q 47 20 46 20 L 40.5 20 Q 39.5 20 39.5 19 Z";

export default {
  side: {
    length: 62,
    exit: { x: 62, half: 5 },
    flowLabel: { x: 18, y: -16 },
    shell: [
      // Swivel inlet: coupling face, brass body, and the two rocker lugs.
      { role: "steel", d: "M 0 -10 L 2 -10 L 2 10 L 0 10 Z" },
      { role: "brass", d: "M 1.5 -10 Q 1.5 -10.8 2.5 -10.8 L 11 -10.8 Q 12 -10.8 12 -9.8 L 12 9.8 Q 12 10.8 11 10.8 L 2.5 10.8 Q 1.5 10.8 1.5 10 Z" },
      { role: "brass", d: "M 4 -10.5 L 8 -10.5 L 8 -12.5 Q 8 -13.5 7 -13.5 L 5 -13.5 Q 4 -13.5 4 -12.5 Z" },
      { role: "brass", d: "M 4 10.5 L 8 10.5 L 8 12.5 Q 8 13.5 7 13.5 L 5 13.5 Q 4 13.5 4 12.5 Z" },
      // Flow selector band, its raised seam, and the spring pointer.
      { role: "dark", d: "M 11.5 -9 Q 11.5 -9.8 12.5 -9.8 L 23.5 -9.8 Q 24.5 -9.8 24.5 -8.8 L 24.5 8.8 Q 24.5 9.8 23.5 9.8 L 12.5 9.8 Q 11.5 9.8 11.5 9 Z" },
      { role: "brass", d: "M 24 -9.8 L 25.5 -9.8 L 25.5 9.8 L 24 9.8 Z" },
      { role: "steel", d: "M 21.5 -9.8 L 24.5 -9.8 Q 26 -9.8 26 -10.8 L 26 -11.3 Q 26 -12 25 -12 L 22.5 -12 Q 21.5 -12 21.5 -10.8 Z" },
      // Smooth body, then the collar that carries the folding handles.
      { role: "brass", d: "M 24.5 -9.5 Q 24.5 -10.2 25.5 -10.2 L 40.5 -10.2 Q 41.5 -10.2 41.5 -9.2 L 41.5 9.2 Q 41.5 10.2 40.5 10.2 L 25.5 10.2 Q 24.5 10.2 24.5 9.5 Z" },
      { role: "brass", d: "M 40.5 -10.5 Q 40.5 -11.2 41.5 -11.2 L 44.8 -11.2 Q 45.8 -11.2 45.8 -10.2 L 45.8 10.2 Q 45.8 11.2 44.8 11.2 L 41.5 11.2 Q 40.5 11.2 40.5 10.5 Z" },
      { role: "steel", d: "M 41.5 -11.2 L 44.5 -11.2 L 44.5 -9.8 L 41.5 -9.8 Z", opacity: 0.55 },
      { role: "steel", d: "M 41.5 9.8 L 44.5 9.8 L 44.5 11.2 L 41.5 11.2 Z", opacity: 0.55 },
      // The two black handles, with their stems, above and below the axis.
      { role: "steel", d: "M 42 -12 L 44.5 -12 L 44.5 -10.6 L 42 -10.6 Z" },
      { role: "steel", d: "M 42 10.6 L 44.5 10.6 L 44.5 12 L 42 12 Z" },
      { role: "grip", d: LEFT_GRIP },
      { role: "grip", d: RIGHT_GRIP },
      // Narrow ring, then the fluted pattern collar, wider at the tip.
      { role: "steel", d: "M 45.5 -9.7 L 48.5 -9.7 L 48.5 9.7 L 45.5 9.7 Z" },
      { role: "dark", d: "M 48 -10 L 60.5 -12 Q 62 -12.3 62 -10.5 L 62 10.5 Q 62 12.3 60.5 12 L 48 10 Z" },
      { role: "steel", d: "M 49.5 -9.2 L 60.8 -11 L 60.8 -10 L 49.5 -8.2 Z", opacity: 0.3 },
      { role: "steel", d: "M 49.5 -4.6 L 61.2 -5.5 L 61.2 -4.5 L 49.5 -3.6 Z", opacity: 0.3 },
      { role: "steel", d: "M 49.5 3.6 L 61.2 4.5 L 61.2 5.5 L 49.5 4.6 Z", opacity: 0.3 },
      { role: "steel", d: "M 49.5 8.2 L 60.8 10 L 60.8 11 L 49.5 9.2 Z", opacity: 0.3 },
      // Metal face and fixed sawtooth teeth inside the collar, around the bore.
      { role: "brass", d: "M 55.5 -8.5 L 61 -8 L 62 -7.5 L 62 7.5 L 61 8 L 55.5 8.5 Z" },
      { role: "steel", d: "M 56.5 -8.4 L 61.8 -8 L 61.8 -7.2 L 60 -5.2 L 59 -7.4 L 58 -5.2 L 57.2 -7.4 L 56.5 -7.2 Z" },
      { role: "steel", d: "M 56.5 8.4 L 61.8 8 L 61.8 7.2 L 60 5.2 L 59 7.4 L 58 5.2 L 57.2 7.4 L 56.5 7.2 Z" },
      { role: "dark", d: "M 59 -5.2 L 62 -4.6 L 62 4.6 L 59 5.2 Z" },
    ],
    shutoff: null,
  },
  top: {
    tipX: 190,
    ring: { from: 64, to: 94, r: 26, ink: "#f7f3ec" },
    pressure: null,
    collar: { from: 151, to: 190, r: 31, ribs: 14, ink: "#69737d" },
    shutoff: { kind: "none" },
    shell: [
      // Swivel inlet: coupling face, brass barrel, and the two rocker lugs.
      { role: "steel", d: "M 36 61 L 39 61 L 39 115 L 36 115 Z" },
      { role: "brass", d: "M 38 60.5 Q 38 60 38.5 60 L 63.5 60 Q 64 60 64 60.5 L 64 115.5 Q 64 116 63.5 116 L 38.5 116 Q 38 116 38 115.5 Z" },
      { role: "brass", d: "M 44 60 L 54 60 L 54 52 Q 54 51 53 51 L 45 51 Q 44 51 44 52 Z" },
      { role: "brass", d: "M 44 116 L 54 116 L 54 124 Q 54 125 53 125 L 45 125 Q 44 125 44 124 Z" },
      // Flow selector band with the turning numbers, its seams and pointer.
      { role: "brass", d: "M 63 60 L 65.5 60 L 65.5 116 L 63 116 Z" },
      { role: "dark", d: "M 64.5 62 Q 64.5 61.5 65.5 61.5 L 93.5 61.5 Q 94.5 61.5 94.5 62 L 94.5 114 Q 94.5 114.5 93.5 114.5 L 65.5 114.5 Q 64.5 114.5 64.5 114 Z" },
      { role: "brass", d: "M 93.5 60 L 96.5 60 L 96.5 116 L 93.5 116 Z" },
      { role: "steel", d: "M 88 62 L 95 62 L 95 58 Q 95 55.5 92.5 55.5 L 91.5 55.5 Q 89 55.5 89 58 Z" },
      // Smooth body and the brass collar carrying the two handles.
      { role: "brass", d: "M 96 60.5 Q 96 60 97 60 L 136 60 Q 137 60 137 60.5 L 137 115.5 Q 137 116 136 116 L 97 116 Q 96 116 96 115.5 Z" },
      { role: "brass", d: "M 136 58.5 Q 136 58 137 58 L 144 58 Q 145 58 145 58.5 L 145 117.5 Q 145 118 144 118 L 137 118 Q 136 118 136 117.5 Z" },
      // The two side handles: brass stems off the collar edge, then the black
      // grips' plan footprint — short bars lying radial, not side-view blobs.
      { role: "brass", d: "M 137.5 58 L 143.5 58 L 143.5 53 Q 143.5 52 142.5 52 L 138.5 52 Q 137.5 52 137.5 53 Z" },
      { role: "brass", d: "M 137.5 118 L 143.5 118 L 143.5 123 Q 143.5 124 142.5 124 L 138.5 124 Q 137.5 124 137.5 123 Z" },
      { role: "grip", d: "M 135.5 52 L 135.5 31 Q 135.5 26.5 140.5 26.5 Q 145.5 26.5 145.5 31 L 145.5 52 Q 145.5 54 143.5 54 L 137.5 54 Q 135.5 54 135.5 52 Z" },
      { role: "grip", d: "M 135.5 124 Q 135.5 122 137.5 122 L 143.5 122 Q 145.5 122 145.5 124 L 145.5 145 Q 145.5 149.5 140.5 149.5 Q 135.5 149.5 135.5 145 Z" },
      { role: "steel", d: "M 145 62 L 151 62 L 151 114 L 145 114 Z" },
      // Fluted pattern collar, flaring toward the tip.
      { role: "dark", d: "M 151 60 L 185 53 Q 190 53 190 58 L 190 118 Q 190 123 185 123 L 151 116 Z" },
      { role: "steel", d: "M 153 68 L 187 68 L 187 69 L 153 69 Z", opacity: 0.28 },
      { role: "steel", d: "M 153 76 L 188 76 L 188 77 L 153 77 Z", opacity: 0.28 },
      { role: "steel", d: "M 153 84 L 189 84 L 189 85 L 153 85 Z", opacity: 0.28 },
      { role: "steel", d: "M 153 91 L 189 91 L 189 92 L 153 92 Z", opacity: 0.28 },
      { role: "steel", d: "M 153 99 L 188 99 L 188 100 L 153 100 Z", opacity: 0.28 },
      { role: "steel", d: "M 153 107 L 187 107 L 187 108 L 153 108 Z", opacity: 0.28 },
      // Metal face and fixed sawtooth teeth around the bore.
      { role: "brass", d: "M 181 66 L 188 66 Q 190 66 190 68 L 190 108 Q 190 110 188 110 L 181 110 Z" },
      { role: "steel", d: "M 181 66 L 190 66 L 190 69.5 L 188.5 72 L 187 69.5 L 185.5 72 L 184 69.5 L 182.5 72 L 181 69.5 Z" },
      { role: "steel", d: "M 181 110 L 190 110 L 190 106.5 L 188.5 104 L 187 106.5 L 185.5 104 L 184 106.5 L 182.5 104 L 181 106.5 Z" },
      { role: "dark", d: "M 184 74 Q 184 72 185.5 72 L 190 72 L 190 104 L 185.5 104 Q 184 104 184 102 Z" },
    ],
  },
} satisfies NozzleArt;
