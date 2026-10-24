# PLT-11 (Cosmopolita 11) — technical research and repo ingestion handoff

**Prepared:** 2026-10-22  
**Purpose:** Source-backed equipment catalog, BookStack/wiki article, 2D aerial-operations trainer, and integration with a firefighting water-hydraulics simulator.  
**Apparatus identity:** PLT-11, aerial ladder tower at Cía. de Bomberos Cosmopolita N.º 11, Lima, Peru.  
**Aerial:** Simon-LTI / Ladder Towers Inc. **HT3S-85**; nominal 85 ft.  
**Evidence priority:** PLT-11's photographed OEM plates > exact-model manufacturer documentation > component manuals matched to installed components > other HT3S-85 apparatus > other LTI aerials > engineering assumptions.

> **SAFETY AND SOURCE-INTEGRITY GATE:** All load/operating limits below are transcribed from photographed plates and may require verification against the apparatus-specific OEM manual, inspection records, and modifications. They are *training data*, not clearance to operate or overload real equipment. Keep uncertainty in the published wiki and disable any 'safe to operate' certification UI. Do not invent manufacturer data or silently merge specifications from other trucks.

## 1. Original on-apparatus photographic sources (highest priority)

All are included in `photos/` in the accompanying bundle. These were supplied by the PLT-11 user and are more authoritative for this specific unit than generic online listings.

| Local filename | Evidence |
|---|---|
| `1000086992.jpg` | Full Simon-LTI HT3S-85 aerial operating/load chart; top-left stamped aerial serial obscured |
| `1000086993.jpg` | Close-up of aerial reach envelope and platform height/reach annotations |
| `1000086994.jpg` | Readable detailed load table; water-tower nozzle orientation/rated-flow notes |
| `1000086988.jpg` | Simon-LTI **Fire Apparatus** pump-performance/rating plate, including four duty points and `SERIAL # 741218` |
| `1000086987.jpg` | Alternate image of same rating plate |
| `1000086989.jpg` | Alternate image of same rating plate |
| `1000086990.jpg` | **Hale TPM** Total Pressure Master handwheel, red pressure setting indicator, amber `VALVE OPEN` lamp |
| `1000086991.jpg` | **Class 1 FLOWMINDER** flow instrument (GPM), nearby pump gauges/controls |

**Identity / serial caution:** The clearly legible `741218` is on a **Simon-LTI Fire Apparatus** plate. Do **not** label it definitively as a Hale pump serial, an aerial serial, or VIN. The aerial chart has its own difficult-to-read stamped `SERIAL NO.` tag; could potentially match but is **unconfirmed**. Obtain a sharply lit close-up. The manufacturer's historical address on the plate is **64 Cocalico Creek Rd., Ephrata, PA 17522**; current successor uses **68 Cocalico Creek Rd.** Do not confuse these.

## 2. High-confidence PLT-11 aerial specs (plate)

| Field | Value | Confidence / comments |
|---|---|---|
| Aerial manufacturer | Simon-LTI (Ladder Towers Inc. heritage) | Direct plate |
| Aerial model | **HT3S-85 LADDER TOWER** | Direct plate |
| Nominal aerial class | **85 ft** (25.91 m) | Model designation + user recollection + exact-model references |
| Maximum *platform elevation* | **86.4 ft** (26.33 m) | Direct reach diagram; not identical to 85-ft nominal designation |
| Maximum *horizontal platform reach* | **80.7 ft** (24.60 m) | Direct reach diagram |
| Elevation (diagram) | **−4° to +75°** | Direct diagram; verify how negative angles can actually be attained with specific setup |
| Heel-pin height | **avg. 9.6 ft** (2.93 m) | Direct diagram; approximate |
| Intermediate diagram angles | 0°, 21°, 31°, 41°, 51°, 61°, 75° | Shown on diagram; load bands use -4–20°,21–30°,31–40°,41–50°,51–60°,61–75° |
| Section names | BASE / MID / FLY and PLATFORM | Direct load chart; *not* measured physical section lengths |
| Dry platform rating | **750 lb** (~340 kg) | Top plate callout and load table |
| With flowing water | Depends on angle/mode; detailed chart values 250 or 500 lb for platform | **Unresolved contradiction:** large callout appears to say 500 lb plus full water-tower rating at *any* length/elevation; chart gives 250 lb below 51°. Resolve against OEM manual; don't hide discrepancy |
| Outrigger position for rated capacities | Horizontal outrigger beams at **maximum extension**, with weight relieved from chassis springs | Direct load chart note |
| Aerial tip condition underlying chart | Tip **unsupported** (cantilever) | Direct chart note |
| Electrical insulation | **NOT INSULATED** | Direct safety warning |

