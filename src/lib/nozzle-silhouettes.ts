import type { ScenarioNozzle } from "$hydraulics/scenario.ts";

/**
 * Per-model silhouettes for the close-up (UX.md §3.1): the static parts each
 * researched model draws — inlet swivel and its rocker lugs, valve body,
 * barrel, grip and front head — keyed by catalog specId. `silhouetteOf`
 * returns null for anything not researched, so the close-up falls back to its
 * generic handline shape.
 *
 * The close-up keeps drawing the working controls at their fixed anchors and
 * with their fixed reads: gallonage ring 162–202, pressure ring, collar
 * 204–274 with its ribs, teeth 268–282, and the bale, slide or ball valve.
 * These paths sit under them on the same fixed canvas: viewBox 400×176, axis
 * y = 88; hose 0–38, swivel band 36–64, valve body 64–130, barrel 130–282;
 * inside x 36–282 and y 44–142 (a grip may reach y 150). View is from above.
 *
 * Shapes were redrawn from the models' product photos (owner, 2026-10-19):
 * the researched handlines are black one-piece tools, so their shells are
 * drawn in the dark class (`trim`) and only bare metal (`barrel`, `swivel`)
 * and the maker's light label band stay light; the red `body` class belongs
 * to the generic fallback's older shape and to nothing here. Front heads are
 * drawn with a round, flared or blocky plan profile per maker, ending before
 * x 278 so the component's own teeth (268–282) still read on the background.
 * Rows whose notes in `data/catalog/nozzles.csv` are "pending" stay plain: no
 * invented detail — master streams keep a placeholder until monitors arrive
 * (UX.md §3.1).
 */

export type SilhouettePath = { d: string; role: "body" | "barrel" | "swivel" | "grip" | "trim" };

/** The inlet swivel, 1½ in: black body, steel thread ring at the back, the rocker lugs riding above and below. */
const SWIVEL: SilhouettePath[] = [
  { role: "trim", d: "M 36 72 Q 36 68 40 68 L 58 68 Q 64 68 64 74 L 64 102 Q 64 108 58 108 L 40 108 Q 36 108 36 104 Z" },
  { role: "trim", d: "M 44 60 L 57 60 Q 59 60 59 62 L 59 68 L 42 68 L 42 62 Q 42 60 44 60 Z" },
  { role: "trim", d: "M 42 108 L 59 108 L 59 114 Q 59 116 57 116 L 44 116 Q 42 116 42 114 Z" },
  { role: "swivel", d: "M 38 70 L 41 70 Q 43 70 43 72 L 43 104 Q 43 106 41 106 L 38 106 Z" },
];

/** The 2½ in inlet (H-2VPGI, JTS250PS, Phantom high, masters, POK 300): the same swivel, a size up. */
const SWIVEL_BIG: SilhouettePath[] = [
  { role: "trim", d: "M 36 68 Q 36 64 40 64 L 59 64 Q 66 64 66 72 L 66 104 Q 66 112 59 112 L 40 112 Q 36 112 36 108 Z" },
  { role: "trim", d: "M 44 56 L 58 56 Q 60 56 60 58 L 60 64 L 42 64 L 42 58 Q 42 56 44 56 Z" },
  { role: "trim", d: "M 42 112 L 60 112 L 60 118 Q 60 120 58 120 L 44 120 Q 42 120 42 118 Z" },
  { role: "swivel", d: "M 38 66 L 41 66 Q 43 66 43 68 L 43 108 Q 43 110 41 110 L 38 110 Z" },
];

/** The brass 4AN's inlet: all metal, no dark moulding. */
const SWIVEL_BRASS: SilhouettePath[] = [
  { role: "swivel", d: "M 36 72 Q 36 68 40 68 L 58 68 Q 64 68 64 74 L 64 102 Q 64 108 58 108 L 40 108 Q 36 108 36 104 Z" },
];

/** The pistol grip (TFT and Akron handlines). The body is drawn after, hiding its top edge. */
const GRIP: SilhouettePath = { role: "grip", d: "M 82 100 C 74 116 74 134 84 143 Q 97 148 109 143 C 120 134 120 114 110 100 Z" };

