# Roadmap

> 2026-10-14. Sets what the simulator is, how it is built, and the order of
> work. `MODEL.md` is the authority on the hydraulic model, constants and
> sources; `PLAN-simulador.md` stays the historical record (its §2–§4, §6
> are now `MODEL.md`). Its sequencing (§9) and fd-app plumbing (§1, §5, §8)
> are superseded here wherever the two disagree.

## 1. What it is

**A playground for fireground lays.** You pick a truck, lay hose from its
outlets, add couplings, wyes and nozzles, set heights, open and close
things, and watch pressure and flow respond. It is a tool and a demo, not a
game: a simplified but physically honest overview of a maneuver, never an
immersive scene.

- **Who:** firefighters and instructors at the station; maintained by the
  owner with AI help.
- **Where:** any browser, from a projector to an older phone. Static files,
  works offline, no login. Can be embedded in fd-app (iframe or web
  component) without sharing its stack.
- **Later, same app:** an aerial (ladder/platform) module (§8).

## 2. What it must make easy to show

These are the playground's acceptance tests, not a lesson list. Each must be
demonstrable in a few taps from a preset.

| Idea | How the playground shows it |
|---|---|
| Flow vs pressure | Turn up the pump: the gauges rise, the particles speed up, and gpm rises by √, not linearly. |
| Friction loss | Add paños or raise flow: the pressure budget's friction slice grows (∝ Q², ∝ L). |
| Elevation | Drag the nozzle up in the side view: elevation loss appears even with the nozzle closed. |
| Diameter and couplings | Hoses are drawn to diameter. Swap 1-1/2" for 2-1/2" and friction falls ~12× (published C, ≈ d⁵). 3" with 2-1/2" couplings: +18 % friction. |
| Smooth bore vs fog | A/B compare: flow law, nozzle pressure, reaction per gpm. An under-pumped automatic nozzle shows a good pressure while flowing too little. |
| Selectable nozzle | A rating is a point, not a state: turn the ring down at a fixed pump and the nozzle pressure rises while the flow falls (MODEL §3.5). Pressure, flow and speed are three different things (§3.13): the 30 gpm jet is faster and thinner. |
| Pump capacity | Open a second outlet: the operating point slides down the pump's capacity envelope and every line feels it. |
| GPM extinguishes | An optional view: delivered gpm × heat absorbed per gpm against a fire's heat release (§7.6). |

## 3. What exists and what changes

**Keep:**

- **Flow is solved, never typed in** (PLAN §2; `MODEL.md` §1–§2). The solver
  returns the **delivered** flow; a **target** flow used for planning rides
  the same pressure budget and never becomes an input to the forward solve.
  It is the core of the flow-vs-pressure idea.
- **Element laws solved together**; the pressure budget (PDP = NP + FL + EP
  + appliances) is a main visual.
- **Methods are selectable, sourced profiles** (plus user-defined ones):
  one to calculate with, optionally one to compare against; built-ins are
  read-only and cloned to edit (`MODEL.md` §4).
- **Pure TypeScript engine, tested against published tables.**
- **Station units inside** (m, in, psi, gpm; laws convert their own published
  constants), other display units at the screen's edge.

**Change:**

| What | Why | Now |
|---|---|---|
| Ideal pressure-source pump | Pump capacity can't be shown | Trucks as data, with a capacity envelope, outlets and a governor (§6) |
| One generic nozzle | Smooth bore vs fog needs real types | Nozzle kinds and reaction (§7.2) |
| `line.ts` hard-codes one topology | Every new element breaks the closed form | Element laws + a generic solver; the closed form becomes a test oracle (§7.1) |
| Wye as the next milestone, lessons as the structure | The product is a playground of lays | Playground first; branching comes with trucks (§10) |
| No screen in this repo | The V0 screen stayed in fd-app behind a login | Standalone static app here (§9) |
| fd-app references in PLAN | Those files aren't here; the import rule was unenforced | `tests/boundaries.test.mjs` enforces it |

## 4. Product shape: the scenario document

Everything on screen is one **scenario document**: plain JSON with a schema
version, naming the truck, the elements, their connections, valve and nozzle
settings, heights, and the method. The solver reads it; the views draw it;
nothing else holds state that matters.

That one decision gives:

- **Presets** ("start from 1410 bifurcada") instead of a blank canvas.
- **A/B compare:** duplicate, change one thing, show both.
- **Share links:** the document encoded in the URL.
- **Undo:** edits are commands on the document.
- **Lessons, if ever wanted:** a preset plus a few lines of text. No separate
  system.

The document stores hydraulic facts (lengths, diameters, heights) and
separately a layout (where things are drawn). Moving something on screen
never changes the hydraulics.

