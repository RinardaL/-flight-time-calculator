import { SITE_NAME } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10 px-4 py-8 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-2">
        <p>
          {SITE_NAME} computes flight duration and time-zone data from public sources
          (IANA Time Zone Database, Open-Meteo, Nager.Date, Frankfurter, OpenFlights).
          Flight durations are typical/estimated, not live schedules — always confirm
          with your airline.
        </p>
        <p>© {new Date().getFullYear()} {SITE_NAME}. Not affiliated with any airline.</p>
      </div>
    </footer>
  );
}
