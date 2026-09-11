/**
 * Generates the four token artefacts from `src/tokens.json`.
 *
 *   dist/tokens.css        CSS custom properties, Altis cascade contract (see README)
 *   dist/theme.css         Tailwind v4 theme: a plain `@theme` reset of Tailwind's default
 *                          scales, then the Cubby UI tokens as `@theme inline`
 *   dist/tokens.ts         typed object for React Native / NativeWind
 *   dist/tokens.paper.json flat name → value-per-mode map, for the trip back to Paper/Figma
 *
 * Run with plain Node (type stripping, no build step): `node src/build.ts`.
 * The output is byte-stable — no dates, no ordering by hash — because `pnpm tokens:check`
 * rebuilds it in CI and fails on any diff against the committed `dist/`.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyUnit,
  fontWeight,
  formatNumber,
  letterSpacing,
  shadowCss,
  styleKey,
  unitFor,
} from "./format.ts";
import { buildIndex, emittedValue, resolveValue, TokenBuildError, type Entry, type Index } from "./resolve.ts";
import type { TokensFile } from "./schema.ts";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, "..");
const sourcePath = join(packageRoot, "src", "tokens.json");
const distDir = join(packageRoot, "dist");

const sourceText = readFileSync(sourcePath, "utf8");
const source = JSON.parse(sourceText) as TokensFile;
const sourceHash = createHash("sha256").update(sourceText).digest("hex");

const index: Index = buildIndex(source);

/* ------------------------------------------------------------------ naming */

interface Emit {
  entry: Entry;
  name: string;
}

const warnings: string[] = [];
const claimed = new Map<string, Emit>();
const emits: Emit[] = [];

for (const entry of index.entries) {
  if (!entry.cssName) continue; // hidden primitives are inlined, never declared
  const previous = claimed.get(entry.cssName);
  if (previous) {
    const same = Object.keys(entry.variable.values).every((mode) => {
      try {
        return (
          JSON.stringify(resolveValue(index, entry, mode)) ===
          JSON.stringify(resolveValue(index, previous.entry, mode))
        );
      } catch {
        return false;
      }
    });
    warnings.push(
      `${entry.cssName}: declared by both ${previous.entry.key} and ${entry.key}` +
        (same ? " (identical values, emitted once)" : " with DIFFERENT values — the first one wins"),
    );
    continue;
  }
  const emit: Emit = { entry, name: entry.cssName };
  claimed.set(entry.cssName, emit);
  emits.push(emit);
}

const collectionOf = (name: string) => emits.filter((e) => e.entry.collection.name === name);

/* ------------------------------------------------------- typography / shadow */

const fontFamilies = [...new Set(source.textStyles.map((style) => style.fontFamily))];
if (fontFamilies.length !== 1 || !fontFamilies[0]) {
  throw new TokenBuildError(
    `Expected exactly one font family in textStyles, found: ${fontFamilies.join(", ")}`,
  );
}
const fontFamily = `"${fontFamilies[0]}"`;

const textVars = source.textStyles.flatMap((style) => {
  const key = styleKey(style.name);
  return [
    { name: `--text-${key}`, value: `${formatNumber(style.fontSize)}px` },
    { name: `--leading-${key}`, value: `${formatNumber(style.lineHeight)}px` },
    { name: `--tracking-${key}`, value: letterSpacing(style) },
    { name: `--font-weight-${key}`, value: String(fontWeight(style.fontStyle)) },
  ];
});

const shadowVars = source.effectStyles.map((style) => ({
  name: `--${styleKey(style.name)}`,
  value: shadowCss(style),
}));

for (const extra of [{ name: "--font", value: fontFamily }, ...textVars, ...shadowVars]) {
  if (claimed.has(extra.name)) {
    throw new TokenBuildError(
      `${extra.name} is produced by both a variable and a text/effect style — resolve in the source`,
    );
  }
}

/* --------------------------------------------------------------- css blocks */

type Line = { name: string; value: string; comment?: string };

const structural: Line[] = [];
const darkLines: Line[] = [];
const lightLines: Line[] = [];
const derived: Line[] = [];

