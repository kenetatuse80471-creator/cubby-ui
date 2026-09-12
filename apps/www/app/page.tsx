import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  ColorPickerIcon,
  DistributeVerticalCenterIcon,
  Layers01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";
import Link from "next/link";

import { InstallBlock } from "@/components/install-block";
import { ComponentGrid } from "@/components/landing/component-grid";
import { HeroRise, HeroWords } from "@/components/landing/hero-reveal";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { cn } from "@/lib/cn";
import { Icon, type IconSvgElement } from "@/registry/cubby/ui/icon";
import { catalog, findCatalogEntry } from "@/site/catalog";
import { GITHUB_URL } from "@/site/site";

export const dynamic = "force-static";

/**
 * The landing.
 *
 * Its shape is the reference spec's §6.2, and its numbers are measured rather than
 * chosen: 112 above the hero and 80 below (`--site-hero-*`), 56/64 around every
 * section after it, a 64px headline on a 0.95 line at −0.025em, a 672 install
 * terminal, and a four-across grid of 304-high cards. What the spec cannot supply is
 * the claims, and those come from `brief/POSITIONING.md`: every number on this page
 * is one a visitor could check out of the repository — the item count is read from the
 * catalogue, the install line is composed by the same function the docs use, and
 * nothing here counts downloads, users or stars.
 *
 * The page is one column, centred, inside the same `max-w-site-shell` and the same
 * gutter as the header — so the badge, the headline, the cards and the logo above
 * them all hang off one left edge and one right edge, at every width.
 */

const HEADLINE = "Components for dense product interfaces.";

const LEAD =
  "Pulled out of a working task tracker: 32px controls, one token export, " +
  "a monochrome dark canon.";

const TRUST = "Headless behaviour from Base UI. Distributed as a shadcn registry. MIT.";

/** The install command shown in the hero belongs to a real item, with its real files. */
const INSTALL_SLUG = "button";

interface Fact {
  icon: IconSvgElement;
  title: string;
  body: string;
}

/**
 * Four facts, each one checkable in the repository — which is the only kind this page
 * is allowed to make (`POSITIONING.md`). No adjectives do any work here: the argument
 * is 32, 28, 13, one export, and a gate that fails a build.
 */
const FACTS: Fact[] = [
  {
    icon: ColorPickerIcon,
    title: "One export, or the build fails",
    body:
      "Every colour, size, radius and duration comes from a single Figma export. " +
      "A literal inside a component is a failed CI run, not a review comment.",
  },
  {
    icon: Layers01Icon,
    title: "Base UI underneath",
    body:
      "Focus traps, typeahead, dismissal and positioning are Base UI 1.8 — headless " +
      "and unmodified. What this library adds is the geometry and the states.",
  },
  {
    icon: DistributeVerticalCenterIcon,
    title: "Sized for dense screens",
    body:
      "32 and 28px controls, 13px interface text, icons at 16. The numbers a task " +
      "tracker needed to fit a working day on one screen.",
  },
  {
    icon: PackageIcon,
    title: "Read straight out of the repository",
    body:
      "The shadcn CLI installs from GitHub: nothing to host, nothing to publish, " +
      "no version of this library that is not the one in the commit you read.",
  },
];

/**
 * Every section after the hero carries the same rule above it and the same air around
 * it — a 1px alpha stroke, 56 above, 64 below (§1.3). It is the only horizontal line
 * on the page, and it is what gives a long page a pulse instead of a scroll length.
 */
function Section({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-site-border pt-site-section-top pb-site-section-bottom">
      <ScrollReveal className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          {/* 0.22em of tracking at 12/600, uppercase — the counter-rule to the
              headline's −0.025em (§5, technique 11). */}
          <span className="text-site-eyebrow font-semibold text-text-3 uppercase">{eyebrow}</span>
          <h2 className="text-site-h2 font-semibold text-text-1">{title}</h2>
        </div>
        {action}
      </ScrollReveal>
      {children}
    </section>
  );
}

/** The two hero buttons and the section link share one pill: 40 high, radius full. */
const PILL =
  "inline-flex h-control-h-xl shrink-0 items-center justify-center gap-2 rounded-role-pill px-5 text-ui-md transition-colors duration-(--site-dur-base) ease-site focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus) focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent";

