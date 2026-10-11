# Open questions and data gaps

This file collects issues that should remain explicit before the CGBVP 2019 manual is turned into simulator behavior.

Priority key:
- **P0** — resolve before treating the affected value as authoritative.
- **P1** — important for the first credible physical simulator.
- **P2** — useful refinement / later apparatus fidelity.
- **P3** — advanced/transient/visual realism.

---

# A. Apparent manual errors or internal inconsistencies

## P0 — Flow equation on p. 18
**Question:** Did the authors intend `Q` to be mass flow in the first equation, despite defining it as volumetric flow?

**Observed:** `Q=D×S×V`, followed by `Q=S×V` for water and volumetric units.

**Assessment:** likely source/transcription error or conceptual mixing of volumetric and mass flow.  
**Action:** never use density in volumetric-flow calculation.

---

## P0 — Residual pressure on p. 29
**Question:** Which sentence represents intended CGBVP terminology?

**Observed:** one sentence calls static-minus-flowing pressure “residual pressure”; following text calls the pressure remaining under flow residual pressure.

**Action:** use the latter/standard definition in the simulator and annotate the contradictory sentence.

---

## P0 — Water specific weight on p. 30
**Observed:** `9.81 N/m³`, but numerical relation requires `9.81 kN/m³`.

**Action:** treat as a unit typo; do not propagate into numerical data.

---

## P0 — 10 m water / 14.7 psi on p. 31
**Observed:** 10 m → 1 kg/cm² → 14.7 psi.

**Issue:** 10 m H₂O and 1 kgf/cm² are ~14.22 psi; 14.7 psi corresponds roughly to one atmosphere / 10.33 m H₂O.

**Action:** keep exact conversion in physical engine; compatibility documentation can show the manual approximation.

---

## P0 — Bernoulli equation on p. 35
**Observed:** right-side elevation term lacks density: `P2 + gh2 + ...`.

**Action:** classify as printed error; never use as solver equation.

---

## P0 — Elevation on p. 44
**Observed:** same page gives 1.4 and 1.5 psi per metre.

**Question:** Which value is used in actual current CGBVP instruction/exams?

**Action:** default compatibility behavior should follow the explicit quick-calculation table (1.5 psi/m) unless instructors confirm otherwise; retain 1.4 as a noted inconsistency.

---

## P0 — Cavitation rule on p. 51
**Observed:** inlet pressure must “always” be >0.5 bar / 7 psi.

**Issue:** impossible as a universal rule for drafting; cavitation depends on absolute pressure/NPSH.

**Question:** Was this rule intended only for hydrant-fed operation?

**Action:** ask current pump instructors and check apparatus manuals; do not use as physical criterion.

---

## P0 — p. 52 suction arithmetic
**Observed:** text 4.08 m and 7.08 m; figures 4.8 m and 7.8 m.

**Action:** figures/arithmetic are correct for the stated subtraction; tag text as error.

---

## P0 — Practical suction limit, p. 55 vs p. 62
**Observed:** 7.5 m practical maximum vs 6 m recommendation for most self-priming fire pumps.

**Question:** Are these from different source manuals/standards or intended for different equipment classes?

**Action:** do not choose one as universal. Physical mode needs NPSH and pump-specific limits.

---

## P0 — p. 57 phrase: vaporization “is an advantage for priming”
**Issue:** vapor pressure under vacuum opposes attainable lift and reduces NPSHA. The surrounding text itself says vaporization creates pressure opposing atmospheric action.

**Action:** likely wording error (“disadvantage” intended) or poorly phrased sentence. Confirm source if this lesson is reproduced.

---

## P0 — p. 71 50→80 psi flow increase
**Observed:** manual says +22%.

**Expected fixed-orifice scaling:** +26.5%.

**Action:** do not use 22% as an expected result without a specific nozzle curve proving it.

---

## P0 — p. 79 relay table pressure basis
**Observed:**
- table labels: 170 and 140 psi;
- first narrative claim: table based on 200 psi;
- next narrative claim: 185 and 200 psi.

**Action:** reconstruct from the original IFSTA/TEEX/reference source if the table will be used. Until then, mark it non-authoritative.

---

## P0 — p. 82 relay friction
**Observed:** 35 psi/15 m at 500 gpm in 2½"; 10 psi/15 m for two 2½" lines.

**Manual C=2 formula gives:** ~24.6 psi and ~6.15 psi respectively.