for (const emit of emits) {
  const { entry, name } = emit;
  const isColor = entry.collection.name === "Color";
  const unit = unitFor(entry.collection, entry.variable);

  if (!isColor) {
    const shape = emittedValue(index, entry, "Value");
    const line: Line =
      shape.kind === "var"
        ? { name, value: `var(${shape.name})` }
        : { name, value: applyUnit(shape.value, unit) };
    (shape.kind === "var" ? derived : structural).push(line);
    continue;
  }

  const dark = emittedValue(index, entry, "Dark");
  const light = emittedValue(index, entry, "Light");
  if (dark.kind === "var" && light.kind === "var" && dark.name === light.name) {
    derived.push({ name, value: `var(${dark.name})` });
    continue;
  }
  darkLines.push({
    name,
    value: dark.kind === "var" ? `var(${dark.name})` : applyUnit(dark.value, unit),
  });
  lightLines.push({
    name,
    value: light.kind === "var" ? `var(${light.name})` : applyUnit(light.value, unit),
  });
}

const render = (lines: Line[]) => lines.map((line) => `  ${line.name}: ${line.value};`).join("\n");

const grouped = (collectionName: string, title: string) => {
  const lines = structural.filter((line) => {
    const owner = claimed.get(line.name);
    return owner?.entry.collection.name === collectionName;
  });
  return lines.length === 0 ? "" : `  /* ${title} */\n${render(lines)}\n\n`;
};

const warningBlock =
  warnings.length === 0
    ? ""
    : ` *\n * Name collisions in the source export (nothing is repaired here, only reported):\n` +
      warnings.map((w) => ` *   - ${w}`).join("\n") +
      "\n";

const tokensCss = `/* ============================================================================
 * Cubby UI design tokens — generated file, do not edit.
 *
 * Source:    packages/tokens/src/tokens.json (sha256 ${sourceHash})
 * Generator: packages/tokens/src/build.ts   (pnpm tokens:build)
 *
 * Cascade contract, copied deliberately from Altis docs/design/tokens.css so this file can
 * replace it verbatim: the web app switches themes with \`data-theme\` on <html>, the
 * prototype with \`class="dark" | "light"\` on <body>. A custom property whose value contains
 * var() resolves against the element it is declared on, so every var()-derived alias lives in
 * the \`:root, body\` block and every literal lives in \`:root\` or in a theme block.
 *
 * Dark is the canon and is also the \`:root\` default before a theme is applied.
 * Primitives (hidden: true in the export) are never declared here — their values are inlined.
${warningBlock} * ========================================================================== */

/* Structural primitives — identical in every theme. */
:root {
${grouped("Space", "Space")}${grouped("Radius", "Radius")}${grouped("Size", "Size")}${grouped("Motion", "Motion")}${grouped("Layer", "Layer — z-index scale")}  /* Typography. One family in the export; the type ramp comes from textStyles. */
  --font: ${fontFamily};
${render(textVars)}

  /* Elevation. effectStyles carry a single set — the export has no per-theme shadows. */
${render(shadowVars)}
}

/* Dark palette — the redesign canon, and the \`:root\` default before a theme is applied. */
:root, body.dark, [data-theme="dark"] {
${render(darkLines)}
}

/* Light palette. */
body.light, [data-theme="light"] {
${render(lightLines)}
}

/* Derived aliases: every value below is a var() reference, so it is declared on both
   \`:root\` and \`body\` to resolve against whichever element carries the active palette. */
:root, body {
${render(derived)}
}
`;

/* -------------------------------------------------------------- theme.css */

const themeLines: string[] = [];
const push = (line: string) => themeLines.push(line);

push("  /* Colours — a var() reference so the utility follows the active theme. */");
for (const emit of collectionOf("Color")) {
  push(`  --color-${emit.name.slice(2)}: var(${emit.name});`);
}

push("");
push("  /* Spacing scale (Space collection). */");
for (const emit of collectionOf("Space")) {
  push(`  --spacing-${emit.name.replace(/^--space-/, "")}: var(${emit.name});`);
}

push("");
push("  /* Component and layout sizes (Size collection) — width/height/padding utilities. */");
for (const emit of collectionOf("Size")) {
  if (emit.entry.variable.name.startsWith("size/breakpoint/")) continue;
  push(`  --spacing-${emit.name.slice(2)}: var(${emit.name});`);
}

