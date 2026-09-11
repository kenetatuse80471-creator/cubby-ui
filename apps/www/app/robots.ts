import type { MetadataRoute } from "next";

import { SITE_URL } from "@/site/site";

/**
 * Adapted from beUI (`app/robots.ts`), MIT, Copyright (c) 2026 Saurabh Chauhan —
 * see THIRD-PARTY-NOTICES.md.
 *
 * Everything is crawlable. The machine endpoints (`/r/*.md`) carry their own
 * `X-Robots-Tag: noindex`, which is the right place for it: the rule travels with the
 * response instead of being restated here.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
