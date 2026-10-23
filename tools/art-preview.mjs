// Renders a nozzle-art file as a large standalone HTML preview (dev tool).
//
//   node tools/art-preview.mjs src/lib/nozzle-art/akr-17204001.ts /tmp/out.html
//
// Parses one `role:`/`d:` path per line (and `const NAME = "..."` strings),
// then draws the side view (open + closed poses) at 8x and the top view at 2x
// with the component's working-part anchors overlaid in magenta.
// Not part of the build; intended for reviewing art without the app.
import { readFileSync, writeFileSync } from "node:fs";

const [file, out] = process.argv.slice(2);
if (!file || !out) {
  console.error("usage: node tools/art-preview.mjs <art.ts> <out.html>");
  process.exit(2);
}
const src = readFileSync(file, "utf8");

const INK = {
  dark: "#2b2f33",
  steel: "#8f989f",
  brass: "#b08d57",
  grip: "#2b2f33",
  label: "#e8eaec",
  red: "#c0392b",
  yellow: "#e8c02a",
  orange: "#e07f2a",
  blue: "#2aa7c4",
};

const consts = {};
for (const m of src.matchAll(
  /const\s+([A-Za-z0-9_]+)(?:\s*:\s*string)?\s*=\s*"((?:[^"\\]|\\.)*)"/g,
)) {
  consts[m[1]] = m[2].replace(/\\"/g, '"');
}

const unq = (s) => s.replace(/\\"/g, '"');
function dOf(raw) {
  const lit = raw.match(/^"((?:[^"\\]|\\.)*)"/);
  if (lit) return unq(lit[1]);
  const id = raw.match(/^([A-Za-z0-9_]+)/);
  if (id && consts[id[1]]) return consts[id[1]];
  return null;
}

