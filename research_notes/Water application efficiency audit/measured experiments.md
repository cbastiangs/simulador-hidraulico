# Measured water-application efficiency: source audit

Audit date: 2026-10-22

Question: is there a modern (1990s–2026) experimental measurement of the
fraction of applied water that absorbs heat or evaporates during fire
suppression, precise enough to define a transferable or narrowly applicable
efficiency for a math-only simulator?

Companion file: `grimwood-barnett.md` audits the commonly cited
0.32 / 0.50 / 0.75 / 0.38 figures and the Barnett–Grimwood–Särdqvist chain.
This file does not repeat that audit; it records the experimental sources
found while looking for a measured replacement.

Method: searched NIST, IAFSS, govinfo, OpenAlex/Crossref, publisher pages and
general web indexes; downloaded and text-extracted primary reports where
available; read definitions, test conditions and results in the report itself.
No paywalls or bot challenges were bypassed.

## Bottom line

1. **No accessible modern experimental study was found that directly measures
   the fraction of applied hose-stream water that evaporates or absorbs heat in
   a realistic fireground suppression test.** That is a search result, not a
   proof that no such study exists.

2. The closest thing to a direct measured/derived **mass fraction evaporated**
   is much older and narrowly scoped:

   - **NBSIR 81-2202 (Cooper & O'Neill, 1981)**, full-scale stairwell
     water-curtain/spray-nozzle tests, reports a **water usage efficiency**
     `η_w = G_evap / G` of **about 0.03 or less** for the tested gas-cooling
     conditions, while **cooling efficiency** `η_c` reached about 1.0. That is:
     the hot gas was cooled effectively while only ~3% or less of the applied
     water evaporated. It is a stairwell gas-cooling experiment, not fire
     suppression, and it is outside the requested window.

3. The closest modern **heat-absorption efficiency** is model-derived, not
   measured:

   - **Blanchard, Desanghere & Bouley (2011)**, 1/3-scale tunnel water-mist
     test reconstructed in FDS, report an efficiency of **40–70%, time average
     53%**, defined as heat absorbed by droplets divided by the heat that would
     be absorbed if all injected water evaporated. This is **not** the fraction
     of water mass evaporated: it includes heating, radiation attenuation and
     wall cooling, and the fire was not suppressed.

4. A modern **empirical/regulatory** figure of **50% evaporated** exists for
   large industrial fires (German Hessen guidance, 2011, reported in a 2014
   IChemE paper). It is an assumption based on fire-service experience and
   Karlsruhe research, not a primary experimental measurement.

5. **Wighus's SHAR** is the best measured heat-balance proxy found, but it is
   not an evaporation fraction. SHAR includes sensible heat in runoff water.
   The two Wighus sources disagree on the extinguishment threshold (1991:
   SHAR > 0.7 if extinguishment is not instantaneous; 1995: SHAR > 0.3), and that discrepancy is unresolved.

6. **Do not promote 0.32, 0.50, 0.75, or 0.38 to a measured evaporation
   fraction or a universal thermal efficiency.** They are design/tactical
   assumptions; see `grimwood-barnett.md`.

## Definitions used here

- `G`: volume rate of water delivered by the sprinklers (NBSIR 81-2202).
- `G_evap`: portion of `G` evaporated.
- **Water usage efficiency** (NBSIR 81-2202): `η_w = G_evap / G`. This is a
  volume fraction; for liquid water it is numerically equal to the mass
  fraction. It is derived from an energy balance on the gas stream.
- **Heat-absorption efficiency** (Blanchard et al.): absorbed heat divided by
  the heat needed to bring all injected water from injection temperature to
  saturated vapour at the evaporation temperature. This is an energy ratio, not
  a mass fraction.
- **SHAR** (Wighus): heat absorbed by the water spray divided by fire heat
  release. The water-side heat includes heating the evaporated fraction to
  boiling, evaporation, superheating the steam, and heating runoff water.
- **Contact/delivery fraction**: fraction of flow that reaches the fuel surface
  (e.g. the often-quoted 20%). Not a thermal efficiency.

Thermodynamic reference: 20 °C liquid water to 100 °C vapour at 101.325 kPa
absorbs 2591.5757 kJ/kg, equivalent to 163.21 kW per US gpm at full
vaporization. This is the declared endpoint, not a measured fireground value.

## Verified sources

### 1. Cooper & O'Neill (1981), NBSIR 81-2202 — measured water usage efficiency

Citation: Leonard Y. Cooper and John G. O'Neill, *Fire Tests of
Stairwell-Sprinkler Systems*, NBSIR 81-2202, National Bureau of Standards,
February 1981 (final report issued April 1981), prepared for OSHA.

URL: https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nbsir81-2202.pdf

Access: full PDF downloaded and text-extracted (90 pages, 97,992 characters).

Experiment: three-story stairtower with a contiguous burn room; stairwell
opening about 9.3 m² (100 ft²), floor-to-ceiling about 3.7 m (12 ft); propane
burner up to about 4 MW (13.6 × 10^6 BTU/h). Two component types: water curtain
(WC) sprinklers around the stairwell opening, and spray nozzles (SN) inside the
opening; 10 mm (3/8 in) and 12.5 mm (1/2 in) nozzle variations; several water
flow rates.

Definitions (report Eq. 1 and Eq. 2):

- `E_p` = maximum possible rate at which energy can be extracted from the inlet
  gas stream by adiabatically bringing it from an assumed zero-saturation inlet
  state to a fully saturated outlet state.
- `E_a` = actual rate at which the component extracts energy from the inlet
  stream, assumed adiabatic.
- `G` = volume rate of water delivered by all sprinklers.
- `G_evap = E_a / [ρ_w(liq) Δh]`, where `Δh` is the enthalpy of vaporization.
- `η_c = E_a / E_p` = cooling efficiency.
- `η_w = G_evap / G` = water usage efficiency.

The report states the `G_evap` estimate assumes a zero-humidity inlet state and
neglects the energy the inlet gas provides to the water stream in heating it
from its original temperature to its final temperature, compared with the heat
of vaporization. Condensation on cool burn-room surfaces is neglected.

Result (section 6.7.2, report p. 33):

> It is clear from the plots of figures 18-21 and from the result of Eq. (12)
> that for the purpose of evaporation cooling the components under review have
> very poor water usage efficiencies. In particular, for the extractable energy
> flow rate levels of the present experiments the values η_w are of the order of
> .03 or less.

The report also says cooling efficiency can reach 1.0 when enough water is
supplied to saturate the outlet stream (section 6.6.2.1). In other words, these
tests measured effective gas cooling with only a few percent of the applied
water evaporated; most of the water passed through or ran off.

Interpretation:

- This is the clearest **directly instrument-derived mass fraction** found:
  `η_w ≈ 0.03` or less.
- It is **not** a fire-suppression efficiency. The water was cooling hot
  stairwell gases; the nozzles were designed for extinguishment/surface
  cooling, not for efficient gas-stream evaporation. The report explicitly
  contrasts the two roles.
- It is **1981**, outside the requested modern window, and a stairwell
  geometry. It should be used only as a pre-window benchmark or as evidence
  that low evaporated fractions can coexist with high gas cooling.
- The value is derived from temperature and flow measurements, not from
  weighing runoff and condensate. The zero-humidity inlet assumption and the
  neglect of sensible heating are approximations. No uncertainty bound was
  found in the extracted text.

### 2. Blanchard, Desanghere & Bouley (2011) — modelled heat-absorption efficiency

Citation: E. Blanchard, S. Desanghere, P. Bouley, "Quantification of Energy
Balance during Fire Suppression by Water Mist in a Mid-scale Test Tunnel,"
*Fire Safety Science* 10 (2011): 119–132.
DOI: 10.3801/IAFSS.FSS.10-119
URL: https://publications.iafss.org/publications/fss/10/119

Access: full PDF downloaded and text-extracted (14 pages, 41,876 characters).

Experiment: one-third-scale tunnel, 43 m long, semicircular cross-section
about 4 m², hydraulic diameter 2.2 m; 1 m × 0.5 m × 0.1 m heptane pool;
longitudinal ventilation about 3.0 m/s; six water-mist nozzles at about 90 bar,
5.5 L/min each, total about 33 L/min, activated at 300 s. The paper reconstructs
the test with FDS 5.4.0 and computes the energy balance from the simulation.
The experimental campaign measured temperature, velocity, fuel mass, heat flux,
CO2 and O2; it did **not** measure the water-side energy balance directly.

Definition (paper Eq. 6):

> η = Q_p / [(L_v + C_p,p (T_p,evap − T_p,inj)) × ∂(m_p,inj)/∂t]

where `Q_p` is the heat absorbed by droplets from the gas, by radiation
attenuation, and by wall surface cooling. The denominator is the heat that
would be absorbed if the whole injected water flow were heated to the
evaporation temperature and evaporated.

Result:

> Efficiency varies between 40 and 70%, the time average value over (300–600 s)
> being 53%. In other words, 47% of injected water does not absorb energy from
> gases, wall or by radiation attenuation.

The absorbed energy split was about 73% from the gaseous phase, 18% from
radiation attenuation, and 9% from wall surface cooling. Roughly half of the
fire heat was absorbed by droplets after activation; the rest went to tunnel
surfaces (24%) or was convected out (33%).

Interpretation:

- This is a **heat-absorption efficiency**, not a mass-evaporated fraction. If
  all absorbed heat went into evaporation and the runoff stayed at injection
  temperature, 53% would correspond to 53% evaporated; because some heat heats
  water without evaporating it and some is counted as radiation/wall cooling,
  the actual evaporated mass fraction is lower. The paper does not report it.
- It is **model-derived**, not a direct measurement. The paper explicitly says
  the water-mist energy balance "has not been assessed with such experimental
  data"; confidence comes from FDS verification cases and the reconstructed
  tunnel temperatures.
- The fire was **not suppressed**; the paper notes the very low water flow and
  that HRR reached a higher value during mitigation than at activation. The
  result is for smoke cooling/radiation attenuation in a tunnel, not for
  extinguishing a fire or for a hose stream.
- Narrow applicability: water mist, tunnel, low water flow, 1/3 scale,
  heptane pool. Do not transfer the 53% to a fireground hose stream.

### 3. Wighus (1991) and Wighus & Aune (1995) — SHAR, not an evaporation fraction

Citation 1: Ragnar Wighus, "Extinguishment of Enclosed Gas Fires with Water
Spray," *Fire Safety Science* 3 (1991): 997–1006.
URL: https://publications.iafss.org/publications/fss/3/997

Citation 2: Ragnar Wighus and Petter Aune, "Engineering Relations for Water Mist
Fire Suppression Systems," HOTWC.95, pp. 397–410 (SHAR result on p. 402).
URL: https://www.nist.gov/system/files/documents/el/fire_research/R0000240.pdf

Access: both full texts downloaded and extracted (10 and 14 pages).

Wighus 1991 experiment: 2.5 × 2.5 × 5 m³ enclosure, 1 MW propane fire
(equivalent pool 0.3 × 1.3 m²), ventilation inlet at floor and outlet at
ceiling, full-cone nozzles with mean nominal droplet diameters about 0.5–1.6 mm.
The paper presents a heat balance for the water spray, the compartment and the
ventilated smoke as SHAR.

SHAR definition: heat absorbed by the water spray divided by fire heat release.
The water-side heat includes:

1. heating the evaporated fraction to boiling,
2. evaporation,
3. superheating the steam to exhaust temperature,
4. heating runoff water.

Because item 4 is included, SHAR is not the fraction evaporated. It is a
heat-absorption ratio that can be high even when much of the water runs off.

Wighus 1991 result: peak SHAR about 0.5–0.6 at spray activation. If
extinguishment was not obtained instantaneously, the SHAR characteristic for
extinguishment was above about 0.7. The paper also notes that the
evaporated-water estimate is disturbed by water accumulation in the compartment
and is uncertain immediately after application.

Wighus & Aune 1995 result: downward spray experiments gave extinguishment when
SHAR exceeded **0.3**; SHAR 0.15 did not extinguish; the paper also gives a
rough "one-third of the heat release" rule of thumb. This is the source of the
0.3 threshold often quoted.

Discrepancy: 1991 says >0.7 if extinguishment is not instantaneous; 1995 says
>0.3. The difference may be definitional (instant vs sustained, different heat-balance
boundaries, different spray/fire conditions), but the extracted texts do not
resolve it. Treat both as scenario-specific observations, not a universal
constant.

Table 2 of Wighus 1991 gives the spray matrix (1 MW propane, 6.25 m² floor):

- HH7: 2.54 bar, 4.66 L min⁻¹ m⁻², 1130 µm — extinguished.
- HH7: 1.87 bar, 3.48 L min⁻¹ m⁻², 1250 µm — not extinguished.
- HH4: 2.74 bar, 2.64 L min⁻¹ m⁻², 800 µm — extinguished.
- HH22: 7.12 bar, 1.81 L min⁻¹ m⁻², 550 µm — extinguished.
- HH22: 2.79 bar, 1.35 L min⁻¹ m⁻², 750 µm — not extinguished.

The application-rate area convention is not explicit enough to convert these
numbers into a fraction evaporated without assumptions. Do not do so.

### 4. Grant & Drysdale (1997) — literature review, no new measurements

Citation: G. Grant and D. Drysdale, *The Suppression and Extinction of Class A
Fires Using Water Sprays*, University of Edinburgh, 1997.
URL: https://era.ed.ac.uk/bitstream/1842/4789/1/Grant%20and%20Drysdale%20-%201997%20-%20The%20Suppression%20and%20Extinction%20of%20Class%20A%20Fires%20Using%20Water%20Sprays.pdf

Access: full PDF downloaded and extracted (239 pages, 670,111 characters).

This is a literature review/thesis, not a new experimental campaign. It is
useful for locating older measurements and for its model assumptions, but it
does not add a measured fraction.

Relevant details:

- The model assumes water is 100% effective and uses 2592 kJ/kg for water
  initially at 20 °C (report p. 63). That is a model assumption, not a
  measurement.
- Stolp's crib experiments: 35 kg crib, 1 m² surface, burning 5–6 kg/min; a
  water application of 0.85 L/min did not extinguish it. The report states that
  if water is applied at a rate sufficient to extract 90–100% of the heat
  produced, the fire is extinguished immediately. The criterion is
  `M/ΔW ≈ 9–10` for free-burning crib fires and 5–6 for confined crib fires.
  The OCR garbles the computed fraction; this is a heat-balance criterion, not
  a measured fraction evaporated.
- Fuchs' full-scale furniture-fire tests: an average of about **95 L of water
  was evaporated** during extinguishment; about 38% of that was required to take
  up the heat of combustion and 62% to cool the fuel below its ignition
  temperature. The tests used about 40 m² fuel surface and an application rate
  of about 1.6 L m⁻² until extinguishment, in a time range of about 2 minutes.
  Grant's summary does **not** state the total water applied, so a fraction
  cannot be derived from it without assuming what "1.6 L m⁻²" means (total or
  per minute). Do not manufacture a fraction from this passage.
- Grant also cites work suggesting water evaporation in the flame zone can be
  negligible for large droplets, while fine mists evaporate more in the plume.
  That is a mechanism discussion, not an applied-water fraction.

### 5. NISTIR 6191 (Madrzykowski) — the 5–10% claim is secondary

Citation: Daniel M. Madrzykowski, *Water Additives for Increased Efficiency of
Fire Protection and Suppression*, NISTIR 6191, 1998.
URL: https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6191.pdf

Access: full PDF downloaded and extracted (324 pages, 441,411 characters).

The report states:

> It has been estimated that only 5 to 10 percent of the water applied during a
> fire attack contributes to the extinguishment [3].

Reference [3] is a training-manual/secondary source, not an experimental
measurement. The report does not present a primary dataset behind the 5–10%
range. It is therefore a citation to an estimate, not evidence of a measured
fraction.

The same report's laboratory measurements show specific heats of the tested
agent solutions equal to or slightly less than plain water, so the additives do
not increase water's heat-absorption capacity. Its large-scale tests compare
agent performance on wood crib, tire, heptane, gasoline, magnesium and titanium
fires; they do not report the fraction of applied water evaporated.

### 6. NBSIR 77-1287 (Liu, 1977) — model plus tests, no applied-water fraction

Citation: Stanley T. Liu, *Analytical and Experimental Study of Evaporative
Cooling and Room Fire Suppression by Corridor Sprinkler System*, NBSIR 77-1287,
National Bureau of Standards, 1977.
URL: https://www.govinfo.gov/content/pkg/GOVPUB-C13-23034d862e97f5f7e7cc867f301f53a1/pdf/GOVPUB-C13-23034d862e97f5f7e7cc867f301f53a1.pdf

Access: full PDF downloaded and extracted (62 pages, 63,754 characters).

This report combines a one-dimensional spray-evaporation model with full-scale
and one-quarter-scale corridor experiments. It contains a figure labelled
"FRACTION MASS EVAPORATED" (Figure 7), but that figure is a **single-droplet
time-history calculation** in a 600 °C cross-flow, not a measurement of the
fraction of applied water evaporated in the corridor tests. The experiments
measured gas temperature, oxygen and fire behavior; they did not close a
water mass balance. This is not a source for an applied-water fraction.

### 7. NISTIR 4625 (Stroup & Evans, 1991) — suppression tests, no measured fraction

Citation: D. W. Stroup and D. D. Evans, *Suppression of Post-Flashover
Compartment Fires Using Manually Applied Water Sprays*, NISTIR 4625, July 1991.
URL: https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir4625.pdf

Access: full PDF and OCR text layer; test data verified in the companion audit
(`grimwood-barnett.md`).

This is a modern-window full-scale manual-suppression experiment (2.44 m cube,
wood crib, one nozzle type, flow rates 16.3, 36.5 and 79 L/min, volume median
drop sizes about 800–1040 µm). It measured whether the fire was controlled or
extinguished, plus room conditions; it did **not** report the fraction of
applied water evaporated.

Särdqvist (1996) later derived efficiency-like factors of **0.11, 0.24 and
0.29** from four of these tests (a fourth test without a control was excluded),
with a stated maximum around 0.3. But Särdqvist's η is relative to a theoretical
extinction capacity that already assumes only about 30–35% of the fire heat must
be removed. It is not a measured evaporation fraction. See
`grimwood-barnett.md` for the full chain and caveats.

### 8. Modern adjacent studies that do not answer the question

- **Hardy et al. (2023/2024), "Study of the interactions between a water spray
  and a moving layer of hot smoke,"** HAL `hal-04199488`, published in *Fire
  Technology* (DOI `10.1007/s10694-024-01624-7`). One-fifth-scale room/corridor,
  smoke layer, downward/upward/inclined sprays at 4 and 8 bar. Measured
  temperature profiles and stratification; no water mass balance, no evaporated
  fraction.
- **UL FSRI tunable-diode-laser paper (2021), "In-situ measurement of water-vapor
  in fire environments using a real-time tunable diode laser based system."**
  Measures water-vapour concentration in training fires. It does not measure the
  fraction of applied water evaporated. Report: 10 pages, 54,879 characters.
- **Pretrel (2017), "Interaction between water spray and smoke in a fire event
  in a confined and mechanically ventilated enclosure,"** *Fire Safety Journal*,
  DOI `10.1016/j.firesaf.2017.03.025`. The abstract says the droplet evaporation
  rate was determined from the energy balance. Full text is closed access; no
  repository copy was found. This is a potentially relevant modern measurement
  that could not be inspected.
- **"Experimental and numerical study of water spray system for a fire event in
  a confined and mechanically ventilated compartment,"** *Fire and Materials*
  (2019), DOI `10.1002/fam.2719`. Closed access; potentially relevant follow-up;
  not inspected.
- **German Hessen guidance (2011), reported in "Fire water retention – latest
  guidance for appropriate design," IChemE Hazards XXIV (2014).**
  URL: https://www.icheme.org/media/8931/xxiv-paper-37.pdf
  The paper says that for fires with surface area between 200 and 600 m², 70%
  were extinguished within 90 minutes, and "based on research by the fire
  research centre of Karlsruhe, it can be assumed that half of the applied
  extinguishing water evaporated." This is an empirical/regulatory assumption
  for fire-water retention design, not a primary experimental measurement, and
  the original Karlsruhe source was not obtained.

## Synthesis

| Quantity | Source | Value | Type | Applicability | Main caveat |
|---|---|---|---|---|---|
| Water usage efficiency `η_w = G_evap/G` | NBSIR 81-2202 (1981) | about 0.03 or less | derived from full-scale temperature/flow measurements | stairwell water curtain/spray gas cooling | 1981; not fire suppression; zero-humidity inlet assumption |
| Cooling efficiency `η_c` | NBSIR 81-2202 (1981) | up to about 1.0 | derived from measurements | same | shows effective cooling can coexist with ~3% evaporation |
| Heat-absorption efficiency | Blanchard et al. (2011) | 0.40–0.70, mean 0.53 | FDS reconstruction of a 1/3-scale test | tunnel water mist, low flow, smoke cooling | not measured; not mass evaporated; includes radiation/wall cooling; fire not suppressed |
| SHAR at extinguishment | Wighus (1991) | > 0.7 if not instantaneous | measured heat balance | 1 MW propane enclosure | includes runoff sensible heat; not a fraction; conflicts with 1995 |
| SHAR at extinguishment | Wighus & Aune (1995) | > 0.3 | measured heat balance | downward spray, similar enclosure | same; 0.15 did not extinguish |
| Evaporated fraction | German Hessen guidance via IChemE (2014) | about 0.5 | empirical/regulatory assumption | 200–600 m² industrial fires | not a measurement; original source not obtained |
| Tactical/design factors | Barnett, Grimwood, Särdqvist | 0.32 / 0.50 / 0.75 | assumptions/calibrations | required-flow design | see `grimwood-barnett.md`; not measured |

What is transferable:

- There is **no single transferable efficiency** from these sources.
- If the simulator needs a mass-evaporation parameter, the only measured/derived
  anchor found is the NBSIR 81-2202 value of **~0.03 or less**, and it applies to
  gas cooling with excess spray, not to extinguishing a fire. It should not be
  used as a universal fireground value.
- If the simulator needs a heat-absorption parameter, the modern modelled range
  **0.40–0.70 (mean 0.53)** is the closest published value, but it is
  model-derived, scenario-specific (tunnel water mist), and includes radiation
  and wall cooling. It is an upper-bound-like number for "fraction of full
  evaporation cooling capacity realized," not "fraction of mass evaporated."
- SHAR is the best measured heat-balance proxy, but it is not a mass fraction
  and its threshold is not unique (0.3 vs 0.7).
- For real fireground hose streams, no measured evaporation fraction was found.
  Any number used there is an assumption. Keep it labelled as such and separate
  from the 2591.5757 kJ/kg endpoint.

Suggested parameter discipline for any future simulator use:

1. Name the quantity explicitly: `fraction_evaporated` (mass) vs
   `heat_absorption_efficiency` (energy) vs `SHAR` (heat ratio).
2. Record the source and definition next to the value.
3. Keep the value scenario-specific; do not expose it as a universal constant.
4. Do not use 0.32/0.50/0.75/0.38 as measured. If one is used, label it a
   design/tactical assumption.
5. Do not invert a tactical flow factor into an efficiency.

## Gaps and unresolved items

- **No accessible modern direct measurement** of the fraction of applied
  hose-stream water evaporated in a realistic suppression test. The search was
  broad but not exhaustive.
- **NBSIR 81-2202 uncertainty**: the report's `η_w` is derived, and the extracted
  text does not give an uncertainty bound. The zero-humidity inlet assumption
  and neglect of sensible heating should be treated as biases, not exact
  corrections.
- **Wighus application-rate area convention**: the Table 2 rates cannot be
  converted to a fraction evaporated without knowing the reference area and
  flow. The text is not explicit enough.
- **Wighus 1991 vs 1995 threshold discrepancy**: 0.7 vs 0.3 remains unresolved.
- **Fuchs 1976 full-scale tests**: Grant reports 95 L evaporated but not the
  total applied, so no fraction can be derived from the accessible summary.
- **Scanned sources**: Särdqvist's book and the J-STAGE Särdqvist & Svensson
  (2001) paper are image-only. `tesseract`, `ocrmypdf` and `pytesseract` are not
  available, so they could not be OCR'd.
- **Paywalls/challenges**: Grant, Brenton & Drysdale (2000) DOI
  `10.1016/S0360-1285(99)00012-X`; Pretrel (2017); *Fire and Materials* (2019);
  H&R (2005). No paywalls were bypassed.
- **German 50% figure**: the original Karlsruhe/Hessen source was not obtained;
  the IChemE paper is a secondary report of it.
- **Search absence**: the conclusion "no accessible modern direct measurement"
  is a statement about this search, not a proof of non-existence.

## References

1. L. Y. Cooper and J. G. O'Neill, *Fire Tests of Stairwell-Sprinkler Systems*,
   NBSIR 81-2202, National Bureau of Standards, February 1981 (issued April
   1981). https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nbsir81-2202.pdf
2. E. Blanchard, S. Desanghere and P. Bouley, "Quantification of Energy Balance
   during Fire Suppression by Water Mist in a Mid-scale Test Tunnel," *Fire
   Safety Science* 10 (2011): 119–132. DOI 10.3801/IAFSS.FSS.10-119.
3. R. Wighus, "Extinguishment of Enclosed Gas Fires with Water Spray," *Fire
   Safety Science* 3 (1991): 997–1006.
   https://publications.iafss.org/publications/fss/3/997
4. R. Wighus and P. Aune, "Engineering Relations for Water Mist Fire Suppression
   Systems," HOTWC.95, pp. 397–410.
   https://www.nist.gov/system/files/documents/el/fire_research/R0000240.pdf
5. G. Grant and D. Drysdale, *The Suppression and Extinction of Class A Fires
   Using Water Sprays*, University of Edinburgh, 1997.
   https://era.ed.ac.uk/bitstream/1842/4789/1/Grant%20and%20Drysdale%20-%201997%20-%20The%20Suppression%20and%20Extinction%20of%20Class%20A%20Fires%20Using%20Water%20Sprays.pdf
6. D. M. Madrzykowski, *Water Additives for Increased Efficiency of Fire
   Protection and Suppression*, NISTIR 6191, 1998.
   https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6191.pdf
7. S. T. Liu, *Analytical and Experimental Study of Evaporative Cooling and Room
   Fire Suppression by Corridor Sprinkler System*, NBSIR 77-1287, National
   Bureau of Standards, 1977.
   https://www.govinfo.gov/content/pkg/GOVPUB-C13-23034d862e97f5f7e7cc867f301f53a1/pdf/GOVPUB-C13-23034d862e97f5f7e7cc867f301f53a1.pdf
8. D. W. Stroup and D. D. Evans, *Suppression of Post-Flashover Compartment
   Fires Using Manually Applied Water Sprays*, NISTIR 4625, July 1991.
   https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir4625.pdf
9. L. Hardy, A. Collin, M. Suzanne, G. Erez, R. Mehaddi and P. Boulet, "Study of
   the interactions between a water spray and a moving layer of hot smoke,"
   HAL hal-04199488 (2023); *Fire Technology* (2024), DOI
   10.1007/s10694-024-01624-7.
10. "Fire water retention – latest guidance for appropriate design," IChemE
    Hazards XXIV (2014).
    https://www.icheme.org/media/8931/xxiv-paper-37.pdf
11. H. Pretrel, "Interaction between water spray and smoke in a fire event in a
    confined and mechanically ventilated enclosure," *Fire Safety Journal*
    (2017), DOI 10.1016/j.firesaf.2017.03.025. Closed access; not inspected.
12. `grimwood-barnett.md`, companion audit of the 0.32/0.50/0.75/0.38 chain and
    the NISTIR 4625 / Särdqvist efficiency-like factors.
