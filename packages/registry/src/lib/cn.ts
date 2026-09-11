import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Every text style of the Cubby UI theme, i.e. every `--text-*` entry of
 * `@cubby-ui/tokens/theme.css`.
 *
 * They have to be listed here because `text-ui-md` is a *font size* utility
 * that does not look like one: tailwind-merge reads `ui-md` as a colour and
 * silently drops `text-ui-md` next to `text-text-1`. Teaching the merge which
 * names are sizes is what keeps `cn("text-ui-md", "text-text-1")` intact.
 *
 * A new text style in the tokens has to be added here as well — a test in this
 * package compares the list against `theme.css` and fails if they drift apart.
 */
export const textStyleNames = [
  "display-lg",
  "heading-h1",
  "heading-h2",
  "heading-h3",
  "body-md",
  "body-md-strong",
  "ui-md",
  "ui-md-regular",
  "ui-md-tabular",
  "caption-sm",
  "caption-sm-strong",
  "caption-sm-tabular",
  "label-sm",
  "mono-sm",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...textStyleNames] }],
    },
  },
});

/** `clsx` for the conditionals, tailwind-merge for the conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
