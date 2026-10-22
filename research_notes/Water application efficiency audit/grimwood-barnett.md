# Grimwood / Barnett / Hadjisophocleous — water application efficiency audit

Audit date: 2026-10-22
Scope: what the primary sources behind the commonly cited fire-stream
"efficiency" percentages actually say, how the numbers are defined, what is
measured vs assumed vs calibrated, and what could not be verified.

Working files: `/tmp/opencode/water-audit/` (PDFs, extracted text, HTML,
metadata). No paywalls or bot challenges were bypassed.

## Bottom line

1. **No source located provides a measured fraction of applied water that
   evaporates, or a measured "thermal efficiency" in the sense of heat absorbed
   by water / heat released by the fire.** The numbers in circulation are a
   chain of design assumptions, tactical calibrations, and derived ratios.

2. The chain is roughly:

   - **0.32 / one-third / 0.84 MW per L/s** — a fuel-surface cooling
     *assumption* attributed to Barnett et al., *Fire Safety in Tall Buildings*
     (1992), quoted by Särdqvist (1996). It assumes steam is not heated above
     100 °C and that 32% of the theoretical 2.6 MJ/kg is effective:
     0.32 × 2.6 = 0.832 ≈ 0.84 MW per L/s.
   - **0.50** — the water-application factor *recommended* in Barnett's
     TP 2004/1 for jet nozzles. Grimwood's 2010 FPA article says it was used to
     produce a flow factor consistent with the TFR 1989 real-fire flow data
     (0.38 L/s/MW). It is a design/tactical calibration, not a calorimetric
     measurement.
   - **0.75** — an illustrative fog-nozzle case in TP 2004/1 and Grimwood
     (2005). It is *not* the value used to produce the 0.38 L/s/MW factor; the
     final factor uses 0.50.
   - **0.385 L/s/MW (0.38)** — a required-flow factor:
     `F = kF × Qmax / (kW × QW)` with kF = 0.50, kW = 0.50, QW = 2.6 MW per
     L/s. It is not an efficiency, and it must not be inverted into one.
   - **20%** — the fraction of water flow that may *strike/reach the burning
     fuel surface* (a contact/delivery fraction), not a thermal efficiency.
     TP 2004/1 cites Särdqvist & Holmstedt (2001) for it; that paper was not
     accessible, so the 20% remains unverified at primary level.
   - **H&R 0.3–0.6** — a cooling-efficiency range in a required-flow model;
     secondary sources describe it as a selected input, not a measurement.
     The H&R paper itself was inaccessible.

3. The only controlled laboratory dataset located that yields an
   efficiency-like ratio is **Särdqvist (1996), Table 6**, derived from four
   NISTIR 4625 tests (Stroup & Evans, 1991). It gives
   efficiency factors of **0.11, 0.24, 0.29** (a fourth test with no control,
   0.69, is excluded), with a stated maximum of about **0.3**. But Särdqvist's
   η is relative to a *theoretical extinction capacity* that already assumes
   only ~30–35% of the fire's heat must be removed; it is not a measured
   evaporation fraction. The NIST experimenters did not report "efficiency."

4. **Do not use 0.32, 0.50, 0.75, or 0.38 as a measured thermal efficiency or
   universal evaporation fraction.** If the simulator uses one, label it a
   design/tactical assumption or scenario parameter, separate from the
   theoretical 2.6 MJ/kg endpoint.

## Source access

| Source | Citation | Access | Local file | Status |
|---|---|---|---|---|
| Grimwood 2005 | P. Grimwood, *Fire-fighting Flow-rate: Barnett (NZ) – Grimwood (UK) Formulae*, Jan 2005 | Mirror: `https://www.highrisefire.co.uk/docs/FLOW-RATE%20202004.pdf` (702,626 bytes, 38 PDF pages) | `grimwood.pdf`, `grimwood.pdf.txt` | Full text extracted |
| Barnett TP 2004/1 | C. Barnett, *Calculation Methods for Water Flows Used for Fire Fighting Purposes*, SFPE (NZ) TP 2004/1, 25 Nov 2004 | Mirror: `https://www.highrisefire.co.uk/docs/sfpe-TP2004-1.pdf` (279,973 bytes, 18 PDF pages) | `tp2004-1.pdf`, `tp2004-1.pdf.txt` | Full text extracted; pp. 2, 4, 5, 11 image-only |
| Särdqvist 1996 | S. Särdqvist, *An Engineering Approach to Fire-Fighting Tactics*, Lund Report 1014, 1996 | `http://www.cfbt-be.com/images/teksten/collegas/Engineering-Approach-to-Fire-Tactics.pdf` (470,832 bytes) | `sard1996.pdf`, `sard1996.pdf.txt` | Full text extracted |
| NISTIR 4625 | D. W. Stroup, D. D. Evans, *Suppression of Post-Flashover Compartment Fires Using Manually Applied Water Sprays*, NISTIR 4625, July 1991 | `https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir4625.pdf` (3,077,525 bytes) | `nistir4625.pdf`, `nistir4625.pdf.txt` | OCR text layer; test data verified |
| FPA 2010 | P. Grimwood, "Flow method", *Fire and Risk Management Journal*, 1 Mar 2010 | `https://www.thefpa.co.uk/fire-and-risk-management-journal/feature-articles/flow-method` | `fpa-flow.html` | Full article fetched |
| H&R 2005 | G. V. Hadjisophocleous, J. K. Richardson, "Water Flow Demands for Firefighting", *Fire Technology* 41(3):173–191, July 2005, DOI `10.1007/s10694-005-1269-6` | Closed; Springer returns a 3,038-byte bot challenge; OpenAlex `is_oa: false`; no OA repository copy found | `hr2005.pdf` (challenge HTML), metadata JSON | Primary not inspected |
| Canterbury 2020 | *Assessing Firefighting Water Supplies*, Report 175, Jan 2020, §2.1.16 | PDF download blocked by Incapsula (212-byte challenge); search snippet available | `canterbury2020.pdf` (challenge) | Secondary only |
| Hartin 2009 | "Effective and Efficient Fire Streams", Command Competence, 26 Nov 2009 | `https://commandcompetence.com/post/effective-and-efficient-fire-streams/` | — | Secondary synthesis |

