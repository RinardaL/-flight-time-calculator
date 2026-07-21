import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cities, citiesBySlug } from "@/data/cities";
import { computePairFacts } from "@/lib/pair-facts";
import { faqQuestion } from "@/lib/content";
import { getGeneratedAt } from "@/lib/enrichment";
import { estimateFlight, formatDuration } from "@/lib/geo";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import WeatherWidget from "@/components/WeatherWidget";
import AffiliateLinks from "@/components/AffiliateLinks";
import AdSlot from "@/components/AdSlot";
import RouteMap from "@/components/RouteMap";
import CallWindowChart from "@/components/CallWindowChart";
import InteractiveMap from "@/components/InteractiveMap";

export function generateStaticParams() {
  const params: { origin: string; destination: string }[] = [];
  for (const origin of cities) {
    for (const destination of cities) {
      if (origin.slug === destination.slug) continue;
      params.push({ origin: origin.slug, destination: destination.slug });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ origin: string; destination: string }>;
}

function loadPair(originSlug: string, destinationSlug: string) {
  const origin = citiesBySlug[originSlug];
  const destination = citiesBySlug[destinationSlug];
  if (!origin || !destination || origin.slug === destination.slug) return null;
  return { origin, destination };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { origin: originSlug, destination: destinationSlug } = await params;
  const pair = loadPair(originSlug, destinationSlug);
  if (!pair) return {};
  const { origin, destination } = pair;
  const facts = computePairFacts(origin, destination);
  const title = `${origin.name} to ${destination.name}: ${facts.durationLabel} Flight Time & ${Math.abs(
    facts.offsetHours
  )}h Time Difference`;
  const url = `${SITE_URL}/${origin.slug}/${destination.slug}`;
  return {
    title,
    description: facts.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: facts.metaDescription,
      url,
      siteName: SITE_NAME,
      type: "article",
      modifiedTime: getGeneratedAt(),
    },
  };
}

/** Five other destinations from the same origin, picked deterministically by population rank offset from this destination — gives every page a distinct set of internal links instead of the same top-5 everywhere. */
function relatedDestinations(originSlug: string, destinationSlug: string) {
  const others = cities
    .filter((c) => c.slug !== originSlug && c.slug !== destinationSlug)
    .sort((a, b) => b.population - a.population);
  const offset = destinationSlug.length % Math.max(others.length - 5, 1);
  return others.slice(offset, offset + 5);
}

