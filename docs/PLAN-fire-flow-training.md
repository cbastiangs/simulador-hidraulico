# Floor area, required flow and hose selection

> Current authorization (2026-10-29): implement the first area/flow exercise
> after the completed quality checkpoint. ROADMAP current delivery and UX.md
> define the selected first UI and supersede the obstacle-first proposal below.
> The remaining proposal is retained as future design context.

> 2026-10-29. Requested plan, not an implementation or an approved release
> schedule. **Sequencing update, 2026-10-29:** the hydraulic quality pass is
> complete within supported scope. The owner deferred the real-phone
> walkthrough; it no longer blocks further development. This training plan
> remains a proposed next feature, not an instruction to implement it. Owner
> goals: internalize required gpm from affected area, develop
> judgment about choosing 2½″ or larger hose, and eventually support 3D.
> ROADMAP §7.6 and MODEL §3.12 remain the model authorities. This proposal
> retains equipment calibration and later real-device feedback as separate work.

## 1. Outcome and first release

**Historical reassessment proposal (superseded for this delivery; 2026-10-29, following the owner's question about
physical obstacles):** put a minimal obstacle-aware deployment slice before
the area/flow exercise. This supersedes the proposed delivery order in §6
and §8 below; those sections retain the training-feature detail. This is a
proposal, not an approved implementation instruction. The earlier rectangle
alone would teach arithmetic but would not establish realistic deployment.

Proposed sequence:

1. **Spatial document contract.** Establish physical x/y positions and z
   elevations, stable equipment/route references, installed hose lengths and
   simple barriers/openings before building a new view. Keep camera/layout
   separate. Existing scenarios open in their current schematic view; do not
   invent floor plans from the existing side-view coordinates. Reuse the
   app-owned document/migration approach in §5, extending it for spatial data.
2. **One-floor deployment slice.** A top-down plan with a truck outside,
   one building, an internal wall and doorways, and a nozzle destination.
   Start from an authored preset. Let the user place route waypoints through
   openings and around barriers; retain the existing side editor and solver.
   Validate barrier crossings and route reach against installed hose length.
   No automatic pathfinding, full building editor or 3D renderer is needed.
3. **Deployment → hydraulic feedback.** Show installed length, route length,
   slack and any shortage. Use the existing pressure/flow results. A route
   consuming slack does not change friction at unchanged installed length;
   explicitly adding another hose does. Keep route corners separate from
   couplings: a waypoint is not a new appliance or invented minor loss.
4. **Affected area and flow practice.** Add the area/fraction controls, NFA
   reference, assigned streams and estimate/reveal interaction described
   below to that same building. Compare hose arrangements against both
   physical reach and solved delivery, with no automatic tactical verdict.
5. **Vertical routes, then 3D.** Introduce stairs and window-hoist routes
   with explicit elevations and intermediate high points. Define the adapter
   to engine sections before shipping: preserve total installed length and
   coefficients, include high-point checks, and do not create fitting losses
   at geometric bends. Add 3D presentation only after plan/side views share
   a working spatial model.

**First-slice acceptance example:** 60 m installed, a 40 m route leaves
20 m slack. Moving the route around a wall to 55 m leaves 5 m slack and
unchanged hydraulic results when elevations and equipment are unchanged.
A 70 m route needs 10 m more hose; it cannot silently stretch the installed
60 m. Adding a 30 m paño makes 90 m installed and leaves 20 m slack; the
solver then uses 90 m for friction. Crossing an intact wall is an invalid
deployment preview, not a new zero-flow hydraulic state. Keep the last valid
deployment until the route edit is resolved or cancelled. These are proposed
interaction rules to specify in UX.md before implementation.

Obstacle contact initially means geometric routing constraints only. Kinks,
snags, crushing, hose drag forces, door pinch losses and hose/body collision
physics remain unsupported; do not infer quantitative effects from a wall
or doorway. This progression addresses spatial deployment without pretending
that a 3D renderer would supply those physical laws.

