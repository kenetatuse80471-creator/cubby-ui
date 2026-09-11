# `apps/www` — scaffold report

Branch `feat/www-scaffold`, from `main` at `091190c`. 12.09.2026.

The task was infrastructure, not visual design: a Next application the next executors can sit a
designed shell on. Pages are structurally right and honestly working; they are not polished, and
the places that are placeholders say so in the file.

---

## 1. What was built

### Package and configuration

| File | What it does |
| --- | --- |
| `package.json` | Workspace package **named `www`**, so the owner runs exactly `pnpm --filter www dev`. `prebuild` and `predev` regenerate `public/r`. |
| `tsconfig.json` | Extends `tsconfig.base.json`; three `paths` prefixes ordered by specificity (see §3.1). |
| `next.config.mjs` | `transpilePackages`, `turbopack.root`, `outputFileTracingRoot/Includes`, `serverExternalPackages`, `agentRules: false`. |
| `postcss.config.mjs` | `@tailwindcss/postcss`, exactly as the playground does it for Vite. |
| `.gitignore` | `public/r/`, `next-env.d.ts`, `.screenshots/`. |
| `README.md` | Rewritten: it used to say "empty on purpose". |

### Styles

| File | What it does |
| --- | --- |
| `app/globals.css` | `@import "tailwindcss"` → tokens → theme → `site-theme.css`; `@source` for the registry and this app; four self-hosted Inter faces; `color-scheme`; body font/colour/background; the Shiki light-theme swap; the hero's 64→40 drop below 600px. |
| `app/site-theme.css` | The shell's own scale: `--site-*` literals in `:root`, mapped into Tailwind namespaces by one `@theme inline` block. Every number measured (§3.4). |

### Machinery — `site/`

| File | What it does |
| --- | --- |
| `site/site.ts` | Origin, name, description, the registry namespace, `pageUrlFor`, `installCommandFor` for four package runners. |
| `site/registry-data.ts` | Reads and **validates** `registry.json`; the only source of user-visible strings. Fails the build if a `registryDependencies` prefix stops matching the site's install namespace. |
| `site/catalog.ts` | Groups, order, launch dates; the completeness gate in both directions (§3.5). |
| `site/component-status.ts` | The NEW badge and when it expires. |
| `site/examples.ts` | Slug → live component **and** the path its source is read from. Typed per previewable slug. |
| `site/source-files.ts` | Reading files from the repository root and from this app. |
| `site/highlight.ts` | Shiki, dual theme, five languages, one highlighter for the build. |
| `site/props.ts` | `react-docgen-typescript` against one shared `ts.Program`; the filter that decides which props are the component's own (§3.6). |
| `site/component-markdown.ts` | The `/r/<slug>.md` document. Also the body of `/llms-full.txt`, so the two cannot disagree. |

### Site components — `components/`

| File | What it does |
| --- | --- |
| `theme-provider.tsx` | next-themes, `attribute="data-theme"`, dark default, no system theme. |
| `theme-toggle.tsx` | One button; which glyph shows is decided by CSS from `data-theme`, so it is correct before hydration and needs no state (§3.7). |
| `site-header.tsx`, `site-footer.tsx` | **Structural placeholders.** The footer carries the beUI credit line, which is not optional. |
| `code-block.tsx` | Shiki HTML, language badge, file path, copy button. Radius 12, body 13/20. |
| `install-command.tsx` | npm / pnpm / yarn / bun switch + copy. |
| `props-table.tsx` | One table per exported component. |
| `copy-button.tsx`, `new-badge.tsx` | Small pieces, both built out of the library's own components. |
| `components/examples/**` | 18 example files across 15 components — `button` and `switch` written as the reference set, the other thirteen honest placeholders (§4). |

### Routes — `app/`

