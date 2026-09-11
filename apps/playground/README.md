# `playground`

A local page with every Cubby UI demo under each other — the thing a designer looks at.

```bash
pnpm --filter playground dev     # http://localhost:4318
pnpm --filter playground shots   # builds, screenshots, and stops the server again
```

`?theme=light` opens the light palette; the button in the header switches it by hand.

`shots/` holds two PNG per demo (dark and light), 960 CSS px wide. They are committed:
they are the review artefact, and a diff on them is a diff on the components.
