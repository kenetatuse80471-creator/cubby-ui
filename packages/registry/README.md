# `@cubby-ui/registry`

Sources of the web items Cubby UI distributes through the shadcn registry.

```
packages/registry/
├─ src/ui/      component sources — one file per registry:ui item
├─ src/lib/     helpers shared by components (registry:lib)
└─ src/demos/   preview/demo sources for the documentation site
```

The catalogue itself is **`registry.json` in the repository root**, not in this package. That is a
hard requirement of shadcn's GitHub registry: the CLI installs an item with
`npx shadcn@latest add <owner>/<repo>/<item>` and looks for `registry.json` at the repository
root, with `files[].path` resolved relative to it
([ui.shadcn.com/docs/registry/github](https://ui.shadcn.com/docs/registry/github)). So paths in
`registry.json` read `packages/registry/src/ui/button.tsx`, and no server or published JSON is
needed for distribution.

```bash
pnpm registry:validate   # shadcn registry validate registry.json
pnpm registry:build      # shadcn build registry.json --output public/r
```

`public/r/` is a build artefact and is git-ignored: GitHub-registry installs read the sources
directly. It will start being published once the site of phase 2 exists.

## Current contents: one item, `tokens`

Phase 0 ships a single real item, enough to prove the whole pipeline end to end —
`tokens.json` → generator → `dist/*.css` → registry item → `shadcn add` → files on disk in a
consumer project.

```jsonc
{
  "name": "tokens",
  "type": "registry:item",
  "files": [
    { "path": "packages/tokens/dist/tokens.css", "type": "registry:file", "target": "~/styles/cubby-tokens.css" },
    { "path": "packages/tokens/dist/theme.css",  "type": "registry:file", "target": "~/styles/cubby-theme.css" }
  ]
}
```

### Why `registry:item` and not `registry:theme` / `registry:style` / `registry:file`

What actually moves the files is the **file-level** type: `target` is honoured only for
`registry:file` and `registry:page`, and it is required for them by the schema. Verified against
shadcn 4.21.0: with the same `files[]`, item types `registry:item`, `registry:theme`,
`registry:file` and `registry:style` all place the two stylesheets identically. The item type is
therefore a semantic label, and the label was chosen like this:

- **`registry:theme`** is the type for theme definitions, in practice a `cssVars` payload merged
  into the consumer's stylesheet. We deliberately ship **no `cssVars`** — Altis fails its build if
  a `--variable` is declared under `:root` outside its generated region, so tokens travel as
  files on a route of their own. Calling the item a theme would advertise behaviour it does not
  have.
- **`registry:style`** is for `shadcn init` styles (`extends`, `baseColor`, `iconLibrary`). This
  item is installed with `add` into an existing project, not at init time.
- **`registry:file`** at the item level reads as "one miscellaneous file"; this item is two files
  that only make sense together.
- **`registry:item`** is the schema's universal type and describes exactly what this is: a bundle
  of files with no framework semantics attached.

### `target` uses `~/`, not `@/`

`~/styles/cubby-tokens.css` resolves to `styles/cubby-tokens.css` at the project root. The
documented placeholders are `@components/`, `@ui/`, `@lib/` and `@hooks/` — there is no
`@styles/`, and a literal `@/styles/…` target is **not** expanded: shadcn 4.21.0 creates a
directory called `@` (`src/@/styles/cubby-tokens.css`). Verified by installing both variants.

## Contents: `cn` plus the nine primitives of batch A

| item | type | registryDependencies | npm |
|---|---|---|---|
| `tokens` | `registry:item` | — | — |
| `cn` | `registry:lib` | — | `clsx`, `tailwind-merge` |
| `icon` | `registry:ui` | `cn` | `@hugeicons/react`, `@hugeicons/core-free-icons` |
| `spinner` | `registry:ui` | `cn` | `class-variance-authority` |
| `button` | `registry:ui` | `cn`, `spinner` | `class-variance-authority` |
| `icon-button` | `registry:ui` | `cn`, `spinner` | `class-variance-authority` |
| `tag` | `registry:ui` | `cn`, `icon` | `class-variance-authority`, hugeicons |
| `divider` | `registry:ui` | `cn` | `class-variance-authority` |
| `avatar` | `registry:ui` | `cn`, `icon` | `class-variance-authority`, hugeicons |
| `empty-state` | `registry:ui` | `cn`, `icon` | `class-variance-authority` |
| `switch` | `registry:ui` | `cn` | `@base-ui/react` |

### Four conventions every item follows

1. **`data-slot`** on every element a consumer may want to style or find in a test —
   `data-slot="button"`, `data-slot="button-spinner"`, `data-slot="tag-remove"`.
2. **Variant names come from Altis**, so a replacement in the «Ящик» codebase is a rename of the
   import and nothing else: `variant` is `primary | secondary | danger | text`, `size` is
   `regular | compact`. Where Altis had no name (tag tones, avatar sizes) the name comes from the
   token: `tone="blue"`, `size="xs"`.
3. **Import aliases.** A component imports another component as
   `@/registry/cubby/ui/<name>` and the class merge as `@/lib/cn`. shadcn rewrites the first into
   the consumer's `ui` alias and the second into its `lib` alias. The `cubby` segment is not
   decoration: shadcn only recognises `@/registry/<style>/ui/…` — without a segment between
   `registry/` and `/ui` it falls back to the `components` alias and the import breaks.
4. **`registryDependencies` carry the full GitHub address** (`kenetatuse80471-creator/cubby-ui/cn`).
   A bare name is resolved against shadcn's own registry, not ours — that is what the GitHub
   registry requires ([ui.shadcn.com/docs/registry/github](https://ui.shadcn.com/docs/registry/github)).

### Why `cn` is an item of its own, and not `lib/utils.ts`

`text-ui-md` is a font size that does not look like one. tailwind-merge reads `ui-md` as a colour,
decides it conflicts with `text-text-1`, and drops the type style — silently. `src/lib/cn.ts`
extends the merge with the fourteen text styles of `theme.css`, and a test compares that list
against the generated `theme.css` so a new style in the tokens cannot drift away from it.

It is installed as `lib/cn.ts`, **not** as `lib/utils.ts`: a project that has run `shadcn init`
already owns `lib/utils.ts`, and `add --yes` skips a file that exists. Components therefore import
`@/lib/cn`, and the consumer's own `cn` is left alone.

## Rules for a new item

Every item carries `name`, `type`, `title`, `description`, `files`, `dependencies`,
`registryDependencies` and `meta.version`; see `AGENTS.md` in the repository root.
