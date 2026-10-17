# CGBVP hydraulics manual — technical review for simulator design

**Manual reviewed:** Cuerpo General de Bomberos Voluntarios del Perú (CGBVP), Dirección General de Formación Académica, *Curso de Hidráulica aplicada a la lucha contra incendios*, 4th version, August 2019.

**Purpose of this review:** treat the manual as an important CGBVP training/compatibility reference, not as the sole source of physical truth. The simulator should preserve recognizable terminology and, where useful, a CGBVP-compatible calculation mode while using a technically defensible hydraulic model underneath.

**Review date:** 2026-10-01.

## Executive summary

The manual teaches a **steady/quasi-steady, one-dimensional fire-service hydraulics model** built around operator arithmetic:

- volumetric flow and continuity;
- pressure/head bookkeeping;
- ideal Bernoulli/Torricelli/Venturi concepts;
- hose friction using an empirical `C × (Q/100)^2 × (L/100)` rule;
- elevation as a fixed pressure-per-height rule;
- appliances as fixed pressure penalties;
- prescribed nozzle pressures and simple nozzle-reaction formulas;
- basic centrifugal-pump characteristic curves;
- generic suction-height, priming, and cavitation rules;
- relay/series-pumping planning tables.

That is a sensible **training abstraction**, and much of its qualitative operational logic is useful. It is not, however, a sufficiently consistent or general physical model for a simulator intended to solve arbitrary coupled networks. Several numerical or dimensional errors are visible in the text, and several operational shortcuts are stated too universally.

The strongest material to preserve for CGBVP compatibility is the manual's terminology, its hose-friction coefficient method, elevation quick rules, appliance-loss shortcuts, conventional nozzle pressure rules, pump-pressure bookkeeping, and relay-pumping exercises. The simulator's physical core should instead use mass/energy conservation, pressure-dependent outflows, flow-dependent component losses, actual pump curves, actual hose/appliance/nozzle data, and NPSH-based suction/cavitation checks.

The most important issues found are:

1. **Flow definition error, p. 18:** the manual inserts density into a volumetric-flow formula (`Q = D × S × V`) and later says volumetric flow is directly proportional to density. `ρAv` is mass flow; volumetric flow is `Av`.
2. **Residual-pressure contradiction, pp. 28–29:** one sentence calls the drop from static to flowing pressure “residual pressure,” while the following text correctly treats residual pressure as the pressure remaining under flow.
3. **Specific-weight unit error, p. 30:** it prints water specific weight as `9.81 N/m³`; the numerical calculation that follows only makes sense for about `9.81 kN/m³`.
4. **Head conversion inconsistency, p. 31:** 10 m water is equated to both `1 kg/cm²` and `14.7 psi`; 10 m H₂O is about 14.22 psi, not 14.7 psi.
5. **Bernoulli equation typo/error, p. 35:** the rendered equation omits `ρ` from the gravitational term on the right-hand side, making the printed equation dimensionally inconsistent.
6. **Elevation rule inconsistency, p. 44:** the page mentions 1.4 psi/m and then instructs use of 1.5 psi/m. Exact hydrostatic value for water near ordinary temperature is about 1.42 psi/m.
7. **Fixed appliance losses, p. 45:** useful training shortcuts, but actual losses vary with flow and component geometry/position.
8. **Hydrant/cavitation terminology, pp. 49–53:** supply starvation, de-priming, and cavitation are partially conflated; the later vapor-pressure explanation is materially better than the earlier shorthand.
9. **Universal 7 psi inlet rule, p. 51:** “always above 0.5 bar / 7 psi” cannot be a universal cavitation criterion and is incompatible with normal drafting operation. Cavitation risk is fundamentally an absolute-pressure/NPSH problem.
10. **Arithmetic errors, p. 52:** `10.8 − 6` is printed as 4.08 m in text while the figure shows 4.8 m; `10.8 − 3` is printed as 7.08 m while the figure shows 7.8 m.
11. **Suction-height inconsistency, pp. 55 and 62:** one section presents 7.5 m as a practical maximum; another says most self-priming fire pumps should not exceed 6 m. Neither is a universal physical limit.
12. **Nozzle-flow example error, p. 71:** for a fixed orifice, raising pressure from 50 to 80 psi gives about +26.5% flow under `Q ∝ √P`, not +22%.
13. **Relay table/text inconsistency, p. 79:** table headings show 170/140 psi, while adjacent text says the table is based on 200 psi and later 185/200 psi.
14. **Relay worked-example mismatch, p. 82:** the stated friction figures (35 psi/15 m for 500 gpm through 2½", and 10 psi/15 m for two parallel 2½" lines) do not agree with the manual's own `C=2` hose-friction formula.

---

# 1. What hydraulic model the manual actually teaches

The manual is not a network solver. It is best understood as a **fireground pump-operator worksheet model**:

1. Pick a desired nozzle flow/pressure.
2. Compute or look up hose friction.
3. Add/subtract elevation pressure.
4. Add fixed appliance/component losses.
5. Set pump discharge pressure to satisfy the sum.
6. For supply/drafting, stay within practical suction and intake-pressure rules.
7. For relay pumping, use tables and maintain a residual intake pressure.

This can be summarized by the manual's pressure equation on p. 31:

`PB = PP + PF ± PE + PS`

where `PB` is pump pressure, `PP` nozzle/outlet pressure, `PF` friction loss, `PE` elevation pressure, and `PS` system/component loss.

This is useful for a **single dominant flow path** and for operator arithmetic. It does not intrinsically solve branching networks, simultaneous outlets whose flows depend on pressure, feedback between supply and demand, variable valve positions, nonlinear pump/system intersections, or NPSH constraints.

**Classification:** reasonable fireground approximation.

**Compatibility recommendation:** preserve as a CGBVP/training calculation view, not as the simulator's internal conservation law.

**Simulator implication:** a physical solver can still expose the same terms as an explanation layer: “required pump pressure = nozzle requirement + hose loss + elevation + component loss,” even when those values arise from a coupled network solution rather than from a one-pass sum.

---

# 2. Flow / caudal and continuity

## MANUAL

### Page 18
The manual defines caudal as the quantity of liquid flowing per unit time. It prints:

- `Q = D × S × V`
- for water, because density is treated as 1: `Q = S × V`
- for a circular cross-section: `Q = 0.785 d² V`

It also states that caudal is directly proportional to density, section, and velocity.

### Pages 33–34
It presents continuity as conservation of mass and, for the same incompressible liquid:

`Q1 = Q2  =>  S1 v1 = S2 v2`

It explains that a smaller section produces a larger mean velocity at the same flow.

