import { DateTime } from "luxon";

export interface ZoneSnapshot {
  zone: string;
  isoTime: string;
  formatted: string; // e.g. "Tue, Jul 21, 3:45 PM"
  offsetMinutes: number;
  offsetLabel: string; // e.g. "UTC+05:30"
  isDST: boolean;
  abbreviation: string;
  hourOfDay: number; // fractional local hour, 0-24, for chart rendering
}

export function snapshotZone(zone: string, at?: DateTime): ZoneSnapshot {
  const dt = (at ?? DateTime.utc()).setZone(zone);
  const offsetMinutes = dt.offset;
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const m = (abs % 60).toString().padStart(2, "0");
  return {
    zone,
    isoTime: dt.toISO() ?? "",
    formatted: dt.toFormat("ccc, LLL d, h:mm a"),
    offsetMinutes,
    offsetLabel: `UTC${sign}${h}:${m}`,
    isDST: dt.isInDST,
    abbreviation: dt.offsetNameShort ?? "",
    hourOfDay: dt.hour + dt.minute / 60,
  };
}

/** Positive means `zoneB` is ahead of `zoneA`. */
export function offsetDifferenceHours(zoneA: string, zoneB: string): number {
  const now = DateTime.utc();
  const diffMinutes = now.setZone(zoneB).offset - now.setZone(zoneA).offset;
  return diffMinutes / 60;
}

export function formatHourOffset(hours: number): string {
  if (hours === 0) return "the same time as";
  const abs = Math.abs(hours);
  const unit = Number.isInteger(abs) ? `${abs} hour${abs === 1 ? "" : "s"}` : `${abs} hours`;
  return hours > 0 ? `${unit} ahead of` : `${unit} behind`;
}

export interface CallWindow {
  hasOverlap: boolean;
  originLocalRange: string;
  destinationLocalRange: string;
  /** Destination's 9am-6pm business band, expressed as hours (0-24, may exceed the range) on origin's local clock — for chart rendering. */
  destinationBandInOriginHours: [number, number];
  /** Overlap window, in origin-local hours (0-24) — for chart rendering. */
  overlapInOriginHours: [number, number] | null;
}

/**
 * Finds the overlap between two 9am-6pm local business-hour windows and expresses
 * that overlap in each city's local time. Falls back to "no real-time overlap" when
 * the offset gap leaves no shared working hours.
 */
export function bestTimeToCall(zoneA: string, zoneB: string): CallWindow {
  const diffHours = offsetDifferenceHours(zoneA, zoneB); // B - A, in hours

  const WORK_START = 9;
  const WORK_END = 18;

  // Express B's business hours in A's local clock.
  const bStartInA = WORK_START - diffHours;
  const bEndInA = WORK_END - diffHours;

  const overlapStart = Math.max(WORK_START, bStartInA);
  const overlapEnd = Math.min(WORK_END, bEndInA);
  const destinationBandInOriginHours: [number, number] = [bStartInA, bEndInA];

  if (overlapEnd - overlapStart < 0.5) {
    return {
      hasOverlap: false,
      originLocalRange: "",
      destinationLocalRange: "",
      destinationBandInOriginHours,
      overlapInOriginHours: null,
    };
  }

  const fmt = (hourValue: number) => {
    const normalized = ((hourValue % 24) + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.round((normalized - h) * 60);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${displayH} ${period}` : `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
  };

  return {
    hasOverlap: true,
    originLocalRange: `${fmt(overlapStart)}–${fmt(overlapEnd)}`,
    destinationLocalRange: `${fmt(overlapStart + diffHours)}–${fmt(overlapEnd + diffHours)}`,
    destinationBandInOriginHours,
    overlapInOriginHours: [overlapStart, overlapEnd],
  };
}