**Reach diagram landmarks:** It shows representative reach/higher elevation marks approximately 23 ft, 51.9 ft, 69.6 ft, 80.7 ft horizontally and 86.4 ft maximum vertically. Treat their geometry as diagram annotations requiring digitization rather than assuming any one number represents a physical ladder-section length.

### 2a. Stability/grade requirements on plate

- Rating based in part on full horizontal outrigger extension, weight relieved from chassis springs, adequate supporting surface, wind/conditions, and operator assessment.
- On **grades up to 6%** (~3.5°), tabulated capacities allowed subject to other conditions.
- On **grades above 6% up to 14%** (~8.0°), **reduce rated capacities by 50%**.
- Above 14%, **the plate does not provide an allowed rating**. Do not infer permission or extrapolate.
- Further reduce capacities as required for snow/ice accumulation and subtract additional equipment mass from rated load.
- Manufacturer states aerial loading ratings were determined with ladder tip unsupported.
- **Grade in percent is not ladder elevation angle in degrees.**

### 2b. Detailed on-plate rated-load chart — pounds

Cell syntax **`ladder_operation_lb / water_tower_operation_lb`**, inferred from the chart's diagonal two-mode legend. The load charts refer to LOAD LOCATIONS (Base/Mid/Fly/Platform); DO NOT assume all section ratings may be summed or used simultaneously. A `0` means zero additional load rating in that chart cell, not necessarily that ladder movement/positioning is impossible.

| Load location | −4 to 20° | 21–30° | 31–40° | 41–50° | 51–60° | 61–75° |
|---|---:|---:|---:|---:|---:|---:|
| BASE | 0/0 | 250/0 | 250/0 | 500/250 | 500/250 | 750/500 |
| MID | 0/0 | 0/0 | 250/0 | 250/0 | 500/250 | 500/500 |
| FLY | 0/0 | 0/0 | 0/0 | 250/0 | 500/500 | 500/500 |
| PLATFORM | 750/250 | 750/250 | 750/250 | 750/250 | 750/500 | 750/500 |

A normalized machine-readable version is in `data/plt11_load_chart.csv` with angle bands, section, mode and pounds. Preserve the **original chart image** as the source of truth. Verify cell values by independent manual transcription prior to any safety-related training release.

### 2c. Platform monitor / water-tower operating notes on the plate

The manufacturer's notes establish these **conditional aerial water-tower flow capabilities**:

- Nozzle **90° to ladder's longitudinal centerline**: **1,500 US GPM** (~5,678 L/min).
- Nozzle **parallel to ladder centerline**, directed within an arc from **straight forward to straight down**: **2,000 US GPM** (~7,571 L/min).
- When **ladder elevation is below 30°**, nozzle elevation must remain **horizontal or below horizontal** (no upward discharge relative to true horizontal).
- Changing the nozzle orientation changes the direction of reaction loads on the structure. A sideways stream loads the aerial laterally; an upward stream can create a downward reaction component. These physical explanations are **engineering interpretations**, not manufacturer-calculated structural forces from the plate.
- **Do not assume arbitrary angles between 0° and 90° permit linear interpolation between 2,000 and 1,500 GPM.** Do not assume the nozzle can rotate mechanically into every direction; actual stops/controls remain unknown.
- The 2,000 GPM figure is a **water-tower rating**, not the onboard pump's demonstrated output at a stated discharge pressure.
- Dry or wet loading capacity is still limited by the applicable load chart; nozzle direction/flow don't override its requirements.

