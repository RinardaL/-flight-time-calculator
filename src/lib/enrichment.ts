import enrichment from "@/data/enrichment.generated.json";
import type { PublicHoliday } from "./external-apis";

interface Enrichment {
  generatedAt: string;
  year: number;
  holidaysByCountry: Record<string, PublicHoliday[] | null>;
  ratesUSD: Record<string, number>;
}

const data = enrichment as Enrichment;

export function getGeneratedAt(): string {
  return data.generatedAt;
}

export function nextHoliday(countryCode: string): PublicHoliday | null {
  const holidays = data.holidaysByCountry[countryCode];
  if (!holidays || holidays.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  return holidays.find((h) => h.date >= today) ?? holidays[0] ?? null;
}

/** Returns null when either currency isn't covered by the ECB-sourced rate set. */
export function convert(amount: number, from: string, to: string): number | null {
  const rateFrom = data.ratesUSD[from];
  const rateTo = data.ratesUSD[to];
  if (rateFrom === undefined || rateTo === undefined) return null;
  if (from === to) return amount;
  // amount(from) -> USD -> to
  const usd = amount / rateFrom;
  return usd * rateTo;
}

export function hasCurrencyData(code: string): boolean {
  return data.ratesUSD[code] !== undefined;
}