**Action:** likely copied values from a different coefficient/hose assumption or arithmetic source. Do not use as a regression oracle until provenance is found.

---

# B. Values that need current CGBVP operational confirmation

## P1 — Which calculations are actually taught/examined today?
The manual is dated August 2019, while the review is being done in 2026.

Collect from current DIGEFA/CGBVP instructors:
- current slide deck/workbook;
- exam formula sheet;
- accepted hose C values;
- accepted elevation rule (1.4 vs 1.5 psi/m);
- standard nozzle pressures taught;
- appliance-loss shortcuts;
- relay residual target;
- drafting/cavitation rules;
- whether the p.79 relay table is still used.

This determines what `cgbvp_2019` versus a future `cgbvp_current` mode should mean.

---

# C. Pump/apparatus data required

## P1 — Pump make/model per apparatus
For each modeled engine:
- manufacturer;
- pump model/serial family;
- rated capacity;
- single/two-stage configuration;
- gear/PTO ratio;
- governed/max pump RPM;
- factory or acceptance-test pump curve.

**Why:** a generic “150 psi/200 psi/250 psi” rating sequence is not a substitute for the actual head-flow curve.

Manufacturer example showing current curve/rating documentation:
- Hale: https://www.haleproducts.com/dsd
- Hale: https://www.haleproducts.com/mbp

## P1 — NPSH / drafting performance
Obtain if possible:
- NPSHR/NPSH3 vs flow;
- approved maximum lift at rated flow;
- suction diameter/length used for rating;
- strainer loss;
- maximum permissible intake vacuum;
- primer capability and maximum primer duty time.

**Why:** needed to replace 6 m/7.5 m and “7 psi intake” shortcuts with pump-specific behavior.

Hydraulic Institute reference:
https://datatool.pumps.org/pump-fundamentals/pump-principles

## P2 — Intake pressure limits
The manual says keep inlet below 70–80 psi.

**Need:** actual pump/manifold/plumbing maximum intake pressure for each apparatus.

## P2 — Two-stage / pressure-volume mode
For two-stage pumps:
- valve configuration;
- pressure vs volume curves in each mode;
- shift limits/procedure;
- whether modes can be represented by separate pump curves.

## P2 — Governor / relief valve behavior
Need:
- pressure governor response;
- RPM limits;
- relief-valve set point/response;
- behavior when outlets open/close;
- whether the simulation should model operator setpoint or engine RPM directly.

---

# D. Hose data required

## P1 — Actual hose inventory
For each commonly used hose:
- manufacturer/model;
- nominal size;
- actual inside diameter if available;
- length;
- construction/liner;
- service age/condition category;
- couplings.

## P1 — Friction-loss data
Priority evidence:
1. manufacturer pressure-loss chart;
2. station field-flow test;
3. calibrated Darcy-Weisbach parameters;
4. CGBVP generic coefficient only as fallback.

The manual C values (24, 15.5, 2, 0.8, 0.2) should be treated as a named calibration set, not universal properties of diameter.

## P2 — Kinks/bends/coupling effects
Decide whether:
- bends are purely visual with a coarse penalty;
- each sharp kink adds an empirical loss;
- hose routing geometry changes effective K dynamically.

This is more data-hungry than straight-hose friction and can wait.

## P2 — Suction hose collapse
Need vacuum/collapse rating for hard/soft suction hose and how partial collapse affects area/loss.

---

# E. Nozzle and monitor data required

## P1 — Nozzle catalog
For every nozzle:
- make/model;
- type: smooth bore / fixed fog / selectable / automatic;
- tip/orifice diameter;
- flow setting(s);
- rated pressure;
- Q-P curve;
- automatic operating range;
- pattern settings.

## P1 — Reaction-force data
Use manufacturer values where available; otherwise validated formulas.

TFT reference:
https://tft.com/understanding-your-nozzle-reaction/

## P2 — Reach and pattern
If realistic visual streams matter, obtain:
- horizontal/vertical reach vs pressure and flow;
- fog angle;
- effective range;
- manufacturer test method.

The manual itself warns the projectile-only model over-predicts real range because of drag/breakup.

---

# F. Appliance/component data required

## P1 — Pressure-loss curves
For:
- wyes/bifurcations;
- siamese;
- gated manifolds;
- reducers/adapters;
- master-stream devices/monitors;
- strainers;
- check valves;
- foam eductors;
- inline gauges/flowmeters if significant.

The manual's 5/10/40 psi values are training approximations.

