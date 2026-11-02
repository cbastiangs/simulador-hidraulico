# M11-5 pump reference

Owner-provided handoff, recorded 2026-10-24. Reference material only; the app
does not read this folder yet. The future truck file (`data/apparatus/*.json`)
will be built from these values in M3, not before.

## Pump

- **Waterous CXVC22C**
- Nominal capacity: **1,500 US gpm** (5,678 L/min)
- Gear ratio: **1:2.27**
- Governor speed: **2,400 rpm**
- Pump mode, impeller and serial: not stated in this handoff.
- Full pump curve: not yet unit-specific. Waterous publishes a **CX family**
  curve, [810304](https://www.waterousco.com/media/pdfs/810304.pdf), with
  constant pump-shaft RPM curves and power curves; it is not confirmed as
  M11-5's tested configuration.

### Recorded plate points

| Flow (US gpm) | Discharge (psi) | Engine rpm |
|---:|---:|---:|
| 1,526 | 150 | 1,657 |
| 1,050 | 200 | 1,807 |
| 752 | 250 | 1,920 |

These are three operating points at **different engine speeds**, not three
points on one fixed-RPM pump curve. Do not interpolate between them as a
single conventional centrifugal curve; they validate rated performance only.
An acceptance test or the exact impeller/curve is still wanted for arbitrary
throttle and flow.

Machine-readable: `pump-rating-points.csv`.

## Discharges and intakes

Owner's layout, 2026-10-24:

- 2 × 1½″ preconnected slots
- 1 × 1½″ front fender line
- 2 × 2½″ discharges on each side (4 total)
- 1 × 6″ intake on each side (2 total)
- 1 × LDH discharge on the right; **4″ or 5″ not yet measured**

That is 8 discharges and 2 intakes. The preconnect positions, valve types and
internal plumbing are not stated. Machine-readable: `outlets.csv`.

## Supply and tank

- On-board water tank: **500 US gal** (1,893 L).
- Provenance: **owner confirmation, 2026-10-30**. This is a direct owner
  statement recorded for M11-5, not a plate or document reading.
- Tank-to-pump line size, usable volume and plumbing losses are still not
  stated; the simulator treats the capacity as an explicit scenario value.

## Still unknown

- Chassis make/model/year for M11-5.
- Exact LDH size, discharge valve sizes, tank-to-pump line and plumbing losses.
- Pump acceptance test or exact Waterous impeller/curve.
- Deck gun, hose loads, nozzle models/settings and lengths.
- Whether the 2½″ side discharges are gated individually and how they share
  the pump capacity.

The 2007 Pierce Dash images in the handoff are illustrative used-truck
photos, not evidence of M11-5's chassis. Do not encode them as unit facts.

## Conflict with the earlier fleet note

`docs/ROADMAP.md` §6 also records a Spartan Metro Star / Darley 1250 gpm
CGBVP fleet pumper from owner memory. That record is **not** evidence for
M11-5: this handoff gives M11-5 a Waterous CXVC22C, 1500 gpm. Keep the two
apparatus records separate until a unit-to-plate mapping is confirmed.
