// Runs once before `next build` (see package.json "prebuild"). Fetches data that is
// shared across many pages ONCE per unique key, instead of once per city-pair page —
// with ~11,000 generated pages, per-page fetching would mean tens of thousands of
// requests and a build that never finishes. Every call tolerates failure so a flaky
// API (or an offline dev build) never blocks `next build`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const citiesPath = path.join(__dirname, "../src/data/cities.json");
const outPath = path.join(__dirname, "../src/data/enrichment.generated.json");

const cities = JSON.parse(fs.readFileSync(citiesPath, "utf-8"));
const countryCodes = [...new Set(cities.map((c) => c.countryCode))].sort();
const currencies = [...new Set(cities.map((c) => c.currency))].sort();
const year = new Date().getUTCFullYear();

async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function fetchHolidays() {
  console.log(`Fetching public holidays for ${countryCodes.length} countries (${year})...`);
  const results = await mapWithConcurrency(countryCodes, 6, async (code) => {
    const data = await safeFetchJson(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`);
    return [code, data];
  });
  return Object.fromEntries(results);
}

async function fetchRates() {
  console.log(`Fetching exchange rates for ${currencies.length} currencies...`);
  const targets = currencies.filter((c) => c !== "USD");
  const data = await safeFetchJson(
    `https://api.frankfurter.dev/v1/latest?from=USD&to=${targets.join(",")}`
  );
  return { USD: 1, ...(data?.rates ?? {}) };
}

const [holidaysByCountry, ratesUSD] = await Promise.all([fetchHolidays(), fetchRates()]);

const supportedCurrencies = Object.keys(ratesUSD);
const missingCurrencies = currencies.filter((c) => !supportedCurrencies.includes(c));
if (missingCurrencies.length) {
  console.log(
    `No ECB rate for: ${missingCurrencies.join(", ")} — those pairs will show "conversion unavailable".`
  );
}

fs.writeFileSync(
  outPath,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), year, holidaysByCountry, ratesUSD },
    null,
    2
  )
);
console.log(`Wrote ${outPath}`);
