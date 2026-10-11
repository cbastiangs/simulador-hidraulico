# CGBVP manual — validation cases

**Goal:** convert useful manual examples and tables into regression cases for a future CGBVP-compatible calculation mode while keeping erroneous manual results separate from physically/arithmetically correct results.

Notation:
- `expected_cgbvp_result`: what the manual explicitly prints or what its stated shortcut produces.
- `expected_physical_result`: independent calculation using the stated physical relation or a more defensible engineering model.
- “CGBVP formula result” means the manual's formula was recomputed correctly; it is not automatically the same as a fully physical result.

---

## VC-01 — 1½" hose table, low flow

**Source:** p. 40  
**Inputs:**
- hose: 1½"
- `C=24`
- flow = 40 gpm
- manual table length = 30 m, treated by the table convention as approximately 100 ft

**Manual calculation rule:**

`PF = 24 × (40/100)^2 × (100/100)`

**Independent recalculation:**

`24 × 0.4² = 3.84 psi`

**Manual result:** 4 psi

**Status:** **matches with rounding**.

```yaml
id: VC-01
expected_cgbvp_result_psi: 4
recomputed_manual_formula_psi: 3.84
result: differs_because_of_rounding
```

**Simulator use:** good regression case for the CGBVP hose coefficient implementation.

---

## VC-02 — 2½" hose table, 250 gpm

**Source:** p. 41  
**Inputs:**
- hose: 2½"
- `C=2`
- flow = 250 gpm
- length = 30 m

**Manual table result:** 13 psi.

**CGBVP table convention:** 30 m ≈ 100 ft:

`PF = 2 × 2.5² × 1 = 12.5 psi` → 13 psi rounded.

**Exact unit conversion:** 30 m = 98.425 ft:

`PF = 2 × 2.5² × 0.98425 = 12.303 psi`.

**Status:** **matches the table convention / rounding**.

```yaml
id: VC-02
expected_cgbvp_result_psi: 13
recomputed_cgbvp_table_convention_psi: 12.5
recomputed_with_exact_length_conversion_psi: 12.303
result: differs_because_of_rounding_and_30m_100ft_convention
```

**Simulator use:** tests that a strict CGBVP mode can intentionally use 30 m ≈ 100 ft if reproducing tables, while physical mode should convert units exactly.

---

## VC-03 — 3" hose table, 500 gpm

**Source:** p. 42  
**Inputs:**
- hose: 3"
- `C=0.8`
- flow = 500 gpm
- table length = 30 m ≈ 100 ft

**Calculation:**

`PF = 0.8 × 5² × 1 = 20 psi`

**Manual result:** 20 psi.

**Status:** **matches**.

```yaml
id: VC-03
expected_cgbvp_result_psi: 20
recomputed_manual_formula_psi: 20
result: matches
```

---

## VC-04 — elevation, 10 m

**Source:** p. 44  
**Inputs:** rise = 10 m.

**Manual shortcut:** `1.5 psi/m`.

**Manual result:** 15 psi.

**Physical hydrostatic calculation** (ρ≈1000 kg/m³, g=9.80665 m/s²):

`ΔP = ρ g h ≈ 98.07 kPa ≈ 14.22 psi`.

**Status:** **intentional approximation, not arithmetic error**.

```yaml
id: VC-04
expected_cgbvp_result_psi: 15
expected_physical_result_psi_approx: 14.22
result: intentional_training_approximation
```

**Simulator use:** ideal A/B test for `CGBVP` vs `physical` mode.

---

## VC-05 — fog nozzle reaction, 250 gpm at 100 psi

**Source:** p. 46  
**Inputs:**
- fog nozzle
- 250 gpm
- 100 psi

**Manual shortcut:** reaction kg ≈ `0.24 × gpm`.

`0.24 × 250 = 60 kgf`

**Manual result:** 60 kg.

**Independent standard fire-service relation** (TFT):

`NR_lbf = 0.0505 × Q × √NP`
`= 0.0505 × 250 × 10 = 126.25 lbf`
`= 57.27 kgf`.

**Status:** **reasonable approximation** (~4.8% high relative to this formula).

```yaml
id: VC-05
expected_cgbvp_result_kgf: 60
expected_standard_formula_kgf_approx: 57.27
result: reasonable_training_approximation
```

Reference: https://tft.com/understanding-your-nozzle-reaction/

---

## VC-06 — fixed-orifice nozzle, 50 psi → 80 psi