/** TFT one-piece body under the slide rail (rail 66–126 sits flush on its top). */
const TFT_BODY: SilhouettePath = { role: "trim", d: "M 58 72 L 138 72 Q 146 72 146 80 L 146 96 Q 146 104 138 104 L 58 104 Q 52 104 52 96 L 52 80 Q 52 72 58 72 Z" };

/** The 2½ in TFT build: the same body, a size up. */
const TFT_BODY_BIG: SilhouettePath = { role: "trim", d: "M 58 70 L 140 70 Q 148 70 148 78 L 148 98 Q 148 106 140 106 L 58 106 Q 52 106 52 98 L 52 78 Q 52 70 58 70 Z" };

/** TFT ball-valve body (QuadraFog, ThunderFog): a smooth round barrel, no rail. */
const BALL_BODY: SilhouettePath = { role: "trim", d: "M 62 74 L 138 74 Q 146 74 146 82 L 146 94 Q 146 102 138 102 L 62 102 Q 54 102 54 94 L 54 82 Q 54 74 62 74 Z" };

/** Master stream body (placeholder until monitors arrive): wide and low. */
const MASTER_BODY: SilhouettePath = { role: "trim", d: "M 60 70 L 142 70 Q 152 70 152 80 L 152 96 Q 152 106 142 106 L 60 106 Q 52 106 52 96 L 52 80 Q 52 70 60 70 Z" };

/** Elkhart XD body: a long slim tube under the bale. */
const XD_BODY: SilhouettePath = { role: "trim", d: "M 58 76 L 142 76 Q 150 76 150 82 L 150 94 Q 150 100 142 100 L 58 100 Q 52 100 52 94 L 52 82 Q 52 76 58 76 Z" };

/** The 2½ in Phantom XD High-Range: the XD tube on the big inlet. */
const XD_BODY_BIG: SilhouettePath = { role: "trim", d: "M 58 74 L 144 74 Q 152 74 152 81 L 152 95 Q 152 102 144 102 L 58 102 Q 52 102 52 95 L 52 81 Q 52 74 58 74 Z" };

/** Akron Turbojet: extruded body with flat facets. */
const EXTRUDED: SilhouettePath = { role: "trim", d: "M 60 80 L 70 72 L 130 72 L 140 80 L 140 96 L 130 104 L 70 104 L 60 96 Z" };

/** Akron Mid-Range Assault: the same extruded body, chunkier. */
const EXTRUDED_CHUNK: SilhouettePath = { role: "trim", d: "M 58 80 L 68 70 L 132 70 L 142 80 L 142 96 L 132 106 L 68 106 L 58 96 Z" };

/** POK Slide-O-Matic: squared slide body, no grip. */
const POK_BODY: SilhouettePath = { role: "trim", d: "M 60 72 L 138 72 L 138 102 L 60 102 Q 54 102 54 96 L 54 78 Q 54 72 60 72 Z" };

/** POK Slide-O-Matic 300: the 2½ in build of the same body. */
const POK_BODY_BIG: SilhouettePath = { role: "trim", d: "M 60 70 L 140 70 L 140 104 L 60 104 Q 52 104 52 96 L 52 78 Q 52 70 60 70 Z" };

/** The 4AN's brass barrel body. */
const BODY_BRASS: SilhouettePath = { role: "barrel", d: "M 58 76 L 142 76 Q 150 76 150 82 L 150 94 Q 150 100 142 100 L 58 100 Q 52 100 52 94 L 52 82 Q 52 76 58 76 Z" };

const BARREL: SilhouettePath = { role: "trim", d: "M 138 79 L 206 79 L 206 97 L 138 97 Z" };
const BARREL_BIG: SilhouettePath = { role: "trim", d: "M 138 78 L 206 78 L 206 98 L 138 98 Z" };
const BARREL_MASTER: SilhouettePath = { role: "trim", d: "M 144 76 L 206 76 L 206 100 L 144 100 Z" };
const BARREL_BRASS: SilhouettePath = { role: "barrel", d: "M 138 80 L 206 80 L 206 96 L 138 96 Z" };

/** The maker's light label band on the barrel (TFT, Elkhart, Akron). */
const BAND: SilhouettePath = { role: "swivel", d: "M 184 80 L 200 80 L 200 96 L 184 96 Z" };