## TECHNICAL ASSESSMENT

The continuity concept on pp. 33–34 is **physically sound** for steady incompressible flow.

The p. 18 density treatment is **incorrect/misleading** as written:

- volumetric flow is `Q = A v`;
- mass flow is `ṁ = ρ A v`.

The manual defines `Q` in volumetric units (L/min, L/s, m³/s), so density should not appear in that equation. Setting water density numerically to “1” hides the dimensional error rather than fixing it.

The circular-section expression `Q = (π/4)d²v ≈ 0.785 d²v` is sound if units are mutually consistent.

## EXTERNAL VERIFICATION

EPA EPANET models conservation of flow at network junctions and solves for network heads/flows iteratively rather than assuming a fixed flow along every physical hose path. Its hydraulic engine uses continuity and energy equations [E1, E2].

## COMPATIBILITY RECOMMENDATION

- `Q = Av`: **suitable as core physical behavior**.
- `Q = ρAv` while calling `Q` volumetric flow: **should not be implemented as written**.
- Preserve the manual wording/notation only in a documentation layer if needed; avoid propagating its density error into code or tests.

## SIMULATOR IMPLICATION

Use explicit unit-typed quantities where possible:

- volumetric flow `Q` in L/min, gpm, or m³/s;
- density `ρ` in kg/m³ only when converting to mass flow, momentum, force, or energy.

At branches, enforce `ΣQ_in = ΣQ_out` (plus/minus storage/demand terms), rather than saying “the flow remains constant through the whole hose system” when the system can branch.

---

# 3. Pressure, head, static/dynamic/residual terminology

## MANUAL

### Pages 19–20
Pressure is defined correctly as force per unit area, `P = F/S`. The manual distinguishes gauge pressure from absolute pressure and gives atmospheric pressure near sea level as about 101.3 kPa / 14.7 psi.

The p. 19 conversion table ends with a very approximate mnemonic:
`1 atm = 1 bar = 1 kg/cm² = 10 mca = 100 kPa`.

### Pages 27–29
It introduces atmospheric, normal, static, velocity/dynamic, and residual pressure.

On p. 29 it first says the **difference** between the initial and flowing pressure is “presión residual.” The following sentences instead describe residual pressure as the portion of pressure **remaining while water flows**.

### Pages 30–31
The hydrostatic relation is presented as:

`p = ω h`

Then the manual prints water specific weight as `9.81 N/m³` and derives `p = 9.81 h` for p in kPa and h in m. It also uses:
- `1 mca ≈ 0.1 kg/cm²`;
- 10 m water ≈ `1 kg/cm²`;
- and then labels that as `14.7 psi`.

## TECHNICAL ASSESSMENT

- `P=F/A`, gauge vs absolute pressure, and `p=ρgh`: **physically sound**.
- The p. 30 specific-weight unit is an **apparent ×1000 unit error**. Water's specific weight is about 9.81 **kN/m³**, not 9.81 N/m³. The subsequent kPa-per-metre relation is numerically consistent with kN/m³.
- The p. 31 `14.7 psi` value is an **apparent numerical conflation**. About 10.33 m H₂O corresponds to one standard atmosphere (~14.7 psi); 10.00 m H₂O is about 14.22 psi.
- The p. 29 residual-pressure definition is **internally inconsistent**. In fire-flow practice, residual pressure is the pressure measured while water is flowing; static minus residual is the pressure drop associated with the flow condition.

## EXTERNAL VERIFICATION

NFPA 291 committee material uses “residual pressure” as the pressure maintained at the hydrant while delivering fire flow and commonly uses 20 psi as a rating/reference residual pressure [E8].

## COMPATIBILITY RECOMMENDATION

- Keep `static pressure`, `residual pressure`, and `velocity pressure` in the UI because firefighters will recognize them.
- Define residual pressure unambiguously as **pressure remaining under flow**.
- If a CGBVP lesson reproduces the wording from p. 29, explicitly flag the inconsistent sentence rather than changing the quotation.
- Use exact unit conversions in the physical engine; any “1 bar ≈ 1 kg/cm² ≈ 10 mca” mnemonic should be an instructional approximation only.

## SIMULATOR IMPLICATION

Internally represent hydraulic head and pressure with explicit conversion. A network solution can display:

- static pressure: solved with all relevant outlets closed / zero demand;
- residual pressure: solved with specified flow demands/outlets active;
- pressure drop: static minus residual at the measurement point;
- velocity head: `v²/(2g)`.

---

# 4. Bernoulli, Torricelli and Venturi

## MANUAL

### Pages 34–35
The manual describes Bernoulli as conservation of mechanical energy for an ideal fluid.

On the rendered p. 35, the printed equation is:

`P1 + ρgh1 + ½ρv1² = P2 + gh2 + ½ρv2²`

The right-hand gravitational term is missing `ρ`.

It then derives/uses Torricelli for a large tank discharging to atmosphere:

`v = √(2gh)`

with assumptions that the free-surface velocity is negligible and pressures at the free surface and outlet are atmospheric.

### Pages 36–37
A constriction is described as increasing velocity and reducing static pressure; this is linked to the Venturi effect and foam eductors.

## TECHNICAL ASSESSMENT

The conceptual Bernoulli/Torricelli material is **physically sound in its stated idealized regime**.

The p. 35 equation is **incorrect as printed** because its terms have inconsistent dimensions. The correct energy-per-volume form requires `ρgh` on both sides. This looks like a typographical/transcription error rather than evidence that the authors intended different physics.

The Venturi explanation is **reasonable but simplified**. A diffuser can recover some static pressure after a throat, but real devices have irreversible losses; pressure is not completely “restored.”

## EXTERNAL VERIFICATION

EPA EPANET's steady-state hydraulic model is built around conservation of energy/head with explicit friction and minor-loss terms, which is the appropriate extension of ideal Bernoulli to real network links [E1, E2].

## COMPATIBILITY RECOMMENDATION

- Bernoulli/Torricelli concepts: **suitable as core physical behavior**, with the correct equation.
- The p. 35 printed equation: **should not be implemented as written**.
- Venturi/eductor behavior: use device-specific pressure-loss/induction curves where the simulator needs quantitative realism.

## SIMULATOR IMPLICATION

The physical model should treat each link/component as an energy relation:

`H_up - H_down = h_loss(Q)`,

with pumps contributing head rather than consuming it. This generalizes the manual's bookkeeping without tying the architecture to its formulas.

---

# 5. Hose friction

## MANUAL

### Page 39
The manual uses:

`PF = C × (gpm/100)² × (ft/100)`

or equivalently with normalized variables:

`PF = C × Q² × L`

