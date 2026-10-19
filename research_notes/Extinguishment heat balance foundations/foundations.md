# Extinguishment heat-balance foundations

Research date: 2026-10-19. Research notes and recommendations, not an adopted model. Scope: the future math-only `extinguish.absorption` comparison in `docs/MODEL.md` §3.12 and `docs/extinguishment-research.md` §5; NFA is already implemented and is not reconsidered here. No default application efficiency is proposed.

## 1. What is the thermodynamic cooling capacity of one US gpm?

### Takeaway

For liquid water entering at 20 °C and 101.325 kPa absolute and leaving as steam at 100 °C at the same pressure, the enthalpy gain is **2591.5757 kJ/kg**. Using the inlet liquid density, one US gpm corresponds to **0.06297709 kg/s**, giving **163.2099 kW per US gpm**. Thus the repo's rounded 163 is sound for this specified endpoint, not a measurement of actual fireground absorption. — [NIST water query](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm); [NIST volume/flow conversions, entries G](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8)

### Cited Findings

**Primary property sources and reproducibility.** NIST Chemistry WebBook SRD 69, water CAS 7732-18-5, isobaric query at 0.101325 MPa, temperatures 20–100 °C, default reference state, mass-specific energy units, seven digits. The response explicitly includes both saturation phases between the requested endpoints. These are calculated thermophysical properties, not exact conversion definitions. IAPWS recommends IAPWS-95 for ordinary water, including vapor–liquid equilibrium; the official release supplies the formulation, while the numerical values below were obtained directly from NIST, not independently recalculated from IAPWS equations. — [NIST query](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm); [IAPWS R6-95(2018), release description](https://iapws.org/relguide/IAPWS95-2018.pdf); [official formulation PDF](https://iapws.org/technical-guidance/release/IAPWS-95.download)

| State at 101.325 kPa absolute | Temperature °C | Density kg/m³ | Enthalpy kJ/kg |
|---|---:|---:|---:|
| Inlet liquid | 20.00000 | 998.2072 | 84.00730 |
| Saturated liquid | 99.97430 | 958.3675 | 419.0577 |
| Saturated vapor | 99.97430 | 0.5976568 | 2675.529 |
| Vapor at requested endpoint | 100.0000 | 0.5976122 | 2675.583 |

Every table entry is from the phase-labelled rows of the [NIST query](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm).

**Derived arithmetic**, retaining extra digits only to make the calculation reproducible:

```text
US gallon = 231 in³; inch = 0.0254 m
V_USgal = 231 × 0.0254³ = 0.003785411784 m³
1 US gpm = 0.003785411784 / 60
         = 0.0000630901964 m³/s
mass flow per US gpm = 998.2072 × 0.0000630901964
                     = 0.0629770883 kg/s

sensible heating to saturation = 419.0577 − 84.00730
                               = 335.0504 kJ/kg
latent heat at saturation      = 2675.529 − 419.0577
                               = 2256.4713 kJ/kg
slight superheat to 100 °C     = 2675.583 − 2675.529
                               = 0.0540 kJ/kg
total enthalpy gain            = 2591.5757 kJ/kg

power per US gpm = 0.0629770883 × 2591.5757
                 = 163.2099 kJ/s = 163.2099 kW
```

The exact full gallon factor is expanded from its cubic-inch definition and exact inch conversion; NIST SP 811 B.8 prints the rounded cross-checks 3.785412 L/US gal and 6.309020 × 10⁻⁵ m³/s per US gpm, and distinguishes the Imperial gallon. The state properties come from NIST above. — [NIST SP 811 B.8, entries cubic inch, gallon, inch](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8)

- Heating alone contributes about **21.10 kW/gpm**; latent heat contributes **142.11 kW/gpm**. Liquid runoff can therefore absorb heat without evaporating. These are calculated contributions using the NIST states, not measured efficiencies. — [NIST query](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm)
- Exactly 100 °C is slightly superheated at one standard atmosphere: the query's boiling temperature is 99.97430 °C. “100 °C saturated steam” and “steam at 1 atm” are acceptable rounded teaching descriptions, but not identical exact specifications. — [NIST query](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm)
- The repo approximation `4.18 × 80 + 2257` actually sums to **2591.4 kJ/kg**, which rounds to 2591; `0.0631 kg/s` also assumes approximately 1000 kg/m³. These approximations explain the rounded 163 without requiring any empirical efficiency adjustment. — Arithmetic from the [NIST state data](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm).

### Inferences

- **Recommended future law:** `idealCoolingKw = deliveredAppliedFlowGpm × 163.21`, with the inlet and outlet states attached to its provenance; 163 is a reasonable display rounding. Flow must mean the solved liquid flow actually assigned to application, not total pump discharge. This is an enthalpy-flow comparison, not pump mechanical power. — Derived from [NIST water data](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm).
- Call this the **full-vaporization reference capacity**, not an absolute maximum over all possible final states: steam hotter than 100 °C has additional enthalpy. Changing water temperature or ambient pressure requires a different state calculation. — [IAPWS formulation scope](https://iapws.org/relguide/IAPWS95-2018.pdf).

### Gaps

- The IAPWS release landing page and its official download link were verified, but its PDF equations were not independently evaluated. The numerical verification here is NIST, not a second independent IAPWS software implementation.
- No altitude-dependent boiling law, variable-temperature feature, or compressed-water inlet correction is proposed or validated here. The result is deliberately tied to one atmospheric reference state.

## 2. What could suppression efficiency mean, and is a universal η defensible?

### Takeaway

**No universal numerical η is defensible from the evidence verified in this pass.** Distribution, evaporation and absorbed heat are distinct measurements. A future math-only comparison can accept an explicitly declared heat-absorption effectiveness as an assumption or a narrowly applicable measurement, but should not silently source it from a nozzle label or from a percentage of water evaporated. — Physical distinction derived from [NIST water enthalpies](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm); scope supported by [FSRI Water Mapping](https://d1gi3fvbl0xj2a.cloudfront.net/files/2021-07/DHS2013_Part_I_Water_Mapping.pdf), printed pp. 5–8 (PDF pp. 17–20).

### Cited Findings

#### Operational definitions for evaluating future evidence

The following are **proposed accounting definitions**, not claims that all cited authors use these symbols:

| Quantity | Explicit numerator / denominator | What it does not establish |
|---|---|---|
| Contact/delivery fraction `f_contact` | Water mass reaching a defined target / water mass discharged during the same interval | Its temperature rise, vaporization, or energy removed |
| Evaporated fraction `f_evap` | Water mass converted to vapor inside a defined control volume / discharged water mass during the same interval | Heat absorbed by unevaporated water, vapor temperature, or location of useful cooling |
| Heat-absorption effectiveness `η_heat` | Net heat transferred from the defined target/control volume to applied water / (`discharged mass × reference Δh`) | A proportional reduction in HRR, knockdown, extinction, or operator performance |

The distinction follows directly from the sensible and latent enthalpy terms: phase change is only one contribution, and contact is a spatial prerequisite rather than an energy measurement. For fuel cooling, NIST explicitly identifies contact with the fuel surface as necessary; it also lists combustion-zone cooling, radiation-feedback reduction and oxygen displacement as other effects. — [NISTIR 6191](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6191.pdf), printed pp. 1-3–1-4 (PDF pp. 11–12; cached primary PDF inspected; live download gap below); [NIST enthalpies](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm).

#### FSRI: strong distribution evidence, not a thermal η

- Weinschenk, Stakes and Zevotek, *Impact of Fire Attack Utilizing Interior and Exterior Streams on Firefighter Safety and Occupant Survival: Water Mapping*, December 6, 2017. Printed **p. 5 / PDF p. 17** defines the objective as water flux and explicitly notes the absence of furniture. Printed **p. 6 / PDF p. 18** reports **83 water-flow tests**, with **48 collection bins**, in a purpose-built compartment at UL's Large Fire Laboratory. Printed **p. 8 / PDF p. 20** explains that the ADD apparatus measures collection rate from changing water head in barrels. The measured quantity is spatial water delivery, not calorimetric absorption or evaporation. — [Direct report](https://d1gi3fvbl0xj2a.cloudfront.net/files/2021-07/DHS2013_Part_I_Water_Mapping.pdf); [DOI](https://doi.org/10.54206/102376/NEVX1787).
- FSRI's own release states that these experiments were conducted **without fire**. Consequently, neither a bin-capture percentage nor a more uniform distribution supplies a fireground `η_heat`. — [FSRI release, abstract and introduction](https://fsri.org/research-update/part-i-fire-attack-study-released-water-mapping).

#### NIST: mechanisms and test-specific performance are not a universal coefficient

- Madrzykowski and Stroup, eds., *Demonstration of Biodegradable, Environmentally Safe, Non-Toxic Fire Suppression Liquids*, **NISTIR 6191, July 1998**, printed **pp. 1-3–1-4 / PDF pp. 11–12**, distinguishes fuel-limited from ventilation-limited fires, fuel-surface cooling, penetration into shielded pyrolyzing surfaces, combustion-zone cooling, radiation feedback and steam displacement. It does not identify these mechanisms with one measured heat-absorption efficiency. — [Direct primary report](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6191.pdf).
- Printed **p. 1-2 / PDF p. 10** reports a broad background observation that applied water rates can be **10–100 times a theoretical rate**, citing earlier literature. This is **a required-flow multiplier**, not measured `f_evap`, `f_contact` or `η_heat`; the passage supplies no common specimen, application protocol or defined thermal control volume. Do **not** invert it into a recommended efficiency range. It is retained here only with its actual definition and exact locator. — [NISTIR 6191, p. 1-2](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6191.pdf#page=10).

#### Särdqvist and Grimwood: citation chain located, numerical adoption blocked

- The official Swedish agency provides Särdqvist's *Water and Other Extinguishing Agents*. The retrieved English PDF has **340 PDF pages**, but no extractable text was obtained with `pypdf`; no numerical efficiency passage or printed-page citation was verified. This is an extraction/access gap, not proof that the book lacks relevant material. — [Agency publication entry](https://www.mcf.se/sv/publikationer/water-and-other-extinguishing-agents/); [direct English PDF](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf).
- Ed Hartin's *Effective and Efficient Fire Streams*, section **“Fire Stream Efficiency”**, traces commonly repeated factors to **Särdqvist 1996**, Hadjisophocleous & Richardson 2005, and **Barnett as cited in Grimwood 2005**. Hartin also separates personal observation from experimental data and says practical efficiency depends on application, operator, space and fire conditions. This is useful bibliography and secondary commentary, not primary verification of a coefficient. In particular, the repo's shorthand “Särdqvist 2002; Grimwood” should not be treated as verification of that older citation chain. — [Full secondary article and bibliography](https://commandcompetence.com/post/effective-and-efficient-fire-streams/).
- Hartin links Grimwood's *Firefighting Flow Rate: Barnett (NZ)–Grimwood (UK) Formulae*. The original PDF could not be fetched in this pass. Its factors are therefore **not transcribed as numerical evidence**: neither their exact pages nor whether they represent an assumed energy fraction, an evaporation fraction, or a tactical allowance was checked. — [Original linked PDF, access failed](https://www.fire-flows.com/FLOW-RATE%20202004.pdf); [citation chain](https://commandcompetence.com/post/effective-and-efficient-fire-streams/).

### Inferences

- **Do not set `η_heat = f_evap`.** For illustration only, if all discharged water warms to the boiling point, fraction `e` evaporates, and the remainder leaves as boiling liquid, the absorbed energy per discharged kg is `335.0504 + e × 2256.4713 kJ/kg`. Relative to the saturated-vapor reference it is `(335.0504 + e × 2256.4713) / 2591.5217`, not `e`. This is derived thermodynamic accounting, not an application-efficiency estimate or a default. — [NIST phase-labelled states](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm).
- A product of contact fraction and **evaporation fraction conditional on contact** can describe vaporized contacting water, but still omits sensible heating of runoff. Multiplying `f_contact` by `f_evap` as defined above can double-count delivery losses because that evaporation fraction already uses total discharged water as denominator. Require explicit denominators before combining published factors. — Inference from the accounting definitions and [NIST enthalpy data](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm).
- **Recommendation:** expose the ideal reference capacity first. Any adjusted capacity should require a named `η_heat` assumption or a matched experiment, including target, interval, water states, collection/energy measurement method and uncertainty. Do not select efficiencies automatically by smooth-bore/fog designation. FSRI distribution data cannot supply the missing thermal measurement. — [FSRI report, pp. 5–8](https://d1gi3fvbl0xj2a.cloudfront.net/files/2021-07/DHS2013_Part_I_Water_Mapping.pdf#page=17).
- A thermal ratio `R = adjustedCoolingKw / referenceFireHrrKw` equal to one means only equality of two specified powers. It supplies no extinction condition: energy can be removed from the wrong location, fuel can remain hot or shielded, and ventilation and steam dilution can affect combustion independently. Recommend outputs named capacity, reference HRR, signed power difference and thermal ratio; no `extinguished`, `safe`, time-to-knockdown or threshold verdict. — Mechanistic basis: [NISTIR 6191, pp. 1-3–1-4](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6191.pdf#page=11).

### Gaps

- **No primary experiment yielding a transferable numerical `η_heat` was verified.** This pass does not establish that none exists. The unresolved evidence must remain unresolved rather than being filled with secondary percentages.
- Särdqvist: the official English PDF was retrieved, but text extraction returned no useful text; no OCR/page-image reading was completed. The specific 1996 work cited by Hartin was not obtained. Edition/date and exact efficiency pages still need checking before calling the book “Särdqvist 2002” as a coefficient source.
- Grimwood: original PDF fetch failed with a transport error. No exact-page primary value is adopted. Hadjisophocleous & Richardson 2005 was located bibliographically via Hartin, but its primary article was not inspected.
- NISTIR 6191: an already-present cached primary PDF at `/tmp/opencode/water-nistir6191.pdf` was inspected, including title and printed page numbers. The live `nvlpubs.nist.gov` download returned HTTP 403 in this pass. Its background multiplier is not new experimental efficiency evidence.
- FSRI: Part I was downloaded and inspected successfully. This pass does not establish whether a later hot-fire study contains an independently measured water enthalpy balance; no such coefficient is attributed to FSRI.
- Discovery limitations: Google returned a JavaScript interstitial; Bing results were poorly matched; DuckDuckGo initially yielded useful sources and later issued a bot challenge. No challenge was bypassed. These constrain completeness of the literature search.

## 3. Which three measured fire HRR cases can anchor reference comparisons?

### Takeaway

Three NIST FCD experiments provide traceable **measured peak** reference cases: **Test016 chair, 0.621 MW; Test029 modified loveseat assembly, 1.984 MW; Test038 mattress/bedding assembly, 4.563 MW**. These are particular specimens and pre-suppression/free-burning peaks, not sustained generic “chair/sofa/bed fire” powers or required-flow measurements. — [Test016](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test016); [Test029](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test029); [Test038](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test038).

### Cited Findings

**Shared provenance and conditions.** All three belong to **Design Fires – Residential and Office Items**, test director Hamins, at NIST's National Fire Research Laboratory. NIST TN 2303, *The Character of Burning Residential and Office Items*, March 2025, **abstract p. iv / PDF p. 4**, says the measurements were conducted **in the open, under fully ventilated, quasi-quiescent conditions**. Its introduction, **p. 1 / PDF p. 17**, distinguishes transient HRR, peak HRR and total heat release. These are hood calorimetry experiments, not room-ventilation-limited fire predictions. — [Project page](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items); [TN 2303 DOI](https://doi.org/10.6028/NIST.TN.2303); [report PDF](https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2303.pdf).

The FCD identifies oxygen-consumption calorimetry and cites Bryant & Bundy, *The NIST 20 MW Calorimetry Measurement System for Large-Fire Research*, TN 2077 (2019), as the measurement-method reference. The values below are the directly published FCD summary results, not values digitized from graphs or recomputed from CSV maxima. — [FCD](https://www.nist.gov/el/fcd); [TN 2077 DOI](https://doi.org/10.6028/NIST.TN.2077).

| Exact experiment and specimen | Measured peak HRR and reported Uc | Time to peak | Conditions and application history |
|---|---|---|---|
| **Test016**, 2023-12-07. **Stackable Chair A**: single chair, metal frame, particle-board seat/back; fuel field “Polyurethane Foam/Plastic.” Initial gravimetric specimen mass **9.68 kg**. | **621 ± 32 kW = 0.621 ± 0.032 MW** | **19.05 ± 0.07 min** | **3 m hood**, baseline exhaust **2.462 kg/s**; propane-wand/1-inch-flame ignition. Reignition at 0.75 min; pilot increased at 1.12 min; chair ignition at 1.40 min. Water suppression at **62.68 min**, fire out at 62.80 min, well after the peak. |
| **Test029**, 2023-12-13. **Sofa A (K-Loveseat)** assembly **with two A pillows** and modified bottom inserts: **two polyurethane foam layers with springs removed**, polyester-batting back cushions. Initial gravimetric mass **57.64 kg**. | **1984 ± 102 kW = 1.984 ± 0.102 MW** | **6.22 ± 0.07 min** | **9 m hood**, baseline exhaust **20.43 kg/s**; propane-wand/1-inch-flame ignition. Pool fire underneath at 4.62 min. Coals raked at 32.03 min; water suppression at **34.30 min**, fire out at 34.67 min. The peak includes the evolving assembly/pool-fire behavior, not isolated foam material. |
| **Test038**, 2023-12-14. **12-inch Mattress C with two pillows and bedding**, described as memory foam on a metal frame; fuel field “Polyurethane Foam / polyester fiber.” Initial gravimetric mass **31.83 kg**. | **4563 ± 233 kW = 4.563 ± 0.233 MW** | **12.73 ± 0.07 min** | **9 m hood**, baseline exhaust **41.7 kg/s**; propane-wand/1-inch-flame ignition. Flame dripping at 5.00 min, pool fire underneath at 11.18 min; fire out at 19.08 min. Its published event table lists **no water-suppression event**; do not infer a measured extinguishing flow from it. |

All values and descriptions in each row: the corresponding experiment's **Tables 1–4**: [Test016](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test016), [Test029](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test029), [Test038](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test038). The websites define **Uc as combined expanded uncertainty with 95% confidence**; the ± notation above reproduces those reported Uc values, not specimen-to-specimen variability.

**Direct data links for a later time-dependent or sustained-reference audit:**

- Test016: [CSV, 1701963874_Test016.csv](https://www.nist.gov/fcd-s3?path=/HRR/ASSET_FILES/DesignFires_Furniture/data/1701963874_Test016.csv); [HRR plot with event markers](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1701963874.png).
- Test029: [CSV, 1702479452_Test029.csv](https://www.nist.gov/fcd-s3?path=/HRR/ASSET_FILES/DesignFires_Furniture/data/1702479452_Test029.csv); [HRR plot with event markers](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702479452.png).
- Test038: [CSV, 1702581833_Test038.csv](https://www.nist.gov/fcd-s3?path=/HRR/ASSET_FILES/DesignFires_Furniture/data/1702581833_Test038.csv); [HRR plot with event markers](https://nist-el-nfrlhrr.s3.amazonaws.com/HRR/ASSET_FILES/DesignFires_Furniture/data/1702581833.png).

These CSV and plot addresses were taken from the successfully accessed experiment pages. CSV contents were not processed in this pass. **No sustained plateau or time-averaged HRR is asserted.** A total test duration is not the duration of the peak. — [Test016 summary and events](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test016); [Test029 summary and events](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test029); [Test038 summary and events](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test038).

### Inferences

- **Recommended future reference labels:** “NIST Test016 – Stackable Chair A – measured peak,” “NIST Test029 – modified loveseat + two pillows – measured peak,” and “NIST Test038 – Mattress C + bedding + two pillows – measured peak.” Preserve the project name as well as the test number; test numbers alone are not globally unique. Do not reduce these to universal small/medium/large-fire presets. — [NIST project and experiment identifiers](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items).
- Each future reference record should retain specimen/assembly details, test date, open/ventilated conditions, ignition, `statistic: peak`, peak time, uncertainty, source URL and source version/access date. If the engine compares a constant flow to this scalar, it is comparing against a **published peak reference**, not simulating the entire fire. — [FCD's test conditions and reported parameters](https://www.nist.gov/el/fcd); [TN 2303](https://doi.org/10.6028/NIST.TN.2303).
- **Implementation recommendation:** the thermodynamic factor and these three peak references have usable foundations. Automatic application-efficiency presets do not. A future engine can expose ideal and explicitly assumed adjusted powers while leaving extinction prediction out of its mathematical contract. Updating MODEL §3.12's wording to distinguish `η_heat` from vaporized fraction should precede implementation; these notes do not themselves adopt that change. — [NIST water data](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm); [NISTIR 6191 mechanism discussion](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6191.pdf#page=11).

### Gaps

- **Peak versus sustained:** no averaging-window calculation, plateau-duration analysis, filtering-method audit or independent CSV reprocessing was performed. A sustained reference needs a declared interval and its own calculation; do not relabel any of these peaks as sustained.
- **Source versions:** live FCD experiment pages were last updated April 7, 2026 and identify process script `NFRL_Report_8.7.1`. TN 2303 is March 2025; use the live FCD summary numbers above rather than silently mixing report versions. The already-present cached TN PDF `/tmp/opencode/fire-NIST.TN.2303.pdf` was inspected for common test conditions; a fresh report download was not performed.
- **Metadata discrepancies:** Test029 description gives 57199.3 g whereas Table 3 gives 57.64 kg; Test038 description gives 31114 g whereas Table 3 gives 31.83 kg. This note quotes Table 3 as **initial gravimetric specimen mass** and preserves the detailed descriptions separately. Resolve fixture/accessory/metadata accounting before using these masses in a combustion calculation; no cause is assumed here. — [Test029 Tables 1 and 3](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test029); [Test038 Tables 1 and 3](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items/test038).
- The event tables do not provide a calorimetric water enthalpy balance, measured application rate, or a thermal efficiency for these three cases. Their late suppression events cannot calibrate η. No room-fire, ventilation-limited or FSRI HRR value is inferred from them.
