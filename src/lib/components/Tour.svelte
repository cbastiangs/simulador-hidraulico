<script module lang="ts">
  const SEEN = "tour.seen";

  /** Whether this browser has seen (or skipped) the welcome tour; unreadable storage counts as not seen. */
  export function tourSeen() {
    try {
      return localStorage.getItem(SEEN) === "1";
    } catch {
      return false;
    }
  }
</script>

<script lang="ts">
  import { driver, type Driver, type PopoverDOM } from "driver.js";
  import { onDestroy } from "svelte";
  import type { Scenario, ScenarioBranch } from "$hydraulics/scenario.ts";
  import type { Selection } from "$lib/selection.ts";

  // The welcome tour (UX.md §8.4). Steps point at kinds of things, found by
  // their `data-tour` mark, so the tour runs on whatever lay is open; a step
  // whose target the lay lacks is skipped. Action steps move on when the
  // scenario or the selection shows the person did it. Driver.js draws the
  // dimmed stage and the popover; its stylesheet is not used, since it turns
  // off pointer events on the page, and the page stays usable throughout.
  let {
    running,
    phone,
    scenario,
    selection,
    onFit,
    onDeselect,
    onMenu,
    onEnd,
  }: {
    running: boolean;
    phone: boolean;
    scenario: Scenario;
    selection: Selection | null;
    /** Show the whole lay ("Ver todo"). */
    onFit: () => void;
    /** Clear the selection; on a phone this also closes the sheet. */
    onDeselect: () => void;
    /** Open or close the header's Escenario menu (a phone's last step points at an item inside it). */
    onMenu: (open: boolean) => void;
    onEnd: () => void;
  } = $props();

  type Segment = Pick<ScenarioBranch, "sections" | "nozzle" | "wye">;
  const leaves = (s: Segment): Segment[] => (s.wye ? s.wye.branches.flatMap(leaves) : [s]);
  /** Nozzles with a bale that are open: what steps 3 and 4 count. */
  const openBales = (s: Scenario) => leaves(s).filter((l) => l.nozzle.design !== "open-end" && l.nozzle.open).length;
  const hasBale = (s: Scenario) => leaves(s).some((l) => l.nozzle.design !== "open-end");
  /** Every coupling's place: changes when anything is moved. */
  const geometry = (s: Segment): string =>
    s.sections.map((x) => `${x.endElevationM}/${x.runM ?? ""}`).join(",") + (s.wye ? `[${s.wye.branches.map(geometry).join("|")}]` : "");

  /** Laid out, and not in a closed sheet. */
  function shown(el: Element) {
    const r = el.getBoundingClientRect();
    return !el.closest("[inert]") && r.width + r.height > 0;
  }
  const onScreen = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  };
  /** The marked element in view, else one the page can scroll to (Driver.js scrolls it in). */
  function find(mark: string) {
    const all = [...document.querySelectorAll(`[data-tour="${mark}"]`)].filter(shown);
    return all.find(onScreen) ?? all[0] ?? null;
  }

  /** The lever drawn on the edited line's nozzle: a click target on a mouse screen. */
  const baleOnCanvas = () => [...document.querySelectorAll('[data-tour="nozzle"] .bale')].find(shown) ?? null;

  type Step = {
    title: string;
    text: () => string;
    /** Null: a card in the middle of the screen. */
    target: () => Element | null;
    /** Runs once as the step opens: frame the lay, close the sheet. */
    enter?: () => void;
    /** Moves on by itself once this holds; otherwise the popover has a button. */
    done?: () => boolean;
    /** Left out when the lay has nothing for it. */
    applies?: () => boolean;
    button?: string;
  };

  // What the person had when the step opened, for the action steps to compare against.
  let start: { open: number; geometry: string; selection: Selection | null } = { open: 0, geometry: "", selection: null };
  const branched = $derived(!!scenario.wye);

  const steps: Step[] = [
    {
      title: "Simulador hidráulico",
      text: () => "Cambias el tendido y la bomba; el caudal lo calcula la física. Un minuto.",
      target: () => null,
      button: "Empezar",
    },
    {
      title: "El tendido",
      text: () => "De lado: bomba → mangueras → pitones. Las líneas grises son los pisos.",
      target: () => find("canvas"),
      enter: () => (onDeselect(), onFit()),
    },
    {
      title: "Moverse por el dibujo",
      text: () =>
        phone
          ? "Un dedo arrastra el dibujo; dos dedos lo acercan o alejan (pellizco). «Ver todo» lo muestra completo."
          : "Arrastra el fondo para moverlo; la rueda del ratón acerca o aleja. «Ver todo» lo muestra completo.",
      // A card in the empty building above the lay, not a highlight: it covers neither the lay nor the
      // buttons it names (− + Ver todo), and the person may try the gestures before going on.
      target: () => null,
    },
    {
      title: "La bomba",
      text: () => "Su presión: súbela o bájala. «Ideal» marca la que pide el pitón; tócala para ponerla.",
      target: () => find("pump"),
    },
    {
      title: "Cerrar un pitón",
      // Wide: the drawn lever, clicked in place. Phone: the lever is too small to aim at (§8.1), so the
      // nozzle is selected first and its panel's button is the target.
      text: () =>
        !phone
          ? "Haz clic en la manija, la palanca sobre el pitón, para cerrarlo."
          : selection?.kind === "nozzle"
            ? "Ahora toca «Abierta», en el panel, para cerrar la manija."
            : "Toca el pitón para seleccionarlo.",
      target: () => (phone ? (selection?.kind === "nozzle" ? find("manija") : find("nozzle")) : baleOnCanvas() ?? find("nozzle")),
      enter: () => (onDeselect(), onFit()),
      done: () => openBales(scenario) < start.open,
      applies: () => hasBale(scenario),
    },
    {
      title: "Caudal",
      text: () =>
        branched
          ? "Bajó el caudal total, y la otra línea recibe un poco más: comparten la bomba. Ábrelo otra vez."
          : "Sin caudal no hay fricción: la bomba solo sostiene la altura. Ábrelo otra vez.",
      target: () => find("pump"),
      done: () => openBales(scenario) > start.open,
      applies: () => hasBale(scenario),
    },
    {
      title: "Mover",
      text: () => "Arrastra esta pieza a otro piso: subir cuesta presión.",
      target: () => find("coupling") ?? find("nozzle-handle"),
      enter: () => (onDeselect(), onFit()),
      done: () => geometry(scenario) !== start.geometry,
    },
    {
      title: "Mangueras",
      text: () => `Toca una manguera para cambiar diámetro o largo. ${phone ? "Mantén pulsado" : "Clic derecho"} para más.`,
      target: () => find("hose"),
      // Closes the dragged hose's toolbar, which would cover the lay.
      enter: () => (onDeselect(), onFit()),
      // A new selection: dragging a coupling, the step before, already selects its hose.
      done: () => selection?.kind === "section" && selection !== start.selection,
    },
    {
      title: "Dónde se gasta la presión",
      text: () => "En el pitón, en la fricción de las mangueras y en la altura.",
      target: () => find("budget"),
      enter: () => onDeselect(),
    },
    {
      title: "Volver a verlo",
      // The control itself: "?" when wide; on a phone the menu opens and "Ver recorrido" is the target.
      text: () =>
        phone
          ? "Para repetir el recorrido: «Ver recorrido», al final de este menú. Aquí también están los otros tendidos, copiar y pegar."
          : "Para repetir el recorrido, pulsa «?». Otros tendidos, y copiar o pegar el tuyo, están en Escenario.",
      target: () => find(phone ? "help-item" : "help"),
      enter: () => phone && onMenu(true),
      button: "Listo",
    },
  ];

  let tour: Driver | null = null;
  let order: number[] = [];
  let at = $state(-1);
  let pointed: Element | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;

  function begin() {
    order = steps.flatMap((s, i) => (s.applies?.() ?? true ? [i] : []));
    tour = driver({
      animate: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      allowClose: true,
      overlayClickBehavior: () => {},
      overlayOpacity: 0.45,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: "tour",
      onDestroyed: finish,
    });
    // Follows the camera and the sheet: the target moves, or is drawn anew, without a scroll or resize.
    timer = setInterval(() => {
      if (!tour || at < 0) return;
      const target = steps[order[at]].target();
      if (target !== pointed) show();
      else tour.refresh();
    }, 120);
    go(0);
  }

  function go(n: number) {
    if (n >= order.length) return void tour?.destroy();
    at = n;
    const step = steps[order[n]];
    step.enter?.();
    start = { open: openBales(scenario), geometry: geometry(scenario), selection };
    // The canvas reframes on the next frame; point once it has.
    requestAnimationFrame(() => requestAnimationFrame(show));
  }

  function show() {
    if (!tour || at < 0) return;
    const step = steps[order[at]];
    const target = step.target();
    pointed = target;
    const counted = order[0] === 0 ? order.length - 1 : order.length;
    tour.highlight({
      element: target ?? undefined,
      popover: {
        title: step.title,
        description: step.text(),
        showButtons: step.done ? [] : ["next"],
        nextBtnText: step.button ?? "Siguiente",
        showProgress: true,
        progressText: order[at] === 0 ? "" : `${order[0] === 0 ? at : at + 1} de ${counted}`,
        onNextClick: () => go(at + 1),
        onPopoverRender: (popover: PopoverDOM) => {
          if (order[at] === steps.length - 1) return;
          const skip = document.createElement("button");
          skip.type = "button";
          skip.className = "driver-popover-footer-btn tour-skip";
          skip.textContent = order[at] === 0 ? "Ahora no" : "Saltar";
          skip.onclick = () => tour?.destroy();
          // Last in the DOM, first on screen: focus lands on the step's own button.
          popover.footerButtons.append(skip);
        },
      },
    });
  }

  function finish() {
    clearInterval(timer);
    tour = null;
    at = -1;
    pointed = null;
    onMenu(false);
    try {
      localStorage.setItem(SEEN, "1");
    } catch {}
    onEnd();
  }

  // An action step moves on once the scenario or the selection shows it was done.
  $effect(() => {
    void scenario;
    void selection;
    if (at < 0) return;
    const step = steps[order[at]];
    if (step.done?.()) go(at + 1);
    else if (step.done) requestAnimationFrame(show);
  });

  $effect(() => {
    if (running && !tour) begin();
    if (!running && tour) tour.destroy();
  });

  onDestroy(() => {
    clearInterval(timer);
    tour?.destroy();
  });
