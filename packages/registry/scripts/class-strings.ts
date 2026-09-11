/**
 * Finds the class lists inside a component or lib source, and only those.
 *
 * Both quality gates need the same answer to the same question — "which strings in this file
 * end up in a `class` attribute?" — so they ask it here. A class list is a string literal that
 * sits in one of exactly three places:
 *
 *   1. the first argument of `cva(...)`      — the base classes;
 *   2. the `variants: { ... }` object of `cva(...)`, and the `class` / `className` key of a
 *      `compoundVariants` entry;
 *   3. anywhere inside a `cn(...)` call, or directly in a `className="..."` attribute.
 *
 * `defaultVariants` is deliberately skipped: its values are variant *names* ("md", "primary"),
 * not classes. Everything else in the file — `data-slot="icon-button"`, `role="status"` — is
 * left alone, which is why those places are the only ones a class list may live in.
 *
 * The scan covers `src/ui` (components) and `src/lib` (shared helpers, e.g. `cn.ts`'s own
 * `textStyleNames` never appear in a class position, but a future lib helper composing classes
 * would be missed by both gates if this file only looked at `src/ui`).
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
export const uiDir = join(packageRoot, "src", "ui");
export const libDir = join(packageRoot, "src", "lib");

/** Every directory the gates scan, paired with the label findings report it under. */
const sourceDirs = [
  { dir: uiDir, label: "src/ui" },
  { dir: libDir, label: "src/lib" },
];

export interface Literal {
  /** Contents of the string, quotes removed. */
  value: string;
  /** Offset of the first character of the contents. */
  start: number;
  /** Offset just past the last character of the contents. */
  end: number;
  /** 1-based line of the opening quote. */
  line: number;
}

export interface Scan {
  source: string;
  /** Comments and string contents blanked out — safe to match structure against. */
  masked: string;
  /** Comments blanked out, string contents kept — what the literal rules read. */
  code: string;
  literals: Literal[];
}

const blank = (text: string) => text.replace(/[^\n]/g, " ");

/** Splits a source into code, comments and string literals in one pass. */
export function scanSource(source: string): Scan {
  const masked: string[] = [];
  const code: string[] = [];
  const literals: Literal[] = [];
  let line = 1;
  let i = 0;

  const push = (text: string, { keepInCode }: { keepInCode: boolean }) => {
    masked.push(blank(text));
    code.push(keepInCode ? text : blank(text));
    line += (text.match(/\n/g) ?? []).length;
  };

  while (i < source.length) {
    const two = source.slice(i, i + 2);

    if (two === "//") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? source.length : end;
      push(source.slice(i, stop), { keepInCode: false });
      i = stop;
      continue;
    }

    if (two === "/*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? source.length : end + 2;
      push(source.slice(i, stop), { keepInCode: false });
      i = stop;
      continue;
    }

    const quote = source[i];
    if (quote === '"' || quote === "'" || quote === "`") {
      const openLine = line;
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source[j] === quote) break;
        j += 1;
      }
      const contents = source.slice(i + 1, j);
      literals.push({ value: contents, start: i + 1, end: j, line: openLine });
      // The quotes stay so offsets line up; only the contents are blanked in `masked`.
      masked.push(quote + blank(contents) + (source[j] ?? ""));
      code.push(source.slice(i, Math.min(j + 1, source.length)));
      line = openLine + (contents.match(/\n/g) ?? []).length;
      i = j + 1;
      continue;
    }

    const next = source[i] as string;
    masked.push(next);
    code.push(next);
    if (next === "\n") line += 1;
    i += 1;
  }

  return { source, masked: masked.join(""), code: code.join(""), literals };
}

const PAIRS: Record<string, string> = { "(": ")", "{": "}", "[": "]" };

