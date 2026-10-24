# PLT-11 reference

Imported 2026-10-24 from `fd-app/data/reference/vehicles/plt11/handoff-v3`
(evidence as of 2026-10-23). `handoff-v3/README.md` is the canonical record;
`handoff-v3/photos/` holds the original on-unit photographs. This is
reference material, not runtime data: the app never reads this folder.

## What the evidence establishes

- **Apparatus:** PLT-11, Simon-Duplex chassis (1995 probable), Simon-LTI
  **HT3S-85** aerial, 85 ft nominal class.
- **Envelope:** 86.4 ft maximum platform elevation (26.33 m), 80.7 ft maximum
  horizontal reach (24.60 m), −4° to +75°, average heel-pin height 9.6 ft.
- **Load chart:** 750 lb dry platform; the water-tower platform row conflicts
  between 250 lb (lower bands) and 500 lb (upper bands). The large callout
  says 500 lb, but the lower bands do not; do not adopt the permissive value.
  Machine table: `handoff-v3/data/plt11_load_chart.csv`.
- **Pump plate:** 1504 gpm @ 150 psi, 1504 @ 165, 1051 @ 200, 750 @ 250, all
  single stage. Plate RPMs are probably engine RPM, not confirmed. Governed
  engine speed 2275 rpm; engine/pump ratio 1:1.94; `SERIAL # 741218` has
  unclear scope. Machine table: `handoff-v3/data/plt11_pump_rating_points.csv`.
- **Water-tower nozzle limits:** 1500 US gpm with the monitor at 90° to the
  ladder centreline; 2000 US gpm with the monitor parallel, in the forward-to-
  straight-down arc; below 30° elevation the nozzle must stay horizontal or
  below. These are aerial structural limits, not a waterway Δp–Q curve.
- **Chassis:** GVWR 60,000 lb; GAWR 20,000 front / 40,000 rear; probable VIN
  `1S91F74F6S1020008`. The engine is probably an 8V92 by geometry, but the
  `08VA` serial prefix conflicts with that identification.

## Still unknown

Exact retracted/extended section lengths, individual base/mid/fly member
lengths, turntable/pivot/torque-box geometry, platform dimensions, PLT-11's
stabilizer count/span/positions, the pump-to-waterway plumbing and waterway
bore, the monitor model/tip, and the installed pump OEM/model. The canonical
README lists these as open; do not fill them from another HT3S-85 or a modern
LTI.

## Layout

- `handoff-v3/README.md` — evidence, conflicts, conditions and source registry.
- `handoff-v3/data/` — structured transcriptions, manifests and hashes.
- `handoff-v3/photos/` — 17 original unit photos.
- `handoff-v3/archive/` — earlier handoff versions, for history only.
- `handoff-v3/AGENT_INSTRUCTIONS.md` — upstream fd-app import instructions;
  they do not override this repo's layout or safety rules.
