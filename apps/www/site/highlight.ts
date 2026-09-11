import { createHighlighter, type BundledLanguage, type Highlighter } from "shiki";

/**
 * Syntax highlighting, done once at build time.
 *
 * Two themes at once: Shiki writes the dark colours inline (dark is the canon here)
 * and a `--shiki-light` custom property next to each of them; `app/globals.css`
 * swaps to that property under `[data-theme="light"]`. No client-side highlighter
 * ships, and no second pass runs when the theme changes.
 *
 * Only the languages the site actually shows are loaded — the full bundle is 40× the
 * size for no benefit.
 */
const LANGS = ["tsx", "ts", "css", "json", "bash"] as const satisfies readonly BundledLanguage[];

export type CodeLanguage = (typeof LANGS)[number];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ["github-dark-default", "github-light-default"],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

function isKnownLanguage(lang: string): lang is CodeLanguage {
  return (LANGS as readonly string[]).includes(lang);
}

/** Highlighted HTML for a snippet. Unknown languages fall back to plain text. */
export async function highlight(code: string, lang: string) {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code.trimEnd(), {
    lang: isKnownLanguage(lang) ? lang : "text",
    themes: { dark: "github-dark-default", light: "github-light-default" },
    defaultColor: "dark",
    colorReplacements: {
      // The only substitution: the code plate is the library's own surface, so a
      // block of code sits on the page instead of punching a hole in it.
      "github-dark-default": { "#0d1117": "var(--bg-well)" },
      "github-light-default": { "#ffffff": "var(--bg-well)" },
    },
  });
}
