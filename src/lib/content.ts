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

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

const INTRO_TEMPLATES = [
  "Planning a trip from {origin} to {destination}? Here's everything you need: flight time, the time-zone gap, and the best hours to reach someone on the other end.",
  "Flying between {origin} and {destination}, or just need to call someone there? This page breaks down the flight duration, current local times, and the time difference.",
  "Here's the flight time and time-zone difference between {origin} and {destination}, along with the best overlap window for calls and meetings.",
  "Traveling or coordinating across {origin} and {destination}? Below is the flight duration, live local time in both cities, and when to schedule a call.",
  "Need the flight time and time difference between {origin} and {destination}? This page has the duration, live local clocks, and the best call window, updated automatically.",
  "Working across {origin} and {destination}? Check the current time in both, the {hours}-hour gap, and when a call actually lands in business hours.",
  "Booking a flight or scheduling a call between {origin} and {destination}? Here's the duration, the time-zone difference, and the overlap window you need.",
  "{origin} and {destination} sit {hours} hours apart. Here's the flight duration, live local time on both ends, and the best hours to reach someone there.",
  "Everything you need for {origin} to {destination}: how long the flight takes, what time it is right now in both cities, and when to call.",
  "Coordinating between {origin} and {destination}? See the flight time, the time-zone gap, and a call window that lands in business hours on both sides.",
];

const NO_OVERLAP_TEMPLATES = [
  "There's no realistic overlap between standard 9am–6pm business hours in {origin} and {destination} — plan for an early morning or late evening call on one side.",
  "Standard working hours don't overlap between {origin} and {destination}. Whoever calls will need to do it outside their normal 9-to-6.",
  "Because of the {hours}-hour gap, {origin} and {destination} don't share standard business hours — expect one side to take the call off-hours.",
  "With a {hours}-hour difference, {origin} and {destination} have no shared 9-to-6 window — one side will be calling early morning or late evening.",
  "{origin} and {destination} are too far apart in time zone terms for a normal-hours call; someone will need to dial in outside their working day.",
  "A {hours}-hour gap puts {origin} and {destination} on opposite working schedules — the only overlap falls outside typical business hours.",
];

const FAQ_TIME_DIFF_QUESTIONS = [
  "What is the time difference between {origin} and {destination}?",
  "How many hours ahead or behind is {destination} compared to {origin}?",
  "What time is it in {destination} right now compared to {origin}?",
];

const FAQ_FLIGHT_TIME_QUESTIONS = [
  "How long is the flight from {origin} to {destination}?",
  "How many hours does it take to fly from {origin} to {destination}?",
  "What is the flight duration between {origin} and {destination}?",
];

const FAQ_CALL_QUESTIONS = [
  "What is the best time to call {destination} from {origin}?",
  "When should I call someone in {destination} from {origin}?",
  "What hours overlap for a call between {origin} and {destination}?",
];

export function introSentence(origin: string, destination: string, hours: number): string {
  return fill(pickVariant(`${origin}|${destination}|intro`, INTRO_TEMPLATES), {
    origin,
    destination,
    hours: Math.abs(hours).toString(),
  });
}

export function noOverlapSentence(origin: string, destination: string, hours: number): string {
  return fill(pickVariant(`${origin}|${destination}|nooverlap`, NO_OVERLAP_TEMPLATES), {
    origin,
    destination,
    hours: Math.abs(hours).toString(),
  });
}

export function faqQuestion(
  kind: "timeDiff" | "flightTime" | "call",
  origin: string,
  destination: string
): string {
  const bank =
    kind === "timeDiff"
      ? FAQ_TIME_DIFF_QUESTIONS
      : kind === "flightTime"
      ? FAQ_FLIGHT_TIME_QUESTIONS
      : FAQ_CALL_QUESTIONS;
  return fill(pickVariant(`${origin}|${destination}|faq|${kind}`, bank), { origin, destination });
}
