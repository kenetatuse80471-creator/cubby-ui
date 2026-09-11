# `apps/www` — the Cubby UI site

The showcase, the documentation and the registry endpoints. Scaffolded 12.09.2026; the shell and
the landing page are structural placeholders waiting for the visual pass.

```bash
pnpm install
pnpm --filter www dev     # http://localhost:4320
pnpm --filter www build
```

`dev` and `build` both run `registry:build` first, which regenerates `apps/www/public/r/` with the
shadcn CLI. That directory is git-ignored: the JSON is a build product of the root `registry.json`.

## What is where

| Path | What lives there |
| --- | --- |
| `app/` | Routes. Pages, the machine endpoints (`/r/*.md`, `/registry.json`, `/llms*.txt`), `robots`, `sitemap`, `manifest`. |
| `app/globals.css` | Tailwind, the tokens, Inter, the Shiki theme swap. |
| `app/site-theme.css` | The shell's own scale — measured, `--site-*`, not part of the library. |
| `site/` | Server-side machinery: the catalogue, the registry reader, the examples map, Shiki, the props extractor, the markdown mirror. **Not `lib/`** — see below. |
| `components/` | React components of the site, including `components/examples/`. |

### Why `site/` and not `lib/`

Registry sources import `@/lib/cn` and `@/registry/cubby/ui/*`, and those two prefixes have to
resolve into `packages/registry/src` — which means this app cannot also own `@/lib/*`. The three
aliases in `tsconfig.json` are ordered by specificity, and `@/*` falls through to this package, so
the site's own machinery lives in `site/` and is imported as `@/site/…`.

## Decided in advance, still true

- `/r/` (free, static) and `/pro/` (reserved) are separate routes from day one, so monetisation
  never requires a re-architecture. `/pro/*` answers 404 and there is no access check by design.
- Licence hygiene: parts of the machinery are derived from beUI (MIT). `THIRD-PARTY-NOTICES.md`
  lists them file by file with the upstream commit, and the footer carries the credit line.

Two things changed against the original plan (recorded in `REPORT-www-scaffold.md`): the fork was
not taken wholesale — eleven files were adapted and the rest written here — and the app runs on
this repository's own tooling (pnpm, ESLint 9, Turborepo), not on beUI's Bun and Biome.
