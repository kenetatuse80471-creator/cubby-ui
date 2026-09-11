# Cubby UI — rules for contributors and agents

This file is the contract for anyone changing this repository, human or agent. It is short on
purpose; when something here conflicts with a habit from another project, this file wins.

## 1. Values come from `packages/tokens`, always

A colour, size, radius, duration or z-index literal written anywhere except
`packages/tokens/src/tokens.json` is a defect, not a shortcut. Components reference the CSS custom
properties (`var(--bg-app)`) or the Tailwind utilities generated from them (`bg-bg-app`,
`rounded-role-card`, `p-3`); React Native code imports `@cubby-ui/tokens`.

- `packages/tokens/src/tokens.json` is a verbatim copy of the Figma export and is **never edited
  by hand here**. A new value is made in Figma, re-exported, and replaces the file in a commit of
  its own. See `packages/tokens/SOURCE.md`.
- `packages/tokens/dist/` is generated **and committed**. Never edit it; run `pnpm tokens:build`.
  `pnpm tokens:check` rebuilds and fails on any diff — that gate runs in CI.
- Need a value the tokens do not have? Ask for the token, do not invent the number.

## 2. Registry items

Every item in `registry.json` carries, at minimum:

`name`, `type`, `title`, `description`, `files`, `dependencies`, `registryDependencies`,
`meta.version`.

- `registry.json` lives in the **repository root** — shadcn's GitHub registry requires it there,
  and `files[].path` is resolved relative to it.
- Run `pnpm registry:validate` **before every commit** that touches `registry.json` or any file it
  references. `pnpm registry:build` regenerates `public/r/` (git-ignored) for local smoke tests.
- `meta.version` is the version the changeset for that PR produces. A change to an item's code
  without a version bump is invisible to consumers.
- Add a demo under `packages/registry/src/demos/` for anything with a visual state.

## 3. Items destined for Altis carry no `cssVars`

Altis (the «Ящик» repository, the first consumer) fails its build when any `--variable` is
declared under `:root`, `[data-theme=`, `html` or `body` outside its own generated region. So:

- **no `cssVars` in registry items** — tokens travel on their own route, as the `tokens` item;
- **icons are a prop**, never a bundled icon package: Altis keeps one `icons.svg` where the id
  names a role (`icon-notifications`), not a drawing;
- one PR replaces one component: the old implementation is deleted in the same PR, because
  Altis's `check:duplicates` gate does not tolerate two components with the same job.

## 4. Branches, commits, git

- Work in `feat/*` or `fix/*` and open a pull request. Direct commits to `main` are acceptable
  only for scaffolding and documentation while the project is a one-person effort.
- **Never `--force`.** Not on push, not on checkout, not on clean. If history looks wrong, stop
  and ask.
- Commit messages are conventional and describe the change, not the tool:
  `feat(tokens): add role radii`, `fix(registry): correct target of theme.css`, `ci: cache pnpm`.
- Add a changeset (`pnpm changeset`) with any change that consumers can observe.
- The `~/Documents/GitHub/altis` checkout and the project folders under `~/Documents/Claude` are
  **read-only** from here.

## 5. Before you push

```bash
pnpm install
pnpm tokens:check
pnpm registry:validate
pnpm typecheck
pnpm test
```

All five are the CI pipeline. Green locally, green in CI.

## 6. Do not invent

If a CLI flag, a schema field or an API is not in the documentation, say so instead of guessing.
Every external claim in this repository was checked against the live docs or the live CLI on the
day it was written, and the checked version is written down next to it.
