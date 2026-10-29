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
