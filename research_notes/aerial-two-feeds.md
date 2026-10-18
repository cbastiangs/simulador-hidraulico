# Aerial waterway with two feeds — research notes

Research checked **2026-10-17**. Scope: the sources a two-feed aerial-waterway
showcase would need — two feeds into one waterway (the truck's own pump and an
outside engine), a check valve that lets the stronger feed close the weaker
one, and the general-network solver that models it. Feeds a design decision;
this note makes no engine, UI or `MODEL.md` change.

Context read first: `docs/MODEL.md` §2 (solver), §3.8 (pump), §3.10
(appliances), §9 (open items); `docs/ROADMAP.md` §7.7 (two pumps) and §8
(aerial module); `docs/manual-summaries/hydraulics/cgbvp-hydraulics-review.md`.

**Rules applied.** Every number names document, edition, page and the date
read. Values are recorded in the source's own units. Each item is labelled
**published** (printed by a manufacturer, standard or manual), **derived**
(worked from published values) or **not found** (with where I searched).
Manufacturer data is preferred over training allowances; training allowances
are labelled **convention**.

**Sources already in the repo, reused here.** [E2] EPANET 2.2 User Manual;
[E4] TFT nozzle reaction; [E5] Elkhart Brass technical data; [E10] NFPA 1911
test points; [E12] Bay District VFD *Humat Rural Hitch* field test; [E15]
Colorado DFPC pumper chart (Jan 2020). The review's evidence-strength note
applies: manufacturer data or measured tests beat generic textbook values.

**Not accessible.** The CGBVP 2019 manual itself (see R7) and the IFSTA
*Pumping and Aerial Apparatus Driver/Operator Handbook* were not available to
inspect directly on 2026-10-17; where they are cited below it is second-hand
and labelled so.

---

## R1. Check valve (clapper) law

**Status: partial. A generic swing-check law exists; no fire siamese/FDC
manufacturer publishes a clapper Δp–Q curve.**

### Findings

A fire-service siamese/FDC "clapper" is a **swing check valve**: a hinged disc
that the flow pushes open and that closes on reverse flow. Manufacturers of
siamese and FDC bodies state the design intent (unobstructed waterway, one-way
flow) and the **rated flow per 2½″ inlet**, but, in the catalogues reachable on
2026-10-17, they do **not** print a loss curve.

| Source | What it gives | Units | Basis |
|---|---|---|---|
| Cla-Val Series 501A Wafer Swing Check Valve, datasheet E-501A (R-3/2010), p. 2 | **Disc cracking pressure: all valves ≈ 0.5 psi**; Cv factors (2½″ 116, 3″ 208, 4″ 325, 5″ 551, 6″ 843 gpm); p. 3 pressure-loss curve in **ft of water vs gpm** | psi; gpm | published (Cla-Val, read 2026-10-17) |
| Tyco/Johnson Controls Model F52 Grooved End Check Valve, product doc | **Nominal pressure drop only 2.9 psi at 250 gpm**; holds tight for back pressures > 1 psi; p. loss vs flow in "Figure D" | psi; gpm | published (read 2026-10-17) |
| Elkhart Brass *Building Connections* (siamese/FDC), catalog f9 12-07, p. 12-7 | each 2½″ NHT inlet **rated 250 gpm**; body rated **175 psi**; "individual drop" clapper; no loss curve | gpm; psi | published (read 2026-10-17) |
| Dixon/Powhatan single & double clapper siamese, 2007 catalog pp. 2-2…2-5; ARGCO FDC submittal (2020) | **500 gpm minimum / 250 gpm per inlet**; max working pressure 175 psi (some 250 psi) | gpm; psi | published (read 2026-10-17) |
| Akron Brass Clapper Valve Siamese, style 1262 product page | 2½″ F in × 2½″/3″ M out; loss data behind a login, **not published here** | in | not found (Akron product page, read 2026-10-17) |
| TFT Jumbo Siamese Clapper Valve (double 5″ Storz) product page | combines two lines into one; **no loss curve** | — | not found (TFT product page, read 2026-10-17) |
| [E5] Elkhart Brass, *Interpreting Flow Data* method note | Elkhart reports a device's loss as **Total Static Pressure Drop = velocity-pressure change (ΔP_V) + friction loss (H_F)**, and says the fire service loosely calls both "friction loss" | psi | published ([E5], re-read 2026-10-17) |
| [E2] EPANET 2.2 User Manual, Table 3.3 (usepa.github.io mirror) | **swing check valve, fully open: minor-loss coefficient K = 2.5** (a generic pipe-fitting K, not fire-appliance data) | unitless | published (read 2026-10-17) |
| SLB, "How it Works: Check Valves" (2015-01-09) | cracking pressure **generally 1–5 psi**; opening set by flow, full open ≈ **85°** | psi; deg | published industry explainer (read 2026-10-17) |
| *Plumbing & Mechanical*, "Design and use of check valves" (2018-09-29) | size a check by its **specified pressure drop — 0.5 psi swing, 3.0 psi linear-lift** — not by pipe size | psi | published (read 2026-10-17) |

### The Humat measurement already in `MODEL.md` §9

`MODEL.md` §9 carries [E12] (Bay District VFD, *The Rural Hitch Using the Humat
Valve*, field test 2021-12-10, p. 7), measured points for the **clapper** and
for a **straight box waterway** at the same flows:

| Device | (Q gpm, Δp psi) | Basis |
|---|---|---|
| straight box waterway | (504, 4) (873, 6) (1158, 13) | published field test [E12] |
| clapper | (582, 14) (840, 39) (1158, 45) | published field test [E12] |