/** Index just past the bracket that closes the one at `open`, in a masked source. */
function closeOf(masked: string, open: number): number {
  const opener = masked[open] as string;
  const closer = PAIRS[opener] as string;
  let depth = 0;
  for (let i = open; i < masked.length; i += 1) {
    if (masked[i] === opener) depth += 1;
    else if (masked[i] === closer) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return masked.length;
}

const literalsBetween = (scan: Scan, from: number, to: number) =>
  scan.literals.filter((literal) => literal.start >= from && literal.end <= to);

/**
 * Names bound by `const xVariants = cva(...)` — cva's own convention. A call to one of them,
 * `avatarVariants({ variant: tone ? "neutral" : variant })`, takes variant *keys*, never
 * classes: the classes for "neutral" already live inside the `cva(...)` definition itself and
 * are picked up by the scan above. Nesting such a call inside `cn(...)` must not make its
 * arguments look like class literals too.
 */
function variantsFunctionNames(masked: string): Set<string> {
  const names = new Set<string>();
  for (const match of masked.matchAll(/\b([A-Za-z_$][\w$]*)\s*=\s*cva\s*\(/g)) {
    names.add(match[1] as string);
  }
  return names;
}

/** Spans of calls to any of `names` that start within `[from, to)`, parens included. */
function nestedCallSpans(masked: string, names: Set<string>, from: number, to: number) {
  const spans: Array<[number, number]> = [];
  if (names.size === 0) return spans;
  const alternation = [...names].map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`\\b(?:${alternation})\\s*\\(`, "g");
  for (const match of masked.slice(from, to).matchAll(pattern)) {
    const open = from + (match.index as number) + match[0].length - 1;
    spans.push([open, closeOf(masked, open)]);
  }
  return spans;
}

const insideAnySpan = (spans: Array<[number, number]>, index: number) =>
  spans.some(([from, to]) => index >= from && index <= to);

/**
 * True for a literal sitting right against `===`/`!==`/`==`/`!=` — `size === "sm"` is a
 * comparison, never a class; the class lives in the ternary's branches, not in its test.
 */
function isComparisonOperand(masked: string, literal: Literal): boolean {
  const before = masked.slice(0, literal.start - 1);
  const after = masked.slice(literal.end + 1);
  return /[=!]==?\s*$/.test(before) || /^\s*[=!]==?/.test(after);
}

/** Every string literal that becomes part of a `class` attribute. */
export function classLiterals(source: string): Literal[] {
  const scan = scanSource(source);
  const found = new Map<number, Literal>();
  const variantsFns = variantsFunctionNames(scan.masked);
  const take = (literal: Literal) => {
    if (isComparisonOperand(scan.masked, literal)) return;
    found.set(literal.start, literal);
  };

  for (const match of scan.masked.matchAll(/\bcva\s*\(/g)) {
    const open = match.index + match[0].length - 1;
    const close = closeOf(scan.masked, open);

    // Argument 0 — the base classes. Ends at the first comma outside any bracket.
    let depth = 0;
    let firstComma = close;
    for (let i = open + 1; i < close; i += 1) {
      const char = scan.masked[i] as string;
      if (char === "(" || char === "{" || char === "[") depth += 1;
      else if (char === ")" || char === "}" || char === "]") depth -= 1;
      else if (char === "," && depth === 0) {
        firstComma = i;
        break;
      }
    }
    for (const literal of literalsBetween(scan, open, firstComma)) take(literal);

    const body = scan.masked.slice(open, close);

    const variants = /\bvariants\s*:\s*\{/.exec(body);
    if (variants) {
      const braceAt = open + variants.index + variants[0].length - 1;
      for (const literal of literalsBetween(scan, braceAt, closeOf(scan.masked, braceAt))) take(literal);
    }

    const compound = /\bcompoundVariants\s*:\s*\[/.exec(body);
    if (compound) {
      const bracketAt = open + compound.index + compound[0].length - 1;
      const bracketEnd = closeOf(scan.masked, bracketAt);
      const region = scan.masked.slice(bracketAt, bracketEnd);
      for (const key of region.matchAll(/\b(?:class|className)\s*:\s*/g)) {
        const after = bracketAt + key.index + key[0].length;
        const literal = scan.literals.find((candidate) => candidate.start >= after);
        if (literal && literal.end <= bracketEnd) take(literal);
      }
    }
  }

  for (const match of scan.masked.matchAll(/\bcn\s*\(/g)) {
    const open = match.index + match[0].length - 1;
    const close = closeOf(scan.masked, open);
    const nested = nestedCallSpans(scan.masked, variantsFns, open, close);
    for (const literal of literalsBetween(scan, open, close)) {
      if (insideAnySpan(nested, literal.start)) continue;
      take(literal);
    }
  }

  for (const match of scan.masked.matchAll(/\bclassName\s*=\s*\{?\s*/g)) {
    const after = match.index + match[0].length;
    const literal = scan.literals.find((candidate) => candidate.start === after + 1);
    if (literal) take(literal);
  }

  return [...found.values()].sort((a, b) => a.start - b.start);
}

export interface Candidate {
  value: string;
  line: number;
  file: string;
}

/** Every whitespace-separated utility written in a file. */
export function classCandidates(source: string, file: string): Candidate[] {
  return classLiterals(source).flatMap((literal) =>
    literal.value
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => ({ value, line: literal.line, file })),
  );
}

export interface SourceFile {
  path: string;
  name: string;
  source: string;
}

function sourcesIn(dir: string, label: string): SourceFile[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".tsx") || name.endsWith(".ts"))
    .sort()
    .map((name) => ({
      name: `${label}/${name}`,
      path: join(dir, name),
      source: readFileSync(join(dir, name), "utf8"),
    }));
}

/** Every registry component and lib source the gates scan — `src/ui/**` then `src/lib/**`. */
export function uiSources(): SourceFile[] {
  return sourceDirs.flatMap(({ dir, label }) => sourcesIn(dir, label));
}
