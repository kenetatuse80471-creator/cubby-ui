---
"@cubby-ui/registry": minor
---

The three surfaces of batch B: `modal`, `snackbar` and `context-action-menu`, built on Base UI
Dialog, Toast and Menu. The modal cuts its header and footer off with dividers and scrolls its
body only; one snackbar lives at a time, with the lifetime its kind asks for; the menu keeps its
destructive group last, behind a divider. Every value still comes from `@cubby-ui/tokens` — the
only numbers in the code are the toast lifetimes and the positioner offset, which Base UI takes
as numbers and not as CSS.
