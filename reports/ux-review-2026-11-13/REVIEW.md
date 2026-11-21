# Visual, interaction and information architecture review

Reviewed 2026-11-13 against `d809654`, at 390×844 and 1024×844. This is an
evidence-based browser review, not an instructor study or real-phone test.
Recommendations below are proposals, not newly approved product decisions.
No application code or hydraulic behavior was changed.

## Assessment

The simulator has a coherent technical visual language and useful direct
controls. Its biggest weakness is the allocation of screen space: learning
content competes with the equipment users need to operate. Navigation has also
grown beyond the original single preset menu. Improve those two areas before
adding more visible features.

Priority definitions: **P1** materially obstructs a core task; **P2** adds
avoidable confusion or effort; **P3** visual consistency/detail. These are
usability priorities, not hydraulic correctness findings.

## Findings

### 1. P1 — Practice content displaces the working canvas

**Reproduce:** open “Práctica · 3. Segunda descarga”, reveal the result,
close the dialog, and save the initial readings.

At 390 px, the live summary is 172 px tall and the comparison is 308 px.
Together they consume about 480 px. The remaining canvas container is only
127 px tall, including its two rows of tools: the actual drawing becomes a
thin strip. This persists after the link-opening notification disappears.
At 1024 px, the drawing starts at y=527; the equipment sits below the initial
viewport. Scrolling then leaves the large sticky practice section over the
canvas. Neither layout supports watching the hoses while comparing readings.

Expanding the phone inspector repeats the summary and comparison in a sticky
block before the pump controls. The discharge gates require scrolling below
that block and the full pump card. The operation succeeds, but instruction,
action and visual feedback cannot be seen together.

**Proposed fix:** reserve a useful minimum drawing area; keep only a compact
practice result visible while operating. Make the detailed comparison and
explanation explicitly expandable. In the inspector, put the active equipment
control before lengthy teaching content. Avoid stacking two sticky explanation
cards. Keep the detailed before/after table available, rather than removing it.

**Acceptance:** at both sizes, capture a baseline, open discharge 2 and see
the relevant equipment and changed readings without repeatedly switching
between explanation and operation screens.

Evidence: [phone](practice-stable-390.png), [desktop](practice-stable-1024.png),
[expanded phone inspector](practice-operate-390.png).
Implementation: `src/routes/+page.svelte` practice grid rows and
`.sheet-practice`; `PracticeSummary.svelte`; `DischargeComparison.svelte`.

### 2. P1 — Default framing makes the equipment small and crowded

**Reproduce:** open a clean session, dismiss the tour, inspect Bifurcada.

Most of the vertical drawing area shows unused floors, up to floor 18 on
phone and floor 23 on desktop. The truck, coiled hose, wye, labels and nozzle
cluster near the bottom. The streams extend outside the initial horizontal
view. “Ver todo” exposes the stream reach, but shrinks the equipment further
and shows even more unused floors (up to floor 33 in the phone capture).

This is partly an intentional tradeoff: the current camera maintains readable
floor spacing and leaves headroom for elevation dragging. It is not a claim
that the reach calculation is incorrect. The observed tradeoff is poor for
the first task of identifying and operating equipment.

**Proposed fix:** revise the initial framing around the active lay and its
labels, with explicit access to a full-reach overview. Preserve uniform world
scale and hydraulic dimensions. Reduce irrelevant floor-label density and
make it clear when the stream continues offscreen. Do not resolve this by
silently shortening the stream or changing hose length.

**Acceptance:** the first view makes truck → hose → wye → two nozzles easy
to follow, with readable operating labels; elevation dragging and an honest
full-reach view remain available.

Evidence: [phone default](home-390.png), [desktop default](home-1024.png),
[phone after Ver todo](fit-390.png).
Implementation: `Canvas.svelte` camera/zoom and gauge placement;
`src/lib/geometry/world.ts` viewport filling.

### 3. P2 — The scenario menu is carrying too many different tasks

The menu mixes local saves, autosave status, opening the current exercise,
15 presets, creating a blank lay, sharing/import/export, reset, help and
release information. On phone, sharing and help are below the initial menu
viewport. Practice order is 3, alternate 3, 1, general NFA, 2. Similar entries
such as “Cambia el diámetro” and “Práctica · 1. Diámetro de manguera” do not
explain the difference before opening them. The mobile trigger displays only
the truncated scenario name, so it does not advertise its broader functions.