**Evolving the format.** Strict on purpose, because documents leave the app
(links, files). Additions are new optional fields with defaults, so old
documents parse unchanged; a change of meaning bumps `version` and adds one
migration function from the previous version, so old links keep opening.
Until the first document is shared, the format can still change freely.
Data-collection CSV templates (`data/templates/`) and sourced equipment
reference CSVs (`data/catalog/`) are not this schema: their columns can be
added at any time. Catalog rows retain their manufacturer source and may be
incomplete where a published spec is missing; they are reference material,
not runtime simulator inputs yet.


**Floor height (2026-10-16):** optional `floorHeightM` (absent: 3 m), the
building's floor-to-floor height: the canvas's floor lines, snapping and
"piso n" labels. Drawing only; the hydraulics use heights in metres.
## 5. Views and drawing rules

- **Top-down view = the editor.** Connections, not geography: hose length is
  a number on the hose, not its drawn length.
- **Side view = one path.** Tap a nozzle: the path from pump to it unrolls,
  with distance along the hose horizontal and height vertical. Dragging the
  nozzle up writes its height.
- **No 3D.** Both views draw the same document; height is data, never a
  pixel position.

Drawing rules:

- **Hose thickness = diameter.** Physical size, so it's honest.
- **Pressure = gauges** (needles, psi), at the pump outlets, the nozzles and
  anywhere tapped.
- **Flow = moving water** (particle speed and density, gpm). Flow and
  pressure never share an encoding.
- **Pressure budget** bar for the selected path.
- **Pump × system curve** chart: the operating point where the pump's
  capacity meets the lay's demand. One picture for flow, friction,
  elevation, nozzle type and capacity.
- **Geometry in plain TypeScript.** Positions, scales and paths are pure
  functions in `src/lib/geometry/`; components only render their output.
  This keeps the logic testable under `node --test` and a framework switch
  limited to the components.
- **Performance:** SVG for the lay (tens of elements, crisp, touchable,
  accessible); one canvas layer for particles, animated outside the
  framework, with the count adapted to the device. Particles are off under
  `prefers-reduced-motion`.

## 6. Trucks

A truck is a data file (`data/apparatus/*.json`), not code:

- **Pump:** rating points (NFPA: 100 % flow at 150 psi, 70 % at 200, 50 % at
  250; review §11 [E10]) defining a capacity envelope; maximum pressure.
- **Outlets:** size, preconnect or not, each with a discharge valve that can
  be partly closed ("gated").
- **Intakes and supply:** tank volume, tank-to-pump line flow limit; later
  hydrant and drafting.
- **Control:** pressure governor (holds a set-point until the envelope) or
  RPM mode (pressure moves with flow).

What it shows: one pump gives one pressure, so lower-pressure lines are gated
down; opening an outlet makes the pump pressure sag in RPM mode, or the
governor hold it until capacity runs out; the tank empties at the current
flow.

**On screen (owner, 2026-10-16):** the truck lives in the pump's detail, the
panel body shown when the truck is selected (UX.md §4: one panel, the pump
header always above it), in this order: **Camión** (pick a truck
file; built-in trucks are read-only and "Clonar" makes an editable copy, the
same rule as methods), **Bomba** (the header's pressure, apply required and flow,
plus its share of the pump's capacity and the pump × line chart), **Control**
(pressure governor or RPM mode only, for now: no relief valve, which would
need its own law in `MODEL.md` first), **Descargas** (each outlet: size,
fittings, valve open or shut, which line it feeds), **Abastecimiento** (tank,
time left). The panel's structure ships with the polish (Bomba and one
discharge, with what the engine has today); each M3 section joins it when
its engine work lands, never shown greyed out before.

M11-1 and M11-5 become two files once their pump specs are known. A generic
1000 gpm pump ships first, labelled generic.

## 7. Engine work, in order

### 7.1 Element laws + solver

Each element reports Δp(Q) (hose, coupling, appliance, nozzle, valve) or
p(Q) (pump). The equations are the steady-state, pressure-dependent,
conservation-based hydraulics of EPA's EPANET manual (`MODEL.md` §2); the
algorithm is separate. For a supported law the residual is continuous and,
in the supported regime, strictly monotone, so a **sign-changing bracket**
gives a unique root — the condition bisection needs (`MODEL.md` §2).
**Default lane:** a single path is solved by bisection on Q; a tree from one
pump by nested bisection. `solveAttackLine` stays as a wrapper and its
closed form as the test oracle. The future EPANET-style **Global Gradient
Algorithm (GGA)** is planned **only** for general networks (loops,
reconverging feeds) and is **not implemented now**; the tree solver is not
in the runtime yet either (`MODEL.md` §2).

