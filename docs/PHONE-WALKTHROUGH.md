# Real-phone walkthrough

> Deferred by the owner, 2026-10-29. Keep this checklist for later feedback;
> it is not currently a prerequisite for further development. Browser checks
> at phone-sized viewports are complete; this real-device review is not.

About 15–20 minutes. Use your normal phone and browser, starting in portrait.
This is a manual usability checklist, separate from **Ver recorrido**, the
in-app guided tour. No console, scripts or exact hydraulic calculations are
needed. Mark each step **OK**, **awkward**, **failed** or **skipped**. If you
cannot find a control, report that too; do not spend time trying to work
around it.

Use a build with **Camión** in the pump panel and unit choices in
**Ajustes → Vista**. Record the URL and date below so we know which build you
tested. If either feature is missing, report it before proceeding.

The **Escenario** menu is the scenario name at the top. Before choosing a
preset, save anything you want to keep using **Escenario → Mis líneas… →
Guardar copia**. Testing profiles and saved lines uses this browser's local
storage.

## 1. Find your way around

- Open **Escenario → Línea básica: 30 m de 1½″**.
- Tap the hose, the nozzle and the pump in turn. Expand and collapse the
  lower panel using its arrow. Return to the drawing.
- **Expected:** the selected item is clear, its controls are reachable and
  you can get back to the canvas without losing your place. No sideways page
  scrolling or clipped controls.
- **Report:** any missed taps, unclear selection, unexpected movement or
  controls hidden beneath the panel.

## 2. Type and step values

- Select the hose. Type **45** in **Largo** with metres selected, then use
  its **+** and **−** buttons. Dismiss the phone keyboard.
- Select the pump. Change pressure with the step buttons and by typing.
  Try **Deshacer** once.
- **Expected:** the keyboard leaves the active field accessible; values and
  readings update; undo restores the previous edit. Merely selecting an
  item should not alter it.
- **Report:** keyboard interference, hard-to-read digits, lost focus or
  changes that feel delayed. Exact pressure/flow results are not required.

## 3. Operate a nozzle and move the view

- Open **Escenario → Gira el selector**. Select the nozzle.
- Close and reopen its handle. Lower the ring setting, then raise it again.
  Try both the drawn controls and **Ver controles simples**.
- Collapse the panel. Pan and pinch-zoom the drawing, then tap **Ver todo**.
- **Expected:** closing stops this line's flow; reopening restores it. Ring
  changes keep the selected setting clear in either control style. Panning
  and zooming should not accidentally move equipment.
- **Report:** which control style was easier, accidental actions, animation
  stutter or difficulty recovering the view.

## 4. Switch display units

- Open **Ajustes → Vista**. Select **bar**, **L/min** and **ft**, then **Listo**.
- Look at the pump, gauges and hose labels. Select the hose and inspect its
  length/height controls. Try typing a length in feet.
- Switch back to **psi**, **US gpm** and **m** before the next step.
- **Expected:** values and unit labels change together. Switching units
  alone does not alter the lay. A value you edited in feet is converted
  back when you return to metres. Formula explanations and engraved
  equipment markings explicitly keep their original units.
- **Report:** any ambiguous unit, clipped reading or value that appears to
  change the physical setup merely because you changed units.

## 5. Operate and connect another discharge

- Open **Escenario → Abre la segunda descarga**. Select the pump and open
  **Descargas**. Open and close **Descarga 2**, watching both line readings.
- Collapse the panel. Open **+ Piezas**, pick a hose, and connect it to the
  empty third discharge. Open that discharge and inspect its line.
- **Expected:** each gate operates its own line; the common pump responds
  to the changed demand. You can identify the empty outlet and attach a
  hose without confusing it with another line.
- **Report:** anything unclear about where to tap, which line is selected
  or which reading belongs to which outlet.

## 6. Clone and apply a truck profile

- Select the pump → **Camión → Clonar perfil**.
- Name it **Phone test truck**, choose **4** discharges, rename the first
  outlet, choose **Waterous CX**, and enter **750** US gal tank capacity.
- Tap **Guardar perfil**. Then tap **Aplicar camión a la tendida**.
- **Expected:** saving alone leaves the lay unchanged. Applying preserves
  the existing connected lines, adds the extra empty outlet closed, and
  starts the configured tank full. The applied truck name is visible.
- **Report:** difficulty finding save/apply, confusing effects, or fields
  obscured by the keyboard.

## 7. Run and pause the tank clock

- In **Tanque**, tap **Iniciar reloj** while at least one line is flowing.
  Wait about ten seconds and tap **Pausar reloj**, then **Rellenar tanque**.
- Start the clock again, switch briefly to another app, then return.
- **Expected:** remaining water falls while running and flowing, refill
  restores the configured capacity, and switching away pauses the clock.
  Returning should not restart it automatically.
- **Report:** unclear running/paused state, unreadable remaining water or
  sluggish response.

## 8. Save, reopen and rotate

- Use **Escenario → Mis líneas…** to save a copy named **Phone test**.
- Open a different preset, then return through **Mis líneas… → Abrir Phone
  test**. Reload the browser page once.
- Rotate to landscape and back to portrait. Inspect the pump and a hose.
- **Expected:** the saved truck, lines and equipment values return; the
  clock remains paused. Rotation leaves controls and readings accessible.
- **Report:** missing data, unexpected clock activity, broken layout or
  difficulty reopening the saved copy.

## 9. Reopen offline (optional, about two minutes)

- While online, open **Escenario** and wait for **Listo para abrir sin
  conexión** or **Instalado · listo sin conexión**.
- If it says **Modo desarrollo · sin caché offline**, skip this step. If it
  requests HTTPS, report the message and skip; a phone opening a local
  development URL cannot prove offline support.
- Close the simulator tab. Turn off Wi-Fi and mobile data, then reopen the
  **same URL in the same browser**, or use its installed home-screen icon.
- Open **Mis líneas… → Phone test** and change pump pressure. Reconnect
  when finished.
- **Expected:** the app and saved lay open, calculations respond, and the
  clock stays paused. External reference links need a connection.
- **Report:** how you reopened it, the offline status shown before closing,
  and any blank screen or missing saved data.

## Send back your results

Copy this into chat. Brief notes are enough; screenshots or a short recording
are especially useful for layout, tapping or animation problems. For an
issue, include the step number and the last few taps that produced it.

```text
Phone model:
OS and browser (version if known):
URL tested:
Date:
Opened in: browser tab / home-screen app
Text size or browser zoom, if changed from default:

1. Navigation: OK / awkward / failed / skipped —
2. Typing and stepping: ...
3. Nozzle and canvas: ...
4. Units: ...
5. Discharges and hose placement: ...
6. Truck profile: ...
7. Tank clock: ...
8. Save/reopen/rotation: ...
9. Offline: ...

Most frustrating thing:
Preferred nozzle controls: drawn / simple

Issue (repeat if needed):
Step number and last few taps:
Expected:
Actually happened:
Screenshot/recording, if available:
```
