"use client";

import { GithubIcon, Search01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import { Icon } from "@/registry/cubby/ui/icon";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/registry/cubby/ui/tooltip";
import { formatStarCount } from "@/site/github";
import { GITHUB_URL, SITE_NAME } from "@/site/site";

/**
 * `/registry.json` is a route handler, not a page: `next/link` would try to fetch a
 * client payload for it and find JSON, so it is a plain anchor and a full navigation.
 */
const NAV = [
  { href: "/components", label: "Components", page: true },
  { href: "/registry.json", label: "Registry", page: false },
] as const;

/**
 * The bar, 56px tall (§1.2), transparent until the page moves under it (§1.5,
 * technique 15): `background`, `border-color` and `backdrop-filter` are the only
 * three properties that change, over 300ms on the site's single easing. Nothing
 * moves and nothing resizes — the content simply starts showing through frosted
 * glass instead of through nothing.
 *
 * `position: fixed` rather than `sticky` is what makes that read: the first screen
 * of every page begins under the header, so the transition happens against real
 * content rather than against a gap.
 *
 * The scroll state is a plain listener on a `passive` event writing one boolean.
 * The guard matters more than it looks: without it this would call `setState` on
 * every frame of a scroll.
 */
export function SiteHeaderBar({ stars }: { stars: number | null }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled((was) => {
        const now = window.scrollY > 8;
        return was === now ? was : now;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className={cn(
        "fixed inset-x-0 top-0 z-(--z-sticky) h-site-header",
        "border-b border-transparent bg-transparent",
        "transition-[background-color,border-color,backdrop-filter]",
        "duration-(--site-dur-panel) ease-site",
        "data-scrolled:border-b-site-border data-scrolled:bg-bg-app/72",
        "data-scrolled:backdrop-blur-(--site-header-blur)",
      )}
    >
      <div className="mx-auto flex h-full max-w-site-shell items-center gap-6 px-4 md:px-site-gutter">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-body-md font-semibold text-text-1"
        >
          <span aria-hidden className="grid size-6 place-items-center rounded-role-tag bg-plate">
            <span className="size-2 rounded-2 bg-bg-app" />
          </span>
          {SITE_NAME}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = item.page && pathname.startsWith(item.href);
            const className = cn(
              "rounded-role-control px-2 py-1 text-ui-md-regular",
              "transition-colors duration-(--site-dur-base) ease-site",
              active ? "text-text-1" : "text-text-2 hover:text-text-1",
            );
            return item.page ? (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                {item.label}
              </Link>
            ) : (
              <a key={item.href} href={item.href} className={className}>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                /*
                 * A placeholder, and it says so. It is here because the header's
                 * balance is built around it — the ⌘K palette is the next wave —
                 * so it carries the geometry and none of the promise: `aria-disabled`
                 * marks it inert for assistive technology, and the tooltip tells
                 * a sighted visitor the same thing before they click.
                 */
                <button
                  type="button"
                  aria-disabled
                  aria-label="Search — not available yet"
                  className={cn(
                    "hidden h-control-h-md w-comp-search-fixed items-center gap-2 lg:flex",
                    "rounded-role-control border border-site-border bg-film-1 px-3",
                    "cursor-default text-ui-md-regular text-text-3",
                    "transition-colors duration-(--site-dur-base) ease-site",
                    "hover:border-site-border-strong",
                  )}
                >
                  <Icon icon={Search01Icon} size="md" />
                  Search
                  <kbd className="ml-auto rounded-2 bg-film-2 px-1 font-site-mono text-caption-sm text-text-3">
                    ⌘K
                  </kbd>
                </button>
              }
            />
            <TooltipPopup>Not wired up yet — the ⌘K palette is the next wave.</TooltipPopup>
          </Tooltip>

          <a
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
            aria-label={
              stars === null
                ? `${SITE_NAME} on GitHub`
                : `${SITE_NAME} on GitHub — ${stars} stars`
            }
            className={cn(
              "flex h-control-h-md items-center gap-2 rounded-role-control px-2",
              "text-ui-md text-text-2",
              "transition-colors duration-(--site-dur-base) ease-site",
              "hover:bg-film-1 hover:text-text-1",
            )}
          >
            <Icon icon={GithubIcon} size="md" />
            {stars === null ? null : (
              <span className="text-ui-md-tabular tabular-nums">{formatStarCount(stars)}</span>
            )}
          </a>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