where its `Q` and `L` are hundreds of gpm and hundreds of feet.

The listed C coefficients are:

| Nominal hose | C |
|---|---:|
| 1½" | 24 |
| 1¾" | 15.5 |
| 2½" | 2 |
| 3" | 0.8 |
| 4" | 0.2 |

### Pages 40–42
The manual tabulates friction loss in psi for combinations of flow and length. The length column is in metres, while the formula is based on 100 ft; the tables effectively use the fire-service approximation 30 m ≈ 100 ft.

## TECHNICAL ASSESSMENT

This is a **reasonable fireground approximation** and is valuable for compatibility. It captures two dominant trends:

- loss increases approximately with length;
- loss increases strongly with flow (quadratically in this rule).

It should not be treated as universal hose physics. Real hose loss depends on:

- actual internal diameter, not just nominal size;
- liner/roughness and construction;
- deformation under pressure;
- age/condition;
- couplings, kinks and bends;
- water viscosity/temperature;
- Reynolds number and flow regime.

The quadratic exponent is a convenient empirical fire-service approximation. A Darcy-Weisbach model is more physically general, while manufacturer/tested Δp–Q curves can be more accurate for a particular hose assembly.

## EXTERNAL VERIFICATION

EPA EPANET supports Darcy-Weisbach, Hazen-Williams, and Chezy-Manning pipe head-loss formulas; its documentation identifies Darcy-Weisbach as the general physics-based option across fluids and flow regimes [E1, E2]. Manufacturer pressure-loss data should supersede generic coefficients for known equipment.

## COMPATIBILITY RECOMMENDATION

- Manual C values: **suitable as optional CGBVP/training mode** and as fallback defaults when nothing better is known.
- Core physics: **replace with empirical equipment data when available**, otherwise use a general head-loss relation with calibrated diameter/roughness.

## SIMULATOR IMPLICATION

Represent hose loss as a pluggable/calibratable `ΔH(Q)` relation. One implementation can reproduce the CGBVP formula exactly; another can use Darcy-Weisbach or measured curves. Do not bake the manual's coefficient table into the topology model.

---

# 6. Elevation

## MANUAL

### Page 44
The page first states `(1.4 por cada metro de altura)`, then gives the calculation rule:

- 1 m elevation = 1.5 psi;
- 10 m elevation = 15 psi;
- one floor = 5 psi.

Downhill elevation is treated as a pressure gain.

## TECHNICAL ASSESSMENT

The physical principle is **sound**. The numerical rules are **training approximations**.

For fresh water near ordinary conditions:

`ΔP = ρgΔz ≈ 1.422 psi per metre`

Therefore:

- 1.4 psi/m is close (about −1.6%);
- 1.5 psi/m is deliberately conservative/high (about +5.5%);
- “5 psi per floor” implicitly assumes a floor-to-floor height around 3.3–3.5 m and is not a physical constant.

The coexistence of 1.4 and 1.5 on the same page is an internal inconsistency.

## COMPATIBILITY RECOMMENDATION

- Exact `ρgΔz`: **suitable as core physical behavior**.
- 1.5 psi/m and 5 psi/floor: **suitable as optional CGBVP/training mode**.
- 1.4 psi/m can be shown as another quick approximation, but the simulator should not silently switch between them.

## SIMULATOR IMPLICATION

Store actual node elevations and calculate head differences. If a training scenario specifies “floors” rather than elevations, let the scenario define floor height or explicitly invoke the CGBVP 5 psi/floor shortcut.

---

# 7. Appliance / component losses

## MANUAL

### Page 45
The manual assigns fixed losses:

- valves, wyes/bifurcations and reducers: 5 psi;
- monitor nozzle: 10–25 psi;
- siamese: about 10 psi;
- foam eductor: about 40 psi;
- sharp hose bends are also listed as loss sources.

## TECHNICAL ASSESSMENT

These are **reasonable fireground approximations** for quick calculations, but **not physically general**.

For a fixed component geometry, minor loss is normally related to velocity head:

`h_L = K v²/(2g)`

or expressed by a measured `ΔP(Q)` curve. Valve position, port diameter, branch flow split, device model, and internal geometry matter. A fixed 5 psi loss implies the same loss at 50 gpm and 1000 gpm, which cannot be a general physical law.

## EXTERNAL VERIFICATION

Elkhart Brass publishes product-specific pressure-loss performance documents for components, illustrating that real appliance losses are treated as flow-dependent performance data rather than a single universal penalty [E5].

## COMPATIBILITY RECOMMENDATION

- Fixed losses: **suitable as optional CGBVP/training mode** or as coarse defaults.
- Physical mode: **replace with empirical equipment data when available**; otherwise use a K coefficient or a calibrated curve.

## SIMULATOR IMPLICATION

Each fitting/appliance should be able to expose a `ΔP(Q, state)` relation. For a valve, `state` includes opening. For a manifold/wye, loss can depend on branch configuration and branch flows.

---

# 8. Nozzles: flow, operating pressure and reaction

## MANUAL

### Page 46 — reaction
At 100 psi, the manual gives a fog-nozzle shortcut: reaction in kg is approximately 24% of gpm. Its example is 250 gpm → 60 kg.

For smooth bore:

`NR = 1.57 × d² × NP`

where NR is lbf, d is tip diameter in inches, and NP is nozzle pressure in psi.

### Pages 71–72 — nozzle behavior
The manual correctly notes that a fixed orifice does **not** produce a truly fixed flow independent of pressure. It says changing pressure from 50 to 80 psi increases flow by 22%.

It distinguishes fixed-flow, selectable/variable-flow and automatic nozzles. For automatic nozzles, it describes an internal mechanism that maintains a relatively constant pressure over a flow range.

It gives general pressure rules:
- handline smooth bore: 50 psi;
- master stream smooth bore: 80 psi;
- combination/fog: 100 psi.

## TECHNICAL ASSESSMENT

The smooth-bore reaction formula is **physically sound as a standard fire-service engineering relation** within its assumptions.

The fog “24% of gpm in kg at 100 psi” rule is a **reasonable quick approximation**. Using the standard formula `NR = 0.0505 Q√NP` gives 126.25 lbf = about 57.3 kgf for 250 gpm at 100 psi, compared with the manual's 60 kg.

The fixed-orifice pressure/flow concept is correct, but the 50→80 psi “+22%” example is an **apparent numerical error**. For a fixed discharge coefficient and area:

`Q ∝ √P`

so the ratio is `√(80/50) = 1.2649`, or about **+26.5%**.

The 50/80/100 psi nozzle pressures are **traditional defaults, not universal device physics**. Modern nozzles are manufactured for multiple operating pressures.