The Humat training page (humat.com/trainingsupport, read 2026-10-17) adds a
**hydrant-mode** measurement for its hydrant valve — "actual friction loss thru
Humat valve" **23 psi at 1000 gpm, 36 psi at 1300 gpm** — and states that in
pump mode the loss "drops to a negligible amount, even at 2000 gpm". That is
the hydrant valve, not the clapper siamese; it is not the same device as [E12].

### Static vs friction

- **Elkhart (monitors and devices) reports Total Static Pressure Drop** =
  ΔP_V + H_F, and publishes both curves; a static-drop curve and a
  friction-loss curve for the same device are **not added together** ([E5]
  method note, re-confirmed on the 2026-10-17 monitor charts, see R6).
- The generic swing-check K = 2.5 in [E2] is a **minor-loss coefficient**
  (head loss only), so it is not directly comparable to Elkhart's static drop.
- **Cracking pressure** from the valve industry runs **≈ 0.5 psi** (Cla-Val)
  to **1–5 psi** (SLB); the F52 is tight above **1 psi** back pressure. No
  fire-siamese-specific cracking pressure was found.

### Open questions

- No published clapper Δp–Q curve for an Elkhart, Akron or TFT **siamese /
  FDC / aerial-waterway inlet** was found on 2026-10-17. [E12] is the only
  measured clapper curve located. Before adopting a clapper law, a real
  device's curve (or a flow test) is needed.
- Cracking pressure for the actual waterway inlet check valve is unknown; the
  ≈0.5–5 psi industry range is not fire-equipment data.

---

## R2. Pump curve near shutoff

**Status: partial. The three NFPA 1901 rating points are published for the
station's pump; the near-shutoff shape comes from other Hale/Darley pumps and
from the stationary-pump (NFPA 20) churn band. A continuous curve for the
exact Darley PSP-1250 was not found.**

### The station pumper's pump

The owner's pumper has a **Darley, 1250 gpm** (`ROADMAP.md` §6). Darley's PSP
(compact single-stage PTO) is the family for this rating:

| Pump | NFPA points (gpm @ psi) | Basis |
|---|---|---|
| Darley PSP 1250 (and PSM/LDM/PSR/PSF-IC 1250, all printed the same) | **1250 @ 150; 875 @ 200; 625 @ 250** | published (Darley *PSP 1000, 1250, 1500* spec sheet, 2022-04-22; Darley *Pump Catalog 2017*, p. 35/49; read 2026-10-17) |

These are the same shape as `MODEL.md` §3.8 and NFPA 1911 [E10] — **100 % at
150 psi, 70 % at 200, 50 % at 250**. They are **rating/test points, not a
curve**; Darley publishes no continuous head–flow curve for the PSP-1250 in the
reachable documents (searched: darley.com pump catalog and PSP spec sheet,
2026-10-17).

### Real curves that do reach near shutoff

Hale publishes **flow-range points** for its high-pressure wildland pumps that
include the low-flow end:

| Hale pump | Flow-range points (gpm @ psi) | Basis |
|---|---|---|
| HPX75-KBD24 (rated 50 gpm @ 250) | **15 @ 350; 70 @ 260; 145 @ 90** | published (Hale Full Line Catalog 2018, p. 40; read 2026-10-17) |
| HPX75-B18 (rated 50 gpm @ 250) | **15 @ 325; 70 @ 200; 135 @ 50** | same |
| HPX200-H20 (rated 150 gpm) | **70 @ 140; 150 @ 115; 240 @ 40** | same |

These bracket the **0–50 % region** for a real centrifugal fire pump: at
**30 % of rated flow (15 gpm of 50)** the HPX75-KBD24 makes **350 psi**, i.e.
**1.4× its rated pressure** — the same order as the NFPA 20 churn band below.
The shape is **concave**: pressure rises steeply as flow falls toward zero,
then flattens; it does not rise linearly. (This pump is a portable, not a
midship 1250; it is evidence of shape, not of the PSP's own curve.)

### What the manufacturer says about running near zero flow

| Source | Statement | Units | Basis |
|---|---|---|---|
| Darley operator manuals (e.g. 1200570 JMH, 2013; LDM manual 043482, 2012) | **"Do not run the pump long with discharge completely shut off."** At shutoff "there is a small rise in pressure, the water churns in the pump casing and the power drops to a low value." | psi | published (read 2026-10-17) |
| Hale Full Line Catalog 2018, p. 11 (TRV) | Hale **Thermal Relief Valve** "protects your pump from the overheating that may be caused by **'dead heading' a pump**", opening at a preset **120 °F (49 °C)** and dumping water to atmosphere or tank | °F | published (read 2026-10-17) |
| Hale Full Line Catalog 2018, p. 5 (Qtwo) | two-stage Qtwo's "**parallel operations allow high flows while eliminating low flow circulation issues** common to larger single impeller pumps" | — | published (read 2026-10-17) |
| Hale/IDEX *Truth About Pump Performance* brochure | (image-based; no extractable numeric curve) | — | not found (read 2026-10-17) |

### The stationary-fire-pump churn band (context)

For **NFPA 20** stationary fire pumps — a different standard from the mobile
NFPA 1901 — the shutoff ("churn") pressure is standardised:

| Source | Rule | Basis |
|---|---|---|
| Hydraulic Institute, "Ensure Fire Pumps Meet Performance & Mechanical Standards" (pumps.org, 2023-06-08) | **shutoff/churn pressure must fall between 101 % and 140 % of rated pressure**, and the pump must reach **150 % of rated flow at 65 % of rated pressure** | published (read 2026-10-17) |
| Consulting-Specifying Engineer, "NFPA 20: Fire pump design" | churn is "the maximum allowable total head pressure when the pump is operating at **zero flow**"; a **churn rating of 126 %** produces 71 psi discharge from a 56 psi pump | published (read 2026-10-17) |
| NFPA 20 committee report (A2024 FIM ballot) | a **circulation relief valve** shall "provide sufficient water flow to prevent the pump from **overheating when operating with no discharge**" | published (read 2026-10-17) |

**Caveat:** NFPA 20 governs building fire pumps, not fire apparatus. **NFPA
1901** (mobile apparatus) publishes the 100/70/50 % test points but, in the
documents searched (NFPA 1901 committee reports; FAMA "NFPA 1901 Pump Test
Changes"), **no churn-percentage cap**. So the 101–140 % band is a **context
value**, not a direct rule for the station's Darley.

### Open questions

- **Not found:** a continuous head–flow curve for the **Darley PSP-1250**, and
  in particular the precise 0–50 % shape. The owner's pump plate (not yet
  supplied) is the authority. Next sources: Darley's factory pump test sheet
  for the exact model/impeller, or the SEACE procurement.
- The interaction of the pump's **governor** with the shutoff region (does it
  hold set pressure into churn, or drop to the curve?) is not documented in
  the sources read.

