# Wye vs siamese, and a pump manifold vs the pump's own discharges

Research checked **2026-10-17**. Scope: two related fireground questions —
(1) does splitting a line with a wye/water thief increase supply, and
(2) is a 2.5″-in / 3×2.5″-out manifold on one pump discharge better than
using the pump's other 2.5″ discharges to feed the same or other trucks.
Ends with sketches for four teaching presets. No engine or `MODEL.md` change is
proposed; no preset file is written.

**Rules applied.** Every number names document, edition, page and the date
read. Values stay in the source's units. Each item is **published**,
**derived** (worked from published values) or **not found** (with where I
searched). Training allowances are labelled **convention**.

Context read: `docs/MODEL.md` §2 (solver, tree), §3.1 (hose friction),
§3.7 (velocity), §3.10 (appliances); `docs/ROADMAP.md` §6 (trucks), §7.4
(branching), §7.7 (two pumps); `src/hydraulics/scenario.ts` (what v1 can
represent).

---

## Part A — Wye vs siamese: the device does not create water

### A.1 The terms (people mix them up)

Per TFT's explainer (2023-11-03) and the firefighter-handbook excerpt
(FFSB2020, 2019-12-27), both read 2026-10-17:

| Device | Direction | Job | Basis |
|---|---|---|---|
| **Siamese** | 2+ in → 1 out (converging) | "combine multiple water sources into a single output"; used "to overcome … friction loss in hose lays which need to carry a large flow or cover a long distance" | published |
| **Gated wye** | 1 in → 2 out (diverging) | "split one line into two", gate each outlet | published |
| **Water thief / manifold** | 1 large in → several out (diverging) | "does the opposite of a siamese"; divides one larger source into several smaller ones | published |

So "two lines feeding a triamese" (converging) and "a water thief"
(diverging) are **opposite** devices. The real comparison is:
**1 line → water thief** vs **2–3 lines → siamese/triamese**.

### A.2 The physics

`FL = C·(Q/100)²·(L/100)` (`MODEL.md` §3.1). Two parallel lines each carry
half the flow, so each line's loss is **one quarter** of a single line at the
same total (USDA Forest Service SDTDC, *Friction Loss in Wildland Hose Lays*,
2007, Appendix B — published). In a wye the **supply line still carries the
total Q**, so its loss is unchanged; downstream you only add appliance loss.

Worked comparison for **500 gpm over 300 ft**, C(2.5″)=2, C(3″)=0.8 from the
Colorado chart [E15] (arithmetic **derived**):

| Layout | Friction loss |
|---|---|
| 1 × 2.5″, 300 ft | **150 psi** |
| 1 × 2.5″ split by wye into two branches (same 500 gpm upstream) | **150 psi + wye loss** — no gain |
| 1 × 3″, 300 ft | **60 psi** |
| 2 × 2.5″ parallel, 250 gpm each | **37.5 psi** |
| 3 × 2.5″ parallel, 167 gpm each | **16.7 psi** |

For a smaller load, **250 gpm over 300 ft**: one 2.5″ = **37.5 psi**; two
2.5″ in parallel (125 gpm each) = **9.4 psi**. (derived)

**Reported finding:** a wye distributes; it does not multiply supply. Parallel
lines into a siamese genuinely beat one line + wye for supply, bounded by the
source and the pump/outlets. That is exactly why siamese exist (FFSB2020;
USDA SDTDC 2007).

### A.3 Where each is right

| Use | Device | Why | Basis |
|---|---|---|---|
| Split one source into several **attack** lines at the point of use | gated wye / water thief | distribution, independent gates | published (TFT 2023-11-03; Fire Engineering 1999) |
| One source, several handlines / monitor far from the pumper | water thief / manifold | "extension of the pump panel"; horizontal standpipe | published (Fire Apparatus Magazine 2024-05-01; Fire Engineering 2016-05-01) |
| Move a large flow a long way, or feed one appliance from 2–3 lines | siamese / triamese | parallel lines cut friction ~4× | published (FFSB2020; USDA SDTDC 2007) |
| Split one long supply and **recombine** into a siamese | *(wrong)* | one pipe's worth of water, extra fittings/loss | derived |

### A.4 Open questions

- **Not found:** a manufacturer pressure-loss curve for a **2.5″-in ×
  3×2.5″-out** manifold. TFT's 3-way manifold spec (4″/5″ Storz in) gives the
  waterway and 300 psi rating but no Cv (read 2026-10-17). A 2.5″-in unit is a
  small "dividing breeching"; no fireground Δp–Q chart was located.
