# Site examples — from placeholders to product scenes

Written by the executor of the batch (Claude Sonnet 4.5, 12.09.2026) and filed by the
orchestrator, who also made the Avatar fix described at the end.

Every page of the site shows a **live example**: one short, real use of the component, the way a
person would actually reach for it in a product. This is deliberately not the state shelf that
`apps/playground` holds — the owner of the project judged that presentation weak, and it answers a
different question ("what states exist") from the one a docs page answers ("what is this for").

The rule that makes the page honest: **the preview and the code block are the same file**. The
module is imported for rendering and read off disk for the snippet, so the two cannot drift.

## What each example shows

| Component | What the example shows | Lines |
|---|---|---|
| icon | A task's due date: calendar glyph + "Due Friday" | 16 |
| spinner | Loading inside a task-list panel, not floating in a void | 15 |
| divider | The two halves of a task panel (header / Activity) | 22 |
| button | Form footer: one primary action and one way back | 14 / 20 / 29 |
| icon-button | Action cluster on a task row: star (interactive), comments (badge), assign | 41 |
| switch | Notification settings, dividers between rows | 24 / 43 |
| tabs | Board switcher with counts; Archive deliberately has none | 45 |
| text-input | "Title" — the first field of a New task form | 15 |
| text-area | "Description" — the second field of the same form | 15 |
| select | "Priority" — the third field of the same form | 43 |
| tag | Status (with a dot) and category (without) on a card | 17 |
| tag · removable | Filter chips where the cross really removes the chip | 37 |
| avatar | Three assignees stacked, overlap and ring, different tones | 32 |
| avatar · unassigned | "Nobody is assigned" — the honest empty state | 16 |
| empty-state | An empty board with a single action | 19 |
| modal | Deleting a board (destructive) | 29 |
| modal · create | Creating a board (default) — the modal's other axis | 31 |
| snackbar | Deleting a task → a bar that confirms it and offers Undo | 37 |
| context-action-menu | The «…» built into a task row, not standing alone | 33 |
| tooltip | A row of icon buttons under one provider | 35 |

19 components, 23 example files.

## How the interactive ones were checked

Driven by hand in a headless browser on a local dev server (port 4325; 4320 was taken by another
executor working in parallel): the star toggles `data-selected`; a filter chip's cross removes it
from the DOM; both modals open and close; the select list opens; the snackbar appears with Undo;
the action menu opens with Delete set apart; tabs switch and tooltips appear.

Acceptance: `grep PLACEHOLDER` empty, `pnpm --filter www typecheck` green, `pnpm --filter www lint`
green, `pnpm --filter www build` green (48/48 static pages).

## What the components turned out to be missing

**Avatar's empty state could not cancel the identity gradient — now fixed.** `empty: true` set
`bg-transparent`, which clears `background-color`; `variant="identity"` paints with a gradient,
which is `background-image`. The bare `<Avatar />` — the documented way to show that nobody is
assigned — therefore kept a washed accent circle behind its dashed ring. Confirmed through
`getComputedStyle`, and visible in `apps/playground/shots/avatar-dark.png` all along. The executor
worked around it in the example with an explicit `variant="neutral"` rather than touching the
component; the orchestrator then fixed the component (`bg-none` in the `empty` branch, with a
regression test) and removed the workaround.

## What stayed weak

- The root `eslint.config.js` lists only `Switch` in `label-has-associated-control`'s
  `controlComponents`, so wrapping `TextInput` / `TextArea` / `Select` in a native `<label>` trips
  the linter. The form examples use a `<div>` caption plus an explicit `aria-label` instead —
  accessible, but less idiomatic than a `<label>` would be after a one-line config change. Left
  alone deliberately: the config is shared with the whole monorepo and was not this batch's
  territory.
- `tag.png` among the review screenshots is cropped slightly at the top; the site itself is fine,
  only the PNG framing.

## Screenshots

`apps/www/.screenshots/examples/` (git-ignored review material): `avatar.png`, `divider.png`,
`tag.png`, `icon-button.png`, `modal.png`, `context-action-menu.png`, `select.png`, `snackbar.png`.
