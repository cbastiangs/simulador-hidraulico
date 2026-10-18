# Experimentally measured fire reference loads

Research checked 2026-10-17. Scope: explicitly labelled experimental peak reference loads for the future cooling-capacity comparison in MODEL.md §3.12; not fire forecasts, required-flow calculations, or extinguishment criteria. Project context: `docs/extinguishment-research.md` §§4–5. No engine or UI changes are proposed here.

## 1. Which specific measured cases are defensible?

### Takeaway

Use the following **three identified NIST experiments**, spanning 0.447–4.021 MW. Their published peaks, specimen descriptions, uncertainty, event logs and machine-readable histories are accessible together. These are individual specimens/assemblies, not representative values assigned to all chairs or sofas. All belong to NIST's *Design Fires — Residential and Office Items* project, documented by Hamins et al., *The Character of Burning Residential and Office Items*, NIST TN 2303 (March 2025). — [Project](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items); [report PDF](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf)

### Cited Findings

Uncertainty below is the FCD's **combined expanded uncertainty, 95% confidence**, not specimen-to-specimen variability. Dates/times are reproduced from FCD Table 1 in EST. Peak values and times use current FCD Table 2, checked against its CSV, rather than silently mixing report and database revisions. — [Test017](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017); [Test027](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test027); [Test034](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034)

| Suggested explicit reference label | Test/date (FCD) | Published peak HRR ± Uc | Time to peak ± Uc | THR ± Uc; test duration | Primary locator |
|---|---|---|---|---|---|
| NIST conference chair B, Test017, open burn | 2023-12-07, 08:18:13 EST | **447 ± 23 kW = 0.447 ± 0.023 MW** | 3.43 ± 0.07 min | 38.9 ± 2.2 MJ; 16.68 min | [FCD Tables 1–4, Fig. 1](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017) |
| NIST large armchair H, Test027, open burn | 2023-12-12, 10:05:04 EST | **1,733 ± 89 kW = 1.733 ± 0.089 MW** | 3.45 ± 0.07 min | 381 ± 22 MJ; 25.40 min | [FCD Tables 1–4, Fig. 1](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test027) |
| NIST used sofa C + two A pillows, Test034, open burn | 2023-12-13, 11:04:13 EST | **4,021 ± 205 kW = 4.021 ± 0.205 MW** | 6.05 ± 0.07 min | 633 ± 37 MJ; 30.22 min | [FCD Tables 1–4, Fig. 1](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034) |

#### Case A — Conference Room Chair B, Test017

- **Exact specimen:** initial mass 7.424 kg in the report (FCD input table rounds to 7.42 kg); wood frame, polyurethane-foam cushions with blended polyester/cotton-fiber batting, woven-glass backing. The FCD description additionally specifies “40% urithane foam, 60% blended fiber batting” [source spelling]; this is not a claim about the composition of every component of the complete chair. Igniter approximately 1 cm below the bottom of the back cushion. — [TN 2303 §2.3.2, printed p. 12; Table 4 p. 15; Fig. A17 p. 45 / PDF p. 61](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=61); [FCD Tables 1 and 3](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017)
- **Conditions:** open, fully ventilated, quasi-quiescent experiment, no applied wind field; oxygen-consumption calorimetry under the 3 m × 3 m canopy hood. Baseline exhaust mass flow 2.512 ± 0.075 kg/s. Propane-wand ignition (FCD description: 1-inch flame). This was not a room fire. — [TN 2303 abstract and §2, printed pp. 7–8 / PDF pp. 23–24](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=23); [FCD Tables 1–3](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017)
- **History/end conditions:** chair dripping at 1.17 min; peak at 3.43 min; water suppression at 15.73 min; fire out at 16.68 min. The peak precedes recorded suppression, but the complete history is not an uninterrupted natural burnout. — [FCD Table 4](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017)
- **Reproduction:** [direct CSV `1701973093_Test017.csv`](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1701973093_Test017.csv), columns `Time (s)` and `Heat Release Rate (kW)`; maximum **447.28 kW at 206 s**, rounding to FCD's peak. [Direct HRR plot](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1701973093.png). Report counterparts: Table 6 p. 25; Fig. D17 p. 116 / PDF p. 132. — [Report](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=132)

#### Case B — Large Armchair H, Test027

