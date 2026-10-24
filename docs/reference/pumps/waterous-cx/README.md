# Waterous CX family curve

Verified 2026-10-25 from Waterous form 810304, revision 2020-06-04:
https://waterousco.com/media/pdfs/810304.pdf
The downloaded original is `810304.pdf` here. It identifies impellers 71888
and 71896, maximum pressure 350 psi and maximum pump-shaft speed 5200 rpm.
This is family data, not an M11-5 acceptance test. No engine gearing is assumed.

## First runtime representation

Digitize the 4000 pump-shaft rpm pressure curve (lower graph), rounded to
whole psi. Approximate read-off accuracy: ±3 psi; linear interpolation is a
simulator choice. Points are in `curve-4000.csv`. The printed curve ends at
1600 gpm / approximately 140 psi. Do not extend it to zero head or beyond
its published flow range.

Other speeds use the [Hydraulic Institute affinity approximation](https://datatool.pumps.org/pump-fundamentals/pump-curves) (constant efficiency assumed): q_ref = q / r,
p(q,N) = r² p_ref(q/r), r = N/4000. This is not a digitization of the other
printed speed curves. The first simulator control range is 2600–4800 shaft
rpm (or stopped at zero); 4800 is our modelling limit, not the published
5200 rpm maximum. No engine power limit, suction limitation, tank plumbing,
cavitation, regulator transient or unit-specific drivetrain is represented.
Intake gauge pressure is assumed zero. Pressure mode is an ideal governor
beneath the selected speed's curve, with no lower-speed regulating limit.

Independent cross-check: F-2115 rev 2022-08-16 p.1 lists 1050 gpm / 200 psi
and 1500 gpm / 150 psi, both at 4000 rpm. Our graph interpolation gives
198.4 and 154 psi respectively; retain the graph's values rather than
silently fitting away the difference between publications. Cross-check
allowance: 5 psi. Source: https://www.waterousco.com/media/pdfs/f2115.pdf

A demanded operating point beyond the sampled curve is unavailable, never a
clamped maximum flow or an invented extrapolation. The UI reports it as
outside the curve. Closed nozzles use the curve's zero-flow head in RPM mode;
pressure mode can hold its requested pressure up to that head.
