"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { cities } from "@/data/cities";

const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name));

export default function SearchBox() {
  const router = useRouter();
  const originId = useId();
  const destinationId = useId();
  const [origin, setOrigin] = useState(sorted[0]?.slug ?? "");
  const [destination, setDestination] = useState(sorted[1]?.slug ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || origin === destination) return;
    router.push(`/${origin}/${destination}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 text-sm">
      <label htmlFor={originId} className="sr-only">
        From
      </label>
      <select
        id={originId}
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        className="rounded-md border border-black/15 bg-transparent px-2 py-1.5 dark:border-white/20"
      >
        {sorted.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <span aria-hidden className="text-zinc-400">
        →
      </span>
      <label htmlFor={destinationId} className="sr-only">
        To
      </label>
      <select
        id={destinationId}
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="rounded-md border border-black/15 bg-transparent px-2 py-1.5 dark:border-white/20"
      >
        {sorted.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={origin === destination}
        className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Compare
      </button>
    </form>
  );
}
