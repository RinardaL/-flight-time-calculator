import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cities, citiesBySlug } from "@/data/cities";
import { offsetDifferenceHours, formatHourOffset } from "@/lib/timezone";
import { estimateFlight, formatDuration } from "@/lib/geo";
import { getScheduledMinutes } from "@/lib/flight-durations";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getGeneratedAt } from "@/lib/enrichment";
import JsonLd from "@/components/JsonLd";

export function generateStaticParams() {
  return cities.map((c) => ({ origin: c.slug }));
}

interface PageProps {
  params: Promise<{ origin: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { origin: originSlug } = await params;
  const origin = citiesBySlug[originSlug];
  if (!origin) return {};
  const title = `Flight Time & Time Difference from ${origin.name} (${origin.iata}) — ${cities.length - 1} Destinations`;
  const description = `Flight duration and time-zone difference from ${origin.name} (${origin.timezone.replace("_", " ")}, UTC-relative) to ${cities.length - 1} major cities worldwide, with live local time and best call windows for each.`;
  const url = `${SITE_URL}/${origin.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, modifiedTime: getGeneratedAt() },
  };
}

export default async function OriginHubPage({ params }: PageProps) {
  const { origin: originSlug } = await params;
  const origin = citiesBySlug[originSlug];
  if (!origin) notFound();

  const destinations = cities
    .filter((c) => c.slug !== origin.slug)
    .map((destination) => {
      const geo = estimateFlight(origin.lat, origin.lon, destination.lat, destination.lon);
      const scheduled = getScheduledMinutes(origin.slug, destination.slug);
      const durationMinutes = scheduled ?? geo.durationMinutes;
      const offsetHours = offsetDifferenceHours(origin.timezone, destination.timezone);
      return { destination, durationMinutes, offsetHours };
    })
    .sort((a, b) => a.destination.name.localeCompare(b.destination.name));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / {origin.name}
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Flight time from {origin.name} ({origin.iata})
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Flight duration and time-zone difference from {origin.name} to {destinations.length} major cities
          worldwide. Pick a destination for the full breakdown, live local time, and best call window.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {destinations.map(({ destination, durationMinutes, offsetHours }) => (
          <li key={destination.slug}>
            <Link
              href={`/${origin.slug}/${destination.slug}`}
              className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-sm hover:border-blue-500 dark:border-white/10"
            >
              <span className="font-medium">{destination.name}</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {formatDuration(durationMinutes)} · {formatHourOffset(offsetHours)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Flight time from ${origin.name}`,
          url: `${SITE_URL}/${origin.slug}`,
          dateModified: getGeneratedAt(),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: origin.name, item: `${SITE_URL}/${origin.slug}` },
          ],
        }}
      />
    </main>
  );
}