**Proposed fix:** retain a compact top-level menu with clear groups and open
a dedicated scenario/exercise chooser for the long list. Distinguish
“Tendidas de ejemplo” from “Prácticas guiadas”; order exercises 1–2–3 and
present capacity conditions as variants of exercise 3. Keep save/share and
help reachable without scrolling through the catalog. Use consistent terms
for a whole saved lay versus a branch.

**Acceptance:** a new user can locate practice 1, save a lay and copy its
link without searching through unrelated presets.

Evidence: [phone menu](menu-390.png).
Implementation: `src/routes/+page.svelte` scenario menu and preset ordering.

### 4. P2 — Choosing a truck is presented as editing a long form

The Camión tab leads with a profile selector and “Clonar perfil”, then shows
the built-in configuration in disabled fields. “Aplicar camión a la tendida”
comes after the complete equipment form and explanation. M11-5 adds reference
text and seven outlet rows, making the primary use action particularly distant.
Selecting and applying M11-5 worked at both sizes; the issue is effort and
hierarchy, not a broken application operation.

**Proposed fix:** show a compact read-only profile summary with an adjacent
Apply action and its consequences. Put detailed ports and provenance in
expandable sections. Expose the editable form when cloning. Keep current
applied equipment distinct from the profile being previewed, and preserve
the existing save-versus-apply semantics and approximation label.

Evidence: [top of truck panel](truck-390.png),
[apply action after scrolling](truck-apply-390.png).
Implementation: `TruckPanel.svelte`.

### 5. P2 — Mobile pressure-budget labels lose their meaning

On the default phone view the orange segment reads only “35.7”; in the
second-discharge result it becomes an unlabelled orange segment. Desktop has
enough space to show “Fricción”. The component deliberately drops labels when
they do not fit and retains a `title`, but a touch user has no equivalent
always-visible explanation. This is consequential in a teaching tool whose
purpose includes explaining where pressure goes.

The expanded results do contain a labelled legend; the missing piece is
meaning in the collapsed operating view and a clear invitation to inspect it.
**Proposed fix:** provide a compact labelled legend or explicitly signpost
the existing expanded breakdown, independent of segment width. Retain numeric
proportion in the bar; do not force text into narrow slices.

Evidence: [default phone budget](home-390.png),
[practice phone budget](practice-stable-390.png).
Implementation: `BudgetBar.svelte`, especially `fit()` and compact rendering.

### 6. P2 — Dark-mode action text needs a brighter token

The blue action color remains `#1f6feb` in dark mode. In the inspected
comparison, the 12 px summary text uses that color on `#1b2128`: calculated
contrast is approximately 3.50:1. On the practice header's `#15284a` it is
approximately 3.16:1. Small links are visibly subdued relative to other text.
These are sampled color measurements, not a full accessibility certification.

**Proposed fix:** use a brighter dark-mode text/link accent and separately
check filled-button text. One shared accent need not serve text, borders and
filled backgrounds equally. Review focus visibility alongside the new colors.

Evidence: [dark phone](dark-390.png).
Implementation: `src/lib/styles/app.css` dark tokens and their consumers.

### 7. P2 — The pump lesson initially foregrounds floor arithmetic

The second-discharge dialog asks whether the pump can maintain pressure, then
devotes almost the entire first phone screen to floor dimensions and affected
area. “Comprobar” and “Explorar sin estimar” are below the first screen. The
dimensions are displayed as 18.288 m, reflecting the source's 60 ft, adding
precision to a screen whose immediate teaching goal is pump operation.

**Proposed fix:** lead focused lessons with their prediction and operating
action, and make the area-reference setup secondary when it is unchanged.
Keep estimate-first NFA practice as its own clear flow. Show source conversion
precision in details while preserving exact stored values. Explain that a
blank estimate can still reveal the reference, rather than making users infer
that from optional fields farther down the dialog.

Evidence: [second-discharge dialog](practice-dialog-390.png).
Implementation: `FireFlowPractice.svelte` and lesson-specific presentation.

### 8. P2 — Floating gauges need a clearer connection to their equipment

In Bifurcada, two nozzle gauges sit well above the nozzles with line-name
tags, while other gauges float above the pump/hose. Coiled hoses and flow
captions overlap in the same small region. The labels help, but tracing a
reading to its exact connection remains difficult, especially at phone size
and after fitting the full stream.

**Proposed fix:** add unobtrusive leader lines when gauges are displaced,
and adjust caption collision handling together with the framing work. Keep
line names as well as colors. This addresses an existing roadmap item with
fresh visual evidence.