The **target-flow planning direction** (`MODEL.md` §2) is planned
on the same equations: evaluate `P_required(Q_target)` from the same budget
and, once pump limits exist (M3), solve the actual delivered flow the source
sustains — flow stays the output. Before the stepped `us-training` forward
solve ships, the solver must handle its no-root gap as an unsatisfied balance
rather than returning an exact root (`MODEL.md` §2, §3.10).

### 7.2 Nozzles

- Smooth bore by tip size (Freeman: Q = 29.7·d²·√NP).
- Fixed-gallonage fog (today's nozzle).
- Automatic fog (holds its set pressure over a flow range).
- Reaction: 1.57·d²·NP for smooth bore and 0.0505·Q·√NP for fog (TFT;
  review §8).

### 7.3 Pump and truck (§6)

Envelope, outlets, discharge valves, governor modes, tank.

### 7.4 Branching

Wyes, siamese, reducers and couplings. The default (`physical`) uses the
actual device's ΔP–Q curve when one is adopted, else the Colorado
allowances, labelled (owner, 2026-10-15; `MODEL.md` §3.10). `cgbvp-2019` (fixed losses, p. 45: 5/10/25/40 psi) and `us-training`
(the Colorado chart's stepped rule, `MODEL.md` §3.10) are training
**conventions**. The stepped rule is a discontinuity: a forward-flow
simulation must report a gap where no root exists rather than silently
returning one (`MODEL.md` §2, §3.10). **In-line fittings (reducer, adapter,
valve) come first, before branching** (§11, decision 5): they are a series
loss and need no tree solver.

### 7.4b Standpipes

Fit the series and tree solvers in levels:

1. **Outlet as the source** (with M2): the fire-floor outlet is a
   fixed-pressure source; heights are measured from it. Needs nothing new.
   Showcase preset: **high-rise, smooth bore vs fog** — at the outlet
   pressure a standpipe gives, a 50 psi smooth bore reaches its flow and a
   100 psi fog nozzle falls short of its rating; turning a selectable fog
   down trades away the flow. Include low-pressure fog (50/75 psi) so the
   comparison is fair. Stream reach and coherence: manufacturer data or a
   labelled qualitative comparison, never a ballistic claim (review §14).
2. **Whole system** (with M4): engine → supply → FDC (appliance loss) →
   riser (a section with a large rise and a steel-pipe law, Hazen–Williams,
   as NFPA 13/14 use) → outlet → hose → nozzle.
3. **Pressure-reducing valves** (with M4): downstream pressure =
   min(set-point, incoming − loss). Depends on upstream pressure, so the
   solver walks the line forward; still monotone in Q, so bisection holds.
4. **Several sources** (with §7.7): two engines on the FDC, a building
   fire pump boosted by an engine.

Outlet design pressures (NFPA 14, by edition) and any fire-service
standpipe allowances are cited before they are used, never from memory.

### 7.5 Kinks: out of scope

Dropped (owner, 2026-10-14): no published source gives a kink's loss.

### 7.6 Extinguishment

Its own folder (`src/extinguishment/`), never imported by the hydraulics.

- Water heated 20→100 °C and boiled absorbs ~2.6 MJ/kg, so ~160 kW per gpm
  at full vaporisation. The application efficiency needs a traceable source
  before shipping (Särdqvist 2002; Grimwood).
- The message: flow sets the cooling capacity; pressure moves the flow and
  shapes the stream.

**Feasibility (2026-10-15):** cheap. It needs only the nozzle flow Q that
`solveScenario` already returns, nothing from M2–M4: one engine file, one
test against hand arithmetic, one card ("Extinción") with a fire-size picker
and a bar *capacidad de enfriamiento vs calor del fuego*. Paired with the
selectable nozzle (ring down: pressure up, flow down) it shows the message
with today's line. What blocks it is sources, not code.

Options for the law, not exclusive (a method bundle can pick one):

| | Law | Needs before shipping | Fits |
|---|---|---|---|
| A. Heat balance | cooling = Q × 163 kW/gpm × η vs a fire's heat release (MW) | η (Särdqvist 2002; Grimwood); sourced HRR for each fire preset | `physical` |
| B. Fire-flow convention | required gpm from fire size: NFA (area ft² / 3 × fraction involved) or Iowa (volume ft³ / 100) | Both formulas verified against their publications (written from memory so far); no η | `us-training` / a training label; a "caudal requerido" mark on the flow gauge |

Out of scope either way: time to knockdown, fire dynamics, quantified reach
or droplet size (qualitative labels only). Never present pressure as
irrelevant.

**Decided (owner, 2026-10-15; §11 decision 8):** B first, NFA only; A
later beside it; right after §10c's polish, ahead of M2–M4.

### 7.7 Two pumps

Relay and a siamese fed by two engines. This needs the general network
solver (PLAN §6, global gradient algorithm).

## 8. Aerial module (later)

A second engine (`src/aerial/`), same rules: plain TypeScript, tested, every
constant sourced.

- **Shows:** overturning moment (boom weight, tip load, nozzle reaction,
  wind) against restoring moment about the outrigger line, as angle,
  extension, load and spread change.
- **Authority:** the manufacturer's load chart, drawn as the real limit.
  Structural limits usually govern before tipping, so a simplified tipping
  point is **never** presented as an operational answer. Labelled as a
  teaching model.
- **Link to hydraulics:** the ladder pipe's nozzle reaction comes from the
  hydraulics engine.
- **Needs:** PLT-11's specs and load chart.

## 9. Stack and layout

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript | Browsers run it natively; the solver needs microseconds, so WebAssembly languages add size and buy nothing. Keeps the tested engine as is. Most AI-assist examples. |
| UI | Svelte 5 (runes) + SvelteKit, `adapter-static` | Fine-grained updates and built-in motion suit gauges and sliders; less code than React. Risk: AI writing Svelte 4 syntax. Mitigation: the AGENTS.md rule, and Svelte's `llms.txt` docs. |
| Drawing | SVG for the lay, one canvas for particles | §5 |
| Offline | Installable web app (PWA) | Home-screen install on tablets; no app stores |
| Hosting | Any static host (e.g. GitHub Pages) | Public hosting brings back PLAN §1's licence question |
| Tests | `node --test` for engines; a test per preset that it solves to the numbers its notes claim | |
| Not now | Workspace/packages, React, XYFlow, chart libraries, WASM | Add only when a second consumer or a measured limit needs one |

```
src/
  hydraulics/      engine (existing); imports only itself
  extinguishment/  later; imports nothing from the app
  aerial/          later
  lib/             Svelte: views (TopDown, SideView), parts (Hose, Nozzle,
                   Gauge), canvas particles, scenario store, units display
  routes/          SvelteKit pages
data/
  catalog/         sourced nozzle and monitor reference CSVs
  apparatus/       truck files
  presets/         scenario documents
tests/
docs/
```

Language: code and docs in English, UI in Spanish, with CGBVP terms (pitón,
paño, bifurca, desnivel).

## 10. Milestones

| | Delivers | Shows |
|---|---|---|
| **M0** ✅ | Roadmap; import-boundary test; Node pin | — |
| **M1 Foundation** | SvelteKit static app; scenario document v1; element laws + solver (7.1); one truck outlet → hose → nozzle; top-down and side views; gauges; particles; pressure budget; units; share link. | Flow vs pressure, friction, elevation |
| **M2 Nozzles** | Nozzle kinds and reaction; A/B compare | Smooth bore vs fog |
| **M3 Trucks** | Truck files, capacity envelope, several outlets with valves, governor, tank; pump × system chart | Pump capacity |
| **M4 Branching** | Wyes, appliances, couplings; presets from station maniobras | Diameter and couplings in real lays |
| **M5 Extinguishment** | §7.6: NFA fire flow first (after §10c, ahead of M2), heat balance once η is sourced | GPM extinguishes |
| **M6 Aerial** | §8 | Tipping margin vs load chart |
| Later | Two pumps (7.7), hydrant and drafting, station data from fd-app, lessons as annotated presets | |

## 10b. Course correction (owner, 2026-10-15)

The first side view was a viewer of a fixed scenario; the owner's test
found it barebones (fiddly drag, no typed pressure, a checkbox for the
nozzle, nothing to add). M1 now leads with **editing**: an inspector for
the tapped element with typed fields and ± steps, add/remove sections,
hose size and length, nozzle model and rating, heights by floor, a pump
panel, and the nozzle's bale worked by tapping it. Deferred, additive
later: **routes** (stairs, window hoist; hydraulically only height and
length matter, so a route is drawing data plus the length it implies),
dragging pieces from a toolbar, and a visual-only **line-charging**
animation (a water front at the solved velocity; not a transient model).

## 10c. Polish before new laws (owner, 2026-10-16)

Next work polishes the app around the laws already implemented (hose
friction, elevation, fixed-orifice and selectable nozzles). Deferred until
then: partial valve openings (nozzle bale part-open, pump push-pull
discharge valves; a new law `valve.partial`, Q = Cv·f(x)·√ΔP, generic curves
labelled illustrative unless a manufacturer source is found), pump capacity,
automatic nozzles, branching.

## 11. Decisions (owner, 2026-10-14)

1. **Kinks:** out of scope (§7.5).
2. **Equipment:** built-in default specs (generic truck, hoses, nozzles),
   editable in the app; a user's edits live in the scenario document. Linking
   to fd-app's station data comes later. Every built-in names its source, or
   says "generic" when it has none.
3. **Method:** the default is the simulator model (`physical`, legacy id), a
   source-based descriptive default ("Modelo base"; `MODEL.md` §4).
   Selectable: `physical`, `cgbvp-2019`, `us-training` (Colorado DFPC 2020)
   and user-defined methods — **planned design**, not runtime state (only
   `physical` and `cgbvp-2019` are implemented). A second, optional slot
   compares against any other method; built-ins are read-only and cloned to
   edit (owner, 2026-10-15; replaces "CGBVP always the reference, never
   selectable").
   **Every number the app shows can name its source** (`references.ts`
   SOURCES; a "Fuentes" panel in the app).
4. **Hosting and licence:** deferred.

### Fittings and methods (owner, 2026-10-15)

5. **Fittings are objects at joints.** A reducer or adapter sits at a joint,
   moves with its coupling, and costs its loss (MODEL.md §3.10). No
   free-floating pieces: an item outside the chain has no hydraulic meaning.
   Adding one is a tap on the joint and a small menu (the hose toolbar's
   pattern); the toolbox drag-and-drop stays deferred (§10b).
6. **Autofit is a per-scenario mode, on by default** ("Accesorios
   automáticos", stored as `autoFittings`). On: a size mismatch gets a
   visible adapter, derived, not removable while on. Off: adapters are placed
   by hand; a mismatch without one is flagged and no water flows until you
   place it. Presets and first load
   use on; an off-by-default challenge mode may come later.
7. **US training profile, `us-training`: adopted** (owner, 2026-10-15). The
   US teaching model, `published` to the **Colorado DFPC Driver/Operator
   Pumper Chart, January 2020, p. 1** — the primary chart, not a secondary
   summary or a generic "certified IFSTA" model (`MODEL.md` §3.10, §4;
   [E15]). Its clauses: elevation 0.5 psi/ft; generic appliances 0 psi up to
   350 gpm then 10 psi (strictly `> 350`); master stream and aerial waterway
   25 psi each; **standpipe a whole-system allowance of 25 psi**, independent
   of floors (elevation separate). The 10 psi is a training allowance, not a
   universal physical loss, and the profile covers only the components §3.10
   lists. Selectable and comparable like any method (decision 3). Measured data is thin and
   device-specific (monitors, eductors, and one wildland wye test;
   `MODEL.md` §9). The default `physical` uses the same allowances, labelled,
   until a device's measured curve replaces them (owner, 2026-10-15: a
   fireground tool calculates with what crews are taught; `MODEL.md` §3.10). A
   user may clone and edit any profile, including its per-component supported
   rules or values, with the versioned full configuration saved in the
   scenario document. This is planned design; only `physical` and
   `cgbvp-2019` are implemented.

### Extinguishment (owner, 2026-10-15)

8. **Fire flow first, heat balance later** (§7.6). Ships right after §10c's
   polish, ahead of M2–M4: it needs only the solved nozzle flow.
   - **First: NFA formula only** (`extinguish.fire-flow`): a "caudal
     requerido" mark on the flow gauge, from a preset's floor area and
     fraction involved. Says the message in the firefighter's units and
     needs no η. Labelled a training convention. Verify against the NFA
     publication before use.
   - **Iowa: not planned.** Volume-based, built for confined spaces; a
     second number that disagrees without teaching more. Revisit only if
     the station teaches it.
   - **Later: heat balance (A)** beside it, as `physical` sits beside
     `cgbvp-2019`: the convention says what you need, the physics says why
     (each gpm absorbs a fixed heat; pressure absorbs none). Waits for a
     sourced η and fire heat release rates; shown alone it would be a
     confident number on a weak basis.

Still wanted: M11-1 and M11-5 pump plates, the nozzles carried, hose sizes
and couplings, PLT-11's load chart.

### Saving and sharing (owner, 2026-10-15)

8. **Share link: wanted, deferred** until the current polish is done (§10c,
   UX.md §8). A link carries the whole scenario document; opening it
   rebuilds that lay (top task 9, UX.md §9).
9. **Cloud saves and permanent lays are the planned paid feature.** The
   share link stays free beside them. Accounts, storage and pricing are not
   designed yet, and they bring back PLAN §1's licence and hosting question.
