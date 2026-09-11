/**
 * The gate that keeps literals out of `src/ui` and `src/lib`.
 *
 * Every colour, size, radius, duration and opacity in Cubby UI comes from
 * `packages/tokens`. A number typed into a component is not a shortcut, it is a value that
 * will not follow the theme and will not move when the canon moves. This script fails the
 * build on the shapes that break the rule:
 *
 *   1. a hex colour anywhere in the code;
 *   2. a number with a CSS unit anywhere in the code (`32px`, `0.2s`, `45%`);
 *   3. an arbitrary utility value that still contains a digit once token references are
 *      removed — `h-[32px]` fails, `[animation-duration:var(--motion-spin-duration)]` and
 *      `border-(length:--stroke-focus)` pass, because those *are* token references;
 *   4. a bare number inside a `style={{ … }}` object;
 *   5. Tailwind's own default `z-<n>`/`-z-<n>` scale — `z-50` fails, `z-(--z-dropdown)`
 *      passes, because the token is the whole point of a stacking order that has to line up
 *      with the rest of the app (scrim, modal, dropdown, snackbar, tooltip: `packages/tokens`);
 *   6. Tailwind's own default `opacity-<n>` scale, except `opacity-0` and `opacity-100` — those
 *      two are "invisible"/"fully visible", a state rather than a design value (an
 *      `data-starting-style:opacity-0` transition, `hover:opacity-100` meaning "no longer
 *      dimmed"), everything in between is `--opacity-disabled` or nothing;
 *   7. Tailwind's own default `duration-<n>` scale — `duration-300` fails, `duration-(--motion-
 *      fast)` passes. Unlike colour/radius/shadow/text, there is no `--duration-*` theme
 *      namespace to reset in `theme.css` — Tailwind computes `duration-<n>` directly in the
 *      engine (see packages/tokens/dist/theme.css's own comment, and REPORT-theme-reset.md) —
 *      so this rule is the only lever that exists for it, the same way it already is for
 *      z-index and opacity above.
 *
 * It also refuses multi-token strings written outside `cva`, `cn` and `className`: those would
 * be classes the "every class compiles" test cannot see.
 *
 * Escape hatch: `// cubby-ui-lint-ignore <reason>` on the offending line or the line above it.
 * Reach for it and you have almost certainly found a missing token instead — ask for the token.
 *
 * Run: `pnpm --filter @cubby-ui/registry lint:tokens` (also runs inside `pnpm run ci`).
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { classLiterals, scanSource, uiSources } from "./class-strings.ts";

export interface Finding {
  file: string;
  line: number;
  rule: string;
  text: string;
}

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const UNIT_NUMBER =
  /(?<![\w-])\d+(?:\.\d+)?(?:px|rem|em|vh|vw|vmin|vmax|pt|pc|cm|mm|in|ch|ex|%|deg|turn|ms|s)(?![\w-])/g;
const TOKEN_REFERENCE = /var\(\s*--[A-Za-z][\w-]*\s*\)|--[A-Za-z][\w-]*/g;
const ARBITRARY_GROUP = /\[[^\]]*\]|\([^)]*\)/g;
const Z_INDEX_SCALE = /^-?z-\d+$/;
const OPACITY_SCALE = /^opacity-(\d+)$/;
const DURATION_SCALE = /^duration-\d+$/;
const IGNORE = /cubby-ui-lint-ignore/;

/**
 * The utility a class candidate ends in, variant prefixes stripped — `hover:opacity-100` is
 * `opacity-100`, `focus-visible:outline-(length:--stroke-focus)` is `outline-(length:--stroke-
 * focus)` (the colon inside `(...)` is not a variant separator, so it does not count).
 */
function baseUtility(candidate: string): string {
  let depth = 0;
  let lastColon = -1;
  for (let i = 0; i < candidate.length; i += 1) {
    const char = candidate[i];
    if (char === "(" || char === "[") depth += 1;
    else if (char === ")" || char === "]") depth -= 1;
    else if (char === ":" && depth === 0) lastColon = i;
  }
  return candidate.slice(lastColon + 1);
}

const lineOf = (source: string, index: number) => source.slice(0, index).split("\n").length;