| Route | File | Notes |
| --- | --- | --- |
| `/` | `page.tsx` | **Scaffold landing.** Marked in the file as the placeholder for the real one. |
| `/components` | `components/page.tsx` | The catalogue by group. |
| `/components/[slug]` | `components/[slug]/page.tsx` | Three columns; `force-static` + `generateStaticParams`. |
| `/r/<slug>.md` | `r/[slug]/route.ts` | Markdown mirror. `/r/<slug>.json` is **not** here — it is static output of `shadcn build` in `public/r`. |
| `/registry.json` | `registry.json/route.ts` | The root file, byte for byte. |
| `/llms.txt` | `llms.txt/route.ts` | The map: endpoints, install line, components by group, notes for agents. |
| `/llms-full.txt` | `llms-full.txt/route.ts` | Every component document in one file (161 KB). |
| `/pro/*` | `pro/[...slug]/page.tsx`, `pro/not-found.tsx` | 404, "Pro is not available yet". No access check, by design. |
| `robots.txt`, `sitemap.xml`, `manifest.webmanifest` | `robots.ts`, `sitemap.ts`, `manifest.ts` | |
| 404 | `not-found.tsx` | Built out of our own `EmptyState` + `buttonVariants`. |
| — | `layout.tsx` | Metadata, theme provider, header/footer frame. |

---

## 2. Versions, and where each was checked

Given in the task as checked with `npm view` on 12.09.2026, and installed exactly:
next **16.3.5**, react / react-dom **19.3.0**, tailwindcss + @tailwindcss/postcss **4.3.3**,
typescript **6.0.3**, shiki **4.4.3**, motion **13.2.0**, next-themes **0.4.6**,
@fontsource-variable/inter **5.3.0**, react-docgen-typescript **2.4.0**; from the registry
@base-ui/react **1.8.0**, @hugeicons/react **1.1.10**, @hugeicons/core-free-icons **4.3.2**,
class-variance-authority **0.7.1**, clsx **2.1.1**, tailwind-merge **3.6.0**.

Checked here, against the installed packages rather than from memory:

- **Turbopack alias option** — `node_modules/next/dist/server/config-shared.d.ts`,
  `interface TurbopackOptions`: the field is `turbopack.resolveAlias`; `experimental.turbo` is
  gone in 16.x. Also confirmed `serverExternalPackages` and `agentRules` exist there.
- **`react-docgen-typescript` against TypeScript 6.0.3** — the documented risk. Probed on the real
  component files before writing anything: it works, `ts.version` reported 6.0.3, `Button` came
  back with its own six props. Details in §3.6.
- **Inter's family name** — `node_modules/@fontsource-variable/inter/index.css` registers
  `'Inter Variable'`, not `Inter`. That is what §3.3 is about.
- **Hugeicons glyph names** — every icon used is grepped out of
  `@hugeicons/core-free-icons/dist/types/index.d.ts`, not guessed.

`motion@13.2.0` is installed and **not imported anywhere yet**: it is in the task's version list and
the visual pass needs it, so it is here to save a second `pnpm install`. If the next executor does
not use it, remove it.

---

## 3. Decisions, and why

### 3.1 Aliases: the site's machinery is `site/`, not `lib/`

Registry sources import `@/lib/cn` and `@/registry/cubby/ui/*`; those must resolve into
`packages/registry/src`, because that is what the playground does and what the files themselves
say. So `@/lib/*` is taken, and the site cannot have its own. `tsconfig.json`:

```jsonc
"@/registry/cubby/*": ["../../packages/registry/src/*"],
"@/lib/*":            ["../../packages/registry/src/lib/*"],
"@/*":                ["./*"]                                // falls through to this app
```

TypeScript picks the longest matching prefix, so `@/lib/cn` goes to the registry and
`@/site/catalog` and `@/components/…` come here. The site's machinery therefore lives in
`apps/www/site/` and is imported as `@/site/…`. The alternative — a shim `apps/www/lib/cn.ts`
re-exporting the registry's — was rejected: it would silently break the moment a registry
component imported any other `@/lib/*`.

