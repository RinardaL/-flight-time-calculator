import { greatCirclePathD, projectPoint, MAP_WIDTH, MAP_HEIGHT } from "@/lib/worldmap";

interface RouteMapProps {
  originLat: number;
  originLon: number;
  originLabel: string;
  destinationLat: number;
  destinationLon: number;
  destinationLabel: string;
}

/**
 * Server-rendered, zero client JS. The land outline is a single static file
 * (/world-map.svg) the browser fetches and caches once, then reuses across every
 * page on the site — only the small route/pin overlay below is unique per page.
 */
export default function RouteMap({
  originLat,
  originLon,
  originLabel,
  destinationLat,
  destinationLon,
  destinationLabel,
}: RouteMapProps) {
  const [ox, oy] = projectPoint(originLat, originLon);
  const [dx, dy] = projectPoint(destinationLat, destinationLon);
  const routeD = greatCirclePathD(originLat, originLon, destinationLat, destinationLon);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-black/10 bg-slate-50 dark:border-white/10 dark:bg-slate-900">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG asset, no optimization needed */}
      <img src="/world-map.svg" alt="" aria-hidden className="block w-full" width={MAP_WIDTH} height={MAP_HEIGHT} />
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={`Map of the flight route from ${originLabel} to ${destinationLabel}`}
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={routeD}
          fill="none"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        <g>
          <circle cx={ox} cy={oy} r={4} className="fill-blue-600 dark:fill-blue-400" />
          <text x={ox + 7} y={oy - 6} className="fill-slate-700 dark:fill-slate-200" fontSize={12} fontWeight={600}>
            {originLabel}
          </text>
        </g>
        <g>
          <circle cx={dx} cy={dy} r={4} className="fill-rose-600 dark:fill-rose-400" />
          <text x={dx + 7} y={dy - 6} className="fill-slate-700 dark:fill-slate-200" fontSize={12} fontWeight={600}>
            {destinationLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}