Original Grimwood URL `www.fire-flows.com` no longer resolves
(`curl: (6) Could not resolve host`). The Wayback snapshot
`http://web.archive.org/web/20220705192845/http://www.fire-flows.com/FLOW-RATE%20202004.pdf`
is only 2,198 bytes and is unusable. The highrisefire.co.uk mirror was used.

## Grimwood 2005

Full citation on title page: *Fire-fighting Flow-rate: Barnett (NZ) – Grimwood
(UK) Formulae*, Paul Grimwood, www.firetactics.com, London Fire Brigade
(retired), published January 2005. Footer: `GRIMWOOD Page N 18/01/2005`.

Page mapping: footer p. 26 = PDF p. 30; footer p. 27 = PDF p. 31; footer p. 28 =
PDF p. 32; footer p. 29 = PDF p. 33. Cite footer page numbers, not PDF indices.

### The efficiency passage (footer p. 26)

> **Efficiency in Fires (18)**
>
> Water can never be applied at 100% efficiency for various reasons, and most
> building fires do not retain 100% of the heat energy in the room where the
> fire is occurring. The net result is that both the energy absorption of the
> water and the energy production of the fire need to be modified by calculated
> efficiency factors.
>
> These can be expressed as -
> (a) heat absorption efficiency of a fire hose;
> (b) heat production efficiency of a compartment fire.
>
> **Heat Absorption Efficiency of a Fire Stream (18)**
>
> The heat absorption described so far illustrates perfect conditions for the
> absorption of heat by the water. A tactical water application directly into
> the fire rarely approaches 100% efficiency in most cases. Unlike a laboratory
> test, there will always be inefficiencies and variables in the application of
> water to a compartment fire. … In some situations, as little as 20% of the
> water flow may actually reach the burning fuel surface.
>
> There have been several attempts to estimate reliable efficiency factors for
> firefighting streams, often based on extrapolated data from theoretical
> computer models. However in general, the most accurate of all these efficiency
> factors are those that result following pain-staking research covering many
> hundreds of real fires. Previous research has indicated that to overwhelm a
> fire, the efficiency of water as a cooling medium is about one-third, or 0.32.
> Thus it was proposed then that the effective cooling capacity of a flow of 1
> l/s is 0.84 MW, or a standard 10 l/s fire hose is 8.4 MW, demonstrating a
> practical cooling capability with 33% efficiency. However, more recent
> research based on extensive real fire data suggests a 33% factor maybe
> somewhat under-estimated. A figure of three quarters (75% efficient) appears
> more reliable for a fog pattern and one-half (50% efficient) for a solid-bore
> stream. The cooling power of each kg (litre) of water per second applied to a
> fire increases with temperature. Therefore the selection of an effective
> cooling power of only 0.84 MW (100deg.C) may be seen as somewhat
> conservative. At 400deg.C the cooling power can be seen to be closer to 1 MW
> and at 600deg.C it is close to 1.2 MW (see Fig.8).

Notes on this passage:

- The 0.32/0.84 MW figures are explicitly "previous research"; the 0.75/0.50
  figures are asserted as "more recent research based on extensive real fire
  data" but no dataset, citation, or uncertainty is given in the passage.
  Reference `(18)` points to Barnett's TP 2004/1.
- "20% … reach the burning fuel surface" is a **contact/delivery** fraction. It
  is not the fraction evaporated and not the thermal efficiency.
- The 75%/50% are "efficient" in the sense of the fraction of the theoretical
  2.6 MJ/kg cooling capacity assumed available. They are not measured
  evaporation fractions.

### Examples (footer pp. 27–29)

| Example | Calculation | Result | Meaning |
|---|---|---|---|
| 4 (p. 27) | 7 kg/s × 2.6 MJ/kg × 1.00 | 18.2 MW | theoretical absorption, 100 °C steam |
| 5 (p. 27) | 7 kg/s × 2.6 × 0.75 | 13.6 MW | "fog nozzle" at 75% |
| 6 (p. 28) | 7 kg/s × 2.6 × 0.50 | 9.1 MW | "jet nozzle" at 50% |
| 8 (p. 29) | 7 kg/s × (0.50 × 2.6)/0.50 | 18.2 MW | labelled "total energy that can be absorbed by the water flow" |