## EXTERNAL VERIFICATION

Task Force Tips publishes:
- smooth-bore reaction `NR = 1.57 D² NP`;
- fog/combination reaction `NR = 0.0505 GPM √NP` [E4].

EPA EPANET represents an orifice/nozzle emitter as `q = C p^γ`, with a typical nozzle/sprinkler exponent `γ = 0.5` [E2]. This is a natural generic relation for fixed-orifice discharge.

## COMPATIBILITY RECOMMENDATION

- Smooth-bore reaction formula: **suitable as core physical behavior** with clear units.
- 24% fog shortcut: **suitable as optional CGBVP/training mode** at 100 psi.
- Traditional nozzle pressures: **suitable only as defaults/approximations**.
- Actual nozzle flow/pressure curve: **replace with manufacturer data when available**.
- p. 71 +22% example: **should not be implemented as written**.

## SIMULATOR IMPLICATION

Nozzles should be pressure-dependent terminal components. Different nozzle classes need different relations:

- smooth bore / fixed orifice: `Q ≈ Cd A√(2ΔP/ρ)`;
- fixed-flow fog: manufacturer `Q(P)` or calibrated coefficient;
- selectable flow: relation changes with setting;
- automatic nozzle: device-specific pressure-regulating curve and min/max operating range.

Nozzle reaction can be derived from flow/momentum or standard validated formulas.

---

# 9. Hydrant / pressurized supply

## MANUAL

### Pages 48–49
The manual states:

- hydrant pressure falls as demanded flow increases;
- longer supply hose increases loss;
- a hydrant has a flow limit and “maximum flow is obtained at zero outlet pressure”;
- over-demanding the supply can create damaging low intake conditions.

It advises keeping pump inlet pressure below about 70–80 psi where high hydrant pressure could damage pump components.

It reproduces an Elkhart Brass discharge table and:

`GPM = 29.83 × C × D² × √p`

with usual `C = 0.9`, D in inches, and pitot pressure p.

## TECHNICAL ASSESSMENT

The flow-versus-pressure behavior of a hydrant/supply network is **physically sound in concept**: residual pressure falls as flow demand rises because upstream system losses grow.

“Maximum flow at zero outlet pressure” is a **theoretical extrapolation**, not a recommended operating point or a sufficient physical description of a municipal network. A real water system has network constraints, minimum acceptable residual pressure, possible main collapse/contamination risks, and upstream source/pump/tank limits.

The 70–80 psi maximum intake statement is **apparatus-specific**. It should not be applied universally without pump/manifold manufacturer limits.

The pitot/orifice equation is a useful field-flow relation but should not be confused with a full hydrant-system model.

## EXTERNAL VERIFICATION

NFPA 291 committee material recommends hydrant flow ratings at a residual pressure of 20 psi when static pressure is above 40 psi and warns about negative main pressure and back-siphonage [E8].

Elkhart Brass publishes the familiar smooth-bore/orifice relationship `GPM = 29.71 d²√NP` for smooth bore discharge [E5]; this supports the manual's general pitot/orifice structure while not validating a universal `C=0.9` for every hydrant outlet.

## COMPATIBILITY RECOMMENDATION

- Hydrant residual-pressure concept: **suitable as core behavior**.
- Zero-pressure “maximum” as an operational target: **should not be implemented as written**.
- 70–80 psi intake ceiling: **requires apparatus-specific verification**.
- Manual Elkhart table: may be retained for a training calculator, but the physical network should use actual system data/curves.

## SIMULATOR IMPLICATION

A hydrant can be modeled at increasing fidelity as:

1. fixed head/pressure source with a supply hose;
2. source with a measured static/residual flow-test curve;
3. boundary node connected to a municipal network model.

Avoid representing every hydrant as a fixed-GPM source.

---

# 10. Priming, drafting, suction height and cavitation

## MANUAL

### Pages 47–50
The manual explains that a centrifugal pump and suction line must be primed so the impeller is in contact with water. It describes atmospheric pressure pushing water into a reduced-pressure pump/suction line.

It states a typical primer can create about −0.8 bar and therefore lift water about 8 m. It also states a primer should not run more than 45 s.

### Page 51
Cavitation is described as occurring when discharge demand exceeds what can enter, causing low pressure and vapor formation. It says inlet pressure should **always** remain above 0.5 bar / 7 psi.

It also mentions possible cavitation/recirculation-related problems at very low discharge flow.

### Pages 52–53
The explanation becomes more physically precise: dynamic intake pressure is reduced by acceleration/velocity effects, suction-line loss, entrance loss, and high flow. Cavitation can occur when local pressure at the impeller becomes lower than water vapor pressure; bubbles subsequently collapse in higher-pressure regions.

### Pages 54–58
The manual gives:
- theoretical maximum lift at sea level under ideal conditions: 10.33 m;
- practical maximum: 7.5 m (p. 55);
- p. 62 later: for most self-priming fire pumps, lift should not exceed 6 m and suction hose length 10 m;
- vapor-pressure effects: 10.08 m theoretical maximum at 20 °C; 9.03 m at 50 °C;
- altitude correction: subtract 1.25 m water head per 1000 m elevation, `H_altitud = 1.25 Z` for Z in km.

## TECHNICAL ASSESSMENT

The atmospheric-pressure explanation and the later vapor-pressure mechanism are **substantially correct**.

The manual's p. 51 “always >7 psi inlet” statement is **questionable/incorrect as a universal cavitation criterion**. A drafting pump normally operates with intake gauge pressure below atmospheric (a vacuum reading); what matters at the impeller is **absolute** pressure relative to vapor pressure and the pump's NPSH requirement.

The 10.33 m ideal atmospheric head at standard sea-level pressure is a sound theoretical upper bound before vapor pressure and losses. The 7.5 m and 6 m figures are **practical rules, not universal limits**, and they conflict with one another.

The temperature effect is qualitatively correct. At 25 °C, IAPWS gives water vapor pressure around 3.17 kPa; at 50 °C about 12.35 kPa [E6]. This directly reduces NPSH available.

The linear altitude rule is a **rough approximation**. Standard atmosphere pressure is nonlinear with altitude [E7]. Using the standard atmosphere:
- at 1500 m, atmospheric head is about 8.62 m H₂O before subtracting vapor pressure, versus the manual's ~8.43 m;
- at 4000 m, about 6.29 m H₂O, versus the manual's 5.33 m.
The manual rule becomes increasingly conservative/inaccurate at high altitude.

Page 52 contains clear arithmetic/text errors:
- `10.8 − 6 = 4.8`, not 4.08;
- `10.8 − 3 = 7.8`, not 7.08.
The diagrams themselves show 4.8 and 7.8 m.