---

## R3. Backflow through the pump

**Status: the governing rule is published. A check valve on any discharge that
can be fed by another pump is required; the exact plumbing of a given pumper's
waterway feed is not published in the documents found.**

### The rule

| Source | Clause | Basis |
|---|---|---|
| **NFPA 1901**, committee report 1901_A2015_FDA-AAA_FD_PIResponses (published 2013-12-31), §XX.6.2 | **"Any discharge that can be supplied from another pump system on the apparatus shall have check valves in both supply lines to prevent backflow into either pump."** | published (read 2026-10-17) |

This is exactly the two-feed case: a discharge (and, by extension, the aerial
waterway if it can be supplied from more than one pump on the apparatus) must
carry a check valve so the higher-pressure feed cannot push water back into the
lower-pressure pump. It is a **plumbing requirement**, not a loss law.

### Evidence that the apparatus pump has a discharge check valve

| Source | Statement | Basis |
|---|---|---|
| Darley Pump Catalog 2017, "Features that set Darley pumps apart" (p. 53) and LDM/PSM pages (pp. 55–56) | **"Discharge check valve allows priming with discharge valves open"**; listed as a Darley midship feature | published (read 2026-10-17) |
| FoamPro accessories (foampro.com) | **"Main Waterway Check Valve — Prevents backflow to fire pump"**, stainless, rated **450 psi**, for 1½″–4″ | published (read 2026-10-17) |
| NFPA 20 committee report, §4.13.1.3 | the automatic relief valve is installed on the discharge side of the pump **before the discharge check valve** (stationary pumps; shows the check sits at the pump discharge) | published (read 2026-10-17) |

So a Darley apparatus pump is plumbed with a **discharge check valve**: when
the outside supply's waterway pressure exceeds the pump's discharge, the
check would close and the pump could not be back-driven. The **pump's own
relief/governor** then decides what the isolated pump does (it can dead-head,
which is the R2 overheating case).

### Not found

- An **explicit Pierce / E-One / Rosenbauer / Spartan / Sutphen / KME plumbing
  diagram** showing where the check valve sits between the pump and the
  **aerial waterway** specifically. Searched: Pierce pumper operator manual
  (montgomerycountymd.gov copy is **scanned, no extractable text**),
  piercemfg.com aerial spec pages, rosenbauer.com aerial pages, E-One spec
  sheets (2026), spartaner.com LT-TEL-ST O&M manual TOC (aerial waterway
  section exists but the diagram was not retrieved). No manufacturer published
  the feed plumbing as text.
- Whether a **quint/aerial** waterway feed is itself check-valved separately
  from the pump discharge check. The aerials' spec sheets list a "waterway
  discharge with electric valve" (E-One) or a waterway valve, but not a check.

### Open questions

- The owner's **PLT-11 plumbing** (pump → waterway, and the external inlet's
  size) is unknown and is on the "ask the owner" list. That plumbing decides
  whether the R3 check valve is one device or two, and its cracking pressure
  (R1).

---

## R8. Solver with check valves

**Status: well documented. EPANET's GGA handles a check valve by switching its
status; pumps are power-law curves with a shutoff head; convergence failures
are described. epanet-js is an MIT-licensed port that can serve as an oracle.**

### The global gradient algorithm (GGA)

**Primary source:** Todini, E. and Pilati, S. (1988), "A gradient algorithm for
the analysis of pipe networks", in B. Coulbeck and C. Orr (eds), *Computer
Applications in Water Supply, Vol. 1 — Systems Analysis and Simulation*,
Research Studies Press, Letchworth, pp. 1–20. Full derivation and comparison:
Todini, E. and Rossman, L. A. (2013), "Unified Framework for Deriving
Simultaneous Equation Algorithms for Water Distribution Networks", *J. Hydraul.
Eng.* 139(5): 511–526. Both **published** (read 2026-10-17).

**EPANET 2.2 User Manual, ch. 12** (usepa.github.io/EPANET2.2/12_analysis_algorithms.html,
read 2026-10-17) states the equations and the algorithm:

