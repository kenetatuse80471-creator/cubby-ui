import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME } from "@/site/site";

/**
 * Adapted from beUI (`app/manifest.ts`), MIT, Copyright (c) 2026 Saurabh Chauhan —
 * see THIRD-PARTY-NOTICES.md.
 *
 * No `icons` and no `theme_color`: there is no mark yet, and a theme colour would be
 * a colour literal outside the tokens. Both arrive with the brand.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
  };
}
