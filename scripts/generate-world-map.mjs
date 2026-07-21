// One-off generator: writes public/world-map.svg (land outline only) so every
// pair page can reference ONE static, browser-cacheable file via <img> instead
// of inlining the ~60KB path string in each of the ~13,000 pages' HTML.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import land110m from "world-atlas/land-110m.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WIDTH = 960;
const HEIGHT = 480;

function project([lon, lat]) {
  const x = ((lon + 180) / 360) * WIDTH;
  const y = ((90 - lat) / 180) * HEIGHT;
  return [x, y];
}

const geo = feature(land110m, land110m.objects.land);
const parts = [];
for (const f of geo.features) {
  const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const points = ring.map(project);
      parts.push(`M${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`);
    }
  }
}

const svg = `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg"><path d="${parts.join(
  " "
)}" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="0.5"/></svg>`;

const outPath = path.join(__dirname, "../public/world-map.svg");
fs.writeFileSync(outPath, svg);
console.log(`Wrote ${outPath} (${(svg.length / 1024).toFixed(1)} KB)`);