- Appliance loss is small next to hose friction at high flow for wyes (USDA
  measured a wildland wye valve at **0.46 psi at 50 gpm**); it is **not**
  negligible for a manifold at several hundred gpm, but no measured curve was
  found.

---

## Part B — A 2.5″-in / 3×2.5″-out manifold on one discharge vs the pump's other discharges

**Status: the user's intuition is correct. Hydraulically, the pump's own
discharges are generally better; the manifold's value is control and
convenience, not capacity — and a 2.5″ inlet cannot feed three 2.5″ outlets.**

### B.1 The 2.5″ inlet is the bottleneck

`v = 0.4085·Q/d²` (`MODEL.md` §3.7; arithmetic **derived**). With a **25 ft/s**
maximum recommended velocity from a check-valve datasheet (Cla-Val Series
501A, p. 2 "maximum recommended velocity: 25 feet per second", read
2026-10-17) as a conservative valve/pipe guideline:

| Inlet | 250 gpm | 400 gpm | 750 gpm | Q at 25 ft/s |
|---|---|---|---|---|
| **2.5″** | 16 ft/s | 26 ft/s | **49 ft/s** | **≈ 382 gpm** |
| 3″ | 11 | 18 | 34 | ≈ 550 |
| 4″ | 8 | 13 | 19 | ≈ 980 |
| 5″ | 6 | 8 | 12 | ≈ 1530 |

Three 2.5″ outlets at their 250-gpm rating would be **750 gpm → ~49 ft/s** in
a 2.5″ inlet: not achievable. A **2.5″-in** manifold is therefore a
**~350–400 gpm device wearing three 2.5″ outlets**.

### B.2 The rating rules say the same thing

| Source | Rule | Basis |
|---|---|---|
| **NFPA 1901 (2016)**, Table 16.7.1 / §16.7.1–16.7.1.2 | outlet ratings: **2.5″ = 250 gpm, 3″ = 375, 4″ = 625, 5″ = 1000, 6″ = 1500** (FAMA lists 6″ = 1440); two 2.5″ minimum at ≥750 gpm | published (read 2026-10-17) |
| **FAMA** *Pump Selection Guide* TC024 (2016-03-25), pp. 12–13 | "The sum of all the discharge ratings … should equal, or exceed, the total pump capacity"; "actual capability … exceeds its ratings"; flow depends on **valve size and plumbing size** | published (read 2026-10-17) |
| Fire Apparatus Magazine, "Apparatus Purchasing: Pump Discharges" (2015-01-08) | a 1,500-gpm pumper is compliant with two 2.5″ (250 each) + one 5″ (1000); "no requirement for a specific or minimum size valve" | published (read 2026-10-17) |
| Fire Engineering, "Moving Water: Relay Operations" (2026-03-01) | a 3″ rear discharge to 5″ LDH "will only … discharge approximately **1,100 gpm at most**" because of piping | published (read 2026-10-17) |

**Consequence (derived):** a manifold does not create rating or water. A
2.5″-in manifold is still **one 250-gpm connection**; to flow a pump's rated
capacity you need several outlets whose ratings sum to it.

### B.3 Why the pump's other discharges win

- **More outlets = less flow per valve/pipe.** Loss ∝ Q², so halving the flow
  through an outlet cuts that path's loss to ~¼ (derived).
- **The pump's total is fixed**, but opening more outlets lowers total system
  resistance, so the operating point moves **out along the pump curve** — you
  approach rated flow (derived; pump curve behaviour `MODEL.md` §3.8).
- One outlet + manifold adds the manifold's own loss and concentrates
  everything through one valve/piping run (derived).

### B.4 What the manifold is actually for

| Use | Source | Why it still exists |
|---|---|---|
| Remote / multi-line control | Fire Apparatus Magazine, "Equipment for Effective Rural Water Supply Operations, Part 2" (2024-05-01) | manifold "acts as an extension of the pump panel hundreds of feet away"; fill sites; horizontal standpipes; several attack lines |
| Tanker fill / shuttle | same; Firehouse forum (2004-08-24, anecdotal) | a **5″** water thief with 4×2.5″ outlets is used to fill tankers, one operator |
| Keep a large outlet free / add lines when outlets are scarce | Fire Engineering (2016-05-01) | manifold at end of LDH leaves the 5″ outlet for a later aerial |
| Feeding several trucks | Fire Apparatus Magazine (2024-05-01) | a **clappered siamese** is often better — it needs **no operator**; a manifold does |

