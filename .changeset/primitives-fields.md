---
"@cubby-ui/registry": minor
---

Batch B field primitives: `text-input`, `text-area`, `select`. `select` is built on Base UI's
Select (Root/Trigger/Value/Icon/Portal/Positioner/Popup/List/Item/ItemText/ItemIndicator), not
the native element — keyboard and ARIA come from the primitive. All values come from
`@cubby-ui/tokens`; no literal colour, size, or radius in the component code.