- **Exact specimen:** 26.594 kg initial mass (FCD rounds to 26.59 kg), wood frame, PUF cushions, metal springs, thin fiberglass cloth over the foam, blended cover fabric. FCD description also mentions polyester cushions. Report Fig. A27 places the igniter just above the crevice between seat and back cushions; its wording calls this a 1 cm flame whereas FCD calls the flame 1 inch. Preserve this discrepancy rather than assert an exact common flame length. — [TN 2303 §2.3.2 p. 12; Table 4 p. 15; Fig. A27 p. 50 / PDF p. 66](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=66); [FCD Tables 1 and 3](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test027)
- **Conditions:** same open, fully ventilated, no-applied-wind experimental campaign; **9 m × 12 m** hood (FCD shorthand “hood size 9 m”); baseline exhaust 19.92 ± 0.60 kg/s. Propane-wand ignition. — [TN 2303 abstract and §2 pp. 7–8](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=23); [FCD Tables 1–3](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test027)
- **History/end conditions:** pool fire underneath at 3.00 min, peak at 3.45 min, raking coals at 24.53 min, fire out at 25.40 min. The peak includes the burning behavior of this assembly and its molten/dripping fuel, not a separately added pool-fire allowance. — [FCD Table 4](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test027)
- **Reproduction:** [direct CSV `1702411504_Test027.csv`](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702411504_Test027.csv); maximum **1,733.3 kW at 207 s**. [Direct plot](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702411504.png). Report counterparts: Table 6 p. 25; Fig. D27 p. 121 / PDF p. 137. — [Report](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=137)

#### Case C — Used Sofa C with two A pillows, Test034

- **Exact assembly:** 50.849 kg initial mass (FCD rounds to 50.85 kg); used sofa estimated **over 30 years old**, solid-wood frame, polyester-batting back, metal seat springs, polyurethane-foam seat cushion covered with polyester batting, polyester/cotton-blend cover. Two A pillows rested at about 45° on the seat-cushion/armrest edges; igniter in the crevice between pillow and armrest. Pillow A is described in the project as polyester foam insert/polyester cover. This is the measured **sofa-and-pillows assembly**, not a bare-sofa peak plus assumed pillow peaks. — [TN 2303 §2.3.4 p. 14; Fig. A34 p. 53 / PDF p. 69](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=69); [FCD Test034 Table 1](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034); [project specimen list](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items)
- **Conditions:** open, fully ventilated, quasi-quiescent campaign; 9 m × 12 m hood, baseline exhaust 20.71 ± 0.62 kg/s; propane-wand ignition. No enclosing room or ventilation opening is represented. — [TN 2303 abstract and §2 pp. 7–8](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=23); [FCD Tables 1–3](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034)
- **History/end conditions:** whole back flaming at 4.63 min, pool fire at 5.13 min, peak at 6.05 min; water suppression at 30.02 min, fire out at 30.22 min. Peak is before recorded suppression. — [FCD Table 4](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034)
- **Reproduction:** [direct CSV `1702501453_Test034.csv`](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702501453_Test034.csv); maximum **4,020.9 kW at 363 s**. [Direct plot](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702501453.png). Report counterparts: Table 6 p. 26; Fig. D34 p. 124 / PDF p. 140. — [Report](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=140)

### Inferences

- These three values are ready to be considered as **named peak reference loads**, retaining test identity, assembly, experimental conditions and uncertainty alongside each number. Choosing them is a modelling recommendation, not a NIST recommendation.
- The two chairs illustrate why an item name alone is insufficient: these particular chairs differ substantially in construction, mass, and measured peak.

### Gaps

- No universal “chair,” “sofa,” wastebasket or room-content value is established. No room case is recommended by this narrow shortlist. The requested 3–5-case objective is met with three reproducible cases rather than adding weaker numbers for breadth.
- Brand/product identifiers, detailed foam properties and all dimensions have not been transcribed; appendix specimen photos remain the authority for geometry. The source's descriptive identity is retained rather than inventing a product specification.

## 2. Do these peaks represent sustained loads, and can the histories be reproduced?

### Takeaway

They are short-lived measured maxima, not sustained plateaus. Use the published rounded peaks for a static reference comparison; retain the CSVs as the time-history authority. The campaign sampled at **1 Hz**. — [TN 2303 §2, printed p. 7 / PDF p. 23](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=23)

### Cited Findings

The following are **researcher-computed checks on the downloaded CSVs**, not extra published summary statistics. Read the two named columns, find their maximum, select exact integer-second rows, and count post-ignition rows with HRR ≥ 0.9 × that maximum. The supplied files have 1 s spacing. Do not mistake extra decimal places for greater experimental accuracy. — [Test017 CSV](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1701973093_Test017.csv); [Test027 CSV](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702411504_Test027.csv); [Test034 CSV](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702501453_Test034.csv)

| CSV check | Test017 | Test027 | Test034 |
|---|---:|---:|---:|
| HRR at 120 s (kW) | 29.68 | 178.62 | 89.81 |
| HRR at 300 s (kW) | 71.82 | 967.65 | 1,202.9 |
| HRR at 600 s (kW) | 10.96 | 196.64 | 249.75 |
| HRR at 900 s (kW) | 3.60 | 76.40 | 166.27 |
| Number of 1 s samples ≥90% of CSV maximum, t ≥ 0 | 10 | 20 | 18 |

