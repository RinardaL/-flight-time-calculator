/**
 * All calls here run at build time (generateStaticParams / page render during `next build`).
 * Every function swallows errors and returns null so a flaky API or offline build never
 * breaks page generation — pages simply omit that one section.
 */

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface WeatherSnapshot {
  temperatureC: number;
  weatherCode: number;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const data = await safeFetchJson<{ current?: { temperature_2m: number; weather_code: number } }>(url);
  if (!data?.current) return null;
  return { temperatureC: data.current.temperature_2m, weatherCode: data.current.weather_code };
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
}

export async function getUpcomingHolidays(countryCode: string, year: number): Promise<PublicHoliday[] | null> {
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
  const data = await safeFetchJson<PublicHoliday[]>(url);
  return data ?? null;
}

export async function getExchangeRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1;
  // frankfurter.app 301-redirects here as of 2026; call the new host directly.
  const url = `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`;
  const data = await safeFetchJson<{ rates?: Record<string, number> }>(url);
  return data?.rates?.[to] ?? null;
}

// Note: REST Countries deprecated its free v3.1 API in 2026 (now requires a paid key).
// Population/language/calling-code facts are sourced from the static dataset in
// src/data/cities.ts instead of a live call.

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

export function describeWeatherCode(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "Unavailable";
}
