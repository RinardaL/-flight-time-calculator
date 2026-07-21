import type { MetadataRoute } from "next";
import { cities } from "@/data/cities";
import { SITE_URL } from "@/lib/site";
import { getGeneratedAt } from "@/lib/enrichment";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getGeneratedAt());
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
  ];

  for (const origin of cities) {
    entries.push({
      url: `${SITE_URL}/${origin.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const destination of cities) {
      if (origin.slug === destination.slug) continue;
      entries.push({
        url: `${SITE_URL}/${origin.slug}/${destination.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