| Component | How EPANET handles it | Basis |
|---|---|---|
| Pipe head loss | h_L = r·q·\|q\|^(n−1) + m·q·\|q\| (eq. 12.1) | published [E2] |
| **Pump** | power law h_L = −ω²·(h₀ − r·(q/ω)ⁿ) (eq. 12.2): **h₀ = shutoff head**, ω = relative speed, r,n curve coefficients; q required positive | published [E2] |
| **Fixed-pressure source** | "fixed grade nodes (tanks and reservoirs)" — known head H_f enters the RHS (eq. 12.10) | published [E2] |
| Pump gradient | g = n·ω²·r·(q/ω)^(n−1) (eq. 12.9) | published [E2] |
| Convergence | Σ\|Δq\| / Σ\|q\| < **ACCURACY** (default **0.001**); optional head-error and flow-change limits | published [E2] |
| Low flow | if a link's gradient falls below **G_LOW = 10⁻⁷**, a linear head-loss (and gradient) is used to keep A well-conditioned | published [E2] |
| Closed link | assigned a very high linear resistance **R_HIGH = 10⁸** (not removed, to avoid refactorising A) | published [E2] |
| Under-relaxation | optional; damped flow update q ← q − **α·Δq with α = 0.6**, active below **DAMPLIMIT** | published [E2] |

### Check valve handling

A check valve in EPANET is a **pipe property** ("the status parameter allows
pipes to implicitly contain … check (non-return) valves"; [E2] §3), not a
separate valve link. Its **status is switched** by a status check ([E2] ch. 12,
"Check Valves" pseudo-code):

```
if |hLoss| > Htol then
    if hLoss < -Htol then status is CLOSED
    if q < -Qtol     then status is CLOSED
    else                  status is OPEN
else
    if q < -Qtol then status is CLOSED
    else              status is unchanged
```
with **Htol = 0.0005 ft** and **Qtol = 0.0001 cfs**. A complementary set of
changes **re-opens** a closed check valve when its flow becomes positive.
Pumps close when their head gain exceeds the speed-adjusted shutoff head
(−h_L > ω²·h₀ + Htol), and re-open when that no longer holds.

**Status-check timing** ([E2] ch. 12): PRVs/PSVs every GGA iteration; **all
other links (pumps, check valves, FCVs) every CHECKFREQ iterations until
MAXCHECK iterations**, then once more at convergence. Defaults **CHECKFREQ = 2,
MAXCHECK = 10** ([E2] §8.2 and back-matter defaults).

### How it fails to converge (the known ways)

[E2] User Manual (the `MAXCHECK`/`DAMPLIMIT`/status notes, and "Troubleshooting"
in §8) names:

- **Status cycling:** "valves, pumps, or pipelines [that] keep switching their
  status from one trial to the next" — e.g. a pump's pressure limits set too
  close, or **a pump head curve that is too flat, causing it to keep shutting
  on and off**. EPANET then either terminates or continues **10 extra trials
  with all link statuses frozen**, and if that converges it issues a
  **"system possibly unstable"** warning.
- **"System Unbalanced"** warning if convergence is not achieved.
- **Ill-conditioning at low gradient** (why the G_LOW linearisation exists).
- **A closed check valve isolating part of the network** from any fixed-grade
  node makes the coefficient matrix ill-conditioned ([E2] "Closed Links").

These are the failure modes most relevant to two feeds: the losing feed's
check valve switches closed; if the two feeds' curves are similar, the status
can oscillate (one feed wins, then the other), which is exactly the
"too flat / limits too close" case.

### epanet-js as a test oracle

| Property | Value | Basis |
|---|---|---|
| Licence | **MIT** (both `epanet-js` and `@model-create/epanet-engine`) | published (github.com/epanet-js/epanet-js-toolkit; read 2026-10-17) |
| Engine | **OWA-EPANET 2.2** (MIT); the toolkit is a **full port of the 2.2 toolkit (all 122 functions)**; the app has since moved to **Toolkit 2.3.5** | published (same repo; epanetjs.com Feb-2026 progress report; read 2026-10-17) |
| Version | npm `epanet-js` **0.9.0** (published ~3 months before the read date; 37 versions) | published (npmjs.com/package/epanet-js; read 2026-10-17) |
| Check valves | yes — inherits EPANET's pipe-status check valve | published |
| Pumps | yes — constant- and variable-speed pump curves; three-point or multi-point | published (epanetjs.com pump library, Feb-2026 report) |

**Assessment (judgement, not a source):** because it is a genuine port of
EPANET's engine, epanet-js **can** serve as an oracle for "two pumps feeding
one node": model two pump links (or two sources) into a common junction and
read which check valve closes. It is an external dependency with a C/WASM
build, so it is an oracle for **tests**, not a runtime dependency for the
app's plain-TypeScript engine (which is the `MODEL.md` §9 architecture).

### Open questions

- The MIT licence is clear for `epanet-js`/OWA-EPANET; the **app's own public
  hosting licence** (PLAN §1) is a separate, still-open question and is not
  settled by this.

---

## R4. Aerial waterway friction loss

**Status: partial. Rating and pressure data are published; a manufacturer
waterway Δp–Q table was not found.**

### Published ratings and sizes

| Make / model | Waterway data | Basis |
|---|---|---|
| **NFPA 1901** (as restated by Hale Full Line Catalog 2018, p. 78) | **"A permanently connected aerial waterway is rated at 1000 GPM, if provided."** | published (read 2026-10-17) |
| Pierce 100′ Heavy-Duty steel ladder (piercemfg.com) | **Flow capacity 1,000 gpm**; ladder reach 100′ vertical | published (read 2026-10-17) |
| Pierce newer aerials (piercemfg.com/aerials) | **Flow capacity 1,500 gpm**; 10-yr aerial-waterway warranty | published (read 2026-10-17) |
| Rosenbauer **Viper** | **Waterway up to 1500 GPM** | published (Rosenbauer Viper brochure; read 2026-10-17) |
| Rosenbauer **Viper Tiller** | **Waterway 1250 GPM** | published (Rosenbauer/287fire Tiller sheet; read 2026-10-17) |
| Rosenbauer **Roadrunner** (51′/68′) | **1250 GPM** | published (rosenbauer.com; read 2026-10-17) |
| E-One spec sheet (2026) | aerial waterway listed as a **"4″ waterway discharge with electric valve"**; **"TFT Flex pinnable monitor with 1500 GPM nozzle and 2.5″ discharge (VUM)"** | published (e-one.com E-ONE spec sheets 2026; read 2026-10-17) |
| Magirus | **not found** — no Magirus aerial-waterway loss or diameter figure located on 2026-10-17 (searched in English; Magirus documents are largely German, not retrieved) | not found |

**NFPA 1901 / 1904 context:** the old NFPA 1904 waterway requirement (quoted in
the NIOSH FACE 2008-12 report) was **"1,000 GPM monitor, 1,000 GPM nozzle"**;
modern aerials are specified as a **"minimum 1000 gpm waterway system meeting
NFPA 1901"** (Florida Sheriffs procurement spec; read 2026-10-17). The owner's
PLT-11 make/model/rating is unknown.

### Loss versus flow, and extension

**Not found (manufacturer table).** No Pierce, E-One, Rosenbauer, Magirus or
Sutphen **waterway Δp–Q table** was located on 2026-10-17 (searched
manufacturer sites and aerial spec sheets). A fire-service forum thread
(forums.firehouse.com, "Aerial ladderpipe friction loss", 2008) gives
**anecdotal** operator figures — a factory test of a 61′ Pierce Sky-Boom
"79 psi at 1000 gpm at zero elevation", and pipe taper "three-section ladders
5″→4½″→4″; five-section mid-mount 5″→3½″" — but these are **not a
manufacturer's published chart** and are labelled as anecdote here.

### Training conventions (compare only)

| Source | Aerial-waterway allowance | Basis |
|---|---|---|
| Colorado DFPC pumper chart (Jan 2020), p. 1, [E15] | **Aerial waterway + 25 psi** (fixed) | convention (read 2026-10-15/17) |
| San Diego Fire hydraulics (2020/2022), IFSTA-based | treats the ladder system as an appliance loss ("LADDER SYSTEM LOSS" category) plus nozzle pressure + hose friction; the deck-gun example uses **AL = 15 psi** | convention (read 2026-10-17) |
| Firehouse forum, IFSTA method (second-hand) | appliances fixed: "10 psi for a wye, 25 psi for a manifold" | convention routine (read 2026-10-17) |

So the **training figure is a flat 25 psi** (Colorado) while IFSTA is quoted
through training material as another flat appliance figure; **neither varies
with flow or extension**, and neither is a measurement.

### Open questions

- The waterway's **loss curve** and whether it changes with **extension** are
  unpublished in the sources found; PLT-11's actual waterway size and rated
  flow are needed.
- IFSTA's own aerial figure was not directly inspected (the handbook was not
  available); the "25 psi" is the Colorado chart and IFSTA's *method* as
  quoted by third parties.

