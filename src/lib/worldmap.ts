import { greatCirclePoints } from "./geo";

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 480;

/**
 * The land outline itself lives at /public/world-map.svg (generated once via
 * `npm run generate-world-map`, ~60KB) instead of being computed and inlined here.
 * Inlining it in every page's HTML would duplicate ~60KB across all ~13,000 pair
 * pages (~780MB sitewide); as a static file the browser fetches and caches it once.
 */

function project([lon, lat]: [number, number]): [number, number] {
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
  return [x, y];
}

export function projectPoint(lat: number, lon: number): [number, number] {
  return project([lon, lat]);
}

/**
 * SVG path `d` for the great-circle route, split into separate subpaths whenever
 * consecutive points cross the antimeridian (±180°) — otherwise a route like
 * Tokyo→Los Angeles would draw one long incorrect line straight across the map.
 */
export function greatCirclePathD(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const points = greatCirclePoints(lat1, lon1, lat2, lon2, 96).map(([lat, lon]) => project([lon, lat]));

  const segments: [number, number][][] = [[]];
  for (let i = 0; i < points.length; i++) {
    const current = segments[segments.length - 1];
    if (current.length > 0) {
      const [prevX] = current[current.length - 1];
      const [x] = points[i];
      if (Math.abs(x - prevX) > MAP_WIDTH / 2) {
        segments.push([]);
      }
    }
    segments[segments.length - 1].push(points[i]);
  }

  return segments
    .filter((seg) => seg.length > 1)
    .map((seg) => `M${seg.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}`)
    .join(" ");
}
