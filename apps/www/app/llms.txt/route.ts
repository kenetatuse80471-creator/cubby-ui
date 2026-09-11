import { catalogByGroup } from "@/site/catalog";
import { installCommandFor, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/site/site";

/**
 * `/llms.txt` — the map of the site for an agent: where the endpoints are and what
 * the registry contains, one line per item.
 *
 * Adapted from beUI (`app/llms.txt/route.ts`), MIT, Copyright (c) 2026 Saurabh
 * Chauhan — see THIRD-PARTY-NOTICES.md.
 */
export const dynamic = "force-static";

export async function GET() {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Endpoints",
    "",
    `- Registry index (JSON): ${SITE_URL}/registry.json`,
    `- One item (JSON, shadcn format): ${SITE_URL}/r/<slug>.json`,
    `- One item (Markdown: install, usage, props, source): ${SITE_URL}/r/<slug>.md`,
    `- Everything in one file: ${SITE_URL}/llms-full.txt`,
    "",
    "## Install",
    "",
    "```bash",
    installCommandFor("<slug>"),
    "```",
    "",
    "## Components",
    "",
  ];

  for (const { group, entries } of catalogByGroup()) {
    lines.push(`### ${group.title}`, "");
    for (const entry of entries) {
      lines.push(`- [${entry.item.title}](${SITE_URL}/r/${entry.slug}.md): ${entry.item.description}`);
    }
    lines.push("");
  }

  lines.push(
    "## Notes for agents",
    "",
    "1. Every value comes from the `tokens` item: install it first and import both of its",
    "   stylesheets after `@import \"tailwindcss\"`, or nothing will have a colour.",
    "2. Dark is the canon and the `:root` default; light is `[data-theme=\"light\"]`.",
    "3. Registry items declare no `cssVars` — tokens travel on their own route.",
    "4. Icons are a prop, never a bundled icon package.",
    "",
  );

  return new Response(`${lines.join("\n")}`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
