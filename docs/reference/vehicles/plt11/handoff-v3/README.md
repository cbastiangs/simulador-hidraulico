# PLT-11 — Canonical technical research handoff for fd.app

**Version:** 3.0 — 2026-10-23  
**Purpose:** One research record for the fd.app equipment catalog, BookStack/wiki, 2D aerial ladder trainer, and optional future pump/waterway research. **Not** an operating manual, certified load calculator or simulation of the physical apparatus.  
**Unit:** PLT-11, Compañía de Bomberos Cosmopolita N.º 11, Lima, Peru.

## Read this first: trust, provenance, and scope

The highest-authority evidence in this bundle is **17 original on-unit photographs**: eight aerial/load-chart/pump-panel photos (`photos/`) and nine chassis/engine/fluid/weight photos (`photos/chassis/`). Repeated photographs are **intentional**, because lighting/reflections make different lettering legible in different shots.

Treat evidence in this order:

1. `DIRECT_UNIT_PLATE` — original PLT-11 nameplates/controls photographed on this vehicle.
2. `EXACT_MODEL_OEM` — verified original **HT3S-85** documents. None of the actual operator/build manuals have yet been recovered; only a vintage brochure **listing** exists.
3. `INSTALLED_COMPONENT_FAMILY` — Hale TPM and Class 1 Flowminder manuals, **revision match not established**.
4. `EXACT_MODEL_OTHER_UNIT` — auction listing for a *different* HT3S-85.
5. `RELATED_ONLY` — later/different aerials, department training manuals, background.
6. `DERIVED` — unit conversions, general engineering, geometry approximations, interpretations.
7. `UNVERIFIED` — illegible fields, physical dimensions not measured, disputed data.

Never upgrade a `DERIVED` claim to an original specification; never copy measurements from a different truck into PLT-11. Store **every datum with its raw unit, source image/URL, confidence, and any conflict**. Keep scanned/photographed originals unchanged; use sidecar transcription/annotation files, not edits that replace the originals.

**Safety:** Manufacturer plates are not proof of current mechanical condition or inspection status. This record is for documentation/training; a tool must not certify actual deployment, loading, pressure, or maintenance decisions. Confirm operational restrictions with unit-specific manual, department SOPs and competent inspection.

---

## 1. Identity and subsystem separation

| System | Known identity | Evidence / qualification |
|---|---|---|
| Apparatus/unit | PLT-11, fire aerial ladder tower | User/unit context |
| Chassis/body manufacturer | **Simon-Duplex Inc.**, 120 Deeds Drive, Dover, Ohio 44622 | Chassis data plate; `1000089051.jpg` and `1000089058.jpg` |
| Chassis model year | **1995, high confidence** | Worn compliance decal and probable VIN 10th character `S`; verify against actual VIN/title |
| Chassis model designation | **Not legible enough** (seems to end `-95`) | Do not invent prefix or model |
| Aerial manufacturer | **Simon-LTI / Ladder Towers** | Aerial load chart, `1000086992.jpg` |
| Aerial model | **HT3S-85**, 85-foot nominal class | Direct load chart; nominal height also supported by exact-model listing |
| Pump rating plate manufacturer heading | Simon-LTI Fire Apparatus, historic Ephrata, PA address | `1000086988.jpg`; **not proof of exact pump manufacturer or model** |
| Hydraulic pressure relief control visible | **Hale TPM** (Total Pressure Master) | `1000086990.jpg` |
| Flowmeter visible | **Class 1 Flowminder** | `1000086991.jpg` |

**Identifier caution:** `741218` occurs under `SERIAL #` on the Simon-LTI *Fire Apparatus* pump-performance plate. Its scope is uncertain; do **not** automatically call it the Hale pump serial, aerial serial, or chassis VIN. The aerial load chart has a separate, poorly legible stamped serial tag. The chassis VIN is a different identifier (below).

## 2. Aerial dimensions: directly observed, and what they do NOT prove

