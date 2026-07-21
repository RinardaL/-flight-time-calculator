import Link from "next/link";
import type { Metadata } from "next";
import { cities, citiesBySlug } from "@/data/cities";
import { computePairFacts } from "@/lib/pair-facts";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Flight duration, current local time, time-zone difference, and best call windows for thousands of city pairs worldwide.",
  alternates: { canonical: SITE_URL },
};

const popularOrigins = [...cities].sort((a, b) => b.population - a.population).slice(0, 24);

const CARD_ACCENTS = [
  "border-l-sky-500",
  "border-l-violet-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-rose-500",
  "border-l-fuchsia-500",
];

const FEATURES = [
  {
    emoji: "✈️",
    title: "Flight duration",
    color: "bg-sky-100 dark:bg-sky-900/40",
    text: "Typical scheduled duration for popular routes, or a great-circle estimate — always labeled which.",
  },
  {
    emoji: "🕐",
    title: "Time zones & DST",
    color: "bg-violet-100 dark:bg-violet-900/40",
    text: "Live local time in both cities, DST-aware, powered by the IANA time zone database.",
  },
  {
    emoji: "📞",
    title: "Best call window",
    color: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "A visual timeline showing exactly when business hours overlap on both ends.",
  },
  {
    emoji: "🗺️",
    title: "Route map",
    color: "bg-amber-100 dark:bg-amber-900/40",
    text: "The actual great-circle flight path on a world map, plus an optional interactive view.",
  },
  {
    emoji: "💱",
    title: "Currency & cost",
    color: "bg-rose-100 dark:bg-rose-900/40",
    text: "Live currency conversion, population, language, and calling-code comparisons.",
  },
  {
    emoji: "📅",
    title: "Public holidays",
    color: "bg-fuchsia-100 dark:bg-fuchsia-900/40",
    text: "The next public holiday in each country, refreshed automatically every week.",
  },
];

const FEATURED_ROUTE_SLUGS: [string, string][] = [
  ["new-york", "london"],
  ["london", "dubai"],
  ["new-york", "tokyo"],
  ["singapore", "sydney"],
  ["los-angeles", "tokyo"],
  ["paris", "new-york"],
];

function getFeaturedRoutes() {
  return FEATURED_ROUTE_SLUGS.map(([originSlug, destinationSlug]) => {
    const origin = citiesBySlug[originSlug];
    const destination = citiesBySlug[destinationSlug];
    if (!origin || !destination) return null;
    return { origin, destination, facts: computePairFacts(origin, destination) };
  }).filter((r): r is NonNullable<typeof r> => r !== null);
}

export default function Home() {
  const featuredRoutes = getFeaturedRoutes();

  return (
    <main className="flex flex-col">
      <section className="bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:py-20">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{SITE_TAGLINE}</h1>
          <p className="max-w-2xl text-lg text-blue-50 sm:text-xl">
            Pick two cities to see the flight time, live local time in both places, the time-zone
            gap, and the best hours to call — with a route map, a currency comparison, and the
            next public holiday thrown in.
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <span className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
              {cities.length.toLocaleString()} cities
            </span>
            <span className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
              {(cities.length * (cities.length - 1)).toLocaleString()} routes
            </span>
            <span className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
              Refreshed weekly
            </span>
            <span className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">100% free</span>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-12">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            What&rsquo;s on every page
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${f.color}`}>
                  {f.emoji}
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Popular routes right now
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRoutes.map(({ origin, destination, facts }, i) => (
              <Link
                key={`${origin.slug}-${destination.slug}`}
                href={`/${origin.slug}/${destination.slug}`}
                className={`flex flex-col gap-1 rounded-xl border border-l-4 border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900 ${CARD_ACCENTS[i % CARD_ACCENTS.length]}`}
              >
                <span className="font-semibold">
                  {origin.name} → {destination.name}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  {facts.durationLabel} flight · {destination.name} is {facts.offsetPhrase} {origin.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            How it works
          </h2>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Pick two cities", text: "Use the search box above, or browse by city below.", color: "bg-indigo-600" },
              { step: "2", title: "See the full picture", text: "Flight time, live local time, best call window, and a route map — all on one page.", color: "bg-blue-600" },
              { step: "3", title: "Data refreshes weekly", text: "Holidays and exchange rates update automatically every Monday.", color: "bg-sky-600" },
            ].map((s) => (
              <li key={s.step} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${s.color}`}
                >
                  {s.step}
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Browse by city
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {popularOrigins.map((city, i) => (
              <li key={city.slug}>
                <Link
                  href={`/${city.slug}`}
                  className={`block rounded-lg border-l-4 border border-black/10 bg-white px-4 py-3 text-sm transition hover:border-l-8 dark:border-white/10 dark:bg-zinc-900 ${CARD_ACCENTS[i % CARD_ACCENTS.length]}`}
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">{city.country}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/{origin}/{destination}`,
            "query-input": "required name=origin required name=destination",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: SITE_NAME,
          url: SITE_URL,
          applicationCategory: "TravelApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: SITE_TAGLINE,
        }}
      />
    </main>
  );
}
