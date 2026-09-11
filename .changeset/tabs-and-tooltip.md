---
"@cubby-ui/registry": minor
---

Two more primitives, built on Base UI's Tabs and Tooltip: `tabs` (Root/List/Tab/Panel/Indicator)
and `tooltip` (Root/Trigger/Portal/Positioner/Popup/Provider). Keyboard and ARIA for Tabs come
from the primitive; Tooltip's trigger↔popup `aria-describedby` link does not — Base UI's Tooltip
leaves that out unlike its Dialog/Popover/Toast — so it is wired in by hand. All values come from
`@cubby-ui/tokens`; no literal colour, size, or radius in either component's code.
