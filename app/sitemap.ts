import type { MetadataRoute } from "next";
import { getEntryMetas } from "@/lib/journal";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://anoopchandra.dev",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://anoopchandra.dev/journal",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...getEntryMetas().map((e) => ({
      url: `https://anoopchandra.dev/journal/${e.slug}`,
      lastModified: new Date(e.date),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
