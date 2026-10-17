// Layout dump: paste into the browser console (F12 → Console) on the running
// app to report where every gauge and nozzle is drawn. Prints a table and
// copies the same data as JSON to the clipboard, to paste into a bug report.
//
// x, y are drawing coordinates before zoom (y grows downward), the same space
// the canvas places gauges in (Canvas.svelte, `gauges` / `besideClear`): a
// gauge's y minus its nozzle's y is how far it was lifted. `scale` is the
// gauge's drawn size (gaugeK); `zoom` is screen px per drawing px.
//
// It reads the drawn SVG, not the scenario: it describes the layout, and
// cannot rebuild a lay. `copy()` exists only in the browser's dev tools.
(() => {
  const svg = document.querySelector('svg[aria-label="Vista lateral de la línea"]');
  const zoom = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
  const at = (el) => el.getAttribute("transform").match(/translate\(([-\d.]+) ([-\d.]+)\)(?: scale\(([-\d.]+)\))?/).slice(1).map(Number);
  const gauges = [...svg.querySelectorAll("g.gauge")].filter((g) => g.querySelector(".face")).map((g) => {
    const [x, y, scale] = at(g);
    return { what: "gauge", line: g.querySelector(".gauge-tag")?.textContent.trim() ?? "", psi: g.querySelector(".value")?.textContent ?? "", x: Math.round(x), y: Math.round(y), scale: +scale.toFixed(3) };
  });
  const nozzles = [...svg.querySelectorAll("rect.grab")].map((r) => {
    const [x, y] = at(r.parentElement.parentElement);
    return { what: "nozzle", line: "", psi: "", x: Math.round(x), y: Math.round(y), scale: "" };
  });
  const rows = [...gauges, ...nozzles];
  console.table(rows);
  copy(JSON.stringify({ zoom: +zoom.toFixed(4), viewport: [innerWidth, innerHeight], rows }));
  return "copied to clipboard: paste it in the chat";
})();
