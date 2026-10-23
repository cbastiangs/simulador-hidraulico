# Nozzle drawing references

Photos and source documents behind `src/lib/nozzle-art/` and the researched
rows of `data/catalog/nozzles.csv`. Reach measurements live separately in
`data/catalog/nozzle-reach.csv`. This is reference material, not runtime
data: the app never reads this folder.

## Layout

- `photos/truck/` — the four units in the station inventory: MAFCO SS402,
  Protek Style 368, Akron Mid-Range Turbojet 1723P, and the Viper VB9520 +
  Akron 1420 smooth bore. These are manufacturer/distributor product photos,
  not photos of the individual truck units.
- `photos/refs2/` — the photo set cited by the existing art comments
  (`akr-turbojet-1.jpg`, `elk-phantom-xd-0.jpg`, `tft-gf3c2s.png`, and so on).
- `photos/refs/` — the TFT master-stream plate used by the M-RS1000-NJ art.
- `raw/` — gitignored cache: full scrapes, PDFs, HTML captures, page renders,
  and duplicates. It is local convenience only; a clone does not include it.
  The source URLs in `SOURCES.md` are the durable reference.

## How the art uses them

The side view compresses length but keeps diameter ratios; the top view is a
true-scale plan projection. Use the photos for shape and the spec sheets for
dimensions. Do not infer a dimension from perspective, and do not trace a
side-view handle or bale into the top view (see `docs/UX.md` §3.1).

Each art file names the photo or source it was drawn from. When a photo is
replaced, update that comment and this folder together.

## Provenance and limits

Manufacturer and distributor images remain the copyright of their owners;
they are kept here as internal drawing references. `SOURCES.md` lists the
capture URLs.

Still to confirm from the actual truck units: the Viper VB9520 / Akron 1420
pairing, the exact MAFCO S402 markings, and the installed tip size. The
current drawings are the published product shapes, not serial-specific
configurations.
