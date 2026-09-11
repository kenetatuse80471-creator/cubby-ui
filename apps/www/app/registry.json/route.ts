import { readRepoFile } from "@/site/source-files";

/**
 * `/registry.json` — the repository's own `registry.json`, byte for byte.
 *
 * Adapted from beUI (`app/registry.json/route.ts`), MIT, Copyright (c) 2026 Saurabh
 * Chauhan — see THIRD-PARTY-NOTICES.md. Upstream rebuilds the document from its own
 * catalogue; here the file at the repository root already *is* the source of truth
 * (shadcn's GitHub registry requires it there), so it is served rather than rebuilt.
 */
export const dynamic = "force-static";

export async function GET() {
  const registry = await readRepoFile("registry.json");

  return new Response(registry, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      link: '</llms.txt>; rel="describedby"; type="text/plain"',
    },
  });
}