export default function HomePage() {
  const installEntry = findCatalogEntry(INSTALL_SLUG);
  if (!installEntry) {
    throw new Error(`The landing installs "${INSTALL_SLUG}", which is not in the catalogue.`);
  }

  return (
    <div className="mx-auto max-w-site-shell px-4 md:px-site-gutter">
      {/*
        Motion writes its `initial` state into the server-rendered HTML as an inline
        style — `opacity: 0`, a blur, a translate — and undoes it on mount. With
        scripting off nothing ever mounts, so the headline and the whole grid would be
        served invisible. Three declarations put them back; `!important` is what beats
        an inline style, and it is scoped to the elements that carry the reveal.
      */}
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;filter:none!important;transform:none!important}`}</style>
      </noscript>

      <section className="flex flex-col items-center pt-site-hero-top pb-site-hero-bottom text-center">
        <HeroRise offset={0}>
          <span className="inline-flex h-control-h-sm items-center gap-2 rounded-role-pill border border-site-border bg-film-1 px-3 text-caption-sm text-text-2">
            <span aria-hidden className="size-2 rounded-full bg-success" />
            {catalog.length} registry items · Base UI · Tailwind v4 · React 19
          </span>
        </HeroRise>

        {/*
          64px on a 0.95 line at −0.025em (§5, techniques 11 and 12), dropping to 40 at
          the small breakpoint — the swap is a single custom property in globals.css,
          so the tracking and the leading follow it without a second rule.
        */}
        <h1 className="mt-6 max-w-site-content text-site-hero font-semibold text-balance text-text-1">
          <HeroWords text={HEADLINE} offset={1} />
        </h1>

        {/* The gaps down the hero are beui's, measured off the reference at 1440:
            26 under the badge, 34 under the headline, ~50 under the paragraph and ~90
            before the terminal — rounded to the steps the token scale actually has
            (24 / 24 / 40 / 64). */}
        <HeroRise
          className="mt-6 max-w-site-hero-lead text-site-hero-sub text-text-2"
          offset={HEADLINE.split(" ").length + 1}
        >
          {LEAD}
        </HeroRise>

        <HeroRise
          className="mt-40 flex flex-wrap items-center justify-center gap-3"
          offset={HEADLINE.split(" ").length + 2}
        >
          <Link
            href="/components"
            className={cn(PILL, "bg-plate text-text-on-plate hover:bg-btn-primary-surface-hover")}
          >
            Browse components
            <Icon icon={ArrowRight01Icon} />
          </Link>
          <a
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
            className={cn(
              PILL,
              "border border-site-border bg-film-1 text-text-1 hover:border-site-border-strong hover:bg-film-2",
            )}
          >
            GitHub
            <Icon icon={ArrowUpRight01Icon} />
          </a>
        </HeroRise>

        <HeroRise
          className="mt-64 flex w-full flex-col items-center gap-4"
          offset={HEADLINE.split(" ").length + 3}
        >
          <p className="text-body-md text-text-3">{TRUST}</p>
          {/*
            The install box of a component page, not a second one written for the
            landing: the same `InstallBlock`, the same four runners, the same command
            built by `installCommandFor`, and the item's real dependency list and file
            paths straight out of `registry.json`.
          */}
          <div className="w-full max-w-site-install text-left">
            <InstallBlock
              slug={installEntry.slug}
              dependencies={installEntry.item.dependencies}
              files={installEntry.item.files.map((file) => file.path)}
            />
          </div>
        </HeroRise>
      </section>

      <Section
        eyebrow="Components"
        title="Every one of them, running"
        action={
          <Link
            href="/components"
            className="inline-flex items-center gap-2 text-ui-md text-text-2 transition-colors duration-(--site-dur-base) ease-site hover:text-text-1"
          >
            Browse the catalogue
            <Icon icon={ArrowRight01Icon} />
          </Link>
        }
      >
        <ComponentGrid />
      </Section>

      <Section eyebrow="Why this one" title="Not another animation library">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact, index) => (
            <li key={fact.title}>
              <ScrollReveal className="flex flex-col gap-3" step={index}>
                <span
                  aria-hidden
                  className="flex size-control-h-md items-center justify-center rounded-role-control border border-site-border bg-film-1 text-text-2"
                >
                  <Icon icon={fact.icon} />
                </span>
                <span className="text-body-md-strong text-text-1">{fact.title}</span>
                <p className="text-ui-md-regular text-text-2">{fact.body}</p>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
