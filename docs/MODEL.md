# Hydraulic model

> 2026-10-14. The single reference for every law the simulator uses, now or
> planned through M5. Code, tests and the formulas shown on screen follow
> this document. Replaces the model and sources sections of
> `PLAN-simulador.md` (§2–§3). The guardrail in
> `manual-summaries/hydraulics/compatibility-vs-physics.md` still applies: the
> CGBVP manual is a reference, not physical truth.

## 0. How to read this

Each law has an **id** (e.g. `hose.friction`). The engine registry, the
solver's breakdown and the on-screen formula all use the same id.

**Status:** ✅ implemented · ⏳ planned (milestone) · ❌ out of scope.

**Basis tag** for every constant:

- **`published`**: cited, and the source is in this repo
  (`references.ts` SOURCES, or the review's [E1]–[E10]).
- **`physics`**: follows from standard physics; the derivation is given here.
- **`convention`**: a fire-service or manual rule, kept as a method or a
  default, never as a law of nature.
- **`verify`**: the law is chosen, but the number or the exact form must be
  checked against its source **before** the law is implemented (§9).

## 1. Conventions

- **Steady state.** Flow is constant in time. Water is incompressible.
  Transients (water hammer) are ❌.
- **Gauge pressure** (psi above atmosphere), except where suction is
  modelled, which is ❌ for now.
- **Units, internal:** metres (length, height), inches (diameters), psi, US
  gpm. A constant published in feet is converted inside its law, with
  factors from `units.ts` (exact by definition: 1 ft = 0.3048 m,
  1 US gal = 3.785411784 L, 1 psi = 6.894757 kPa).
- **Height** h is measured upward from the source (pump discharge or
  standpipe outlet); negative is below it.
- **Flow is the solution, never an input.** The source sets a pressure; the
  elements decide the flow (§2).

## 2. The line equation and how it is solved

For a line from a source to one nozzle, the source pressure is spent along
the way:

**P_source = NP + Σ FL + EP + Σ AL**

| Term | Meaning | Law |
|---|---|---|
| NP | nozzle pressure | §3.3–§3.5 |
| FL | friction loss in each hose section | §3.1 |
| EP | elevation pressure, source to nozzle | §3.2 |
| AL | appliance losses (wye, reducer, FDC…) | §3.10 (⏳ M4) |

Every term grows with flow Q (or is constant), so "pressure left at the
nozzle − pressure the nozzle needs" falls as Q rises and crosses zero once.
**`solve.bisection`** ✅ finds that Q: start from [0, 1], double the upper
bound until it brackets the root, then halve to floating-point precision.
It needs only that monotonicity, so non-quadratic laws (automatic nozzle,
pump envelope, PRV) fit without changing the solver.

`line.ts` keeps the closed form for the all-quadratic case,
Q = √((P − EP) / (r_hose + r_nozzle)), as the **oracle** the solver is
tested against.

**`solve.high-point`** ✅ (`physics` + hose behaviour): if the source can't
lift water to the line's highest coupling, nothing flows, even to a lower
nozzle. A soft hose collapses rather than siphon. Pressure at every coupling
is reported, so the screen can show it.

## 3. Laws by element

### 3.1 Hose friction: `hose.friction` ✅

**FL = C · (Q/100)² · (L/100)**, FL in psi, Q in gpm, L in **feet** (the
engine converts metres: L_ft = L_m / 0.3048).

| Size | C | Basis |
|---|---|---|
| 1-1/2" | 24 | `published`: CGBVP p. 39 = IFSTA; Colorado DFPC chart |
| 1-3/4" | 15.5 | same |
| 2-1/2" | 2 | same |
| 3" with 2-1/2" couplings | 0.8 | same |
| 3" with 3" couplings | 0.677 | `published`: Colorado DFPC only |
| 4" | 0.2 | `published`: CGBVP, Colorado |
| 5" | 0.08 | `published`: Colorado only |

- **Why Q²:** friction in turbulent flow grows with the square of velocity.
  Doubling the flow costs four times the friction.
- **Why C ≈ 1/d⁵:** Darcy–Weisbach with a fixed friction factor gives
  FL ∝ Q²/d⁵. The table follows it closely (1-1/2"→2-1/2": C ratio 12.0,
  d⁵ ratio 12.9), except 1-3/4" (its C is empirical; it usually has 1-1/2"
  couplings). That is why C stays a published table and is never derived
  from diameter. Darcy–Weisbach may be **shown** as the explanation, never
  used as the law.