**The tell:** manifolds built to distribute real flow have **large inlets** —
TFT's 3-way valved manifold is **4″ or 5″ Storz in → 3×2.5″ out, 300 psi**
(TFT/WFR spec, read 2026-10-17). A **2.5″-in** unit is a dividing breeching for
handlines, not a truck-supply device.

### B.5 Findings summary (Part B)

| Question | Finding | Status |
|---|---|---|
| Can a 2.5″-in, 3×2.5″-out manifold feed three 2.5″ lines at rating? | No — 2.5″ inlet saturates at ~380 gpm (25 ft/s); 3×250 = 750 gpm → ~49 ft/s | derived |
| Is a manifold better than the pump's other discharges for supply? | No, generally worse hydraulically (single valve/piping bottleneck; added loss) | derived from published ratings + velocity |
| Does a manifold create pump rating? | No; still one 2.5″ = 250-gpm connection | published (NFPA 1901; FAMA) |
| When is a manifold justified? | Convenience/control, remote panel, fill sites, scarce outlets; **large-inlet** manifolds distribute big flow | published (trade sources) |

### B.6 Not found / open

- **Not found:** a published fire-service statement specifically that "a
  manifold on one discharge is worse than using separate discharges." The
  conclusion here is **derived** from NFPA 1901 outlet ratings, FAMA's
  plumbing/valve note, and the velocity limit — not a quoted rule.
- **Not found:** a measured Δp–Q curve for any 2.5″-in 3-outlet manifold.
- The 25 ft/s figure is a valve guideline (Cla-Val), not a fire-hose rule;
  fire hose often runs faster, so treat ~380 gpm as a conservative ceiling,
  not a hard cap.

---

## Part C — Four preset sketches

**Reality check against the current schema** (`src/hydraulics/scenario.ts`,
v1): it supports a **single fixed-pressure source**, a series of sections, a
nozzle, and an optional **diverging** wye (2 or 3 outlets). It does **not**
support **converging** appliances (siamese/triamese), **two sources**,
**multiple pump outlets**, or **pump curves**.

**These are already flagged as pending — not a new gap.** The GGA is planned
"only for general networks (loops, reconverging feeds, siamese feeds) and is
**not implemented now**" (`ROADMAP.md` §7.1; `MODEL.md` §2 "GGA remains
planned"); "siamese feeds remain planned" (`MODEL.md` §3.10); pumps and the
capacity envelope are ⏳ **M3** (`MODEL.md` §3.8); two pumps is `ROADMAP.md`
§7.7; siamese/branching is **M4** (`ROADMAP.md` §7.4). So only preset 1 is a
valid v1 document today; 2–4 are sketches that ride those existing pending
items.

### Preset 1 — "Bifurcada: el wye como distribuidor" (representable now)

One 2.5″ trunk line, a gated wye, two 1¾″ attack lines. Lesson: closing one
branch makes the other gain flow because the shared trunk's friction drops.
This is a variant of the existing `data/presets/bifurcada.json`.

```json
{
  "schema": "simulador-hidraulico/scenario",
  "version": 1,
  "name": "Wye como distribuidor: 2½″ + 2 líneas de 1¾″",
  "methodId": "physical",
  "source": { "kind": "fixed-pressure", "pressurePsi": 180 },
  "sections": [
    { "hoseSizeId": "2-1/2", "diameterIn": 2.5, "frictionCoefficient": 2,
      "lengthM": 60, "endElevationM": 0, "runM": 20 }
  ],
  "nozzle": { "kind": "fixed-orifice", "specId": null, "settingsGpm": [],
    "ratedFlowGpm": 150, "ratedPressurePsi": 100, "pattern": 0.25, "open": true },
  "wye": {
    "branches": [
      { "id": "line-1", "name": "Línea 1", "open": true,
        "sections": [{ "hoseSizeId": "1-3/4", "diameterIn": 1.75,
          "frictionCoefficient": 15.5, "lengthM": 45, "endElevationM": 0, "runM": 15 }],
        "nozzle": { "kind": "fixed-orifice", "specId": null, "settingsGpm": [],
          "ratedFlowGpm": 150, "ratedPressurePsi": 100, "pattern": 0.25, "open": true } },
      { "id": "line-2", "name": "Línea 2", "open": true,
        "sections": [{ "hoseSizeId": "1-3/4", "diameterIn": 1.75,
          "frictionCoefficient": 15.5, "lengthM": 45, "endElevationM": 0, "runM": 15 }],
        "nozzle": { "kind": "fixed-orifice", "specId": null, "settingsGpm": [],
          "ratedFlowGpm": 150, "ratedPressurePsi": 100, "pattern": 0.25, "open": true } }
    ]
  }
}
```
*Numbers illustrative; the solver sets the delivered flow and shows it.*

