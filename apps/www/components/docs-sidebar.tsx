"use client";

import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { Icon } from "@/registry/cubby/ui/icon";

export interface DocsNavItem {
  slug: string;
  title: string;
}

export interface DocsNavGroup {
  id: string;
  title: string;
  items: DocsNavItem[];
}

/**
 * The catalogue as the left column: 240px wide (§1.2), fixed under the header with
 * a scroll of its own, no divider rule — the column is held by the gap, not by a
 * line (§1.6 item 2).
 *
 * The active item is one floating plate shared by the whole list (`layoutId`): it
 * travels from the old row to the new one instead of the old one fading out and a
 * new one fading in. That is the single piece of motion on the shell, and it is
 * `motion`'s only job here.
 *
 * Below the `lg` breakpoint the column is gone and the same list lives inside a
 * disclosure at the top of the page. A dropdown rather than a modal sheet on
 * purpose: the registry has no Sheet primitive, and wrapping the list in `Modal`
 * would mean the site demonstrating a component for something it is not for.
 */
export function DocsSidebar({ groups }: { groups: DocsNavGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((was) => !was)}
          aria-expanded={open}
          aria-controls="docs-nav-mobile"
          className={cn(
            "flex h-control-h-lg w-full items-center gap-2 rounded-role-control px-3",
            "border border-site-border bg-film-1 text-ui-md text-text-1",
            "transition-colors duration-(--site-dur-base) ease-site",
            "hover:border-site-border-strong",
          )}
        >
          <Icon icon={open ? Cancel01Icon : Menu01Icon} size="md" />
          Browse the catalogue
        </button>
        {open ? (
          <div
            id="docs-nav-mobile"
            className="mt-3 rounded-site-block border border-site-border bg-bg-surface p-3 inset-shadow-site-highlight"
          >
            {/*
              A tap on a link inside the disclosure navigates, and the panel must not
              survive it. Closing it from the link's own handler rather than from an
              effect watching the path: the click is the event, the close is its
              consequence, and React never has to re-render twice to find that out.
            */}
            <CatalogueList
              groups={groups}
              pathname={pathname}
              idPrefix="mobile"
              onNavigate={() => setOpen(false)}
            />
          </div>
        ) : null}
      </div>

      <aside className="hidden w-site-sidebar shrink-0 lg:block">
        <div className="sticky top-site-sticky -mr-4 max-h-[calc(100vh-var(--site-sticky-top))] overflow-y-auto pr-4 pb-6">
          <CatalogueList groups={groups} pathname={pathname} idPrefix="desktop" />
        </div>
      </aside>
    </>
  );
}

function CatalogueList({
  groups,
  pathname,
  idPrefix,
  onNavigate,
}: {
  groups: DocsNavGroup[];
  pathname: string;
  idPrefix: string;
  onNavigate?: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <nav aria-label="Components" className="flex flex-col gap-6">
      <ul className="flex flex-col gap-1">
        <NavRow
          href="/components"
          label="All components"
          active={pathname === "/components"}
          layoutId={`${idPrefix}-docs-active`}
          reduced={reduced}
          onNavigate={onNavigate}
        />
      </ul>

      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <p className="flex items-center gap-2 px-3 text-site-eyebrow font-semibold text-text-3 uppercase">
            {group.title}
            <span className="tabular-nums normal-case">{group.items.length}</span>
          </p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <NavRow
                key={item.slug}
                href={`/components/${item.slug}`}
                label={item.title}
                active={pathname === `/components/${item.slug}`}
                layoutId={`${idPrefix}-docs-active`}
                reduced={reduced}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavRow({
  href,
  label,
  active,
  layoutId,
  reduced,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  layoutId: string;
  reduced: boolean | null;
  onNavigate?: () => void;
}) {
  return (
    <li className="relative">
      {active ? (
        <motion.span
          aria-hidden
          layoutId={layoutId}
          className="absolute inset-0 rounded-role-control bg-film-2"
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 520, damping: 44, mass: 0.7 }
          }
        />
      ) : null}
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex h-control-h-md items-center rounded-role-control px-3",
          "transition-colors duration-(--site-dur-base) ease-site",
          active
            ? "text-ui-md text-text-1"
            : "text-ui-md-regular text-text-2 hover:bg-film-1 hover:text-text-1",
        )}
      >
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
}
