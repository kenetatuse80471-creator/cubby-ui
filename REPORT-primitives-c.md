# Batch C — Tabs and Tooltip

Written by the executor of the batch (Claude Sonnet 4.5, 12.09.2026) and filed by the
orchestrator. Conventions follow batch A (`REPORT-primitives-a.md`, section 9).

## 1. What was done

- `packages/registry/src/ui/tabs.tsx` — `Tabs`, `TabsList`, `TabsTab`, `TabsPanel`,
  `TabsIndicator` on Base UI's Tabs (Root/List/Tab/Panel/Indicator).
- `packages/registry/src/ui/tooltip.tsx` — `Tooltip`, `TooltipProvider`, `TooltipTrigger`,
  `TooltipPopup` on Base UI's Tooltip (Root/Provider/Trigger/Portal/Positioner/Popup), plus a
  small id context wiring `aria-describedby` / `role="tooltip"` by hand.
- Demos `tabs-demo.tsx` / `tooltip-demo.tsx`, registered in `demos/index.ts`.
- `registry.json`: two new items (`tabs`, `tooltip`), `meta.version: 0.1.0` each;
  `registry:validate` → 19 items, green.
- `packages/registry/test/tabs-tooltip.test.tsx`: 13 tests — render, `data-slot`,
  click and keyboard paths, tooltip opening on focus-visible, `aria-describedby` merge,
  Escape, focus not trapped.
- `apps/playground/shots/{tabs,tooltip}-{dark,light}.png` generated and committed.
- `.changeset/tabs-and-tooltip.md`, minor for `@cubby-ui/registry`.

## 2. Base UI 1.8.0 facts, checked against the installed package

Version confirmed in `packages/registry/node_modules/@base-ui/react/package.json` (1.8.0);
`./tabs` and `./tooltip` are both in its `exports` map.

**Tabs** — parts confirmed in `tabs/index.d.ts` / `index.parts.d.ts`:
Root / List / Tab / Panel / Indicator.

- `tabs/tab/TabsTab.mjs` sets `role="tab"`, `aria-controls`, `aria-selected`;
  `TabsList.activateOnFocus` defaults to `false`, which matches spec M-05's "←→ moves focus,
  Enter/Space selects" with no code of ours.
- `tabs/tab/TabsTabDataAttributes.mjs`: the active state is `data-active` — **not**
  `data-selected`, which is this codebase's own convention on `IconButton`.
- `tabs/panel/TabsPanel.mjs`: `role="tabpanel"`, `aria-labelledby`, `hidden`, `inert`; a closed
  panel **unmounts** (no `keepMounted`) rather than being hidden, which is why the click test
  asserts `queryByText(...) === null` instead of a `hidden` property.
- `internals/composite/root/useCompositeRoot.mjs`: Home/End come from the shared composite hook,
  not reimplemented here.
