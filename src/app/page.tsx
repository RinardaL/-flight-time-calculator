import Link from "next/link";
import type { Metadata } from "next";
import { cities } from "@/data/cities";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Flight duration, current local time, time-zone difference, and best call windows for thousands of city pairs worldwide.",
  alternates: { canonical: SITE_URL },
};

const popularOrigins = [...cities]
  .sort((a, b) => b.population - a.population)
  .slice(0, 24);

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{SITE_TAGLINE}</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-300">
          Pick two cities above to see the flight time, live local time in both places, the
          time-zone gap, and the best hours to call — for {cities.length.toLocaleString()} cities and{" "}
          {(cities.length * (cities.length - 1)).toLocaleString()} routes worldwide.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Browse by city
        </h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {popularOrigins.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/${city.slug}`}
                className="block rounded-lg border border-black/10 px-4 py-3 text-sm hover:border-blue-500 dark:border-white/10"
              >
                {city.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

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
