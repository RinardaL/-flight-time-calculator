import rawCities from "./cities.json";

export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2, used for Nager.Date holiday lookups
  iata: string;
  lat: number;
  lon: number;
  timezone: string; // IANA tz database name
  currency: string; // ISO 4217
  language: string;
  callingCode: string;
  population: number; // approximate, city proper
}

export const cities: City[] = rawCities as City[];

export const citiesBySlug: Record<string, City> = Object.fromEntries(
  cities.map((c) => [c.slug, c])
);