---

## R5. Elevation in waterway charts

**Status: essentially resolved. The manufacturer charts found are tested at
zero elevation and list loss only; elevation is separate.**

### Findings

- The aerial waterway is **flow-tested at zero elevation**: the fire-service
  anecdote above reports a factory waterway test result explicitly **"at zero
  elevation"** (1000 gpm), and the mfr charts/pressure-loss graphs are
  presented as **device loss vs flow** with no height axis (Elkhart monitor
  charts [E5]; TFT monitor charts, R6). No manufacturer chart was found that
  folds a fixed tip height into the loss.
- Every **training** method adds elevation **separately** from the waterway
  allowance: Colorado "Elevation ± 5 for every 10′ gain or loss" is a distinct
  line from "Aerial waterway + 25 psi" ([E15] p. 1); San Diego's
  `PP = NP + TFL` with elevation handled on its own; CGBVP treats elevation
  (p. 44) apart from appliances (p. 45).
- **Tip heights:** no manufacturer published a table of "the tip height these
  figures assume" — because the figures assume **zero**. The elevation that
  matters is the **actual** tip height the operator is working at, which is
  scenario data.

### Consequence for the model

Counting a **fixed** elevation inside a waterway loss **and** the scenario's
own tip height would double-count height. The published shape is: **loss chart
= zero-elevation device loss; height = separate `EP = k·h`** (`MODEL.md`
§3.2). **Status: derived/convention**, consistent with the sources.

### Open questions

- None blocking, provided the waterway loss (whenever sourced) is taken as a
  zero-elevation device loss and height stays separate.

---

## R6. Monitor at the tip

**Status: good for TFT Monsoon and Elkhart Sidewinder; partial for TFT
Tornado; not found for Akron Stream Master.**

All Elkhart figures below are printed as **Total Static Pressure Drop** =
velocity-pressure change + friction loss, and Elkhart says to design with the
static drop ([E5] method note; repeated on its 2026-10-17 charts).

