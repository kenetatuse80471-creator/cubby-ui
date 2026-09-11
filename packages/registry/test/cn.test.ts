import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { cn, textStyleNames } from "@/lib/cn";

/**
 * The list inside `cn.ts` is a copy of a fact that lives in the tokens. This
 * test is the only thing that keeps the copy honest.
 */
function textStylesFromTheme(): string[] {
  const themeCss = readFileSync(
    fileURLToPath(new URL("../../tokens/dist/theme.css", import.meta.url)),
    "utf8",
  );

  const names = new Set<string>();
  for (const line of themeCss.split("\n")) {
    const match = /^\s*--text-([a-z0-9-]+)\s*:/.exec(line);
    // `--text-ui-md--line-height` and friends are modifiers of a style, not one.
    if (match?.[1] && !match[1].includes("--")) names.add(match[1]);
  }
  return [...names].sort();
}

describe("cn", () => {
  it("keeps a text style next to a text colour", () => {
    const merged = cn("text-ui-md", "text-text-1");
    expect(merged).toContain("text-ui-md");
    expect(merged).toContain("text-text-1");
  });

  it("keeps every text style of the theme next to a colour", () => {
    for (const name of textStyleNames) {
      const merged = cn(`text-${name}`, "text-text-2");
      expect(merged, name).toContain(`text-${name}`);
      expect(merged, name).toContain("text-text-2");
    }
  });

  it("still lets one text style win over another", () => {
    expect(cn("text-ui-md", "text-heading-h3")).toBe("text-heading-h3");
  });

  it("still merges plain conflicts", () => {
    expect(cn("px-4", "px-3")).toBe("px-3");
    expect(cn("bg-film-1", "bg-film-2")).toBe("bg-film-2");
  });

  it("lists exactly the text styles the tokens declare", () => {
    expect([...textStyleNames].sort()).toEqual(textStylesFromTheme());
  });
});
