import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Reading source files off disk at build time.
 *
 * Adapted from beUI (`lib/source-files.ts`), MIT, Copyright (c) 2026 Saurabh
 * Chauhan — see THIRD-PARTY-NOTICES.md. Reduced to the two roots this site needs;
 * the upstream import-resolution helpers are not carried over, because nothing
 * here walks a component's imports.
 *
 * Two roots, and the difference matters:
 *
 * - the **repository root** is where `registry.json` lives and what every
 *   `files[].path` inside it is relative to (`packages/registry/src/ui/button.tsx`);
 * - the **app root** is this package, which is also `process.cwd()` for
 *   `next dev` / `next build`, and what the example paths are relative to
 *   (`components/examples/button/default.tsx`).
 */
/*
 * About `turbopackIgnore` below. Turbopack sees a `path.join` whose second half is a
 * variable and concludes it cannot know which files the route will open, so it traces
 * the entire project into the server output — `public/` included. Every route that
 * reads through this module is `force-static`: the reads happen during `next build`,
 * and the built page carries the text, not the reader. For the one case where that
 * stops being true — a route turned dynamic later — `next.config.mjs` names these
 * directories in `outputFileTracingIncludes` explicitly, which is a list a human can
 * read instead of a guess the bundler makes.
 */
const APP_ROOT = process.cwd();
const REPO_ROOT = path.resolve(APP_ROOT, "..", "..");

/** Read a file addressed the way `registry.json` addresses it. */
export async function readRepoFile(relToRepoRoot: string) {
  const absolute = path.join(/* turbopackIgnore: true */ REPO_ROOT, relToRepoRoot);
  try {
    return await fs.readFile(absolute, "utf8");
  } catch (error) {
    throw new Error(`Missing source file: ${relToRepoRoot} (looked in ${REPO_ROOT})`, {
      cause: error,
    });
  }
}

export async function readOptionalRepoFile(relToRepoRoot: string) {
  try {
    return await fs.readFile(path.join(/* turbopackIgnore: true */ REPO_ROOT, relToRepoRoot), "utf8");
  } catch {
    return null;
  }
}

/** Read a file of this app — an example file, for instance. */
export async function readAppFile(relToAppRoot: string) {
  const absolute = path.join(/* turbopackIgnore: true */ APP_ROOT, relToAppRoot);
  try {
    return await fs.readFile(absolute, "utf8");
  } catch (error) {
    throw new Error(`Missing site file: ${relToAppRoot} (looked in ${APP_ROOT})`, { cause: error });
  }
}

/** The Shiki language for a path, by extension. */
export function codeLanguage(filePath: string) {
  if (filePath.endsWith(".tsx")) return "tsx";
  if (filePath.endsWith(".ts")) return "ts";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".json")) return "json";
  return "text";
}
