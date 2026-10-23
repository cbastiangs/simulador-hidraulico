<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import NozzleCloseUp from "$lib/components/NozzleCloseUp.svelte";
  import NozzleDrawing from "$lib/components/NozzleDrawing.svelte";

  // The model contact sheet (UX.md §3.1): every researched nozzle's drawing on
  // one screen, for checking the anatomy map against plates and photos. Dev
  // only: `pnpm dev`'s /boquillas. Values are the catalog's, with a published
  // default where there is one (automatics draw at their top flow); nothing
  // here is a hydraulic claim — the solver never sees this page.
  type SheetNozzle = {
    id: string;
    label: string;
    kind: "fixed-orifice" | "selectable";
    settingsGpm: number[];
    ratedFlowGpm: number;
    ratedPressurePsi: number;
    pattern: number;
    open: boolean;
    specId: string;
  };

  const NOZZLES: SheetNozzle[] = [
    { id: "TFT-HM-VPGI", label: "TFT Mid-Matic HM-VPGI", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 200, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-HM-VPGI" },
    { id: "TFT-H-2VPGI", label: "TFT Handline H-2VPGI", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 300, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-H-2VPGI" },
    { id: "TFT-GF3D2S", label: "TFT G-Force GF3D2S", kind: "selectable", settingsGpm: [30, 60, 95, 125, 150], ratedFlowGpm: 95, ratedPressurePsi: 75, pattern: 0.2, open: true, specId: "TFT-GF3D2S" },
    { id: "TFT-GF3C2S", label: "TFT G-Force GF3C2S", kind: "selectable", settingsGpm: [30, 60, 95, 125, 150], ratedFlowGpm: 95, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-GF3C2S" },
    { id: "TFT-FQS125F", label: "TFT QuadraFog FQS125F", kind: "selectable", settingsGpm: [30, 60, 95, 125], ratedFlowGpm: 95, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-FQS125F" },
    { id: "TFT-FTS200PS", label: "TFT ThunderFog FTS200PS", kind: "selectable", settingsGpm: [30, 60, 95, 125, 150, 200], ratedFlowGpm: 95, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-FTS200PS" },
    { id: "TFT-JTS250PS", label: "TFT ThunderFog JTS250PS", kind: "selectable", settingsGpm: [95, 125, 150, 200, 250], ratedFlowGpm: 150, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-JTS250PS" },
    { id: "TFT-H-VPGI", label: "TFT Handline H-VPGI", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 300, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-H-VPGI" },
    { id: "TFT-BGH-125", label: "TFT Ultimatic BGH-125", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 125, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-BGH-125" },
    { id: "TFT-M-RS1000-NJ", label: "TFT Master Stream M-RS1000-NJ", kind: "selectable", settingsGpm: [250, 350, 500, 750, 1000], ratedFlowGpm: 500, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "TFT-M-RS1000-NJ" },
    { id: "ELK-CHIEF-XD-MID-TIP", label: "Elkhart Chief XD Mid-Range Tip", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 125, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "ELK-CHIEF-XD-MID-TIP" },
    { id: "ELK-CHIEF-XD-HIGH-TIP", label: "Elkhart Chief XD High-Range Tip", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 250, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "ELK-CHIEF-XD-HIGH-TIP" },
    { id: "ELK-PHANTOM-XD-MID", label: "Elkhart Phantom XD Mid-Range", kind: "selectable", settingsGpm: [30, 60, 95, 125, 150, 200], ratedFlowGpm: 95, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "ELK-PHANTOM-XD-MID" },
    { id: "ELK-PHANTOM-XD-HIGH", label: "Elkhart Phantom XD High-Range", kind: "selectable", settingsGpm: [125, 150, 200, 250], ratedFlowGpm: 150, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "ELK-PHANTOM-XD-HIGH" },
    { id: "ELK-SM-XD-MID", label: "Elkhart Select-O-Matic XD Mid-Range", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 200, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "ELK-SM-XD-MID" },
    { id: "ELK-SM-XD-HIGH", label: "Elkhart Select-O-Matic XD High-Range", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 325, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "ELK-SM-XD-HIGH" },
    { id: "ELK-SM1250-XSTREAM", label: "Elkhart X-Stream SM-1250", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 1250, ratedPressurePsi: 75, pattern: 0.2, open: true, specId: "ELK-SM1250-XSTREAM" },
    { id: "ELK-CSW-LB", label: "Elkhart Select-O-Flow CSW-LB", kind: "selectable", settingsGpm: [350, 500, 750, 1000, 1250], ratedFlowGpm: 750, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "ELK-CSW-LB" },
    { id: "MAF-SS402", label: "MAFCO SS Series S402", kind: "selectable", settingsGpm: [30, 60, 95, 125, 150], ratedFlowGpm: 95, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "MAF-SS402" },
    { id: "PRO-368", label: "Protek Style 368", kind: "selectable", settingsGpm: [95, 125, 150, 200, 250], ratedFlowGpm: 150, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "PRO-368" },
    { id: "AKR-17204001", label: "Akron Turbojet Style 1720", kind: "selectable", settingsGpm: [30, 60, 95, 125], ratedFlowGpm: 95, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "AKR-17204001" },
    { id: "AKR-1723P", label: "Akron Mid-Range Turbojet 1723P", kind: "selectable", settingsGpm: [95, 125, 150, 200], ratedFlowGpm: 150, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "AKR-1723P" },
    { id: "AKR-1420", label: "Viper VB9520 + Akron 1420", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 210, ratedPressurePsi: 50, pattern: 0, open: true, specId: "AKR-1420" },
    { id: "AKR-48634028", label: "Akron Mid-Range Assault", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 175, ratedPressurePsi: 50, pattern: 0.2, open: true, specId: "AKR-48634028" },
    { id: "AKR-51600004", label: "Akron Akromatic 1250 Style 5160", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 1250, ratedPressurePsi: 80, pattern: 0.2, open: true, specId: "AKR-51600004" },
    { id: "AKR-20690001", label: "Akron 4AN Navy Style 2069", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 52, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "AKR-20690001" },
    { id: "POK-SOM-150", label: "POK Slide-O-Matic 150", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 150, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "POK-SOM-150" },
    { id: "POK-SOM-300", label: "POK Slide-O-Matic 300", kind: "fixed-orifice", settingsGpm: [], ratedFlowGpm: 300, ratedPressurePsi: 100, pattern: 0.2, open: true, specId: "POK-SOM-300" },
  ];

  const all = $state(NOZZLES);
  /** `?only=AKR-17204001,TFT-HM-VPGI` shows just those cards, for reviewing one model's art. */
  const only = $derived(page.url.searchParams.get("only"));
  const nozzles = $derived(only ? all.filter((n) => only.split(",").includes(n.id)) : all);
  const flowOf = (n: SheetNozzle) => (n.open ? n.ratedFlowGpm : 0);
</script>

<svelte:head><title>Boquillas investigadas · simulador</title></svelte:head>

{#if dev}
  <main class="app">
    <header>
      <h1>Boquillas investigadas</h1>
      <p>
        Hoja de contacto para revisar el dibujo: una tarjeta por modelo con su anatomía
        (<code>nozzle-anatomy.ts</code>).         Arriba, el pitón en el lienzo; abajo, el primer plano operable.
        Solo existe en <code>pnpm dev</code>; <code>?only=ID</code> aísla tarjetas para revisar un modelo
        (<code>/boquillas?only=AKR-17204001</code>).
      </p>
    </header>
    <div class="grid">
      {#each nozzles as n (n.id)}
        <article>
          <h2>{n.label} <small>{n.id}</small></h2>
          <svg class="mini" viewBox="-24 -48 168 72" aria-hidden="true">
            <NozzleDrawing nozzle={n} flowGpm={flowOf(n)} x={0} y={0} selected={false} onToggle={() => (n.open = !n.open)} />
          </svg>
          <NozzleCloseUp
            nozzle={n}
            flowGpm={flowOf(n)}
            onOpen={(open) => (n.open = open)}
            onSetting={(q) => (n.ratedFlowGpm = q)}
            onPattern={(p) => (n.pattern = p)}
          />
        </article>
      {/each}
    </div>
  </main>
{:else}
  <main class="app">
    <p class="off">Hoja de contacto solo para desarrollo: corre <code>pnpm dev</code> y abre <code>/boquillas</code>.</p>
  </main>
{/if}

<style>
  main { max-width: 1400px; margin: 0 auto; padding: 20px 16px 48px; }
  header { display: grid; gap: 6px; margin-bottom: 18px; }
  h1 { margin: 0; font-size: 22px; }
  header p { margin: 0; color: var(--muted); font-size: 13px; max-width: 70ch; }
  code { font-size: 12px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
  article { border: 1px solid var(--line); border-radius: 12px; padding: 12px; background: var(--surface); display: grid; gap: 8px; align-content: start; }
  h2 { margin: 0; font-size: 14px; display: grid; gap: 2px; }
  h2 small { font-weight: 400; color: var(--muted); font-size: 11px; }
  .mini { width: 100%; height: 84px; background: var(--band); border-radius: 8px; }
  .off { padding: 48px 16px; color: var(--muted); }
</style>
