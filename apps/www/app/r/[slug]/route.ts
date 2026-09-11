import { buildComponentMarkdown } from "@/site/component-markdown";
import { catalogSlugs } from "@/site/catalog";

/**
 * `/r/<slug>.md` — the markdown mirror of a component page.
 *
 * Adapted from beUI (`app/r/[slug]/route.ts`), MIT, Copyright (c) 2026 Saurabh
 * Chauhan — see THIRD-PARTY-NOTICES.md: the static-params-per-extension shape and
 * the response headers are theirs.
 *
 * `/r/<slug>.json` is deliberately **not** handled here: those files are written by
 * `shadcn build` into `public/r/` by this package's `prebuild`, and Next serves them
 * as plain static assets. One producer of registry JSON, and it is the shadcn CLI.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return catalogSlugs.map((slug) => ({ slug: `${slug}.md` }));
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!slug.endsWith(".md")) return new Response("not_found", { status: 404 });

  const markdown = await buildComponentMarkdown(slug.slice(0, -".md".length));
  if (!markdown) return new Response("not_found", { status: 404 });

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      // The HTML page is the canonical one; the mirror exists for machines.
      "x-robots-tag": "noindex",
      link: `</components/${slug.slice(0, -".md".length)}>; rel="canonical"; type="text/html"`,
    },
  });
}