Evidence: [default desktop](home-1024.png), [fitted phone](fit-390.png).
Implementation: `Canvas.svelte` gauge positioning and caption rendering.

### 9. P3 — Practice entry and control vocabulary look unfinished

The desktop “Práctica NFA · área y caudal” / “Continuar práctica NFA” entry
renders as a thin native gray button, unlike surrounding 44 px controls.
Nozzle pattern options also use different names in parallel controls: the
floating toolbar offers “Directo / Medio / Neblina”, while the inspector
shows “Neblina estrecha” for the middle pattern. The same operation should
use the same vocabulary wherever it appears.

**Proposed fix:** apply the established button styling and target sizing to
the practice entry, and share pattern labels between operating surfaces.
Review spacing/type hierarchy in these recent additions rather than globally
restyling the whole application.

Evidence: [practice entry](home-1024.png),
[parallel nozzle controls](nozzle-1024.png).
Implementation: `+page.svelte` `.practice-entry`; nozzle controls in
`Canvas.svelte` and `NozzleCloseUp.svelte`.

## What works and should be preserved

- Pump pressure and total delivered flow have a strong visual hierarchy.
- Direct nozzle open/close operation works, with a readable state button.
- Settings distinguish scenario changes from browser display preferences.
- The local-save dialog clearly explains storage scope; saving a copy works
  and confirms success. [Screenshot](library-390.png).
- M11-5 is explicitly labelled approximate; applying it worked at both sizes.
- The comparison separates first-line flow, total pump flow and actual
  pressure. That distinction is useful; the problem is where it is placed.
- No horizontal page overflow was observed in the captured main/practice
  states. This does not imply the drawing itself fits or stays visible.

## Proposed information architecture

Keep the canvas and selected-equipment inspector as the core workspace.
Use the following grouping inside navigation rather than adding a large
permanent navigation bar on phones:

| User intent | Proposed home | Contents |
|---|---|---|
| Build or open a lay | Escenario | New lay, example chooser, local saved lays |
| Learn a concept | Prácticas | Ordered focused lessons and their variants; continue current practice |
| Keep/send work | Save/share group | Save copy, copy link, import/export |
| Operate equipment | Selected-item inspector | Hose/nozzle controls; pump discharges, tank, control |
| Choose equipment | Camión within pump inspector | Profile preview/apply; clone/edit separately |
| Change assumptions/display | Ajustes | Existing scenario versus browser-view split |
| Get help | Help group | Tour, sources, novedades |

The first implementation need not create new routes or a navigation framework.
A grouped menu and focused chooser can provide this hierarchy.

## Recommended implementation order

1. Fix practice workspace allocation and inspector ordering (finding 1).
2. Improve default camera framing and gauge/caption relationships (2, 8),
   explicitly preserving world scale and the elevation-drag interaction.
3. Organize the scenario/exercise chooser and focused-lesson entry (3, 7).
4. Simplify truck preview/apply, then address compact budget readability,
   dark colors and control consistency (4, 5, 6, 9).

These are proposed changes; the deferred visual M11-5 pump-panel project is
not required. No new hydraulic laws or blanket redesign are needed.

## Review coverage and limitations

Local Vite app only, with browser requests to external hosts blocked. Used
fresh isolated browser profiles, phone touch emulation at 390×844 and desktop
at 1024×844. Inspected first-run invitation, default canvas, full fit, menu,
settings, hose/nozzle panels, piece tray, pump tabs, truck selection/application,
local saves, practice dialog/reveal/baseline, second-discharge operation, and
dark/reduced-motion practice views. Selected equipment via its accessible
keyboard action as well as clicking ordinary controls. This was not a complete
keyboard, screen-reader or contrast audit.

Completed actions include nozzle close/reopen, saving a local copy, applying
M11-5, capturing practice baseline and opening discharge 2. Opening discharge
2 produced the expected visible 551.5 gpm total and 136.6 psi actual pressure.
The piece tray was inspected; constructing a new lay end to end was not
retested here. Offline installation, real mobile keyboard, Safari, pinch/drag
ergonomics, large text and physical apparatus validation remain outside scope.

Screenshots show actual runtime states, not mock-ups. Transient notification
overlays were allowed to expire for the key practice-layout evidence.
Temporary review scripts are in `/tmp/ui-audit/`; no UI tests were added.

Verification: `pnpm test` passes all 10 test files; `pnpm typecheck` reports
zero errors and zero warnings; `pnpm build` produces the static build.
Only this report and its screenshots are repository changes.
