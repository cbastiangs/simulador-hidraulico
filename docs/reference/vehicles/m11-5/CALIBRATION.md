# M11-5: first representative scenario

Status, 2026-11-06: evidence preparation. The owner approved moving toward
one station truck scenario. M11-5 is the proposed first unit because it has
the strongest existing record. Its actual hose load and calibrated pump
model still require the evidence below.

## Available evidence

| Item | Evidence | What it permits |
|---|---|---|
| Waterous CXVC22C, 1500 US gpm | Owner plate handoff, 2026-10-24; [record](README.md) | Unit identity and three rated points |
| Ratio 1:2.27; governor 2400 rpm | Same handoff | Conditional speed comparison; confirm labels and ratio direction |
| Seven known discharge sizes; eighth LDH 4 or 5 in | [Outlet record](outlets.csv) | Partial layout; no invented LDH size |
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

## Minimum owner handoff

For one first lay: actual discharge used, each hose section's length,
internal diameter and coupling size, and nozzle model plus selector/tip
setting. Confirm the catalog's 100 psi variant matches the unit. Record
hose make/model if known; unmeasured coefficients remain labelled published
teaching assumptions. Station inventory does not establish a truck's load.

For pump validation: an existing acceptance report or exact configuration
curve, unit/serial and impeller identity, intake pressure, speed definitions
and ratio direction. Preserve source conditions and measurement uncertainty.
Use [measurement-record.csv](measurement-record.csv) to transcribe existing
readings, leaving unknowns blank. This is not a pump-testing procedure.
Preserve several flows at one speed where available, without merging speeds.

Exact LDH size is necessary for a complete eight-outlet profile. A first
single-discharge exercise can explicitly omit unused outlets. Unknown
hardware must not silently become an ideal source or a guessed diameter.

## Completion criteria

1. Owner confirms the unit and one actual hose/nozzle arrangement.
2. Identify each scenario value as confirmed, sourced model approximation,
   or unknown. A generic pump remains labelled as such.
3. Resolve speed/pressure definitions; adopt a supported unit-specific curve
   in MODEL before changing the engine. Preserve measured points separately
   from fits, with the supported domain and uncertainty.
4. Compare predicted and documented readings with source-justified tolerance.
   Reserve independent readings for validation where available: fitting the
   plate is not independent validation.
5. Verify scenario save/share and phone/desktop controls.

No station calibration is claimed. Generic exercises remain the operating
examples until the required handoff is complete.
