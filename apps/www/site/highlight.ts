import {
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
  type ThemeRegistrationRaw,
} from "shiki";

/**
 * Syntax highlighting, done once at build time.
 *
 * ONE theme, whose colours are the site's own tokens. That is the whole idea here
 * and it replaces a previous pair of GitHub themes, for two reasons:
 *
 * - **it themes itself.** A TextMate theme can only hold literal colours, so the
 *   usual way to support light and dark is to highlight twice and swap with CSS.
 *   Shiki's `colorReplacements` runs after tokenisation and takes any CSS value, so
 *   each colour below is replaced by a `var(--token)` that already flips with
 *   `data-theme`. No second pass, no `!important` override rule, no duplicated markup.
 * - **it does not fight the page.** `github-dark-default` paints keywords red,
 *   strings blue and functions purple — four hues arguing with a monochrome shell
 *   (reference spec §5: the references' own "expensive" look is carried by surfaces
 *   and alpha strokes, never by colour). This theme is the grey ramp the rest of the
 *   site is built from — plain text `--text-body`, comments `--text-3`, punctuation
 *   `--text-2`, keywords `--text-1` in bold — with exactly one hue, `--accent-2`, and
 *   only for literals: strings, numbers, booleans. Colour means "a value you typed".
 *
 * The sentinel hexes are placeholders, never rendered: every one of them is listed
 * in `COLOUR_REPLACEMENTS` below and substituted before the HTML is written. They
 * are deliberately absurd (#000001…) so a missing entry shows up as black on screen
 * rather than as something that looks plausible.
 */
const INK = {
  background: "#000001",
  plain: "#000002",
  comment: "#000003",
  punctuation: "#000004",
  keyword: "#000005",
  literal: "#000006",
} as const;

const COLOUR_REPLACEMENTS: Record<string, string> = {
  [INK.background]: "var(--bg-well)",
  [INK.plain]: "var(--text-body)",
  [INK.comment]: "var(--text-3)",
  [INK.punctuation]: "var(--text-2)",
  [INK.keyword]: "var(--text-1)",
  [INK.literal]: "var(--accent-2)",
};

const CUBBY_THEME: ThemeRegistrationRaw = {
  name: "cubby",
  // Declared dark because the tokens' canon is dark; nothing downstream reads it,
  // since every colour is a variable that follows whichever theme is active.
  type: "dark",
  colors: {
    "editor.background": INK.background,
    "editor.foreground": INK.plain,
  },
  settings: [
    { settings: { background: INK.background, foreground: INK.plain } },
    {
      scope: ["punctuation", "meta.brace", "keyword.operator"],
      settings: { foreground: INK.punctuation },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "storage",
        "storage.type",
        "storage.modifier",
        "variable.language",
        "entity.name.tag",
        "support.type.primitive",
      ],
      settings: { foreground: INK.keyword, fontStyle: "bold" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "entity.name.type",
        "entity.name.class",
        "support.class",
        "support.type",
      ],
      settings: { foreground: INK.keyword },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "constant.numeric",
        "constant.language",
        "constant.character.escape",
        "constant.other.symbol",
        "support.constant",
      ],
      settings: { foreground: INK.literal },
    },
    {
      // After the string rules on purpose: the quotes themselves stay punctuation,
      // so a string reads as ink between two grey marks.
      scope: ["punctuation.definition.string", "punctuation.definition.template-expression"],
      settings: { foreground: INK.punctuation },
    },
    {
      // Last, so a comment is one flat grey whatever it happens to contain.
      scope: ["comment", "punctuation.definition.comment", "comment.block", "comment.line"],
      settings: { foreground: INK.comment },
    },
  ],
};

/**
 * Only the languages the site actually shows are loaded — the full bundle is 40× the
 * size for no benefit.
 */
const LANGS = ["tsx", "ts", "css", "json", "bash"] as const satisfies readonly BundledLanguage[];

export type CodeLanguage = (typeof LANGS)[number];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [CUBBY_THEME],
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
    theme: "cubby",
    colorReplacements: COLOUR_REPLACEMENTS,
  });
}
