import type { ScenarioNozzle } from "$hydraulics/scenario.ts";

/**
 * The nozzle's anatomy (UX.md §3): which controls a model actually has and
 * where they sit on its body. Drawing only — the solver never reads this, and
 * a wrong entry changes no number.
 *
 * Stations, in drawn order from the hose to the tip:
 *
 *   valve     the shutoff body: bale lever, slide valve or ball valve
 *   grip      the pistol grip, under the valve
 *   barrel    plain body between the valve and the tip
 *   flow      the gallonage ring, or the pressure-selection ring
 *   pattern   the rotating collar / rubber bumper
 *   tip       the teeth, or a smooth bore's stacked tip
 *
 * A control may sit at another station when its model puts it elsewhere: POK
 * indexes the flow on the slide valve itself (`flow: "slide-index"`).
 *
 * Every entry mirrors a row of `data/catalog/nozzles.csv` by id, and carries
 * the published basis it was drawn from (a product page, a spec sheet) or
 * "pending". `verify` is true until the drawn controls are checked against
 * the model's own plate, photo or manual (owner, 2026-10-19: control
 * locations may differ between models and will need tuning). Tune an entry
 * here — the in-canvas drawing and the close-up both read this map.
 */

export type NozzleStation = "valve" | "grip" | "barrel" | "flow" | "pattern" | "tip";

export type NozzleShutoff = "bale" | "slide" | "ball" | "none";

/** How the model selects flow: its own gallonage ring, the slide valve's index, or nothing (fixed / automatic). */
export type NozzleFlow = "ring" | "slide-index" | "none";

export type NozzleTeeth = "rubber" | "metal" | "none";

export type NozzleAnatomy = {
  shutoff: NozzleShutoff;
  flow: NozzleFlow;
  /** Where the flow control is drawn; `slide-index` sits on the valve. */
  flowAt: NozzleStation;
  /**
   * A ring that picks the operating pressure (POK: 50/100 psi). Drawn as part
   * of the model; not workable until the rating story for dual-pressure
   * automatics is decided (nobody changes a number yet).
   */
  pressureRing: readonly number[] | null;
  pressureAt: NozzleStation;
  grip: boolean;
  pattern: boolean;
  teeth: NozzleTeeth;
  /** The published basis for the controls, or why the row still needs a check. */
  basis: string;
  /** True until a plate, photo or manual confirms the drawn controls and their locations. */
  verify: boolean;
};

type AnatomyInput = Omit<NozzleAnatomy, "flowAt" | "pressureAt" | "pressureRing"> &
  Partial<Pick<NozzleAnatomy, "flowAt" | "pressureAt" | "pressureRing">>;

function anatomy(entry: AnatomyInput): NozzleAnatomy {
  return {
    flowAt: entry.flow === "slide-index" ? "valve" : "flow",
    pressureAt: "flow",
    pressureRing: null,
    ...entry,
  };
}

