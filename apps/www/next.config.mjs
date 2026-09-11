import path from "node:path";

/**
 * The repository root. Two things need it:
 *
 * - Turbopack refuses to resolve files above its `root`, and this app imports the
 *   registry sources from `packages/registry/src`;
 * - without `outputFileTracingRoot` Next guesses the workspace root from the nearest
 *   lockfile and warns about it on every build.
 */
const repoRoot = path.resolve(import.meta.dirname, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /*
   * `next dev` writes an `AGENTS.md` and a `CLAUDE.md` into this package by default.
   * This repository's documentation contract is the AGENTS.md at the ROOT, and a
   * generated `CLAUDE.md` here containing only `@AGENTS.md` would point an agent at
   * the wrong one. The information it carries is kept instead: Next 16 has breaking
   * changes against older training data — read
   * `apps/www/node_modules/next/dist/docs/` before changing anything in this app.
   */
  agentRules: false,

  // The two workspace packages ship TypeScript and CSS, never a build output.
  transpilePackages: ["@cubby-ui/registry", "@cubby-ui/tokens"],

  turbopack: {
    // Next 16 runs Turbopack by default; the option is `turbopack.resolveAlias`
    // (checked against `node_modules/next/dist/server/config-shared.d.ts`,
    // `interface TurbopackOptions`, next 16.3.5 — `experimental.turbo` is gone).
    // No `resolveAlias` here on purpose: Next already reads `compilerOptions.paths`
    // from tsconfig.json, which is where the three `@/…` prefixes are declared and
    // where their priority (`@/lib/*` and `@/registry/cubby/*` before `@/*`) is
    // expressed. Two sources of truth for one alias map is how they drift apart.
    root: repoRoot,
  },

  // The props table runs the TypeScript compiler during static generation
  // (`site/props.ts`). Neither of these belongs inside a bundle: they are required
  // at run time from node_modules instead.
  serverExternalPackages: ["typescript", "react-docgen-typescript"],

  outputFileTracingRoot: repoRoot,

  // Both the component pages and the markdown mirror read component sources from
  // disk. Static generation does that at build time, but the trace keeps the files
  // next to the server output so nothing breaks if a route ever stops being static.
  outputFileTracingIncludes: {
    "/components/[slug]": ["../../packages/registry/src/**/*", "./components/examples/**/*"],
    "/r/[slug]": ["../../packages/registry/src/**/*", "./components/examples/**/*"],
    "/llms-full.txt": ["../../packages/registry/src/**/*", "./components/examples/**/*"],
  },
};

export default nextConfig;