| Parameter | Manufacturer plate value | Units/notes |
|---|---|---|
| Nominal class | **85 ft** | Model HT3S-85; nominal designation, **not** a measured rigid ladder length |
| Maximum platform elevation | **86.4 ft** | **26.33 m**; from reach diagram |
| Maximum horizontal platform reach | **80.7 ft** | **24.60 m**; from rotation centerline in reach diagram |
| Elevation angle range depicted | **−4° through +75°** | Manufacturer reach/operation diagram; inspect setup restrictions |
| Heel pin height | **9.6 ft average** | ~2.93 m above grade; label says `AVG. 9.6 ft` |
| Labeled section/loading locations | `BASE`, `MID`, `FLY`, `PLATFORM` | **Names in load chart, not engineering section dimensions** |
| Platform capacity dry | **750 lb** | ~340.2 kg; conditions apply |
| Manufacturer's own envelope | Curved reach chart | Original `1000086993.jpg`, full plate `1000086992.jpg` |

**Critical geometry warning for drawing agents:** The heel pin (rotation/elevation hinge) and the `centerline of rotation` are not automatically the same x-location, and a reach graph is **not** an exact CAD drawing. Do **not** set the stowed ladder length to 85 ft, treat maximum height/reach as simultaneous, or arbitrarily assign 1/3 of 85 ft to each section. The photographed diagram establishes travel-envelope bounds, not exact section overlap, pivot offset, 3D geometry or chassis/torque-box proportions. Digitizing the diagram can support approximate 2D reach illustrations, not a manufacturer-verified mechanical model.

### What remains UNKNOWN for a faithful aerial illustration

- Exact **retracted and extended ladder lengths**, individual `BASE/MID/FLY` structural member lengths, telescoping travel, minimum overlap, truss width/depth, rail spacing, cross-brace lattice pattern, cradle support points.
- **Platform/basket** external dimensions, rail height, leveling linkage, tip attachment and offsets.
- **Turntable/pedestal/torque box** geometry, chassis mounting points, pivot horizontal offset, rotation drive housing, cylinder mounts and lengths.
- **Outrigger layout** on PLT-11: precise count if not physically confirmed, longitudinal positions, horizontal span, beam lengths/sections, jack stroke, feet/pad dimensions, deployment path and frame connections.
- Truck length, overall width, wheelbase and rear-overhang precise measurements; prior chassis tire **size** is not enough by itself to solve camera perspective and suspension geometry.

For the drawing workflow, **the next priority is geometrically informative photographs/measurements**, not more pump research: full stowed true side view with minimal perspective; front/rear views; the platform and ladder sections; turntable + torque box; stabilizers deployed in an unobstructed side/front view; and known tape-measured scale reference(s) such as platform rail width, deployed outrigger span, and stowed ladder length. Avoid estimating operating structural ratings from photos.

## 3. Stabilization, ground grade, and support — directly on HT3S-85 plate

Manufacturer load-chart notes in `1000086992.jpg`:

- The rated table is based in part on **horizontal outrigger beams at MAXIMUM extension** and **weight relieved from the chassis springs**.
- Ground/support surface, wind/operating conditions and surrounding hazards influence safe operations and are not numerically resolved by this chart alone.
- **Grade up to 6%**: manufacturer tabulated capacities apply, subject to all other conditions.
- **Grade above 6% through 14%**: **reduce stated capacity by 50%**.
- **Above 14% grade**: **no allowable rating provided**; do not extrapolate or assume permitted.
- Rated aerial capacities were established with **the ladder tip unsupported**.
- Additional equipment weight must be accounted for; snow/ice requires reduction.
- Plate says the aerial is **NOT INSULATED** from energized electrical hazards.

**This is not an outrigger dimension sheet.** The exact model appearing in an **unrelated 1985 Spartan auction** was said to have four stabilizers, but the current PLT-11 photographs do not themselves show its complete deployed stabilizer arrangement. Do not present that other unit's count/measurements as verified PLT-11 hardware.

## 4. Aerial capacity chart — direct photo transcription (lb)