### 3.2 Turbopack, and no `resolveAlias`

Next 16 runs Turbopack by default and it works here as-is. `turbopack.resolveAlias` is
deliberately **empty**: Next already reads `compilerOptions.paths`, and duplicating a three-entry
alias map in a second file is how the two drift apart. Verified empirically — `next dev` and
`next build` both resolve `@/lib/cn` into the registry and `@/site/*` into the app.

`turbopack.root` and `outputFileTracingRoot` are set to the repository root: without them Next
guesses the workspace root from the nearest lockfile and warns on every build, and Turbopack
refuses to resolve files above its root.

The build's five "Dynamic filesystem access causes tracing of the whole project" warnings were
real, not noise: they would have put every source file and all of `public/` into the server
output. Fixed with `/* turbopackIgnore: true */` at the four read sites, which is safe because
every route that reads is `force-static` — and `outputFileTracingIncludes` names the directories
explicitly for the case where one stops being static. The build is now warning-free.

`agentRules: false`: `next dev` writes an `AGENTS.md` and a `CLAUDE.md` into this package. This
repository's contract is the AGENTS.md at the **root**, and a generated `CLAUDE.md` here holding
only `@AGENTS.md` would point an agent at the wrong one. The information it carried is kept in the
config comment: Next 16 differs from older training data, read `node_modules/next/dist/docs/`.

### 3.3 Inter: declared under the name the token uses

`@fontsource-variable/inter` registers the family as **`Inter Variable`**, while the token says
`--font: "Inter"`. Importing the package stylesheet would leave `var(--font)` pointing at a family
that does not exist, and the page would silently fall back to the system stack.

So `app/globals.css` declares four `@font-face` blocks — latin, latin-ext, cyrillic, cyrillic-ext,
upright only — under the family name **`Inter`**, loading the package's own `.woff2` files by
relative path. Self-hosted, nothing fetched at build time, and `var(--font)` now resolves to a real
loaded face. Verified in the built CSS: four `@font-face` rules with `font-family: Inter`, all four
woff2 files served with 200. Italic is not loaded — nothing in the shell is italic. The fallback
stack is spelled out in the app, as the playground does, because the tokens have none.

Because those four files are redistributed inside the built site, `THIRD-PARTY-NOTICES.md` gained
an Inter (OFL 1.1) section. The `@font-face` alias is not a modification of the font software.

**Monospace — a site-level decision.** The tokens name a mono text style (`--text-mono-sm`) but no
mono family, and the reference spec confirms it (§6.3). A downloaded mono face would cost bytes on
every page for the sake of code samples, so `--site-font-mono` is the system stack
(`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`). The spec's shortlist
(Geist Mono, IBM Plex Mono) is a call to make once there is a brand.

### 3.4 The site scale: measured, `--site-*`, two layers

`app/site-theme.css` holds the shell's own values, and **every number in it comes from the
reference spec** (`scratchpad/references/REFERENCE-SPEC.md`, §6.1 and §6.3), handed over mid-task.
The first draft of this file had invented numbers; they were replaced.

The file is split the way `packages/tokens/dist/{tokens,theme}.css` is split: a `:root` block with
the literals, and one `@theme inline` block mapping them into Tailwind namespaces. So each number
is written once, and replacing the scale means editing one block.

Type 64 / 18 / 36 / 11, tracking −0.025em and +0.22em, leading 0.95 and 1.6, code 13/20.
Layout 1280 / 816 / 240 / 256 / 32 / 56. Vertical rhythm 112-80 and 56-64.

Colour, radius, shadow and duration appear here **only** where §6.3 found the library has no
equivalent step: radii 24/20/12 (the library stops at 16), alpha-white strokes at 5 % and 10 %
(`--border` is opaque `#2F3033` and nearly disappears on `--bg-raised`), the inset highlight, the
float shadow `0 14px 40px`, and the four durations plus `cubic-bezier(.23,1,.32,1)`. Everything the
library does have is used from `@cubby-ui/tokens` directly and is not restated.

