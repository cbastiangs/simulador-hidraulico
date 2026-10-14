# Hydraulics simulator

> **2026-10-11, after extraction from fd-app:** `ROADMAP.md` now sets what
> the simulator is for and the order of work. The model, constants and
> sources now live in `MODEL.md`; this document keeps §4 and §6. §1, §5 and §8 describe the
> fd-app integration as it was; the files they cite (`BACKLOG.md`,
> `eslint.config.mjs`, `scripts/dev/smoke.mjs`, `data/catalog/`) are not in
> this repo. §9's wye milestone moves after nozzles and trucks (ROADMAP §10). The
> screen's default method is now `physical`, with `cgbvp-2019` shown beside it
> as the reference (ROADMAP §11), replacing the default stated in §3.

> Status: **V0 built** (2026-09-30) — `/simulator`, one attack line
> (pump → hose → nozzle). Full-screen, behind login, not in the navigation.
> 2026-10-01: checked against the CGBVP 2019 manual (§3); its elevation rule
> is the default method. Replaces the exploratory lab of `388fdc1`, whose
> nozzle had no hydraulic behaviour (§2).

## 1. Where it lives, and the open question

`PLAN-plataforma.md` §3 places the hydraulics simulator in the **Toolkit**
(public, offline, no login), with the math in a shared package and fd-app
deep-linking into it. The Toolkit does not exist yet and its launch waits for
the product name (§9 there), so the simulator starts as a route in fd-app.
It is built so the §3 decision stays open, rather than silently overturned:

- `src/hydraulics/` is plain TypeScript: no React, Next, Mantine, Supabase,
  `@/` or `../` imports (enforced in `eslint.config.mjs`). It is the seed of
  `packages/fire-calc`; extracting it is a move plus a `package.json`.
- `src/app/simulator/` reads no data at all. Equipment from a unit will
  arrive as props from a host page (§5), so the screen can move to the Toolkit
  unchanged.

**The open question is the licence, not the placement** (user, 2026-09-30):
keep the simulator proprietary, or make it free to use or open source. It
does not decide SPA vs SSR or performance work. **It does not need deciding
now.** It needs deciding when one of these happens: the repo goes public,
the Toolkit launches, someone outside wants to contribute, or another
organisation asks to use it. Until then the repo stays private; with no
licence, code is "all rights reserved" by default. What bears on the choice:

- **Code that runs in the browser can be copied by anyone who can load it.**
  A login decides *who* gets the bundle, not whether they can copy it. The
  production build ships minified JavaScript without source maps, which is
  harder to read, not protected. A public, offline Toolkit publishes the
  solver in practice, whatever its licence says.
- **A licence does not stop copying.** Its job is to let people use the code
  *legitimately*: another compañía, contributors, an institution whose rules
  forbid using unlicensed code.
- **Keeping the solver secret means running it on a server**, which costs
  the offline use the Toolkit exists for and adds a round trip to every
  edit.
- **The formulas are public knowledge** (IFSTA, CGBVP courses). What is hard
  to copy is the integration with a station's own data (dotación →
  scenario) and the screens, and those live in fd-app either way.
- **The code layout doesn't change with the choice.**

## 2. The model

Moved to **`MODEL.md`** (2026-10-14): every law, its constants, units,
sources, validity and status, the methods, the manual errors never encoded,
and what must be verified before each law is implemented. Two principles
from this section stay here as history:

- **No "training mode" vs "simulation mode".** The classic calculation (what
  pressure does this nozzle need?) and the simulation (what does this
  pressure deliver?) are the same equations read in opposite directions.
- **Position is not hydraulics.** Dragging arranges the drawing; only heights
  and lengths, which are data, change the solution.

## 3. Sources

Moved to `MODEL.md` (constants and their basis) and `references.ts`
(machine-readable sources).

## 4. Unknowns

- What CGBVP examines **today**: the manual is from 2019. Is the rule 1.4 or
  1.5 psi/m, and is there a current formula sheet? Ask an instructor.
- Whether the station's lona and nitrilo hose match the coefficients, and
  which couplings its 3" hose has.