| Monitor | Pressure loss vs flow | Tips / nozzles | Ma× | Basis |
|---|---|---|---|---|
| **TFT Monsoon**, 3.5″ | **15 psi @ 2000 gpm; 4 psi @ 1000 gpm**; stream straightener adds 13 psi @ 2000 gpm (3.5″) | Nozzles A/B/C/D = **500/1000/1500/2000 gpm at 100 psi**, K = 50/100/150/200; Masterstream 2000 | 200 psi, 2000 gpm | published (TFT *Monsoon* manual LIY-200 Rev19, Nov 2020; Rev09 2009 fig 6.3; read 2026-10-17) |
| **TFT Monsoon**, 2.5″ | lower-loss version, up to 1250 gpm (product pages say **as low as 6 psi at 1250 gpm**) | as above | 200 psi | published (tft.com/series/monsoon; read 2026-10-17) |
| **TFT Tornado** | **not found** exact Δp–Q curve; rated **100–500 gpm**, 370° rotation, manual/RC | multiple nozzle options | — | partial: published rating (TFT industrial overview LOT-027; read 2026-10-17); curve not found |
| **Elkhart Sidewinder** (8494-01, 2″ in / 1.5″ out) | **26 psi @ 500 gpm; 13 psi @ 350 gpm; 3.9 psi @ 200 gpm** | recommended smooth-bore/fog tips (e.g. 188-XD, 6000-200E) | 200 psi; 500 gpm | published (elkhartsales.com Sidewinder spec; read 2026-10-17) |
| **Elkhart Copperhead 8593-IV** (4″ in / 2.5″ out) | chart gives **Total Static Pressure Drop and Friction Loss** curves, 0–1400 gpm (values not tabulated in text) | — | — | published chart (elkhartbrass.com; read 2026-10-17) |
| **Akron Stream Master** | **not found** — Akron's monitor loss data is behind a login (searched akronbrass.com, 2026-10-17) | — | — | not found |

**Tip carried:** monitor tips are master-stream sizes; TFT's Monsoon carries
smooth-bore stacked tips and the Masterstream 2000 (300–2000 gpm range); the
Elkhart Sidewinder takes mid-range tips. The **exact tip on any given
apparatus** is required data.

**Reading rule (already in `MODEL.md` §9, confirmed here):** use Elkhart's
**Total Static Pressure Drop**, not friction loss alone, for the same device;
do not add the two curves. [E5] and the 2026-10-17 monitor charts both state
this. [E2]'s swing-check K is friction loss only and is a different quantity.

### Open questions

- Akron Stream Master loss curve (login), TFT Tornado curve.
- PLT-11's monitor make and tip (on the "ask the owner" list).

---

## R7. How the CGBVP 2019 manual teaches it

**Status: not found. The manual itself was not accessible; only the repo's
review summary exists.**

### What I searched

- Web searches (Spanish and English) for the CGBVP *Curso de Hidráulica
  aplicada a la lucha contra incendios* (4th ed., Aug 2019), and for
  "siamesa", "líneas gemelas", "escalera", "alimentación" + CGBVP — no copy of
  the manual itself was located on 2026-10-17.
- The repo holds only `docs/manual-summaries/hydraulics/cgbvp-hydraulics-review.md`,
  which is a **review of** the manual, not the manual.

### What the review does and does not say about this topic

The review's inventory of the manual's appliance rules (from pp. 44–45) is:

| Rule | Value | Page | Basis |
|---|---|---|---|
| valves, **wyes/bifurcations and reducers** | **5 psi** | p. 45 | convention (review summary) |
| monitor nozzle | 10–25 psi | p. 45 | convention (review summary) |
| **siamese** | **≈ 10 psi** | p. 45 | convention (review summary) |
| foam eductor | ≈ 40 psi | p. 45 | convention (review summary) |
| elevation | 1.5 psi/m; 1 m = 1.5 psi; one floor = 5 psi | p. 44 | convention (review summary) |

- The review states the manual is a **single-dominant-path worksheet**
  (`PB = PP + PF ± PE + PS`, p. 31), **not a network solver**, and that it
  "does not intrinsically solve … simultaneous outlets whose flows depend on
  pressure, feedback between supply and demand."
- **No aerial-waterway rule** and **no two-lines-into-one hydraulic rule**
  appear in the review's summary. The manual's **siamese** figure is a **flat
  ~10 psi** convention, not an equal-split or solved rule; its relay section
  (pp. 78–82) discusses parallel lines only as a way to **reduce friction
  per line** ("two equal parallel 2½″ lines … four times farther"), and its
  worked figures there are internally inconsistent (review §§14–15).

### What this means (no recommendation)

The CGBVP manual, as reviewed, teaches **fixed appliance penalties** (a
siamese ≈ 10 psi) and **worker arithmetic**, not a coupled network solution.
The manual's flat siamese figure sits beside the same document's temporary
lowering of parallel-line friction — but the review records no CGBVP rule for
**feeding a waterway from two sources where the stronger closes the weaker**.
**The manual itself must be inspected** (page numbers and exact wording) before
a `cgbvp-2019` two-feed rule can be claimed.

### Open questions

- Obtain the CGBVP 2019 manual and read pp. 44–46 (appliances), pp. 78–82
  (relay/parallel), and any aerial/ladder section, for the exact text.

---

## R9. Training allowances inside a network

**Status: reported, no recommendation (this feeds a design decision).**

### What was found