**Known discrepancy to resolve:** The large platform callout says (paraphrased) **750 lb in platform dry; 500 lb plus full water tower rating at any length/elevation**, while the detailed table shows platform wet load **250 lb** through 50°, **500 lb** at 51–75°. Hold the more permissive interpretation until the exact revision and manufacturer explanation are confirmed; visually mark the chart as 'manufacturer verification pending'.

## 3. Onboard pump and controls — observed PLT-11

**Source:** Simon-LTI 'FIRE APPARATUS' pump rating plate at `photos/1000086988.jpg`. All configurations in table say **SINGLE STAGE**.

| Test flow (US GPM) | Discharge PSI | Plate RPM | Pump mode |
|---:|---:|---:|---|
| 1504 | 150 | 1660 | SINGLE STAGE |
| 1504 | 165 | 1740 | SINGLE STAGE |
| 1051 | 200 | 1840 | SINGLE STAGE |
| 750 | 250 | 2010 | SINGLE STAGE |

Other rating plate items:
- `SERIAL #`: **741218** (SIMON-LTI Fire Apparatus plate, serial scope unverified).
- `ENGINE GOV. SPEED`: **2275 RPM**. This denotes governed engine speed/limit on the plate, **not by itself proof of an electronic pressure governor**.
- `ENG/PUMP RATIO`: **1:1.94** (as stamped).
- `RPM` values are **likely engine operating RPM at each pump test point**, not pump-shaft RPM; verify with documentation, gearing convention and tachometer. Do not treat them as exact shaft RPM without confirmation.
- These **four duty/test points are not a full pump performance curve**, and provide no complete suction/flow/pressure operating envelope.

### 3a. Hale Total Pressure Master (TPM) — visible control

Photo `1000086990.jpg`: large silver TPM handwheel, indicator, amber `VALVE OPEN` light.

Manufacturer component manual below explains the *general* system:
- **PMD**: operator panel control sets relief pressure.
- **QG**: internal relief valve bypasses some discharge water to pump suction.
- **PG30**: additional external relief/dump valve can discharge water to atmosphere under larger pressure increases, especially with positive suction pressure.
- **SV**: sensing valve.
- On typical Hale TPM, **solid amber = QG relief active**; **flashing amber = PG30 additionally active**.
- A **mechanical relief system is not an engine-speed governor**. They can operate together, but presence of the TPM does **not establish** that PLT-11 also has a DDEC or other electronic engine *pressure* governor. Inspect entire pump panel and engine controls.
- Manual includes example procedures for TPM combined with a DDEC pressure governor; treat these as manual-specific reference, not a certified PLT-11-specific SOP until controls are identified.
- Generic Hale TPM manual says red panel indication is only approximate, not a precise pressure sensor.

Hale TPM manual: `https://www.montgomerycountymd.gov/mcfrs-psta/Resources/Files/Driver/20150319/DT_KnowledgeBase/ManufacturerLinks/Hale/TPM_System_Installation_and_Operation_Manual.pdf` — verified accessible PDF, 8 pp, Hale manual part **101-0850-08-0**. See especially pp. 6–7 for pressure relief and combination with DDEC pressure governor; diagram and plumbing in preceding pages.

### 3b. Class 1 FLOWMINDER — visible control

Photo `1000086991.jpg`: circular Class 1 FLOWMINDER instrument marked **GALLONS PER MINUTE**, with **SET** and **TOTAL** buttons. Nearby gauges and Simon-LTI bezels.

Class 1 digital flowmeter engineering standard `C1-102046-A` documents a *related* digital Flowminder system:
- Paddlewheel velocity measurement in discharge piping; calibration depends on pipe size/sensor siting.
- Instantaneous flow and totalizer functionality.
- Recommend adequate straight pipe runs to avoid turbulence effects.
- **Important**: the manual's illustrated display/bezel is **not visually identical** to PLT-11's circular instrument. Do not assume exact software, wiring, calibration procedure or button functions of PLT-11 from this manual without model revision confirmation. Do not assume it measures the sum of all pump outputs; determine which branch the sensor is installed on.

Manual: `https://media.idexcorp.com/m/0c7307cd4c72ae84/original/SSD-Flow-Minder-Manual.pdf` — verified accessible PDF, 9 pp, general Class 1 digital flowmeter.