- Nozzle ratings, hose lengths, pump specs: `BACKLOG.md` §19.
- PLT-11 is the aerial platform; the pumpers are M11-1 and M11-5.

## 5. Station data (not built)

- **The catalog's spec gap is fd-app work, filed as `BACKLOG.md` §19**: the
  specs belong in the catalog whether or not the simulator uses them.
- **No schema change yet.** Rated flow and pressure are product specs, so
  they belong in the catalog's attribute layer (`caudal_nominal` and
  `presion_nominal` on `Pitón` in `data/catalog/item-types.json`), not in a
  separate hydraulic-profile table that would duplicate `diametro` and
  `largo`. C is a calculation convention keyed by diameter
  (`references.ts`). A C measured by flow-testing one hose would be a reading
  on that asset (`PLAN-asset-observations.md`).
- **Adapter:** a pure function in fd-app, never in `src/hydraulics/`, maps a
  catalog item to a simulation element, or to the reason it can't. A missing
  length asks the person; 3" asks which couplings; an automatic nozzle is not
  modelled yet.
- **Snapshot:** a saved scenario keeps the values it was solved with, the
  method id, and provenance (item id and name at import). The solver never
  reads an id. Nothing is persisted yet.

## 6. Solver roadmap

- **EPANET: not now.** One line has a closed form, and a tree of lines fed by
  one pump (wyes) has one unknown per junction, solved by bisection or Newton.
  A general network solver is needed only once loops or several sources
  appear (siamese from two pumps, relay). When it is, the element laws map
  onto EPANET (hose → pipe with a quadratic minor-loss K, nozzle → emitter
  with exponent 0.5, pump setting → fixed-head source). So EPANET is best
  used first as an **independent test oracle** for our own solver. Its
  weaker fits for the fireground are automatic nozzles, pressure governors,
  drafting/NPSH and lines that are not full.
- **TSNet: defer.** It is Python on WNTR and would need a server or Pyodide.
  If water hammer is ever taught quantitatively, a single-line method of
  characteristics in TypeScript is small.

## 7. Rendering, and what dragging should mean

Nodes are HTML buttons over an SVG hose layer. That gives focus, keyboard
and screen-reader support for free, and it is the same model XYFlow uses.
Adopt XYFlow when people build the topology themselves (palette, ports,
pan/zoom), not before. Canvas, Pixi or WebGL have no job here at tens of
elements.

**Today dragging only arranges the drawing, which is weak** (user,
2026-10-01). Proposed, not built:

- **Side view where vertical drag is height.** Draw the line in elevation
  profile: ground at the pump, a metre scale, and optionally floors at a
  height the scenario sets. Dragging the nozzle up writes
  `nozzleElevationFt`, and the elevation row and required pump pressure move
  as you drag. The manual's "1 piso = 5 psi" becomes something you can see.
  Horizontal stays free: hose length is not horizontal distance once the
  line climbs stairs, so length remains a number (paños).
- **Branching layouts will want a plan view** for the topology. One answer is
  two views of the same scenario: plan for connections, profile for the
  selected line. Heights are already data on elements, never pixel
  positions, so both views can share it.
- **Hose physics is a second, visual-only simulation.** A rope of points
  with length constraints (Verlet) could draw the hose at its real length:
  sag in side view, pulling tight when the nozzle is dragged further than the
  hose reaches. It reads hose length from the scenario and never feeds the
  hydraulic solver. It's a finishing touch, not foundation.

## 8. Architecture and stack

### Stack

Nothing was added to `package.json`.