## EXTERNAL VERIFICATION

Hydraulic Institute defines:

`NPSHA = total suction head absolute − vapor-pressure head`

and treats NPSHR/NPSH3 as pump characteristics dependent on flow, speed and pump design. Cavitation can occur when local pressure falls below vapor pressure; adequate margin above published NPSHR is recommended [E3].

IAPWS provides water vapor pressure versus temperature [E6]. Standard-atmosphere references provide pressure versus altitude [E7].

## COMPATIBILITY RECOMMENDATION

- Atmospheric lift and vapor-pressure concepts: **suitable as core physical behavior**.
- 10.33 m ideal sea-level value: **suitable as conceptual limit**, not an operating limit.
- 7.5 m / 6 m practical lifts: **suitable only as training defaults**, and should be tagged with their source.
- 1.25 m/km altitude correction: **suitable as optional CGBVP/training mode**.
- universal 7 psi intake rule: **should not be implemented as a cavitation law**.
- primer −0.8 bar and 45 s: **requires equipment/manufacturer verification**.

## SIMULATOR IMPLICATION

For physical drafting/cavitation behavior, eventually calculate:

`NPSHA = (P_atm/ρg) + static_suction_head − suction_losses − (P_vapor/ρg)`

using absolute pressure, temperature, altitude/weather pressure, suction line losses, and pump inlet geometry, then compare to the pump's manufacturer NPSHR/NPSH3 curve plus a chosen margin.

This is a custom apparatus/suction constraint layered on top of a steady network model; a generic pressure-network solver alone does not know a fire pump's priming system, NPSHR, hard-suction collapse, strainer blockage, or air leaks.

---

# 11. Centrifugal pumps and characteristic curves

## MANUAL

### Pages 59–65
The manual states that a pump adds energy to the fluid and focuses on centrifugal pumps. It describes the impeller, volute/diffuser, multistage arrangements, and variable-speed operation.

Page 64 correctly introduces the pump characteristic curve as a flow-versus-pressure/head relationship. It notes that variable-speed pumps have a family of curves and that higher speed can deliver more head at the same flow or more flow at the same head.

Page 65 states a convention for nominal fire-pump flow at 10 bar discharge pressure while drafting at 6 m geometric lift through 8 m of suction hose with a strainer.

## TECHNICAL ASSESSMENT

The use of **pump characteristic curves** is one of the manual's strongest simulator-relevant concepts and is **physically sound**.

Saying a centrifugal pump operates by “centrifugal force” is acceptable training shorthand, though turbomachinery analysis is more accurately based on angular-momentum/energy transfer from the impeller.

The p. 65 “nominal flow convention” may correspond to a particular testing/standard context; it should **not be generalized across every CGBVP apparatus without identifying the governing pump standard and actual model**.

## EXTERNAL VERIFICATION

EPA EPANET supports constant- and variable-speed pumps and head-flow pump curves [E1, E2]. Current Hale fire-pump product pages publish model-specific performance curves and rating charts, demonstrating the correct evidence hierarchy for a specific apparatus [E9].

NFPA 1911 committee material includes a fire-pump test sequence at 100% rated flow/150 psi, 70%/200 psi, and 50%/250 psi [E10]. The manual later repeats those points in the relay-pumping section. These are **rating/test points**, not a substitute for the entire pump curve.

## COMPATIBILITY RECOMMENDATION

- Pump curves: **suitable as core physical behavior**.
- Generic manual curve: explanatory only.
- Actual apparatus: **replace with manufacturer/tested pump curves when available**.
- P. 65 nominal convention: **requires further verification** before it is used as a rating rule.

## SIMULATOR IMPLICATION

The pump should add head according to a selected curve and operating speed. A physically useful apparatus model will eventually need at least:
- pump head-flow curves at one or more speeds;
- gear/rpm relationship or governed speed behavior;
- stage/pressure-mode configuration for two-stage pumps;
- efficiency/power curve if engine loading/thermal behavior matters;
- NPSHR/NPSH3 if drafting/cavitation matters.

---

# 12. Water hammer

## MANUAL

### Pages 37–38 and 75
The manual describes water hammer as a pressure wave caused by a rapid change in flow velocity. It warns that sudden valve/nozzle closure can damage hose, valves or fittings and recommends gradual closure. It notes hose elasticity can reduce the pressure spike.

## TECHNICAL ASSESSMENT

The operational warning is **physically sound**.

The explanation that velocity pressure simply “turns into static pressure” is **intentionally simplified**. True water hammer is a transient wave phenomenon governed by fluid compressibility, conduit/hose wall elasticity, wave speed, closure time, reflections and network boundaries.

## COMPATIBILITY RECOMMENDATION

- Slow-closing operational behavior: preserve.
- Do not estimate water-hammer peak pressure using only the manual's static bookkeeping.
- If transients are later simulated, use a transient hydraulic model or validated transient approximation.

## SIMULATOR IMPLICATION

Steady-state EPANET-like solving is not enough for water hammer. Treat transient hydraulics as a later separate capability, as the project plan already anticipates.

---

# 13. Hose construction and connections

## MANUAL

### Pages 66–69
The manual distinguishes attack/supply hose types, soft suction from pressurized sources, and hard suction for open-water drafting. Nominal hose size refers to internal diameter. It describes threaded and Storz couplings.

## TECHNICAL ASSESSMENT

This is mostly **operationally sound descriptive material**. For numerical simulation, nominal size is not enough to determine loss accurately.

## COMPATIBILITY RECOMMENDATION

Preserve terminology and common nominal sizes. For actual physical behavior, collect:
- measured/actual internal diameter;
- length;
- material/liner;
- pressure rating;
- suction/vacuum rating;
- measured friction curve;
- coupling type and any significant fitting loss.

## SIMULATOR IMPLICATION

The hose domain object should distinguish nominal specification from hydraulic calibration data. Hard suction may later need a structural/collapse limit that an ordinary pressurized-pipe model does not supply.

---

# 14. Stream reach

## MANUAL

### Pages 76–77
The manual explicitly acknowledges that stream reach depends on nozzle angle, air resistance, wind, breakup/dispersal and nozzle design, and says manufacturers obtain reach data through standardized testing. It then presents a vacuum/projectile approximation for teaching.

## TECHNICAL ASSESSMENT

The manual's own caveat is correct. A ballistic parcel model is **useful pedagogically but insufficient for realistic stream reach** because a water jet breaks up and is strongly affected by aerodynamic drag and droplet size.

## COMPATIBILITY RECOMMENDATION

