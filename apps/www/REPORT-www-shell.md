# Site shell and component page

Written by the executor of the batch (Claude Opus 5, 12.09.2026) and filed by the orchestrator.
The specification is `REFERENCE-SPEC.md` — a measured breakdown of beui.dev, bencho.dev,
reactbits.dev and heroui.com made the same night (kept in the project folder, not the repository).

## Measured against beui.dev at 1440×900

| Parameter | beui | here | matches |
|---|---|---|---|
| Header | 56px fixed, transparent until scroll | 56px fixed, transparent until scroll | yes |
| Columns (x / width) | 32/240 · 288/824 · 1152/256 | 32/240 · 304/816 · 1152/256 | per plan §6.1 |
| Page H1 | 30 / 500 / 36 | 30 / 600 / 36, −0.75px | yes (600 chosen in §6.1) |
| Lead paragraph | 16 / 24, 672 wide, `#868686` | 16 / 24, 672 wide, `#83868A` | yes |
| Section H2 | 20 / 600 | 20 / 600 / 26 | yes |
| Tab pill | 40 tall, padding 4 | 40 tall, padding 4, radius 10 | geometry yes |
| Tab inside | 32 tall, 14 / 500 | 32 tall, 13 / 500, radius 6 | geometry yes |
| Preview stage | no frame | frame 14 → floor 10, min-height 400 | deliberately reactbits |
| Code block | radius 12, 1px `#ffffff0d` | radius 12, 1px `rgba(255,255,255,.05)` | yes |
| Code | 13 / 21.1, no line numbers | 13 / 20, no line numbers | yes |
| Code collapse | 375 + 128 gradient | 375 + 128 gradient | yes |
| Install box | radius 12, manager switch in the header | radius 12, CLI\|Manual + four managers | yes |
| Sidebar item | 32 tall, radius 8 | 32 tall, radius 8, 13px, active 500 | yes |
| Section rule | 1px alpha + 20/20 | 1px alpha + 20/20 | yes |
| Shadows | none | none at all (`grep shadow-` empty) | yes |
| Hover | border 5→10 %, 300ms, nothing else | same | yes |

## Which of the spec's sixteen devices are in

In: alpha borders everywhere (1); the inset top highlight (2) on the preview well, props table,
example tabs and sidebar; concentric radii 14−4=10 and 10−4=6 (3); no shadows (5); one easing
across fourteen transitions (6); hover changes only `border-color` (7); −0.025em on large type and
+0.22em on the caps label (11); the collapsing code block (13); the install switcher (14); the
header that gains a background on scroll (15) — measured after scrolling: `oklab(…/0.72)`, 1px at
5 %, `blur(12px)`, 300ms.

Out: the overshoot spring (8) — on a bar as wide as a row it reads as a shake, not a bounce;
9, 10 and 12 belong to the landing; reactbits' floating sidebar card (16) — deliberately not.

## Deviations from the measured spec, and why

1. **Eyebrow 12px, not 11.2** — Sergey's rule is "no type smaller than 12". The single
   typographic disagreement with the measurement.
2. **The docs row is capped at 1440 and centred** — beui runs full-bleed, which pushes its table of
   contents into the edge of a 1920 screen. Our three columns come out to exactly 1440.
3. **Tab pill radius 10, not full** — concentricity: our tab's own radius is 6, and 6 + 4 = 10.
4. **The preview stage has a frame** — the reactbits variant, as the brief asked.
5. **Device 4 is inverted for the chrome.** "Card lighter than the page" does not survive the light
   theme: `--bg-surface` there is `#FFFFFF`, the colour of the page. The code slab, install box and
   pill use `--bg-well` instead, so they sit *into* the page in both themes. The other half of the
   device is kept: the preview floor is the page colour.
6. **Code block header 36px** (beui 53) — 36 is our `--control-h-lg`; 53 would be a literal.
7. **No Sheet on narrow screens** — the primitive does not exist yet; a disclosure menu instead.

## Syntax highlighting

One Shiki theme instead of two (`site/highlight.ts`): the colours are sentinel hexes that
`colorReplacements` swaps for `var(--text-body / -3 / -2 / -1 / --accent-2)`, and those follow
`data-theme` by themselves. The second pass and the `!important` block in `globals.css` are gone.
Monochrome plus exactly one hue (`--accent-2`) for literals; keywords are `--text-1` in bold.

## The "New" badge

Changed from `tone="green" dot` to `tone="neutral"`. The reason is not taste: all 19 registry items
shipped on 12.09, so the badge sits on 19 rows out of 19 — a marker on everything marks nothing.
The mechanism is right (`component-status.ts` expires it after a week), and from 19.09 it will
start appearing one item at a time. Until then it should stay quiet. Rejected: the blue system
accent (same wall, different hue) and dropping the badge from the sidebar (which would put the
sidebar out of step with the catalogue).

## The light theme

The spec measured the dark theme only. Of the four values set by eye in `site-theme.css`, two were
wrong and are corrected, with the reasoning left in the file:

- **Borders 0.07 / 0.12 → 0.12 / 0.20.** 7 % black on white resolves to `#EDEDED`, weaker than the
  library's own `--border` (`#DCDFE4`) sitting right next to it inside every preview; the frames
  looked unfinished.
- **The inset highlight is switched off.** On a white surface there is nothing lighter than the
  surface, and `rgba(255,255,255,0.7)` drew nothing. An honest `transparent` instead of a fake.

Stated plainly: **there is no measured reference for the light theme.** Both edits are judgement
against neighbouring tokens, not measurement.

## What is still below the references

1. **The preview stage is empty.** beui's demo area is 316px and full; ours is a 400px frame with a
   32px control in the middle. On the Tag page two of them sit one after another and the page reads
   as empty. This is a shell number (`--site-preview-min-h`); 400 came from the brief, and the
   measured alternative is beui's 316 (§1.3). **Gap number one.**
2. **The right column dies below the table of contents.** beui puts a Pro promo card there. On a
   short page (`cn`, `tokens`) our right third is empty from y≈300.
3. **Nothing moves.** Every beui demo animates continuously. Ours are static product primitives.
   beui reads as alive, we do not.
4. **The right edge of the header is softer.** beui ends in a filled light "Get Pro" button — the
   one bright element on the page, and it holds the edge. Ours ends in a ghost icon.
5. **The mark is a placeholder** — a rounded square with a square inside. That is geometry, not an
   identity.
6. **The library looks smaller.** beui's sidebar scrolls and says "Components 42"; ours has 19
   items and the column ends halfway down the screen.
7. **Text contrast is lower.** beui is `#f2f2f2` on `#151515`; we are `#E1E1E5` on `#17181A`. The
   page reads softer, greyer. That is the library's palette, not a decision of the shell.
8. **No "Related components"** — only previous and next.

## Found while working, outside this batch

`app/page.tsx` uses `py-16` and `gap-10`, which **compile to nothing**: the spacing scale is named
by value (`--spacing-0/1/…/7/28/40/48/64`), and there is no `--spacing-16`. That is why the landing
hero currently sits jammed against the header. The same defect in both 404 pages (`py-20`) is
fixed here.

## Screenshots

`apps/www/.screenshots/` (git-ignored), 18 files, taken from a production build through the
DevTools protocol — the light theme cannot be captured any other way, since the theme lives in
`localStorage` and a command-line `--screenshot` cannot set it.
