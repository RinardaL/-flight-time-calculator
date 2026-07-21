import type { City } from "@/data/cities";
import { estimateFlight, formatDuration } from "./geo";
import { getScheduledMinutes } from "./flight-durations";
import { snapshotZone, offsetDifferenceHours, formatHourOffset, bestTimeToCall } from "./timezone";
import { convert, hasCurrencyData, nextHoliday } from "./enrichment";
import { introSentence, noOverlapSentence } from "./content";

export interface PairFacts {
  origin: City;
  destination: City;
  distanceKm: number;
  distanceMiles: number;
  durationMinutes: number;
  durationLabel: string;
  durationSource: "scheduled" | "estimated";
  offsetHours: number;
  offsetPhrase: string;
  originNow: ReturnType<typeof snapshotZone>;
  destinationNow: ReturnType<typeof snapshotZone>;
  callWindow: ReturnType<typeof bestTimeToCall>;
  directAnswer: string;
  intro: string;
  currencyNote: { amount: number; converted: number | null };
  originHoliday: ReturnType<typeof nextHoliday>;
  destinationHoliday: ReturnType<typeof nextHoliday>;
}

export function computePairFacts(origin: City, destination: City): PairFacts {
  const geo = estimateFlight(origin.lat, origin.lon, destination.lat, destination.lon);
  const scheduled = getScheduledMinutes(origin.slug, destination.slug);
  const durationMinutes = scheduled ?? geo.durationMinutes;

  const offsetHours = offsetDifferenceHours(origin.timezone, destination.timezone);
  const offsetPhrase = formatHourOffset(offsetHours);
  const callWindow = bestTimeToCall(origin.timezone, destination.timezone);

  const directAnswer = `The flight from ${origin.name} to ${destination.name} takes approximately ${formatDuration(
    durationMinutes
  )}; ${destination.name} is ${offsetPhrase} ${origin.name}${offsetHours === 0 ? "" : ""}.`;

  const intro =
    offsetHours === 0
      ? introSentence(origin.name, destination.name)
      : callWindow.hasOverlap
      ? introSentence(origin.name, destination.name)
      : noOverlapSentence(origin.name, destination.name, offsetHours);

  const amount = 100;
  const converted = hasCurrencyData(origin.currency) && hasCurrencyData(destination.currency)
    ? convert(amount, origin.currency, destination.currency)
    : null;

  return {
    origin,
    destination,
    distanceKm: geo.distanceKm,
    distanceMiles: geo.distanceMiles,
    durationMinutes,
    durationLabel: formatDuration(durationMinutes),
    durationSource: scheduled ? "scheduled" : "estimated",
    offsetHours,
    offsetPhrase,
    originNow: snapshotZone(origin.timezone),
    destinationNow: snapshotZone(destination.timezone),
    callWindow,
    directAnswer,
    intro,
    currencyNote: { amount, converted },
    originHoliday: nextHoliday(origin.countryCode),
    destinationHoliday: nextHoliday(destination.countryCode),
  };
}