Example 8 is mislabelled. The water-side absorption at 50% is 9.1 MW, not
18.2 MW. The division by the fire efficiency kF = 0.50 turns the result into
the fire HRR that the stream can control (18.2 MW), not the heat absorbed by
the water. The same algebra appears in TP 2004/1 Example 11.1 (32.5 MW vs
16.25 MW water-side).

Grimwood then claims (p. 29):

> The reliability of this method is somewhat dependent on the accuracy of the
> heat release rate data and cooling efficiency value used, which in this case
> is based on real fire data obtained from structural enclosures.

This is an assertion of empirical basis, not a measurement. The 2010 FPA
article (below) supplies the actual provenance: the 0.50 was used to produce a
flow factor consistent with the TFR 1989 flows.

### Do not confuse two different "0.38"s

- Grimwood p. 25: "for each MJ of fuel … a firefighter theoretically needs
  0.38 kg of water as steam at 100 °C" — this is simply 1 / 2.6 kg/MJ.
- The tactical flow factor is 0.385 **L/s per MW** = 0.5 / (0.5 × 2.6). They
  are numerically similar but dimensionally and conceptually different.

### Other context

- Grimwood's 1989 TFR study covered 100 serious London fires; the 58-brigade
  survey found 89% of brigades flowing less than they realised, some as little
  as 16% of target. These are tactical flow observations, not efficiency
  measurements.
- Table 1 (footer p. 6) is "estimated percentages of use for each suppression
  tactic" (direct, indirect, 3D, etc.), not efficiency percentages.
- Grimwood PDF p. 5 says his earlier research "has been used by Cliff Barnett
  … to update fire stream efficiency factors." PDF p. 8: "In December 2004,
  New Zealand Fire Engineer Cliff Barnett turned to my earlier practical work
  and fire-ground formula to update his own world-renowned efficiency
  factors…" This supports the view that the 2004 values are a
  Barnett–Grimwood calibration, not independent lab measurement.

## Barnett TP 2004/1

Full citation: SFPE (NZ) Technical Publication TP 2004/1, *Calculation Methods
for Water Flows Used for Fire Fighting Purposes*, 25 November 2004, Cliff
Barnett (FSFPE, Dist FIPENZ, Past President SFPE NZ Chapter). 18 PDF pages.
PDF page = printed page (footer `- 6 -`). PDF pp. 2, 4, 5, and 11 are
image-only (no extractable text).

### Efficiency section (p. 6)

> **8. EFFICIENCY IN FIRES**
>
> Water can never be applied at 100% efficiency for various reasons, and most
> building fires do not retain 100% of the heat energy in the room where the
> fire is occurring. The net result is that both the energy absorption of the
> water flow available and the energy production of the fire need to be
> modified by the following efficiency factors. These can be expressed as:-
> (a) heat absorption efficiency of a water main;
> (b) heat production efficiency of a building fire.
>
> **9. HEAT ABSORPTION EFFICIENCY OF WATER FLOW FROM A FIRE MAIN**
>
> … On the fire ground, the application of water from a fire main into a fire
> rarely approaches 100% efficiency in most cases. … As little as 20% of the
> water flow may actually strike the burning fuel surface [8]. If kw is taken
> as the cooling efficiency of a water flow, then a figure of 50% is
> recommended for jet nozzle use in TP 2004/1. Even if a fire fighting team does
> manage to use the water flow efficiently, for the design of water mains is
> recommended that 50% should be allowed for suppression plus 50% extra to
> cover exposures, leaks, strong wind, accessibility, etc.

Important distinctions:

- The **20%** is a contact/delivery fraction for poor application, cited to
  Särdqvist & Holmstedt (2001) [8]. It is not the recommended design value.
- The **50%** is the recommended *cooling efficiency* for jet nozzles. In the
  same paragraph, "50% for suppression plus 50% extra" is a **design reserve**
  split (suppression vs exposures/leaks/wind), not a second thermal efficiency.
  The text conflates the two ideas.
- There is no experimental dataset in TP 2004/1 for the 50% or 75% values.

### Heat absorption calculation (p. 3)

`1 kg water, 18 °C → steam at 100 °C`:

`4.183 kJ/kg°C × (100 − 18) + 2257 kJ/kg = 343 + 2257 = 2600 kJ/kg = 2.6 MJ/kg`

This assumes complete conversion to steam at 100 °C, no superheat. It is a
theoretical endpoint, not an application efficiency.

### Examples 9.1–9.3 (p. 6)

| Example | Calculation | Result |
|---|---|---|
| 9.1 | 12.5 L/s × 2.6 MJ/L × 1.00 | 32.5 MW |
| 9.2 | 12.5 × 2.6 × 0.75 | 24.4 MW |
| 9.3 | 12.5 × 2.6 × 0.50 | 16.3 MW |

Example 9.4 (p. 7): a 100 m² office fire at 0.25 MW/m² = 25 MW. A 12.5 L/s fog
line at 75% "could deliver just enough water flow to control and extinguish"
it; at 50% it "will not be able to control" it — unless the fire burns at less
than 100% efficiency (kF < 1), in which case 12.5 L/s "may be more than
sufficient."

