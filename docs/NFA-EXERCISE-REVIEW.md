# First NFA exercise verification

2026-10-29. Implements the owner's next step after the quality baseline.
Entry: Escenario → Práctica NFA · área y caudal (authored example), or
Abrir práctica de esta tendida (attach an exercise with no automatic assignments).

## Verified behavior

Browser workflow at 390×844 and 1024×844:

- Estimate/reveal, retry and exploration; reference and coverage are absent
  before reveal. Changing area/involvement resets the exercise; assignment
  and equipment edits retain revealed arithmetic. Reload hides the answer.
- The published 40×30 ft floor gives 100 gpm at 25%, 400 at 100%, and zero
  demand at 0%, with no division-by-zero coverage. Guesses leave the solve
  unchanged; estimation error is separate from delivery shortfall.
- Switching to feet and L/min preserves facts and shows 40 ft and 378.5 L/min.
- Diameter edits preserve nozzle/source and show 100.6 → 110.7 gpm. Undo
  restores the previous delivery and exercise in one history.
- Two 100 gpm branches compare as 200, not 400 including the shared feed;
  deselecting one compares 100. Closed/isolated branches contribute zero.
  Empty supply gives zero; out-of-curve delivery withholds comparison.
  Open ends are ineligible. Roles do not manufacture flow from a closed backup.
- Local save/open and export preserve assignments and roles at both sizes.
  Desktop checks also cover nozzle replacement/removal clearing assignments,
  undo restoring them, and hose splitting retaining the terminal assignment.
- Compressed share link and file export/import round trips preserve the full
  document. Duplicate/missing assignments, negative dimensions and unknown
  document versions are rejected. An invalid file does not overwrite work.
- Existing bare links and an existing local library reopen. An exercise
  reopens and calculates offline after the production service worker is ready.

Temporary browser scripts and captures: `/tmp/nfa-review/`. Inspected
`practice-390.png`, `practice-1024.png` and comparison screenshots. The first
visual review caught cramped dimension inputs; fields were widened and floor
labels now show the published example's exact metric dimensions. No repository
UI tests were added. Existing engine/source tests remain the numerical suite.

The first development-browser attempt was interrupted by regenerated build
files; final interaction checks used the static production build. The initial
plain HTTP server did not resolve `/boquillas` to its prerendered HTML, preventing
service-worker installation; offline verification passed with Vite preview.

`pnpm test`, `pnpm typecheck` and `pnpm build` pass. Real-device/instructor
feedback remains deferred. Spatial routes, dimension dragging, multiple floors,
a larger preset catalog and thermal outcomes are outside this first delivery.

## Live summary and focused exercises (2026-11-06)

The canvas summary and practice dialog consume the same derived comparison
and session reveal state. Opening another document, retry and floor edits hide
both; equipment edits, unit changes and selection retain reveal. A dedicated
practice load counter avoids resetting answers when reconnecting a pump outlet
only resets the canvas. At full height the phone inspector contains a sticky
compact summary; the covered canvas copy is inert.

The three new documents use the existing sourced friction/nozzle/pump laws:

| Exercise | Fixed equipment and one change | Reference | Solved delivery before → after |
|---|---|---|---|
| Diámetro de manguera | 60 m, ideal 125 psi, generic 150 gpm @ 100 psi nozzle; 1½″ C=24 → 2½″ C=2 | 150 gpm: 40×30 ft, 37.5% | 116.7609 → 160.7369 gpm |
| Capacidad del pitón | 30 m 2½″, ideal 125 psi, catalog TFT G-Force GF3C2S; selector 60 → 125 gpm @ 100 psi | 125 gpm: 40×30 ft, 31.25% | 66.8456 → 137.6533 gpm |
| Segunda descarga | Existing generic second-discharge lay: CX family at 3200 shaft rpm, request 140 psi; open second assigned outlet | 600 gpm: 60×60 ft, 50% | 279.1310 → 551.4654 gpm total |

In the third exercise pressure falls from 140 to 136.6119 psi and the first
line falls to 275.7327 gpm. Both terminals are explicitly assigned; the closed
backup initially contributes zero. These inputs are teaching arrangements,
not station apparatus calibration. See MODEL §3.3–3.5 and the existing CX
reference. No new physical law or numerical test duplicates were added.

An optional, validated exercise.lessonId retains the question/action prompt
through document parsing and sharing, with no schema-version change. The
three IDs are diameter, nozzle-capacity and second-discharge; absent retains
the original general exercise. Unknown IDs are rejected.

Browser verification at 390×844 and 1024×844 covers all three equipment
changes, shared hidden/revealed state, retry, floor edits, unit switching,
undo, reload, unassigned lines, closed/isolated lines, empty tank, unavailable
pump output, and compressed share links preserving the prompt while hiding
the answer on load. The summary labels a reference surplus without a tactical
verdict. Tests, typecheck and static build pass; no page errors or horizontal
overflow in the interaction sweep. Local-only browser scripts and screenshots:
`/tmp/live-practice/` (browser.mjs, states.mjs, capture.mjs, arithmetic.json).