push("");
push("  /* Breakpoints must be literal: a media query cannot read a custom property. */");
for (const emit of collectionOf("Size")) {
  if (!emit.entry.variable.name.startsWith("size/breakpoint/")) continue;
  const value = applyUnit(resolveValue(index, emit.entry, "Value"), "px");
  push(`  --breakpoint-${emit.entry.variable.name.split("/").pop()}: ${value};`);
}

push("");
push("  /* Radius. The token name already lives in Tailwind's --radius-* namespace. */");
for (const emit of collectionOf("Radius")) {
  push(`  ${emit.name}: var(${emit.name});`);
}

push("");
push("  /* Typography. */");
push(`  --font-sans: var(--font);`);
for (const style of source.textStyles) {
  const key = styleKey(style.name);
  push(`  --text-${key}: var(--text-${key});`);
  push(`  --text-${key}--line-height: var(--leading-${key});`);
  push(`  --text-${key}--letter-spacing: var(--tracking-${key});`);
  push(`  --text-${key}--font-weight: var(--font-weight-${key});`);
  push(`  --leading-${key}: var(--leading-${key});`);
  push(`  --tracking-${key}: var(--tracking-${key});`);
  push(`  --font-weight-${key}: var(--font-weight-${key});`);
}

push("");
push("  /* Elevation. */");
for (const shadow of shadowVars) {
  push(`  ${shadow.name}: var(${shadow.name});`);
}

push("");
push("  /* Easing. Durations and z-index have no Tailwind namespace — use the raw tokens. */");
for (const emit of collectionOf("Motion")) {
  if (!emit.entry.variable.name.startsWith("motion/ease/")) continue;
  push(`  --ease-${emit.entry.variable.name.split("/").pop()}: var(${emit.name});`);
}

/*
 * Reset block: a plain (non-`inline`) `@theme`, placed *before* the `@theme inline` block below
 * — order is load-bearing, see the comment inside the generated file and REPORT-theme-reset.md.
 * `NAMESPACE-*: initial` clears every entry already set in that namespace at the point it runs;
 * before the inline block it clears only Tailwind's bundled defaults (always processed first),
 * so a later Cubby entry of the same name (`--radius-xl`, `--ease-linear`) still wins. After the
 * inline block, the same line would also wipe those Cubby entries — verified both ways with a
 * real Tailwind build, not assumed.
 *
 * Namespaces intentionally left out, and why (also verified, not assumed):
 *   --breakpoint-*  sm:/md:/lg:/xl: variants are load-bearing across the registry.
 *   --container-*   unused today; the bare `container` utility already resolves its steps
 *                   from --breakpoint-* (so it is not a pure Tailwind-default bypass), and
 *                   resetting it would also foreclose @container query variants.
 *   --animate-*     would delete Tailwind's own `animate-spin` utility. Spinner keeps using
 *                   that utility and overrides only the *value* of --animate-spin (an
 *                   arbitrary property driven by the motion tokens), not the utility itself.
 * Not addressable from here at all — no @theme namespace backs them, Tailwind computes them
 * directly in the engine: duration-<n>, opacity-<n>, z-<n>. The latter two already have a
 * lint-tokens.ts rule (z-index-literal, opacity-literal); duration-<n> now has one too
 * (duration-literal) — a theme reset cannot reach a utility with no backing theme key.
 */
const resetLines = [
  "--color-*: initial;",
  "--radius-*: initial;",
  "--shadow-*: initial;",
  "--text-*: initial;",
  "--font-*: initial;",
  "--spacing: initial;",
  "--ease-*: initial;",
  "--blur-*: initial;",
  "--tracking-*: initial;",
  "--leading-*: initial;",
  "--perspective-*: initial;",
];