**Source:** p. 71  
**Manual statement:** increasing pressure from 50 to 80 psi increases flow by 22%.

**Physical relation for fixed area/discharge coefficient:**

`Q2/Q1 = √(P2/P1) = √(80/50) = 1.26491`

Increase = **26.49%**.

**Status:** **apparent numerical error** unless the manual intended a particular nozzle whose discharge coefficient changes with operating point (no such qualification is given).

```yaml
id: VC-06
manual_claim_percent_increase: 22
expected_fixed_orifice_percent_increase: 26.49
result: apparent_error
```

**Simulator use:** do not encode 22% as a fixed-orifice law.

---

## VC-07 — p. 52 suction arithmetic, 6 m lift

**Source:** p. 52  
**Inputs:**
- stated atmospheric column = 10.8 m
- geometric lift = 6 m

**Manual text result:** 4.08 m.  
**Manual figure label:** 4.8 m.

**Independent arithmetic:**

`10.8 − 6 = 4.8 m`.

**Status:** **apparent arithmetic/decimal-placement error in text**.

```yaml
id: VC-07
manual_text_result_m: 4.08
manual_figure_result_m: 4.8
expected_arithmetic_result_m: 4.8
result: apparent_arithmetic_error_in_text
```

**Important:** this only checks the subtraction. A full physical NPSHA calculation must also consider vapor pressure and suction losses.

---

## VC-08 — p. 52 suction arithmetic, 3 m lift

**Source:** p. 52  
**Inputs:**
- stated atmospheric column = 10.8 m
- geometric lift = 3 m

**Manual text result:** 7.08 m.  
**Manual figure label:** 7.8 m.

**Independent arithmetic:**

`10.8 − 3 = 7.8 m`.

**Status:** **apparent arithmetic/decimal-placement error in text**.

```yaml
id: VC-08
manual_text_result_m: 7.08
manual_figure_result_m: 7.8
expected_arithmetic_result_m: 7.8
result: apparent_arithmetic_error_in_text
```

---

## VC-09 — altitude correction at 1500 m

**Source:** p. 58  
**Manual rule:** subtract `1.25 mH2O` per km.

`10.33 − 1.25 × 1.5 = 8.455 m`

**Manual printed result:** 8.43 m.

**Status under manual rule:** **matches within rounding** (printed rounding is a little loose).

**Standard-atmosphere comparison:** at 1500 m, pressure is about 84.56 kPa, equivalent to about 8.62 m of water head before vapor-pressure subtraction.

```yaml
id: VC-09
expected_cgbvp_result_m: 8.43
recomputed_manual_linear_rule_m: 8.455
standard_atmosphere_pressure_head_m_approx: 8.62
result: manual_rule_matches_approximately_but_is_a_training_approximation
```

External basis: NOAA/WMO standard-atmosphere relation.

---

## VC-10 — altitude correction at 4000 m

**Source:** p. 58  
**Manual rule:**

`10.33 − 1.25 × 4 = 5.33 m`

**Manual result:** 5.33 m.

**Status under manual rule:** **matches exactly**.

**Standard-atmosphere comparison:** at 4000 m, pressure is about 61.64 kPa, equivalent to about 6.29 m water head before vapor-pressure subtraction.

At 20 °C, subtracting ~0.239 m vapor-pressure head still leaves roughly 6.05 m before suction-line losses.

```yaml
id: VC-10
expected_cgbvp_result_m: 5.33
recomputed_manual_linear_rule_m: 5.33
standard_atmosphere_pressure_head_m_approx: 6.29
standard_atmosphere_minus_20C_vapor_head_m_approx: 6.05
result: cgbvp_matches_its_rule_but_rule_diverges_materially_at_high_altitude
```

**Simulator use:** strong case for separate compatibility and physics expectations.

---

## VC-11 — relay parallel-line scaling

**Source:** p. 82  
**Claim:** splitting the same total flow across two equal parallel lines allows approximately four times the distance for the same friction-loss budget.

Under the manual's `PF ∝ Q²L` rule:
- one line at Q: `PF ∝ Q²L`;
- two identical lines share Q/2 each: `PF_each ∝ (Q/2)²L = Q²L/4`.

Therefore, for the same loss, `L` can be four times larger.

**Status:** **matches** under the manual's hose law.

```yaml
id: VC-11
manual_distance_multiplier: 4
recomputed_distance_multiplier: 4
result: matches
```