Two honest caveats, both written into the file:

- **The light theme is not measured.** The spec covered dark only. The three alpha values are
  inverted by hand under `[data-theme="light"]` so the light theme is not invisible; they are the
  one thing in that file that is a placeholder.
- **1280 does not fit 240 + 816 + 256 + 2×32 = 1376.** On the references the docs shell is
  full-bleed and only the landing is capped, so that is what happens here: the component page is
  not capped at 1280 and the content column carries the 816 cap itself.

### 3.5 The catalogue holds no text, and drift is a build failure

`site/catalog.ts` carries only the editorial part: group, order, `launchedAt`/`badge`. Titles,
descriptions, docs notes, versions, dependencies **and file paths** are read from `registry.json`.
Not copying the file paths is a deliberate extension of the same rule — the registry already states
where each item's source lives, and a second copy is a second thing to forget.

Drift fails the build in both directions and names the slugs:

- a registry item the catalogue does not list → `catalog.ts` throws on import with the fix spelled
  out ("add each slug to `ASSET_SLUGS` or `PREVIEW_SLUGS`, give it a group and an order…");
- a catalogued slug with no registry item → `registryItem()` throws, naming it;
- a previewable slug with no example → **a type error**, because `EXAMPLES` is
  `Record<PreviewSlug, …>` with a non-empty tuple value type.

This is what happens when **Tabs and Tooltip** land: the build stops with a sentence saying exactly
what to add and where. It cannot be missed and it cannot be silently half-done.

**Groups**, decided by what the components are for, not by type:

| Group | Items |
| --- | --- |
| Foundation | tokens, cn, Icon, Divider, Spinner |
| Controls | Button, IconButton, Switch |
| Fields | TextInput, TextArea, Select |
| Display | Tag, Avatar |
| Surfaces | EmptyState, Modal, Snackbar, ContextActionMenu |

`tokens` and `cn` are catalogued but not previewable: one installs two stylesheets, the other a
helper. Their pages show install and source and no preview, which is the truth about them.

All 17 carry `launchedAt: "2026-09-12"` and the NEW badge, because all 17 genuinely shipped that
day. The badge expires by itself on 19.09.2026.

### 3.6 Props tables are real

`react-docgen-typescript` 2.4.0 **works** with TypeScript 6.0.3. Probed before committing to it:
15 component files, one shared `ts.Program`, 1.17 s for the whole site.

The interesting part is which props survive. Every component accepts ~280 native DOM attributes,
and a table of those hides the six that matter. The rule:

| Where the checker says the prop comes from | Kept? | Why |
| --- | --- | --- |
| a file in this repository | yes | the hand-written interface |
| nowhere the checker can name | yes | this is how `cva`'s `VariantProps` resolve — `variant`, `size`, `tone`, `fullWidth` |
| `@base-ui/react` | yes | a primitive's surface **is** the API of the component wrapping it — `Switch` is `Switch.Root`'s props, `checked` included |
| `@types/react` | **no** | the native DOM attributes |

Result: Button 6 props, Switch 16, Modal 16, Select 23, Tag 4, TextArea 1. Docgen also reports
every exported function as a component (`useSnackbar`, `MENU_SIDE_OFFSET`), so entries that do not
look like a component or have no props are dropped.

### 3.7 Theme switching without a mounted flag

The obvious `useEffect(() => setMounted(true))` pattern is flagged by this repo's
`react-hooks/set-state-in-effect`, and rightly. Instead, which glyph the toggle shows is decided by
CSS from `data-theme` on `<html>` — next-themes writes that attribute from a blocking script before
the first paint. No state, no effect, no hydration mismatch, and the correct icon is on screen
before hydration. `resolvedTheme` is read only inside the click handler, which by definition runs
after hydration. Confirmed on the light screenshot: the moon is showing.