/** True when the author explicitly silenced this line. */
function silenced(lines: string[], line: number): boolean {
  const own = lines[line - 1] ?? "";
  const above = lines[line - 2] ?? "";
  return IGNORE.test(own) || IGNORE.test(above);
}

/**
 * `"use client";` and friends: a bare string *statement* at the very top of the file — nothing
 * but whitespace precedes it, nothing but an optional `;` follows it on that line. Syntactically
 * a directive prologue, never a class list, regardless of which words it contains.
 */
function isDirectivePrologue(source: string, literal: { value: string; start: number; end: number }): boolean {
  const quote = source[literal.start - 1];
  if (quote !== '"' && quote !== "'") return false;
  if (source.slice(0, literal.start - 1).trim() !== "") return false;
  return /^;?[ \t]*(\r?\n|$)/.test(source.slice(literal.end + 1));
}

export function lintSource(source: string, file: string): Finding[] {
  const scan = scanSource(source);
  const lines = source.split("\n");
  const findings: Finding[] = [];

  const report = (index: number, rule: string, text: string) => {
    const line = lineOf(source, index);
    if (silenced(lines, line)) return;
    findings.push({ file, line, rule, text });
  };

  for (const match of scan.code.matchAll(HEX)) {
    report(match.index, "hex-colour", match[0]);
  }

  for (const match of scan.code.matchAll(UNIT_NUMBER)) {
    report(match.index, "css-unit-literal", match[0]);
  }

  for (const literal of classLiterals(source)) {
    for (const candidate of literal.value.split(/\s+/).filter(Boolean)) {
      for (const group of candidate.match(ARBITRARY_GROUP) ?? []) {
        if (/\d/.test(group.replace(TOKEN_REFERENCE, ""))) {
          report(literal.start, "arbitrary-number", candidate);
        }
      }

      const utility = baseUtility(candidate);

      if (Z_INDEX_SCALE.test(utility)) {
        report(literal.start, "z-index-literal", candidate);
      }

      const opacity = OPACITY_SCALE.exec(utility);
      if (opacity && opacity[1] !== "0" && opacity[1] !== "100") {
        report(literal.start, "opacity-literal", candidate);
      }

      if (DURATION_SCALE.test(utility)) {
        report(literal.start, "duration-literal", candidate);
      }
    }
  }

  for (const match of scan.masked.matchAll(/\bstyle\s*=\s*\{/g)) {
    const open = match.index + match[0].length - 1;
    let depth = 0;
    let close = scan.masked.length;
    for (let i = open; i < scan.masked.length; i += 1) {
      if (scan.masked[i] === "{") depth += 1;
      else if (scan.masked[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    const region = scan.code.slice(open, close);
    for (const number of region.matchAll(/(?<![\w-])\d+(?:\.\d+)?/g)) {
      report(open + number.index, "inline-style-number", `style={{ … ${number[0]} … }}`);
    }
  }

  const classLiteralStarts = new Set(classLiterals(source).map((literal) => literal.start));
  for (const literal of scan.literals) {
    if (classLiteralStarts.has(literal.start)) continue;
    if (!/\s/.test(literal.value.trim())) continue;
    if (isDirectivePrologue(source, literal)) continue;
    report(literal.start, "class-list-out-of-place", literal.value.trim().slice(0, 60));
  }

  return findings;
}

/** Runs `lintSource` over every file `uiSources` finds — `src/ui/**` and `src/lib/**`. */
export function lintUi(): Finding[] {
  return uiSources().flatMap(({ name, source }) => lintSource(source, name));
}

const entry = process.argv[1] === undefined ? "" : realpathSync(process.argv[1]);

if (entry === realpathSync(fileURLToPath(import.meta.url))) {
  const findings = lintUi();
  if (findings.length === 0) {
    console.log(`lint:tokens — ${uiSources().length} files, no literals.`);
  } else {
    for (const finding of findings) {
      console.error(`${finding.file}:${finding.line}  ${finding.rule}  ${finding.text}`);
    }
    console.error(`\nlint:tokens failed with ${findings.length} finding(s).`);
    process.exitCode = 1;
  }
}