- Ballistic trajectory: optional teaching visualization.
- Real nozzle reach: **replace with manufacturer/test data when available**.
- Avoid tying hydraulic network correctness to visual stream-range correctness; they are different modeling problems.

---

# 15. Relay / series pumping

## MANUAL

### Pages 78–80
Relay pumping is described as successive pumpers adding pressure along a long supply line. The manual correctly identifies flow, hose diameter/number, distance and elevation as the main planning variables.

The p. 79 table specifies a 20 psi receiving residual pressure, with distances for 2½" and 3" hose combinations.

However, the same page is internally inconsistent:
- the table headings show pump pressures of **170 psi** and **140 psi** for different flow rows;
- text immediately below says the table is based on **200 psi** for 2½" and 3" hose;
- the next paragraph says it is based on **185 and 200 psi**.

It also states all fire apparatus can deliver rated flow at 150 psi, 70% at 200 psi and 50% at 250 psi.

### Page 80
“Equation U” estimates the number of pumpers as:

`distance of relay / table distance + 1`

rounded upward.

### Page 82
For 500 gpm through one 2½" line, it says pumpers are needed about every 60 m at 150 psi and gives friction as **35 psi/15 m**. For two parallel 2½" lines, it gives **10 psi/15 m** and says spacing can be four times greater.

## TECHNICAL ASSESSMENT

Relay pumping as a sequence of pump/head additions and hose losses is **physically sound**.

The “four times farther with two equal parallel lines at the same total flow” concept follows directly from the manual's `Q²` hose-loss rule: each line carries half the flow, so each line's friction loss per unit length is one quarter.

The p. 79 pressure basis is **too internally inconsistent to use as authoritative data without reconstruction**.

The p. 82 parenthetical friction values are inconsistent with the manual's own `C=2` formula:
- 500 gpm, 2½", 15 m: about 24.6 psi using the exact 15 m conversion, or ~25 psi using 15 m ≈ 50 ft, not 35 psi;
- two lines carrying 250 gpm each, 15 m: about 6.15 psi, not 10 psi.

The 150/200/250 psi rating points are recognizable standardized fire-pump test/rating points, but the phrase “all apparatus” is overly broad; actual pump capability remains pump-specific.

## EXTERNAL VERIFICATION

NFPA 1911 committee material specifies a test sequence of rated flow at 150 psi, 70% rated flow at 200 psi, and 50% rated flow at 250 psi for applicable fire pumps [E10].

## COMPATIBILITY RECOMMENDATION

- Relay topology and 20 psi receiving-residual teaching goal: **suitable as optional CGBVP/training behavior**.
- Table p. 79: **requires further verification** before use as a regression oracle.
- P. 82 numerical loss parentheticals: **should not be implemented as expected results**.
- Physical mode should simply solve each supply segment + pump curve + intake constraint; spacing then emerges from the solution.

---

# 16. What maps naturally to a modern network solver

A general steady-state hydraulic solver such as EPANET maps well to:

| Manual concept | General hydraulic representation |
|---|---|
| Static source / open water | Reservoir/fixed-head boundary |
| Apparatus tank | Finite storage tank / time-varying volume |
| Supply/attack hose | Pipe/link with head-loss law |
| Hose friction C rule | Alternative empirical `h(Q)` law |
| Elevation | Node elevation / hydraulic head |
| Wye/manifold/tee | Junction + component losses |
| Fixed valve | Minor-loss link / valve relation |
| Variable valve | State-dependent loss / control valve |
| Fixed-orifice nozzle | Pressure-dependent emitter/orifice |
| Pump | Pump head-flow curve |
| Variable pump speed | Pump curve + speed setting |
| Relay pumping | Multiple pumps in network |
| Hydrant | Fixed head, measured system curve, or municipal network boundary |
| Simultaneous discharges | Coupled network solution |

EPA EPANET explicitly supports reservoirs, tanks, pipes, pump curves, variable-speed pumps, valves, minor losses, pressure-dependent demands and emitter outflows [E1, E2].

## What still needs custom fire-apparatus modeling

Even with a network solver, the project will need custom logic/data for:

- priming sequence and primer capability;
- air leaks in suction;
- NPSH / cavitation margin and pump-specific NPSHR;
- hard-suction collapse/structural limits;
- suction strainers and partial obstruction;
- pump stage/pressure-volume configuration;
- engine/PTO RPM and governor behavior;
- apparatus intake/discharge pressure limits;
- pump recirculation/heat at very low flow or churn;
- tank-to-pump and pump-to-tank plumbing;
- finite onboard tank depletion/refill logic;
- foam eductor/proportioner behavior if modeled;
- nozzle-specific automatic-regulation mechanics;
- transient water hammer;
- realistic jet breakup/reach.

---

# 17. Final perspective — explicit answers

## 1. How technically reliable is the manual overall for practical firefighter hydraulics?

It is **useful and recognizable as a practical training manual**, especially for operator concepts, arithmetic workflow, common terminology, hose-friction shortcuts, elevation, nozzle reaction, pump curves and relay planning.

It is **not reliable enough to be the simulator's physical specification**. Several equations/units/numerical examples contain apparent errors, and some equipment-dependent operating limits are written as generic rules. Its strongest value is operational/training compatibility rather than engineering completeness.

## 2. Which parts are most useful to preserve for CGBVP compatibility?

Preserve, preferably as an explicit compatibility/training layer:

- pressure/flow terminology used by CGBVP;
- `PB = PP + PF ± PE + PS` explanatory decomposition;
- hose C coefficients and 30 m/100 ft style tables;
- 1.5 psi/m and 5 psi/floor quick elevation rules;
- fixed appliance-loss shortcuts;
- traditional 50/80/100 psi nozzle-pressure assumptions;
- nozzle-reaction teaching formulas/shortcuts;
- 10.33 m ideal lift concept and practical lift teaching values;
- altitude and temperature correction exercises;
- relay-pumping concepts, 20 psi receiving residual, and selected exercises **after correcting/annotating erroneous examples**.

## 3. Which parts should not become the physical foundation?

Do not use as core physics:

- `Q = density × area × velocity` for volumetric flow;
- the p. 35 Bernoulli equation as printed;
- fixed 5/10/40 psi component losses at all flows;
- a universal 1.5 psi/m elevation relation when actual elevations are known;
- a universal 7 psi minimum intake as a cavitation law;
- universal 6 m or 7.5 m drafting limits;
- the linear 1.25 mH₂O/km altitude correction as the physical atmosphere model;
- generic pump performance/rating statements in place of pump curves;
- generic nozzle pressures in place of nozzle performance data;
- p. 79 relay distances without resolving their pressure basis;
- p. 82 friction figures as regression truth.