- `internals/use-button/useButton.mjs`: (a) `focusableWhenDisabled` removes the native
  `disabled` attribute again right after setting it, so a disabled Tab stays focusable — styling
  therefore keys off `data-disabled:`, not `disabled:`; (b) the Enter branch is skipped when
  `isNativeButton` is true (it relies on the browser's default action) while Space is dispatched
  explicitly for any composite item — happy-dom does not synthesise that default action, so the
  tests drive Space, not Enter.

**Tooltip** — parts confirmed in `tooltip/index.parts.d.ts`:
Root / Trigger / Portal / Positioner / Popup / Arrow / Provider / Viewport / Handle.

- **Gap found in the library.** `grep -rin "describedby"` across the package hits Drawer,
  OTPField, Toast, Dialog and Popover — every one of Base UI's own labelled-content patterns —
  but never `tooltip/`. Confirmed by reading `TooltipTrigger.mjs`, `TooltipPopup.mjs` and
  `TooltipRoot.mjs` in full: none of them sets `aria-describedby` or `role="tooltip"`.
  `tooltip.tsx` does that wiring itself with a `useId()`-based context shared between
  `TooltipTrigger` and `TooltipPopup`, merging with any `aria-describedby` a consumer passes
  (covered by a test).
- `floating-ui-react/hooks/useFocus.mjs` + `utils/element.mjs` `matchesFocusVisible`: opens on
  focus only when `:focus-visible` matches.
- `@base-ui/utils/platform/env.mjs`: `jsdom = /jsdom|happydom/.test(lowerUserAgent)` — Base UI
  special-cases happy-dom by name and forces `matchesFocusVisible` to `true` there, which is why
  a plain `element.focus()` genuinely exercises the focus-visible path in this project's test
  environment instead of being a workaround.
- `utils/popups/popupStoreUtils.mjs`: `FOCUSABLE_POPUP_PROPS = { tabIndex: -1 }` on the popup
  satisfies "does not trap focus itself" with no code of ours.
- `TooltipRoot` renders no element of its own (stated in its `.d.ts` doc comment), like
  `Select.Root` — which is why `Tooltip` carries no `data-slot`.

## 3. Two bugs the screenshot pipeline caught (fixed in `8a0e775`)

- `TabsList` had `overflow-x-auto` (an addition of ours, not in the spec). Removed after the
  screenshot showed it clipping every focused tab's outline top and bottom: an `overflow` other
  than `visible` on one axis forces `auto` onto the other axis too by the CSS spec, and there is
  no way to keep it x-only. Spec §3.7 leaves overflow on a narrow screen unmeasured for the whole
  design system, so this is left for a consumer to solve deliberately rather than guessed here.
- `TooltipPopup` had `context-action-menu.tsx`'s exact opacity fade. Removed after forcing three
  tooltips open at once (one per `side`, in the demo) left two of the three stuck at `opacity: 0`
  permanently. Confirmed with a throwaway Playwright script reading `getComputedStyle` before
  fixing — not guessed. The popup now follows `select.tsx`'s convention: no transition at all.

## 4. Needs Sergey's decision

1. **`TabsTab` default size** — set to `compact` (28), unlike the rest of batch A, because spec
   M-05 only ever measures 28 for Tabs. `regular` (32) exists on the prop purely for axis parity
   and is not specified for Tabs at all.
2. **Tooltip popup fill and text** — spec §3.1 gives width, padding, radius, shadow and scrim for
   Tooltip and nothing else. Used `bg-bg-surface` + `text-caption-sm text-text-1` (the only
   existing `shadow-raised` pairing in the codebase, from `switch.tsx`'s knob).
3. **Tooltip trigger→popup gap (`sideOffset`)** — unspecified; reused the 4px (`--space-1`) that
   `SelectContent` and `ContextActionMenu` already use, though a tooltip is visually smaller.
4. **`TabsTab` icon / label / count gap** — not specified for Tabs; used 8px by analogy with the
   spec's generic "icon↔label = 8" rule.
5. **No fixed counter lane across sibling tabs** (spec §3.3 asks for one so that names do not
   float). `TabsTab`'s `count` prop only styles its own tab; sizing a lane across tabs needs a
   composed `BoardTabs` that can see every sibling, which is outside this primitive's scope.
6. **No standalone `Counter` component** — mentioned in the spec, not yet a registry item, and
   not specified beyond "caption + text/tertiary".
7. **`TooltipArrow` not exported** — Base UI has the part, but the spec's Tooltip row shows no
   arrow and gives no geometry for one, so building it would mean inventing pixel values.

## 5. Not done

Items 5–7 above; vertical orientation of `Tabs` is unstyled (the spec routes vertical navigation
to `SettingsNavRow`, a different component); `TooltipPopup`'s `side="left"` is not in the demo or
the screenshots (top / bottom / right were enough to prove positioning).

## 6. Acceptance

`pnpm run ci` green end to end after merging `main` (theme reset) into the branch:
`registry:validate` 19 items, `lint:tokens` 18 files with no literals, `eslint .` clean,
`typecheck` 4/4 packages, `test` 86/86 registry + 20/20 tokens.

## 7. Git

Seven commits on `feat/primitives-c` plus a merge of `main`. The first commit (`d794753`) is
missing the `Co-Authored-By` trailer — noticed after committing and deliberately not amended.
