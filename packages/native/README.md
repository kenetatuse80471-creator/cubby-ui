# `@cubby-ui/native` — phase 4

React Native implementation of the Cubby UI components. **Empty on purpose.**

The plan, decided 11.09.2026:

- NativeWind 4.2.6 over `@rn-primitives`, in the file layout of `react-native-reusables`, so the
  items install with the ordinary `shadcn` CLI.
- A second registry built into its own output directory (`shadcn build … --output public/r/native`),
  the way react-native-reusables keeps its `nativewind` and `uniwind` registries side by side.
- The **same token set and the same prop API as the web components**. `packages/tokens` is the one
  thing that must never be duplicated: `dist/tokens.ts` exists precisely for this package, since
  React Native has no CSS cascade and needs literals plus NativeWind's `vars()` helper for theme
  switching.
- Animation here is `react-native-reanimated`, not Motion. There is no official Motion support for
  React Native, so demos are not shared between the platforms.

The package directory and the second registry output are laid out in phase 0 because retrofitting
them later is expensive; the code itself waits until the web primitives exist.
