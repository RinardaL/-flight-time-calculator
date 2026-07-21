import type { City } from "@/data/cities";

/**
 * Placeholder affiliate links — currently point at plain (non-tracked) homepages.
 * Replace the `href` values with your actual affiliate/referral links once you have
 * accounts with these programs (Skyscanner/Kayak partner links, Airalo & SafetyWing
 * affiliate programs). Keep the `rel="sponsored"` attribute per Google's guidance for
 * paid/affiliate links.
 */
const LINKS = [
  { label: "Search flights on Skyscanner", href: "https://www.skyscanner.net" },
  { label: "Compare fares on Kayak", href: "https://www.kayak.com" },
  { label: "Get an eSIM with Airalo", href: "https://www.airalo.com" },
  { label: "Travel insurance via SafetyWing", href: "https://safetywing.com" },
];

export default function AffiliateLinks({ destination }: { destination: City }) {
  return (
    <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        Plan your trip to {destination.name}
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              rel="sponsored noopener noreferrer"
              target="_blank"
              className="block rounded-md border border-black/10 px-3 py-2 text-sm hover:border-blue-500 hover:text-blue-600 dark:border-white/10"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
