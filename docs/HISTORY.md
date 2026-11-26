# Pre-release history (2026-10-11 → 2026-11-02)

A subject-based skeleton of how the simulator grew before the first published
release (`2026.11.26`). It is for internal use: onboarding, training, a future
public changelog, or a source of Spanish release-note copy. It is not part of
`data/releases.json`; the app does not read it.

**Method.** Derived from the 75 `feat`/`fix` subjects between 2026-10-11 and
2026-11-02, plus the existing `Novedad:` trailers. The Spanish lines are
candidate copy, not verified against every screen; read the diffs before
publishing them. Internal work (docs, tests, refactors, engine-only work such
as the absorption reference) is omitted.

The gap this fills is October only. Nov 6–26 already appears in the first
release, and 2026-11-02 itself added the release-notes machinery.

## Before the first screen (2026-10-11)

The hydraulics engine and the design documents were extracted from `fd-app`.
No user-facing line; this is the foundation the milestones below build on.

## 2026-10-14 — First working app

The engine, the scenario document and the first screen.

- La tendida se dibuja de lado, con manómetros y el cálculo de cada tramo.
- Puedes editar mangueras, alturas, el pitón y la bomba, y agregar o quitar tramos.
- El pitón se opera con su manija y su anillo de caudal.
- El dibujo ocupa la pantalla y cada manguera tiene su largo y diámetro.

## 2026-10-15 — Phone, editing and the pressure split

The phone layout, on-canvas editing, undo/redo and the power breakdown.

- Puedes usar el simulador en el teléfono: la tendida se mueve con el dedo y los controles están en una hoja inferior.
- Tocar una unión permite insertar, dividir, unir o quitar mangueras, con Deshacer y Rehacer.
- La vista de potencias muestra cómo se reparte la presión de la bomba en la tendida.
- Los accesorios de las uniones se consideran en el cálculo.

## 2026-10-16 — One pump panel, methods and floors

The pump edited in one place, method selection, and the floor display.

- La bomba se edita en un solo panel, siempre a la vista.
- Puedes elegir y comparar métodos de cálculo, empezar una línea en blanco y cambiar la altura de cada piso.
- Los pisos se ven como un eje de altura y los manómetros flotan junto a la tendida.

## 2026-10-17 — Branched lays and the nozzle close-up

Wyes and gated branches, the nozzle operated like the real one, and stream
reaction.

- Puedes armar tendidas bifurcadas con bifurcos y ramales, y operar sus válvulas.
- El pitón se abre en un primer plano con manija, anillo de caudal y collarín de patrón.
- Cada chorro muestra su reacción y el reparto de potencia de la tendida.
- Las líneas de una bifurcación se dibujan en carriles, cada una con sus manómetros.

## 2026-10-18 — Tour, ideal pressure and editing everywhere

The welcome tour, the ideal-pressure reading and removal from every control.

- Un recorrido inicial explica mover, acercar y ver todo, y cómo cerrar el pitón.
- La presión ideal se marca en el manómetro de la bomba y se ajusta con un toque.
- Puedes quitar cualquier pieza desde su propia barra o desde la × del teléfono.

## 2026-10-19 — Real nozzle catalog and sharing

The researched catalog, per-model drawings, share links and station-style
floor numbering.

- Puedes elegir entre más de 40 pitones y monitores reales, con datos publicados.
- Cada pitón se dibuja y se opera según su propio modelo.
- Copia un enlace y comparte la tendida completa; al abrirlo se reconstruye.
- Los pisos se numeran como en la estación: la calle es el piso 1.

## 2026-10-24 — Reach and line states

Published reach curves and clearer diagnoses for unbalanced or isolated lines.

- Los pitones con datos del fabricante muestran su alcance medido.
- La app distingue una tendida desbalanceada o aislada y explica por qué no entrega.

## 2026-10-25 — Real pump and nozzles in the solver

The Waterous CX pump model and the researched nozzles reach the calculation.

- Puedes usar la bomba Waterous CX y pitones reales en la tendida.
- La curva de la bomba y los caudales del pitón salen de datos publicados.

## 2026-10-26 — Trucks and multiple discharges

Configurable trucks and a pump feeding more than one line.

- Puedes elegir un camión, editarlo y guardar tu propio perfil.
- Una bomba con varias descargas alimenta varias líneas a la vez.
- Cada descarga se abre o se cierra por separado.

## 2026-10-29 — NFA practice and display units

The NFA exercise, selectable units and the hydraulic interface pass.

- La práctica NFA compara el caudal requerido con el que entrega la tendida.
- Puedes ver presiones y caudales en bar, L/min, psi o gpm según tu preferencia.
- La interfaz hidráulica se revisó para que las lecturas y los controles se entiendan mejor.

## 2026-11-02 — Novedades

- La app incorpora Novedades y versiones para contarte qué cambia en cada entrega.

## Why this is a document and not release entries

`UX.md` §8.6 and `ROADMAP.md` decided the catalog starts on 2026-11-02 and goes
forward only. Published entries are also shown to users who have not read them,
so backfilled October “versions” would appear as old news under “Novedades de
esta versión”. Keep this archive out of `data/releases.json`; if it ever needs
an in-app home, give it its own history page instead of the release dialog.