### Preset 2 — "Wye tramposo: partir y recombinar" (needs siamese + loop)

Pump 2.5″ → 90 m 2.5″ trunk → wye → two 2.5″ branches → **siamese** → monitor.
Lesson: total delivery is no better than the single trunk (150 psi at
500 gpm/300 ft) and slightly worse from the extra appliances; splitting then
recombining does not create water. **Needs:** converging `siamese` link and a
loop-capable solver (GGA), `ROADMAP.md` §7.1/§7.7.

### Preset 3 — "Siamesa: dos líneas en paralelo" (needs two sources / siamese)

Pump → **two** 2.5″ (or 3″) lines → siamese → monitor. Lesson: at 500 gpm over
300 ft, two 2.5″ = 37.5 psi vs one 2.5″ = 150 psi; the operating point moves
out, **bounded by the pump/hydrant**. Ideally A/B against Preset 2 at the same
total flow. **Needs:** two fixed-pressure sources or a pump with two outlets,
plus the converging link.

### Preset 4 — "Manifold vs descargas" (needs multi-outlet pump)

Same pump and total demand, two ways:
- **4a bottleneck:** one 2.5″ discharge → 2.5″-in / 3×2.5″-out manifold → three
  supply lines.
- **4b correct:** the pump's three separate 2.5″ discharges → the same three
  lines.
Show 4a saturating around **~380 gpm** (25 ft/s in the 2.5″ inlet) while 4b
flows the full rated load; both bounded by the pump. **Needs:** a pump with
multiple outlets and a capacity envelope (M3, `MODEL.md` §3.8), i.e. the
`supply` model extended beyond one fixed-pressure outlet.

### Preset status table

| Preset | Represents today? | Needs | Lesson |
|---|---|---|---|
| 1. Wye as distributor | **yes** (v1 JSON above) | — | closing one branch raises the other's flow |
| 2. Wye split-and-recombine | no | siamese (converging) + loop solver | splitting then recombining adds nothing |
| 3. Parallel lines → siamese | no | two sources / two outlets + siamese | parallel lines cut friction ~4×, bounded by source |
| 4. Manifold vs discharges | no | multi-outlet pump + envelope | 2.5″-in manifold saturates ~380 gpm |

---

## Summary

| Item | Status | Best source | Blocks |
|---|---|---|---|
| Wye vs siamese definitions | published | TFT explainer (2023-11-03); FFSB2020 | the teaching framing |
| Wye does not reduce supply friction; parallel lines do (~4×) | published + derived | USDA SDTDC 2007; [E15] C values | presets 1–3 |
| 2.5″ inlet ceiling ~380 gpm (25 ft/s) | derived | `MODEL.md` §3.7; Cla-Val 501A datasheet | preset 4; the "beats the purpose" answer |
| Pump outlet ratings / sum-to-rated rule | published | NFPA 1901 Table 16.7.1; FAMA TC024 | preset 4; why separate discharges win |
| Manifold use = control/remote/fill, not capacity; large-inlet for big flow | published | Fire Apparatus Magazine 2024-05-01, 2015-01-08; TFT manifold spec | presets 1, 4 |
| Measured Δp–Q for a 2.5″-in manifold | not found | — | a sourced manifold loss curve |
| Siamese/triamese support in the engine | already flagged pending | `ROADMAP.md` §7.1/§7.7; `MODEL.md` §2/§3.10; M3/§3.8 | presets 2–4 |

### Cross-cutting gaps

1. No measured loss curve for a 2.5″-in 3-outlet manifold (searched TFT,
   Elkhart, Akron, Fire Apparatus Magazine, 2026-10-17).
2. No published fire-service rule stating "manifold on one discharge is worse";
   the finding is derived from ratings + velocity.
3. Converging appliances (siamese/triamese), multiple sources and pump curves
   are not representable in scenario v1 yet.
