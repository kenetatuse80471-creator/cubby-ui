/**
 * Checks the committed `dist/` artefacts themselves: the names they emit, the units they use,
 * and that Tailwind v4 really accepts `dist/theme.css`.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { hexToRgba, letterSpacing, shadowCss, unitFor } from "../src/format.ts";
import type { Collection, TokensFile, Variable } from "../src/schema.ts";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string) => readFileSync(join(packageRoot, relative), "utf8");

const source = JSON.parse(read("src/tokens.json")) as TokensFile;
const tokensCss = read("dist/tokens.css");
const themeCss = read("dist/theme.css");

const declaredNames = new Set(
  [...tokensCss.matchAll(/^\s{2}(--[A-Za-z0-9_-]+):/gm)].map((match) => match[1] as string),
);

test("every codeSyntax.WEB name in the export is declared in tokens.css", () => {
  const missing: string[] = [];
  for (const collection of source.collections) {
    if (collection.hidden) continue;
    for (const variable of collection.variables) {
      const web = variable.codeSyntax.WEB;
      if (!web) continue;
      const name = web.slice(4, -1);
      if (!declaredNames.has(name)) missing.push(`${collection.name}/${variable.name} → ${name}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("no primitive is declared as a CSS variable — primitives are inlined", () => {
  const primitives = source.collections.find((c) => c.hidden);
  assert.ok(primitives);
  for (const variable of primitives.variables) {
    assert.equal(declaredNames.has(`--${variable.name.replaceAll("/", "-")}`), false);
  }
});

test("tokens.css keeps the Altis cascade contract", () => {
  for (const selector of [
    "\n:root {",
    '\n:root, body.dark, [data-theme="dark"] {',
    '\nbody.light, [data-theme="light"] {',
    "\n:root, body {",
  ]) {
    assert.ok(tokensCss.includes(selector), `missing selector block ${selector.trim()}`);
  }
  // Every var()-derived alias must live in the `:root, body` block, nowhere else.
  const derivedBlock = tokensCss.slice(tokensCss.lastIndexOf("\n:root, body {"));
  const varUses = [...tokensCss.matchAll(/^\s{2}--[A-Za-z0-9_-]+: var\(/gm)].length;
  const varUsesInDerived = [...derivedBlock.matchAll(/^\s{2}--[A-Za-z0-9_-]+: var\(/gm)].length;
  assert.equal(varUses, varUsesInDerived);
});

test("spot values match the export, with the right unit", () => {
  assert.match(tokensCss, /^ {2}--bg-app: #17181A;$/m);
  assert.match(tokensCss, /^ {2}--radius-md: 8px;$/m);
  assert.match(tokensCss, /^ {2}--radius-full: 9999px;$/m);
  assert.match(tokensCss, /^ {2}--topbar-h: 56px;$/m);
  assert.match(tokensCss, /^ {2}--motion-fast: 120ms;$/m);
  assert.match(tokensCss, /^ {2}--z-modal: 410;$/m);
  assert.match(tokensCss, /^ {2}--opacity-disabled: 0.45;$/m);
  assert.match(tokensCss, /^ {2}--accent-wash: #0A84FF14;$/m); // codeSyntax.WEB was null here
});

test("units are chosen by collection and scope, not per variable", () => {
  const collection = (name: string) =>
    source.collections.find((c) => c.name === name) as Collection;
  const variable = (c: Collection, path: string) =>
    c.variables.find((v) => v.name === path) as Variable;
  assert.equal(unitFor(collection("Space"), variable(collection("Space"), "space/8")), "px");
  assert.equal(
    unitFor(collection("Size"), variable(collection("Size"), "size/opacity/disabled")),
    "number",
  );
  assert.equal(
    unitFor(collection("Motion"), variable(collection("Motion"), "motion/duration/fast")),
    "ms",
  );
  assert.equal(
    unitFor(collection("Motion"), variable(collection("Motion"), "motion/ease/standard")),
    "raw",
  );
  assert.equal(unitFor(collection("Layer"), variable(collection("Layer"), "z/modal")), "number");
});

test("shadow and letter-spacing formatting", () => {
  assert.equal(hexToRgba("#00000059"), "rgba(0, 0, 0, 0.349)");
  assert.equal(hexToRgba("#FFFFFF"), "rgba(255, 255, 255, 1)");
  assert.equal(
    shadowCss({ name: "shadow/raised", effects: [{ type: "DROP_SHADOW", color: "#00000059", offset: [0, 1], radius: 3, spread: 0 }] }),
    "0px 1px 3px rgba(0, 0, 0, 0.349)",
  );
  assert.equal(
    letterSpacing({
      name: "x",
      fontFamily: "Inter",
      fontStyle: "Regular",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: -0.48,
      letterSpacingUnit: "PIXELS",
    }),
    "-0.48px",
  );
});

test("theme.css only maps into namespaces Tailwind v4 actually has", () => {
  const allowed = [
    "--color-",
    "--spacing-",
    "--breakpoint-",
    "--radius-",
    "--font-sans",
    "--font-weight-",
    "--text-",
    "--leading-",
    "--tracking-",
    "--shadow-",
    "--ease-",
  ];
  // Anchored to the rule itself (start of line), not a prose mention of "@theme inline" in a
  // comment above it — theme.css's own reset-block comment now names the block it precedes.
  const inlineBlock = /^@theme inline \{/m.exec(themeCss);
  assert.ok(inlineBlock, "could not find the @theme inline rule in theme.css");
  const block = themeCss.slice(inlineBlock.index);
  for (const [, name] of block.matchAll(/^\s{2}(--[A-Za-z0-9_-]+):/gm)) {
    assert.ok(
      allowed.some((prefix) => (name as string).startsWith(prefix)),
      `theme.css declares ${name}, which is not a Tailwind theme namespace`,
    );
  }
  // Breakpoints must be literal — a media query cannot read a custom property.
  assert.match(block, /^ {2}--breakpoint-sm: 600px;$/m);
  assert.doesNotMatch(block, /^ {2}--breakpoint-[a-z]+: var\(/m);
});

test("Tailwind v4 compiles theme.css and produces utilities from our tokens", () => {
  const dir = mkdtempSync(join(tmpdir(), "cubby-theme-"));
  writeFileSync(join(dir, "tokens.css"), tokensCss);
  writeFileSync(join(dir, "theme.css"), themeCss);
  // `source(none)` switches off automatic file scanning so the test only sees its own markup.
  writeFileSync(
    join(dir, "input.css"),
    [
      '@import "tailwindcss" source(none);',
      '@source "./index.html";',
      '@import "./tokens.css";',
      '@import "./theme.css";',
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(dir, "index.html"),
    [
      '<div class="bg-bg-app text-text-1 rounded-role-card p-3 gap-2 h-control-h-md shadow-popover ease-standard text-ui-md sm:block"></div>',
      // The reset probe: classes with no Cubby UI token, straight from Tailwind's own default
      // scales. None of these may produce a rule — see REPORT-theme-reset.md.
      '<div class="p-9 text-lg shadow-md bg-red-500 blur-sm tracking-wide perspective-dramatic"></div>',
      // rounded-xl keeps compiling — it is not a bypass, it is Cubby's own --radius-xl (16px)
      // reusing the same key name Tailwind's default scale happens to use.
      '<div class="rounded-xl"></div>',
    ].join("\n"),
  );

  const cli = join(packageRoot, "node_modules", ".bin", "tailwindcss");
  const out = join(dir, "out.css");
  execFileSync(cli, ["-i", join(dir, "input.css"), "-o", out], { stdio: "pipe" });
  const css = readFileSync(out, "utf8");

  assert.match(css, /\.bg-bg-app\s*\{\s*background-color: var\(--bg-app\);/);
  assert.match(css, /\.text-text-1\s*\{\s*color: var\(--text-1\);/);
  assert.match(css, /\.rounded-role-card\s*\{\s*border-radius: var\(--radius-role-card\);/);
  assert.match(css, /\.p-3\s*\{\s*padding: var\(--space-3\);/);
  assert.match(css, /\.gap-2\s*\{\s*gap: var\(--space-2\);/);
  assert.match(css, /\.h-control-h-md\s*\{\s*height: var\(--control-h-md\);/);
  assert.match(css, /\.text-ui-md\s*\{\s*font-size: var\(--text-ui-md\);/);
  assert.match(css, /\.shadow-popover\s*\{\s*--tw-shadow: var\(--shadow-popover\);/);
  assert.match(css, /\.ease-standard\s*\{[^}]*transition-timing-function: var\(--ease\);/);
  assert.match(css, /@media \(width >= 600px\)/);
  // The literal declarations must stay unlayered so they win over Tailwind's @layer theme.
  assert.ok(css.includes("\n:root {\n  --space-0: 0px;"));

  // None of Tailwind's own default-scale utilities may produce a rule once the reset runs.
  for (const bypass of ["p-9", "text-lg", "shadow-md", "bg-red-500", "blur-sm", "tracking-wide", "perspective-dramatic"]) {
    assert.doesNotMatch(
      css,
      new RegExp(`\\.${bypass.replaceAll(/[.*+?^${}()|[\]\\-]/g, "\\$&")}\\s*\\{`),
      `${bypass} should not compile — it has no Cubby UI token`,
    );
  }
  // rounded-xl still compiles, through Cubby's own token, not Tailwind's literal default.
  assert.match(css, /\.rounded-xl\s*\{\s*border-radius: var\(--radius-xl\);/);
});

test("the reset sits before @theme inline, and only clears namespaces checked safe", () => {
  const resetStart = themeCss.indexOf("@theme {");
  const inlineBlock = /^@theme inline \{/m.exec(themeCss);
  assert.ok(inlineBlock, "could not find the @theme inline rule in theme.css");
  assert.ok(resetStart !== -1 && resetStart < inlineBlock.index, "reset must precede @theme inline");

  const resetBlock = themeCss.slice(resetStart, inlineBlock.index);
  for (const namespace of [
    "--color-*",
    "--radius-*",
    "--shadow-*",
    "--text-*",
    "--font-*",
    "--spacing",
    "--ease-*",
    "--blur-*",
    "--tracking-*",
    "--leading-*",
    "--perspective-*",
  ]) {
    assert.match(resetBlock, new RegExp(`^\\s{2}${namespace.replace("*", "\\*")}: initial;$`, "m"));
  }
  // Left alone on purpose (see the comment above the block in theme.css for why each one):
  // --breakpoint-* and --container-* are needed/low-risk, --animate-* would break
  // Spinner's `animate-spin`, and duration-<n>/opacity-<n>/z-<n> have no theme namespace to
  // reset in the first place.
  for (const keep of ["--breakpoint-*", "--container-*", "--animate-*"]) {
    assert.doesNotMatch(resetBlock, new RegExp(`${keep.replace("*", "\\*")}: initial`));
  }
});