function pathsOf(segment) {
  const paths = [];
  for (const line of segment.split("\n")) {
    if (!/role:/.test(line) || !/\bd:/.test(line)) continue;
    const role = line.match(/(?:^|[\s{,])role:\s*"(\w+)"/)?.[1];
    const dm = line.match(/(?:^|[\s{,])d:\s*("(?:[^"\\]|\\.)*"|[A-Za-z0-9_]+)/);
    const d = dm ? dOf(dm[1]) : null;
    if (!role || !d) continue;
    const t = line.match(/(?:^|[\s{,])t:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    const opacity = line.match(/(?:^|[\s{,])opacity:\s*([\d.]+)/)?.[1];
    paths.push({ role, d, t: t ? unq(t) : null, opacity: opacity ?? null });
  }
  return paths;
}

const sideAt = src.indexOf("side:");
const topAt = src.indexOf("top:");
const sideSrc = src.slice(sideAt, topAt);
const topSrc = src.slice(topAt);

const sideShell = pathsOf(
  sideSrc.slice(sideSrc.indexOf("shell:"), sideSrc.indexOf("shutoff:")),
);
const sideOpen = pathsOf(
  sideSrc.slice(sideSrc.indexOf("open:"), sideSrc.indexOf("closed:")),
);
const sideClosed = pathsOf(sideSrc.slice(sideSrc.indexOf("closed:")));
const topShell = pathsOf(topSrc.slice(topSrc.indexOf("shell:")));

const num = (seg, re) => seg.match(re)?.[1];
const sideLength = num(sideSrc, /length:\s*([\d.]+)/);
const tipX = Number(num(topSrc, /tipX:\s*([\d.]+)/) ?? 386);
const ring = topSrc.match(/\bring:\s*\{([^}]*)\}/)?.[1] ?? "";
const collar = topSrc.match(/\bcollar:\s*\{([^}]*)\}/)?.[1] ?? "";
const shutoff = topSrc.match(/\bshutoff:\s*\{([^}]*)\}/)?.[1] ?? "";
const g = (seg, key) => {
  const v = seg.match(new RegExp(key + ":\\s*([\\d.]+)"))?.[1];
  return v === undefined ? undefined : Number(v);
};

function svgPaths(paths) {
  return paths
    .map((p) => {
      const attrs = [
        `d="${p.d}"`,
        `fill="${INK[p.role] ?? p.role}"`,
        p.t ? `transform="${p.t}"` : "",
        p.opacity ? `opacity="${p.opacity}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `<path ${attrs}/>`;
    })
    .join("\n");
}

const grid = `
  <line x1="-28" y1="0" x2="80" y2="0" stroke="#3a4046" stroke-width="0.4"/>
  ${Array.from({ length: 12 }, (_, i) => -20 + i * 10)
    .map(
      (x) =>
        `<line x1="${x}" y1="-40" x2="${x}" y2="28" stroke="#242a2f" stroke-width="0.25"/>` +
        `<text x="${x}" y="-36.5" font-size="3" fill="#5a646c" text-anchor="middle">${x}</text>`,
    )
    .join("")}
`;

const sideSvg = (pose, poseName) => `
<svg viewBox="-28 -40 108 68" width="864" height="544" xmlns="http://www.w3.org/2000/svg">
  <rect x="-28" y="-40" width="108" height="68" fill="#101315"/>
  ${grid}
  ${svgPaths(sideShell)}
  ${svgPaths(pose)}
  <text x="-26" y="24" font-size="4" fill="#8a949c">${poseName} — shell + ${poseName} pose — length ${sideLength ?? "?"}</text>
</svg>`;

const isBale = shutoff.includes('kind: "bale"');
const isSlide = shutoff.includes('kind: "slide"');
const isBall = shutoff.includes('kind: "ball"');
const AXIS = 88;
const anchor = [];
if (ring) {
  const f = g(ring, "from");
  const t = g(ring, "to");
  const r = g(ring, "r");
  if (f !== undefined && t !== undefined && r !== undefined)
    anchor.push(
      `<rect x="${f}" y="${AXIS - r}" width="${t - f}" height="${2 * r}" fill="none" stroke="#ff2fb3" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.8"/>` +
        `<text x="${(f + t) / 2}" y="${AXIS - r - 3}" font-size="7" fill="#ff2fb3" text-anchor="middle">ring ${f}..${t} r${r}</text>`,
    );
}
if (collar) {
  const f = g(collar, "from");
  const t = g(collar, "to");
  if (f !== undefined && t !== undefined)
    anchor.push(
      `<rect x="${f}" y="30" width="${t - f}" height="${2 * (AXIS - 30)}" fill="none" stroke="#ff2fb3" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.55"/>` +
        `<text x="${(f + t) / 2}" y="26" font-size="7" fill="#ff2fb3" text-anchor="middle">collar ${f}..${t}</text>`,
    );
}
if (isBale) {
  const px = g(shutoff, "pivotX");
  const ty = g(shutoff, "topY");
  const by = g(shutoff, "bottomY");
  if (px !== undefined)
    anchor.push(
      `<line x1="${px}" y1="${ty ?? 70}" x2="${px}" y2="${by ?? 106}" stroke="#ff2fb3" stroke-width="0.6" stroke-dasharray="2 2"/>` +
        `<text x="${px + 3}" y="${ty ?? 70}" font-size="7" fill="#ff2fb3">bale ${px}/${ty ?? "?"}..${by ?? "?"}</text>`,
    );
}
if (isSlide) {
  const f = g(shutoff, "railFrom");
  const t = g(shutoff, "railTo");
  const y = g(shutoff, "railY");
  if (f !== undefined && t !== undefined)
    anchor.push(
      `<line x1="${f}" y1="${y ?? 60}" x2="${t}" y2="${y ?? 60}" stroke="#ff2fb3" stroke-width="0.6" stroke-dasharray="2 2"/>` +
        `<text x="${f}" y="${(y ?? 60) - 3}" font-size="7" fill="#ff2fb3">slide ${f}..${t}</text>`,
    );
}
if (isBall) {
  const px = g(shutoff, "pivotX");
  const bl = g(shutoff, "barLen");
  if (px !== undefined && bl !== undefined)
    anchor.push(
      `<line x1="${px - bl}" y1="${AXIS}" x2="${px + bl}" y2="${AXIS}" stroke="#ff2fb3" stroke-width="0.6" stroke-dasharray="2 2"/>` +
        `<text x="${px - bl}" y="${AXIS - 6}" font-size="7" fill="#ff2fb3">ball ${px} ±${bl}</text>`,
    );
}
if (tipX)
  anchor.push(
    `<line x1="${tipX}" y1="18" x2="${tipX}" y2="158" stroke="#ff2fb3" stroke-width="0.7" stroke-dasharray="4 3"/>` +
      `<text x="${tipX}" y="14" font-size="7" fill="#ff2fb3" text-anchor="middle">tip ${tipX}</text>`,
  );

const topSvg = `
<svg viewBox="0 0 400 176" width="800" height="352" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="176" fill="#101315"/>
  <rect x="0" y="${AXIS - 18}" width="38" height="36" fill="#1c2126"/>
  <line x1="0" y1="${AXIS}" x2="400" y2="${AXIS}" stroke="#3a4046" stroke-width="0.4"/>
  ${svgPaths(topShell)}
  ${anchor.join("\n")}
</svg>`;

const html = `<!doctype html>
<meta charset="utf-8">
<title>${file}</title>
<body style="margin:0;background:#0c0f11;font:12px/1.4 system-ui">
${sideSvg(sideOpen, "OPEN")}
${sideSvg(sideClosed, "CLOSED")}
${topSvg}
</body>
`;
writeFileSync(out, html);
console.log(`${out} written (${file})`);
