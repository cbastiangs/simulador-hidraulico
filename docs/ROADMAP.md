# Roadmap: from engine to teaching simulator

> 2026-10-11. Reorganises the project around what the simulator is **for**:
> showing firefighters at the station how water behaves. `PLAN-simulador.md`
> stays the authority on the model, constants and sources (§2–§4, §6). Its
> sequencing (§9) and its fd-app plumbing (§1, §5, §8) are superseded here
> wherever the two disagree.

## 1. What it is for

Seven things the station should be able to *see*, not just calculate:

| # | Lesson | The one idea to leave the room with |
|---|---|---|
| L1 | Flow vs pressure | Pressure is what you pay; flow is what you get. The pump sets a pressure, and the line decides the flow. |
| L2 | Friction loss | Friction grows with the **square** of flow and linearly with length. Doubling flow costs four times the friction. |
| L3 | Elevation | Each metre up costs about 1.4 psi (1.5 by the CGBVP rule), whether or not water is flowing. |
| L4 | Diameter and couplings | A slightly bigger hose cuts friction by a lot (roughly d⁵). Couplings and appliances are restrictions too. |
| L5 | Smooth bore vs fog | Different pressure needs, reaction per gpm, reach, and how each one fails when the line is under-pumped or kinked. |
| L6 | Pump capacity | A pump is not an unlimited pressure source. More flow means less pressure is available, and a pump only delivers its full rated flow at its rated pressure. |
| L7 | GPM puts the fire out | Water absorbs heat per litre, not per psi. Pressure only matters for getting the flow there and shaping it into a stream. |

Every feature should serve one of these. If it serves none, it waits.

## 2. Assessment of what exists

### Keep: these choices are right for teaching

- **Flow is solved, never typed in.** This is L1 itself: you turn the pump
  up and watch the gpm follow. A screen where gpm is an input can show
  impossible states, and the old fd-app lab did exactly that (PLAN §2).
- **Element laws solved together** (PDP = NP + FL + EP). That sum is the
  "pressure budget", the main visual of L1–L4 (§3).
- **Methods swap constants, never laws** (`cgbvp-2019` vs `physical`). The
  station can be shown the manual's answer and the physical one side by
  side, with the difference explained (`compatibility-vs-physics.md`).
- **Pure TypeScript engine, tested against published tables.** This makes it
  cheap to trust and to reuse, and it is the part that would be hardest to
  redo.
- **US units inside, conversion at the edge.** Fine as it is. Nothing a
  learner sees depends on it.

### Change

| What | Why | Proposal |
|---|---|---|
| The pump is an ideal pressure source | It always delivers the requested PDP at any flow, so L6 cannot be shown at all | Add a pump element: governor set-point bounded by a capacity envelope (§5.2) |
| The only nozzle is a generic fixed orifice | L5 needs tip size, reaction, an automatic nozzle and preset types | Add nozzle kinds (§5.3) |
| `line.ts` hard-codes one topology with a closed form | Every new element (pump curve, automatic nozzle, coupling) breaks the closed form | Elements expose Δp(Q), and a series solver finds Q by bisection. The closed form stays as the test oracle (§5.1) |
| The next milestone is the wye (PLAN §9) | A wye serves none of L1–L7 by itself, while nozzles and the pump serve three | Wye moves after nozzles and the pump. It comes back as the way to show L6 ("open a second line") |
| No screen in this repo; the V0 UI stayed in fd-app behind a login | A station demo should open on a projector or tablet with no account and no network | Standalone static app in this repo (§6) |
| PLAN §1, §5 and §8 describe fd-app (Next.js, Supabase, `BACKLOG.md`, ESLint rules, smoke script) | Those files are not here. The import rule in AGENTS.md was enforced by fd-app's ESLint, so it is now unenforced | Import rule is now a test (`tests/boundaries.test.mjs`). Station data and saving wait until there is a host (§7, M6) |
| PLAN says Node 24; this environment runs 22.22 | Both strip TypeScript types natively | `engines: node >=22.18` in `package.json` |

### Gaps no current document covers

- **L7 (extinguishment)** has no model, no sources and no design yet (§5.5).
- **Visual vocabulary.** Nothing yet says how flow and pressure must look
  different on screen. For L1 that is the whole point (§3).

## 3. The organising idea: lessons, not a sandbox