Plate: `1000086994.jpg`; original full chart `1000086992.jpg`. Values below use `LADDER mode / WATER TOWER mode`, as interpreted from the diagonally divided two-mode cells. This is an **unverified manual transcription** of a worn plate; preserve photograph, audit cells, and seek the original model manual. These are *rated load locations*, **not quantities intended to be added together**.

| Location | −4–20° | 21–30° | 31–40° | 41–50° | 51–60° | 61–75° |
|---|---:|---:|---:|---:|---:|---:|
| BASE | 0/0 | 250/0 | 250/0 | 500/250 | 500/250 | 750/500 |
| MID | 0/0 | 0/0 | 250/0 | 250/0 | 500/250 | 500/500 |
| FLY | 0/0 | 0/0 | 0/0 | 250/0 | 500/500 | 500/500 |
| PLATFORM | 750/250 | 750/250 | 750/250 | 750/250 | 750/500 | 750/500 |

**Critical conflict:** The large callout reads approximately **750 lb dry in platform** and **500 lb plus full water-tower rating at any length/elevation**, but the detailed platform **water-tower** row says **250 lb** at lower elevation bands and **500 lb** at higher bands. Exact rationale/revision is unknown. Flag discrepancy in data/UI, never silently adopt the permissive value. A `0` in the chart denotes no additional rated load in that cell, *not* necessarily that the ladder cannot be positioned there. Do not interpolate discrete load ranges or combine rated section loads without an OEM loading procedure.

Machine data: `data/plt11_load_chart.csv`.

## 5. Water-tower nozzle restrictions (aerial engineering; not pump output)

The plate's `NOTES TO RATED CAPACITIES` (`1000086994.jpg`) states:

1. Monitor/nozzle **90° to ladder's longitudinal centerline**: water tower capable of **1,500 US GPM** (~5,678 L/min).
2. Monitor/nozzle **parallel** to ladder centerline, in an arc **straight forward → straight down**: water tower capable of **2,000 US GPM** (~7,571 L/min).
3. When **aerial elevation is below 30°**, **nozzle elevation must remain horizontal or below horizontal** (not an upward jet above the horizon).

These are **manufacturer conditions for the aerial water tower's rated capacity**, not a measured standalone onboard pump curve. We do not know the actual monitor model, hydraulic stops, pipe ID, nozzle pressure/diameter or intermediate azimuth ratings. Do not interpolate allowable flow at 45° nozzle azimuth. A likely physical explanation is nozzle-reaction loading in different axes; that explanation is **derived**, not direct manufacturer structural calculations.

For a ladder-only simulator, these data may be **stored as annotations or an optional nozzle-orientation exercise**. Do not build fire-water hydraulics unless explicitly requested.

## 6. Pump-performance rating and panel instruments (reference data only)

Four plate points from `1000086988.jpg` (all marked `SINGLE STAGE`):

| Test flow (US GPM) | PSI | Plate RPM | Note |
|---:|---:|---:|---|
| 1,504 | 150 | 1,660 | likely engine test RPM, not verified |
| 1,504 | 165 | 1,740 | same |
| 1,051 | 200 | 1,840 | same |
| 750 | 250 | 2,010 | same |

Additional plate fields: **engine governed speed 2,275 RPM**, engine/pump ratio **`1:1.94`**; `SERIAL # 741218` (identifier scope unclear). These **do not determine the entire pump performance curve** or prove an additional electronic pressure governor is installed. The 2,000 GPM water-tower rating is not equivalent to the onboard pump's demonstrated flow.

- **Hale TPM** (Total Pressure Master), `1000086990.jpg`, handwheel and amber `VALVE OPEN` lamp. Hale manuals describe PMD control, QG internal suction bypass and PG30 external dump, but component configuration must be verified on PLT-11. Steady amber usually indicates internal bypass; flashing indicates additional external valve on applicable TPM designs.
- **Class 1 FLOWMINDER**, `1000086991.jpg`: current flow display and totalization, NOT an RPM/pressure governor. Linked Class 1 digital flowmeter document is related product-family information, not proven exact installed revision.

This catalog information is retained for future integrations, but **do not spend ladder-illustration time building pump/hydraulic physics**.

Machine data: `data/plt11_pump_rating_points.csv`.