| Method / tool | Allowance form | Solver behaviour | Basis |
|---|---|---|---|
| Colorado DFPC chart, [E15] | **stepped**: 0 psi ≤ 350 gpm, **10 psi > 350 gpm**; 25 psi master/aerial/standpipe | a **step in Q**; a monotone step does not guarantee a root (already handled as an **unsatisfied balance** in `MODEL.md` §2, 2026-10-16) | convention |
| San Diego Fire hydraulics (IFSTA-based) | **fixed** per appliance; siamese worked by **averaging the two supply-line lengths** and **splitting flow equally** for equal-length lines | hand arithmetic; no network solve; split **assumed**, not computed | convention |
| CGBVP (review) | **fixed** 5/10/25/40 psi | worksheet sum | convention |
| Public Pump Forge calculator ([E14], in `MODEL.md`) | stepped, `gpm >= 350` gate | target-flow calculator, not a network solve | comparison |
| **EPANET** ([E2]) | minor loss K or a **head-loss curve (GPV)** | **continuous** head-loss relations; Newton/GGA needs smooth, once-differentiable functions (the reason its low-flow linearisation exists) | published |

### Reported finding

- Every **published training method found** treats appliances as **fixed or
  stepped** penalties and solves them by one-pass arithmetic, **not** inside a
  coupled network. Where they handle two lines (San Diego), they **assume an
  equal split**.
- Every **published network solver found** (EPANET and, by extension,
  GGA-family tools) uses **continuous, differentiable** head-loss curves; none
  of the sources shows a network solver built on a **stepped** allowance.
- **Not found:** any published method or tool that solves a **network with
  stepped/fixed allowances** as a coupled system. Searched: EPANET 2.2 manual
  ([E2]), Todini & Pilati (1988) / Todini & Rossman (2013), Colorado chart,
  San Diego / NFA training material, Pump Forge public page.

**This is a finding only.** It is relevant to the `MODEL.md` §2 decision
(forward solve with a stepped `us-training` allowance vs a continuous curve),
but no direction is recommended here.

---

## R10. A test oracle

**Status: partial. Training worked examples exist but assume equal splits;
EPANET's published example networks can serve as a numeric oracle for
two-source coupling.**

### What was found

| Candidate | What it provides | Unequal flow / one feed shuts? | Basis |
|---|---|---|---|
| **San Diego Fire** hydraulics study guide (2020 rev 7-22) | **published worked examples**: siamese equal-length (`PP = 50 + 23 = 73 psi`, two 200′ 2½″ lines into 100′ 2½″); siamese unequal-length (250′ + 350′ averaged to 300′, flow split by number of lines) | **No** — the method **assumes equal split**; flows come out equal by construction, not by solving | published training convention (read 2026-10-17) |
| Colorado DFPC chart, [E15] | siamese **friction-loss table** for two equal 2½″ lines (200–1000 gpm) | table is **per total flow**, not a solved split | convention |
| **EPANET example networks** ([E2] / USEPA/EPANET2.2 repo) | the standard published nets — **net1** (pump, tank, reservoir), **net2**, **net3** (multi-source, pumps and tanks) | **net2/net3 contain multiple fixed-grade nodes and pumps**, so they are genuine coupled multi-source cases; they exercise which pump/check closes | published (read 2026-10-17) |
| `MODEL.md` §9 / `series.test.mjs` | the repo's own hand-arithmetic checks | single path / tree | — |

### Reported finding

- No **published worked example** was found in which **two pumps or two lines
  feeding one appliance produce unequal flows, or one feed shuts**, presented
  with numbers. The training examples found (San Diego, Colorado) **assume an
  equal or length-averaged split** and would not exercise the check-valve
  closing. Searched: IFSTA-based training material (San Diego, Colorado, NFA
  references), EPANET documentation, general web (2026-10-17).
- The best **numeric oracle** available is **EPANET's own example networks**
  plus the check-valve/pump status pseudo-code in [E2] ch. 12: build two pumps
  onto one junction, and use EPANET (or the MIT `epanet-js` port, R8) to
  confirm which check closes and the resulting split. That is a
  **solver-vs-solver** oracle, not a hand-arithmetic one.

### Open questions

- A hand-checkable **textbook example of unequal two-feed split** (the ideal
  oracle) was not found; the IFSTA handbook was not available to inspect.

---

## R11 (low priority). Limits of the steady-state model

**Status: general water-hammer references found; fire-hose-specific wave speed
and line-charging times not found.**

### What was found (for the history-chart note)

| Quantity | Value | Source | Basis |
|---|---|---|---|
| Water-hammer surge formula | **P = 0.07·(V·L/t)** — P psi, V ft/s, L ft, t s | QRFS, "Water Hammer…" (2019-03-12); also Water World / standard texts | published explainer (read 2026-10-17) |
| Effect size | shock waves "up to **7× normal operating pressure**"; can exceed **700–1,000+ psi** | allfirefighter.com glossary (2026-01-24) | published (read 2026-10-17) |
| Wave celerity (rigid-pipe idealisation) | a = √((K/ρ)/(1 + K·D/(E·t))) — ~**1,409 m/s** in a steel-like example | MachineCalcs water-hammer calculator (method page); standard texts | published (read 2026-10-17) |
| Propagation speed | "about as fast as the speed of sound" | QRFS | published |
| Design velocity cap | water velocities limited to ~**5 ft/s**, never exceed ~**10 ft/s** (some texts) | Water World, "Hydrodynamic Design Part 11" (2013-12-06) | published |
| NFPA closure note | listed indicating valves shall not close in less than **5 s** from fully open | QRFS (quoting a standard) | published |

### Not found