**Simulator use:** excellent conceptual regression test for parallel network topology.

---

## VC-12 — relay example, 500 gpm in one 2½" line

**Source:** p. 82  
**Manual parenthetical:** `pf 35 psi/15 m`.

Manual hose coefficient from p. 39: `C=2`.

Using exact 15 m = 49.213 ft:

`PF = 2 × (500/100)² × (49.213/100)`
`= 24.61 psi`.

Using the common 15 m ≈ 50 ft shortcut gives 25 psi.

**Status:** **apparent inconsistency with the manual's own formula**.

```yaml
id: VC-12
manual_parenthetical_psi_per_15m: 35
recomputed_manual_C_formula_psi_per_15m_approx: 24.61
result: apparent_internal_inconsistency
```

Do **not** use 35 psi/15 m as the expected output of the manual C formula.

---

## VC-13 — relay example, 500 gpm split over two 2½" lines

**Source:** p. 82  
**Manual parenthetical:** `pf 10 psi/15 m`.

Each equal line carries 250 gpm.

`PF = 2 × (250/100)² × (49.213/100)`
`= 6.15 psi per line per 15 m`.

Using 15 m ≈ 50 ft gives 6.25 psi.

**Status:** **apparent inconsistency with the manual's own formula**.

```yaml
id: VC-13
manual_parenthetical_psi_per_15m: 10
recomputed_manual_C_formula_psi_per_15m_approx: 6.15
result: apparent_internal_inconsistency
```

---

## VC-14 — relay table pressure basis

**Source:** p. 79

**Observed manual data:**
- table has pressure rows labelled 170 psi (250/500/750 gpm) and 140 psi (1000/1250 gpm);
- narrative below says the figures are based on 200 psi for 2½" and 3" hose;
- next paragraph says the table is based on 185 and 200 psi.

**Status:** **ambiguous / internally inconsistent**.

```yaml
id: VC-14
table_pressure_labels_psi: [170, 140]
narrative_pressure_claims_psi: [200, [185, 200]]
result: ambiguous
automation_status: do_not_use_as_numeric_oracle_until_source_is_reconstructed
```

**Simulator use:** this is a documentation regression case, not a numerical physics test.

---

## VC-15 — p. 31 pressure/head equivalence

**Source:** p. 31  
**Manual:** 10 m water = 1 kg/cm² = 14.7 psi.

**Independent conversions:**
- 10 m H₂O ≈ 98.0665 kPa ≈ **14.22 psi**;
- 1 kgf/cm² ≈ 98.0665 kPa ≈ **14.22 psi**;
- 1 standard atmosphere = 101.325 kPa ≈ **14.696 psi** ≈ 10.33 m H₂O.

**Status:** **apparent conflation of convenient approximations**.

```yaml
id: VC-15
manual_result_psi: 14.7
physical_10m_water_psi_approx: 14.22
result: approximate_conversion_inconsistency
```

---

# Exercises present but not usable as “manual-result” regression tests

## EX-01 — p. 43 hose-friction diagrams
The page supplies hose arrangements and blanks for friction/pressure values but no completed manual answers. These can become generated exercises after the intended lengths/configurations are confirmed, but there is no printed expected result to validate against.

## EX-02 — p. 74 steam-flooding room calculations
The page gives room dimensions and formulas but leaves answer blanks:
- room volume;
- `m³ × 1000 = litres vapor`;
- divide by 1700 for litres water;
- divide by 3.7 for gallons;
- calculate nozzle-open time at 125 gpm and 30 gpm.

These are useful training exercises, but because the manual does not print completed answers, they are **not** manual-answer regression tests.

---

# Suggested regression-test policy

For future automated tests, keep result classes explicit:

```text
MATCHES_MANUAL_AND_PHYSICS
MATCHES_MANUAL_WITH_ROUNDING
CGBVP_TRAINING_APPROXIMATION
MANUAL_ARITHMETIC_ERROR
MANUAL_INTERNAL_INCONSISTENCY
AMBIGUOUS_SOURCE
PHYSICAL_MODEL_DIFFERS_BY_DESIGN
```

Do not “fix” a CGBVP compatibility test by overwriting the source value. When useful, store both:

```yaml
expected_cgbvp_result: ...
expected_physical_result: ...
manual_source_page: ...
assessment: ...
```

This makes it possible to preserve CGBVP teaching compatibility while preventing an erroneous printed answer from becoming the simulator's physical truth.