## 7. Chassis (Simon-Duplex) and vehicle ratings

Sources: `photos/chassis/1000089051.jpg`, `1000089058.jpg`, `1000089029.jpg`, `1000089014.jpg` plus adjacent views.

| Field | Value / status |
|---|---|
| Chassis maker / address | **Simon-Duplex Inc.** — 120 Deeds Drive, Dover, OH 44622 |
| Model year | **1995, high confidence**; confirm true VIN/title |
| Model no. | not read conclusively; appears to end `-95` |
| VIN | **probable `1S91F74F6S1020008`**; passes check-digit algorithm, but **not yet physically confirmed character-by-character** |
| GVWR | **60,000 lb** (~27,216 kg) |
| GAWR front | **20,000 lb** (~9,072 kg) |
| GAWR rear group | **40,000 lb** (~18,144 kg) |
| Intermediate GAWR (1)/(2), GCWR | Blank or not specified on plate |
| Front tires, OEM plate | **425/65R22.5, 18 PLY** |
| Rear tires, OEM plate | **11R22.5, 16 PLY** |

Weight ratings are allowable **chassis road ratings**, not actual empty mass, crane/tip-over calculations or outrigger reaction forces. Do not infer center of gravity or torque-box dimensions from GVWR/axle ratings.

## 8. Engine identification — major unresolved contradiction

Original Simon-Duplex plate appears to say:

| Field | Original plate reading |
|---|---|
| Cylinders | 8 |
| Bore | 4.84 in |
| Stroke | 5.0 in |
| Displacement | 736 cu in (12.06 L) |
| Engine serial *on chassis plate* | probable `08VA304223` |
| Horsepower SAE | `?75.0` partly worn: **UNKNOWN** |

**Do not assert a definitive installed engine model.** Eight cylinders plus 4.84 × 5.0 in / 736 cu in match Detroit Diesel **8V92** nominal geometry. But the apparent `08VA` serial prefix is associated with **8V71**, while 8V92 generally uses `08VF`. Engine replacement, plate/transcription mismatch or worn characters may explain it. Verify at engine block itself, with model/data plate and service records. The VIN and engine-serial text are separate identifiers. Do not fabricate horsepower or turbocharger configuration.

## 9. Original chassis fluid-capacity plate (historical, NOT current service orders)

Upper Simon-Duplex plate `1000089044.jpg` (and other angles):

| Service item | On-plate capacity (US qt) | Original type marking | Reading status |
|---|---:|---|---|
| Engine oil | 28 | `15W40` | Clear |
| Engine coolant | 54 | `1/2 EG` | Wording likely half ethylene glycol; interpretation pending |
| Chassis transmission | 30 | `15W40` | Clear plate value, not necessarily current recommendation |
| Power steering | 6 | `15W40` | Clear plate value |
| Front axle | 19 | `85W140?` | Type grade needs verification |
| Rear axle | 17 | `85W140?` | Type grade needs verification |
| Rear-rear axle | 16 | `85W140?` | Type grade needs verification |
| Transfer case / power divider | — | — | Plate field blank |
| Pump transmission lubrication | — | — | Plate field blank |
| Pump primer fluid | — | — | Plate field blank |

Original fluid types may be superseded by component changes, rebuilt equipment or updated OEM guidance. Do not issue maintenance instructions from the 1995 plate alone. Aerial lifting hydraulics, power steering fluid and fire-water hydraulics are different circuits.

Machine data: `data/plt11_chassis_engine_specs.json`, `data/plt11_chassis_original_fluid_capacities.csv`.

## 10. Online source registry — research leads, with transfer restrictions

The full machine-readable source inventory is `data/source_manifest.json`. Direct hyperlinks are listed here for repo-agent scraping / later retrieval. **No original proprietary HT3S-85 operator manual has been obtained.** Do not claim linked PDFs are the HT3S-85 manual.

