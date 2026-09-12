/**
 * Every class written in `src/ui` and `src/lib` must be a class Tailwind can actually build
 * from our tokens.
 *
 * Tailwind is run for real over both directories with `tokens.css` + `theme.css`, then every
 * utility the extractor found in the sources is looked up in the output. A typo (`bg-bg-ap`), a
 * token that does not exist (`h-control-h-xxl`) or a namespace `theme.css` does not fill produces
 * no rule, and the test says which file and line it came from.
 *
 * An unbuildable class is invisible in review and silent in the browser: the component simply
 * looks wrong in the consumer's project. This is the gate that makes it loud.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { classCandidates, libDir, packageRoot, uiDir, uiSources } from "../scripts/class-strings.ts";

const IGNORE_UNKNOWN = /cubby-ui-allow-unknown-class/;

/** Builds the stylesheet a consumer would get, scanning only `src/ui` and `src/lib`. */
function buildCss(): string {
  const dir = mkdtempSync(join(tmpdir(), "cubby-classes-"));
  const tokens = join(packageRoot, "..", "tokens", "dist");
  writeFileSync(
    join(dir, "input.css"),
    [
      // `source(none)` turns off automatic detection so only the `@source`s below are scanned.
      '@import "tailwindcss" source(none);',
      `@source "${uiDir}";`,
      `@source "${libDir}";`,
      `@import "${join(tokens, "tokens.css")}";`,
      `@import "${join(tokens, "theme.css")}";`,
      "",
    ].join("\n"),
  );

  const cli = join(packageRoot, "node_modules", ".bin", "tailwindcss");
  const out = join(dir, "out.css");
  execFileSync(cli, ["-i", join(dir, "input.css"), "-o", out], { stdio: "pipe" });
  return readFileSync(out, "utf8");
}

/**
 * True when the stylesheet carries a rule for this class. Backslashes are dropped first so an
 * escaped selector (`.hover\:bg-film-2:hover`, `.\[--tag-line\:color-mix\(\.\.\.\)\]`) can be
 * matched by the plain class name; the character after it must end the name, so `.px-4` never
 * matches `.px-40`.
 */
function hasRule(css: string, candidate: string): boolean {
  const flat = css.replaceAll("\\", "");
  const needle = `.${candidate}`;
  for (let at = flat.indexOf(needle); at !== -1; at = flat.indexOf(needle, at + 1)) {
    const next = flat[at + needle.length] ?? "";
    if (" ,{:.[>+~)\n".includes(next)) return true;
  }
  return false;
}

let css: string;
const sources = uiSources();

beforeAll(() => {
  css = buildCss();
});

describe("classes", () => {
  it("Tailwind builds a rule for every class written in src/ui and src/lib", () => {
    const missing: string[] = [];
    let checked = 0;

    for (const file of sources) {
      const lines = file.source.split("\n");
      for (const candidate of classCandidates(file.source, file.name)) {
        const line = lines[candidate.line - 1] ?? "";
        if (IGNORE_UNKNOWN.test(line)) continue;
        checked += 1;
        if (!hasRule(css, candidate.value)) {
          missing.push(`${candidate.file}:${candidate.line}  ${candidate.value}`);
        }
      }
    }

    expect(missing, `classes Tailwind could not build:\n${missing.join("\n")}`).toEqual([]);
    expect(checked, `expected the extractor to find the class lists, got ${checked}`).toBeGreaterThan(
      200,
    );
  });

  it("a call to a *Variants function carries variant keys, not classes", () => {
    // The site imports `buttonVariants` from the registry and calls it inside `cn(...)`. Its keys
    // ("secondary", "compact") are variant names, and reading them as classes made the gate
    // report two utilities that were never written.
    const source = [
      'import { buttonVariants } from "@/registry/cubby/ui/button";',
      'const link = cn(buttonVariants({ variant: "secondary", size: "compact" }), "sm:ml-auto");',
    ].join("\n");
    const found = classCandidates(source, "sample.tsx").map((candidate) => candidate.value);
    expect(found).toEqual(["sm:ml-auto"]);
  });

  it("really fails on a typo", () => {
    // A class the components do use, so the lookup itself is known to work…
    expect(hasRule(css, "bg-film-1")).toBe(true);
    // …and the shapes a mistake takes: a truncated token, a misspelt one, a size outside the
    // scale, and a namespace prefix with nothing after it.
    expect(hasRule(css, "bg-film-")).toBe(false);
    expect(hasRule(css, "bg-fim-1")).toBe(false);
    expect(hasRule(css, "bg-bg-ap")).toBe(false);
    expect(hasRule(css, "h-control-h-xxl")).toBe(false);
    expect(hasRule(css, "px-")).toBe(false);
  });

  it("the two control heights come from the control scale, 32 and 28", () => {
    expect(css).toMatch(/\.h-control-h-md\s*\{\s*height: var\(--control-h-md\);/);
    expect(css).toMatch(/\.h-control-h-sm\s*\{\s*height: var\(--control-h-sm\);/);
    const tokens = readFileSync(join(packageRoot, "..", "tokens", "dist", "tokens.css"), "utf8");
    expect(tokens).toMatch(/^ {2}--control-h-md: 32px;$/m);
    expect(tokens).toMatch(/^ {2}--control-h-sm: 28px;$/m);
  });

  it("the focus ring is 2px accent, offset outwards, only on :focus-visible", () => {
    expect(css).toMatch(/outline-width: var\(--stroke-focus\)/);
    expect(css).toMatch(/outline-color: var\(--accent\)/);
    expect(css).toMatch(/outline-offset: var\(--stroke-hairline\)/);
    // …and it is a :focus-visible ring, not a permanent border.
    expect(css).toMatch(/\.focus-visible\\:outline-accent:focus-visible/);
  });

  it("the label is set in ui — 13/16, weight 500 — through tokens", () => {
    expect(css).toMatch(/\.text-ui-md\s*\{\s*font-size: var\(--text-ui-md\);/);
    expect(css).toMatch(/font-weight: var\(--tw-font-weight, var\(--font-weight-ui-md\)\)/);
    const tokens = readFileSync(join(packageRoot, "..", "tokens", "dist", "tokens.css"), "utf8");
    expect(tokens).toMatch(/^ {2}--text-ui-md: 13px;$/m);
    expect(tokens).toMatch(/^ {2}--leading-ui-md: 16px;$/m);
    expect(tokens).toMatch(/^ {2}--font-weight-ui-md: 500;$/m);
  });

  it("disabled dims with the token, never with a number", () => {
    expect(css).toMatch(
      /\.disabled\\:opacity-\\\(--opacity-disabled\\\):disabled\s*\{\s*opacity: var\(--opacity-disabled\);/,
    );
  });
});