const themeCss = `/* ============================================================================
 * Cubby UI Tailwind v4 theme — generated file, do not edit.
 *
 * Source:    packages/tokens/src/tokens.json (sha256 ${sourceHash})
 * Generator: packages/tokens/src/build.ts   (pnpm tokens:build)
 *
 * Import after tokens.css and after Tailwind itself:
 *
 *   @import "tailwindcss";
 *   @import "./cubby-tokens.css";
 *   @import "./cubby-theme.css";
 *
 * \`inline\` is required because every entry below points at another custom property:
 * without it the utility would resolve the variable where the theme is declared instead of
 * where the utility is used, and theme switching would stop working.
 * tokens.css must stay unlayered (plain \`:root\`), as Tailwind emits its theme inside
 * \`@layer theme\` and unlayered declarations win.
 * ========================================================================== */

/* Resets Tailwind's own default scales before the Cubby UI tokens below are declared, so a
 * class without a token (\`p-9\`, \`text-lg\`, \`rounded-2xl\`, \`shadow-md\`, \`bg-red-500\`, ...)
 * produces no CSS at all, instead of silently compiling from Tailwind's bundled values. Order
 * is load-bearing: \`NAMESPACE-*: initial\` clears every entry already set in that namespace
 * *so far* — here, that is only Tailwind's bundled defaults (always processed before this
 * file), so a later Cubby entry of the same name below (\`--radius-xl\`, \`--ease-linear\`) still
 * wins. Placed after the \`@theme inline\` block instead, the same line would erase those Cubby
 * entries too — verified both ways with a real Tailwind build, see REPORT-theme-reset.md.
 *
 * Left out on purpose: \`--breakpoint-*\` (sm:/md:/lg:/xl: variants are used throughout the
 * registry), \`--container-*\` (unused today, and the bare \`container\` utility already keys
 * its steps off --breakpoint-*, so it is not a pure Tailwind-default bypass), \`--animate-*\`
 * (would delete Tailwind's own \`animate-spin\` utility, which Spinner still uses — it
 * overrides only the *value* of --animate-spin via an arbitrary property, not the utility
 * itself). \`duration-<n>\`, \`opacity-<n>\`, \`z-<n>\` have no backing theme namespace at all —
 * Tailwind computes them directly in the engine — so no line here can reach them; the latter
 * two already have a lint-tokens.ts rule (z-index-literal, opacity-literal) and duration-<n>
 * now has one too (duration-literal).
 */
@theme {
${resetLines.map((line) => `  ${line}`).join("\n")}
}

@theme inline {
${themeLines.join("\n")}
}
`;

/* -------------------------------------------------------------- tokens.ts */

const tsLiteral = (value: string | number) =>
  typeof value === "number" ? formatNumber(value) : JSON.stringify(value);

const tsRecord = (pairs: Array<[string, string]>, indent = "  ") =>
  pairs.map(([key, value]) => `${indent}${JSON.stringify(key)}: ${value},`).join("\n");

const colorPairs = (mode: "Dark" | "Light"): Array<[string, string]> =>
  collectionOf("Color").map((emit) => [
    emit.name.slice(2),
    tsLiteral(resolveValue(index, emit.entry, mode)),
  ]);

const numericPairs = (collectionName: string): Array<[string, string]> =>
  collectionOf(collectionName).map((emit) => [
    emit.name.slice(2),
    tsLiteral(resolveValue(index, emit.entry, "Value")),
  ]);

const motionPairs = (prefix: string): Array<[string, string]> =>
  collectionOf("Motion")
    .filter((emit) => emit.entry.variable.name.startsWith(prefix))
    .map((emit) => [emit.name.slice(2), tsLiteral(resolveValue(index, emit.entry, "Value"))]);

const textEntries = source.textStyles
  .map((style) => {
    const key = styleKey(style.name);
    return `  ${JSON.stringify(key)}: {
    fontFamily: ${JSON.stringify(style.fontFamily)},
    fontSize: ${formatNumber(style.fontSize)},
    lineHeight: ${formatNumber(style.lineHeight)},
    letterSpacing: ${formatNumber(style.letterSpacing)},
    fontWeight: ${fontWeight(style.fontStyle)},
  },`;
  })
  .join("\n");