</script>

<style>
  /* Driver.js's own sheet disables the page's pointer events; this keeps only its look, in the app's tokens. */
  :global(.driver-overlay),
  :global(.driver-overlay path) { pointer-events: none !important; }
  :global(.driver-popover.tour) {
    all: unset;
    position: fixed;
    top: 0;
    right: 0;
    /* Above Driver.js's overlay, which sets z-index 10000 inline. */
    z-index: 10001;
    box-sizing: border-box;
    width: min(320px, calc(100vw - 32px));
    padding: 16px;
    border-radius: 12px;
    background: var(--surface);
    color: var(--ink);
    font: 15px/1.45 system-ui, sans-serif;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  :global(.tour .driver-popover-title) { display: block; margin: 0 0 4px; font-size: 17px; font-weight: 700; }
  :global(.tour .driver-popover-description) { margin: 0; }
  :global(.tour .driver-popover-close-btn) { display: none !important; }
  :global(.tour .driver-popover-footer) { display: flex !important; align-items: center; gap: 8px; margin-top: 14px; }
  :global(.tour .driver-popover-progress-text) { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
  :global(.tour .driver-popover-navigation-btns) { display: flex; gap: 8px; margin-left: auto; }
  :global(.tour .driver-popover-footer-btn) {
    all: unset;
    box-sizing: border-box;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink);
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }
  :global(.tour .tour-skip) { order: -1; }
  /* The nozzle's lever is a thin line: tint it while it is the step's target. */
  :global(.bale.driver-active-element .lever) { stroke: var(--accent); stroke-width: 6; }
  :global(.bale.driver-active-element .knob) { fill: var(--accent); r: 6; }
  :global(.tour .driver-popover-next-btn) { background: var(--accent); border-color: var(--accent); color: #fff; }
  :global(.tour .driver-popover-prev-btn) { display: none !important; }
  :global(.tour .driver-popover-footer-btn:focus-visible) { outline: 2px solid var(--accent); outline-offset: 2px; }
  :global(.tour .driver-popover-arrow) { position: absolute; border: 6px solid var(--surface); }
  :global(.tour .driver-popover-arrow-side-left) { left: 100%; border-top-color: transparent; border-bottom-color: transparent; border-right-color: transparent; }
  :global(.tour .driver-popover-arrow-side-right) { right: 100%; border-top-color: transparent; border-bottom-color: transparent; border-left-color: transparent; }
  :global(.tour .driver-popover-arrow-side-top) { top: 100%; border-bottom-color: transparent; border-left-color: transparent; border-right-color: transparent; }
  :global(.tour .driver-popover-arrow-side-bottom) { bottom: 100%; border-top-color: transparent; border-left-color: transparent; border-right-color: transparent; }
  :global(.tour .driver-popover-arrow-none),
  :global(.tour .driver-popover-arrow-side-over) { display: none; }
  @media (prefers-reduced-motion: no-preference) {
    :global(.driver-fade .driver-overlay),
    :global(.driver-fade .driver-popover.tour) { animation: tour-in 0.25s ease-out; }
  }
  @keyframes -global-tour-in { from { opacity: 0; } }
</style>
