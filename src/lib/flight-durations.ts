/**
 * Curated typical scheduled durations (minutes) for high-traffic routes, sourced from
 * published airline block times. Order-independent (same duration used both directions,
 * which is a simplification — real durations differ slightly with prevailing winds).
 * Any pair not listed here falls back to the Haversine-based estimate in geo.ts.
 */
const key = (a: string, b: string) => [a, b].sort().join("|");

const scheduledMinutes: Record<string, number> = {
  [key("new-york", "london")]: 450,
  [key("new-york", "los-angeles")]: 355,
  [key("new-york", "tokyo")]: 840,
  [key("new-york", "dubai")]: 745,
  [key("los-angeles", "tokyo")]: 660,
  [key("los-angeles", "sydney")]: 870,
  [key("los-angeles", "london")]: 630,
  [key("london", "dubai")]: 435,
  [key("london", "singapore")]: 790,
  [key("london", "hong-kong")]: 720,
  [key("london", "sydney")]: 1265,
  [key("london", "paris")]: 85,
  [key("london", "madrid")]: 145,
  [key("london", "rome")]: 160,
  [key("london", "istanbul")]: 240,
  [key("london", "johannesburg")]: 665,
  [key("london", "mumbai")]: 555,
  [key("london", "delhi")]: 545,
  [key("paris", "new-york")]: 470,
  [key("paris", "dubai")]: 420,
  [key("paris", "tokyo")]: 720,
  [key("dubai", "singapore")]: 460,
  [key("dubai", "sydney")]: 825,
  [key("dubai", "mumbai")]: 190,
  [key("dubai", "delhi")]: 210,
  [key("dubai", "hong-kong")]: 470,
  [key("singapore", "sydney")]: 495,
  [key("singapore", "hong-kong")]: 220,
  [key("singapore", "tokyo")]: 435,
  [key("singapore", "bangkok")]: 145,
  [key("hong-kong", "tokyo")]: 250,
  [key("hong-kong", "sydney")]: 555,
  [key("tokyo", "seoul")]: 135,
  [key("tokyo", "sydney")]: 590,
  [key("sydney", "auckland")]: 200,
  [key("mumbai", "delhi")]: 130,
  [key("mumbai", "singapore")]: 300,
  [key("chicago", "london")]: 495,
  [key("san-francisco", "tokyo")]: 630,
  [key("san-francisco", "london")]: 645,
  [key("toronto", "london")]: 435,
  [key("miami", "sao-paulo")]: 500,
  [key("new-york", "sao-paulo")]: 590,
  [key("madrid", "buenos-aires")]: 680,
  [key("frankfurt", "singapore")]: 715,
  [key("frankfurt", "new-york")]: 510,
  [key("istanbul", "dubai")]: 240,
  [key("doha", "london")]: 425,
  [key("doha", "singapore")]: 480,
};

export function getScheduledMinutes(
  originSlug: string,
  destinationSlug: string
): number | null {
  return scheduledMinutes[key(originSlug, destinationSlug)] ?? null;
}