### 3c. Other controls / instrumentation still to identify

- Exact pump manufacturer/model (the performance plate is **Simon-LTI**, **not** itself a Hale pump OEM model plate; Hale branding is confirmed for TPM). **Do not assume Hale pump make/model solely from TPM branding.**
- Installed throttle / mechanical engine governor / electronic engine pressure governor; full control panel photo needed.
- Pressure gauge design/ranges, intake and discharge channel assignment.
- Discharge/intake layout and valves, tank-to-pump, tank fill, crosslay/LDH fittings and aerial supply plumbing.
- Pump test documentation including test inlet conditions and pump test dates.
- Aerial waterway ID/length, swivel joint characteristics, fittings, valve losses, monitor/nozzle make/model, pressure rating, nozzle setting/flow curve.
- Exact flowmeter sensor location (aerial discharge vs another branch).

## 4. External source inventory — URL manifest for scraping

**Tagging:** `DIRECT_PLT11` = unit photos (not public); `EXACT_MODEL` = HT3S-85 but other apparatus; `COMPONENT_MANUAL` = actual observed brand/component family but possibly different revision; `RELATED_ONLY` = similar LTI/aerial document not transferable; `OEM_CONTACT` = current support contact; `BROCHURE_LISTING` = evidence of physical brochure but no public tech contents.

### Highest priority online sources

1. **S01 — Hale TPM Installation & Operation Manual, 8 pp.** `COMPONENT_MANUAL`  
   `https://www.montgomerycountymd.gov/mcfrs-psta/Resources/Files/Driver/20150319/DT_KnowledgeBase/ManufacturerLinks/Hale/TPM_System_Installation_and_Operation_Manual.pdf`  
   Verified readable. Extract PMD/QG/PG30/SV topology, modes and indicator semantics, NOT PLT-11 specific valve sizes or calibration.

2. **S02 — Class 1 Digital Flowmeter / Flowminder, 9 pp.** `COMPONENT_MANUAL`  
   `https://media.idexcorp.com/m/0c7307cd4c72ae84/original/SSD-Flow-Minder-Manual.pdf`  
   Verified readable. Extract sensor/calibration principles, but note visually different model/revision.

3. **S03 — Original LTI HT3S85 (85 ft) / MZ100 (100 ft) physical sales brochure listing.** `BROCHURE_LISTING`, exact model in title  
   `https://www.ebay.com/itm/313289982158`  
   Listing exists; **brochure contents not online in full**. Do not hallucinate brochure specifications. Seller/photo/scans or owner acquisition would be required.

4. **S04 — Purple Wave auction, 1985 Spartan RS20-3064 equipped with HT3S-85.** `EXACT_MODEL`  
   `https://www.purplewave.com/auction/250429/item/EG6288/1985-Spartan-RS20-3064-Trucks-Fire_Truck_or_Emergency_Vehicle-Kansas`  
   Other unit (not PLT-11). Listing: nominal 85 ft, 4 stabilizers, elevated deck gun, claimed 800-lb lift capacity, 1,500-GPM pump, 150-gal tank. **NEVER transfer chassis/engine/tank/capacity details to PLT-11.** The claimed 800 lb conflicts with PLT-11 dry platform 750 lb.

5. **S05 — Spartan ER, official Parts & Support.** `OEM_CONTACT`  
   `https://spartaner.com/parts-and-support/`  
   Current successor/brand holder support; Ephrata facility, 68 Cocalico Creek Rd., Ephrata, PA 17522. Technical support contacts listed: Dave Evans +1 717-588-2404; Ken Lund +1 717-588-2390. Names/numbers can change; reverify at outreach. Manufacturer might possess historic files but archive possession is **not** established.

### Secondary and context sources (do not turn into PLT-11 specs)

6. **S06 — SFFD Truck & Ladder Manual, Appendix B 'Safety Precautions When Operating Simon-LTI Aerial Ladders'.** `RELATED_ONLY`  
   `https://manualzilla.com/doc/5739356/truck-and-ladder-manual`  
   Useful for vocabulary, operator training, cantilever/unsupported tip, interlocks/outsriggers; departmental equipment/procedures may differ from PLT-11. In particular, do not assume its leveling indicator color bands or its vehicle-specific outrigger procedures apply to PLT-11.

