# PLT-11 — Chassis, engine, weight and service plates: research addendum

**Added:** 2026-10-23  
**Applies to:** PLT-11, Cosmopolita 11, Lima, Peru.  
**Companion:** `PLT11_research_handoff.md` (existing aerial/pump documentation).  
**Direct evidence:** nine newly supplied original photos under `photos/chassis/`.  
**IMPORTANT:** Chassis manufacturer **Simon-Duplex** is distinct from the aerial manufacturer **Simon-LTI**. These are two parts of the *same apparatus*.

## 1. Identity and manufacturer plate

- Chassis manufacturer: **SIMON-DUPLEX INC.**, 120 Deeds Drive, Dover, Ohio 44622 (as printed on the original plate).
- Model year: **1995**, consistent with the previously photographed compliance decal and the probable VIN's 10th-character `S`.
- Chassis model: *not fully readable*. It appears to end `-95`, with a central `300`-like portion. Do not invent the rest.
- **Probable VIN:** `1S91F74F6S1020008` (**unverified character-for-character; inspect vehicle VIN at dashboard/frame/title**). This 17-character transcription passes the standard North American VIN check-digit computation: position 9 is `6` and independently computed check digit is `6`. The year character (position 10) is `S`, corresponding to 1995 in this context. **A passing check digit is supportive evidence, not proof every character was read correctly.**
- This is not the aerial serial and not the Simon-LTI pump-performance-plate `SERIAL # 741218`.

## 2. Chassis rating plate (direct transcription)

| Field | Value | Confidence |
|---|---:|---|
| GVWR (gross vehicle weight rating) | 60,000 lb (27,216 kg) | High |
| GAWR FRONT | 20,000 lb (9,072 kg) | High |
| GAWR REAR | 40,000 lb (18,144 kg) | High; appears to describe rear axle group |
| GAWR INTER.(1), INTER.(2) | blank | High |
| GCWR | blank/unmarked | High |
| Front tires | 425/65R22.5, 18 PLY | High |
| Rear tires | 11R22.5, 16 PLY | High |

CAUTION: GVWR/GAWR are **allowable ratings**, not the vehicle's measured/actual curb weight, operational weight, or outrigger-ground-reaction limits. Do not use these to invent center of gravity or aerial stability data. Tire sizes are as **originally specified**; installed tires may differ.

## 3. Engine identification plate (direct, with major inconsistency)

| Field | Plate reading | Notes |
|---|---|---|
| Cylinders | 8 | Clear |
| Bore | 4.84 in | Clear |
| Stroke | 5.0 in | Clear |
| Displacement | 736 cu in (~12.06 L) | Clear |
| Engine serial | `08VA304223` | Looks very clearly `08VA` on Simon-Duplex chassis plate; inspect original engine block |
| HP SAE | ~~75.0 is partially visible | **Missing/obscured leading digit; horsepower is UNKNOWN** |

**CRITICAL ENGINE ID CONTRADICTION:** 8 cylinders × 4.84 in bore × 5.0 in stroke gives ~736 cubic inches, and corresponds to **Detroit Diesel 8V92 (Series 92)** geometry. But the serial prefix visible as **08VA** corresponds to **Detroit Diesel 8V71 (Series 71)**; authentic 8V92 serials normally start **08VF**. Do not infer turbocharger/aftercooler type, engine calibration, 475 HP, 500 HP, or even installed engine identity solely from this chassis plate. Possible reasons include a transcription/stamping error, incorrectly labelled plate, later engine swap, or misread weathered stamp. **Physically confirm engine-block serial and model** and look for valve-cover labels before acquiring parts or completing a performance model.

Detroit Diesel references:
- 92 Series service manual/specs, including 8V92 geometry: https://sd95d2cbd361a0b8d.jimcontent.com/download/version/1609933533/module/15091486722/name/Detroit%20Diesel%20Engine%20Series-%2092%20Service%20Manual.pdf
- Model chart / normal 8V92 prefix `08VF`: https://www.pcidiesel.com/literature/detroit_diesel/v92_model_chart.htm
- 8V71 prefix `08VA` and 8V92 `08VF`: https://www.prodieselparts.com/detroit-diesel-engine-serial-number-and-model-number/
- Detroit Diesel original serial-number guide (1995 revision): https://barringtondieselclub.co.za/detroit/general/detroit-diesel-serial-numbers-from-1972-1993.pdf

## 4. Original chassis fluids capacity plate (US quarts)