### 3.8 Preview and code are the same file

`components/examples/<slug>/<name>.tsx` is imported statically for the live preview and read off
disk at build time for the code block. There is no second copy of any snippet anywhere, so the two
cannot drift. The same files feed `/r/<slug>.md` and `/llms-full.txt`.

### 3.9 `/r/<slug>.json` is not a route

The JSON comes from `shadcn build` into `public/r/` and is served as a static asset. One producer
of registry JSON, and it is the shadcn CLI. The route handler at `app/r/[slug]/route.ts` therefore
answers `.md` only and 404s on anything else.

---

## 4. Examples

**`button` and `switch` are the reference set** — one short product use each, English labels, no
artificial hover classes, no grid of states:

| File | What it shows |
| --- | --- |
| `button/default.tsx` | A form footer: one primary action, one way back. |
| `button/variants.tsx` | The four variants, each with the label it would really carry. |
| `button/loading.tsx` | Saving: the label stays, the icon slot becomes a spinner, the button stops reacting. Interactive — also the pattern for client examples. |
| `switch/default.tsx` | A settings row. The `<label>` holds the name and the control; the hint sits outside it, because a hint is not part of the thing's name. |
| `switch/group.tsx` | Three rows with dividers, so a hint cannot be read as belonging to the row below. |

The other **thirteen** components each have a `default.tsx` that renders the component honestly in
its simplest form — working code, not `TODO` text — and says in its doc comment that it is a
placeholder, with a pointer at `button/default.tsx` as the model.

---

## 5. Adapted from beUI — file by file

Upstream `b64c092b63b99c7340376b522325ea309156ba00`, MIT, Copyright (c) 2026 Saurabh Chauhan.
Committed separately (`218d7da`), with the hash in the message. `THIRD-PARTY-NOTICES.md` carries
the full licence text verbatim and the same list; the footer carries the credit line.

| File here | From | What was taken |
| --- | --- | --- |
| `site/site.ts` | `lib/site.ts`, `lib/signature.ts` | the `SITE_URL` env override; `pageUrlFor` |
| `site/source-files.ts` | `lib/source-files.ts` | reading sources relative to a root, and the "Missing source file" failure |
| `site/component-status.ts` | `lib/component-status.ts` | the whole NEW-badge expiry calculation |
| `site/props.ts` | `lib/props-extractor.ts` | the shared `ts.Program` provider, the docgen configuration, filtering inherited props by declaring file |
| `site/component-markdown.ts` | `lib/component-markdown.ts` | the document's shape |
| `app/r/[slug]/route.ts` | `app/r/[slug]/route.ts` | static params per extension, response headers |
| `app/registry.json/route.ts` | `app/registry.json/route.ts` | the route and its headers |
| `app/llms.txt/route.ts` | `app/llms.txt/route.ts` | the sections and the one-line-per-component list |
| `app/robots.ts` | `app/robots.ts` | the `MetadataRoute.Robots` shape |
| `app/sitemap.ts` | `app/sitemap.ts` | the `MetadataRoute.Sitemap` shape |
| `app/manifest.ts` | `app/manifest.ts` | the `MetadataRoute.Manifest` shape |

**Eleven files. Everything else under `apps/www` was written here** — the shell, the catalogue, the
registry reader, the examples, every page, the styles, `llms-full.txt`. Nothing written from
scratch is claimed as derived, which is the point of the list.

Not taken, deliberately: the beUI name, logo and brand assets, `brand.md`, marketing copy,
testimonials, sponsors, the landing, the documentation shell and its visual design,
`components/motion`, `components/agents`, `components/previews`, `lib/registry.ts`,
`lib/themes.ts`, `lib/agent-guides.ts`, the OKLCH theme set, the analytics and the Dock.

