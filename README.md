# FlightTime Zone

Programmatic-SEO site that generates a flight-time / time-zone-difference page for
every ordered pair of ~115 major world cities (~13,000 pages), built with Next.js
static generation. See the original project brief for the full rationale.

## What's on each page

- One-sentence direct answer (flight duration + time-zone gap) for featured snippets/AI answers
- Live local time in both cities, DST-aware (Luxon + IANA tz database)
- Best overlapping call/meeting window
- Flight duration: a curated "typical scheduled" figure for popular routes
  (`src/lib/flight-durations.ts`), otherwise a labeled great-circle-distance estimate
- Population, language, calling code, currency conversion, next public holiday
- FAQ section with `FAQPage` JSON-LD; every page also emits `BreadcrumbList` and `Dataset` JSON-LD
- Client-side live weather (fetched in the browser, not baked in — see "Data & architecture")

Hub pages at `/{origin}` link to every destination from that city. `/` links to
the most populous origins and has a from/to picker.

## Data & architecture

- **City dataset** — `src/data/cities.json` (+ typed wrapper `src/data/cities.ts`):
  slug, IATA code, lat/lon, IANA timezone, currency, language, calling code,
  approximate population, for ~115 cities. Add a city here and every route
  (hub + all pairs) is generated automatically.
- **Deterministic computation** (no network, safe for ~13k static pages):
  - `src/lib/geo.ts` — Haversine distance + cruise-speed flight-time estimate
  - `src/lib/timezone.ts` — offset difference, DST, current time, call-window overlap
  - `src/lib/flight-durations.ts` — curated real durations for high-traffic routes
  - `src/lib/content.ts` — deterministic (hash-seeded) phrasing variation, so wording
    varies across pages without being random or duplicated on rebuild
- **Build-time enrichment** (`scripts/fetch-enrichment.mjs`, runs via the `prebuild`
  npm script): fetches public holidays (Nager.Date) **once per country** and
  exchange rates (Frankfurter/ECB) **once total**, writing
  `src/data/enrichment.generated.json`. This is deliberately *not* fetched per-page —
  with ~13,000 pages, per-page fetching would mean tens of thousands of build-time
  requests. All fetches tolerate failure (offline dev, rate limits) and still produce
  a valid file.
  - ECB rates only cover ~30 currencies; pairs outside that set show "conversion unavailable"
    rather than a wrong number.
- **Live weather** is fetched client-side (`src/components/WeatherWidget.tsx`) via
  Open-Meteo on page load, not baked in at build — weather baked into a static page
  would just be a stale snapshot from whenever the site was last built.

## Free APIs used

| Source | Used for | Called |
|---|---|---|
| IANA Time Zone DB (via Luxon) | DST-aware local time, offsets | In every page render, no network |
| Nager.Date | Public holidays | Once per country, at build time |
| Frankfurter (ECB rates) | Currency conversion | Once total, at build time |
| Open-Meteo | Current weather | Client-side, per page view |

REST Countries' free tier was deprecated in 2026, so population/language/calling-code
facts come from the static dataset instead of a live call.

## Running locally

```bash
npm install
npm run dev       # http://localhost:3000
```

`npm run dev` does **not** run the enrichment script — it reads whatever
`src/data/enrichment.generated.json` already exists (a snapshot is committed so a
fresh checkout works immediately).

To refresh holiday/exchange-rate data manually:

```bash
npm run refresh-data
```

## Building & deploying

```bash
npm run build   # runs `prebuild` (refresh-data) automatically, then `next build`
```

Targets Vercel or Cloudflare Pages — both have a free tier sufficient for this
project size and both auto-deploy on push to the connected branch.

Set `NEXT_PUBLIC_SITE_URL` to your real domain (used for canonical URLs, sitemap,
and JSON-LD); it defaults to `https://example.com` otherwise. To turn on the ad
placeholder slots once you have a network configured, set `NEXT_PUBLIC_ADS_ENABLED=true`.

### Weekly rebuild

`.github/workflows/weekly-refresh.yml` runs every Monday: it re-fetches holidays
and exchange rates, and if the data changed, commits and pushes
`src/data/enrichment.generated.json` — which triggers your host's normal
push-to-deploy build.

## SEO / GEO / AEO

- `src/app/robots.ts` explicitly allows GPTBot, ClaudeBot, PerplexityBot, and
  other AI/answer-engine crawlers, in addition to standard search bots.
- `public/llms.txt` describes the site and its data sources for LLM crawlers.
- `src/app/sitemap.ts` lists every hub and city-pair URL.
- Every page emits `FAQPage`, `BreadcrumbList`, and `Dataset` JSON-LD.

## Monetization (placeholders, not wired to real accounts)

- `src/components/AdSlot.tsx` — empty placeholder container, gated behind
  `NEXT_PUBLIC_ADS_ENABLED`; swap in Ezoic/AdSense (then Mediavine once you clear
  ~50k sessions/month) without touching page templates.
- `src/components/AffiliateLinks.tsx` — links to Skyscanner, Kayak, Airalo, and
  SafetyWing homepages (no tracking IDs yet). Replace `href`s with your actual
  affiliate links once you have accounts.

## Dev tooling (separate from this app)

[`garrytan/gbrain`](https://github.com/garrytan/gbrain) was cloned as a sibling
folder (`../gbrain`) — an AI-agent knowledge-management tool, useful as a working
aid while building this project. It is not a dependency of this site and isn't
imported anywhere in `src/`.