7. **S07 — Bend Fire & Rescue, 2003 American LaFrance/LTI 93-ft platform Operations Manual.** `RELATED_ONLY`  
   `https://device.report/m/111b3ebf0ad1e61b81a29bb1b1b34c43f87e2ae2660862a3c044d94e9bedfc00`  
   60 pp, for a **different length and later design**. Good training/architecture reference, not transferable limits.

8. **S08 — Fire Engineering 'Apparatus Deliveries' (1986), Hawthorne NJ LTI 85-ft platform.** `RELATED_ONLY`  
   `https://www.fireengineering.com/fire-apparatus/apparatus-deliveries-286/`  
   Describes **another** 85-ft LTI platform with 4-inch waterway. This **does not establish PLT-11's waterway diameter**.

9. **S09 — Current Spartan ER aerial ladder product overview.** `RELATED_ONLY`  
   `https://spartaner.com/aerial-ladders/`  
   Gives current product family only; do not use modern specifications for HT3S-85.

10. **S10 — 2024/modern Ladder Tower 75–110-ft rear-mount operations/service PDF.** `RELATED_ONLY`  
    `https://spartaner.s3.amazonaws.com/wp-content/uploads/2024/02/LT-RML-ST-75-110-2401-01-01.pdf`  
    File is large and access was not verified in-browser. **Different generation/equipment**. Optional conceptual reference only; not a replacement for original HT3S-85 operator manual.

11. **S11 — Spartan ER company/legacy background.** `RELATED_ONLY`  
    `https://spartaner.com/about-us/`  
    Establishes association with Ladder Tower brand and Ephrata operations, not exact vintage specs.

### Evidence we should still seek

- The **actual HT3S-85 operator/maintenance/manual bundle** and original platform/ladder serial confirmation, hydraulic/electrical drawings, manufacturer certified load chart and nozzle spec.
- Old printed HT3S85 brochure S03, perhaps request full scans if available legally.
- Original factory build sheet by apparatus production serial; any modification/retrofit record.
- Correct Hale pump model plate (if present) and current pump certification/test sheets.
- Platform monitor manufacturer plate & control-panel markings, turntable/ladder/outtrigger photos, waterway routing and components.

## 5. Simulator specification / modeling boundaries

### A. Catalog and BookStack wiki — can ship as a clearly sourced draft

Create `PLT-11 > Especificaciones técnicas`, `Sistema aéreo`, `Capacidades y limitaciones`, `Bombeo / panel de control`, `Torre de agua`, `Seguridad`, and `Referencias / pendientes`. Store raw units and derived metric conversions separately. Show full-load table and original photo together. Include plate provenance, dates of capture (if known), revision and confidence. Mark all ambiguous fields visibly.

### B. Aerial operations 2D trainer — first useful simulation

- Elevation `-4..75°`; deployment, extension, platform height/reach visualization based on digitized **manufacturer reach envelope**, not a fictional rigid 85-ft stick.
- Controls/variables: ladder elevation, extension, rotation (display only until confirmed limits), section load, platform load, operating mode (dry/flowing), truck grade, outriggers full/retracted, nozzle heading and pitch.
- Table-lookup capacities by discrete angle band; **do not interpolate** loads across bands or add section loads together. Grade reduction only in range prescribed on PLT-11 plate.
- Treat uncertain platform wet ratings as `verification_required`. No green 'approved to operate' banner.
- Include conceptual force diagram: water momentum and nozzle reaction; *do not* present uncalibrated forces as the exact HT3S-85 structure.
- Missing before high-fidelity model: actual section lengths, cylinder/link geometry, dynamic movement speeds, controls/interlocks, tilt compensation, total mass/center of gravity, wind limits, outrigger loading criteria.

### C. Fireground hydraulics simulator integration

