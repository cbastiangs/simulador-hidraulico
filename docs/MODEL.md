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
  (`references.ts` SOURCES, or the review's [E1]–[E15]).
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
  elements decide the **delivered** flow (§2). A **target** flow named for
  planning is a request, not a prescribed hydraulic demand: it never enters
  the forward solve as an input, and what the app reports is the flow the
  line actually delivers.

## 2. The line equation and how it is solved

For a line from a source to one nozzle, the source pressure is spent along
the way:

**P_source = NP + Σ FL + EP + Σ AL**

| Term | Meaning | Law |
|---|---|---|
| NP | nozzle pressure | §3.3–§3.5 |
| FL | friction loss in each hose section | §3.1 |
| EP | elevation pressure, source to nozzle | §3.2 |
| AL | appliance losses (wye, reducer, FDC…) | §3.10 (✅ in-line fittings; wyes M4) |

For continuous component relationships, the residual
**R(Q) = P_available(Q) − [NP(Q) + ΣFL(Q) + EP + ΣAL(Q)]** is continuous. In
a regime where required pressure strictly increases and available pressure
does not increase with Q, R is strictly decreasing. Continuity and opposite
signs at finite bracket endpoints guarantee a root; strict monotonicity
makes it unique ([E13]). **`solve.bisection`** ✅ finds that Q: start from
[0, 1], double the upper bound until it brackets the root, then halve to
floating-point precision. Subject to continuity and the valid bracket,
non-quadratic relationships can use the same scalar search; device operating
states such as a PRV still need explicit handling.

The guarantee is **conditional**, and meeting the conditions is the solver's
job, not an automatic property of the relationships. Two other cases are
distinct: closed-nozzle and insufficient-source cases are separate zero-flow
states, and a discontinuity with no balanced root must be reported as an
**unsatisfied-model case** — it is not an exact operating point. Today's
`solve.bisection` does the bracket-and-halve search; before additional laws
the engine is planned to establish a finite bracket and recheck the pressure
residual at the returned root. Neither is implemented yet, and the code has
no closed-source object.

The stepped `us-training` appliance rule (§3.10) is exactly such a gap: for a
pump pressure that falls **inside** the 10 psi step, no balanced positive
root exists, so the forward model must report an **unsatisfied balance**
rather than claiming the exact 350 gpm root or silently smoothing the step
away. Handling that gap is an **explicit prerequisite for shipping the
`us-training` forward solve**, not an optional refinement. The target
direction is different: for a **valid** target within the active profile's
and equipment's admissible flow range and open-flow configuration,
`P_required(Q_target)` is well defined, including at exactly 350 gpm. No new
smoothing curve or fallback number is introduced, and the default
bisection/GGA decision is unchanged.

**Default solver lane** ([E2]). The equations and the numerical algorithm
are separate choices. Our equations are the steady-state,
pressure-dependent, conservation-based hydraulics of EPA's EPANET manual
[E2]: at every node mass is conserved (node continuity, eq. 12.4), around
every link energy is conserved (link energy, eq. 12.3), and flow through an
opening follows its own pressure–flow law — an emitter `q = C·p^γ`, γ ≈ 0.5
for an open nozzle
([E2] §3.1) — so **nozzle flow is pressure-dependent, not a prescribed
demand**. The algorithm is not fixed by the equations. Default lane: a
single line by bisection (above), a one-source tree by nested bisection.
When general networks (loops, reconverging feeds) are needed, the plan is an
EPANET-style Global Gradient Algorithm (GGA) over the same equations. That
is our implementation **guided by** EPANET's equations, not an EPANET
implementation or certification; neither the tree solver nor the GGA is in
the runtime yet.

`line.ts` keeps the closed form for the all-quadratic case,
Q = √((P − EP) / (r_hose + r_nozzle)), as the **oracle** the solver is
tested against.

**Operating directions (two, one equation set).** Every solve uses the same
pressure budget and the same selected method and equipment data; the
direction only chooses what is known and what is solved.

- **Forward (pressure → flow), current.** The source is a set pressure and
  the solver returns the **delivered** flow Q where
  P_required(Q) = NP(Q) + ΣFL(Q) + EP + ΣAL(Q) meets the available pressure.
  This interactive pressure-driven mode is what the app runs. The engine also
  already evaluates the **inverse at the nozzle's rated flow**
  (`requiredPumpPressurePsi`, `series.ts`): the pump pressure that gives the
  rated flow at the rated nozzle pressure.
- **Target-flow planning (flow → pressure), planned.** The caller names an
  **arbitrary target** Q_target and the helper evaluates P_required(Q_target)
  from the same budget — no new law. It may expose the target beside the
  delivered/achievable flow as two separate quantities. Once a pump or source
  limit is modelled (M3), planning checks feasibility and then solves the
  **actual** delivered flow the source can sustain; it never forces the
  calculated delivered Q to equal the target. Target mode is **planned design,
  not shipped behaviour**, and a target or rated flow passed to a planning
  helper is a request to be checked, **not** a prescribed hydraulic demand —
  flow stays the output of the forward solve.

**`solve.high-point`** ✅ (`physics` + hose behaviour): if the source can't
lift water to the line's highest coupling, nothing flows, even to a lower
nozzle. A soft hose collapses rather than siphon. Pressure at every coupling
is reported, so the screen can show it. This is **our flexible-hose
assumption**, additional to the pressurized-network equations.

## 3. Laws by element

### 3.1 Hose friction: `hose.friction` ✅

**FL = C · (Q/100)² · (L/100)**, FL in psi, Q in gpm, L in **feet** (the
engine converts metres: L_ft = L_m / 0.3048). This empirical `FL = C·Q²·L`
form is the fire-service convention printed by the Colorado chart ([E15]
p. 2) and stated explicitly by the USDA Forest Service ([E11] Appendix C
p. 11), where C depends on hose type, condition and flow. The C table below
is the current Colorado DFPC **generic** table; a C measured for a specific
hose can override the generic value in the scenario document. Multi-point
equipment-curve support is planned, not part of the current schema.

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
  from diameter. Darcy–Weisbach explains this dependence but is not selected
  as the **default fire-hose law**. A separate pipe relationship can be
  supported when its input data are known; replacing C with guessed diameter
  or roughness is not an accuracy improvement (§3.11 remains a planned
  Hazen–Williams riser).
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
| `us-training` | 0.5 / 0.3048 = **1.640** | `convention`: Colorado DFPC pumper chart, "Elevation +/- 5 for every 10'" (0.5 psi/ft; 15 % above the physical value, the usual field round-up) |

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
- Basis: 29.7 is the factor the Colorado DFPC pumper chart prints, as
  **GPM = 29.7·d²·√NP** ([E15] p. 2); the constant is now sourced. The
  implementation is still M2, and IFSTA's handbook itself has not been
  directly inspected.
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
  against the station's hose; `couplingIn` on each `HOSE_SIZES` row. **Confirmed by
  the owner (2026-10-14):** most stations run 1¾″ hose on 1½″ couplings and
  3″ hose on 2½″ couplings.
- **Effect on the friction law:** none of its own. The coupling is already
  inside C: the 1¾″ row (15.5) is empirical for 1½″ couplings, and the two
  3″ rows (0.8 vs 0.677) differ only by coupling. So the hose row *is* the
  distinction; picking a hose picks its coupling and its C together. What a
  mismatch adds is an adapter, a separate loss not modelled until §3.10.
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

**A rating is a point, not a state** (owner's question, 2026-10-15). A
selectable nozzle's ring picks one of several fixed openings. Each is rated
as a pair, "Q_r gpm at NP_r psi" (TFT QuadraFog 30/60/95/125 gpm at 100 psi),
sized so that opening passes Q_r when the pressure at its inlet is NP_r. The
rated pressure is the same for every setting of that nozzle; the nozzle
pressure you actually get is not. It is whatever the line leaves at the
solved flow: NP = NP_r · (Q/Q_r)². Same pump, same hose, only the ring
turned (30 m of 1½″, C = 24, pump 125 psi, level, hand arithmetic from §3.1
and §3.3):

| Ring | Flow Q | NP at the inlet | Friction | Hose speed | Tip speed | Pump psi for NP = 100 |
|---|---|---|---|---|---|---|
| shut | 0 | 125 (static) | 0 | 0 | 0 | |
| 125 | 119 gpm | 91 psi | 34 | 6.6 m/s | 35 m/s | 137 |
| 95 | 96 gpm | 103 | 22 | 5.3 m/s | 38 m/s | 121 |
| 60 | 64 gpm | 115 | 10 | 3.6 m/s | 40 m/s | 109 |
| 30 | 33 gpm | 122 | 3 | 1.8 m/s | 41 m/s | 102 |

Lowering the ring makes a smaller opening, which raises the pressure behind
it **for a given pump pressure**; that is not what the rating states. The
rating only says which opening each position is. Over-pumping a 30 setting at
the 125 setting's pump pressure (137 psi) gives NP 134 (+34 %) and Q 35 gpm
(+16 %): mild, because Q ∝ √NP. A selectable nozzle does not hold NP; only an
automatic one does (below).

**Law versus claim.** Law (`physics`): Q = k·√NP for one fixed opening;
continuity; v = √(2gh). Claim (`published`, `verify`): that each ring position
has its own k such that it gives its labelled gpm at the rated pressure, and
that it keeps following Q ∝ √NP away from the rating. The manufacturer's
sheets give the rating pair; the ones consulted give no flow-versus-pressure
table off the rating, and none says where the rating pressure is measured
(§3.13: taken as the flowing pressure at the nozzle inlet, `convention`).
The rating pressure is per nozzle: TFT GF3D2S is rated at 75 psi, Akron
Turbojet 1720 lists 100 and 75. The app labels rating values as the
manufacturer's and results as calculated.

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
  (≈ 1.5 m in 2½″, 4.2 m in 1½″). Nozzle-exit velocity (`nozzleExitVelocityMps`) is shown in the Conceptos card, not drawn.

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
- **`appliance.fixed`** (`convention`) ✅ for in-line fittings (adapter,
  valve) under `cgbvp-2019` and `physical`; ⏳ `us-training`, wyes (M4).
  A fitting at a joint adds a loss AL(kind, Q) to the series sum (§2). Each
  method carries its own table (§4). Wyes wait for branching (M4); adapters
  and valves do not, since a fixed loss is monotone in Q and `series.ts` can
  take it. As built: the loss is spent only while water flows (none at
  Q = 0); a coupling's gauge reads upstream of the fittings at its joint, and
  at the nozzle joint the fittings sit between the hose end and the nozzle;
  "sin dato" counts 0 and is labelled. An adapter belongs wherever the
  **coupling** sizes differ (1¾″ on 1½″ couplings meets 1½″ hose directly),
  read from the hose row's `couplingIn`, the pump's outlet size and the
  nozzle spec's inlet.

  | Fitting | `cgbvp-2019` | `us-training` | `physical` |
  |---|---|---|---|
  | Reducer, adapter, valve | 5 psi (p. 45) | generic "appliance" rule (training mapping) | "sin dato" |
  | Wye | 5 psi | generic rule, on common-port flow | "sin dato" |
  | Siamese | ~10 psi | generic rule, on common-port flow | "sin dato" |
  | Master stream device | monitor 10–25 psi | 25 psi | "sin dato" |
  | Aerial waterway | — | 25 psi | "sin dato" |
  | Standpipe (whole system) | none (floor shortcut only) | 25 psi | n/a |
  | Eductor | 40 psi | none: manufacturer data only | "sin dato" |

  **`us-training` appliance rule (adopted, planned runtime).** The chart's
  clauses are adopted as this profile's appliance model (`published`,
  Colorado DFPC pumper chart Jan 2020, [E15] p. 1, read 2026-10-15;
  `coloradoPumperChart` in `references.ts`):

  - **Generic training appliance:** AL = 0 for 0 ≤ Q ≤ 350 gpm, AL = 10 psi
    for Q > 350 gpm. The threshold is strictly ">"; at exactly 350 gpm there
    is no allowance. The chart prints "Appliances + 10 psi > 350 gpm" and
    names "appliances" only generically.
  - **Master stream device:** 25 psi. **Aerial waterway:** 25 psi.
  - **Standpipe:** a **whole-system** allowance of 25 psi, independent of the
    number of floors (elevation stays separate, §3.2).

  Every allowance counts only for a **flowing** operation, so none is added
  at Q = 0, and each is evaluated at the flow **through the appliance** — for
  a wye or siamese, the total/common-port flow, not the per-branch flow.
  (Branching and siamese are still planned; when implemented, the appliance's
  common-port flow is the unknown the tree solver already carries.) Each is
  counted **once per represented component or system**.

  **Scope and accounting.** The 10 psi is **not** claimed as a universal
  physical loss; it is a training allowance inside this profile's scope, and
  the profile does not claim to cover every appliance or fitting.
  Classifying a reducer, adapter or in-line valve as the generic "Appliances"
  category is an explicit **simulator training mapping** — our convention,
  not measured device data and not primary IFSTA verification. The profile
  never adds **any** training allowance (10 or 25 psi) **and** a detailed
  loss curve for the same device or system. A **standpipe outlet used as the
  source** (only the downstream hose is modelled, §3.11) gets **no** upstream
  standpipe allowance: that allowance stands for the unresolved internal
  system loss, is **not** a charge on every valve or floor, and is **not**
  summed with a full detailed riser loss for the same representation. A master stream and an aerial
  waterway are separate actual represented elements, each charged when both
  are present — there is no blanket "always add both". **Eductors** still
  need manufacturer operating data at the actual conditions; there is no
  universal 40/25 psi fallback.

  The rule is a step in Q: the residual never increases, but a monotone step
  does **not** guarantee an exact root — at the step there can be pump
  pressures with no solution. The screen labels the rule ("regla de 350
  gpm") rather than hiding it, and the no-root gap is handled as an
  unsatisfied balance (§2). This is a **planned constraint, not something
  the current code enforces**, and no arbitrary fallback number is used.

  All of these are **training conventions, not measurements.** None of the
  training sources found cites a test; the CGBVP and US figures disagree
  with each other (5 flat vs 0/10 stepped), and departments disagree too —
  several call wye, reducer and siamese losses negligible and do not
  calculate them. The one measured counter-example is narrow: the US Forest
  Service measured 1½″ appliance losses at 50 gpm in a **wildland hose-lay**
  test — **0.46 psi** (wye valve), **0.05 psi** (hose-line tee) and
  **0.77 psi** (tee with valve) — and concludes that omitting appliance loss
  is more accurate than assigning the flat 5 psi **for that wildland lay**
  (`published` [E11], read 2026-10-15). That is not universal structural
  flow or generic valve data, and it is not a Q-curve. Measured manufacturer
  data exists for monitors, eductors and now wyes (see §9).
- **`appliance.k`** (`physical`): ΔP = K · ρv²/2, or a manufacturer ΔP–Q
  curve. Elkhart publishes a per-port ΔP–Q chart for the B-100 / B-100-A /
  B-100-N wye (2.5″ inlet × two 1.5″ outlets), one-port and both-ports,
  reported as **total static pressure drop** and friction loss ([E5], read
  2026-10-15; the PDFs are now reachable). A K or curve is used only for the
  actual equipment, valve state and flow range it documents; a static-drop
  curve and a friction-loss curve for the same device are **not added
  together**, and the velocity-pressure change is not counted twice
  (Elkhart's method note: static drop = friction loss + velocity-pressure
  change [E5]). A K also needs its **reference velocity and diameter**
  documented, and a generic pipe-fitting K is not transplanted to a
  different fire appliance — the geometry, valve state and valid range must
  match. No value is adopted yet: until the curve is read and a choice is
  made, appliances under `physical` show "sin dato" rather than a guessed
  value. Missing data stays **visibly unmodelled** — a "sin dato"
  contribution of 0 is a placeholder, not a measured zero.

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
- **Convention, `extinguish.fire-flow`** ⏳ first (ROADMAP §11 decision 8):
  NFA required flow, gpm = area ft² / 3 × fraction involved. Area is in m²
  in the scenario; ft² is converted inside the law (`units.ts`). Written
  from memory: `verify` against the NFA publication before use. A training
  convention, not physics. Iowa (volume ft³ / 100) is not planned.

### 3.13 Pressures and speed: vocabulary

Three quantities that are often confused: **pressure** (psi), **flow**
(gpm, a volume per minute) and **speed** (m/s). A teaching aid and a rule for
labels on screen; no new law.

| Term (screen) | Meaning | Where in the model |
|---|---|---|
| **Presión estática** | pressure with no flow (nozzle shut): pump pressure minus height | §3.2; a shut nozzle already shows it at every gauge |
| **Presión de flujo / residual** | pressure at a point while water flows: static minus the friction so far | each coupling's gauge |
| **Presión en el pitón (NP)** | the flowing pressure at the nozzle **inlet**, behind the opening ("backpressure"). Ratings and the laws of §3.3–§3.5 use it. `convention`, `verify` where each manufacturer measures it | last node of the solver |
| **Presión a la salida** | the jet leaves into the air: **atmospheric**, 0 psi gauge, for every setting. The pressure has become speed | not modelled; nothing to show |
| **Caudal (gpm)** | volume per minute, Q = A·v; the **delivered** flow, a solved output, never typed in. A **target** flow is a requested value used for planning, not the delivered output (§2) | solver |
| **Velocidad** | in a hose v = 0.4085·Q/d² (§3.7); at the tip v = 12.18·√NP ft/s, which depends on NP only | §3.7 (tip part not drawn yet) |
| **Reacción** | force on the hands (§3.6) | ⏳ M2 |

Rules that follow:
- At low flow friction falls to nothing, so **flowing pressure approaches
  static pressure**: a healthy gauge says little about how much water arrives.
- A lower ring setting gives a **faster, thinner** jet (tip speed ∝ √NP) that
  carries less water: speed is not flow.
- "Required pressure" in the app (`requiredPumpPressurePsi`) is the **pump**
  discharge pressure at which the nozzle gets its rated flow at its rated
  pressure: rated NP + friction at the rated flow + height. It is not the
  nozzle's rating.

## 4. Methods and the default model

A method selects the supported component loss **relationships and their
parameters** — the friction form and its coefficients, the elevation factor,
the appliance rule, the fog reaction — plus data tables read by those laws.
It is not a bundle of constants only: which relationship is supported is
itself a choice. **Equipment-specific coefficients and curves stay
separate** from the method, in the equipment and scenario data (a method
reads them, it does not carry them), and separate again from the numerical
algorithm (§2). Units are exact and fixed (§1): there is no approximate
"30 m = 100 ft" axis, and no method changes a conversion factor.

A method is a **named selection of independent choices**, not a black box.
The engine reads the choices, never the method id, so a preset and a
**user-defined method** are the same kind of object: a preset just fills the
choices with someone else's values. Custom profiles **clone and version** a
full configuration and are saved in the scenario document. Built-in
defaults, user measurements and explicit assumptions retain their
provenance. (Owner, 2026-10-15: methods must be swappable and
user-definable.)

**Default model.** The default UI name is **"Modelo base"** (owner,
2026-10-15; not "Física": friction is an empirical table and appliances are
unmodelled, so it is a chosen basis, not physics alone); its
internal id stays `physical` for now (legacy), and it is a **source-based
descriptive default** — a chosen basis, not a claim that every value is
measured or complete. Component by component:

| Component | Default relationship | Source / status |
|---|---|---|
| Conservation (mass + energy) | steady-state, pressure-dependent; emitter `q = C·p^γ`, γ ≈ 0.5 for open nozzles | EPA EPANET manual [E2] §3.1, §3.3, §12.1 |
| Hose friction | `FL = C·(Q/100)²·(L/100)` | Colorado DFPC generic C table [E15] p. 2; form supported by USDA [E11] App. C p. 11; a measured C can override the generic value now (multi-point curves are a planned future law) |
| Elevation | `EP = (0.434/0.3048)·h_m psi` (hydrostatics) | `physics`; 0.434 psi/ft is the usual published approximation, not an exact constant |
| Appliances | sourced K or ΔP–Q curve for the actual device; else explicitly unmodelled ("sin dato") | unmodelled ≠ a measured zero; curves not yet adopted (§3.10) |
| Source | fixed pressure today; a **measured** pump curve later | certification/test points are not a measured full curve |

**Runtime status.** Only the existing `physical` and `cgbvp-2019` profile
parameter sets are implemented; `us-training`, user methods, the read-only
picker requirement below, and the **arbitrary target-flow planning mode**
(§2) — beyond today's rated-flow inverse — are **planned for the next
refactor**, not shipped behavior. Nothing in §3.10's adopted `us-training`
rule or §9's mapping runs today.

**Selecting and comparing** (owner, 2026-10-15; replaces "`cgbvp-2019` is a
read-only reference, never a preset"). No method is privileged. Two slots:

- **Método:** the one the app calculates with; default "Modelo base".
- **Comparar con:** any other method, or none. When set, the same scenario
  is solved again under it and the difference shown beside each number.
  It is a toggle so the second solve can be switched off when solving gets
  heavier (trees, networks).

Every method can go in either slot: `physical`, `cgbvp-2019`,
`us-training` and the user's own. **Built-ins are read-only,** so a number
labelled "CGBVP 2019" or "Colorado" always matches its source; **"Clonar"**
makes an editable, selectable copy (e.g. an instructor's version of the
CGBVP manual).

`us-training` is the US fire-service teaching model, labelled specifically
as the **Colorado DFPC pumper chart (Jan 2020)** and the rules of thumb that
go with it — not a generic "certified IFSTA" model. It is **adopted** for
planned implementation (owner, 2026-10-15): the 10 psi and 25 psi allowances
are verified from the Colorado chart (§3.10, [E15] p. 1), so direct IFSTA
verification is unnecessary to implement this specifically labelled Colorado
profile. The profile is **complete within its stated scope** — it
supplies the components §3.10 lists and makes no claim to cover every
appliance or fitting. It stays **separate** from the equipment-specific
default: the `physical` equipment-data policy is unchanged, and a training
allowance is never silently swapped in for measured data (or the reverse).
Nozzle pressures it teaches (50 psi smooth bore handline, 100 psi fog, 80
psi master stream) are nozzle data, not method constants.

| Constant | `physical` (default) | `cgbvp-2019` (reference) | `us-training` (owner, 2026-10-15) |
|---|---|---|---|
| Elevation k | 1.424 psi/m | 1.5 psi/m | 1.640 psi/m (0.5 psi/ft) |
| Appliance losses | K or curve (none yet) | fixed, p. 45 | 0 / 10 psi > 350 gpm; 25 psi master stream, aerial and whole-system standpipe (§3.10) |
| Fog reaction | 0.0505·Q·√NP | 0.24 kg per gpm at 100 psi | same as `physical` |
| Hose friction | same C table | same C table | same C table (it is the Colorado chart's) |

**Prior art — public calculator only.** A public Pump Forge PDP calculator
page (pump-forge.com, [E14], read 2026-10-15) is a **comparison**: it takes a
**target gpm and returns a required PDP** (the planning direction). Its
inline JavaScript shows a `us-training`-style model:
`FL = C·(gpm/100)²·(len_ft/100)`; elevation 0.434 psi/ft (its default); wye
and siamese each +10 psi when `gpm >= 350`; standpipe and aerial/deck gun
each +25 psi; the total PDP rounded. Two differences from our `us-training`
method: elevation is 0.434 psi/ft (ours: 0.5), and its wye/siamese gate fires
at exactly 350 gpm while the Colorado chart is strictly `> 350`. We neither
blend the two profiles nor claim they are identical, and **no automatic Pump
Forge preset is adopted** — a user can reproduce its numbers through a custom
profile. This is evidence about a **public calculator page** only; it does
not verify the site's separate private simulator, and no proprietary formula
is adopted.

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
| Freeman constant 29.7 | `nozzle.smooth-bore` | M2 | verified: Colorado DFPC chart p. 2 prints `GPM = 29.7·d²·√NP` [E15]; IFSTA handbook not directly inspected (implementation still M2) |
| Flow independent of pattern on combination nozzles | `nozzle.selectable` (pattern) | M2 | TFT / Akron / Elkhart [E5] |
| Where each manufacturer measures the rated pressure (inlet while flowing?) | `nozzle.fixed-orifice` | M2 | TFT / Akron / Elkhart test notes [E5]; NFPA 1964 |
| Selectable nozzle off its rating: does each ring position follow Q ∝ √NP? | `nozzle.selectable` | M2 | Flow-versus-pressure curves from the manufacturer, or a flow test |
| Automatic nozzle behaviour at its limits | `nozzle.automatic` | M2 | TFT / Akron / Elkhart [E5] curves |
| Standpipe outlet design pressure | `supply.fixed-pressure` presets | M2 | NFPA 14, by edition |
| Envelope above rated flow | `pump.envelope` | M3 | A real pump curve (Hale [E9]; M11-1/M11-5 plates) |
| Hazen–Williams form and C for steel | `pipe.hazen-williams` | M4 | NFPA 13/14 |
| PRV set points | `valve.prv` | M4 | NFPA 14; manufacturer data |
| Appliance K or curves | `appliance.k` | M4 | Elkhart B-100 wye ΔP–Q chart, both ports / one port (2.5″ × 1.5″) [E5]; read as **total static pressure drop** (ΔP_S = H_F + ΔP_V), not friction loss alone |
| Wildland 1½″ appliance measurements at 50 gpm | `appliance.k` / `appliance.fixed` | M4 | USDA FS SDTDC wildland-hose-lay test: 1½″ wye valve 0.46 / tee 0.05 / tee+valve 0.77 psi at 50 gpm ([E11]; specific to that lay, not universal structural flow or generic valve loss) |
| Siamese loss is flow- and waterway-dependent | `appliance.k` | M4 | Humat Rural Hitch field test ([E12], 2021-12-10): straight box waterway (Qgpm, psi) = (504,4)/(873,6)/(1158,13); clapper (582,14)/(840,39)/(1158,45). The report's +40 psi above 750 gpm is an operational allowance, not a measured difference |
| Generic training "Appliances" mapping (reducers, adapters, in-line valves → 0/10 psi) | `appliance.fixed` | M4 | Adopted simulator mapping (§3.10); numeric allowance from Colorado [E15] p. 1. Implement the labelled mapping and test the 350 gpm boundary / no-root gap |
| Monitor loss: use Elkhart's *total static pressure drop*, not friction loss alone (Python 299-11, friction only: 11/18/24 psi at 750/1000/1250 gpm) | `appliance.fixed` / monitor | M2–M4 | Elkhart catalog f9 05-43 and Python pressure-drop chart (read 2026-10-15) |
| Eductor: Elkhart 240 water bypass 2/6/11 psig at 60/95/125 gpm; foam mode needs 200 psi in, ≤ 130 psi out (≥ 70 psi drop, inferred), not CGBVP's flat 40 | `appliance.fixed` / eductor | M4 | Elkhart manual 98069000 Rev A, pp. 2–3 (read 2026-10-15) |
| Hydrant curve form | `supply.hydrant` | later | NFPA 291 [E8] |
| Application efficiency η | `extinguish.absorption` | M5 | Särdqvist 2002; Grimwood |
| Fire-preset heat release rates (MW) | `extinguish.absorption` | M5 | a published HRR source (to choose) |
| NFA fire-flow formula | `extinguish.fire-flow` | M5 (first) | NFA fire-flow formula publication |
