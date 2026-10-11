# CGBVP hydraulics manual — numerical reference

**Source:** CGBVP / DIGEFA, *Curso de Hidráulica aplicada a la lucha contra incendios*, August 2019.  
**Purpose:** extraction of simulator-relevant equations, constants, tables and quick rules, with an explicit assessment so manual compatibility values are not mistaken for physical truth.

> Page numbers below are PDF/manual pages (`MP 1-xx`). Values are transcribed from the rendered page where equation layout matters.

| Item | Manual value/rule | Page | Assessment | Recommended simulator treatment |
|---|---|---:|---|---|
| Volumetric flow | `Q = D × S × V`; then for water `Q = S × V` | 18 | **Incorrect/misleading notation.** Density belongs in mass flow `ṁ=ρAv`, not volumetric `Q=Av`. | Core: `Q=Av`; never require density for volumetric flow. |
| Circular-section flow | `Q = 0.785 d² V` | 18 | **Physically sound** with consistent units. | Core relation. |
| Pressure | `P = F/S` | 19 | **Physically sound.** | Core. |
| Approx pressure mnemonic | `1 atm = 1 bar = 1 kg/cm² = 10 mca = 100 kPa` | 19 | **Intentionally rough.** These are not equal. | Training mnemonic only; core uses exact conversions. |
| Atmospheric pressure | 101.3 kPa = 14.7 psi at sea level | 20 | **Reasonable standard reference.** | Use environment/standard atmosphere as appropriate. |
| Laminar threshold | `Re ≤ 2000` | 33 | **Reasonable conventional threshold.** | Reference only; friction solver can calculate regime. |
| Turbulent threshold | `Re ≥ 4000` | 33 | **Reasonable conventional threshold.** | Reference only; 2000–4000 transition should not be omitted in engineering mode. |
| Continuity | `Q1=Q2 => S1v1=S2v2` | 34 | **Physically sound** for steady incompressible single-path flow. | Core conservation, generalized at junctions. |
| Bernoulli as printed | `P1+ρgh1+½ρv1² = P2+gh2+½ρv2²` | 35 | **Printed equation is dimensionally wrong:** right gravitational term lacks `ρ`. | Do not implement as printed. Use correct energy equation. |
| Torricelli | `v=√(2gh)` | 35 | **Sound under stated ideal assumptions.** | Core ideal relation where applicable. |
| Total system loss | `PPT = PF ± PE + PS` | 38 | **Reasonable training decomposition.** | Explanation layer / compatibility. |
| Pump pressure arithmetic | `PB = PP + PF ± PE + PS` | 31 | **Reasonable single-path operator rule.** | Compatibility/explanation; physical core solves network heads. |
| Hose friction | `PF = C (gpm/100)² (ft/100)` | 39, 43 | **Reasonable fire-service approximation.** | Exact in CGBVP mode; physical mode uses calibrated curve or general loss law. |
| Hose C, 1½" | `C=24` | 39–40 | Training coefficient. | CGBVP mode/fallback only. |
| Hose C, 1¾" | `C=15.5` | 39–40 | Training coefficient. | CGBVP mode/fallback only. |
| Hose C, 2½" | `C=2` | 39–41 | Training coefficient. | CGBVP mode/fallback only. |
| Hose C, 3" | `C=0.8` | 39–42 | Training coefficient. | CGBVP mode/fallback only. |
| Hose C, 4" | `C=0.2` | 39 | Training coefficient; no full table shown in the reviewed pages. | CGBVP mode/fallback only. |
| Hose table metric/imperial convention | lengths shown in 30 m increments while formula uses 100 ft | 40–42 | **Approximation:** 30 m treated essentially as 100 ft. | Reproduce exactly in compatibility tests; physical mode convert units exactly. |
| Elevation | opening text: `1.4` per metre; quick rule: `1 m = 1.5 psi`, `10 m=15 psi` | 44 | **Internally inconsistent.** Exact water head ≈1.422 psi/m. | Core `ρgΔz`; CGBVP mode 1.5 psi/m. |
| Floor elevation shortcut | `1 floor = 5 psi` | 44 | **Training approximation** implying ~3.3 m/floor. | Only when explicitly using CGBVP floor shortcut. |
| Valves/wyes/reducers | fixed `5 psi` loss | 45 | **Training approximation; actual loss is flow-dependent.** | CGBVP mode; physical mode K/ΔP-Q curve. |
| Monitor | fixed `10–25 psi` loss | 45 | Broad approximation. | Prefer manufacturer curve. |
| Siamese | ~`10 psi` loss | 45 | Training approximation. | Prefer manufacturer curve. |
| Foam eductor | ~`40 psi` loss | 45 | Training approximation; model-specific. | Prefer manufacturer operating/pressure-loss data. |
| Fog nozzle reaction | at 100 psi, kg reaction ≈`0.24 × gpm` | 46 | **Reasonable quick approximation at 100 psi only.** Standard relation gives ~57.3 kgf at 250 gpm vs manual 60 kg. | Optional shortcut; core use validated reaction relation/data. |
| Smooth-bore reaction | `NR = 1.57 d² NP` lbf | 46 | **Standard fire-service formula.** | Suitable as validated core formula with units. |
| Primer vacuum example | typical primer `−0.8 bar` → ~8 m water lift | 47 | Plausible equipment example, not universal. | Equipment data/default only. |
| High pressurized-source inlet | keep pump inlet below `70–80 psi` | 48 | **Apparatus-specific**, not a universal hydraulic law. | Manufacturer/apparatus limit. |
| Hydrant outlet formula | `GPM = 29.83 C D² √p`; usual `C=0.9` | 49 | Standard orifice/pitot form; coefficient is geometry-specific. | Field-flow calculator/compatibility; network physics should use source/system data. |
| Primer run time | “should not work more than 45 s” | 50 | **Equipment/standard-specific; unverified generically.** | Require manufacturer/standard data. |
| Cavitation intake rule | inlet always `>0.5 bar (7 psi)` | 51 | **Questionable/incorrect as universal rule**, especially during drafting. | Do not use as core cavitation criterion; use NPSHA/NPSHR. |
| Atmospheric column example | p.52 uses `10.8 m` | 52 | **Questionable/inconsistent** with 10.33 m standard atmospheric head stated elsewhere. | Do not treat as canonical constant. |
| p.52 example 1 | `10.8 m`, 6 m lift → text `4.08 m`; figure `4.8 m` | 52 | **Text arithmetic error.** 10.8−6=4.8. | Regression should flag manual text; physical expected 4.8 before other losses. |
| p.52 example 2 | `10.8 m`, 3 m lift → text `7.08 m`; figure `7.8 m` | 52 | **Text arithmetic error.** 10.8−3=7.8. | Same treatment. |
| Ideal max suction lift | `10.33 m` at 1013 mbar, 4 °C, ideal vacuum, sea level, airtight line | 54 | **Reasonable theoretical atmospheric-head limit** before vapor/loss margin. | Conceptual reference, not operating limit. |
| Practical suction lift | `≤7.5 m` | 55 | **Practical training default**, not universal. | Optional CGBVP limit; equipment data in physical mode. |
| Vacuum/pressure table | 14.7 psi ↔ 10.3 m, 30 inHg; down to 1 psi ↔ 0.7 m | 56 | Approx conversion table. | Reference/training only; exact conversions internally. |
| 750-gpm pump suction table | 4.5" suction; flow falls from 870 gpm at 1.2 m lift to 205 gpm at 7.3 m | 57 | **Illustrative/equipment-dependent**; not universal pump law. | Do not generalize; use actual pump/suction curve. |
| 1250-gpm pump suction table | 6" suction; 1435 gpm at 1.2 m to 495 gpm at 7.3 m | 57 | Same. | Equipment-specific only. |
| Water vapor head | chart caption ~0.25 mca at 20 °C; ~1.30 mca at 50 °C | 57 | Broadly consistent with thermophysical data. | Physical mode calculate from water temperature. |
| Max lift at 20 °C | `10.08 m` | 58 | Reasonable sea-level theoretical value after vapor-pressure subtraction. | Can be derived, not hardcoded. |
| Max lift at 50 °C | `9.03 m` | 58 | Reasonable approximation. | Derive from atmospheric and vapor pressure. |
| Altitude correction | atmospheric head decreases `1.25 m per 1000 m`; `H_altitud=1.25 Z(km)` | 58 | **Rough linear approximation**, increasingly inaccurate at altitude. | CGBVP mode only; physical mode standard/measured atmosphere. |
| 1500 m example | max theoretical suction `8.43 m` | 58 | Close but conservative vs standard-atmosphere atmospheric head ≈8.62 m before vapor pressure. | Compatibility expected 8.43; physical calculate environment. |
| 4000 m example | max theoretical suction `5.33 m` | 58 | Materially conservative vs standard-atmosphere atmospheric head ≈6.29 m before vapor pressure. | Compatibility only; not physical base. |
| Fire-pump suction rule | “most” self-priming fire pumps: lift `≤6 m`, suction hose `≤10 m` | 62 | **Equipment/practice default; conflicts with p.55 7.5 m.** | Apparatus-specific. |
| Pump pressure categories | “low” up to ~210/280 psi; “high” 210–850 psi | 62 | Broad descriptive range, not simulator physics. | Metadata at most. |
| Nominal pump flow convention | 10 bar discharge, 6 m suction lift, 8 m suction hose + strainer | 65 | **Needs standard/source verification before general use.** | Do not assume globally. |
| Fixed-orifice nozzle flow example | 50→80 psi causes `+22%` flow | 71 | **Apparent error.** `√(80/50)` gives +26.5% for fixed Cd/A. | Do not use manual percentage as physical expected. |
| Handline smooth-bore default | `50 psi` | 72 | Traditional default. | Default/training; actual nozzle data wins. |
| Master-stream smooth-bore default | `80 psi` | 72 | Traditional default. | Default/training; actual nozzle data wins. |
| Combination nozzle default | `100 psi` | 72 | Traditional default. | Default/training; actual nozzle data wins. |
| Steam expansion | water vapor volume ~`1700×` liquid at 100 °C | 13, 74 | Reasonable approximate fire-service value near 1 atm. | Not core hydraulic-network behavior. |
| Litres to gallons exercise | divide by `3.7` | 74 | Rough US-gallon conversion; exact 1 US gal = 3.78541 L. | Compatibility exercise only; exact conversions internally. |
| Relay receiving residual | `20 psi` | 79 | Recognizable fire-service supply target/reference. | CGBVP relay mode/default; allow apparatus/system constraints. |
| Pump rating points | max/rated at `150 psi`; 70% at `200 psi`; 50% at `250 psi` | 79 | Matches NFPA 1911 test sequence for applicable pumps; not complete pump curve. | Rating metadata/test only. |
| Relay table pressure | table shows `170 psi` and `140 psi` rows | 79 | Conflicts with nearby narrative saying 200 psi and later 185/200 psi. | **Requires further verification.** |
| Relay pumper count | `distance / table distance + 1`, round up | 80 | Planning heuristic. | CGBVP mode only; physical mode solve network. |
| Relay example single 2½" | 500 gpm, says `35 psi/15 m` | 82 | **Inconsistent with own C=2 formula** (~24.6 psi/15 m using exact conversion). | Do not use as expected physical or C-formula result without annotation. |
| Relay example dual 2½" | 500 total, two lines, says `10 psi/15 m` | 82 | **Inconsistent with own C=2 formula** (~6.15 psi/15 m per line at 250 gpm). | Annotate as manual discrepancy. |
| Parallel-line scaling | two equal lines can give ~4× distance at same total flow/loss budget under Q² rule | 82 | **Conceptually sound** under the manual's quadratic hose law. | Good compatibility/physics teaching case. |

