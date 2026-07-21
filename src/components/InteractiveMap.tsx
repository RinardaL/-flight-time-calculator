"use client";

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import dynamic from "next/dynamic";

interface InteractiveMapProps {
  originLat: number;
  originLon: number;
  originLabel: string;
  destinationLat: number;
  destinationLon: number;
  destinationLabel: string;
}

/**
 * Loaded only when the user asks for it (click-to-expand) via next/dynamic with
 * ssr:false — Leaflet touches `window` at import time, and skipping this until a
 * click also means none of the ~13,000 static pages pay for map-tile requests
 * unless a visitor actually opens the map. Tiles are OpenStreetMap's free public
 * tile server (no API key, standard attribution).
 */
const LeafletMap = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center text-sm text-zinc-400">Loading map…</div>
  ),
});

export default function InteractiveMap(props: InteractiveMapProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-black/10 px-4 py-3 text-center text-sm text-blue-600 hover:border-blue-500 dark:border-white/10 dark:text-blue-400"
      >
        Open interactive map (OpenStreetMap)
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
      <LeafletMap {...props} />
    </div>
  );
}
