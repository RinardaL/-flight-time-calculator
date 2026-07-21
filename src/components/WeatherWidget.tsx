"use client";

import { useEffect, useState } from "react";

interface WeatherState {
  temperatureC: number;
  label: string;
  icon: string;
}

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

const WEATHER_CODE_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  80: "🌦️",
  95: "⛈️",
};

/**
 * Fetches live weather client-side rather than at build time: with ~11,000 static
 * pages, baking weather in at build would mean either a stale snapshot (weather from
 * whenever the site was last built) or an impossibly large number of build-time
 * requests. Fetching on mount keeps it live and keeps the build free of this API.
 */
export default function WeatherWidget({ lat, lon }: { lat: number; lon: number }) {
  const [state, setState] = useState<WeatherState | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data?.current) {
          setState(null);
          return;
        }
        setState({
          temperatureC: data.current.temperature_2m,
          label: WEATHER_CODE_LABELS[data.current.weather_code] ?? "—",
          icon: WEATHER_CODE_ICONS[data.current.weather_code] ?? "🌡️",
        });
      })
      .catch(() => {
        if (!cancelled) setState(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (state === undefined) {
    return <span className="text-zinc-400">Loading weather…</span>;
  }
  if (state === null) {
    return <span className="text-zinc-400">Weather unavailable</span>;
  }
  return (
    <span>
      {state.icon} {Math.round(state.temperatureC)}°C, {state.label}
    </span>
  );
}
