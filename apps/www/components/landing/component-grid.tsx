import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { CardStage } from "@/components/landing/card-stage";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import {
  ContextActionMenuStage,
  ModalStage,
  SnackbarStage,
} from "@/components/landing/static-stages";
import { TooltipStage } from "@/components/landing/tooltip-stage";
import { Icon } from "@/registry/cubby/ui/icon";
import { catalog, findCatalogEntry, type PreviewSlug } from "@/site/catalog";
import { EXAMPLES } from "@/site/examples";

/**
 * The grid of live components — the argument the rest of the page is only the frame
 * for. Every card holds the component itself, running, not a picture of one and not a
 * paragraph about one; the geometry is beui's, measured (§6.2 item 3): a 24-radius
 * card on `--bg-surface`, a 20-radius well of the page's own colour inset 8 inside it,
 * a 304 row, a 16 gutter, four across.
 *
 * **This module has to stay on the server.** `site/examples.ts` reads example sources
 * off disk, so `node:fs` is one import away; the animation lives in `ScrollReveal`,
 * which takes already-rendered children across the boundary as payload.
 *
 * Two editorial decisions are written down here rather than derived:
 *
 * - **the order.** The catalogue's own order is by group and starts with Icon,
 *   Divider, Spinner — three of the quietest things in the library, and the first
 *   thing anyone would see. This order opens with the components that have the most
 *   shape to them and lets the primitives close it out. It is a display order for one
 *   grid, which is why it does not belong in `catalog.ts`.
 * - **which example.** Most components have one; where there are several, the card
 *   takes the one that fills a well rather than the one that opens a page (Button's
 *   four variants over its two-button form footer). Both are the same files the
 *   component page shows, from `EXAMPLES` — there is no third copy made for the
 *   landing.
 */

interface GridEntry {
  slug: PreviewSlug;
  /**
   * One line under the name. **Not** the registry description: those are written for
   * a documentation page and run to two or three sentences of API, which in a 332px
   * card truncates mid-clause and reads as noise — "Button: primary | secondary |
   * danger | text, height 32 or…". This is the same fact, cut to the width it has to
   * live in. Every one of them is a restatement of the item's own `registry.json`
   * description, never a new claim, and the full text is one click away on the page
   * the card links to.
   */
  caption: string;
  /** `id` of the `EXAMPLES` entry to show. Defaults to the first. */
  example?: string;
  /**
   * Drawn in place instead of the example, for the components that are a single
   * button until somebody clicks them. See `static-stages.tsx`.
   */
  stage?: ReactNode;
}

const GRID: GridEntry[] = [
  {
    slug: "button",
    example: "variants",
    caption: "Four variants, 32 or 28 high, with a loading state.",
  },
  {
    slug: "modal",
    stage: <ModalStage />,
    caption: "Scrim, focus trap, Esc. Five widths from 460.",
  },
  { slug: "tabs", caption: "A row of tabs with counts, on roving tabindex." },
  {
    slug: "snackbar",
    stage: <SnackbarStage />,
    caption: "One at a time. Undo lives five seconds.",
  },
  { slug: "select", caption: "A dropdown, not the native element." },
  { slug: "empty-state", caption: "Icon, sentence, one action. Never an error." },
  {
    slug: "context-action-menu",
    stage: <ContextActionMenuStage />,
    caption: "The row-level «…». Destructive items last.",
  },
  {
    slug: "switch",
    example: "group",
    caption: "A 30×18 toggle, applied the moment it is flipped.",
  },
  { slug: "avatar", caption: "Initials or a photo, and a real unassigned state." },
  { slug: "text-input", caption: "Three heights, a leading icon, a clear button." },
  { slug: "tag", caption: "Nine tones, an optional dot, an optional cross." },
  { slug: "tooltip", stage: <TooltipStage />, caption: "The name of a glyph, on hover and on focus." },
  { slug: "icon-button", caption: "Square, 32 or 28, with an unread dot." },
  { slug: "text-area", caption: "Grows with the text, from 72px to a 240 cap." },
  { slug: "spinner", caption: "A ring with a gap. Stops under reduced motion." },
  { slug: "divider", caption: "One pixel, horizontal or vertical." },
  { slug: "icon", caption: "Any SVG, at 12, 16, 20 or 32." },
];