Manufacturer example:
https://old.elkhartbrass.com/downloads.php?d=performance

## P2 — Valve position
For ball/gate/rotary valves, decide whether intermediate opening is:
- a discrete coarse state;
- a continuous K/opening curve;
- or unsupported until data are available.

---

# G. Hydrant / water-supply questions

## P1 — How should Lima/CGBVP hydrants be represented?
Potential evidence:
- municipal static/residual hydrant test;
- pipe network data from utility/industrial facility;
- measured source curve;
- simple fixed-head source if nothing else is available.

**Do not** treat a hydrant as a fixed maximum GPM independent of pressure.

## P1 — Minimum residual pressure policy
The manual uses 20 psi receiving residual in relay tables; NFPA 291 committee material also uses 20 psi as a common hydrant fire-flow reference.

Need to distinguish:
- water-distribution residual safety target;
- receiving pumper intake target;
- apparatus-specific minimum intake pressure;
- local utility/AHJ requirements.

NFPA report:
https://www.nfpa.org/api/files?path=%2Ffiles%2FAboutTheCodes%2F291%2F291_A2021_AUT_PRI_SRReport.pdf

---

# H. Environmental data for drafting

## P1 — Atmospheric pressure
Physical mode should accept:
- measured barometric pressure when available;
- otherwise altitude + standard atmosphere.

Do not use a linear 1.25 mH₂O/km law as the physical atmosphere at all elevations.

Standard-atmosphere reference:
https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf

## P1 — Water temperature
Use it to calculate vapor pressure and thus NPSHA.

IAPWS:
https://iapws.org/faqs/faq1

## P2 — Water density
For ordinary fireground ranges, constant density is usually adequate. If temperature-dependent NPSH/head conversions are modeled precisely, use temperature-dependent density consistently.

---

# I. Network-solver fit and missing fire-specific behavior

## P1 — What an EPANET-like solver can handle well
- pressurized pipes/hose;
- junction flow balance;
- elevations;
- reservoirs/tanks;
- pumps with curves;
- variable-speed pumps;
- valves;
- minor losses;
- pressure-dependent nozzle-like outflow;
- multiple simultaneous branches;
- relay-pump networks.

EPA: https://www.epa.gov/water-research/epanet

## P1/P2 — What requires custom apparatus extensions
- priming and air evacuation;
- suction air leaks;
- NPSH/cavitation checks;
- suction collapse;
- pump-stage switching;
- apparatus plumbing limits;
- engine/governor/relief control;
- pump-to-tank recirculation;
- thermal rise at churn/low flow;
- foam proportioning.

## P3 — What requires a transient model
- water hammer;
- fast valve closure/opening waves;
- pressure-wave reflections;
- elastic hose/pipe response.

Do not try to fake this by adding a fixed “water hammer psi” number to a steady-state result.

---

# J. Provenance questions

## P1 — Reconstruct source lineage
The manual's reference page lists:
- NFPA 1002;
- IFSTA *Fundamentals of Fire Fighter Skills* / fundamentals;
- TEEX pump operations;
- Fernando Bermejo Martín;
- Néstor Adolfo Botta;
- Elkhart Brass technical sheets.

Several inconsistencies suggest sections were compiled from different source systems, unit conventions, or editions.

High-value provenance work:
1. find the exact original source for the p.39 C coefficients;
2. find the exact source/table behind p.79 relay distances;
3. identify the standard behind p.65 “10 bar / 6 m lift / 8 m suction” nominal-flow convention;
4. identify source for p.57 suction-height vs capacity table;
5. identify the source/intent of the p.51 7 psi intake rule;
6. identify whether p.71 +22% is a transcription error.

This provenance work is more useful than trying to “average” conflicting manual values.

---

# K. Suggested next data-collection order

1. **Current CGBVP formula sheet/instructor confirmation** — determines compatibility requirements.
2. **Actual station pump make/model + performance curves** — biggest gain in physical fidelity.
3. **Actual nozzles and rated pressure/flow settings**.
4. **Hose make/model + field or manufacturer friction data**.
5. **Appliance pressure-loss data**.
6. **Hydrant static/residual flow tests or source curves**.
7. **Suction/NPSH/primer limits from pump manufacturer**.
8. **Governor/relief/two-stage behavior**.
9. Later: transients, heat, collapse, stream reach.

This order keeps the first physical simulator grounded in data that most strongly changes steady-state pressure/flow results.
