/**
 * Placeholder ad container. Wire up a real network once the site has traffic:
 * - Ezoic or AdSense from day one (low traffic thresholds)
 * - Migrate to Mediavine once the site clears ~50k sessions/month
 * Swap this component's body for the network's script/ins tag — no page-template changes needed.
 */
export default function AdSlot({ label = "Advertisement" }: { label?: string }) {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "true") return null;
  return (
    <div
      role="complementary"
      aria-label={label}
      className="flex min-h-[90px] w-full items-center justify-center rounded-md border border-dashed border-black/15 text-xs text-zinc-400 dark:border-white/15"
    >
      {label} slot — configure an ad network in AdSlot.tsx
    </div>
  );
}