A firefighter sees a building footprint, estimates the affected area and
reference flow, chooses a lay, then operates it and explains the difference
between reference demand and actual delivery. Repeat with a changed area,
hose length, elevation, nozzle or supply to build judgment through comparison.

First training release (after the proposed deployment slice): one rectangular floor, a shaded involved fraction, an optional
estimate-before-reveal exercise, and live NFA comparison against explicitly
assigned nozzle lines. The existing side-view editor remains available for
building and operating the lay. A plan view is 2D; a 3D renderer is not a
dependency of this release.

This is a proposed extension of the existing preset/question/action model,
not a separate course platform. Free exploration remains available.

## 2. Model and teaching contract

- Reuse `calculateNfaFireFlow` and `compareNfaFireFlow` from
  `src/extinguishment/fire-flow.ts`. Do not duplicate their law in a component.
- Input: total area of one floor in m² and involved fraction in [0,1].
  Derive area from physical length × width. Apply involvement exactly once.
- Reveal the published formula with explicit units:
  `Q_USgpm = A_ft² / 3 × f`. When dimensions are metric, explain the conversion;
  `Q_USgpm ≈ affected_area_m² × 3.59` is a rounded memory aid only. Compute
  results through the existing engine with exact conversions.
- Label the result **Caudal de referencia NFA**, a training convention.
  Its scope includes confinement, extinguishment and backup lines together;
  it is not a requirement for one attack nozzle. See MODEL §3.12 and the
  [NFA manual, SM2-28–30](https://apps.usfa.fema.gov/ax/sm/sm_0455.pdf).
- Keep the existing one-floor scope. Show the documented applicability
  context from MODEL §3.12; do not silently cap, halve or change the formula.
  Multi-floor demands and exposure allowances need their own model work.
- Flow remains a solved output. A learner's guessed flow is an answer,
  never an input to the hydraulic solve.
- A coverage ratio of 1 means the reference flow is matched. It does not
  mean the fire is out, the operation is safe or the selected tactic is correct.
- Do not grade diameter with an area threshold. Explain differences using
  delivered flow, friction, nozzle pressure/reaction and supply endurance.
  Staffing, handling and tactical suitability remain instructor discussion;
  no staffing rule or safe-reaction threshold is invented.

## 3. User experience

Proposed sequence: **Estimar → Elegir → Comprobar → Ajustar**.

1. Open an exercise preset. The plan shows a dimensioned rectangle and
   hatched affected portion. A percentage control changes the shaded area;
   the initial shape represents area only, not a simulated fire perimeter.
2. Enter an affected-area estimate and a gpm estimate. In exercise mode,
   hide computed area, reference flow and coverage until reveal. Dimensions
   and involvement remain available for arithmetic practice. Free exploration
   shows results immediately. A blank answer may be skipped without blocking.
3. Build or change the lay with the existing equipment interactions. Assign
   eligible nozzle lines to this exercise and identify their intended role
   (attack, confinement or backup). Assignment is explicit, not inferred from
   a jet visually touching the building.
4. Reveal affected area, formula substitution, reference gpm, selected-line
   delivery and signed shortfall/surplus. Show estimate error separately from
   hydraulic shortfall; neither is labelled a tactical pass/fail.
5. Change one thing and observe the result. Offer **Reintentar** to hide the
   answer and clear guesses. Editing building dimensions/involvement starts
   a new estimate; equipment edits keep the revealed arithmetic available.

Place **Planta / Perfil** controls beside the canvas. On a phone show one
view at a time with shared selection and the existing inspector sheet.
The first plan view contains the building and line assignments, not editable
spatial hose routing. Dimension handles and numeric controls provide equivalent
edits. Area labels follow m²/ft² display preferences; formula labels always
state their units. Hatching and text supplement colour. Follow UX.md touch,
keyboard, reduced-motion and no-mock-up requirements.

## 4. Flow accounting and operating behaviour

Keep three quantities distinct:

| Quantity | Included | Purpose |
|---|---|---|
| Total pump delivery | All solved outlets, including wasted discharge | Existing pump and tank accounting |
| Selected-line delivery | Unique, assigned terminal nozzles with valid solved results | NFA comparison for the declared lay |
| Applied attack flow | Only streams explicitly designated as applied to the fire | Future thermal comparison; not inferred from the NFA total |

Only terminal nozzles are assignable in the first release. Exclude bare/open
ends and empty outlets from this comparison, while retaining their effect on
pump capacity and tank depletion. Prevent double-counting a shared upstream
segment. Line names may change without changing identity.

A closed backup line contributes zero current delivery. Label it as closed;
do not silently count its nominal rating or hypothetical available flow.
The learner can open it to observe simultaneous supply capability. Its role
does not imply that its water is applied to the burning fuel.

Closing valves, changing a selector, adding another discharge and tank
exhaustion update delivery through the existing solver. Invalid/unavailable
solutions stay visibly unavailable, not fabricated as zero or full coverage.
If any selected result is unavailable, withhold aggregate coverage and explain
which line prevents comparison. Valid solved zero flow remains zero.

Removing or replacing an assigned terminal clears that assignment in the
same undoable edit. Adding a wye does not silently assign its new children.
Undo restores both equipment and assignments. Old documents without a fire
exercise behave exactly as before.

## 5. Document and code architecture

The current `Scenario` and `parseScenario` live in
`src/hydraulics/scenario.ts`; share, library and page import paths call that
parser directly. It must not import the extinguishment module or UI types.

Proposed approach: add an app-owned, versioned document envelope containing
the unchanged hydraulic scenario and an optional fire-flow exercise block.
Treat this as a new document format, with explicit migration from existing
bare version-1 scenarios. Maintain one authoritative document and one undo
history, rather than separate unsynchronized saves.

Exercise fields, subject to final naming during implementation:

- Rectangle length/width in metres; involved fraction; optional preset id.
- Assigned terminal references using existing branch-id paths, with an
  explicit root-terminal representation and intended roles. Validate path
  uniqueness and resolution; never depend on array positions or line names.
- No stored derived area, required flow, coverage or hydraulic results.

Guesses, reveal state and active view are session presentation state; shared
links reopen the exercise unanswered. Building and assignment edits belong
to the document and undo history. Persist only scenario facts in exported
files and autosaves. Loading continues to pause the existing tank clock.

Implementation seams:

| Location | Planned responsibility |
|---|---|
| New `src/lib/document.ts` | Envelope parsing, legacy migration, validated exercise data |
| New app-side fire-flow adapter | Resolve terminal references, aggregate solved outputs, call extinguishment API |
| `src/lib/share.ts`, `src/lib/library.ts`, page file import | Read/write the full document; preserve old links and saved lays |
| Existing edit/action integration | Atomic equipment/assignment changes and undo |
| `src/lib/geometry/` | Rectangle and affected-region drawing geometry |
| New Svelte 5 components | Plan canvas and estimate/reveal/comparison controls |
| `src/lib/lessons.ts` and preset data | Questions, actions and repeatable scenario facts |

Geometry may calculate areas, but hydraulic and required-flow equations stay
in their engines. `src/hydraulics/` remains independent. Inspect
`backlog/top-down-view` for reusable gestures/rendering only; do not merge an
old editor wholesale or assume its connection layout represents floor space.

## 6. Delivery slices and acceptance

| Slice | Deliverable | Acceptance |
|---|---|---|
| 1. Document foundation | Envelope, legacy migration, exercise validation, terminal assignment adapter | Old links/files/local lays reopen; new exercise survives export/reload and undo without losing equipment |
| 2. Area and live comparison | Rectangular plan, physical dimensions, involvement shading, assignments, live NFA card | Published 40 × 30 ft example yields 400 gpm at full involvement and 100 at 25%; displayed units do not alter stored facts |
| 3. Recall exercise | Optional estimate/reveal/reset flow and worked substitution | Reference answer stays hidden until reveal; guess never changes solved flow; exercise can be retried or explored freely |
| 4. Hose judgment presets | Small set of sourced-equipment comparisons and instructor prompts | User can explain a flow deficit and observe how changing hose/nozzle/supply affects it; no diameter receives an automatic tactical verdict |
| 5. Station walkthrough | Phone/projector exercise with firefighters | Identify whether learners can explain area → demand → delivery and transfer the reasoning to a changed example |

Slices 1–4 constitute the first release; no thermal UI or 3D dependency.
Each slice should remain reviewable and leave the existing playground usable.

Suggested preset progression:

- Published area example: practise full versus partial involvement.
- Same demand and equipment, short versus long hose: expose friction.
- Same nozzle and supply, smaller hose versus 2½″: isolate hose diameter.
- Same demand, change nozzle capacity after changing hose: show why diameter
  alone may not deliver the desired flow.
- Open a second assigned line: observe shared pump and tank limits.
- Larger supported hose/supply arrangement: distinguish supply-line diameter
  from attack-line choice. Choose catalog-supported combinations, not a
  fictional large handline or an unsupported master-stream model.

Before shipping each preset, record its actual engine results and equipment
basis. Do not promise that an arbitrary swap crosses the reference flow.
Changing one example's affected area creates arithmetic practice without
changing the underlying equipment comparison.

## 7. Verification

Reuse the existing source-based extinguishment tests. Add numerical coverage
only if a new law/source is introduced; do not duplicate those examples in UI
or geometry tests. Run `pnpm test`, `pnpm typecheck` and `pnpm build` for each
implementation delivery. Follow AGENTS.md's test budget.

Manually verify in the browser at 390 × 844 and 1024 px, capturing screenshots:

- Estimate, reveal, retry, free exploration and keyboard/touch dimension edits.
- 0%, 25% and 100% involvement; m/ft and gpm/L/min changes without double
  conversion or hidden-answer leakage.
- Assigned/unassigned lines, closed backup, open unused outlet, shared branch,
  unavailable solve and empty tank. Confirm pump flow and selected flow differ
  when water is discharged elsewhere.
- Rename, remove, split, undo and redo an assigned line.
- Old/new share links, file import/export, local save, autosave and offline
  reopen. Invalid exercise data produces a clear error without overwriting
  saved work. Viewing a new document in an older app is not guaranteed.
- Switching views preserves the lay; plan resizing changes demand only,
  without changing hose length/elevation or silently moving a nozzle.

Screenshots verify the implemented UI; no mock-ups are required for this plan.

## 8. Spatial progression and eventual 3D

After the first release proves useful:

1. Add simple room partitions/irregular footprints and explicit affected
   regions. Define overlap/union accounting before summing room areas.
2. Add spatial hose routes and obstacles. Specify how physical route length,
   installed hose length, slack and nozzle elevation interact before enabling
   dragging; a camera change must never alter hydraulics.
3. Introduce a shared world model with horizontal x/y coordinates and z
   elevation, plus camera/layout state kept separately. Migrate earlier
   schematic layouts explicitly; do not invent missing geography from pixels.
4. Add a lazy-loaded 3D view over that model, retaining functional plan and
   side views. Choose the renderer after testing the station phone; establish
   device performance targets then. Rendering should consume the same solved
   pressures/flows, never a separate 3D hydraulic calculation.

3D can teach orientation and placement. Dynamic fire growth, ventilation,
smoke, stream reach, extinguishment and time to knockdown each require their
own justified models; visual realism does not supply those laws.

Heat-reference exploration remains a separate later feature under MODEL
§3.12: explicit η provenance and appropriately described HRR references,
without an extinguished/safe verdict. It need not block either 2D or 3D.

## 9. Items to settle during implementation

- Review the proposed envelope migration against every persistence entry
  point before editing the page state; finalize schema name/version there.
- Select station-relevant hose/nozzle presets from verified data. Unknown
  station equipment stays generic and labelled.
- Instructor review of Spanish terminology, metric memory aid and prompts.
- Use the first station walkthrough to decide whether room estimation or
  spatial routing should precede 3D. No renderer or delivery date is committed.
