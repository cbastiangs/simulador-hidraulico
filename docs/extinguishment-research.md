# Extinguishment research

> 2026-10-16. Sources, scope and arithmetic behind the extinguishment engine
> (`src/extinguishment/`) and the law `extinguish.fire-flow` (MODEL.md §3.12,
> ROADMAP §7.6 / §11 decision 8). The heat balance
> (`extinguish.absorption`) is still waiting on sources and is not implemented;
> its open questions are at the end.

This is a research record, not a model of fire. It fixes what the NFA
fire-flow formula is, what it is not, and the exact arithmetic the engine
reproduces, so code and tests rest on a traceable source rather than memory.

## 1. Sources

### 1.1 Primary — NFA fire-flow formula

**Strategy and Tactics for Initial Company Operations, Student Manual**, 3rd
edition, 2nd printing, July 2016. FEMA / US Fire Administration / National
Fire Academy.
<https://apps.usfa.fema.gov/ax/sm/sm_0455.pdf> (read 2026-10-16).

What it states, by slide (the PDF's printed page number is in parentheses):

- **SM2-27 (p. 101):** the "National Fire Academy Fire Flow Formula" is
  presented as an **empirical formula** that gives **100 % of the theoretical
  fire flow**.
- **SM2-28 (p. 102):** the law. **Q = (L × W) / 3**, in **US gpm**, with L
  and W the **length and width in feet of one fully involved floor**.
- **SM2-29 (p. 103):** the worked example, 40 ft × 30 ft: (40 × 30) / 3 =
  **400 gpm**. The same slide names that flow as the sum needed for the
  **confinement, extinguishment and backup lines**.
- **SM2-30 (p. 103):** scaling by involvement. 1000 gpm is the fully involved
  value; at **50 % involved → 500 gpm**, at **25 % involved → 250 gpm**.
- **SM2-31–SM2-35 (p. 103 ff.):** exposures and extension to more than one
  floor. **Out of scope** here (see §3).

### 1.2 Secondary — independent cross-check

**Fire Service Hydraulics (FIRE-1114), ch. 5: Calculating Fire Flow**,
Justice Institute of British Columbia (JIBC).
<https://pressbooks.bccampus.ca/esm1/chapter/chapter-5-calculating-fire-flow/>
(read 2026-10-16). It states the same formula, Q = (L × W) / 3, and gives the
same 40 ft × 30 ft example at **25 % involvement = 100 gpm**. It is a
secondary teaching source, not the authority; it is cited only because it
reproduces the primary number independently.

### 1.3 Context — the formula's limits

**Ed Hartin, "Estimating Required Fire Flow: The National Fire Academy
Formula"**, commandcompetence.com.
<https://commandcompetence.com/post/estimating-required-fire-flow-the-national-fire-academy-formula/>
(read 2026-10-16). Commentary, not a source of the law:

- the formula was developed assuming **no more than 50 % involvement** of the
  fire compartment;
- it becomes **increasingly inaccurate above 50 % involvement or above
  1000 gpm**, and for **ceilings over 10 ft**;
- it is a required-flow convention, **not** a heat-release-rate (HRR) model.

These are **limits to state beside the number, not caps to compute with**. The
engine applies no hard ceiling and no automatic halving.

## 2. Arithmetic

The law, with the engine's units:

```
A_ft²   = floorAreaM2 / METERS_PER_FOOT²          (METERS_PER_FOOT = 0.3048)
A_inv   = A_ft² × involvedFraction
Q_gpm   = A_inv / 3
```

- Area arrives in m² (the scenario's unit); the law converts once, with
  `METERS_PER_FOOT` from `src/hydraulics/units.ts` (the only place conversion
  factors live), squared for area. No conversion factor is duplicated.
- `involvedFraction` is 0–1. `f = 1` is a fully involved floor; the scaling
  matches SM2-30 (1000 gpm → 500 at 50 %, 250 at 25 %), since the law is
  linear in the involved area.
- Worked cases, checked by hand:

| Floor | Area ft² | f | Involved ft² | Q |
|---|---|---|---|---|
| 40 ft × 30 ft | 1200 | 1.00 | 1200 | **400 gpm** (SM2-29) |
| 40 ft × 30 ft | 1200 | 0.25 | 300 | **100 gpm** (JIBC cross-check) |
| any | A | 0 | 0 | **0 gpm** (nothing involved) |

40 ft × 30 ft in metres: 12.192 m × 9.144 m = **111.483648 m²**, exact.

## 3. Scope

**In:** one building, **one fully involved floor**, Q from that floor's area
and the fraction involved. This is exactly the domain SM2-28–30 define.

**Out:**
- **Exposures and multiple-floor extension** (SM2-31–SM2-35).
- **Iowa (volume ft³ / 100):** not planned (ROADMAP §11 decision 8); a second
  volume-based number that disagrees without teaching more.
- **Heat balance and any "extinguished/safe" verdict.** The comparison the
  engine exposes is a **margin between delivered and required flow**, never a
  claim that a fire is out.

## 4. The comparison is not a prediction

`compareNfaFireFlow` reports the signed margin, the deficit and the coverage
ratio of a **caller-supplied delivered flow** against the required flow. The
caller must pass the **aggregate solved nozzle flow** for the streams actually
applied to the fire — the engine's forward solve output — **not** pump output,
which includes water leaving through unused outlets. The result is a
comparison, not a prediction of extinguishment.

## 5. Open questions (heat balance, `extinguish.absorption`)

Not implemented. What the model needs before it can ship (MODEL.md §3.12,
§9):

1. **Application effectiveness η remains unresolved (2026-10-19).** Heat
   accepted by water is not the same quantity as evaporated fraction:
   unevaporated runoff can absorb sensible heat. Define `etaHeat` against a
   specified full-vaporization enthalpy reference, target and interval.
   NIST water states support **163.21 kW/US gpm** for liquid at 20 °C to
   vapor at 100 °C, both at 101.325 kPa absolute; this is reference capacity,
   not measured fireground effectiveness ([NIST query](https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=C7732185&Type=IsoBar&Digits=7&P=0.101325&THigh=100&TLow=20&TInc=80&RefState=DEF&TUnit=C&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm)).
   No transferable primary numerical η was verified. Särdqvist's official
   English PDF was retrieved but yielded no useful extracted text or verified
   efficiency page; the specific 1996 citation and edition/date remain to
   check. Grimwood's linked primary PDF fetch failed; its factors and pages
   remain unverified. FSRI Part I measures no-fire water distribution, not
   thermal η. The report below records direct links and access limitations.
   Recommendation for a future pure API: require explicitly assumed or
   definition-matched sourced η for adjusted capacity, **with no default**.
2. **Specific measured HRR cases are available, not generic fire presets.**
   NIST's *Design Fires – Residential and Office Items* supplies named
   open, fully ventilated specimen/assembly **peaks**: Test017 0.447 MW,
   Test016 0.621 MW, Test027 1.733 MW, Test029 1.984 MW, Test034 4.021 MW,
   and Test038 4.563 MW ([NIST project](https://www.nist.gov/el/fcd/design-fires-residential-and-office-items)).
   The report retains individual sources, uncertainty, construction and test
   conditions. These are not sustained loads, generic chair/sofa/room fires,
   or measured extinguishing flows. No product preset selection is made.
3. **How the two sit together.** Per ROADMAP §11 decision 8, the convention
   (`extinguish.fire-flow`) says what you need and the physics
   (`extinguish.absorption`) says why; the physics ships later, beside the
   convention, once 1 and 2 are sourced.

Research synthesis and proposed math-only API:
[`Extinguishment heat balance foundations`](../reports/Extinguishment%20heat%20balance%20foundations.md)
(2026-10-19). Equality of adjusted capacity and a reference HRR is only a
power comparison, not an extinction criterion, predicted HRR reduction or
time-to-extinction model. `extinguish.absorption` remains unimplemented.