This is the key internal logic: the water-side 16.3 MW is compared directly to
the 25 MW fire, without applying the kF factor. Once kF = 0.5 is applied, the
same stream controls 32.5 MW. That is why the 0.385 factor is lower than a
naive 1/(0.5 × 2.6) = 0.769 L/s/MW.

### Fire efficiency kF (p. 9)

TP 2004/1 adopts kF = 0.50 as a conservative design value; Hamarthy's range is
0.50 down to 0.10. The text says 50% of Qmax can be taken as the heat released
inside the building, with the other 50% leaving via openings (QUB). This is a
design assumption, not a measured efficiency for a particular fire.

### Example 11.1 (p. 10) — the mislabel

> If the efficient use of a water main at 12.5 l/s is only 50%, as in Example
> 9.3, and the combustion efficiency of the fire is only 50%, find the total
> energy that can be absorbed from the water main:-
>
> QS = 12.5 l/s × (0.50 × 2.6 MJ/kg) / 0.50 = 32.5 MW

The water-side absorption is 12.5 × 2.6 × 0.50 = **16.25 MW**. The 32.5 MW is
the fire HRR that can be controlled at kF = 0.50. The wording "absorbed from
the water main" is wrong by a factor of 1/kF = 2.

### Summary (p. 12)

> 1 kg of water at an initial temperature of 18°C converted to steam at 100°C
> will absorb 2.6 MJ of heat energy. Based on this property alone, it can be
> calculated that using a water main at a conservative 50% efficiency to
> control a fire burning at a conservative 50% efficiency, a fire fighting
> water flow of F = 0.385 l/s/MW of Qmax will be needed.

So:

`F/Qmax = kF / (kW × QW) = 0.50 / (0.50 × 2.6) = 0.3846 L/s per MW`

This is the origin of the 0.385 (0.38) flow factor. It is a **design flow
factor**, not an efficiency.

### References (p. 13)

- `[5]` Barnett et al., *Fire Safety in Tall Buildings*, McGraw-Hill, New York,
  Chapter 10 (1992).
- `[8]` Särdqvist, S. and Holmstedt, G., "Water for Manual Fire Suppression",
  *Journal of Fire Protection Engineering*, Vol. 11, Nov 2001.

Appendix A / Fig. 6 (p. 14) restates: "Heating Efficiency 0.50, Cooling
Efficiency 0.50, Heat of Combustion 18 MJ/kg."

## The earlier 0.32 and the citation chain

Särdqvist (1996), p. 54:

> Others have suggested an efficiency factor of 0.32 for a water hose
> delivering water at a rate of 10 kg/s [32]. This efficiency factor concerns
> the fuel surface cooling effect. Here it was assumed that the steam is not
> heated above 100°C, giving an heat absorption capacity of 0.8 MJ/kg.

Reference `[32]` is *Fire Safety in Tall Buildings*, Council on Tall Buildings
and Urban Habitat, McGraw-Hill, 1992 — the same Barnett et al. chapter cited
by TP 2004/1 as `[5]`.

Therefore:

- 0.32 is a **fuel-surface cooling assumption** for a 10 kg/s hose, with steam
  capped at 100 °C (effective absorption 0.8 MJ/kg).
- 0.32 × 2.6 = 0.832 ≈ 0.84 MW per L/s, exactly Grimwood's "effective cooling
  capacity."
- The FPA 2010 article confirms the draft TP 2004/1 used a 0.33 factor:
  "The flow factor originally used in the draft paper was 0.58 … based on
  established efficiency factors used at the time (0.33) for water as applied
  to structural fires."
- The draft 0.58 L/s/MW is consistent with `0.50 / (0.33 × 2.6) = 0.583`,
  i.e., kF = 0.50 and kW = 0.33. The final 0.38 is `0.50 / (0.50 × 2.6) =
  0.385`, i.e., kF = 0.50 and kW = 0.50.

So the "0.32/0.33" and "0.50" are successive versions of the same design
parameter, not independent measurements. The 0.32 traces to a 1992 book
assumption; the 0.50 was calibrated to 1989 London fire flows.

## Särdqvist 1996: the only controlled experimental dataset

Citation: Stefan Särdqvist, *An Engineering Approach to Fire-Fighting Tactics*,
Department of Fire Safety Engineering, Lund University, Report 1014, 1996,
ISSN 1102-8246, ISRN LUTVDG/TVBB--1014--SE.

### The experiment (p. 53)

> In a series of tests, where a BA team used a fog nozzle to overcome a
> flashover fire, the maximum efficiency factor proved to be about 0.3 [31].
> The investigation included four extinguishing tests, which are summarised in
> Table 6. As these tests were performed in a small room and under the best of
> circumstances, we should regard the efficiency factor as an upper limit. With
> a larger nozzle in a larger room, there will be a distribution problem.

Table 6 (reproduced):

| Water flow (kg/s) | Room temp (°C) | Theoretical absorption (MJ/kg) | Theoretical extinction (MW) | Extinction HRR (MW) | Efficiency |
|---:|---:|---:|---:|---:|---:|
| 1.32 | 820 | 4.08 | 16.0 | 1.8 | 0.11 |
| 0.608 | 800 | 4.04 | 7.4 | 1.8 | 0.24 |
| 0.608 | 780 | 4.00 | 7.3 | 2.1 | 0.29 |
| 0.272 | 720 | 3.88 | 3.2 | 2.2 | (0.69, no control) |

