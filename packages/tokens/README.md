# `@cubby-ui/tokens`

One Figma variables export in, four artefacts out. Nothing in Cubby UI is allowed to hardcode a
colour, a size, a radius or a duration — it comes from here.

```
src/tokens.json ──► src/build.ts ──┬─► dist/tokens.css         CSS custom properties (web)
                                   ├─► dist/theme.css          Tailwind v4 @theme inline
                                   ├─► dist/tokens.ts          typed object (React Native)
                                   └─► dist/tokens.paper.json  flat map, back to Paper / Figma
```

```bash
pnpm --filter @cubby-ui/tokens tokens:build   # regenerate dist/
pnpm --filter @cubby-ui/tokens test           # resolver + artefact tests, incl. a real Tailwind build
pnpm tokens:check                            # build, then fail if dist/ differs from what is committed
```

`dist/` **is committed**. It is the payload the registry ships and the file Altis will eventually
swap in, so it has to be reviewable in a diff. The generator is deterministic — no dates, no
hash-ordered output — and `pnpm tokens:check` in CI is what keeps it honest.

Where the source comes from and what it contains: [`SOURCE.md`](./SOURCE.md).

## Naming rule

A CSS custom property name is decided in exactly two ways, in this order:

1. **`codeSyntax.WEB`, verbatim.** The export stores the name as `"var(--bg-app)"`; the generator
   accepts only that exact shape and takes `--bg-app`. Anything else (a bare `--bg-app`, a
   fallback like `var(--a, red)`) is a build error, never a guess.
2. **The path, minus its first segment**, when `codeSyntax.WEB` is `null`. The first segment
   repeats the collection's role word, so it is dropped and the rest is joined with `-`:

   | path | name |
   |---|---|
   | `color/accent/wash` | `--accent-wash` |
   | `size/comp/menu-item` | `--comp-menu-item` |
   | `size/layout/window-h` | `--layout-window-h` |
   | `size/opacity/dragging-pct` | `--opacity-dragging-pct` |

   A single-segment path keeps its only segment.

**Hidden primitives get no name at all.** The `Primitives` collection is `hidden: true`: its 80
raw values are inlined into whichever semantic token references them, collapsing the two-tier
model exactly the way Altis `docs/design/tokens.css` already does.

**Collisions are reported, not repaired.** When two variables claim the same name the first one
in source order is emitted and the collision is written into the header comment of
`dist/tokens.css` and into `notes` in `dist/tokens.paper.json`. Fixing them means changing the
Figma source, which is not this repository's job.

## Units

Numbers in the export are bare. The unit follows from the collection plus the Figma scopes, never
from a per-variable decision:

| collection | unit |
|---|---|
| Color | the hex string as exported, alpha included (`#A8ABB212`) |
| Space, Radius | `px` |
| Size | `px`, except an `OPACITY` scope → unitless |
| Motion (number) | `ms` |
| Motion (string) | as exported (easing curves) |
| Layer | unitless |

## `dist/tokens.css` — cascade contract

The block structure is copied deliberately from Altis `docs/design/tokens.css` so this file can
one day replace it without touching a single selector:

```css
:root { … }                                     /* literals that never change with the theme */
:root, body.dark, [data-theme="dark"] { … }     /* dark palette — the canon, and the :root default */
body.light, [data-theme="light"] { … }          /* light palette */
:root, body { … }                               /* every var()-derived alias */
```

Two consumers switch themes differently — the web app sets `data-theme` on `<html>`, the
prototype sets `class="dark" | "light"` on `<body>` — and a custom property whose value contains
`var()` resolves against the element it is *declared* on. Hence the rule the generator enforces
and the test suite verifies: **literals in `:root` or in a theme block, every `var()` alias in
`:root, body`.**

Typography comes from `textStyles` as four families — `--text-*`, `--leading-*`, `--tracking-*`,
`--font-weight-*` — keyed by the style path (`ui/md-tabular` → `--text-ui-md-tabular`), plus one
`--font` for the family. Elevation comes from `effectStyles` as `--shadow-*`.

## `dist/theme.css` — Tailwind v4

A single `@theme inline` block. `inline` is required because every entry points at another custom
property: without it Tailwind would resolve the variable where the theme is declared rather than
where the utility is used, and theme switching would stop working
([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).

| namespace | filled from | example utility |
|---|---|---|
| `--color-*` | Color | `bg-bg-app`, `text-text-1` |
| `--spacing-*` | Space (numeric keys) and Size (named keys) | `p-3`, `gap-2`, `h-control-h-md` |
| `--breakpoint-*` | `size/breakpoint/*`, **literal values** | `sm:block` |
| `--radius-*` | Radius | `rounded-md`, `rounded-role-card` |
| `--text-* / --leading-* / --tracking-* / --font-weight-*` | textStyles | `text-ui-md` |
| `--font-sans` | `--font` | `font-sans` |
| `--shadow-*` | effectStyles | `shadow-popover` |
| `--ease-*` | `motion/ease/*` | `ease-standard` |

Three notes that are load-bearing:

- **Breakpoints must be literal.** A media query cannot read a custom property, so
  `--breakpoint-sm: 600px` is written out and not referenced through `var()`.
- **Durations and z-index are not mapped.** Tailwind v4 has no `--duration-*` or `--z-index-*`
  theme namespace; use the raw tokens (`var(--motion-fast)`, `var(--z-modal)`).
- **`tokens.css` must stay unlayered.** Where a token name already sits inside a Tailwind
  namespace (`--radius-md`, `--shadow-raised`, `--text-ui-md`, …) the theme entry is
  self-referential by construction. Tailwind emits its theme inside `@layer theme`, and an
  unlayered `:root` beats a layered one, so the literal from `tokens.css` wins. Do not wrap the
  import in `@layer`. A test compiles both files with Tailwind 4.3.3 and asserts the resulting
  utilities, so a regression here fails the build rather than the browser.

## `dist/tokens.ts` — React Native

There is no cascade in React Native, so this module carries fully resolved literals: colours as
hex strings, everything else as plain numbers (px / ms). Keys are the CSS custom property name
without the leading `--`.

```ts
import { dark, light, space, radius, size, motion, layer, text, shadow } from "@cubby-ui/tokens";
```

`dark` and `light` have the same keys by construction, which is what makes
`Record<ColorTokenName, string>` a safe type for a NativeWind `vars()` theme object.

## `dist/tokens.paper.json` — the way back

A flat `name → { dark, light }` map of every emitted variable, including typography and shadows,
with units applied. Single-mode tokens repeat the same value in both modes so a consumer never has
to special-case them. This is the file that goes back into Paper / Figma when a value is checked
against the canvas.
