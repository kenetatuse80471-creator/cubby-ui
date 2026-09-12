/**
 * Every class written in the site's own sources must be a class Tailwind can actually build.
 *
 * The registry has the same gate (`packages/registry/test/classes.test.ts`) and it exists for the
 * same reason, but the site needs its own: since the token build resets Tailwind's default scales
 * to `initial`, a utility that is not backed by a token produces **no CSS at all** and fails
 * silently. `py-16` looks like ordinary Tailwind and is nothing here — the spacing scale is named
 * by value (`--spacing-0/1/…/7/28/40/48/64`), so there is no `16`. That is exactly how the landing
 * hero ended up jammed against the header without anyone noticing.
 *
 * The check builds the site's real stylesheet with the Tailwind CLI, then looks up every utility
 * written in `app/**` and `components/**` in the output. The class extractor is shared with the
 * registry gate so both gates answer "which strings become a class attribute?" the same way.
 *
 * Escape hatch: a line carrying `cubby-ui-allow-unknown-class` is skipped.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { classCandidates } from "../../../packages/registry/scripts/class-strings.ts";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const scanned = ["app", "components", "site"];
const IGNORE_UNKNOWN = /cubby-ui-allow-unknown-class/;

/** Builds the stylesheet the site actually ships, from its own entry point. */
function buildCss(): string {
  const dir = mkdtempSync(join(tmpdir(), "cubby-www-classes-"));
  const out = join(dir, "out.css");
  const cli = join(appRoot, "node_modules", ".bin", "tailwindcss");
  execFileSync(cli, ["-i", join(appRoot, "app", "globals.css"), "-o", out], {
    cwd: appRoot,
    stdio: "pipe",
  });
  return readFileSync(out, "utf8");
}

/**
 * True when the stylesheet carries a rule for this class. Backslashes are dropped first so an
 * escaped selector (`.hover\:border-site-border-strong:hover`) matches the plain class name; the
 * character after it must end the name, so `.p-4` never matches `.p-40`.
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

function sourcesIn(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...sourcesIn(path));
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) found.push(path);
  }
  return found;
}

const css = buildCss();
const missing: string[] = [];
let checked = 0;

for (const dir of scanned) {
  for (const path of sourcesIn(join(appRoot, dir))) {
    const source = readFileSync(path, "utf8");
    const lines = source.split("\n");
    const label = relative(appRoot, path);
    for (const candidate of classCandidates(source, label)) {
      if (IGNORE_UNKNOWN.test(lines[candidate.line - 1] ?? "")) continue;
      checked += 1;
      if (!hasRule(css, candidate.value)) {
        missing.push(`${candidate.file}:${candidate.line}  ${candidate.value}`);
      }
    }
  }
}

// A sanity floor: if the extractor stops finding class lists the gate would pass on nothing.
if (checked < 200) {
  console.error(`lint:classes expected to check at least 200 classes, checked ${checked}.`);
  process.exit(1);
}

if (missing.length > 0) {
  console.error(
    `Tailwind builds no rule for ${missing.length} class(es) — they produce no CSS at all:\n` +
      missing.map((line) => `  ${line}`).join("\n") +
      `\n\nThe default Tailwind scales are reset by the token build, so only token-backed ` +
      `utilities exist. Add a named token in app/site-theme.css, or use one that is already there.`,
  );
  process.exit(1);
}

console.log(`lint:classes — ${checked} classes, all of them build.`);