Definition: **η = extinction HRR / theoretical extinction capacity**, where
the theoretical extinction capacity is **3 × flow × theoretical absorption
capacity**. The ×3 comes from the statement (p. 54):

> For diffusion flames, the removal of 30 to 35% of the released energy is
> sufficient [30]. … This indicates that for diffusion flames, the theoretical
> absorption capacity should be multiplied by a factor of 3 to obtain the
> extinction capacity.

So the Table 6 η is *not* "fraction of water's heat absorption capacity used."
The implied fraction of absorption capacity used at extinction is η × 3:

- test 1: 0.11 × 3 = 0.33 (33% of 4.08 MJ/kg ≈ 1.35 MJ/kg)
- test 2: 0.24 × 3 = 0.72
- test 3: 0.29 × 3 = 0.87
- test 4: 0.69 × 3 = 2.07 (no control; meaningless as an efficiency)

This is the crucial definitional point. The "0.11–0.29" values are relative to
an extinction capacity that already assumes only one-third of the fire's heat
must be removed. They are not evaporation fractions, and they are not directly
comparable to a 0.50 "efficiency" applied to 2.6 MJ/kg unless the reference
temperature and the ×3 convention are reconciled.

Reconciliation example: Särdqvist's 0.11 with 4.08 MJ/kg implies an effective
absorption at extinction of 0.11 × 3 × 4.08 ≈ 1.35 MJ/kg. Barnett/Grimwood's
0.50 with 2.6 MJ/kg implies 0.50 × 2.6 = 1.30 MJ/kg. The two numbers look very
different but land in nearly the same place, because the reference capacities
(4.08 vs 2.6 MJ/kg) and the ×3 extinction convention differ. They are not
independent confirmation of a measured 50% or 11% evaporation fraction.

### The primary experiments: NISTIR 4625

The four tests in Table 6 are the four tests in:

D. W. Stroup and D. D. Evans, *Suppression of Post-Flashover Compartment Fires
Using Manually Applied Water Sprays*, NISTIR 4625, July 1991 (Särdqvist's
reference list gives 1992), prepared for Brandforsk. Särdqvist cites this
report as [31].

Verified from the report:

- 2.44 m cube burn room, wood crib fires.
- Peak heat release rates: 1.8–2.6 MW (Table 9: 2.2, 1.8, 2.3, 2.6 MW).
  Table 6's HRR column is the HRR at extinction, not the peak HRR.
- Nozzle flows: 36.5 L/min (tests 1–2), 16.3 L/min (test 3), 79.0 L/min
  (test 4); these correspond to 0.608, 0.608, 0.272, and 1.32 kg/s, matching
  the four flows in Särdqvist's Table 6.
- The report presents heat release, temperature, gas concentration, and drop
  size data. **No "efficiency" factor appears in the report's extracted text.**
  The 0.11,
  0.24, 0.29 values are Särdqvist's derived ratios.

Limits: four tests, one room geometry, one fuel type (wood crib), one nozzle
type, small scale. Särdqvist himself calls the result an upper limit because
the tests were "performed in a small room and under the best of
circumstances."

### Särdqvist's planning assumptions (pp. 55–56)

Rather than a measured efficiency, the report uses:

> · The maximum heat absorption capacity for water is 2.6 + (T − 100) · 0.00201
> [MJ/kg].
> · For nozzles delivering droplets smaller than 1 mm, T is the smoke
> temperature. … This gives a maximum heat absorption of 3.6 MJ/kg, which is
> multiplied with a factor of 3, giving 10.8 MJ/kg in flame extinction
> capacity.
> · An efficiency factor of 0.2 is used for interior fog nozzles.
> · For nozzles delivering droplets larger than 2 mm, T is 100, giving a
> maximum heat absorption of 2.6 MJ/kg.
> · An efficiency factor of 0.2 is used for long-range, well placed monitors.
> · An efficiency factor of 0.3 is used for long-range, well placed nozzles.
> · An efficiency factor of 0.4 is used for short-range, well placed nozzles.

Table 7 then gives, for example:

| Equipment | Max absorption (MJ/kg) | Flow (kg/s) | Efficiency | Capacity (MW) |
|---|---:|---:|---:|---:|
| Standard nozzle 7 mm | 2.6 | 1.3 | 0.4 | 1.4 |
| Standard nozzle 14 mm | 2.6 | 4.8 | 0.4 | 5.0 |
| Standard nozzle 22 mm | 2.6 | 9.2 | 0.3 | 7.2 |
| Large-capacity nozzle | 2.6 | 16.7 | 0.3 | 13 |
| Monitoring nozzle | 2.6 | 40 | 0.2 | 21 |
| Fog nail | 3.6 × 3 | 1.2 | 0.2 | 2.6 |
| Fog nozzle (BA team) | 3.6 × 3 | 5.0 | 0.2 | 11 |
| Fog nozzle (BA team) | 3.6 × 3 | 7.9 | 0.2 | 17 |