- Keep **ladder actuation hydraulic-oil circuit** separate from the **firefighting water delivery network**. Aerial movement and water discharge are separate physical models; couple only documented dependencies (engine/PTO etc.).
- Use the 4 observed pump rating points as anchors/reference comparisons only, **not a complete certified interpolated curve**, without additional pump data and test conditions.
- Model water pump → aerial feed pipe → elevation head → swivel/joints → platform monitor → nozzle; Darcy-Weisbach/Hazen-Williams can be used for assumed friction when all dimensions/materials are known, with assumptions clearly marked.
- Elevation head is based on **vertical height difference from pump discharge to monitor**, not nominal 85-ft ladder length. Approx freshwater static conversion ~0.433 psi per vertical foot (for conceptual training), excluding losses.
- Implement generic TPM pressure-relief logic separately from any still-unidentified engine governor; `VALVE OPEN` lamp corresponds to relief events, not simply 'system on'.
- For 1,500 vs 2,000 GPM tower orientation rules, evaluate only documented discrete cases and nozzle elevation restriction; do not infer intermediate ratings, full flow at every pump pressure, or automatic safe orientation.
- Monitor nozzle reaction physically affects structural loading, but use the actual manufacturer limits as the source of authority, not a homemade pass/fail moment threshold.
- Flowminder display is a **measurement**, not a flow source. Exact sensor pipe and display revision still unknown.

## 6. Agent action list (prioritized, concrete)

1. Ingest ALL original `photos/` and this handoff with persistent provenance. Do **not** OCR the already clear Simon-LTI plate from scratch unless confirming a disputed cell; manual transcription is above.
2. Create a source registry with `id,url,title,kind,exact_model_match,unit_match,download_status,revision,date_checked,notes`, preserving `DIRECT_PLT11` vs related-model distinction.
3. Download publicly accessible S01 and S02 manuals, record original URL, page count, SHA256, PDF metadata and page-specific references. Respect website access controls and copyright; do not distribute copyrighted manuals as if open licensed.
4. Retrieve source metadata/pages for S03–S11; do not claim to possess S03's brochure contents or S10's manual if retrieval fails.
5. Generate unit-specific structured data (aerial specs, pump points, table cells, monitor restrictions), each datum with source/photo/page and verification status. Unit conversions should never replace original values.
6. File unresolved verification issues: (a) platform wet rating conflict, (b) aerial serial, (c) real pump make/model vs Simon-LTI rating plate, (d) meaning of RPM test values, (e) installed engine governor, (f) waterway ID/nozzle, (g) correct Class1 Flowminder revision.
7. Generate Spanish-language *draft* catalog/wiki content, but keep normative operator instructions strictly sourced to PLT-11 manufacturer documentation and subject to operator approval.
8. Scaffold Aerial Operations Trainer first; then Hydraulic Integration. Do not fabricate unknown dimensions, flow coefficients, engine/PTO behavior or safety interlocks.
9. Produce a concise artifact inventory: successfully scraped sources, failures, new facts, exact evidence paths, and questions that still require photos or contacting Spartan.

## 7. Source confidence / unresolved concerns to show in UI

- **Confirmed PLT-11 image:** HT3S-85; dimensions/angles; stabilization/grade notes; 1500/2000-GPM orientation notes; pump four rating points; 2275 engine governed speed; 1:1.94 ratio; Hale TPM handwheel; Class 1 FLOWMINDER instrument.
- **High confidence but needs OEM confirmation:** Normalized load chart interpretation, aerial wet platform chart vs large callout, exact operating RPM convention.
- **Externally verified but *other unit*:** 1985 Spartan HT3S-85 data (especially 800 lb; not PLT-11), 1986 85-ft LTI 4-in waterway.
- **General component principles:** Hale TPM manuals and Class1 flowmeter/manual; may differ from installed revisions.
- **Unknown:** Exact aerial serial, chassis/make/year/engine/transmission, pump OEM model, monitor/nozzle make/model, complete plumbing, waterway diameter, valve Cv/losses, waterway maximum working pressure, stabilizer load/foundation requirements, interlocks, precise extension lengths and mechanical limits, official full safety procedures.

**Bottom line:** Enough unit-specific data for a reasonably complete **catalog entry**, a useful **2D aerial training prototype**, and a **preliminary** hydraulic apparatus model; **not** enough to issue real-world operating authorizations or a calibrated hydraulic/structural digital twin.