/** One entry per researched row of `data/catalog/nozzles.csv` with `design = combination`, plus the researched smooth-bore assembly. */
const RESEARCHED: Record<string, NozzleAnatomy> = {
  // Task Force Tips.
  "TFT-HM-VPGI": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: true,
    pattern: true,
    teeth: "rubber",
    basis: "tft.com/product/hm-vpgi: slide valve, pistol grip, fixed rubber teeth; automatic",
    verify: false,
  }),
  "TFT-H-2VPGI": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: true,
    pattern: true,
    teeth: "rubber",
    basis: "TFT Handline VPGI series (h-vpgi page); the 2.5 in build's own sheet still to check",
    verify: true,
  }),
  "TFT-GF3D2S": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "tft.com/product/gf3c2s, the 75 psi build of the same series",
    verify: false,
  }),
  "TFT-GF3C2S": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "tft.com/product/gf3c2s: slide valve, pistol grip, spinning metal teeth",
    verify: false,
  }),
  "TFT-FQS125F": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "tft.com/product/fqs125f: ball valve, no grip, fixed metal teeth",
    verify: false,
  }),
  "TFT-FTS200PS": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "tft.com/product/fts200ps: ball valve, pistol grip, spinning metal teeth",
    verify: false,
  }),
  "TFT-JTS250PS": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "catalog note: ball valve, pistol grip, spinning metal teeth",
    verify: false,
  }),
  "TFT-H-VPGI": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: true,
    pattern: true,
    teeth: "rubber",
    basis: "tft.com/product/h-vpgi: slide valve, pistol grip, rubber teeth; automatic",
    verify: false,
  }),
  "TFT-BGH-125": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: true,
    pattern: true,
    teeth: "rubber",
    basis: "product title (h-vpgi page, related products): pistol grip, slide valve, rubber teeth",
    verify: false,
  }),
  "TFT-M-RS1000-NJ": anatomy({
    shutoff: "none",
    flow: "ring",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "pending: master stream model plate/photo",
    verify: true,
  }),

  // Elkhart Brass.
  "ELK-CHIEF-XD-MID-TIP": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "elkhartbrass.com Phantom XD page: XD fog family bale handle and bumper; Chief's own page still to check",
    verify: true,
  }),
  "ELK-CHIEF-XD-HIGH-TIP": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "elkhartbrass.com Phantom XD page: XD fog family bale handle and bumper; Chief's own page still to check",
    verify: true,
  }),
  "ELK-PHANTOM-XD-MID": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "elkhartbrass.com/products/handline-nozzles/phantom-xd: bale handle, tactile selection grips, spinning stainless standard",
    verify: false,
  }),
  "ELK-PHANTOM-XD-HIGH": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "elkhartbrass.com/products/handline-nozzles/phantom-xd: bale handle, tactile selection grips, spinning stainless standard",
    verify: false,
  }),
  "ELK-SM-XD-MID": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "elkhartbrass.com Phantom XD page: XD fog family bale handle and bumper; Select-O-Matic's own page still to check",
    verify: true,
  }),
  "ELK-SM-XD-HIGH": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "elkhartbrass.com Phantom XD page: XD fog family bale handle and bumper; Select-O-Matic's own page still to check",
    verify: true,
  }),
  "ELK-SM1250-XSTREAM": anatomy({
    shutoff: "none",
    flow: "none",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "pending: master stream model plate/photo",
    verify: true,
  }),
  "ELK-CSW-LB": anatomy({
    shutoff: "none",
    flow: "ring",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "pending: master stream model plate/photo",
    verify: true,
  }),

  // MAFCO.
  "MAF-SS402": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "mafco-fire.com/product/ss-series-handline-nozzles; Safequip 2021 catalogue: bale handle (owner, 2026-10-21), gallonage ring, pistol grip, 316 stainless turbine teeth",
    verify: false,
  }),

  // Protek.
  "PRO-368": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "protekfire.com.tw/handline-nozzles/selectable-gallonage-nozzles/105-368: bail handle on a chrome-plated ball valve, gallonage ring, pistol grip, spinning stainless teeth",
    verify: false,
  }),

  // Akron Brass.
  "AKR-17204001": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "akronbrass.com/turbojet-nozzle-100psi: one-piece handle with stops, quarter-turn bumper, spinning teeth, removable pistol grip",
    verify: false,
  }),
  "AKR-1723P": anatomy({
    shutoff: "bale",
    flow: "ring",
    grip: true,
    pattern: true,
    teeth: "metal",
    basis: "akronbrass.com/mid-range-turbojetr-nozzle-with-pistol-grip: bale handle with stops, trunnion-mounted ball valve, pistol grip, spinning metal teeth",
    verify: false,
  }),
  "AKR-1420": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: true,
    pattern: false,
    teeth: "none",
    basis: "Viper VB9520 bail shutoff + Akron 1420 triple stacked tips; product photos and literature",
    verify: true,
  }),
  "AKR-48634028": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: true,
    pattern: true,
    teeth: "none",
    basis: "akronbrass.com/mid-range-assault: shutoff handle, removable pistol grip, quarter-turn pattern; teeth still to check",
    verify: true,
  }),
  "AKR-51600004": anatomy({
    shutoff: "none",
    flow: "none",
    grip: false,
    pattern: true,
    teeth: "metal",
    basis: "pending: master stream model plate/photo",
    verify: true,
  }),
  "AKR-20690001": anatomy({
    shutoff: "bale",
    flow: "none",
    grip: false,
    pattern: true,
    teeth: "none",
    basis: "akronbrass.com/4an: brass fog tip, controls pending a plate/photo",
    verify: true,
  }),
  "POK-SOM-150": anatomy({
    shutoff: "bale",
    flow: "slide-index",
    pressureRing: [50, 100],
    grip: false,
    pattern: true,
    teeth: "none",
    basis: "POK catalogue: slide valve indexed at 20/40/60/80/100% and a 50/100 psi selection ring; pattern and teeth pending",
    verify: true,
  }),
  "POK-SOM-300": anatomy({
    shutoff: "bale",
    flow: "slide-index",
    pressureRing: [50, 100],
    grip: false,
    pattern: true,
    teeth: "none",
    basis: "POK catalogue: slide valve indexed at 20/40/60/80/100% and a 50/100 psi selection ring; pattern and teeth pending",
    verify: true,
  }),
};

/** A handline fog nozzle with nothing known about it: a bale and a pattern collar (the drawing before 2026-10-19). */
const GENERIC_FOG: NozzleAnatomy = anatomy({
  shutoff: "bale",
  flow: "none",
  grip: false,
  pattern: true,
  teeth: "none",
  basis: "generic: a bale and a pattern collar; replace with the model's own row",
  verify: false,
});

/** Smooth bore: a shutoff and a stacked tip, no ring and no pattern (MODEL.md §3.4). */
const SMOOTH_BORE: NozzleAnatomy = anatomy({
  shutoff: "bale",
  flow: "none",
  grip: false,
  pattern: false,
  teeth: "none",
  basis: "smooth bore: a shutoff and a stacked tip",
  verify: false,
});

/** No nozzle: nothing to work (MODEL.md §3.4d). */
const OPEN_END: NozzleAnatomy = anatomy({
  shutoff: "none",
  flow: "none",
  grip: false,
  pattern: false,
  teeth: "none",
  basis: "open end: no nozzle",
  verify: false,
});

/** The anatomy the drawings use for a nozzle in a scenario. */
export function anatomyOf(nozzle: ScenarioNozzle): NozzleAnatomy {
  const design = nozzle.design ?? "fog";
  if (design === "open-end") return OPEN_END;
  const known = nozzle.specId === null ? undefined : RESEARCHED[nozzle.specId];
  if (known) return known;
  if (design === "smooth-bore") return SMOOTH_BORE;
  return { ...GENERIC_FOG, flow: nozzle.kind === "selectable" ? "ring" : "none" };
}
