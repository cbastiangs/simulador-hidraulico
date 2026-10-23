# Nozzle reference sources

Captured 2026-10-19–21. Local paths are relative to this folder. `raw/` is
gitignored; `photos/` is tracked.

## Station truck units

| Unit | Source | Local reference |
|---|---|---|
| MAFCO SS402 | https://www.mafco-fire.com/product/ss-series-handline-nozzles/ | `photos/truck/mafco-ss602-21.jpg`, `photos/truck/mafco-ss6021.jpg` (SS602 series photo; exact S402 markings still to check), `raw/nozzles/mafco.html` |
| MAFCO SS402 dimensions | https://www.firebreaksa.co.za/wp-content/uploads/2022/01/Firebreak-SA_Firefighting-Nozzle_SS402.pdf | `raw/nozzles/ss402.pdf` |
| MAFCO SS402 valve | https://safequip.co.za/wp-content/uploads/2021/11/Safequip-Product-Guide-2021_v2.pdf | `raw/nozzles/safequip.pdf` — names the integral slide valve; the station unit has a bale handle over it |
| Protek Style 368 | https://www.protekfire.com.tw/handline-nozzles/selectable-gallonage-nozzles/105-368 | `photos/truck/protek-368.jpg`, `raw/nozzles/protek368.html` |
| Protek 368 reach | https://www.firearmour.com.sg/product/protek-handline-nozzle-368/ | 100 psi rows in `data/catalog/nozzle-reach.csv` (95–250 gpm effective/overall); page table also covers 75 and 125 psi; page text in `raw/nozzles/protek368.html` |
| Akron Mid-Range Turbojet 1723P | https://www.akronbrass.com/mid-range-turbojetr-nozzle-with-pistol-grip | `photos/truck/akron-1723.jpg`, `raw/nozzles/akron-1723.html` |
| Akron 1723P reach | https://www.fireresponse.com.au/wp-content/uploads/2022/04/flow-reach-turbojet-100-psi.pdf | `raw/nozzles/akron_turbojet_flow_reach_100psi.pdf`; 100 psi rows in `data/catalog/nozzle-reach.csv` (95–200 gpm effective/overall); table measured at 32° above horizontal, still conditions |
| Akron 1420 triple stacked tips | https://www.akronbrass.com/triple-stacked-tips-4 | `photos/truck/akron-1420.jpg`, `raw/nozzles/akron1420.html` |
| Akron 2018 catalog | https://media.idexcorp.com/m/219b47fe497c7f8c/original/2018-Akron-Brass-Catalog.pdf | URL only; not copied into the raw cache |
| Viper VB9520 shutoff | https://www.northridgefire.com/i210569-vb9520-1-5-nh-nozzle-shut-off-with-grip.html | `photos/truck/viper-vb9520.jpg`, `photos/truck/viper-vb9520-2.jpg`, `raw/nozzles/viper.html` |
| Viper VB9520 literature | https://www.cssupplyinc.com/1-1-2-ball-shutoff-w-pistol-grip-model-vb9520/ | `raw/nozzles/viper-catalog.pdf`, `raw/nozzles/kuriyama.pdf` |
| Smooth-bore reach | https://depotsafety.co.id/wp-content/uploads/2017/12/Flow-Reach-Data.pdf | Protek flow/reach table (1 in tip at 50 psi); baseline row in `data/catalog/nozzle-reach.csv`; not Akron-specific; no local PDF copy |

## Existing art photo sets

- `photos/refs2/` — product photo set used by the TFT, Elkhart, Akron, and POK
  art comments. File prefixes identify the model (`tft-*`, `elk-*`, `akr-*`,
  `pok-*`); the individual source pages are the manufacturer/distributor
  product pages named in `data/catalog/nozzles.csv`.
- `photos/refs/tft-m-rs1000-nj_01-10.png` — TFT master-stream plate used by
  `tft-m-rs1000-nj.ts`.
- `raw/refs/` and `raw/refs2/` — full local copies of the photo captures,
  including duplicates and page screenshots. Gitignored.

## Technical PDFs in the raw cache

These are local copies of manufacturer/distributor documents. The filenames
preserve their source names; use the manufacturer site if a link is needed.

- `LIM-030.pdf` — TFT Handline automatic nozzle manual.
- `TFT_Handline_automatic_manual.pdf`
- `TFT G-Force_manual_fixed_selectable_automatic_curves.pdf`
- `TFT_g_force_manual.pdf`
- `TFT_QuadraFog_ThunderFog_manual.pdf`
- `tft-lot.pdf` — TFT flow/reach and smooth-bore data.
- `Elkhart_smooth-bore_flow_&_reactionchart.pdf`
- `elkhart_effective_range_solid_streams.pdf`
- `elkhart_chiefxd_reach.pdf`
- `elkhart_cswl_reach_height.pdf`
- `elkhart_sm1250_reach_height.pdf`
- `elkhart_xd_bulletin_0156.pdf`
- `elkhart_xstream_performance.pdf`
- `Elkhart_Select-O-Matic_flow-vs-pressure chart_sheet.pdf`
- `pok-cat.pdf` — POK catalogue.
- `safequip.pdf` — Safequip 2021 product guide (MAFCO SS402).
- `ss402.pdf` — Firebreak SA SS402 sheet.
- `kuriyama.pdf` — Kuriyama/Viper fire nozzle catalogue.
- `akron_turbojet_flow_reach_100psi.pdf` — Akron Turbojet reach table.

## Notes

- The `raw/` cache is intentionally ignored: it is large and contains full
  scrapes. It can be deleted after the catalog and art are considered fully
  scraped; `photos/` plus this file remain the durable reference.
- Actual truck-unit photos are still missing. They are needed to confirm the
  Viper/1420 pairing, the MAFCO S402 markings, and the installed tip size.
