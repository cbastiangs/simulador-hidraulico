# CGBVP compatibility vs physical model

This is the guardrail document: a recognizable CGBVP training mode should not force the simulator's physical engine to reproduce every shortcut or error in the 2019 manual.

| Behavior | CGBVP/manual model | Better physical model | Compatibility strategy |
|---|---|---|---|
| Volumetric flow | p.18 initially writes `Q=D×A×v`, then `Q=A×v` for water | `Q=Av`; `ṁ=ρAv` only for mass flow | Core uses `Q=Av`; do not reproduce density error except as annotated source text |
| Continuity | same Q along a single conduit; `A1v1=A2v2` | conservation at every network junction | Same result for single path; network solver generalizes branches |
| Pressure/head | pressure arithmetic in psi/bar/mca | hydraulic head + exact unit conversion | UI can show manual units and mnemonic approximations |
| Residual pressure | p.29 contains contradictory wording | pressure remaining while flow occurs; static-residual is pressure drop | Use modern definition; annotate p.29 sentence |
| Bernoulli | ideal Bernoulli; p.35 equation has missing `ρ` on RHS elevation term | full energy equation with loss/pump terms | Correct physical equation; never encode p.35 typo |
| Hose friction | `PF=C(Q/100)^2(L/100)` with fixed C by nominal hose size | Darcy-Weisbach or measured ΔP-Q curve using actual hose geometry/condition | Implement CGBVP formula as selectable compatibility law |
| Metric hose tables | 30 m effectively treated as 100 ft | exact unit conversion | Strict compatibility can preserve 30 m≈100 ft table convention |
| Elevation | 1.5 psi/m; 5 psi/floor (also 1.4 mentioned) | `ΔP=ρgΔz` (~1.422 psi/m for water) | Training toggle for 1.5 psi/m / 5 psi floor |
| Wye/valve/reducer | fixed 5 psi loss | `K v²/2g` or product ΔP-Q curve; valve-position dependent | Fixed values only in CGBVP/fallback mode |
| Siamese | ~10 psi fixed | empirical curve | Same strategy |
| Monitor | 10–25 psi fixed | product-specific pressure-loss curve | Same strategy |
| Foam eductor | ~40 psi fixed | product operating curve including backpressure/proportioning constraints | Same strategy |
| Fixed-orifice nozzle | prescribed nominal pressure; manual recognizes pressure-dependent flow | `Q=CdA√(2ΔP/ρ)` or manufacturer Q-P curve | Traditional nominal pressure is a scenario default, not a law |
| Automatic nozzle | approximately constant pressure over flow range | manufacturer regulating curve with min/max flow | Data-driven component |
| Smooth-bore reaction | `1.57 d² NP` | same validated fire-service relation / momentum model | Can be common to both modes |
| Fog reaction | at 100 psi, kg≈24% of gpm | `0.0505 Q√NP` lbf or manufacturer data | Preserve shortcut only in CGBVP mode |
| Nozzle operating pressure | 50 psi handline smooth bore; 80 master; 100 fog | actual nozzle specification | Use manual as default catalog assumptions when model is unknown |
| Hydrant | pressure falls with demand; manual pitot/orifice table | source/network/system curve or municipal network model | Keep pitot calculator; physical source should not be fixed-GPM |
| Hydrant “max at 0 psi” | theoretical zero-residual extrapolation | enforce network/AHJ minimum residual and source limits | Do not use zero residual as operational target |
| Pump inlet max | generic 70–80 psi | apparatus/manufacturer max intake pressure | Manual value only as unverified default |
| Ideal drafting lift | 10.33 m | atmospheric absolute head minus vapor pressure and losses | Concept is common; calculate dynamically |
| Practical drafting lift | 7.5 m on p.55; 6 m on p.62 | NPSHA vs NPSHR/NPSH3 + priming/equipment limits | Show CGBVP values as training guidance, not universal physical constraints |
| Altitude correction | subtract 1.25 mH₂O per km | standard/measured atmospheric pressure vs elevation/weather | CGBVP toggle can reproduce linear rule |
| Temperature correction | use vapor-pressure reduction; chart values | water vapor pressure from thermophysical relation | Same physics, calculated rather than table-only |
| Cavitation | p.51 shorthand: demand > supply; inlet always >7 psi | local absolute pressure/NPSHA relative to vapor pressure and pump NPSHR | Keep symptoms/operator lesson; replace criterion in physical mode |
| Priming | primer creates vacuum; typical −0.8 bar; ≤45 s | apparatus-specific primer capacity, air volume/leakage and lift | Custom fire-apparatus model/data |
| Pump performance | generic characteristic curves; rating points | manufacturer head-flow curves at speed + power/efficiency/NPSH data | Manual curve for teaching; actual pump curves for physical mode |
| Pump rating 150/200/250 psi | 100% / 70% / 50% | standard test/rating points plus complete pump curve | Keep as certification/test metadata, not interpolation law |
| Relay pumping | table-based spacing + 20 psi residual | coupled pumps + hose losses + inlet constraints | Provide “manual planning mode” and network-solved mode |
| Parallel relay lines | fourfold distance intuition under Q² law | network solve; same qualitative scaling for equal quadratic links | Preserve as teaching example |
| Water hammer | close valves slowly; qualitative pressure wave | transient compressible/elastic wave model | Operational behavior now; separate transient engine later |
| Tank supply | largely treated as source | finite volume with level/head/time depletion | Use storage model for physical mode |
| Stream reach | projectile approximation plus explicit caveat | empirical manufacturer reach/pattern data or advanced jet model | Ballistic view only as teaching visualization |
| Hose collapse under suction | not quantitatively modeled | structural vacuum/collapse limit + hose specification | Custom fire-equipment constraint |
| Pump heating at churn | not quantitatively modeled | energy/thermal recirculation model with pump/manufacturer data | Custom later feature |

## Recommended separation in implementation vocabulary

The numerical architecture does **not** need to be designed here, but the conceptual separation should remain clear:

- **`physical`**: conservation + equipment curves + environment + measured/manufacturer data.
- **`cgbvp_2019`**: deliberately reproduces documented CGBVP training shortcuts and selected tables.
- **`fallback_generic`**: physically plausible approximations when actual equipment data are missing.
- **`source_error`**: known printed/manual discrepancies that are retained for traceability but are not used as model behavior.

A single result can expose both interpretations. Example:

```text
Elevation = 10 m
CGBVP 2019 quick rule: 15.0 psi
Physical hydrostatic: 14.22 psi
Difference: +0.78 psi (+5.5%)
```

That approach keeps training compatibility visible without contaminating the physical model.

## Solver fit

EPA EPANET is a strong example of the type of steady hydraulic capability that maps naturally to the physical side: pressurized networks, reservoirs/tanks, pipes, minor losses, pumps, valves, pressure-dependent demands and nozzle-like emitters.

Reference:
- https://www.epa.gov/water-research/epanet
- https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P10113EM.TXT

It would still need fire-apparatus-specific logic/data for priming, NPSH/cavitation, suction collapse, governor behavior, pump heating and transients.
