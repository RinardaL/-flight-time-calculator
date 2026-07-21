const EARTH_RADIUS_KM = 6371;
const AVG_CRUISE_SPEED_KMH = 850; // typical long-haul jet cruise speed
const GROUND_OVERHEAD_MINUTES = 35; // taxi, takeoff, climb, descent, landing

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export interface FlightEstimate {
  distanceKm: number;
  distanceMiles: number;
  durationMinutes: number;
}

/** Great-circle-distance-based estimate. Real schedules vary with routing, winds, and aircraft type. */
export function estimateFlight(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): FlightEstimate {
  const distanceKm = haversineKm(lat1, lon1, lat2, lon2);
  const distanceMiles = distanceKm * 0.621371;
  const durationMinutes = Math.round(
    (distanceKm / AVG_CRUISE_SPEED_KMH) * 60 + GROUND_OVERHEAD_MINUTES
  );
  return { distanceKm: Math.round(distanceKm), distanceMiles: Math.round(distanceMiles), durationMinutes };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