## External checks used for numerical assessment

- US EPA EPANET 2.2: https://www.epa.gov/water-research/epanet
- EPANET 2.2 manual: https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P10113EM.TXT
- Hydraulic Institute NPSH: https://datatool.pumps.org/pump-fundamentals/pump-principles
- Task Force Tips nozzle reaction: https://tft.com/understanding-your-nozzle-reaction/
- Elkhart Brass technical data: https://elkhartbrass.com/wp-content/uploads/catalog-f9-T-G.pdf
- IAPWS water vapor pressure: https://iapws.org/faqs/faq1
- NOAA/NWS standard atmosphere: https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf
- NFPA 291 committee report: https://www.nfpa.org/api/files?path=%2Ffiles%2FAboutTheCodes%2F291%2F291_A2021_AUT_PRI_SRReport.pdf
- NFPA 1911 committee report: https://www.nfpa.org/api/files?path=%2Ffiles%2FAboutTheCodes%2F1911%2F1911_F2016_FDA-AAA_FD_FRStatements.pdf

## Numerical treatment rule

If the simulator exposes two modes, recommended precedence is:

1. **Physical/equipment mode:** actual equipment curve/data > calibrated empirical data > general engineering equation > generic fallback.
2. **CGBVP compatibility mode:** reproduce the manual's stated coefficients/rules where intentional, but retain explicit annotations for known errors.
3. Never promote an apparent arithmetic/typesetting error to a “physics constant” merely because it appears in the manual.
