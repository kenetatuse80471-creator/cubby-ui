# Cubby UI

Cubby — a cubbyhole for your UI: product-grade components for Next.js and React Native,
distributed as a shadcn registry.

Components are not installed as a dependency you cannot see into. The CLI copies the source into
your project, on your tokens, and you own it from there. Every value — colour, size, radius,
duration — comes from one generated token set shared by the web and the native builds.

**Status: early, pre-release.** Nothing here is stable yet. The token pipeline works end to end;
components, the documentation site and the React Native package are still to come. Do not depend
on this in production.

## Install

The repository is the registry — no server, no published JSON:

```bash
npx shadcn@latest add kenetatuse80471-creator/cubby-ui/tokens
```

Pin to a branch, tag or commit with `#ref`:

```bash
npx shadcn@latest add kenetatuse80471-creator/cubby-ui/tokens#main
```

That drops `styles/cubby-tokens.css` and `styles/cubby-theme.css` into your project. Import them
after Tailwind:

```css
@import "tailwindcss";
@import "../styles/cubby-tokens.css";
@import "../styles/cubby-theme.css";
```

Dark is the canon and the `:root` default; `data-theme="light"` switches. See
[`packages/tokens/README.md`](./packages/tokens/README.md) for the full contract.

Requires a project with a `components.json` (`npx shadcn@latest init`) and Tailwind v4.

## What is in the repository

| | |
|---|---|
| `packages/tokens` | The Figma variables export and the generator that turns it into CSS, a Tailwind theme, a typed object and a Paper map |
| `packages/registry` | Sources of the registry items. The catalogue is `registry.json` in the root, as the GitHub registry requires |
| `packages/native` | React Native components — phase 4 |
| `apps/www` | Documentation site and showcase — phase 2 |

```bash
pnpm install
pnpm tokens:check       # tokens rebuild identically to what is committed
pnpm registry:validate  # registry.json matches the schema
pnpm typecheck
pnpm test
```

Contributing rules, for people and for agents: [`AGENTS.md`](./AGENTS.md).

## Credits

- [shadcn/ui](https://ui.shadcn.com) — the registry format Cubby UI distributes through.
- [beUI](https://github.com/starc007/ui-components) by Saurabh Chauhan (MIT) — the documentation
  site of phase 2 is planned as a fork of its shell. Attribution and the third-party licence text
  live in [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md); it will be filled in when the fork
  actually lands.
- Cubby UI grew out of the design system of the «Ящик» task tracker, which is its first consumer.

## Licence

MIT © 2026 Sergey Orshak. See [`LICENSE`](./LICENSE).
