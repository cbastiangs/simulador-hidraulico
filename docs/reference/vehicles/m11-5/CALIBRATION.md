# M11-5: first representative scenario

Status, 2026-11-06: evidence preparation. The owner approved moving toward
one station truck scenario. M11-5 is the proposed first unit because it has
the strongest existing record. The owner narrowed scope to pump and ports
on 2026-11-06 and confirmed the corrected layout. Hose/nozzle loads are not
required for this scope. Pump calibration still requires the evidence below.

## Available evidence

| Item | Evidence | What it permits |
|---|---|---|
| Waterous CXVC22C, 1500 US gpm | Owner plate handoff, 2026-10-24; [record](README.md) | Unit identity and three rated points |
| Ratio 1:2.27; governor 2400 rpm | Same handoff | Conditional speed comparison; confirm labels and ratio direction |
| Seven discharges including 4 in LDH; three intakes | [Outlet record](outlets.csv), owner correction 2026-11-06 | Confirmed port counts, locations and nominal sizes |
| 500 US gal tank | Owner confirmation, 2026-10-30 | Nominal capacity; usable volume and plumbing losses unknown |
| Akron 1723P, Protek 368, MAFCO SS402 | Station inventory in [catalog](../../../../data/catalog/nozzles.csv); MODEL §3.5 | Sourced nozzle laws; assignment to M11-5 unknown |
| CX family curve | [Stored source](../../pumps/waterous-cx/README.md) | Generic model, not unit-specific acceptance data |

The earlier Spartan/Darley fleet description is not evidence for this unit.
Coupling size does not establish hose internal diameter. A published training
coefficient does not establish the measured loss of the station's hose.

## Conditional engine comparison

Run `node scripts/audit-m11-5.mjs` from the repository root. It reads the
plate CSV and uses existing engine scaling/interpolation without fitting or
changing runtime data. Each row uses its own recorded speed; never join the
three rows into one fixed-speed curve.

Assume shaft rpm = engine rpm × 2.27. For comparison only, recorded discharge
pressure is compared directly with model net pressure. Intake pressure is
unknown, so these differences are not calibration residuals.

| Plate gpm | Plate psi | Engine rpm | Conditional shaft rpm | Model psi | Model minus plate |
|---:|---:|---:|---:|---:|---:|
| 1526 | 150 | 1657 | 3761.39 | unavailable | outside flow domain, ending at 1504.556 gpm |
| 1050 | 200 | 1807 | 4101.89 | 210.611 | +10.611 psi |
| 752 | 250 | 1920 | 4358.40 | 253.397 | +3.397 psi |

If 2400 rpm is engine speed and that ratio applies, it implies 5448 shaft
rpm: above the simulator's 4800 rpm ceiling and the stored family
publication's 5200 rpm maximum. Resolve the recorded labels/configuration;
do not raise model limits from this inference. This is not a finding about
actual apparatus operation. The graph's approximately ±3 psi digitization
accuracy is not an acceptance tolerance for this truck.

Owner clarification, 2026-11-06: 2400 rpm was probably the governor's
displayed reading. Its speed basis and whether it represents a limit are
unknown. Retain the calculation above as conditional only; do not adopt
2400 as either an engine-speed limit or a shaft-speed setting. A governor
model/manual or labelled display record could resolve the speed basis.

## Minimum owner handoff

Port layout is confirmed: front bumper 1½″, two 1½″ crosslays, two pilot-side
2½″ discharges and copilot-side 2½″ and 4″ LDH discharges; pilot-side 6″ and
2½″ intakes and copilot-side 6″ intake. Hose/nozzle arrangements are deferred
by the owner and are not a prerequisite for pump/port work.

For pump validation: an existing acceptance report or exact configuration
curve, unit/serial and impeller identity, intake pressure, speed definitions
and ratio direction. Preserve source conditions and measurement uncertainty.
Use [measurement-record.csv](measurement-record.csv) to transcribe existing
readings, leaving unknowns blank. This is not a pump-testing procedure.
Preserve several flows at one speed where available, without merging speeds.

The earlier eight-discharge layout and unresolved LDH size are superseded.
Intake sizes are inventory facts; their supply pressures and internal losses
are unknown. Do not model these intakes as discharges or infer a supply law
from their nominal sizes.

## Completion criteria

1. Confirm the unit's port layout: complete, owner correction 2026-11-06.
2. Identify each scenario value as confirmed, sourced model approximation,
   or unknown. A generic pump remains labelled as such.
3. Resolve speed/pressure definitions; adopt a supported unit-specific curve
   in MODEL before changing the engine. Preserve measured points separately
   from fits, with the supported domain and uncertainty.
4. Compare predicted and documented readings with source-justified tolerance.
   Reserve independent readings for validation where available: fitting the
   plate is not independent validation.
5. Verify scenario save/share and phone/desktop controls.

No station calibration is claimed. The owner approved proceeding with the
confirmed ports and the labelled CX approximation. The built-in
`data/apparatus/m11-5.json` now provides seven discharges and the 500 US gal
tank; the three intakes remain reference-only. It starts in pressure mode
at 4000 shaft rpm, a teaching default independent of the 2400 rpm reading.
Applying keeps existing lines by outlet order and closes newly added outlets;
no hose/nozzle load is claimed. Calibration criteria above remain pending.

Verification: `pnpm test`, `pnpm typecheck` and `pnpm build` pass. Local
browser checks at 390×844 and 1024×844 verify applying the seven sizes,
preserving the existing line/requested pressure, closing new gates, the
full 500-gallon tank, the exact CX curve snapshot, clone/save and shared
scenario reopening with the approximation label. No page errors or page
horizontal overflow occurred. Screenshots were inspected at both sizes;
temporary checks and images are in `/tmp/m11-5/`. Profile diameter counts
also match the owner-confirmed outlet CSV. These checks establish software
behavior, not apparatus calibration.