/** How many cards a row holds at the widest breakpoint — the stagger's row length. */
const COLUMNS = 4;

function exampleComponent(entry: GridEntry) {
  const examples = EXAMPLES[entry.slug];
  const chosen = entry.example
    ? examples.find((candidate) => candidate.id === entry.example)
    : examples[0];
  if (!chosen) {
    throw new Error(
      `The landing grid asks for the "${entry.example}" example of "${entry.slug}", which ` +
        `apps/www/site/examples.ts does not have. Its ids are: ` +
        `${examples.map((candidate) => `"${candidate.id}"`).join(", ")}.`,
    );
  }
  return chosen.Component;
}

/**
 * One card. An `<article>` rather than an `<a>`, with the name carrying a stretched
 * `::after` that covers the whole card: the well is full of real buttons and inputs,
 * and an anchor is not allowed to contain them — nor would a screen reader make
 * anything of a link whose name is a form. So the link is the name, the hit area is
 * the card, and the controls inside are `inert` (`card-stage.tsx`).
 *
 * Hover moves the stroke from 5 % to 10 % over 300ms and changes nothing else — no
 * lift, no shadow, no tint (§5, technique 7). One property is the whole effect.
 */
function GridCard({
  href,
  title,
  description,
  children,
}: {
  href: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="relative flex h-full flex-col rounded-site-card border border-site-border bg-bg-surface p-2 transition-colors duration-(--site-dur-panel) ease-site hover:border-site-border-strong">
      <CardStage>{children}</CardStage>
      <div className="flex flex-col px-2 pt-3 pb-2">
        <Link
          href={href}
          className="truncate text-heading-h3 text-text-1 after:absolute after:inset-0 after:content-['']"
        >
          {title}
        </Link>
        <span className="truncate text-caption-sm text-text-2">{description}</span>
      </div>
    </article>
  );
}

/** The last cell: the same shape, leading out of the grid into the catalogue. */
function BrowseAllCard() {
  return (
    <article className="relative flex h-full flex-col rounded-site-card border border-site-border bg-bg-surface p-2 transition-colors duration-(--site-dur-panel) ease-site hover:border-site-border-strong">
      <div className="flex h-site-card-well items-center justify-center rounded-site-well border border-site-border bg-bg-app p-5">
        <span className="flex h-control-h-xl items-center gap-2 rounded-role-pill border border-site-border bg-film-1 px-4 text-ui-md text-text-1">
          All {catalog.length} items
          <Icon icon={ArrowRight01Icon} />
        </span>
      </div>
      <div className="flex flex-col px-2 pt-3 pb-2">
        <Link
          href="/components"
          className="truncate text-heading-h3 text-text-1 after:absolute after:inset-0 after:content-['']"
        >
          The whole catalogue
        </Link>
        <span className="truncate text-caption-sm text-text-2">
          Install command, live example, source. Every page.
        </span>
      </div>
    </article>
  );
}

export function ComponentGrid() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {GRID.map((entry, index) => {
        const catalogEntry = findCatalogEntry(entry.slug);
        if (!catalogEntry) {
          throw new Error(
            `The landing grid lists "${entry.slug}", which is not in the catalogue.`,
          );
        }
        const Example = exampleComponent(entry);

        return (
          <li key={entry.slug}>
            <ScrollReveal className="h-full" step={index % COLUMNS}>
              <GridCard
                href={`/components/${entry.slug}`}
                title={catalogEntry.item.title}
                description={entry.caption}
              >
                {entry.stage ?? <Example />}
              </GridCard>
            </ScrollReveal>
          </li>
        );
      })}

      <li>
        <ScrollReveal className="h-full" step={GRID.length % COLUMNS}>
          <BrowseAllCard />
        </ScrollReveal>
      </li>
    </ul>
  );
}