## 4. Where would a modern hydraulic-network solver provide a better model?

A network solver is superior for:

- branching and parallel hose lays;
- multiple simultaneous nozzles;
- pressure-dependent nozzle flow;
- interacting supply and attack lines;
- elevation at arbitrary nodes;
- flow-dependent friction and minor losses;
- hydrant/system pressure response;
- pump curve/system curve intersection;
- relay pumping with multiple pumpers;
- valve state changes in steady/quasi-steady steps;
- tank/reservoir boundaries and, with time stepping, tank depletion.

## 5. Which behaviors still require custom fire-apparatus modeling?

Most notably:

- priming;
- NPSH/cavitation and inlet limits;
- suction-hose/strainer behavior;
- engine/PTO/governor dynamics;
- two-stage pump mode;
- pump heating/recirculation at low flow;
- apparatus plumbing and relief/governor controls;
- foam systems;
- water hammer/transients;
- nozzle mechanisms beyond a simple pressure-flow relation.

## 6. Surprising, outdated, questionable or incorrect sections needing special attention

Highest-priority flags:

- p. 18 density in volumetric flow;
- p. 29 residual-pressure contradiction;
- p. 30 `9.81 N/m³` specific-weight unit;
- p. 31 `10 m = 14.7 psi`;
- p. 35 missing `ρ` in Bernoulli;
- p. 44 1.4 vs 1.5 psi/m;
- p. 45 universal fixed appliance losses;
- p. 49–51 loose use of “cavitation” and universal 7 psi intake rule;
- p. 52 4.08/7.08 arithmetic errors;
- p. 55 vs p. 62 7.5 m vs 6 m practical suction limits;
- p. 57 statement that vaporization under vacuum is “an advantage for priming” appears backwards/misphrased because vapor pressure reduces attainable suction head;
- p. 58 linear altitude correction becomes materially inaccurate at high altitude;
- p. 71 +22% fixed-orifice flow example;
- p. 79 contradictory relay-table pressure basis;
- p. 82 friction figures inconsistent with the manual's own hose equation.

## 7. What data should be obtained from actual equipment?

Priority data collection:

### Pumps
- manufacturer head-flow curve(s);
- rated speed(s), gear/PTO ratio;
- variable-speed/affinity information;
- NPSHR/NPSH3 versus flow if available;
- allowed intake pressure/vacuum;
- discharge pressure limits;
- two-stage/series-volume mode characteristics;
- efficiency/power curves if engine loading/heat will be modeled.

### Hose
- exact product/model;
- nominal and actual internal diameter;
- length;
- manufacturer or measured friction-loss curve;
- pressure rating;
- suction/vacuum rating for hard suction;
- coupling types and significant losses.

### Nozzles/monitors
- flow-pressure curve for every setting;
- rated operating pressure;
- automatic-nozzle control range;
- reaction-force data;
- reach/pattern test data if visual stream behavior matters.

### Appliances
- pressure-loss curve versus flow for wyes, siamese, manifolds, reducers, valves, monitors, strainers and eductors;
- valve-position effects where relevant;
- maximum pressure/flow ratings.

### Hydrants/supply
- static and residual flow-test data;
- outlet sizes/configuration;
- municipal network or source-curve data if available.

---

# External verification sources

**[E1] US EPA — EPANET overview and capabilities.**  
https://www.epa.gov/water-research/epanet  
Supports use of network conservation, pipe head-loss laws, minor losses, pumps, valves, tanks/reservoirs, pressure-dependent demands and emitters.

**[E2] US EPA — EPANET 2.2 User Manual (2020).**\
https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P10113EM.TXT (old NEPIS copy)\
Official chapter pages:\
https://usepa.github.io/EPANET2.2/3_network_model.html — §3.1 emitters `q = C p^γ`, γ ≈ 0.5 for nozzles (an open nozzle uses the emitter, not a capped municipal pressure-dependent demand); empirical pipe coefficients; minor losses `h_L = K·v²/(2g)` and table 3.3; GPV headloss curves; §3.3 mass and energy conservation.\
https://usepa.github.io/EPANET2.2/12_analysis_algorithms.html — §12.1 eq. 12.1–12.4 (link headloss/energy and node continuity), the Global Gradient Algorithm, residual/convergence checks.\
EPA is the hydraulic **framework** source (equations and algorithm structure); it is not the source of the fire-service coefficients above, and it supplies **no 10/25 psi appliance numbers**.

**[E3] Hydraulic Institute — Pump Principles / NPSH.**  
https://datatool.pumps.org/pump-fundamentals/pump-principles  
Also: https://www.pumps.org/2025/03/18/understanding-the-2024-updates-to-ansi-hi-9-6-1-rotodynamic-pumps-guideline-for-npsh-margin/  
Supports NPSHA/NPSHR/NPSH3 framing and vapor-pressure-based cavitation criterion.

**[E4] Task Force Tips — nozzle reaction.**  
https://tft.com/understanding-your-nozzle-reaction/  
Gives `NR = 1.57 D² NP` for smooth bore and `NR = 0.0505 GPM√NP` for fog/combination nozzles.

**[E5] Elkhart Brass — technical/performance data.**  
https://elkhartbrass.com/wp-content/uploads/catalog-f9-T-G.pdf  
https://old.elkhartbrass.com/downloads.php?d=performance  
Wye ΔP–Q charts (2.5″ inlet × two 1.5″ outlets), both ports /
one port:\
https://elkhartbrass.com/wp-content/uploads/B100B100AB100NBOTH-PORTS.pdf\
https://elkhartbrass.com/wp-content/uploads/B100B100AB100NONE-PORT.pdf\
Method note (total static pressure drop, ΔP_S = H_F + ΔP_V):\
https://old.elkhartbrass.com/files/aa/downloads/performance/Interpreting%20Flow%20Data.pdf\
Supports smooth-bore discharge relation and use of product-specific pressure-loss/flow/reach curves.

**[E6] IAPWS — vapor pressure of water.**  
https://iapws.org/faqs/faq1  
Gives vapor pressure of 0.00317 MPa at 25 °C and 0.01235 MPa at 50 °C.

**[E7] NOAA/NWS/WMO material — standard atmosphere.**  
https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf  
Gives standard sea-level pressure 1013.25 hPa and the standard-atmosphere pressure-altitude relation.

**[E8] NFPA 291 committee report — hydrant rating pressure.**  
https://www.nfpa.org/api/files?path=%2Ffiles%2FAboutTheCodes%2F291%2F291_A2021_AUT_PRI_SRReport.pdf  
Uses 20 psi residual as a common fire-flow rating/reference pressure and warns against negative distribution-system pressure.