- **Valid** for the hose sizes above in normal fireground condition. A C
  measured by flow-testing a specific hose replaces the table value in the
  scenario document; the catalog is not changed.
- **CGBVP table convention** (30 m read as 100 ft) is **not** reproduced: we
  convert exactly, about 1.6 % less friction (VC-02).

### 3.2 Elevation: `elevation` ✅

**EP = k · h**, EP in psi, h in metres.

| Method | k (psi/m) | Basis |
|---|---|---|
| `physical` (default) | 0.434 / 0.3048 = **1.424** | `physics`: ρg = 62.4 lb/ft³ ÷ 144 in²/ft² = 0.433 psi/ft, published as 0.434 |
| `cgbvp-2019` (reference) | **1.5** | `convention`: CGBVP p. 44 (same page also mentions 1.4) |

Applies whether or not water flows: a closed nozzle 10 m up still reads
14.2 psi less than the pump (VC-04).

### 3.3 Fixed-orifice nozzle: `nozzle.fixed-orifice` ✅

**NP = NP_r · (Q / Q_r)²**, or equivalently **Q = Q_r · √(NP / NP_r)**.

- Q_r, NP_r: rated flow and pressure.
- `physics`: an orifice of fixed area passes Q ∝ √ΔP (Torricelli/Bernoulli;
  EPANET's emitter with exponent 0.5 [E2]).
- Covers a smooth bore and a fog nozzle left at one gallonage setting.
- From 50 to 80 psi the flow rises √(80/50) = **+26.5 %**, not the manual's
  printed +22 % (VC-06).

### 3.4 Smooth bore: `nozzle.smooth-bore` ⏳ M2

**Q = 29.7 · d² · √NP** (Freeman), Q in gpm, d tip diameter in inches, NP in
psi.

- `physics` check: ideal jet Q = A·v with v = 12.18·√NP ft/s (§3.7) gives
  29.82·d²·√NP; 29.7 corresponds to a discharge coefficient of about 0.996.
- Basis: `verify` the 29.7 constant against IFSTA (Pumping Apparatus
  Driver/Operator) before implementing.
- It is a fixed orifice (§3.3) whose rating comes from the tip size: 15/16"
  at 50 psi → 185 gpm; 7/8" → 161 gpm.
- Default NP: 50 psi handline, 80 psi master stream (`convention`, CGBVP
  p. 72).

### 3.4b Two independent properties of a nozzle

A nozzle has a **design** and a **flow control**, chosen independently:

- **Design (stream):** smooth bore (solid stream, no pattern) or
  combination/fog (pattern from straight stream to wide fog). It decides
  stream shape, reach and reaction (§3.6), not the pressure–flow law.
- **Flow control:** single gallonage (one rating), selectable gallonage (a
  ring of settings, each a fixed orifice) or automatic (holds a pressure
  across a flow range). It decides the pressure–flow law.

A combination nozzle can have any of the three flow controls; a smooth bore
is single per tip.

**Scope (owner, 2026-10-16):** professional combination nozzles (adjustable
pattern) and smooth bores only. Fixed-pattern fog nozzles (fog tips,
piercing applicators, cellar and booster nozzles) are out of scope.

**Master streams are in scope** (owner, 2026-10-16): a master stream is a
nozzle (same laws as handlines, larger ratings; CGBVP default 80 psi for
master smooth bore, p. 72) on a **monitor**, which is an appliance whose
waterway loss grows with flow (§3.10: CGBVP fixed 10–25 psi; physical needs
the manufacturer's loss curve). A deck gun (fed by the pump's own piping) and
a single-inlet portable (floor/ground) monitor fed by one line both fit the
single-line model once appliance losses exist (M4); a portable monitor fed
by two or more lines through a siamese inlet needs branching (M4). Reaction
(§3.6) matters for portable monitors' stability. Data templates:
`data/templates/nozzles-template.csv` (`use` = handline | master) and
`data/templates/monitors-template.csv`. The scenario's `nozzle.kind` is the flow control; the
design is a separate attribute (catalog and data template:
`data/templates/nozzles-template.csv`).

### 3.4c Couplings limit what connects, not how much flows

A coupling has no maximum flow of its own: flow through it is limited by the
pressure available against the line's losses (§2), and friction already
grows with Q². What a coupling does limit is **what can be connected**
(owner, 2026-10-14: a 250 gpm nozzle on a 1½″ line must not just work):

- A nozzle has an **inlet size** (`inlet_size_in` in the data template). It
  goes on a hose whose coupling matches, or through an **adapter** that is
  drawn and named; adapter loss is not modelled until fittings exist
  (§3.10).
- **The inlet is data, not a function of gpm** (owner, 2026-10-14): the
  inlet size is read from the datasheet or plate and constrains the flow
  class, never the other way. The built-in generic nozzles declare it
  explicitly (1½″ up to 150 gpm, 2½″ for 250 gpm, marked generic); a real
  catalog row (`inlet_size_in`) overrides it. The picker groups by fit
  (UX.md §6).
- A hose's coupling size is its diameter, except 1¾″ (1½″ couplings) and 3″
  (2½″ or 3″, already two rows in §3.1). Basis: `convention`, `verify`
  against the station's hose; `hoseCouplingIn` in `catalog.ts`.
- A "maximum practical flow" per hose size is a training rule of thumb, not
  a law; it enters only with a published source (§9).

### 3.5 Fog nozzles

**Fixed gallonage:** `nozzle.fixed-orifice` (§3.3), default NP 100 psi
(`convention`, CGBVP p. 72). Low-pressure models (50/75 psi) are presets, not
a different law.

**Selectable gallonage:** `nozzle.selectable` ✅. A list of settings, each a
fixed orifice (Q_r at NP_r); the solver uses `nozzle.fixed-orifice` with the
selected setting. Turning the setting down reduces the flow, and with it the
cooling capacity (§3.12).

**Pattern** (straight stream ↔ wide fog) is stored and drawn but does not
enter the solution: on constant-gallonage combination nozzles the flow is
taken as independent of pattern. Basis: `verify` against manufacturer data
before the app states it as fact (§9).

**Automatic:** `nozzle.automatic` ⏳ M2. Candidate law: holds NP ≈ NP_set
while Q_min ≤ Q ≤ Q_max (the baffle opens or closes); outside that range it
behaves as a fixed orifice rated at the limit it reached. Still monotone in
Q, so bisection holds. Basis: `verify` the behaviour at the limits against a
manufacturer curve (TFT, Akron, Elkhart [E5]). Teaching point: an
under-pumped automatic nozzle shows a good pressure while flowing less than
expected.

### 3.6 Nozzle reaction: `nozzle.reaction` ⏳ M2

| Nozzle | Law | Basis |
|---|---|---|
| Smooth bore | **NR = 1.57 · d² · NP** (lbf, in, psi) | `physics`: momentum of an ideal jet, F = 2·A·NP = 2·(π/4)·d²·NP; `published` TFT [E4] |
| Fog | **NR = 0.0505 · Q · √NP** (lbf, gpm, psi) | `published` TFT [E4]; the ideal momentum value is 0.0526 |
| CGBVP shortcut | kg ≈ 0.24 · gpm at 100 psi | `convention`, p. 46: reference method only (VC-05: ~4.8 % high) |

Teaching point: at the same flow, a smooth bore at 50 psi pushes back less
than a fog nozzle at 100 psi (185 gpm: 69 vs 93 lbf).

### 3.7 Velocity: `flow.velocity` ✅ hose (drawing)

- **In a hose:** v = 0.4085 · Q / d² (ft/s, gpm, in). `physics`:
  Q = A·v, with 1 gpm = 0.002228 ft³/s.
- **At a nozzle exit:** v = √(2·g·h_p) = 12.18 · √NP ft/s, where h_p =
  2.307 ft of water per psi. `physics`.
- **Use:** particle speed in the drawing is the local velocity (scaled), and
  particles enter at a rate ∝ Q. A narrower hose shows faster, more spread-out
  particles carrying the same flow: **continuity**, A₁v₁ = A₂v₂, as the
  manual teaches (pp. 33–34).
- **As built** (`velocity.ts`, canvas): real time, unscaled; one particle
  per 1.25 gal, so the spacing is 1.25 gal / A and doesn't depend on Q
  (≈ 1.5 m in 2½″, 4.2 m in 1½″). Nozzle-exit velocity is not used yet.

### 3.8 Pump: `pump.*` ⏳ M3

- **`pump.envelope`.** The most net pressure the pump can give at a flow,
  through the rating points: **100 % of rated flow at 150 psi, 70 % at 200,
  50 % at 250** (net pump pressure; `published` NFPA 1911 [E10]). Between the
  points: piecewise linear (our **modelling choice**, stated on screen as
  such). Below 50 % flow: capped at the pump's maximum pressure. Above 100 %:
  `verify` against a real pump curve (Hale [E9]) before extrapolating.
- **`pump.governor`.** Pressure mode: the discharge holds the set point
  until the envelope is reached, then follows it. RPM mode: the curve at a
  fixed speed; pressure moves with flow (§ affinity below).
- **`pump.affinity`** (`physics`, Hydraulic Institute [E3]): Q ∝ N,
  H ∝ N², power ∝ N³. Used to scale the curve with engine speed in RPM mode.
- **`pump.discharge`:** P_discharge = P_intake + P_net. Tank-fed: P_intake ≈
  0 (the tank's head is ignored, a few psi at most).
- **`pump.power`:** water horsepower = Q · P / 1714 (hp, gpm, psi;
  `physics`, from 1 hp = 33 000 ft·lbf/min and 231 in³/gal). A 1000 gpm pump:
  87.5 hp at 150 psi, 82 at 200, 73 at 250.

### 3.9 Supply: `supply.*`

- **`supply.fixed-pressure`** ✅: the source is a set pressure. It models a
  pump at a set discharge and a **standpipe outlet** on the fire floor.
- **`supply.tank`** ⏳ M3: Q ≤ tank-to-pump line limit (apparatus data);
  time remaining = volume / Q.
- **`supply.hydrant`** ⏳ later: static/residual curve,
  Q₂ = Q₁ · ((P_s − P₂)/(P_s − P₁))^0.54 (`published` NFPA 291 [E8];
  `verify` the form).

### 3.10 Branching and appliances ⏳ M4

- **`junction.continuity`** (`physics`): at a wye, flow in = Σ flows out, and
  one pressure at the junction. A tree from one source has one unknown per
  junction, solved by nested bisection.
- **`appliance.fixed`** (`convention`, CGBVP p. 45): valve, wye, reducer
  5 psi; siamese 10; monitor 10–25; eductor 40. Method `cgbvp-2019` only.
- **`appliance.k`** (`physical`): ΔP = K · ρv²/2, or a manufacturer ΔP–Q
  curve. **No source chosen yet**: until one is, appliances under `physical`
  show "sin dato" rather than a guessed value.

### 3.11 Standpipes ⏳ M2 (outlet), M4 (system)

- **Outlet as the source:** `supply.fixed-pressure` (§3.9). Outlet design
  pressure: `verify` NFPA 14 by edition before using a number.
- **`pipe.hazen-williams`** (riser): p = 4.52 · Q^1.85 / (C^1.85 · d^4.87)
  psi per foot (gpm, in), C ≈ 120 for steel. `verify` the form and C against
  NFPA 13/14.
- **`valve.prv`:** P_out = min(P_set, P_in − ΔP_valve). Depends on upstream
  pressure, so the solver walks the line forward; still monotone in Q.
  Set points: `verify`.

### 3.12 Extinguishment: `extinguish.absorption` ⏳ M5

- Water from 20 °C to steam absorbs 4.18 × 80 + 2257 = **2591 kJ/kg ≈
  2.6 MJ/kg** (`physics`; IAPWS [E6] for the latent heat).
- 1 gpm = 0.0631 kg/s, so **full vaporisation absorbs ≈ 163 kW per gpm**.
- Real fires vaporise only part of the water: absorbed = Q × 163 kW × η.
  **η needs a source** (Särdqvist 2002; Grimwood) before shipping.
- The message the model must support: **flow sets the cooling capacity;
  pressure moves the flow and shapes the stream.**
- Its own folder (`src/extinguishment/`), never imported by the hydraulics.

## 4. Methods

A method swaps constants, never laws.

| Constant | `physical` (default) | `cgbvp-2019` (reference) |
|---|---|---|
| Elevation k | 1.424 psi/m | 1.5 psi/m |
| Appliance losses | K or curve (none yet) | fixed, p. 45 |
| Fog reaction | 0.0505·Q·√NP | 0.24 kg per gpm at 100 psi |
| Hose friction | same C table | same C table |

The screen always shows the reference beside the default, with the
difference.

## 5. Manual errors never encoded

From the review (§17.6) and `validation-cases.md`:

- Density in the volumetric-flow equation (p. 18).
- 10 m of water = 14.7 psi (p. 31; it is 14.2).
- Bernoulli missing ρ (p. 35).
- +22 % for 50→80 psi on a fixed orifice (p. 71; it is +26.5 %).
- Relay friction figures contradicting the manual's own C (p. 82).
- A universal 7 psi minimum intake as a cavitation criterion (p. 51).

## 6. Out of scope

| Topic | Why | Instead |
|---|---|---|
| Kinks | No published loss data (owner decision) | — |
| Stream reach and pattern | Jet breakup and drag; a ballistic arc overstates reach (manual p. 76–77 says so) | Manufacturer reach data, or a labelled qualitative comparison |
| Water hammer | Transient; needs its own model | Qualitative note |
| Drafting, NPSH, cavitation | Absolute pressure and pump data | Later, with real pump data |
| Hose collapse beyond the high-point rule | Structural data | — |
| Water temperature, density changes | Negligible at fireground ranges | — |

## 7. Formulas on screen

- Every element's breakdown names its law id, its inputs (in the screen's
  units and in the law's units when they differ) and its result, e.g.
  **FL = 24 × (100/100)² × (98.4 ft / 100) = 23.6 psi** · *Fuente: Manual
  CGBVP 2019, p. 39*.
- **The numbers come from the engine's breakdown**, never recomputed by the
  UI.
- Rendering: MathML (native in current browsers), plain HTML as fallback.
- Formula text and variable names: Spanish on screen; ids and code in
  English.

## 8. Tests

One test per law per source: against published tables or hand arithmetic,
written in the source's units and converted at the call. No tests for UI,
geometry or crashes (see AGENTS.md).

## 9. To verify before implementing

| Item | Law | Milestone | Where to check |
|---|---|---|---|
| Freeman constant 29.7 | `nozzle.smooth-bore` | M2 | IFSTA Pumping Apparatus Driver/Operator |
| Flow independent of pattern on combination nozzles | `nozzle.selectable` (pattern) | M2 | TFT / Akron / Elkhart [E5] |
| Automatic nozzle behaviour at its limits | `nozzle.automatic` | M2 | TFT / Akron / Elkhart [E5] curves |
| Standpipe outlet design pressure | `supply.fixed-pressure` presets | M2 | NFPA 14, by edition |
| Envelope above rated flow | `pump.envelope` | M3 | A real pump curve (Hale [E9]; M11-1/M11-5 plates) |
| Hazen–Williams form and C for steel | `pipe.hazen-williams` | M4 | NFPA 13/14 |
| PRV set points | `valve.prv` | M4 | NFPA 14; manufacturer data |
| Appliance K or curves | `appliance.k` | M4 | Manufacturer data [E5] |
| Hydrant curve form | `supply.hydrant` | later | NFPA 291 [E8] |
| Application efficiency η | `extinguish.absorption` | M5 | Särdqvist 2002; Grimwood |
