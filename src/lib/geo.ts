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

/**
 * Points along the great-circle arc between two coordinates, via spherical
 * interpolation (slerp) on unit vectors — used to draw a realistic curved
 * flight path on the map instead of a straight (incorrect) line.
 */
export function greatCirclePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  segments = 64
): [number, number][] {
  const toVec = (lat: number, lon: number) => {
    const φ = toRadians(lat);
    const λ = toRadians(lon);
    return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)];
  };
  const [x1, y1, z1] = toVec(lat1, lon1);
  const [x2, y2, z2] = toVec(lat2, lon2);
  const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2));
  const theta = Math.acos(dot);

  if (theta < 1e-9) return [[lat1, lon1]];

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = Math.sin((1 - t) * theta) / Math.sin(theta);
    const b = Math.sin(t * theta) / Math.sin(theta);
    const x = a * x1 + b * x2;
    const y = a * y1 + b * y2;
    const z = a * z1 + b * z2;
    const lat = toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDegrees(Math.atan2(y, x));
    points.push([lat, lon]);
  }
  return points;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