A blank canvas where anyone can build any layout is a tool for people who
already understand hydraulics. For teaching, each lesson opens a **prepared
scenario** with one or two controls in focus. A "free" mode can come later,
built from the same pieces.

Two charts carry almost every lesson, so they are worth building well once:

1. **Pressure budget.** A stacked bar: pump pressure = nozzle + friction +
   elevation (+ appliances). Drag any control and the slices trade places.
   Used in L1–L4.
2. **Pump curve × system curve.** The line's demand, P = EP + (r_hose +
   r_nozzle)·Q², drawn against what the pump can give, P(Q). The operating
   point is where they cross. One picture explains:
   - flow vs pressure (moving along the curves);
   - friction and diameter (how steep the system curve is);
   - elevation (the system curve shifts up);
   - nozzle type (fixed orifice vs automatic changes the system curve's shape);
   - pump capacity (the pump curve bends down);
   - a second line (the combined system curve flattens, and the operating
     point slides down the pump curve).

   It is the most useful visual in the whole project. Used in L1, L5 and L6.

Rules for the drawing:

- **Flow and pressure never share an encoding.** Pressure is a gauge (needle,
  psi). Flow is moving water (particle density and speed along the hose,
  gpm). If a hose is drawn thicker because of pressure, people will read
  pressure as quantity, which is the misconception L1 is meant to remove.
- **A/B comparison** (two lines side by side, same pump) is the default
  layout for L4 and L5. Most of these lessons are comparisons.
- **Side (profile) view** for L3, as PLAN §7 already proposes: drag the
  nozzle up and watch EP and the pump pressure move.

## 4. Lessons in detail

Status: ✅ the engine supports it today · 🟡 partial · ⬜ not started.

### L1 Flow vs pressure ✅ engine, ⬜ screen
- Scenario: pump → 60 m of 1-1/2" → fog nozzle 100 gpm @ 100 psi.
- Control: pump pressure slider. Readouts: nozzle gauge and gpm.
- Show: Q ∝ √(PDP − EP). On level ground, doubling pump pressure gives about
  1.41× the flow, not twice. The "required pressure" button lands exactly on the rated
  point (`requiredPumpPressurePsi`).
- Engine: `solveAttackLine` as it stands.

### L2 Friction loss ✅ engine, ⬜ screen
- Controls: hose length (paños of 15/20 m), flow target.
- Show: FL ∝ Q²·L with the pressure-budget bar, plus a chart of FL against
  flow for the chosen hose. The same nozzle at the end of 1 vs 4 paños.

### L3 Elevation ✅ engine, ⬜ screen
- Profile view, drag the nozzle up floors. Toggle CGBVP 1.5 psi/m vs
  hydrostatic 1.42 psi/m and show the difference (VC-04).
- Show the closed-nozzle case too: elevation costs pressure even when nothing
  flows, and friction does not.

### L4 Diameter and couplings 🟡 engine (C table done), ⬜ screen
- A/B: the same nozzle on 1-1/2", 1-3/4" and 2-1/2".
- The published C values follow d⁵ closely, and that is the lesson:

  | From → to | C ratio | (d₂/d₁)⁵ |
  |---|---|---|
  | 1-1/2" → 2-1/2" | 12.0 | 12.9 |
  | 2-1/2" → 3" | 2.5 | 2.5 |
  | 3" → 4" | 4.0 | 4.2 |
  | 1-1/2" → 1-3/4" | 1.55 | 2.16 |

  The last row is the exception worth explaining: 1-3/4" hose usually has
  1-1/2" couplings and its real inside diameter varies, so its C (15.5) is
  empirical. That is why C stays a published table and is not derived from
  diameter.
- **Couplings, already in the data:** 3" hose with 2-1/2" couplings has
  C = 0.8, and with 3" couplings C = 0.677. The smaller couplings add about
  18 % more friction to the whole lay. Today that is a choice between two
  hose rows. A per-coupling minor loss (K·v²/2g at the coupling's bore)
  would let it be drawn as a restriction at each joint. **Needs a source**
  for K before it ships.
- Optional "why" panel: Darcy–Weisbach with a fixed friction factor gives
  the d⁵ scaling. It is for explanation only. The C table remains the law.

### L5 Smooth bore vs fog ⬜
What the engine can compute (all formulas already cited in the review, §8
and VC-05/06):

| Property | Smooth bore | Fog, fixed gallonage | Automatic fog |
|---|---|---|---|
| Flow law | Freeman: Q = 29.7·d²·√NP | Q = Qr·√(NP/NPr) | NP held near its set pressure over a flow range |
| Typical NP | 50 psi handline, 80 master | 100 psi (also 75 or 50 psi low-pressure models) | ~100 psi |
| Reaction | 1.57·d²·NP | 0.0505·Q·√NP | same as fog |
| Example | 15/16" @ 50 psi: 185 gpm, 69 lbf | 185 gpm @ 100 psi: 93 lbf | — |
| Under-pumped or kinked | Pressure and flow both drop, and the crew can see the stream weaken | Same | **Pressure looks right while flow drops.** The stream still looks good, but the gpm isn't there |

The last row is the most important thing this lesson teaches, and it links
straight to L7.

Shown qualitatively as explanation cards, not simulated: debris tolerance,
air entrainment and ventilation effects, steam production, protective
pattern, penetration. Reach can be a ballistic sketch only with the
manual's own caveat (review §14). Real reach needs manufacturer data.

### L6 Pump capacity ⬜
- Pump curve × system curve chart, with a throttle/governor set-point.
- Capacity envelope through the NFPA rating points: 100 % flow at 150 psi,
  70 % at 200, 50 % at 250 (review §11, [E10]). These are test points
  reached at different engine speeds. They mark the pump's limit, not a
  single curve.
- Hydraulic horsepower = Q·P / 1714 (gpm, psi). For a 1000 gpm pump:
  1000 @ 150 = 87.5 hp, 700 @ 200 = 82 hp, 500 @ 250 = 73 hp. "Capacity" is
  roughly a power budget split between flow and pressure.
- Show it: open a second line (needs the wye) or lengthen the lay until the
  set-point can't be held, and the operating point slides down the
  envelope.
- Later: supply limits (tank-to-pump line, hydrant residual), which are the
  other way a pump runs out.

### L7 GPM extinguishes ⬜ (separate module, sources first)
- Physics: heating water from 20 °C to 100 °C and boiling it absorbs about
  2.6 MJ/kg. 1 gpm ≈ 0.063 kg/s, so full vaporisation would absorb about
  **160 kW per gpm**. Only part of the water ever vaporises on a real fire.
  That fraction (application efficiency) is the one parameter that needs a
  traceable source before shipping (candidates: Särdqvist, *Water and Other
  Extinguishing Agents*, 2002; Grimwood's critical flow-rate work).
- Show it: a fire with a growing heat release rate (a curve, not a CFD
  model), and the delivered gpm × absorption × efficiency as a line against
  it. The fire is controlled when that line passes the fire's output.
  - Same nozzle pressure, different flow: 100 psi at 95 gpm (under-pumped
    automatic nozzle, L5) loses, and 100 psi at 150 gpm wins.
  - Same flow, different pressure: the outcome doesn't change, apart from
    reach and drop size.
- Fire-ground rules of thumb as a second view: NFA needed-fire-flow
  (area/3 × % involvement) and the Iowa formula (volume/100).
- **Guardrail:** this is a teaching model, labelled as one, and it lives
  outside `src/hydraulics/` (e.g. `src/extinguishment/`) so it never
  touches the hydraulic laws. The honest message is "flow sets the cooling
  capacity; pressure moves the flow and shapes the stream". Firefighters
  will rightly reject a version that says pressure doesn't matter.

## 5. Engine changes, in order

### 5.1 Element laws + series solver (enables everything below)

```ts
// Each element reports its pressure change at a given flow.
type Element = { dropPsi(flowGpm: number): number };      // hose, coupling, appliance, elevation
type Terminal = { dropPsi(flowGpm: number): number };     // nozzles (monotone in Q)
type Source = { pressurePsi(flowGpm: number): number };   // pump: set-point capped by envelope
// solveSeries(source, elements, terminal, method) finds Q where
// source.pressurePsi(Q) = Σ element drops + terminal drop.
```

Every law is monotone in Q, so bisection always converges and needs no
derivatives. `solveAttackLine` keeps its signature and becomes a thin
wrapper. Its closed form is the oracle in tests (EPANET stays the oracle for
networks later, PLAN §6).

### 5.2 Pump
`{ setPointPsi, envelope: ratingPoints }`. Delivered pressure =
min(set-point, envelope(Q)). Result gains `pumpLimited: boolean` and
hydraulic hp.

### 5.3 Nozzles
`smoothBore { tipDiameterIn }`, `fixedFog { ratedFlowGpm, ratedPressurePsi }`
(today's nozzle), `automaticFog { setPressurePsi, minGpm, maxGpm }`, and a
`reactionLbf(nozzle, result)` function. Presets for the station's real
nozzles once they are known (PLAN §4).

### 5.4 Couplings and appliances
Fixed losses for `cgbvp-2019` (5/10/25/40 psi, manual p. 45). A K-based or
manufacturer curve for `physical` once a source is chosen. The method gains
an `applianceLossPsi` table, and laws stay the same, as PLAN requires.

### 5.5 Wye / tree solve
As PLAN §9 already designs it, but after 5.2, because its teaching value is
L6.

### 5.6 Extinguishment model
A separate folder, its own sources, its own tests.

## 6. Repo layout and stack

```
packages/hydraulics/        ← today's src/hydraulics (the "fire-calc" seed)
  src/units.ts  sources.ts  hoses.ts  methods.ts
  src/elements/ hose.ts nozzle.ts pump.ts appliance.ts
  src/solve/    series.ts  (tree.ts later)
  tests/
packages/extinguishment/    ← L7, never imported by hydraulics
apps/simulador/             ← the station app
  src/lessons/L1-flow-pressure/ …   one folder per lesson: scenario + copy + layout
  src/charts/  PressureBudget, PumpSystemCurve
  src/drawing/ LineProfile, Gauge, FlowParticles
docs/
```

- **pnpm workspace**, created when the app lands (one PR: move + package
  manifests). fd-app can then depend on `packages/hydraulics` and the
  "Toolkit" question in PLAN §1 becomes a deployment choice, not a
  restructure.
- **App:** Vite + React + TypeScript, built as static files and installable
  offline (PWA). It works on the station's projector, tablets and phones
  with no login and no network. Host it on GitHub Pages or any static
  host. React because the V0 screen and the team's experience are both
  React. Mantine can come along if the V0 components are ported. Charts are
  hand-built SVG: two chart types don't need a chart library, and they
  need the drag interaction.
- **Language:** code and docs in English (as now), UI in Spanish, with the
  CGBVP terms (pitón, paño, bifurca, desnivel).
- **Tests:** engine tests stay as they are. Each lesson gets a "story" test:
  the scenario solves to the numbers its text claims (e.g. L5 says 185 gpm
  at 50 psi, and a test checks that).

## 7. Milestones

| | Delivers | Lessons |
|---|---|---|
| **M0** (this change) | This roadmap, import-boundary test, Node engine pin | — |
| **M1** | Workspace + app shell; pressure budget; profile view; port or rebuild the V0 screen | L1, L2, L3 |
| **M2** | Element laws + series solver (5.1); nozzle kinds and reaction (5.3); A/B layout | L4, L5 |
| **M3** | Pump envelope (5.2); pump × system curve chart | L6 (single line), L1 revisited |
| **M4** | Wye + appliance losses (5.4, 5.5) | L6 (two lines) |
| **M5** | Extinguishment model with its sources | L7 |
| Later | Station data (M11-1, M11-5 maniobras), saved scenarios, relay, drafting/NPSH, free-build mode | — |

## 8. Decisions for the owner

1. **Standalone static app** (recommended) or a route inside fd-app? This
   decides where M1 lands. The licence question (PLAN §1) becomes real
   when the app is hosted publicly. A private repo with an unlisted static
   URL can postpone it.
2. **Who drives it:** an instructor on a projector, or firefighters on their
   own phones? This sets layout density and whether lessons need guided
   steps.
3. **Default method on screen:** `cgbvp-2019` (PLAN's current choice, matches
   exams) or `physical` with CGBVP shown beside it.
4. **Station data to collect** (most useful first): the nozzles actually
   carried (type, tip or gallonage, rated pressure); pump rating of M11-1
   and M11-5; the station's hose sizes and couplings. PLAN §4 has the full
   list. These make L5 and L6 about *their* equipment.
5. **L7 sources:** who at the station or CGBVP can confirm which
   extinguishment rule of thumb is taught (NFA, Iowa, critical flow rate)?