| Concern | Choice | Notes |
|---|---|---|
| Route | Next.js 16.2 App Router, Turbopack | `/simulator` is static and prerendered (`○` in the build): a server `page.tsx` with metadata, one client component, no server data. Behind the auth proxy like every non-public path. SPA vs SSR does not arise. |
| UI state | React 19.2 `useState` | no state library; the line is solved on every render (closed form, microseconds) |
| Controls | Mantine 9 | NumberInput, Select, SegmentedControl, Popover, Accordion, Switch; `useElementSize` from `@mantine/hooks` |
| Drawing | HTML `<button>` nodes positioned in % over one SVG layer | the SVG `viewBox` is the measured pixel size, so strokes and text keep their size on a phone |
| Styling | CSS Modules + postcss-preset-mantine | tokens in `light-dark()`, both colour schemes |
| Core | plain TypeScript, erasable syntax only | Node 24 runs it directly, with no build step, in tests |
| Tests | `node --test` (`tests/domain/hydraulics.test.mjs`) + Playwright smoke (`scripts/dev/smoke.mjs`, the repo's Docker Chromium) | domain expectations are hand arithmetic or published tables |
| Not used | Supabase, TanStack Query, graph/canvas libraries, WASM | arrive with their milestones (below) |

### Layers and what each may import

```
src/app/simulator/
  page.tsx            server component: metadata only
  LineSimulator.tsx   client: owns state, calls the solver, formats results
  LineDiagram.tsx     drawing: positions, drag, selection; gets formatted readings
  UnitNumberInput.tsx field: viewer's units in, internal units out
  displayUnits.ts     unit preference → scales and formatting
        │ imports ▼                     (ESLint blocks the reverse)
src/hydraulics/       imports nothing outside itself
  units.ts            exact conversions
  references.ts       sources, hose C table, methods (cgbvp-2019, physical)
  line.ts             element laws; solveAttackLine(line, method) → result
```

On every render:

```
state ─ line (psi, gpm, ft) · hoseSizeId · methodId · units · layout · selected
  │
  ├─ solveAttackLine(line, METHODS[methodId]) ──► AttackLineResult
  ├─ formatQuantity(result, scaleOf(units))   ──► readings (strings)
  ├─► LineDiagram (layout, readings)  → onMove: layout fractions only
  └─► panel → UnitNumberInput         → onChange: internal units only
```

The solver never sees layout or display units. The drawing never sees the
solver.

### How it grows

Each step lands only when its milestone needs it.

| When | What changes |
|---|---|
| Wye (§9) | The scenario becomes a document of elements + connections. The solver gains a tree solve (one unknown per junction). Methods gain appliance losses. State moves to `useReducer`: edits become commands, so undo comes nearly free. |
| Height drag (§7) | `LineDiagram` gains a profile mode; vertical drag writes height. |
| Start from M11-1 | `src/lib/hydraulicEquipment.ts`: a TanStack Query hook over an RPC that reads the unit's maniobras (AGENTS.md data conventions), plus the pure adapter (§5). The host page passes the elements as props. |
| Saving scenarios | A `simulator_scenarios` table (station_id, RLS, jsonb document with schema version, method id, solved values, provenance) and hooks in `src/lib/simulatorScenarios.ts`. |
| Loops, several pumps, relay | `src/hydraulics/network.ts`: the global gradient algorithm (EPANET's) in TypeScript, with EPANET via epanet-js as the test oracle. A Web Worker only if one solve passes ~16 ms. |
| Palette and ports | Consider XYFlow for pan, zoom and connections; nodes stay our components. |
| Toolkit | `src/hydraulics/` → `packages/fire-calc`; the screen moves to the toolkit app or a shared package. |

## 9. Next milestone

**Maniobra 1410/Bifurcada**, straight from the station's recipes: 2 × 2-1/2"
nitrilo → bifurco 2-1/2" a 1-1/2" → 2 × Cleveland (1-1/2" + pitón). It is
the first branch (one unknown: the wye pressure) and the first appliance
loss. Method `cgbvp-2019` uses the manual's fixed 5 psi per wye (p. 45).
Method `physical` needs a flow-dependent loss, and no source for one has
been chosen yet (manufacturer curve or K). After that: **start from M11-1**,
pick a maniobra, and its recipe becomes the scenario, asking for any length
the catalog lacks.

**Pending check:** a smoke assertion for the method switch (default CGBVP:
10 m → "15.0 desnivel"; Hidrostática → "14.2"). It was verified once in the
browser on 2026-10-01; it goes into `scripts/dev/smoke.mjs` once that file has
no other uncommitted work in it.
