import type { MetadataRoute } from "next";
import { cities } from "@/data/cities";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
  ];

  for (const origin of cities) {
    entries.push({
      url: `${SITE_URL}/${origin.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const destination of cities) {
      if (origin.slug === destination.slug) continue;
      entries.push({
        url: `${SITE_URL}/${origin.slug}/${destination.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
