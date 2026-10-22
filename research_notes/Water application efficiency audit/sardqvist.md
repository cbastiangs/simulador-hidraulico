# Särdqvist water-application efficiency: primary-source audit

Audit date: 2026-10-22.

Scope: what Stefan Särdqvist actually states numerically about water
efficiency, absorption and evaporation; the exact numerator, denominator,
water states, target and conditions; and whether the commonly repeated
percentages are in the 2002 book or only in the 1996 Lund report.

Primary sources inspected:

- Stefan Särdqvist, *An Engineering Approach to Fire-Fighting Tactics*,
  Report 1014, Department of Fire Safety Engineering, Lund Institute of
  Technology, Lund University, 1996 (licentiate thesis). 85 PDF pages,
  text layer present (164,136 characters). Printed page = PDF page − 6.
  [LUP PDF](https://lup.lub.lu.se/search/files/5735831/1048740.pdf).
- Stefan Särdqvist, *Water and Other Extinguishing Agents*, Swedish Rescue
  Services Agency, first published 2002, ISBN 91-7253-265-3, order
  U30-649/07. 340 PDF pages, **no text layer** (0 extractable characters;
  see §3.3). Printed page = PDF page − 2.
  [Official MCF PDF](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf);
  [agency entry](https://www.mcf.se/sv/publikationer/water-and-other-extinguishing-agents/).
- D. W. Stroup and D. D. Evans, *Suppression of Post-Flashover Compartment
  Fires Using Manually Applied Water Sprays*, NISTIR 4625, NIST, July 1991
  (Särdqvist’s bibliography dates it 1992). 46 PDF pages, OCR text layer
  (37,493 characters).
  [NIST PDF](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir4625.pdf).
- Ed Hartin, “Effective and Efficient Fire Streams”, Command Competence,
  26 November 2009 (secondary synthesis).
  [Article](https://commandcompetence.com/post/effective-and-efficient-fire-streams/).

Companion notes in this folder: `grimwood-barnett.md` (the 0.32/0.50/0.75
chain and a detailed Table 6 reconstruction) and `measured experiments.md`
(modern measured efficiencies). This file resolves the specific Särdqvist
blockage and does not repeat their full analyses.

## 1. What numeric water-efficiency statements does Särdqvist actually make?

### Takeaway

The only numeric “efficiency factor” for water in Särdqvist’s work is in the
**1996 Lund report, not the 2002 book**: an explicitly assumed heat-absorption
multiplier of **0.2 for interior fog nozzles**, 0.2 for long-range monitors,
0.3 for long-range nozzles, and 0.4 for short-range nozzles. The only
experimental anchor is **about 0.3 as an upper limit** derived from four
NISTIR 4625 small-room tests. The report says there are **no systematic
measurements** of water’s actual extinction capacity, so the factors are
planning assumptions. No measured evaporation fraction, no measured
application efficiency and no universal η exists in these sources.

### Cited Findings

**Citation and status.** The 1996 work is a licentiate thesis, Report 1014,
ISSN 1102-8246, ISRN LUTVDG/TVBB--1014--SE, Lund 1996. The title page and
report number are on PDF p. 3; the ISSN/ISRN are on PDF p. 5.
[Särdqvist 1996, title page](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=3).

**Definition of the efficiency concept (p. 49).** Särdqvist calls it
“effectiveness”:

> “The effectiveness is the relation between the actual and the maximum
> theoretical value of the heat absorption capacity of the extinguishing
> media.”

That is the conceptual numerator/denominator: actual rate of heat absorption
by the water ÷ maximum theoretical rate for the same medium. The report later
uses “efficiency factor” for the same multiplier.
[Särdqvist 1996, p. 49](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=55).

**Theoretical endpoints (pp. 52–53).** The report calculates the enthalpy
available from liquid water starting at 10 °C:

> “To heat water from 10°C to 100°C, the energy input required is
> 90°C · 0.00418 MJ/kg°C = 0.38 MJ/kg”
>
> “To vaporise water at 100°C requires 2.26 MJ/kg.”
>
> “To heat the steam further requires an energy input that equals
> (T - 100) · 0.00201 [MJ/kg], where T [°C] is the actual steam temperature.”

The stated 600 °C endpoint is:

> “This means that to transform 1 kg of water at 10°C to steam at 600°C, an
> energy input of 0.38 + 2.26 + (1000-100) · 0.00201 = 3.6 MJ is needed.”

The printed `(1000-100)` is arithmetically inconsistent with the stated
600 °C and with the 3.6 MJ result: `900 × 0.00201 = 1.81`, giving 4.45 MJ/kg.
The intended term is `(600-100)`, which gives 3.645 ≈ 3.6 MJ/kg. Treat the
`1000` as a typo; the endpoint is 600 °C.
[Särdqvist 1996, p. 52](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=58).

The report also states the non-vaporising limit:

> “Water that is not vaporised, which can be seen flowing along the ground at
> many fire scenes, has a maximum absorption capacity of only 0.38 MJ/kg.”

So 0.38 MJ/kg is the sensible-heat-only value for water heated 10→100 °C and
then running off; 2.26 MJ/kg is the latent term; 2.64 MJ/kg is the physical
maximum to saturated steam at 100 °C (rounded to 2.6 MJ/kg later); 3.6 MJ/kg
is the physical maximum to steam at 600 °C.
[Särdqvist 1996, p. 53](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=59).

**The experimental anchor: about 0.3, an upper limit (p. 53).**

> “In a series of tests, where a BA team used a fog nozzle to overcome a
> flashover fire, the maximum efficiency factor proved to be about 0.3 [31].
> The investigation included four extinguishing tests, which are summarised in
> Table 6. As these tests were performed in a small room and under the best of
> circumstances, we should regard the efficiency factor as an upper limit.”

Table 6 lists four tests:

| Water flow (kg/s) | Room temp. (°C) | Theoretical absorption (MJ/kg) | Theoretical extinction capacity (MW) | Extinction | HRR (MW) | Efficiency factor |
|---:|---:|---:|---:|---|---:|---:|
| 1.320 | 820 | 4.08 | 16.0 | Definitely | 1.8 | 0.11 |
| 0.608 | 800 | 4.04 | 7.4 | Just able to | 1.8 | 0.24 |
| 0.608 | 780 | 4.00 | 7.3 | Just able to | 2.1 | 0.29 |
| 0.272 | 720 | 3.88 | 3.2 | No control | 2.2 | (0.69) |

The tabulated values reproduce **HRR at extinction ÷ theoretical extinction
capacity** (flow × theoretical absorption × 3), not a direct calorimetric
measurement of heat absorbed by the water. The report does not print that
formula, but the arithmetic is unambiguous. The “theoretical extinction
capacity” already includes a ×3 factor derived from the assumption that
diffusion flames need only 30–35 % of the released heat removed; see p. 52.
The 0.24 and 0.29 rows are the “just able to” cases, hence the “about 0.3”
upper limit. The 0.69 row had no control and is not an efficiency.
[Särdqvist 1996, p. 53](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=59);
[NISTIR 4625 abstract and test description](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir4625.pdf).

**The 0.32 figure is a different, fuel-surface assumption (p. 54).**

> “Others have suggested an efficiency factor of 0.32 for a water hose
> delivering water at a rate of 10 kg/s [32]. This efficiency factor concerns
> the fuel surface cooling effect. Here it was assumed that the steam is not
> heated above 100°C, giving an heat absorption capacity of 0.8 MJ/kg.”

The arithmetic implies `0.32 × 2.6 ≈ 0.83 ≈ 0.8 MJ/kg`: the 0.8 is the
post-efficiency effective value, not the theoretical 2.6 MJ/kg. Reference [32]
is *Fire Safety in Tall Buildings* (CTBUH, McGraw-Hill, 1992), not a Särdqvist
experiment. The sentence is compressed and the label “heat absorption capacity”
is ambiguous; the number is best read as effective, not theoretical.
[Särdqvist 1996, p. 54](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=60).

**The planning assumptions (p. 55).** These are the exact bullets:

> “• The maximum heat absorption capacity for water is
> 2.6 + (T - 100) · 0.00201 [MJ/kg].
> • For nozzles delivering droplets smaller than 1 mm, T [°C] is the smoke
> temperature. As a temperature of 600°C is commonly used as a flashover limit,
> it is convenient to use the same temperature here. This gives a maximum heat
> absorption of 3.6 MJ/kg, which is multiplied with a factor of 3, giving
> 10.8 MJ/kg in flame extinction capacity.
> • An efficiency factor of 0.2 is used for interior fog nozzles.
> • For nozzles delivering droplets larger than 2 mm, T is 100, giving a
> maximum heat absorption of 2.6 MJ/kg.
> • An efficiency factor of 0.2 is used for long-range, well placed monitors.
> • An efficiency factor of 0.3 is used for long-range, well placed nozzles.
> • An efficiency factor of 0.4 is used for short-range, well placed nozzles.”

The report is explicit that these are not measurements:

> “The efficiency factor varies with the method used, with the hose operator
> and with the equipment. Unfortunately, there are no systematic measurements
> of the actual extinction capacity of water. Thus, the efficiency must be
> estimated.”

It also rejects the real-fire correlation for this purpose:

> “The data in Figure 27 must therefore be rejected for the purpose of
> determining an efficiency factor for water.”

[Särdqvist 1996, p. 55](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=61).

**Table 7: the factors applied to nozzle flows (p. 56).**

| Equipment | Maximum heat absorption (MJ/kg) | Water flow (kg/s) | Efficiency factor | Heat absorption capacity (MW) |
|---|---:|---:|---:|---:|
| Standard nozzle (7 mm) | 2.6 | 1.3 | 0.4 | 1.4 |
| Standard nozzle (14 mm) | 2.6 | 4.8 | 0.4 | 5.0 |
| Standard nozzle (22 mm) | 2.6 | 9.2 | 0.3 | 7.2 |
| Large-capacity nozzle | 2.6 | 16.7 | 0.3 | 13 |
| Monitoring nozzle | 2.6 | 40 | 0.2 | 21 |
| Fog nail | 3.6 · 3 | 1.2 | 0.2 | 2.6 |
| Fog nozzle (BA team) | 3.6 · 3 | 5.0 | 0.2 | 11 |
| Fog nozzle (BA team) | 3.6 · 3 | 7.9 | 0.2 | 17 |

The table’s arithmetic confirms the denominator convention:

- Fog: `flow × 10.8 × 0.2`. At 5.0 kg/s, `5.0 × 10.8 × 0.2 = 10.8 MW`
  (table says 11); at 7.9 kg/s, `7.9 × 10.8 × 0.2 = 17.1 MW` (table says 17).
- Large droplets: `flow × 2.6 × η`. At 4.8 kg/s and η=0.4,
  `4.8 × 2.6 × 0.4 = 4.99 MW` (table says 5.0).
- Monitor: `40 × 2.6 × 0.2 = 20.8 MW` (table says 21).

This is the crucial definitional point: **the 0.2 for fog is applied to
10.8 MJ/kg, the ×3 “flame extinction capacity”, not to the 3.6 MJ/kg physical
enthalpy to 600 °C steam.** Read against the physical enthalpy, the implied
absorption is `2.16 / 3.6 = 0.60`, i.e. 60 %, not 20 %. The same numerical
“0.2” applied to a large-droplet nozzle is `0.2 × 2.6 = 0.52 MJ/kg`. The
factor cannot be quoted without its denominator.
[Särdqvist 1996, p. 56](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=62).

**The report’s own caveat (p. 73).**

> “One example is that it was necessary to assume efficiency factors for the
> extinguishing media. The efficiency factor for a nozzle changes depending on
> whether it is located close to the fire or at the maximum distance of reach.”

[Särdqvist 1996, p. 73](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=79).

**Real-fire multiplier, not an efficiency (p. 54).**

> “It suggests that the fire brigades used of the order of 100 times more water
> than should be required theoretically.”

This is a water-use/application multiplier, not a dimensionless heat-absorption
efficiency. It is the origin of the “100×” statement sometimes repeated
alongside the efficiency figures.
[Särdqvist 1996, p. 54](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=60).

**The 2002 book does not repeat the 0.2 factor.** Its index has only
“Efficiency, pumps 67–68”; there is no water-efficiency entry. The book’s
bibliography cites the 1996 report as Report 1014, but the water text gives no
0.2/0.3/0.4 table. See §2 for the book’s actual treatment.
[Book index, p. 332](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=334);
[book bibliography, p. 327](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=329).

### Inferences

- **The often-repeated “Särdqvist 0.2” is a 1996 planning assumption, not a
  measured evaporation fraction and not a 2002 book statement.** Cite
  “Särdqvist 1996, pp. 55–56”, not “Särdqvist 2002”.
- The 0.2 is an **energy-ratio multiplier on a declared reference capacity**.
  For fog it multiplies 10.8 MJ/kg (3.6 × 3); for large droplets it multiplies
  2.6 MJ/kg. Those are different physical bases. A bare “η = 0.2” is
  dimensionally meaningless without the reference.
- The 0.2 for fog corresponds to 2.16 MJ/kg of “extinction capacity”, which is
  **60 % of the 3.6 MJ/kg physical enthalpy** to 600 °C steam. The report calls
  it 0.2 because the denominator already includes the ×3 extinction factor.
  This is why the same number cannot be compared directly with a 20 %
  evaporation or contact fraction.
- The **~0.3 experimental anchor is an upper limit**, not a general measured
  efficiency. It comes from four small-room wood-crib tests with one nozzle
  type, and Särdqvist himself says the conditions were “the best of
  circumstances”.
- The **0.32** is a separate fuel-surface-cooling assumption from a 1992
  tall-buildings source, not a Särdqvist measurement. It is numerically close
  to `0.32 × 2.6 = 0.83 MJ/kg`.
- The **100×** figure is a real-fire water-use multiplier, not an efficiency.

### Gaps

- NISTIR 4625 was re-downloaded and text-searched here: it contains **zero
  occurrences of “efficiency”** and reports measured gas/wall temperatures,
  gas concentrations, water flows and drop sizes. The 0.3/0.24/0.29 values are
  Särdqvist’s derived ratios, not a NIST-reported efficiency. A full
  calorimetric heat-balance reconstruction of NISTIR 4625 was not performed
  here; `grimwood-barnett.md` does the detailed Table 6 reconstruction.
- The 1996 report’s `(1000-100)` is an apparent typo; the intended 600 °C
  endpoint is inferred from the stated result and the surrounding text, not
  from a corrected erratum.
- The 1996 report’s Table 6 “efficiency” column is reconstructed from its
  arithmetic, not from an explicit formula in the report. The reconstruction
  is exact to two decimals but remains an inference about Särdqvist’s
  calculation.
- The Swedish original of the 2002 book (2001) was not inspected; only the
  English 2002 edition was.

## 2. Do the often-repeated “efficiency” percentages appear in the 2002 book?

### Takeaway

**No numeric water-efficiency factor was found in the 2002 book’s water
chapters or index.** The book states the principle (maximise the vaporised
proportion; normally only part of the water vaporises), gives a theoretical
maximum cooling rate of about **43 kW/m² at 1 l/m²min** with full
vaporisation, and explicitly says there is **no data for `c_w`**, the
proportion of water reaching and vaporising at the fuel surface. The
0.2/0.3/0.4 factors are absent from the book’s water text and index; they
belong to the 1996 report. The book does contain 70/30 and 45 %/10–40 %
figures, but these are a gas-volume illustration and fire-side extinction
heat fractions, respectively, not water efficiency.

### Cited Findings

**Edition and page mapping.** The imprint says “First published in 2002”,
ISBN 91-7253-265-3, order U30-649/07. The foreword says the Swedish edition
was released in 2001 and refers to “the delay in the translation process”.
The MSB-hosted PDF is a 2016 scan of the 2002 English edition (340 PDF pages;
printed page = PDF page − 2).
[Book imprint (PDF p. 4)](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=4);
[foreword, p. 6](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=8).

**Water application is qualitative (pp. 147–150).** The section “Water
application” lists five places where water can act (hot smoke, flames, fuel
surface, unaffected fuel, hot surfaces) and three techniques (smoke cooling,
fuel cooling, steam suppression). It gives no efficiency percentage.
[Book pp. 147–150](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=149).

**The 70/30 statement is a gas-volume illustration, not an efficiency
(p. 154).**

> “When almost 70% of the water vaporises on hot surfaces and 30% vaporises in
> the smoke at 600°C, the two effects evens out and the gas volume remains
> constant.”

This is an assumed split used to illustrate the competing volume effects of
steam generation and smoke cooling. It is not a measured evaporation
fraction and not a recommendation for an application efficiency.
[Book p. 154](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=156).

**The book’s principle: maximise the vaporised proportion (p. 166).**

> “In order to achieve the best possible cooling effect using water, the
> proportion of the water that vaporises must be as high as possible.”

The surrounding text explains that a small flow gives a high relative
vaporisation level but may not cool the wall enough; a large flow cools the
wall below 100 °C and the water does not vaporise. No numeric efficiency is
given.
[Book p. 166](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=168).

**The 43 kW/m² theoretical maximum (p. 167).**

> “The maximum cooling effect on a surface which is drenched with water at a
> rate of 1 l/m²min will be: Q = 4.18·10³·1/60(100 − 20) + 2260·10³·1/60
> = 5600 + 37,700 ≈ 43 kW/m². Normally only part of the water vaporises.”

Numerator: enthalpy to heat 1 kg water from 20 to 100 °C plus full
vaporisation; denominator: 1 m² per minute. It assumes **all** the water
vaporises, and the next sentence explicitly denies that this is normal. It is
a theoretical upper bound, not an efficiency.
[Book p. 167](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=169).

**Too much water lowers the vaporised fraction (p. 170).**

> “If too much water is sprayed on the surface the heat released will be used
> to heat up the water to boiling point but only a small amount of it will
> vaporise. If a small amount of water is used to dampen the surfaces, a
> larger fraction will be vaporised.”

This is a qualitative statement of the trade-off; no fraction is given.
[Book p. 170](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=172).

**Application rates, not efficiencies (pp. 173–174).** For wood cribs:

> “The rate at which water’s optimum extinguishing capability is achieved is
> 0.6–1.8 l/m²min. In this case, the control time is only around 10 s and the
> total volume of water will be 0.15–0.35 l/m². Area is used in this context
> to mean the wood’s exposed area (Särdqvist & Holmstedt, 2001).”
>
> “The critical water application rate, where the time is very long, is
> 7–8 l/m²min.”

For real fires:

> “The water reaches its optimum extinguishing performance when the water rate
> is increased to 9–15 l/m²min. The total volume of water used is 30–120 l/m²,
> with an extinguishing time of around 300 s.”

The book then states the flow is “about ten times greater with real fires than
in experiments” and the time “about thirty times longer”. These are
application/tactical multipliers, not dimensionless efficiency.
[Book p. 173](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=175);
[book p. 174](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=176).

**Tactical flow factor (p. 20).**

> “The total consumption of the extinguishing agent will be at a minimum and
> the extinguishing agent will be used most effectively when the actual
> application rate is somewhere between two to four times the critical
> application rate.”

This is a tactical/economic optimum, not a heat-absorption efficiency.
[Book p. 20](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=22).

**The 45 % and 10–40 % figures are fire-side heat fractions (p. 314).**

> “With premixed flames, about 45% of the heat released must be absorbed by the
> extinguishing agent or cooled down in a different way. The proportion is
> smaller for diffusion flames, usually 10–40%.”

These are fractions of the **fire’s heat release** that must be removed for
extinction, not fractions of the water mass or water enthalpy. The 1996 report
gives 30–35 % for diffusion flames, not 10–40 %; the book’s range is broader,
and the reason for the difference is not stated. Neither is a water
efficiency.
[Book p. 314](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=316);
[Särdqvist 1996, p. 52](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=58).

**The `c_w` fraction: defined but numerically unknown (pp. 315–316).** The book
defines, in the Fire point equation’s list of quantities:

> “c_w [–] proportion of water reaching and vaporising at the fuel surface”

and then says:

> “In reality, it is difficult to add so little water that it is all vaporised
> on the surface, c_w is therefore small in many cases.”
>
> “There is no data available for c_w …”

This is the closest the book comes to an evaporation/contact fraction for
water. It is a **mass fraction** (water reaching and vaporising at the fuel
surface ÷ water applied), not an energy efficiency, and the book gives **no
numeric value**.
[Book p. 315](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=317);
[book p. 316](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=318).

**Only a small amount cools flames and smoke (p. 312).**

> “Only a small amount of the water used in extinguishing a fire goes on
> cooling down flames and smoke and facilitating access, in the case of an
> interior attack. Most of it is used to cool down the fuel surfaces…”

This is qualitative and gives no percentage.
[Book p. 312](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=314).

**Index and bibliography.** The index has “Efficiency, pumps 67–68” but no
water-efficiency entry. The bibliography lists the 1996 report as Report 1014,
confirming that the book’s author knew the earlier work, but the book does not
transcribe its 0.2/0.3/0.4 table.
[Book index, p. 332](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=334);
[book bibliography, p. 327](https://www.mcf.se/siteassets/dokument/publikationer/english-publications/water-and-other-extinguishing-agents.pdf#page=329).

### Inferences

- **The book is not the source of the 0.2 figure.** The 2002 book’s water
  treatment is conceptual and does not give a numeric efficiency; the numeric
  factor is in the 1996 report. “Särdqvist 2002” is therefore a mis-citation
  for the 0.2.
- The book’s **43 kW/m²** is a physical upper bound assuming full vaporisation;
  it is not an efficiency and should not be multiplied by 0.2 as if it were
  the same basis. The book itself says “normally only part of the water
  vaporises”.
- The book’s **70/30** and **45 %/10–40 %** figures are the most likely sources
  of confusion with “Särdqvist percentages”. They answer different questions:
  gas-volume balance and fire-side extinction heat fraction, respectively.
- The book’s **`c_w`** is the right conceptual quantity for an evaporation/
  contact fraction, but the book explicitly says it has no data. It cannot be
  used as a numeric default.

### Gaps

- The official book PDF is image-only; the findings above come from targeted
  page-image inspection of the water chapters and index, not from full-book
  OCR. A numeric efficiency statement in an unexamined chapter cannot be ruled
  out absolutely, but the index and the relevant water/theory chapters were
  checked.
- The Swedish 2001 original was not inspected. Translation or updating could
  differ from the English 2002 text.
- The book’s 43 kW/m² example uses 20 °C inlet water, whereas the 1996 report’s
  theoretical calculations start at 10 °C. Do not mix the two reference states
  without recalculating.

## 3. Definitions, measurement basis, and access limitations

### Takeaway

Särdqvist’s 0.2 is a **heat-absorption/cooling efficiency** (actual heat
absorption ÷ a declared theoretical maximum), not an evaporation fraction,
not a contact/delivery fraction, and not a tactical flow factor. It is an
**assumption informed by an upper-limit derived from four small-room tests**;
the report explicitly says there are no systematic measurements. The 2002 book
gives no numeric efficiency and explicitly says `c_w` is unknown. The
often-repeated “20 %” should therefore be labelled a planning assumption with
its 1996 denominator, never a measured evaporation or application efficiency.

### Cited Findings

#### 3.1 Definitional separation

| Quantity | Numerator / denominator | What Särdqvist actually says |
|---|---|---|
| **Evaporation fraction** (mass) | water mass vaporised ÷ water mass applied | No numeric measured value in either source. The 2002 book’s `c_w` is “proportion of water reaching and vaporising at the fuel surface” but “no data available” (pp. 315–316). The 70/30 split on p. 154 is an illustrative gas-volume assumption, not a measurement. |
| **Heat-absorption / cooling efficiency** (energy) | actual heat absorption rate ÷ declared maximum theoretical heat absorption rate for the same water flow | The 0.2/0.3/0.4 factors (1996 pp. 55–56). The ~0.3 measured upper limit (p. 53). The 0.32 fuel-surface assumption (p. 54). This is the only numeric “efficiency” Särdqvist gives. |
| **Application/contact fraction** (mass) | water mass reaching a defined target ÷ water mass applied | Not numerically defined by Särdqvist in these sources. A separate “as little as 20 % may reach the burning fuel surface” claim is attributed by Barnett/Grimwood to Särdqvist & Holmstedt (2001); it is **not** the 1996 0.2 and its primary source was not verified here. See `grimwood-barnett.md`. |
| **Tactical flow factor** (flow ratio) | actual application rate ÷ critical application rate, or real-fire flow ÷ experimental flow | 2–4× critical for minimum total consumption (book p. 20); 0.6–1.8 vs 9–15 l/m²min, ~10× flow and ~30× time (book pp. 173–174); “of the order of 100 times more water than should be required theoretically” (1996 p. 54). None is a dimensionless heat efficiency. |
| **Fire-side extinction heat fraction** | heat that must be removed ÷ fire heat release | 45 % premixed, 30–35 % diffusion (1996 p. 52); 45 % premixed, 10–40 % diffusion (book p. 314). This is the inverse direction from water efficiency: it describes the fire, not the water. |

The key numerical trap: the 1996 report’s fog value is `0.2 × 10.8 =
2.16 MJ/kg`, while its large-droplet values are `0.2–0.4 × 2.6 =
0.52–1.04 MJ/kg`. The fog 0.2 is **not** “20 % of 3.6 MJ/kg”; it is 20 % of
the ×3 extinction capacity. If someone writes “Särdqvist efficiency = 20 % of
the water’s cooling capacity”, they are using the wrong denominator for fog.
[1996 pp. 52–56](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=58).

#### 3.2 Measurement basis

- The four tests behind the ~0.3 anchor are NISTIR 4625: four full-scale
  post-flashover tests in a **2.44 m cube burn room** connected to a 12.8 m
  corridor, with **nominally identical wood-crib fires** and a hand-held
  variable-pattern nozzle. The report measured gas temperatures, wall surface
  temperatures, O₂/CO₂/CO concentrations, water flow and drop size. Its
  abstract says 36.5 l/min at 930 µm volume-median drop size was “just able to
  control” the fire; 16.3 l/min did not.
  [NISTIR 4625](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir4625.pdf).
- NISTIR 4625 contains **no occurrence of “efficiency”** in its extracted text.
  The efficiency values are Särdqvist’s derived ratios, not a measurement
  reported by the experimenters.
- Särdqvist’s theoretical capacities are calculated from rounded enthalpy
  values (0.38, 2.26 MJ/kg; 0.00201 MJ/kg°C), starting at 10 °C. The 0.2 is a
  planning multiplier chosen below the ~0.3 upper limit, not a regression or
  calorimetric result.
- The report says the factor varies with **method, hose operator and
  equipment**, and with **distance/reach** (pp. 55, 73). It is therefore not a
  universal constant even within Särdqvist’s own model.
- A later Särdqvist & Svensson large-hall study, *Fire Tests in a Large Hall,
  Using Manually Applied High- and Low-Pressure Water Sprays* (2001), reports
  that the high-pressure system required “approximately two-thirds of the
  water of the low-pressure system for the same extinction capacity” in that
  test setup.
  That is a comparative equipment water demand, not a thermodynamic
  efficiency. The article has no text layer (0 characters, 17 pages); the
  statement was read from p. 15 of the page images.
  [J-STAGE article](https://www.jstage.jst.go.jp/article/fst/21/1/21_1_1/_article/-char/en).

#### 3.3 Access limitations

- **The 2002 book is a scan with no text layer.** `pymupdf` reports **0
  extractable characters across all 340 PDF pages**. The prior run’s “no
  extractable text” is confirmed. To read it, `pymupdf` 2.0 was installed
  manually from a manylinux wheel (pip/ensurepip were unavailable) and the
  relevant pages were rendered as images at 100–130 dpi and read directly.
  No OCR engine was used. The inspected set: contents (PDF pp. 5–7), index
  (PDF pp. 332–335), water chapters (printed pp. 147–180 / PDF pp. 149–182),
  extinguishing-theory surface-impact section (printed pp. 312–318 / PDF
  pp. 314–320), and bibliography (printed pp. 321–328 / PDF pp. 323–330).
- **The 1996 report has a text layer.** 164,136 characters over 85 PDF pages.
  Key pages were extracted and also rendered as images to verify the
  typography and table values. Printed page = PDF page − 6.
- **No paywalls or bot challenges were bypassed.** Both Särdqvist PDFs were
  direct official/library downloads. Hartin’s article was fetched normally.
- The 1996 report’s printed formula on p. 52 contains `(1000-100)` where the
  stated 600 °C endpoint requires `(600-100)`; the 3.6 MJ/kg result matches the
  latter. This is an apparent typo, not a second endpoint.
- The 1996 report uses 2.26 MJ/kg latent heat and 0.00201 MJ/kg°C steam
  specific heat; these are rounded teaching values, not modern NIST
  reference-state values. Do not “correct” Särdqvist’s arithmetic with modern
  values and then attribute the result to him.
- Hartin’s secondary claim is broader than the primary source:

  > “Experimental data (Hadjisophocleous & Richardson, 2005; Särdqvist, S.,
  > 1996) has shown that the cooling efficiency of water in both laboratory
  > experiments and actual firefighting operations ranges from 0.2 to 0.6.
  > Särdqvist (1996) suggests that an efficiency factor of 0.2 be used for
  > interior fog nozzles.”

  The 0.2 is verified in the 1996 report. The **0.6 upper bound is not** in the
  1996 report: Särdqvist’s measured upper limit is about 0.3, and his other
  numeric values are 0.32, 0.2, 0.3 and 0.4. Hartin’s 0.2–0.6 is a synthesis
  across sources, not a Särdqvist range.
  [Hartin](https://commandcompetence.com/post/effective-and-efficient-fire-streams/);
  [Särdqvist 1996, pp. 53–55](https://lup.lub.lu.se/search/files/5735831/1048740.pdf#page=59).

### Inferences

- **Correct citation for the 0.2:** “Särdqvist 1996, pp. 55–56: η = 0.2
  heat-absorption assumption for interior fog nozzles, applied to a
  10.8 MJ/kg flame-extinction capacity (3.6 MJ/kg × 3).” Do not cite
  “Särdqvist 2002” and do not call it an evaporation fraction.
- **If a simulator uses 0.2, declare the denominator.** For fog, the
  arithmetic is `0.2 × 10.8 = 2.16 MJ/kg`; for large droplets,
  `0.2 × 2.6 = 0.52 MJ/kg`. These are not interchangeable. A single “η = 0.2”
  without the reference capacity is ambiguous by a factor of about 4.
- **Do not convert the 0.2 into “20 % of the water evaporates.”** The 0.2 is
  an energy ratio with a ×3-inflated denominator for fog; the implied physical
  enthalpy fraction at 600 °C is 60 %, and there is no measured mass fraction.
- **Do not use the 2002 book’s 43 kW/m² as an efficiency base without its
  caveat.** It assumes full vaporisation, which the book says is abnormal.
- **The 100× and 2–4× figures are tactical/application factors.** They belong
  in a required-flow or water-demand model, not in a thermodynamic efficiency
  coefficient.
- **The only defensible statement about a measured, transferable efficiency
  is negative:** no measured water-application efficiency or evaporation
  fraction is provided. The 0.2 is a labelled assumption, and the ~0.3 is an
  upper limit from four small-room tests.

### Gaps

- NISTIR 4625 was text-searched for “efficiency” (zero hits) and its abstract
  and test description were read, but its full test-by-test data were not
  independently reduced to a heat balance here. The companion
  `grimwood-barnett.md` did inspect it and matches the four flows/conditions
  in Särdqvist Table 6.
- The primary source for the separate “20 % contact/delivery” claim
  (Särdqvist & Holmstedt 2001, cited by Barnett/Grimwood) was not obtained in
  this pass. It must not be conflated with the 1996 0.2.
- The 2002 book’s Swedish original (2001) was not inspected; only the English
  2002 edition was.
- Full-book OCR of the 340-page 2002 book was not performed. The conclusion
  “no numeric efficiency in the book” is limited to the contents, index,
  water chapters and extinguishing-theory surface-impact section that were
  inspected. The index’s lack of a water-efficiency entry is strong but not
  absolute proof for the unexamined chapters.
- The 1996 report’s Table 6 efficiency column is a derived ratio; the report
  does not print the formula. The reconstruction is exact to the printed
  values but remains an inference.