/** The 4AN's two knurled brass rings. */
const KNURLS: SilhouettePath[] = [
  { role: "swivel", d: "M 82 77 L 88 77 L 88 99 L 82 99 Z" },
  { role: "swivel", d: "M 118 77 L 124 77 L 124 99 L 118 99 Z" },
];

/** TFT front head: a fat round drum; the turbine-like teeth are the component's own. */
const HEAD_TFT: SilhouettePath = { role: "trim", d: "M 220 62 L 258 62 Q 276 62 276 78 L 276 98 Q 276 114 258 114 L 220 114 Q 202 114 202 98 L 202 78 Q 202 62 220 62 Z" };
const HEAD_TFT_BIG: SilhouettePath = { role: "trim", d: "M 220 60 L 256 60 Q 276 60 276 78 L 276 98 Q 276 116 256 116 L 220 116 Q 200 116 200 98 L 200 78 Q 200 60 220 60 Z" };

/** Elkhart XD front head: a bumper that flares out toward the tip. */
const HEAD_ELK: SilhouettePath = { role: "trim", d: "M 204 68 Q 204 64 209 63 L 266 60 Q 274 59 274 66 L 274 110 Q 274 117 266 116 L 209 113 Q 204 112 204 108 Z" };
const HEAD_ELK_BIG: SilhouettePath = { role: "trim", d: "M 202 66 Q 202 62 207 61 L 266 58 Q 276 57 276 64 L 276 112 Q 276 119 266 118 L 207 115 Q 202 114 202 110 Z" };

/** Akron front head: a straight drum with chamfered (octagonal) rim. */
const HEAD_AKRON: SilhouettePath = { role: "trim", d: "M 212 62 L 268 62 L 276 70 L 276 106 L 268 114 L 212 114 L 204 106 L 204 70 Z" };
const HEAD_ASSAULT: SilhouettePath = { role: "trim", d: "M 214 64 L 266 64 L 274 72 L 274 104 L 266 112 L 214 112 L 206 104 L 206 72 Z" };

/** POK front head: a straight black bumper, rounded at the tip. */
const HEAD_POK: SilhouettePath = { role: "trim", d: "M 204 63 L 268 63 Q 276 63 276 71 L 276 105 Q 276 113 268 113 L 204 113 Z" };

/** Master stream head (placeholder): the biggest drum of the lot. */
const HEAD_MASTER: SilhouettePath = { role: "trim", d: "M 220 56 L 256 56 Q 278 56 278 79 L 278 97 Q 278 120 256 120 L 220 120 Q 198 120 198 97 L 198 79 Q 198 56 220 56 Z" };

/** The 4AN's steel tip ring (its brass tip body sits under the collar the component draws). */
const TIP_BRASS: SilhouettePath[] = [{ role: "swivel", d: "M 272 78 L 279 78 L 279 98 L 272 98 Z" }];

/** TFT VPGI handlines (HM-VPGI, H-VPGI, BGH-125): one-piece body, pistol grip, slide valve, round head. */
const TFT_VPGI: SilhouettePath[] = [...SWIVEL, GRIP, TFT_BODY, BARREL, BAND, HEAD_TFT];

/** The 2½ in Handline H-2VPGI: the VPGI shape on the big inlet. */
const TFT_VPGI_BIG: SilhouettePath[] = [...SWIVEL_BIG, GRIP, TFT_BODY_BIG, BARREL_BIG, BAND, HEAD_TFT_BIG];

/** TFT G-Force: the VPGI shape; its own flow ring and metal teeth are the component's. */
const TFT_GFORCE: SilhouettePath[] = [...SWIVEL, GRIP, TFT_BODY, BARREL, HEAD_TFT];

/** TFT QuadraFog: ball valve, no grip. */
const TFT_QUADRAFOG: SilhouettePath[] = [...SWIVEL, BALL_BODY, BARREL, HEAD_TFT];

/** TFT ThunderFog: ball valve with a pistol grip. */
const TFT_THUNDERFOG: SilhouettePath[] = [...SWIVEL, GRIP, BALL_BODY, BARREL, HEAD_TFT];

