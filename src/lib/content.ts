/** Simple deterministic string hash (djb2) so phrasing is stable across builds. */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function pickVariant<T>(seed: string, variants: T[]): T {
  const index = hashString(seed) % variants.length;
  return variants[index];
}

const INTRO_TEMPLATES = [
  "Planning a trip from {origin} to {destination}? Here's everything you need: flight time, the time-zone gap, and the best hours to reach someone on the other end.",
  "Flying between {origin} and {destination}, or just need to call someone there? This page breaks down the flight duration, current local times, and the time difference.",
  "Here's the flight time and time-zone difference between {origin} and {destination}, along with the best overlap window for calls and meetings.",
  "Traveling or coordinating across {origin} and {destination}? Below is the flight duration, live local time in both cities, and when to schedule a call.",
];

const NO_OVERLAP_TEMPLATES = [
  "There's no realistic overlap between standard 9am–6pm business hours in {origin} and {destination} — plan for an early morning or late evening call on one side.",
  "Standard working hours don't overlap between {origin} and {destination}. Whoever calls will need to do it outside their normal 9-to-6.",
  "Because of the {hours}-hour gap, {origin} and {destination} don't share standard business hours — expect one side to take the call off-hours.",
];

export function introSentence(origin: string, destination: string): string {
  return pickVariant(`${origin}|${destination}|intro`, INTRO_TEMPLATES)
    .replace(/\{origin\}/g, origin)
    .replace(/\{destination\}/g, destination);
}

export function noOverlapSentence(origin: string, destination: string, hours: number): string {
  return pickVariant(`${origin}|${destination}|nooverlap`, NO_OVERLAP_TEMPLATES)
    .replace(/\{origin\}/g, origin)
    .replace(/\{destination\}/g, destination)
    .replace(/\{hours\}/g, Math.abs(hours).toString());
}
