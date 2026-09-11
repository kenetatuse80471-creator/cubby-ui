import type { MetadataRoute } from "next";

import { catalog } from "@/site/catalog";
import { SITE_URL } from "@/site/site";

/**
 * Adapted from beUI (`app/sitemap.ts`), MIT, Copyright (c) 2026 Saurabh Chauhan —
 * see THIRD-PARTY-NOTICES.md.
 *
 * HTML pages only. The registry JSON, the markdown mirrors and `llms*.txt` are for
 * machines that are told where to look by `/llms.txt`, not by a sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/components`, changeFrequency: "weekly", priority: 0.9 },
    ...catalog.map((entry) => ({
      url: `${SITE_URL}/components/${entry.slug}`,
      lastModified: entry.launchedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