These are "practically applicable assumptions" (the report's words), not
measurements. Note the inconsistent reference: large-droplet nozzles apply the
efficiency directly to 2.6 MJ/kg; small-droplet nozzles apply it to 10.8 MJ/kg
(3.6 × 3). The numbers are not a single, uniform efficiency definition.

### The "100×" real-fire data are not an efficiency source

Särdqvist p. 54, discussing real-fire data from the 1950s–60s:

> It suggests that the fire brigades used of the order of 100 times more water
> than should be required theoretically. This indicates a potential for
> improvement of fire-fighting operations.

But p. 55 explicitly rejects using those data to derive an efficiency factor:

> The efficiency factor varies with the method used, with the hose operator and
> with the equipment. Unfortunately, there are no systematic measurements of
> the actual extinction capacity of water. Thus, the efficiency must be
> estimated.

The "100×" is a tactical water-use observation, not an efficiency percentage.
It must not be inverted into "1% efficiency."

## Hadjisophocleous & Richardson 2005

Bibliographic record (verified via Crossref, FireDOC, SafetyLit):

- G. V. Hadjisophocleous and J. K. Richardson, "Water Flow Demands for
  Firefighting", *Fire Technology* 41(3):173–191, July 2005.
- DOI: `10.1007/s10694-005-1269-6`.
- Authors: George V. Hadjisophocleous, Carleton University, Ottawa; J. Kenneth
  Richardson, Ken Richardson Fire Technologies Inc., Ottawa.
- FireDOC keywords: water flow, heat release rate, fire fighting, water supply,
  pipes, extinguishing, exposures, fire load, fire flow, equations, case
  histories, sprinklers. Identifiers include fire area, total quantity of
  water, flow rate, offensive/defensive operations, fire load densities, ISO
  method comparisons, case-study comparisons.
- FireDOC lists NRCC-45663 for this paper; the NRC Publications Archive search
  for `NRCC-45663` returned no record. The FireDOC corporate entry is Carleton
  University and Ken Richardson Fire Technologies, so the paper should not be
  treated as an NRC experimental report without the primary text.

### Access failure (documented, not bypassed)

- `https://link.springer.com/content/pdf/10.1007/s10694-005-1269-6.pdf` →
  HTTP 200, `text/html; charset=utf-8`, 3,038 bytes. The body is a bot/client
  challenge (CSP/default-src), not the PDF.
- `https://link.springer.com/article/10.1007/s10694-005-1269-6` → same
  3,038-byte challenge.
- Crossref metadata has no abstract and points only to Springer full text.
- OpenAlex: `is_oa: false`, `oa_status: closed`, no repository full text.
- Semantic Scholar: abstract elided by publisher; `openAccessPdf` status
  `CLOSED`.
- NRC Publications Archive: `?q=NRCC-45663` returned no record; a broader
  `?q=Hadjisophocleous` search returned 137 results but not this paper on the
  first page; CSV export returned 404.
- No legitimate OA copy was found.

### What secondary sources say

**Canterbury 2020, Report 175, §2.1.16 ("Carleton University Method")**
(search snippet; PDF blocked):

> The cooling efficiency of water (η) is usually selected in a range of 0.3 to
> 0.6 for different types of nozzle applied. The detailed guidance for
> determining this factor can be found in the document of *An Engineering
> Approach to Fire-Fighting Tactics* from Lund University.

The report describes H&R's offensive and defensive flow equations and says the
method was compared with ISO and OBC; it is not intended for special occupancy
hazards.

**Hartin 2009, "Effective and Efficient Fire Streams"**:

> Experimental data (Hadjisophocleous & Richardson, 2005; Särdqvist, S., 1996)
> has shown that the cooling efficiency of water in both laboratory experiments
> and actual firefighting operations ranges from 0.2 to 0.6. Särdqvist (1996)
> suggests that an efficiency factor of 0.2 be used for interior fog nozzles. …
> Barnett (as cited in Grimwood, 2005) suggests that an efficiency factor of
> 0.5 be used for solid or straight stream application and 0.75 for fog
> application. The following table takes a slightly more conservative approach,
> using 0.6 as an average efficiency factor.

Hartin's "0.2–0.6" conflates Särdqvist's 0.2 assumption with Barnett/Grimwood's
0.5/0.75 recommendations. It is not evidence that H&R measured 0.2–0.6.

### Provisional conclusion on H&R

Everything available indicates a **water-flow demand methodology** (offensive
and defensive flow equations, case studies, comparison with ISO/OBC), not an
experimental efficiency study. The cooling efficiency η appears to be an input
to the model. Secondary sources describe it as selected in the 0.3–0.6 range
and point to Särdqvist for guidance; H&R's own exact values and definition
remain unverified because the primary text was inaccessible. Do not cite H&R
as the primary source for a measured 0.2–0.6 efficiency.

## FPA 2010: the calibration account

P. Grimwood, "Flow method", *Fire and Risk Management Journal*, 1 March 2010,
`https://www.thefpa.co.uk/fire-and-risk-management-journal/feature-articles/flow-method`.

Key passages (verified in the saved HTML):

> The flow factor originally used in the draft paper was 0.58, which was
> commonly referred to by fire engineers, based on established efficiency
> factors used at the time (0.33) for water as applied to structural fires.
> This suggested that 0.58 litres/second was required to suppress each MW of
> heat output from a building or enclosure fire.

> The data from TFR 1989 was closely analysed by Cliff Barnett and its
> insertion into TP 2004/1 caused an amendment to the flow-rate factor where a
> greater efficiency factor had been noted with flow-rates used at actual
> building fires in London. These 100 fires were all serious in nature with
> some fire involvements up to 1,720 m² in floor area. A new efficiency factor
> of 0.50 was used to produce a flow factor of 0.38, which resulted in core
> flow rates of 5.7 litres/min per 250 kW/m² of involved fire load for optimum
> suppression of enclosure fires. This was consistent with the A × 6 "rule of
> thumb" formula (6 litres/min) suggested by TFR 1989.

Implications:

- The 0.50 produced a flow factor (0.38 L/s/MW) consistent with the empirical
  TFR 1989 flows. The article describes an amendment driven by that data, i.e.
  a **calibration**, not a calorimetric measurement.
- The draft 0.58 was based on 0.33; the final 0.38 is based on 0.50. The
  arithmetic implies both include the kF = 0.50 fire-efficiency factor. The article's shorthand "a new
  efficiency factor of 0.50 was used to produce a flow factor of 0.38" omits
  that kF = 0.50 is also in the formula, which is exactly how the 0.38 gets
  mistaken for an efficiency.
- The 0.38 flow factor is a **tactical requirement**, not an inverse thermal
  efficiency. `1 / 0.385 = 2.6 MW per L/s` is the theoretical heat absorption,
  not the effective fireground absorption.

## Classification table

| Claim | Source | Definition | Evidence type | What it is not |
|---|---|---|---|---|
| 0.32 / one-third / 0.84 MW per L/s | Barnett et al. 1992 via Särdqvist 1996 p. 54; Grimwood 2005 p. 26 | fuel-surface cooling factor, steam capped at 100 °C, effective 0.8 MJ/kg | design assumption | measured thermal efficiency |
| 0.50 | Barnett TP 2004/1 p. 6; Grimwood 2005 p. 26; FPA 2010 | fraction of theoretical 2.6 MJ/kg assumed available; jet nozzle | design recommendation + TFR 1989 calibration | measured evaporation fraction |
| 0.75 | TP 2004/1 p. 6 Example 9.2; Grimwood 2005 p. 26 | fog-nozzle illustrative case | example/assumption | basis of the 0.38 flow factor |
| 0.385 L/s/MW (0.38) | TP 2004/1 p. 12; FPA 2010 | `kF / (kW × QW)` = 0.5/(0.5×2.6) | design flow factor | efficiency |
| 20% | TP 2004/1 p. 6; Grimwood 2005 p. 26 | fraction of flow that may strike/reach the burning fuel surface | contact/delivery estimate, cited to Särdqvist & Holmstedt 2001 | thermal efficiency |
| 0.2 / 0.3 / 0.4 | Särdqvist 1996 pp. 55–56 | planning assumptions for interior fog, monitors, long-range and short-range nozzles | assumption | measurement |
| 0.11 / 0.24 / 0.29 | Särdqvist 1996 Table 6, derived from NISTIR 4625 | extinction HRR / (3 × flow × absorption) | derived from four small-room tests | evaporation fraction |
| H&R 0.3–0.6 | Canterbury 2020 §2.1.16; Hartin 2009 says 0.2–0.6 | cooling-efficiency input to a required-flow model | selected input (primary unverified) | measured efficiency |
| 2.6 MJ/kg | TP 2004/1 p. 3; Grimwood 2005 p. 25 | 18 °C liquid → 100 °C steam, complete conversion | thermodynamic endpoint | fireground absorption |
| 163.2 kW/gpm | foundations.md | 2.5915757 MJ/kg × 0.06297709 kg/s per gpm | theoretical endpoint | application efficiency |

## Unit and algebra audit

- `2.6 MJ/kg` assumes 1 kg water, 18 °C → 100 °C steam:
  `4.183 × 82 + 2257 = 343 + 2257 = 2600 kJ/kg`.
- `1 L/s ≈ 1 kg/s`, so `2.6 MJ/kg × 1 kg/L = 2.6 MJ/L = 2.6 MW per L/s`.
- `0.385 L/s/MW = 0.5 / (0.5 × 2.6)`. The numerator is kF (fire heat
  production efficiency); the denominator is kW (water cooling efficiency)
  times QW (theoretical absorption per unit flow). Dimensionally:
  `MW / (MW per L/s) = L/s`. Correct.
- `1 / 0.385 = 2.6 MW per L/s`. This is the theoretical absorption, not the
  effective absorption. The effective absorption at kW = 0.5 is 1.3 MW per
  L/s; the fire controlled is 2.6 MW per L/s because kF = 0.5.
- `0.32 × 2.6 = 0.832 ≈ 0.84 MW per L/s`. Correct.
- `0.38 kg/MJ = 1 / 2.6`. This is the theoretical mass of water per MJ, not
  the 0.38 L/s/MW flow factor.
- Example 11.1 (TP p. 10) and Example 8 (Grimwood p. 29) divide by kF = 0.5,
  which doubles the water-side absorption figure. The results (32.5 MW,
  18.2 MW) are controllable fire HRR, not heat absorbed by the water. The
  correct water-side values are 16.25 MW and 9.1 MW.
- The 0.75 fog value is not used in the 0.385 flow factor; the 0.50 value is.
  The 0.385 derivation in TP p. 12 explicitly uses 50% water efficiency and
  50% fire efficiency.
- `163.2099 kW/gpm` follows from `2591.5757 kJ/kg × 0.06297709 kg/s per gpm`
  (both from foundations.md). It is the theoretical heat absorption at the
  20 °C → 100 °C steam endpoint, not an application efficiency.

## What the sources support, and what they do not

Supported:

- The theoretical heat absorption of water is about 2.6 MJ/kg for 18 °C liquid
  to 100 °C steam; more if steam is superheated (about 4.08 MJ/kg at ~800 °C).
- Water application is inefficient: not all the flow reaches the burning fuel;
  real fires often use much more water than the theoretical minimum.
- A design flow factor of about 0.38 L/s per MW of compartment HRR was
  calibrated to 1989 London fire flows; it is a tactical/design planning
  value.
- The 0.32/0.33 value is an older design assumption, not a measurement.

Not supported:

- A measured 32%, 50%, or 75% thermal efficiency of water application.
- A universal evaporation fraction.
- 0.38 L/s/MW as an efficiency (or 1/0.38 as an effective cooling capacity).
- H&R's 0.3–0.6 as a measured experimental range (primary unverified).
- Any uncertainty bounds or confidence intervals for the 0.32/0.50/0.75
  values.

Implication for the simulator: if an application-efficiency parameter is used,
label it as a scenario/design assumption (e.g., "assumed effective absorption
fraction"), cite Barnett/Grimwood as tactical/design sources, and keep it
separate from the thermodynamic 2.6 MJ/kg endpoint. Do not present it as a
physically measured constant or invert a tactical flow multiplier into it.

## Gaps and unresolved items

- **H&R 2005 primary text**: closed access; Springer bot challenge; no OA
  repository copy found. Its exact η values and definition remain unverified.
  Secondary sources disagree (0.3–0.6 vs 0.2–0.6) and at least one conflates
  H&R with Särdqvist and Barnett/Grimwood.
- **Särdqvist & Holmstedt 2001** (`[8]` in TP 2004/1): paywalled; the 20%
  contact fraction could not be verified in the primary paper. The 2001
  abstract does not mention 20%.
- **Barnett et al. 1992**, *Fire Safety in Tall Buildings*, Chapter 10: not
  obtained. The 0.32 value is known only through Särdqvist's citation.
- **Canterbury 2020 PDF**: Incapsula challenge (212 bytes); only the search
  snippet for §2.1.16 was used.
- **TP 2004/1 image-only pages 2, 4, 5, 11**: no OCR; p. 11 likely contains
  Eq. 3 and a figure, but the summary and examples give the algebra.
- **NISTIR 4625**: four tests, one room (2.44 m cube), one fuel (wood crib),
  one nozzle type, small scale. Särdqvist derived the efficiency ratios; the
  experimenters did not report them. This is a narrow experimental base.
- **FPA 2010**: a retrospective by the same author whose TFR 1989 data were
  used; it is not an independent audit, though it is the clearest explanation
  of how 0.50 was derived.
- **No uncertainty analysis** in Barnett, Grimwood, or H&R. Särdqvist gives
  test values only, no confidence bounds.

## Files and URLs

Local (all under `/tmp/opencode/water-audit/`):

- `extract.py` — custom PDF text extractor (FlateDecode + text strings; no OCR).
- `grimwood.pdf`, `grimwood.pdf.txt` — Grimwood 2005 (38 PDF pages).
- `tp2004-1.pdf`, `tp2004-1.pdf.txt` — Barnett TP 2004/1 (18 PDF pages).
- `sard1996.pdf`, `sard1996.pdf.txt` — Särdqvist 1996.
- `nistir4625.pdf`, `nistir4625.pdf.txt` — Stroup & Evans 1991.
- `fpa-flow.html` — FPA article, 1 March 2010.
- `crossref.json`, `openalex.json`, `s2.json` — H&R metadata/access checks.
- `canterbury2020.pdf` — 212-byte challenge page, not the report.
- `fiera2002.pdf` — NRC/FIERA water-flow report (custom-font text layer
  unreadable; not used).

URLs:

- Grimwood mirror: `https://www.highrisefire.co.uk/docs/FLOW-RATE%20202004.pdf`
- TP 2004/1 mirror: `https://www.highrisefire.co.uk/docs/sfpe-TP2004-1.pdf`
- Särdqvist 1996: `http://www.cfbt-be.com/images/teksten/collegas/Engineering-Approach-to-Fire-Tactics.pdf`
- NISTIR 4625: `https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir4625.pdf`
- FPA 2010: `https://www.thefpa.co.uk/fire-and-risk-management-journal/feature-articles/flow-method`
- H&R DOI: `https://doi.org/10.1007/s10694-005-1269-6`
- Canterbury 2020: `https://www.fireandemergency.nz/assets/Documents/Files/Report_175_Assessing_Firefighting_Water_Supplies.pdf`
- Hartin 2009: `https://commandcompetence.com/post/effective-and-efficient-fire-streams/`
