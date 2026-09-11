# Where `src/tokens.json` comes from

`src/tokens.json` is **the source of truth of Cubby UI**. Every other token artefact in this
repository is generated from it and must never be edited by hand.

| | |
|---|---|
| Copied from | `~/Documents/Claude/активные/Ящик. Task tracker/raw/2026-09-05-design-system/tokens.json` |
| Copied on | 11.09.2026 |
| sha256 | `3ddaaeae54c501299c12f6b4f80a91e317ed448da67ac1b397ba0ee2f86897d6` |
| Format | `altis-design-tokens/1` — a Figma variables export in its own shape, **not** W3C DTCG |
| Contents | 7 collections / 300 variables (Primitives 80, Color 63 × Dark+Light, Space 15, Radius 18, Size 105, Motion 10, Layer 9) + 14 `textStyles` + 3 `effectStyles` |

The file is a byte-for-byte copy: the checksum above is verified by the generator on every build
and is stamped into the header of each generated artefact, so any drift is visible in a diff.

## What this means in practice

- **Do not edit `src/tokens.json` in this repository by hand.** It is a mirror of the Figma /
  Paper variables of the «Ящик» design system. A new value is created in Figma, exported, and the
  new export replaces this file in one commit of its own.
- The upstream «Ящик» folder is read-only from here. Nothing in this repository writes back to it;
  the return channel to the designer is `dist/tokens.paper.json`.
- Two derived facts about the source that the generator relies on, and would fail loudly without:
  - **Primitives are hidden** (`hidden: true`). They are the raw hex/number tier and are never
    emitted as CSS variables — their values are inlined into the semantic token that references
    them, which is exactly what Altis `docs/design/tokens.css` does today.
  - **`codeSyntax.WEB` is the name contract.** 186 of 300 variables already carry the CSS custom
    property name they must produce (`"var(--bg-app)"`); the remaining 114 are the 80 hidden
    primitives plus 34 Size variables that have no name in code yet — those get one from the path
    rule described in `README.md`.

## Known state of the source, as of the copy

`meta.themeStatus` in the file says: **Dark — «канон, утверждён»**, **Light — «черновик, не
утверждён»**. The light theme is nonetheless shipped in Altis today, so both modes are generated.

The source also contains five names that two different variables claim at once. The generator
does not repair them; it emits the first one and lists all five in the header of
`dist/tokens.css`, in `dist/tokens.paper.json` (`notes`) and in `SCAFFOLD-REPORT.md`.