- **Report/database timing discrepancy:** printed Table 6 gives time-to-peak 3.47, 3.48 and 6.08 min for Tests 17, 27 and 34; the current FCD gives 3.43, 3.45 and 6.05 min. Current CSV maxima agree with current FCD. Peak magnitudes agree after rounding. This research does not establish why the timing changed. — [TN 2303 Table 6 pp. 25–26 / PDF pp. 41–42](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=41); [FCD 017](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017); [FCD 027](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test027); [FCD 034](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034)
- **Report label discrepancy:** the sofa rows of printed Table 6 label Test034 “A,” although §2.3.4, Fig. A34, Fig. D34 and FCD identify it as **Sofa C**. Other sofa rows also have inconsistent labels. Identify by project + test number, not the letter in that table alone. — [TN 2303 Table 6 p. 26](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=42); [Fig. A34 p. 53](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=69); [FCD Test034](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034)
- FCD pages identify report-processing version **NFRL_Report_8.7.1**, last updated April 7, 2026. The general database has persistent identifier **10.18434/mds2-2314**. — [Test017 metadata](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017); [database DOI](https://doi.org/10.18434/mds2-2314)

### Inferences

- A constant 4.021 MW reference is a comparison against the sofa assembly's measured peak, not a reconstruction of its 30.22-minute burn. The high-peak sample counts reinforce this distinction; they are not fitted plateau durations.
- If these are later coded, keep the current FCD peak and timing together, and pin retrieval/version information. A live database link alone may not preserve a future revision exactly.

### Gaps

- No sustained-load averaging window is adopted. No t-squared curve, growth category, extrapolated duration, or interpolated room history is fitted.
- CSV processing/filtering details and the reason for the report/FCD timing offsets were not independently audited. No uncertainty is invented for the researcher-computed sample counts.

## 3. What limitations must accompany a cooling-capacity comparison?

### Takeaway

These measurements support traceable **experimental reference MW**, not predictions of extinguishment or the HRR of an arbitrary furnished room. Their measurement uncertainty must remain separate from the much broader uncertainty of transferring one specimen's behavior to another setting.

### Cited Findings

- TN 2303 explicitly describes experiments **in the open, fully ventilated and quasi-quiescent**; §2 specifies no applied wind field. These are canopy-hood calorimetry tests, not ventilation-limited compartment measurements. — [Abstract, PDF p. 4](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=4); [§2 pp. 7–8](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=23)
- Reported peak uncertainties are about **5.1%** for these tests (23/447, 89/1733, 205/4021; arithmetic from Table 2). They are measurement uncertainties at 95% confidence, not population intervals for all furniture in the category. — [017 Table 2](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test017); [027 Table 2](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test027); [034 Table 2](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test034)
- The campaign directly investigated changes in configuration/ignition: three Sofa B trials had different pillow/ignition locations, with measured peaks 2,994, 5,153 and 4,036 kW (Tests 30, 36 and 41). They are evidence of scenario dependence, not three additional proposed presets. — [TN 2303 §2.3.4 p. 14 and Table 6 p. 26](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=30); [FCD project results](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items)
- NIST separately conducted **Multiple Item Transient Combustion Calorimetry** experiments specifically to examine the relationship between peak HRR and number of burning items. A room peak cannot be justified simply by summing this shortlist's separate maxima. — [NIST project description](https://www.nist.gov/el/fcd/multiple-item-transient-combustion-calorimetry)
- The calorimetry-method reference is Bryant and Bundy, **NIST TN 2077 (2019)**, linked from the individual records and cited by TN 2303 for measurement method/calibration/uncertainty. It is a method reference; it was not independently extracted in this investigation. — [TN 2077 DOI](https://doi.org/10.6028/NIST.TN.2077); [TN 2303 §2 p. 7](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf#page=23)

### Inferences

- Suggested future label: **“Measured peak reference: NIST Test034, used sofa C + two pillows, open fully ventilated test — 4.021 MW (±0.205 MW measurement uncertainty, 95%).”** Equivalent labels should accompany the other two cases.
- Never add the peaks of separately tested items and call the sum a measured room peak. Ignition timing and interactions must be established by an actual assembly/room experiment or a separately justified model.
- These are total oxygen-consumption HRRs. Comparing them with Q × heat absorption × η would be an illustrative energy-rate comparison; equality does not establish where the water deposits energy, fuel cooling, suppression effectiveness, or an “out/safe” state. The NFA area-based flow convention remains a separate quantity.
- Do not apply an automatic “room correction,” ventilation factor, generic chair/sofa conversion, or uncertainty multiplier based on these data.

### Gaps

- No water-application efficiency, extinguishing flow, suppression-time prediction, or absorbed-energy fraction is inferred from these burns. Late water application in two event logs supplies no measured flow/effectiveness relation.
- No FSRI report was needed to meet the three-case objective; this shortlist is NIST-only. A future measured room case should include its actual furnishings, compartment/opening geometry and ventilation chronology, and measured aggregate HRR rather than an inventory sum.