| ID | Source and link | Classification; allowed inference |
|---|---|---|
| S01 | [Hale TPM Installation & Operation, PDF](https://www.montgomerycountymd.gov/mcfrs-psta/Resources/Files/Driver/20150319/DT_KnowledgeBase/ManufacturerLinks/Hale/TPM_System_Installation_and_Operation_Manual.pdf) | `INSTALLED_COMPONENT_FAMILY`; search-indexed but direct automated fetch can be blocked; TPM theory, not installed plumbing |
| S02 | [Class 1 Flowminder/Digital Flowmeter PDF](https://media.idexcorp.com/m/0c7307cd4c72ae84/original/SSD-Flow-Minder-Manual.pdf) | `INSTALLED_COMPONENT_FAMILY`; verified reachable (Oct 2026), 9-page standard `C1-102046-A`; installed revision unverified |
| S03 | [Original LTI HT3S85/MZ100 sales brochure listing](https://www.ebay.com/itm/313289982158) | `EXACT_MODEL_BROCHURE_LISTING` only; **not the brochure contents** |
| S04 | [1985 Spartan/HT3S-85 Purple Wave auction](https://www.purplewave.com/auction/250429/item/EG6288/1985-Spartan-RS20-3064-Trucks-Fire_Truck_or_Emergency_Vehicle-Kansas) | `EXACT_MODEL_OTHER_UNIT`; says 4 stabilizers / 800 lb capacity, **not evidence of PLT-11 actual dimensions or 750-lb chart revision** |
| S05 | [Spartan ER Parts & Support](https://spartaner.com/parts-and-support/) | `OEM_CONTACT`; site may restrict automation; ask for historical HT3S-85 build/assembly drawings, serial-based documents |
| S06 | [San Francisco FD Truck & Ladder Manual](https://manualzilla.com/doc/5739356/truck-and-ladder-manual) | `RELATED_ONLY`, includes Simon-LTI operating considerations; different vehicles/SOPs |
| S07 | [2003 American LaFrance/LTI 93-ft manual](https://device.report/m/111b3ebf0ad1e61b81a29bb1b1b34c43f87e2ae2660862a3c044d94e9bedfc00) | `RELATED_ONLY`, different design; never copy geometry or limits |
| S08 | [Fire Engineering other 85-ft LTI truck](https://www.fireengineering.com/fire-apparatus/apparatus-deliveries-286/) | `RELATED_ONLY`; may mention 4-inch waterway on *other truck*, not PLT-11 |
| S09 | [Spartan ER current aerial products](https://spartaner.com/aerial-ladders/) | `RELATED_ONLY`, modern models |
| S10 | [Modern 75–110 ft LT ladder manual, PDF](https://spartaner.s3.amazonaws.com/wp-content/uploads/2024/02/LT-RML-ST-75-110-2401-01-01.pdf) | `RELATED_ONLY`; not HT3S-85, accessibility/unverified |
| S11 | [Spartan ER brand history](https://spartaner.com/about-us/) | `RELATED_ONLY` |
| S12 | [1997 Simon-Duplex 85-ft tower photographs (different truck)](https://www.usedfiretrucks.firetrucksunlimited.com/AvailableTruckFTU/17834/1997-Simon-Duplex-85%27-Tower) | `RELATED_ONLY`; silhouette inspiration only, **not unit-specific measurements** |

**Further OEM leads:** Request HT3S-85 operator, parts and maintenance manuals, original aerial build sheet, factory stabilizer arrangement, pivot/turntable/torque-box schematics, monitor/platform dimensions, load-chart revision notes, and aerial serial lookup from the current successor/manufacturer. The historical LTI plant is in Ephrata, Pennsylvania. Existence/availability of older OEM archives is not confirmed.

External engine serial background (for verification only):

- https://www.pcidiesel.com/literature/detroit_diesel/v92_model_chart.htm
- https://www.prodieselparts.com/detroit-diesel-engine-serial-number-and-model-number/
- https://barringtondieselclub.co.za/detroit/general/detroit-diesel-serial-numbers-from-1972-1993.pdf

## 11. Photo evidence index (17 original files)

All source photos are included, unmodified. `data/evidence_index.csv` ties files to claims.

**Aerial/pump group** (`photos/`):

- `1000086992.jpg`: full HT3S-85 aerial reach/load/operating/safety chart; separate worn aerial serial tag.
- `1000086993.jpg`: detailed working envelope and annotated maximum reach/height.
- `1000086994.jpg`: full ladder/water-tower load table, water-tower/nozzle rated-capacity notes.
- `1000086987.jpg`, `1000086988.jpg`, `1000086989.jpg`: Simon-LTI single-stage pump performance plate, multiple glare/angle variants.
- `1000086990.jpg`: Hale TPM handwheel and indicator light.
- `1000086991.jpg`: Class 1 Flowminder and nearby panel gauges.

**Chassis/engine group** (`photos/chassis/`):

- `1000089051.jpg`: both Simon-Duplex chassis and fluid plates in situ.
- `1000089055.jpg`, `1000089044.jpg`: original fluid/capacity/grade table.
- `1000089058.jpg`, `1000089048.jpg`, `1000089036.jpg`, `1000089014.jpg`: chassis model/VIN/engine cylinder/bore/displacement and tire markings from differing angles.
- `1000089029.jpg`, `1000089021.jpg`: vehicle weight ratings and engine details.

**Image adequacy:** Good enough for manufacturer-plate transcription in most cases; NOT enough for engineering-grade physical dimensions or a proportional front/side/top three-view. The *raw photos are essential* because some stamps/serials remain dubious and load-chart rows have an apparent conflict. An edited photograph/crop should never be the sole evidence. Preserve original EXIF when available.

## 12. What the fd.app agent should produce (NOT a fresh research project)

1. Read this `README.md`, import original images, CSV/JSON and evidence index. Avoid re-transcribing fields already extracted unless checking a flagged ambiguity.
2. Keep **one PLT-11 record** and distinct *chassis / aerial / pump controls / engine / plate* components; don't overwrite current repo models or create duplicates without inspecting repo conventions.
3. Create/refresh catalog/wiki drafts with **source/photo citations per field**, original-unit values, `confirmed / derived / reference_other_unit / disputed / unknown` labels, date and verification flags.
4. In the ladder sim, reuse the **existing engine/rendering**, do **not** replace it. Fix wrong drawing proportions using **verified unit images or measurements**; preserve documented angular/travel envelope independently from visual placeholders; mark geometries as `approximate`, not exact.
5. For outriggers, implement the **known deployment requirement** but don't invent deployed spans, jack dimensions, or torque-box coordinates. The auction's four-stabilizer count is a useful visual lead, **not** verified PLT-11 geometry.
6. Preserve full load chart + source photo. If an actual exercise depends on chart conflicts, surface `verification_needed` rather than a green clearance indicator.
7. **Do not implement pump hydraulics now**. Preserve four pump duty points, TPM and Flowminder for later catalog/reference only.
8. Audit URLs, retrieve what is lawfully accessible, create a scraping log; distinguish fetched original texts from listings and excerpts; respect publisher copyright.
9. Return `files changed`, `data newly extracted`, `conflicts outstanding`, `external sources reached/failed`, and **very specific next photos/measurements** to correct the drawing.

### Concise remaining critical unknowns

**Aerial drawing:** stowed length, true section lengths and overlap, truss width/height, basket dimensions, pivot offset, turntable pedestal, torque-box geometry, number/location/span/size of PLT-11 outriggers, chassis frame and wheelbase.  
**Aerial procedures:** actual aerial serial and OEM manual; load-chart wet-platform inconsistency, interlock/control details, inspection status.  
**Pump/waterway:** original pump OEM/model, monitor/nozzle, pipe diameter, physical piping & losses, exact Flowminder revision, separate pressure governor identification.  
**Vehicle:** physical VIN read, chassis-model prefix, engine-block serial and true model, horsepower and transmission data plate.

**Concluding assessment:** Catalog/wiki: strong first draft possible. Training-limit prototype: reasonably constrained. **Geometrically faithful PLT-11 artwork and stabilizer/torque-box assembly: insufficient measurements and photographs**, despite known general envelope. Pump hydraulics: stored for a future module, not the current drawing task.
