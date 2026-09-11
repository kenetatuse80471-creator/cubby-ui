# Third-party notices

Cubby UI is MIT licensed (see `LICENSE`). This file lists third-party code redistributed as part
of it, together with the notices those licences require.

## beUI — site machinery of `apps/www`

- Upstream: <https://github.com/starc007/ui-components>
- Upstream commit this repository's copies were taken from:
  **`b64c092b63b99c7340376b522325ea309156ba00`**
- Licence: MIT
- Copyright (c) 2026 Saurabh Chauhan

### Files in this repository derived from beUI

These and only these. Every other file under `apps/www` was written here from scratch — the
shell, the catalogue, the examples, the pages, the styles and the `llms-full.txt` route included.

| File in this repository | Derived from (upstream path) | What was taken |
| --- | --- | --- |
| `apps/www/site/site.ts` | `lib/site.ts`, `lib/signature.ts` | the `SITE_URL` environment override, and `pageUrlFor` |
| `apps/www/site/source-files.ts` | `lib/source-files.ts` | reading source files relative to a project root, and the "Missing source file" failure |
| `apps/www/site/component-status.ts` | `lib/component-status.ts` | the whole NEW-badge expiry calculation |
| `apps/www/site/props.ts` | `lib/props-extractor.ts` | the shared `ts.Program` provider, the docgen configuration, and filtering inherited props by their declaring file |
| `apps/www/site/component-markdown.ts` | `lib/component-markdown.ts` | the shape of the markdown document: front matter, install, dependencies, usage, API reference, source |
| `apps/www/app/r/[slug]/route.ts` | `app/r/[slug]/route.ts` | `generateStaticParams` per extension, and the response headers |
| `apps/www/app/registry.json/route.ts` | `app/registry.json/route.ts` | the route and its headers |
| `apps/www/app/llms.txt/route.ts` | `app/llms.txt/route.ts` | the document's sections and the one-line-per-component list |
| `apps/www/app/robots.ts` | `app/robots.ts` | the `MetadataRoute.Robots` shape |
| `apps/www/app/sitemap.ts` | `app/sitemap.ts` | the `MetadataRoute.Sitemap` shape |
| `apps/www/app/manifest.ts` | `app/manifest.ts` | the `MetadataRoute.Manifest` shape |

Not carried over, deliberately: the beUI name, logo and brand assets, `brand.md`, marketing copy,
testimonials, sponsor names, the landing page, the documentation shell and its visual design, the
`components/motion`, `components/agents` and `components/previews` trees, `lib/registry.ts`,
`lib/themes.ts`, `lib/agent-guides.ts`, the OKLCH theme set and the analytics. Those are not code
the MIT licence would oblige us to credit, or not code we want.

Credit line, as the licence requires, is in the site footer (`apps/www/components/site-footer.tsx`)
and in `README.md`.

### beUI licence, reproduced verbatim

  MIT License

  Copyright (c) 2026 Saurabh Chauhan

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

## Inter — the font files of `apps/www`

The site self-hosts Inter through `@fontsource-variable/inter` (5.3.0) rather than fetching it from
a CDN, so four `.woff2` subsets are redistributed inside the built site. The font is licensed under
the SIL Open Font License 1.1, which requires the notice to travel with those files:

> Copyright 2016 The Inter Project Authors (<https://github.com/rsms/inter>)
>
> This Font Software is licensed under the SIL Open Font License, Version 1.1.

The full licence text ships in the package, at
`apps/www/node_modules/@fontsource-variable/inter/LICENSE`, and is also at
<http://scripts.sil.org/OFL>. Reserved Font Name: **Inter**. `apps/www/app/globals.css` declares
the faces under the family name `Inter` so the `--font` token resolves; that is a `@font-face`
alias, not a modification of the font software.

## Nothing else, yet

No other third-party source is vendored. Ordinary npm dependencies are not listed here — they are
installed, not redistributed.
