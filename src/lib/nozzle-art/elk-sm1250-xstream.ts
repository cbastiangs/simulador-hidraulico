import type { NozzleArt } from "./types.ts";

/**
 * Elkhart X-Stream SM-1250 (ELK-SM1250-XSTREAM), from the refs2 photo set
 * (elk-xstream-1/2/3/4/5): a compact automatic master stream combination
 * nozzle, 2.5 in swivel inlet with rocker lugs, a grey anodised aluminium
 * barrel wrapped by two thin yellow label sleeves (X-STREAM / ELKHART
 * BRASS) that lie flush on it, and the big scalloped yellow pattern collar
 * out front. Inside the collar a black bore holds the precision-cut metal
 * teeth ring around the brass automatic piston and its black override
 * knob. No shutoff. The published size is O.A.L. 9.31 in, dia. 6.88 in
 * (elkhartsales.com X-Stream table), so the collar is ~1.8x the inlet.
 */

export default {
  side: {
    length: 48,
    exit: { x: 47, half: 6.5 },
    flowLabel: { x: 36, y: -21 },
    shell: [
      // Swivel inlet: steel thread ring, black coupling body, the rocker lugs.
      { role: "steel", d: "M 0 -9 L 2 -9 L 2 9 L 0 9 Z" },
      { role: "dark", d: "M 1 -9 Q 1 -9.8 1.8 -9.8 L 6.2 -9.8 Q 7.6 -9.8 7.6 -8.4 L 7.6 8.4 Q 7.6 9.8 6.2 9.8 L 1.8 9.8 Q 1 9.8 1 9 Z" },
      { role: "dark", d: "M 2 -9.8 L 6 -9.8 L 6 -12.5 Q 6 -13 5 -13 L 3 -13 Q 2 -13 2 -12.5 Z" },
      { role: "dark", d: "M 2 9.8 L 6 9.8 L 6 12.5 Q 6 13 5 13 L 3 13 Q 2 13 2 12.5 Z" },
      // Grey anodised barrel with the two flush yellow label sleeves (X-STREAM, ELKHART BRASS).
      { role: "steel", d: "M 7 -10.5 Q 7 -11.5 8.5 -11.5 L 31.5 -11.5 Q 33 -11.5 33 -10 L 33 10 Q 33 11.5 31.5 11.5 L 8.5 11.5 Q 7 11.5 7 10.5 Z" },
      { role: "yellow", d: "M 9 -12.5 L 17 -12.5 L 17 12.5 L 9 12.5 Z" },
      { role: "dark", d: "M 10 -10.5 L 11 -10.5 L 11 10.5 L 10 10.5 Z", opacity: 0.35 },
      { role: "dark", d: "M 15 -10.5 L 16 -10.5 L 16 10.5 L 15 10.5 Z", opacity: 0.35 },
      { role: "yellow", d: "M 21 -12.5 L 29 -12.5 L 29 12.5 L 21 12.5 Z" },
      { role: "dark", d: "M 22 -10.5 L 23 -10.5 L 23 10.5 L 22 10.5 Z", opacity: 0.35 },
      { role: "dark", d: "M 27 -10.5 L 28 -10.5 L 28 10.5 L 27 10.5 Z", opacity: 0.35 },
      // The wide scalloped pattern collar, its axial ridges, and the rolled front lip.
      { role: "dark", d: "M 31 -14 L 33 -14 L 33 14 L 31 14 Z" },
      { role: "yellow", d: "M 34 -16 L 44 -16 Q 46 -16 46 -14 L 46 14 Q 46 16 44 16 L 34 16 Q 32 16 32 14 L 32 -14 Q 32 -16 34 -16 Z" },
      { role: "dark", d: "M 36 -15.5 L 37 -15.5 L 37 15.5 L 36 15.5 Z", opacity: 0.22 },
      { role: "dark", d: "M 39 -16 L 40 -16 L 40 16 L 39 16 Z", opacity: 0.22 },
      { role: "dark", d: "M 42 -16 L 43 -16 L 43 16 L 42 16 Z", opacity: 0.22 },
      { role: "yellow", d: "M 44 -13.5 L 46 -13.5 Q 48 -13.5 48 -12 L 48 12 Q 48 13.5 46 13.5 L 44 13.5 Z" },
      // The recessed bore at the tip face, its metal teeth and the piston cone.
      { role: "dark", d: "M 45 -10 L 48 -10 L 48 10 L 45 10 Z" },
      { role: "steel", d: "M 45 -10 L 47 -6.5 L 45 -3 Z" },
      { role: "steel", d: "M 45 3 L 47 6.5 L 45 10 Z" },
      { role: "brass", d: "M 43 -3.5 L 47 0 L 43 3.5 Z" },
      { role: "dark", d: "M 44.5 -2 L 47 -2 L 47 2 L 44.5 2 Z" },
    ],
    shutoff: null,
  },
  top: {
    tipX: 190,
    ring: null,
    pressure: null,
    collar: { from: 158, to: 184, r: 30, ribs: 12, ink: "#9a7d16" },
    shutoff: { kind: "none" },
    shell: [
      // Swivel inlet face, black coupling body and the two rocker lugs.
      { role: "steel", d: "M 36 70.5 L 40 70.5 L 40 105.5 L 36 105.5 Z" },
      { role: "dark", d: "M 40 69 L 52 69 Q 56 69 56 73 L 56 103 Q 56 107 52 107 L 40 107 Z" },
      { role: "dark", d: "M 44 69 L 52 69 L 52 63 Q 52 61.5 50 61.5 L 46 61.5 Q 44 61.5 44 63 Z" },
      { role: "dark", d: "M 44 107 L 52 107 L 52 113 Q 52 114.5 50 114.5 L 46 114.5 Q 44 114.5 44 113 Z" },
      // Grey anodised barrel with the two flush yellow label sleeves and their code hash marks.
      { role: "steel", d: "M 55 66 Q 55 65.5 56 65.5 L 156 65.5 Q 158 65.5 158 68 L 158 108 Q 158 110.5 156 110.5 L 56 110.5 Q 55 110.5 55 110 Z" },
      { role: "yellow", d: "M 62 64.5 L 88 64.5 L 88 111.5 L 62 111.5 Z" },
      { role: "dark", d: "M 64 69 L 65 69 L 65 107 L 64 107 Z", opacity: 0.35 },
      { role: "dark", d: "M 66 69 L 67 69 L 67 107 L 66 107 Z", opacity: 0.35 },
      { role: "dark", d: "M 83 69 L 84 69 L 84 107 L 83 107 Z", opacity: 0.35 },
      { role: "dark", d: "M 85 69 L 86 69 L 86 107 L 85 107 Z", opacity: 0.35 },
      { role: "yellow", d: "M 116 64.5 L 140 64.5 L 140 111.5 L 116 111.5 Z" },
      { role: "dark", d: "M 118 69 L 119 69 L 119 107 L 118 107 Z", opacity: 0.35 },
      { role: "dark", d: "M 120 69 L 121 69 L 121 107 L 120 107 Z", opacity: 0.35 },
      { role: "dark", d: "M 135 69 L 136 69 L 136 107 L 135 107 Z", opacity: 0.35 },
      { role: "dark", d: "M 137 69 L 138 69 L 138 107 L 137 107 Z", opacity: 0.35 },
      // The scalloped yellow pattern collar (its ridges are the component's).
      { role: "dark", d: "M 152 59 L 159 59 L 159 117 L 152 117 Z" },
      { role: "yellow", d: "M 160 56.5 L 182 56.5 Q 184 56.5 184 59 L 184 117 Q 184 119.5 182 119.5 L 160 119.5 Q 158 119.5 158 117 L 158 59 Q 158 56.5 160 56.5 Z" },
      { role: "yellow", d: "M 183 59 L 187 59 Q 190 59 190 62 L 190 114 Q 190 117 187 117 L 183 117 Z" },
      // The recessed bore, its precision-cut metal teeth and the piston cone.
      { role: "dark", d: "M 181 67 L 188 67 L 188 109 L 181 109 Z" },
      { role: "steel", d: "M 182 69 L 189 72 L 182 75 Z" },
      { role: "steel", d: "M 182 76 L 189 79 L 182 82 Z" },
      { role: "steel", d: "M 182 94 L 189 97 L 182 100 Z" },
      { role: "steel", d: "M 182 101 L 189 104 L 182 107 Z" },
      { role: "brass", d: "M 181 83 L 189 85.5 L 189 90.5 L 181 93 Z" },
      { role: "dark", d: "M 183 85 L 189 85 L 189 91 L 183 91 Z" },
    ],
  },
} satisfies NozzleArt;