/** The 2½ in ThunderFog JTS250PS: the same shape on the big inlet. */
const TFT_THUNDERFOG_BIG: SilhouettePath[] = [...SWIVEL_BIG, GRIP, BALL_BODY, BARREL_BIG, HEAD_TFT_BIG];

/** Masters (placeholder until M6): plain wide body, no grip, no shutoff. */
const MASTER: SilhouettePath[] = [...SWIVEL_BIG, MASTER_BODY, BARREL_MASTER, HEAD_MASTER];

/** Elkhart XD fog family (Chief, Phantom, Select-O-Matic): slim tube, flared bumper, no grip. */
const ELK_XD: SilhouettePath[] = [...SWIVEL, XD_BODY, BARREL, BAND, HEAD_ELK];

/** The 2½ in Phantom XD High-Range: the XD shape on the big inlet. */
const ELK_XD_BIG: SilhouettePath[] = [...SWIVEL_BIG, XD_BODY_BIG, BARREL_BIG, BAND, HEAD_ELK_BIG];

/** Akron Turbojet 1720: extruded body, pistol grip, blocky head. */
const AKRON_TURBOJET: SilhouettePath[] = [...SWIVEL, GRIP, EXTRUDED, BARREL, HEAD_AKRON];

/** Akron Mid-Range Assault: the chunkier extrusion, no teeth. */
const AKRON_ASSAULT: SilhouettePath[] = [...SWIVEL, GRIP, EXTRUDED_CHUNK, BARREL, BAND, HEAD_ASSAULT];

/** Akron 4AN Navy: all brass — the whole tool in bare metal. */
const AKRON_4AN: SilhouettePath[] = [...SWIVEL_BRASS, BODY_BRASS, ...KNURLS, BARREL_BRASS, ...TIP_BRASS];

/** POK Slide-O-Matic 150: squared slide body; the index marks and pressure ring are the component's. */
const POK_150: SilhouettePath[] = [...SWIVEL, POK_BODY, BARREL, HEAD_POK];

/** POK Slide-O-Matic 300: the 2½ in build of the same body. */
const POK_300: SilhouettePath[] = [...SWIVEL_BIG, POK_BODY_BIG, BARREL_BIG, HEAD_POK];

/** One entry per researched row of `data/catalog/nozzles.csv`. */
export const SILHOUETTES: Record<string, SilhouettePath[]> = {
  "TFT-HM-VPGI": TFT_VPGI,
  "TFT-H-VPGI": TFT_VPGI,
  "TFT-H-2VPGI": TFT_VPGI_BIG,
  "TFT-BGH-125": TFT_VPGI,
  "TFT-GF3C2S": TFT_GFORCE,
  "TFT-GF3D2S": TFT_GFORCE,
  "TFT-FQS125F": TFT_QUADRAFOG,
  "TFT-FTS200PS": TFT_THUNDERFOG,
  "TFT-JTS250PS": TFT_THUNDERFOG_BIG,
  "TFT-M-RS1000-NJ": MASTER,
  "ELK-CHIEF-XD-MID-TIP": ELK_XD,
  "ELK-CHIEF-XD-HIGH-TIP": ELK_XD,
  "ELK-PHANTOM-XD-MID": ELK_XD,
  "ELK-PHANTOM-XD-HIGH": ELK_XD_BIG,
  "ELK-SM-XD-MID": ELK_XD,
  "ELK-SM-XD-HIGH": ELK_XD,
  "ELK-SM1250-XSTREAM": MASTER,
  "ELK-CSW-LB": MASTER,
  "AKR-17204001": AKRON_TURBOJET,
  "AKR-48634028": AKRON_ASSAULT,
  "AKR-51600004": MASTER,
  "AKR-20690001": AKRON_4AN,
  "POK-SOM-150": POK_150,
  "POK-SOM-300": POK_300,
};

/** The model's own static silhouette, or null to keep the generic drawing. */
export function silhouetteOf(nozzle: ScenarioNozzle): SilhouettePath[] | null {
  if (nozzle.design === "smooth-bore" || nozzle.design === "open-end") return null;
  if (nozzle.specId === null) return null;
  return SILHOUETTES[nozzle.specId] ?? null;
}
