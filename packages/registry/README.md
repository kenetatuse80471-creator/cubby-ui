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

## Rules for a new item

Every item carries `name`, `type`, `title`, `description`, `files`, `dependencies`,
`registryDependencies` and `meta.version`; see `AGENTS.md` in the repository root.