- A **fire-hose-specific wave speed** (hose is far more elastic than steel, so
  its celerity is much lower than the rigid-pipe 1,409 m/s; the calculator
  page itself warns "plastic pipe, hose, lining … can change the real wave
  speed") — no published hose celerity for 1½″–3″ fire hose was found.
- **Line-charging times** for 1½″–3″ hose: not found in the sources searched
  (general web, NIST TN 2075 fire-hose flow work, water-hammer explainers,
  2026-10-17). The NIST smart-fire-fighting hose-flow study (TN 2075) is about
  flow sensing, not charging time.

### Note for the history chart

The general sources support a **qualitative** statement only: transients in a
charged fire hose are a **wave phenomenon** at roughly sonic speed in water,
hose elasticity reduces it, and the steady-state model does not represent it.
Sourcing a **quantitative** hose wave speed or charging-time figure needs a
dedicated transient/hose reference (e.g. a fire-hose water-hammer study), which
was not located.

---

## Summary table

`blocks` = what part of the two-feed showcase the item holds up.

| Item | Status | Best source | Blocks |
|---|---|---|---|
| **R1** Check valve (clapper) law | **partial** — generic swing-check data + [E12] Humat clapper points; no fire-siamese Δp–Q curve | Cla-Val 501A datasheet (cracking ≈ 0.5 psi, Cv); Tyco F52 (2.9 psi @ 250 gpm); [E12] Humat clapper; [E5] static-vs-friction note | the check-valve element's loss/cracking law; whether the stronger feed closes the weaker (cracking) |
| **R2** Pump curve near shutoff | **partial** — rating points published; near-shutoff shape from other Hale pumps + NFPA 20 band; PSP-1250 curve not found | Darley PSP/PSM/LDM spec sheets (1250@150/875@200/625@250); Hale wildland flow ranges; NFPA 20 churn 101–140 % (HI) | the pump's available pressure at low flow; the churn/dead-head warning |
| **R3** Backflow through the pump | **published rule** — NFPA 1901 §XX.6.2; plumbing diagram not found | NFPA 1901 committee report §XX.6.2 (check valves in both supply lines); Darley discharge-check feature | whether the pump is protected and the pump-side check's role when the outside feed wins |
| **R8** Solver with check valves | **well documented** | EPANET 2.2 User Manual ch. 12 (GGA, CV pseudo-code, failure modes); Todini & Pilati 1988; epanet-js MIT | the network solve itself: CV status switching, pump curves, convergence, oracle |
| **R4** Aerial waterway loss | **partial** — ratings published; Δp–Q table not found | NFPA 1901 1000 gpm (via Hale catalog p. 78); Pierce/Rosenbauer/E-One specs; [E15] 25 psi | the waterway element's flow-dependent loss (vs the flat training 25 psi) |
| **R5** Elevation in waterway charts | **resolved** — charts are zero-elevation; elevation is separate | mfr charts + test-at-zero-elevation; Colorado/[E15]; `MODEL.md` §3.2 | avoiding double-counting height |
| **R6** Monitor at the tip | **good** (Monsoon, Sidewinder); partial (Tornado, Akron) | TFT Monsoon LIY-200 (15 psi @ 2000 gpm); Elkhart Sidewinder (26 psi @ 500 gpm); [E5] read as TSPD | the monitor element's loss and the tip's pressure requirement |
| **R7** CGBVP 2019 manual | **not found** — manual inaccessible; only the repo review | `cgbvp-hydraulics-review.md` (siamese ≈ 10 psi p. 45) | any `cgbvp-2019` two-feed/siamese rule (needs the manual) |
| **R9** Training allowances in a network | **reported** (no recommendation) | Colorado [E15] stepped rule; San Diego assumes equal split; EPANET continuous | the design decision on stepped vs continuous allowances |
| **R10** A test oracle | **partial** — training examples assume equal split; EPANET nets as oracle | San Diego siamese examples; EPANET example networks net1/2/3 | validating the two-feed split (solver-vs-solver oracle available) |
| **R11** Steady-state limits | **partial** — general water-hammer refs; no hose-specific figures | QRFS (P = 0.07·V·L/t; ~sonic); Water World (velocity caps) | the history chart's "not a transient model" note |

### Cross-cutting gaps (all "not found", with where searched)

1. A fire-siamese/FDC/aerial-inlet **clapper Δp–Q curve** from Elkhart, Akron or
   TFT (manufacturer catalogs and product pages, 2026-10-17). Only [E12]'s
   Humat clapper measurement exists.
2. A **continuous head–flow curve for the Darley PSP-1250** (Darley catalog and
   spec sheets). The pump plate would settle it.
3. An explicit **pump→aerial-waterway plumbing diagram** (Pierce, E-One,
   Rosenbauer, Spartan, Sutherland/KME; PDFs are scanned or omit it).
4. A **manufacturer aerial-waterway Δp–Q table** and whether it changes with
   extension (Pierce, E-One, Rosenbauer, Magirus, Sutphen).
5. **Akron Stream Master** and **TFT Tornado** monitor loss curves (Akron behind
   a login).
6. The **CGBVP 2019 manual** itself (pp. 44–46, 78–82, aerial section).
7. A **hand-checkable textbook example** of two unequal feeds into one
   appliance with one feed shutting (IFSTA handbook not inspected).
8. **Fire-hose** wave speed and **line-charging times** for 1½″–3″ hose.

### Ask the owner (not answerable from documents)

- PLT-11's make, model, year, and pump rating plate.
- PLT-11's plumbing from pump to waterway, and its external inlet's location
  and size.
- The tips on PLT-11's monitor.
- The deck gun on the M11 pumpers.
