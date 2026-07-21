import type { CallWindow } from "@/lib/timezone";

const CHART_WIDTH = 720;
const CHART_HEIGHT = 90;
const TRACK_TOP = 24;
const TRACK_HEIGHT = 28;

function hourToX(hour: number): number {
  return (hour / 24) * CHART_WIDTH;
}

/** Splits an hour range that may fall outside [0,24) into 1-2 wrapped rectangles. */
function wrappedRects(start: number, end: number): [number, number][] {
  const norm = (h: number) => ((h % 24) + 24) % 24;
  const s = norm(start);
  const e = s + (end - start);
  if (e <= 24) return [[s, e]];
  return [
    [s, 24],
    [0, e - 24],
  ];
}

interface CallWindowChartProps {
  callWindow: CallWindow;
  originLabel: string;
  destinationLabel: string;
  originNowHour: number;
}

/** Static server-rendered SVG timeline — visualizes the 9am-6pm overlap instead of just describing it in text. */
export default function CallWindowChart({
  callWindow,
  originLabel,
  destinationLabel,
  originNowHour,
}: CallWindowChartProps) {
  const originBand = wrappedRects(9, 18);
  const destBand = wrappedRects(...callWindow.destinationBandInOriginHours);
  const overlapBand = callWindow.overlapInOriginHours ? wrappedRects(...callWindow.overlapInOriginHours) : [];
  const nowX = hourToX(originNowHour);

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label={`Business-hours overlap between ${originLabel} and ${destinationLabel}, shown on ${originLabel}'s clock`}
      className="w-full"
    >
      {[0, 6, 12, 18, 24].map((h) => (
        <text
          key={h}
          x={hourToX(h)}
          y={CHART_HEIGHT - 2}
          fontSize={10}
          textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"}
          className="fill-zinc-400"
        >
          {h % 24 === 0 ? "12am" : h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`}
        </text>
      ))}

      <rect x={0} y={TRACK_TOP} width={CHART_WIDTH} height={TRACK_HEIGHT} className="fill-zinc-100 dark:fill-zinc-800" />

      {originBand.map(([s, e], i) => (
        <rect
          key={`o${i}`}
          x={hourToX(s)}
          y={TRACK_TOP}
          width={hourToX(e) - hourToX(s)}
          height={TRACK_HEIGHT / 2}
          className="fill-blue-300/70 dark:fill-blue-500/40"
        />
      ))}
      {destBand.map(([s, e], i) => (
        <rect
          key={`d${i}`}
          x={hourToX(s)}
          y={TRACK_TOP + TRACK_HEIGHT / 2}
          width={hourToX(e) - hourToX(s)}
          height={TRACK_HEIGHT / 2}
          className="fill-rose-300/70 dark:fill-rose-500/40"
        />
      ))}
      {overlapBand.map(([s, e], i) => (
        <rect
          key={`ov${i}`}
          x={hourToX(s)}
          y={TRACK_TOP}
          width={hourToX(e) - hourToX(s)}
          height={TRACK_HEIGHT}
          fill="none"
          className="stroke-emerald-600 dark:stroke-emerald-400"
          strokeWidth={2}
        />
      ))}

      <line
        x1={nowX}
        x2={nowX}
        y1={TRACK_TOP - 4}
        y2={TRACK_TOP + TRACK_HEIGHT + 4}
        className="stroke-zinc-900 dark:stroke-white"
        strokeWidth={1.5}
      />

      <g fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        <rect x={0} y={0} width={8} height={8} className="fill-blue-300/70 dark:fill-blue-500/40" />
        <text x={12} y={7}>
          {originLabel} business hours
        </text>
        <rect x={160} y={0} width={8} height={8} className="fill-rose-300/70 dark:fill-rose-500/40" />
        <text x={172} y={7}>
          {destinationLabel} business hours
        </text>
      </g>
    </svg>
  );
}
