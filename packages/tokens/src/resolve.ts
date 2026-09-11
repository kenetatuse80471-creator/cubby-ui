/**
 * Alias resolver and naming rules for the Figma variables export.
 *
 * Two things live here because both the generator and its tests need them:
 *  1. `resolveValue` — walks `{ "alias": "Collection/path" }` references, recursively and
 *     per mode, until a literal is reached. A missing target or a cycle is a build error.
 *  2. `cssVariableName` — the single naming rule (see README of this package).
 */

import { isAlias, type Collection, type TokenValue, type TokensFile, type Variable } from "./schema.ts";

export class TokenBuildError extends Error {
  override name = "TokenBuildError";
}

export interface Entry {
  collection: Collection;
  variable: Variable;
  /** `Collection/path`, the exact form an alias uses. */
  key: string;
  /** CSS custom property name including the leading `--`, or null for hidden primitives. */
  cssName: string | null;
}

export interface Index {
  byKey: Map<string, Entry>;
  entries: Entry[];
}

/**
 * `var(--bg-app)` → `--bg-app`. Anything else in `codeSyntax.WEB` is a source defect:
 * we refuse to guess, because a wrong name silently breaks a consumer.
 */
export function parseCodeSyntax(web: string, where: string): string {
  const match = /^var\(\s*(--[A-Za-z0-9_-]+)\s*\)$/.exec(web.trim());
  if (!match?.[1]) {
    throw new TokenBuildError(
      `${where}: codeSyntax.WEB must be exactly "var(--name)", got ${JSON.stringify(web)}`,
    );
  }
  return match[1];
}

/**
 * Naming rule for variables whose `codeSyntax.WEB` is null.
 *
 * Drop the first path segment — it repeats the collection's role word (`color`, `size`, …) —
 * and join the rest with `-`:
 *
 *   color/accent/wash      → --accent-wash
 *   size/comp/menu-item    → --comp-menu-item
 *   size/layout/window-h   → --layout-window-h
 *
 * A single-segment path keeps its only segment. Collisions produced by this rule are caught
 * by the emitter, never resolved silently.
 */
export function nameFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) {
    throw new TokenBuildError(`Cannot derive a CSS name from an empty path`);
  }
  const tail = segments.length === 1 ? segments : segments.slice(1);
  return `--${tail.join("-").toLowerCase()}`;
}

export function cssVariableName(collection: Collection, variable: Variable): string | null {
  // Primitives are hidden in Figma and inlined in CSS, exactly as in the Altis tokens.css.
  if (collection.hidden) return null;
  const web = variable.codeSyntax?.WEB;
  if (web) return parseCodeSyntax(web, `${collection.name}/${variable.name}`);
  return nameFromPath(variable.name);
}

export function buildIndex(file: TokensFile): Index {
  const byKey = new Map<string, Entry>();
  const entries: Entry[] = [];
  for (const collection of file.collections) {
    for (const variable of collection.variables) {
      const key = `${collection.name}/${variable.name}`;
      if (byKey.has(key)) {
        throw new TokenBuildError(`Duplicate variable key ${key} in the source export`);
      }
      const entry: Entry = {
        collection,
        variable,
        key,
        cssName: cssVariableName(collection, variable),
      };
      byKey.set(key, entry);
      entries.push(entry);
    }
  }
  return { byKey, entries };
}

/**
 * Pick the mode of the *target* collection to follow.
 *
 * A Color variable resolved for `Dark` follows a Primitives alias into that collection's only
 * mode (`Value`); a Color → Color alias keeps `Dark`. Anything else is ambiguous and fails.
 */
function targetMode(target: Entry, mode: string, from: string): string {
  if (Object.prototype.hasOwnProperty.call(target.variable.values, mode)) return mode;
  const modes = Object.keys(target.variable.values);
  if (modes.length === 1 && modes[0]) return modes[0];
  throw new TokenBuildError(
    `${from}: alias target ${target.key} has no mode "${mode}" (modes: ${modes.join(", ")})`,
  );
}

export interface ResolveStep {
  entry: Entry;
  mode: string;
}

/** One hop: returns the alias target entry, or null when the value is already a literal. */
export function aliasTarget(index: Index, entry: Entry, mode: string): ResolveStep | null {
  const raw = entry.variable.values[mode];
  if (raw === undefined) {
    throw new TokenBuildError(
      `${entry.key}: no value for mode "${mode}" (modes: ${Object.keys(entry.variable.values).join(", ")})`,
    );
  }
  if (!isAlias(raw)) return null;
  const target = index.byKey.get(raw.alias);
  if (!target) {
    throw new TokenBuildError(`${entry.key} [${mode}]: alias target "${raw.alias}" does not exist`);
  }
  return { entry: target, mode: targetMode(target, mode, `${entry.key} [${mode}]`) };
}

/** Follow aliases to the literal value. Cycles and missing targets fail the build. */
export function resolveValue(index: Index, entry: Entry, mode: string): string | number {
  const seen = new Set<string>();
  let current: ResolveStep = { entry, mode };
  for (;;) {
    const marker = `${current.entry.key}|${current.mode}`;
    if (seen.has(marker)) {
      throw new TokenBuildError(
        `${entry.key} [${mode}]: alias cycle through ${[...seen].join(" -> ")} -> ${marker}`,
      );
    }
    seen.add(marker);
    const next = aliasTarget(index, current.entry, current.mode);
    if (!next) {
      const raw: TokenValue | undefined = current.entry.variable.values[current.mode];
      if (raw === undefined || isAlias(raw)) {
        throw new TokenBuildError(`${entry.key} [${mode}]: unresolved value`);
      }
      return raw;
    }
    current = next;
  }
}

/**
 * What CSS should print for this variable in this mode:
 *  - `{ kind: "literal" }` — the value, with primitives inlined;
 *  - `{ kind: "var", name }` — a `var()` reference, when the alias points at a variable that
 *    is itself emitted (Color → Color, Radius → Radius). This keeps the two-tier model.
 */
export type Emitted =
  | { kind: "literal"; value: string | number }
  | { kind: "var"; name: string; target: Entry };

export function emittedValue(index: Index, entry: Entry, mode: string): Emitted {
  const step = aliasTarget(index, entry, mode);
  if (step && step.entry.cssName) {
    return { kind: "var", name: step.entry.cssName, target: step.entry };
  }
  return { kind: "literal", value: resolveValue(index, entry, mode) };
}