`lib/signature.ts`'s `withSignature` was **not** adapted: it prepends a provenance banner to source
on copy and on registry install, and neither applies here — our registry JSON is produced by the
shadcn CLI, not by us, and putting a banner on the displayed code would make the shown code differ
from the installed code. Only `pageUrlFor` came across.

---

## 6. Acceptance

### 6.1 `pnpm install`

Clean, no peer errors: `Packages: +676 … Done in 11.8s using pnpm v12.4.1`.

`pnpm install` itself appended a `minimumReleaseAgeExclude` block to `pnpm-workspace.yaml`: the
store enforces a minimum release age and next 16.3.5 is newer than it. Without those entries a
fresh install refuses to resolve Next. Kept, with a comment saying why.

### 6.2 Routes — `pnpm --filter www dev`, live `curl`

| route | code | first 80 chars |
| --- | --- | --- |
| `/` | 200 | `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport` |
| `/components` | 200 | `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport` |
| `/components/tokens` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/cn` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/icon` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/divider` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/spinner` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/button` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/icon-button` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/switch` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/text-input` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/text-area` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/select` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/tag` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/avatar` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/empty-state` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/modal` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/snackbar` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/components/context-action-menu` | 200 | `<!DOCTYPE html><html lang="en">…` |
| `/r/button.json` | 200 | `{ "$schema": "https://ui.shadcn.com/schema/registry-item.json", "name": "but` |
| `/r/button.md` | 200 | `--- title: "Button" description: "Button: primary \| secondary \| danger \| text, h` |
| `/registry.json` | 200 | `{ "$schema": "https://ui.shadcn.com/schema/registry.json", "name": "cubby-ui` |
| `/llms.txt` | 200 | `# Cubby UI > A component library for product interfaces, delivered through a sh` |
| `/llms-full.txt` | 200 | `# Cubby UI — full documentation > A component library for product interfaces,` |
| `/pro/x` | **404** | renders "Pro is not available yet" (confirmed on a headless screenshot) |
| `/robots.txt` | 200 | `User-Agent: * Allow: / Host: https://cubbyui.dev Sitemap: https://cubbyui.dev/s` |
| `/sitemap.xml` | 200 | `<?xml version="1.0" encoding="UTF-8"?> <urlset xmlns="http://www.sitemaps.org/sc` |
| `/manifest.webmanifest` | 200 | `{"name":"Cubby UI","short_name":"Cubby UI","description":"A component library fo` |
| `/no-such-page` | **404** | our own `EmptyState` 404 |

All 17 component pages 200, no 500s. The same set was re-checked against `next start`.

### 6.3 `pnpm --filter www build` — green

```
▲ Next.js 16.3.5 (Turbopack)
✓ Compiled successfully in 994ms
  Finished TypeScript in 1638ms ...
✓ Generating static pages using 9 workers (44/44) in 3.3s

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /components
├   /components/[slug]
│ ├ ● /components/tokens
│ ├ ● /components/cn
│ ├ ● /components/icon
│ └ ● [+14 more paths]
├ ○ /llms-full.txt
├ ○ /llms.txt
├ ○ /manifest.webmanifest
├ ƒ /pro/[...slug]
├   /r/[slug]
│ ├ ● /r/tokens.md
│ ├ ● /r/cn.md
│ ├ ● /r/icon.md
│ └ ● [+14 more paths]
├ ○ /registry.json
├ ○ /robots.txt
└ ○ /sitemap.xml
```

44 static pages, zero warnings.

### 6.4 `pnpm run ci` — green

Exit 0. `www` is in scope and its typecheck really ran:

```
• Packages in scope: @cubby-ui/registry, @cubby-ui/tokens, playground, www
www:typecheck: cache miss, executing 33fa3df9569e57e9
www:typecheck: $ tsc --noEmit -p tsconfig.json
 Tasks:    5 successful, 5 total        (typecheck)
 Tasks:    3 successful, 3 total        (test — 72 registry tests + 19 token tests)
```

