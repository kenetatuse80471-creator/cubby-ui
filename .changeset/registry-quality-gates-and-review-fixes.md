---
"@cubby-ui/registry": patch
---

Port the `lint:tokens` and `classes` quality gates from `feat/registry-foundation` onto vitest,
rescoped to scan `src/ui` and `src/lib`, wired into `pnpm run ci` and CI as their own step.

Three review fixes for batch A, each covered by a test:

- `Button` and `IconButton` no longer ignore an explicit `disabled={false}` while `loading`
  (`disabled ?? loading` → `disabled || loading`).
- `Icon` no longer requires `icon`: pass `children` instead to draw a consumer's own SVG (e.g. a
  sprite `<use>` reference) at the same size — exactly one of the two is required at the type
  level, and the existing `icon` API is unchanged.
- Every `registry.json` item's `title`, `description` and `docs` is now in English.

Also fixes two gaps the new gates found in already-shipped code: `Avatar`'s per-tone classes now
route through a `cva` instead of a plain lookup object (so the "every class compiles" gate can
see them), and the literal gate no longer mistakes a `"use client"` directive prologue for a
stray class list.