export default async function CityPairPage({ params }: PageProps) {
  const { origin: originSlug, destination: destinationSlug } = await params;
  const pair = loadPair(originSlug, destinationSlug);
  if (!pair) notFound();
  const { origin, destination } = pair;
  const facts = computePairFacts(origin, destination);
  const related = relatedDestinations(origin.slug, destination.slug);

  const faqItems = [
    {
      question: faqQuestion("timeDiff", origin.name, destination.name),
      answer: `${destination.name} is ${facts.offsetPhrase} ${origin.name}. Right now it's ${facts.originNow.formatted} in ${origin.name} and ${facts.destinationNow.formatted} in ${destination.name}.`,
    },
    {
      question: faqQuestion("flightTime", origin.name, destination.name),
      answer:
        facts.durationSource === "scheduled"
          ? `Typical scheduled flights from ${origin.name} to ${destination.name} take around ${facts.durationLabel}, covering a great-circle distance of about ${facts.distanceKm.toLocaleString()} km (${facts.distanceMiles.toLocaleString()} mi).`
          : `Based on the great-circle distance of about ${facts.distanceKm.toLocaleString()} km (${facts.distanceMiles.toLocaleString()} mi) and typical cruise speed, a nonstop flight from ${origin.name} to ${destination.name} would take an estimated ${facts.durationLabel}. This is an estimate, not a live schedule — actual routings and wind can shift it.`,
    },
    {
      question: faqQuestion("call", origin.name, destination.name),
      answer: facts.callWindow.hasOverlap
        ? `Call between ${facts.callWindow.originLocalRange} your time in ${origin.name} — that lands at ${facts.callWindow.destinationLocalRange} in ${destination.name}, inside standard business hours on both ends.`
        : `${origin.name} and ${destination.name} don't share standard 9am–6pm business hours, so plan for one side to take the call early morning or evening.`,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/${origin.slug}`} className="hover:underline">
          {origin.name}
        </Link>{" "}
        / {destination.name}
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {origin.name} to {destination.name}: Flight Time & Time Difference
        </h1>
        <p id="direct-answer" className="mt-3 text-lg font-medium text-blue-700 dark:text-blue-400">
          {facts.directAnswer}
        </p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">{facts.intro}</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {origin.name} ({origin.iata}) — now
          </h2>
          <p className="mt-1 text-xl font-semibold">
            {facts.originNow.hourOfDay >= 6 && facts.originNow.hourOfDay < 18 ? "☀️" : "🌙"}{" "}
            {facts.originNow.formatted}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {facts.originNow.offsetLabel} · {facts.originNow.isDST ? "Daylight saving time" : "Standard time"}
          </p>
          <p className="mt-2 text-sm">
            <WeatherWidget lat={origin.lat} lon={origin.lon} />
          </p>
        </div>
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {destination.name} ({destination.iata}) — now
          </h2>
          <p className="mt-1 text-xl font-semibold">
            {facts.destinationNow.hourOfDay >= 6 && facts.destinationNow.hourOfDay < 18 ? "☀️" : "🌙"}{" "}
            {facts.destinationNow.formatted}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {facts.destinationNow.offsetLabel} ·{" "}
            {facts.destinationNow.isDST ? "Daylight saving time" : "Standard time"}
          </p>
          <p className="mt-2 text-sm">
            <WeatherWidget lat={destination.lat} lon={destination.lon} />
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Route map</h2>
        <RouteMap
          originLat={origin.lat}
          originLon={origin.lon}
          originLabel={`${origin.name} (${origin.iata})`}
          destinationLat={destination.lat}
          destinationLon={destination.lon}
          destinationLabel={`${destination.name} (${destination.iata})`}
        />
        <InteractiveMap
          originLat={origin.lat}
          originLon={origin.lon}
          originLabel={`${origin.name} (${origin.iata})`}
          destinationLat={destination.lat}
          destinationLon={destination.lon}
          destinationLabel={`${destination.name} (${destination.iata})`}
        />
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Flight duration</h2>
        <p className="mt-1 text-xl font-semibold">{facts.durationLabel}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {facts.durationSource === "scheduled" ? "Typical scheduled duration" : "Estimated from great-circle distance"}{" "}
          · {facts.distanceKm.toLocaleString()} km ({facts.distanceMiles.toLocaleString()} mi)
        </p>
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Best time to call</h2>
        {facts.callWindow.hasOverlap ? (
          <p className="mt-1">
            Call between <strong>{facts.callWindow.originLocalRange}</strong> in {origin.name} to reach{" "}
            {destination.name} at <strong>{facts.callWindow.destinationLocalRange}</strong>, within standard
            business hours on both sides.
          </p>
        ) : (
          <p className="mt-1 text-zinc-600 dark:text-zinc-300">
            No overlap between standard 9am–6pm business hours — one side will need to take the call off-hours.
          </p>
        )}
        <div className="mt-4">
          <CallWindowChart
            callWindow={facts.callWindow}
            originLabel={origin.name}
            destinationLabel={destination.name}
            originNowHour={facts.originNow.hourOfDay}
          />
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="px-4 py-2 font-semibold">City fact</th>
              <th className="px-4 py-2 font-semibold">{origin.name}</th>
              <th className="px-4 py-2 font-semibold">{destination.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-black/10 dark:border-white/10">
              <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Country</td>
              <td className="px-4 py-2">{origin.country}</td>
              <td className="px-4 py-2">{destination.country}</td>
            </tr>
            <tr className="border-t border-black/10 dark:border-white/10">
              <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Population</td>
              <td className="px-4 py-2">{origin.population.toLocaleString()}</td>
              <td className="px-4 py-2">{destination.population.toLocaleString()}</td>
            </tr>
            <tr className="border-t border-black/10 dark:border-white/10">
              <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Language</td>
              <td className="px-4 py-2">{origin.language}</td>
              <td className="px-4 py-2">{destination.language}</td>
            </tr>
            <tr className="border-t border-black/10 dark:border-white/10">
              <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Calling code</td>
              <td className="px-4 py-2">{origin.callingCode}</td>
              <td className="px-4 py-2">{destination.callingCode}</td>
            </tr>
            <tr className="border-t border-black/10 dark:border-white/10">
              <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Currency</td>
              <td className="px-4 py-2">{origin.currency}</td>
              <td className="px-4 py-2">{destination.currency}</td>
            </tr>
            <tr className="border-t border-black/10 dark:border-white/10">
              <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">100 {origin.currency} =</td>
              <td className="px-4 py-2" colSpan={2}>
                {facts.currencyNote.converted !== null
                  ? `${facts.currencyNote.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${destination.currency}`
                  : "Conversion unavailable for this currency pair"}
              </td>
            </tr>
            <tr className="border-t border-black/10 dark:border-white/10">
              <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">Next public holiday</td>
              <td className="px-4 py-2">
                {facts.originHoliday ? `${facts.originHoliday.localName} (${facts.originHoliday.date})` : "—"}
              </td>
              <td className="px-4 py-2">
                {facts.destinationHoliday
                  ? `${facts.destinationHoliday.localName} (${facts.destinationHoliday.date})`
                  : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <Faq items={faqItems} />

      <AdSlot />

      <AffiliateLinks destination={destination} />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Other popular routes from {origin.name}
        </h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {related.map((c) => {
            const relGeo = estimateFlight(origin.lat, origin.lon, c.lat, c.lon);
            return (
              <li key={c.slug}>
                <Link
                  href={`/${origin.slug}/${c.slug}`}
                  className="block rounded-md border border-black/10 px-3 py-2 text-sm hover:border-blue-500 dark:border-white/10"
                >
                  {origin.name} → {c.name}
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDuration(relGeo.durationMinutes)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Going the other way?{" "}
        <Link href={`/${destination.slug}/${origin.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">
          See flight time from {destination.name} to {origin.name}
        </Link>
        .
      </p>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${origin.name} to ${destination.name}: Flight Time & Time Difference`,
          url: `${SITE_URL}/${origin.slug}/${destination.slug}`,
          dateModified: getGeneratedAt(),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["#direct-answer"],
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: origin.name, item: `${SITE_URL}/${origin.slug}` },
            {
              "@type": "ListItem",
              position: 3,
              name: destination.name,
              item: `${SITE_URL}/${origin.slug}/${destination.slug}`,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: `Flight time and time-zone data: ${origin.name} to ${destination.name}`,
          description: facts.directAnswer,
          dateModified: getGeneratedAt(),
          variableMeasured: ["flight duration", "time-zone offset", "distance"],
          about: [
            {
              "@type": "City",
              name: origin.name,
              geo: { "@type": "GeoCoordinates", latitude: origin.lat, longitude: origin.lon },
            },
            {
              "@type": "City",
              name: destination.name,
              geo: { "@type": "GeoCoordinates", latitude: destination.lat, longitude: destination.lon },
            },
          ],
        }}
      />
    </main>
  );
}