const shadowEntries = source.effectStyles
  .map((style) => {
    const effect = style.effects[0];
    if (!effect) throw new TokenBuildError(`Effect style ${style.name} has no effects`);
    return `  ${JSON.stringify(styleKey(style.name))}: {
    offsetX: ${formatNumber(effect.offset[0])},
    offsetY: ${formatNumber(effect.offset[1])},
    radius: ${formatNumber(effect.radius)},
    spread: ${formatNumber(effect.spread)},
    color: ${JSON.stringify(effect.color)},
    css: ${JSON.stringify(shadowCss(style))},
  },`;
  })
  .join("\n");

const tokensTs = `/**
 * Cubby UI tokens as data — generated file, do not edit.
 *
 * Source:    packages/tokens/src/tokens.json (sha256 ${sourceHash})
 * Generator: packages/tokens/src/build.ts   (pnpm tokens:build)
 *
 * Web consumers should use dist/tokens.css + dist/theme.css. This module exists for React
 * Native / NativeWind, where there is no cascade: every alias is already resolved to a
 * literal, colours are hex strings and every other scale is a plain number (px / ms).
 * Keys are the CSS custom property name without the leading \`--\`.
 */

export const dark = {
${tsRecord(colorPairs("Dark"))}
} as const;

export const light = {
${tsRecord(colorPairs("Light"))}
} as const;

export const space = {
${tsRecord(numericPairs("Space"))}
} as const;

export const radius = {
${tsRecord(numericPairs("Radius"))}
} as const;

export const size = {
${tsRecord(numericPairs("Size"))}
} as const;

export const motion = {
  duration: {
${tsRecord(motionPairs("motion/duration/"), "    ")}
  },
  ease: {
${tsRecord(motionPairs("motion/ease/"), "    ")}
  },
} as const;

export const layer = {
${tsRecord(numericPairs("Layer"))}
} as const;

export const fontFamily = ${JSON.stringify(fontFamilies[0])} as const;

export const text = {
${textEntries}
} as const;

export const shadow = {
${shadowEntries}
} as const;

export const tokens = {
  dark,
  light,
  space,
  radius,
  size,
  motion,
  layer,
  text,
  shadow,
} as const;

export type Tokens = typeof tokens;
export type ColorTokenName = keyof typeof dark;
export type SpaceTokenName = keyof typeof space;
export type RadiusTokenName = keyof typeof radius;
export type SizeTokenName = keyof typeof size;
export type LayerTokenName = keyof typeof layer;
export type TextStyleName = keyof typeof text;
export type ShadowName = keyof typeof shadow;
export type ThemeName = "dark" | "light";
export type ColorScheme = Record<ColorTokenName, string>;

export default tokens;
`;

/* -------------------------------------------------------- tokens.paper.json */

const paperTokens: Record<string, { dark: string; light: string }> = {};

for (const emit of emits) {
  const { entry, name } = emit;
  const unit = unitFor(entry.collection, entry.variable);
  if (entry.collection.name === "Color") {
    paperTokens[name] = {
      dark: applyUnit(resolveValue(index, entry, "Dark"), unit),
      light: applyUnit(resolveValue(index, entry, "Light"), unit),
    };
  } else {
    const value = applyUnit(resolveValue(index, entry, "Value"), unit);
    paperTokens[name] = { dark: value, light: value };
  }
}
for (const extra of [{ name: "--font", value: fontFamily }, ...textVars, ...shadowVars]) {
  paperTokens[extra.name] = { dark: extra.value, light: extra.value };
}

const paperJson = `${JSON.stringify(
  {
    $schema: "cubby-ui/tokens.paper/1",
    generator: "packages/tokens/src/build.ts",
    source: { path: "packages/tokens/src/tokens.json", sha256: sourceHash },
    modes: ["dark", "light"],
    notes: warnings,
    tokens: paperTokens,
  },
  null,
  2,
)}\n`;

/* ------------------------------------------------------------------- write */

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, "tokens.css"), tokensCss);
writeFileSync(join(distDir, "theme.css"), themeCss);
writeFileSync(join(distDir, "tokens.ts"), tokensTs);
writeFileSync(join(distDir, "tokens.paper.json"), paperJson);

for (const warning of warnings) console.warn(`warn  ${warning}`);
console.log(
  `tokens: ${emits.length} variables + ${textVars.length} typography + ${shadowVars.length} shadow -> dist/{tokens.css,theme.css,tokens.ts,tokens.paper.json}`,
);