| Component | Plate capacity | Plate designation | Status |
|---|---:|---|---|
| Engine oil | **28 qt** (~26.5 L) | 15W40 | Direct reading |
| Engine coolant | **54 qt** (~51.1 L) | `1/2 EG` (apparently half ethylene glycol; verify) | Direct reading with interpretation caveat |
| Chassis transmission fluid | **30 qt** (~28.4 L) | 15W40 as stamped | Direct reading; DO NOT treat as current servicing recommendation |
| Power steering fluid | **6 qt** (~5.7 L) | 15W40 as stamped | Direct reading |
| Front axle | **19 qt** (~18.0 L) | appears `85W140` | Grade must be verified |
| Rear axle | **17 qt** (~16.1 L) | appears `85W140` | Grade must be verified |
| Rear/rear axle | **16 qt** (~15.1 L) | appears `85W140` | Grade must be verified |
| Transfer case / power divider | No legible stamped value | Unknown | Pending |
| Pump transmission lubrication | No legible stamped value | Unknown | Pending |
| Pump primer fluid | No legible stamped value | Unknown | Pending |

US qt = 0.946352946 L; numbers shown rounded. Original fluid recommendations may have been superseded by component service bulletins, rebuilds, and changes to installed transmissions. **Do not instruct technicians to refill from this plate alone** without checking dipstick procedure and contemporary OEM maintenance requirements.

## 5. Why this matters for the catalog and simulators

1. **Catalog:** document separate makes/IDs: 1995 Simon-Duplex chassis, Simon-LTI HT3S-85 aerial, Simon-LTI pump-performance plate; use separate `chassis_vin`, `chassis_model`, `engine_serial_stamped`, `aerial_serial_unverified`, `pump_plate_serial_scope_unknown` fields. Avoid calling the whole vehicle merely an 'LTI'.
2. **Aerial operations simulation:** 60,000-lb GVWR and 20k/40k axle ratings are *catalog/rating context*, **not** sufficient to model outrigger reaction, center of gravity or permitted slope. Preserve OEM aerial load-chart limits.
3. **Fire-water hydraulics simulation:** manufacturer engine plate plus pump duty points suggest engine performance context; **no usable engine torque map or turbo configuration has been established**. Do not use SAE horsepower yet.
4. **Aerial actuation hydraulics:** service-fluid label for chassis power steering is NOT the aerial hydraulic oil reservoir rating; do not conflate systems.
5. **Maintenance:** keep original capacity/grade text with `status=historical_plate_spec`, distinct from current approved maintenance values.

## 6. Photo evidence index (new uploads)

| Filename | Content |
|---|---|
| `1000089051.jpg` | Both plates in situ, fluids and chassis/model/weight/engine |
| `1000089055.jpg` | Close-up of fluid types and capacities, upper plate |
| `1000089058.jpg` | Chassis VIN/model/tire/engine stamp close-up |
| `1000089048.jpg` | Additional angled chassis identity plate close-up |
| `1000089044.jpg` | Detailed fluid specification plate |
| `1000089036.jpg` | Chassis identity and engine close-up |
| `1000089029.jpg` | Weight ratings close-up |
| `1000089021.jpg` | Weight ratings and partial engine close-up |
| `1000089014.jpg` | Chassis VIN and engine close-up |

File SHA256 hashes in `data/chassis_photos_sha256.json`.

## 7. Specific requests for the next station visit

- Photograph the **engine block's stamped serial/model**, ideally at both possible 8V-series serial locations. This is the highest-priority discrepancy.
- Photograph the **vehicle VIN** on the driver-side dashboard/door/frame and any registration/title/vehicle-data plates. Cross-check all 17 characters.
- Photograph an **engine data/option plate** or the valve-cover label including exact Series 92/71 version, aspiration, horsepower.
- Photograph the **chassis model field** with oblique lighting to expose the worn leading characters.
- Photograph the **transmission data plate** and any service stickers; avoid assuming its current oil spec from the 1995 Simon-Duplex capacity plate.

## 8. New structured datasets

- `data/plt11_chassis_engine_specs.json` contains records with explicit verification status and per-field source photograph references.
- `data/plt11_chassis_original_fluid_capacities.csv` contains original fluid entries with uncertainty/status columns.

**Repository agent ingestion requirements:** Include these new photos and the addendum. Mark tentative values as tentative, retain original imperial readings, give source photo filenames for each field, and update the earlier handoff's unsupported assumption that engine model/serial is unknown rather than merging conflicting values. The source plate does not establish original engine still installed.
