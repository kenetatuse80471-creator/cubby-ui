# `apps/www` — phase 2

The Cubby UI site: showcase, documentation, and the registry endpoints. **Empty on purpose.**

The plan, decided 11.09.2026: fork the documentation shell of
[beUI](https://github.com/starc007/ui-components) (MIT, Copyright (c) 2026 Saurabh Chauhan) rather
than build a Fumadocs site from scratch. The fork brings a catalogue-driven architecture that
generates registry JSON, `.md` mirrors, `llms.txt`, an MCP server and an OAuth Pro gate — all of
which match how this project already works, since everything here is generated from one source.

Four conditions attached to that decision:

1. **Phase 1 comes first.** The beUI shell is built out of 19 of its own components; there is
   nothing to replace them with until Cubby UI has its own primitives. Rewriting those 19 call
   sites turns the site into a dogfooding stand — that is the point of doing it in this order.
2. **Aggressive cleanup at fork time.** The beUI component library, previews, agent guides, brand
   assets, landing copy, testimonials and sponsor lists are deleted, not adapted.
3. **Restyle before any public announcement.** Cubby tokens, own typography, own landing.
   Publishing with their hero and their words is not acceptable, legally or otherwise.
4. **Licence hygiene**: own `LICENSE`, `THIRD-PARTY-NOTICES.md` completed in the fork PR, a credit
   line in the README and in the site footer.

Also settled in advance: `/r/` (free, static) and `/pro/` (token-gated) are separate routes from
day one, even while `/pro/` is empty, so monetisation never requires a re-architecture.

Note on tooling: beUI runs on Bun and Biome, this repository on pnpm and Turborepo. The cheaper
choice is to leave the fork's own tooling inside `apps/www` rather than rewrite ~11 000 lines.
