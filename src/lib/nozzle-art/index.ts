import type { ScenarioNozzle } from "$hydraulics/scenario.ts";
import type { NozzleArt, SideArt, TopArt } from "./types.ts";

import tftHmVpgi from "./tft-hm-vpgi.ts";
import tftH2vpgi from "./tft-h-2vpgi.ts";
import tftGf3d2s from "./tft-gf3d2s.ts";
import tftGf3c2s from "./tft-gf3c2s.ts";
import tftFqs125f from "./tft-fqs125f.ts";
import tftFts200ps from "./tft-fts200ps.ts";
import tftJts250ps from "./tft-jts250ps.ts";
import tftHVpgi from "./tft-h-vpgi.ts";
import tftBgh125 from "./tft-bgh-125.ts";
import tftMRs1000Nj from "./tft-m-rs1000-nj.ts";
import elkChiefXdMidTip from "./elk-chief-xd-mid-tip.ts";
import elkChiefXdHighTip from "./elk-chief-xd-high-tip.ts";
import elkPhantomXdMid from "./elk-phantom-xd-mid.ts";
import elkPhantomXdHigh from "./elk-phantom-xd-high.ts";
import elkSmXdMid from "./elk-sm-xd-mid.ts";
import elkSmXdHigh from "./elk-sm-xd-high.ts";
import elkSm1250Xstream from "./elk-sm1250-xstream.ts";
import elkCswLb from "./elk-csw-lb.ts";
import mafSs402 from "./maf-ss402.ts";
import pro368 from "./pro-368.ts";
import akr17204001 from "./akr-17204001.ts";
import akr1723p from "./akr-1723p.ts";
import akr1420 from "./akr-1420.ts";
import akr48634028 from "./akr-48634028.ts";
import akr51600004 from "./akr-51600004.ts";
import akr20690001 from "./akr-20690001.ts";
import pokSom150 from "./pok-som-150.ts";
import pokSom300 from "./pok-som-300.ts";

/**
 * The art each researched row of `data/catalog/nozzles.csv` draws with, by
 * specId; null keeps the generic drawing (a row whose art has not landed
 * yet). See `types.ts` for the two coordinate frames and the drawing rules.
 */
const ART: Record<string, NozzleArt | null> = {
  "TFT-HM-VPGI": tftHmVpgi,
  "TFT-H-2VPGI": tftH2vpgi,
  "TFT-GF3D2S": tftGf3d2s,
  "TFT-GF3C2S": tftGf3c2s,
  "TFT-FQS125F": tftFqs125f,
  "TFT-FTS200PS": tftFts200ps,
  "TFT-JTS250PS": tftJts250ps,
  "TFT-H-VPGI": tftHVpgi,
  "TFT-BGH-125": tftBgh125,
  "TFT-M-RS1000-NJ": tftMRs1000Nj,
  "ELK-CHIEF-XD-MID-TIP": elkChiefXdMidTip,
  "ELK-CHIEF-XD-HIGH-TIP": elkChiefXdHighTip,
  "ELK-PHANTOM-XD-MID": elkPhantomXdMid,
  "ELK-PHANTOM-XD-HIGH": elkPhantomXdHigh,
  "ELK-SM-XD-MID": elkSmXdMid,
  "ELK-SM-XD-HIGH": elkSmXdHigh,
  "ELK-SM1250-XSTREAM": elkSm1250Xstream,
  "ELK-CSW-LB": elkCswLb,
  "MAF-SS402": mafSs402,
  "PRO-368": pro368,
  "AKR-17204001": akr17204001,
  "AKR-1723P": akr1723p,
  "AKR-1420": akr1420,
  "AKR-48634028": akr48634028,
  "AKR-51600004": akr51600004,
  "AKR-20690001": akr20690001,
  "POK-SOM-150": pokSom150,
  "POK-SOM-300": pokSom300,
};

function artOf(nozzle: ScenarioNozzle): NozzleArt | null {
  const design = nozzle.design ?? "fog";
  if (design === "open-end") return null;
  if (nozzle.specId === null) return null;
  return ART[nozzle.specId] ?? null;
}

/** The model's own side view, or null to keep the generic canvas drawing. */
export function sideArtOf(nozzle: ScenarioNozzle): SideArt | null {
  return artOf(nozzle)?.side ?? null;
}

/** The model's own top view, or null to keep the generic close-up. */
export function topArtOf(nozzle: ScenarioNozzle): TopArt | null {
  return artOf(nozzle)?.top ?? null;
}
