import { catalog } from "@/site/catalog";
import { buildComponentMarkdown } from "@/site/component-markdown";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/site/site";

/**
 * `/llms-full.txt` — every component document, concatenated, so an agent can read the
 * whole library in one fetch instead of crawling 17 pages.
 *
 * Written for this site; `llms.txt` is the map, this is the contents. It reuses the
 * markdown builder, which means the single file and the per-component mirrors can
 * never disagree.
 */
export const dynamic = "force-static";

export async function GET() {
  const documents = await Promise.all(catalog.map((entry) => buildComponentMarkdown(entry.slug)));

  const body = [
    `# ${SITE_NAME} — full documentation`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `Source: ${SITE_URL}. Generated from registry.json and the component sources.`,
    "",
    ...documents.filter((document): document is string => document !== null).map((document) => `\n---\n\n${document}`),
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