**[E9] Hale Products — model-specific fire-pump performance curves/rating charts.**  
https://www.haleproducts.com/mbp  
https://www.haleproducts.com/dsd  
Demonstrates that actual pumps are characterized by model-specific performance curves and ratings.

**[E10] NFPA 1911 committee report — fire-pump test points.**  
https://www.nfpa.org/api/files?path=%2Ffiles%2FAboutTheCodes%2F1911%2F1911_F2016_FDA-AAA_FD_FRStatements.pdf  
Contains the 150 psi / 100%, 200 psi / 70%, 250 psi / 50% fire-pump test sequence cited in substance by the manual.

**[E11] USDA Forest Service, SDTDC — Haston & McKenzie, "Friction Loss in Wildland Hose Lays" (Tech Tip 0651 1309), December 2006.**\
https://www.fs.usda.gov/eng/pubs/pdf/hi_res/06511309hi.pdf\
Appendix C p. 11 states the empirical form `FL = C·(Q/100)²·(L/100)`, with C depending on hose type, condition and flow. p. 4 measures 1½″ appliance losses at 50 gpm: wye valve 0.46 psi, hose-line tee 0.05 psi, tee with valve 0.77 psi, and recommends omitting appliance loss for **wildland hose lays** — not universal structural flow or generic valve losses, and not a Q-curve. Do not generalise these 50 gpm wildland measurements to high structural flows. The source neither validates nor disproves a training allowance of 10 psi at 350+ gpm (50 gpm is outside that range): an omitted, unmeasured loss is not automatically more accurate than an explicit, labelled allowance. Its "published" coefficients (1½″ 24, 1¾″ 15.5) differ from its practical-use values (35 and 14); we do not adopt the practical values globally.

**[E12] Bay District VFD — "The Rural Hitch Using the Humat Valve", field test dated 2021-12-10.**\
https://www.gotbigwater.com/files/news/518/Humat%20Rural%20Hitch.pdf\
p. 7 tabulates (Q gpm, loss psi): straight box waterway (504, 4), (873, 6), (1158, 13); clapper (582, 14), (840, 39), (1158, 45). p. 8's additional 40 psi above 750 gpm is the report's **operational allowance**, not a constant measured difference from the box curve. Measured at these points only, not universal siamese values. (An earlier "~2 psi at 500–900 gpm" was a misreading.)

**[E13] SciPy — `scipy.optimize.bisect` documentation.**\
https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.bisect.html\
Numerical-method reference only: bisection needs a continuous f with opposite signs at the ends, and returns a root. No SciPy runtime dependency.

**[E14] Pump Forge — pump discharge pressure calculator (public page).**\
https://pump-forge.com/tools/pump-discharge-pressure-calculator (read 2026-10-15)\
A **comparison** source only: an independent public calculator, not a primary standard and not authority for IFSTA/NFPA. Its attribution of the method to IFSTA is the site's own claim; the primary IFSTA handbook was not inspected.\
It takes a **target gpm and returns a required PDP** — the target-flow planning direction, not a forward solve.\
Its inline JavaScript shows `FL = C·(gpm/100)²·(len_ft/100)`; elevation 0.434 psi/ft; wye and siamese each 10 psi gated by `data-min-gpm="350"` with the test `gpm >= min` (so exactly 350 gpm adds the allowance, unlike Colorado's strict `> 350`); standpipe and aerial/deck gun each 25 psi; total PDP rounded. C = 15.5, 8, 2, 0.8, 0.2, 0.08 for 1.75, 2, 2.5, 3, 4, 5 in.\
Evidence about the **public calculator page only**: the site claims the same engine powers its private simulator, which was not inspected. We do not blend it with our profile; a user may reproduce its numbers through a custom profile. No proprietary formula is adopted.

**[E15] Colorado DFPC — Driver/Operator Pumper Chart, January 2020.**\
https://cdpsdocs.state.co.us/dfpc/Website2.0/Sections/PQUAT/Proctor/DOPumper%20Chart%20Jan%202020.pdf\
Primary training authority for the adopted `us-training` profile (`coloradoPumperChart` in `references.ts`).\
p. 1 prints, verbatim: "Appliances + 10 psi > 350 gpm", "Master streams + 25 psi", "Aerial waterway + 25 psi", "Standpipes + 25 psi", "Elevation +/- 5 for every 10' gain or loss" (i.e. 0.5 psi/ft).\
p. 2 prints `CQ²L` with the C table (1.5″ 24, 1.75″ 15.5, 2.5″ 2, 3″ with 2.5″ couplings 0.8, 3″ with 3″ couplings 0.677, 4″ 0.2, 5″ 0.08) and `GPM = 29.7·d²·√NP`.\
The chart is a Colorado state training document and does not itself claim national generality, so we label the profile "Colorado 2020" rather than a generic US or IFSTA standard. Its appliance wording is generic ("Appliances"): mapping reducers, adapters and in-line valves into that category is **our simulator training convention**, not measured device data and not primary IFSTA verification (the IFSTA handbook was not inspected). The numeric clauses are verified from the chart itself and are **not** pending IFSTA. The source has unrelated typos; we adopt the named equations/coefficient table, not the whole chart indiscriminately.

**[E16] City of Temecula Fire Prevention Bureau — "Calculations for Fire Flow with Examples".**\
https://www.temeculaca.gov/DocumentCenter/View/164/Temecula-Fire-FlowCalculations-With-Examples-PDF\
Read 2026-10-17. States that the calculations come from NFPA 291 and prints, verbatim: "Q = (29.84)(c)(d2)(√p) where c = coefficient of discharge; d = diameter of the outlet in inches; p = pitot pressure in psi", with the worked example "(1) 2 ½” outlet, coefficient of discharge used is .90 … Pitot = 23 psi … Q = 804 gpm". It also prints the fire-flow curve `Qf = Qr((Ps − 20)/(Ps − Pr))^0.54` (static 98, residual 86, 804 gpm → 2,209 gpm at 20 psi), the form `supply.hydrant` will need.\
A local fire prevention bureau's restatement, not NFPA 291 itself (not openly published; not inspected). Used for `nozzle.open-end` (`MODEL.md` §3.4d), where c = 0.90 is borrowed from a hydrant outlet as the closest published analogue to an open hose butt.

## Evidence-strength note

For a **specific pump, nozzle, hose, valve or appliance**, current manufacturer data or calibrated field measurements are stronger evidence than generic textbook values. Engineering references/standards are stronger for general physics and testing frameworks. The CGBVP manual remains the strongest source for what this particular training program teaches, even where that teaching intentionally simplifies the underlying physics.