`eslint .` is clean. Two one-line changes to the shared config were needed and made:
`apps/www/**/*.tsx` added to the react-hooks + jsx-a11y block (so the site is linted like the
components are), and the Node-globals block widened to `*.config.{js,cjs,mjs,ts}` so
`next.config.mjs` is recognised as a Node file.

### 6.5 beUI cleanup checklist

Run from `apps/www`:

| Check | Result |
| --- | --- |
| `grep -rn "beui.dev\|beUI\|Saurabh" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.json" .` | 15 hits, all expected: 11 "Adapted from beUI …" file headers and 4 lines of the footer credit. No `beui.dev` anywhere. |
| `find . -iname "*beui*" -not -path "*/node_modules/*"` | empty |
| `grep -rn "components/motion\|components/agents\|components/previews" --include="*.ts" --include="*.tsx" .` | empty |
| `test -f lib/themes.ts` | absent (there is no `lib/` directory at all — §3.1) |
| `find . -iname "*testimonial*" -not -path "*/node_modules/*"` | empty |
| `grep -n "TODO" ../../THIRD-PARTY-NOTICES.md` | empty |

### 6.6 Screenshots

Headless Chrome, 1440×900, in `apps/www/.screenshots/` (git-ignored):

- `apps/www/.screenshots/home-dark.png`
- `apps/www/.screenshots/home-light.png`
- `apps/www/.screenshots/button-dark.png`
- `apps/www/.screenshots/button-light.png`

The dark pair is the live server. The light pair needed a workaround worth knowing about: the theme
lives in `localStorage` and headless Chrome cannot click the toggle, so the light shots are the
**server-rendered HTML with `data-theme="light"` stamped on `<html>` and every `<script>` removed**,
served from the same origin so the CSS and fonts resolve. They are a faithful picture of the light
theme's static appearance; nothing interactive runs in them. The temporary pages were deleted.

---

## 7. Not done, and why

1. **OG image (`/api/og`).** Skipped, as the task allowed. It needs a wordmark and a background that
   do not exist yet — an OG card is brand work, and there is no brand.
2. **`Tabs` for preview/code.** The primitive is not in `main`. Preview and code are two stacked
   blocks; `app/components/[slug]/page.tsx` carries a `NEXT EXECUTOR:` comment at the exact place,
   noting that the pair is already assembled and only the container changes, with the spec's pill
   geometry (radius full, height 40, padding 4).
3. **Code-block collapse.** Spec §6.1 asks for a collapse to 375 px with an `h-32` gradient and a
   "show all" control. Not built — it is behaviour for the visual pass, and the block is honest
   without it. Noted in `code-block.tsx`.
4. **The "Customize" slider panel** (spec §6.1 item 6) is not built. It is a feature, not scaffolding.
5. **Breadcrumbs, "Copy page ▾", "See also"** (spec §6.1 items 1, 2, 10) are not built: shell,
   not infrastructure.
6. **The light theme's alpha values are not measured** (§3.4).
7. **`withSignature`** was not adapted (§5).
8. **`motion` is installed but unused** (§2).

## 8. Marked for the next executor

Grep for `NEXT EXECUTOR` — four places:

| Where | What |
| --- | --- |
| `app/site-theme.css` | the `:root` block is the whole scale; replacing a value means editing one line there and nothing else |
| `app/page.tsx` | the entire file is the placeholder for the real landing |
| `app/components/[slug]/page.tsx` | where `Tabs` goes, with the spec's pill geometry |
| `components/examples/*/default.tsx` (13 files) | each placeholder says so and points at `button/default.tsx` as the model |

`components/site-header.tsx` and `components/site-footer.tsx` are marked `STRUCTURAL PLACEHOLDER`
in their doc comments. The footer's beUI credit line is a licence obligation and must survive any
redesign.
