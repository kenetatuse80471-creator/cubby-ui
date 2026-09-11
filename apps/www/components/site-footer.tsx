import Link from "next/link";

import { GITHUB_URL, SITE_NAME } from "@/site/site";

/**
 * The footer. A `border-t` in the same alpha-white as every other stroke on the
 * site, then two rows: what the site is made of, and who it is made from.
 *
 * The beUI line is not decoration and is not optional. Parts of this site's
 * machinery are derived from beUI, which is MIT licensed, and the licence requires
 * the attribution to travel with the work; `THIRD-PARTY-NOTICES.md` lists every
 * file it applies to.
 */
/**
 * `page: false` marks a route handler rather than a page — `next/link` would ask it
 * for a client payload and get JSON or plain text back, so those are plain anchors.
 */
const LINKS = [
  { href: "/components", label: "Components", page: true },
  { href: "/registry.json", label: "registry.json", page: false },
  { href: "/llms.txt", label: "llms.txt", page: false },
] as const;

const LINK_CLASS =
  "text-ui-md-regular text-text-2 transition-colors duration-(--site-dur-base) ease-site hover:text-text-1";

export function SiteFooter() {
  return (
    <footer className="mt-site-section-bottom border-t border-site-border">
      <div className="mx-auto flex max-w-site-shell flex-col gap-6 px-4 py-site-section-top md:px-site-gutter">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-body-md font-semibold text-text-1">
              <span
                aria-hidden
                className="grid size-6 place-items-center rounded-role-tag bg-plate"
              >
                <span className="size-2 rounded-2 bg-bg-app" />
              </span>
              {SITE_NAME}
            </span>
            <p className="max-w-comp-empty-text text-caption-sm text-text-2">
              Copy-in components for product interfaces, delivered through a shadcn registry.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2">
            {LINKS.map((link) =>
              link.page ? (
                <Link key={link.href} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </a>
              ),
            )}
            <a href={GITHUB_URL} rel="noreferrer" target="_blank" className={LINK_CLASS}>
              GitHub
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-1 border-t border-site-border pt-6">
          <p className="text-caption-sm text-text-2">{SITE_NAME} — MIT licensed.</p>
          <p className="text-caption-sm text-text-3">
            Site machinery adapted from{" "}
            <a
              href="https://github.com/starc007/ui-components"
              className="underline underline-offset-2 transition-colors duration-(--site-dur-base) ease-site hover:text-text-1"
              rel="noreferrer"
              target="_blank"
            >
              beUI
            </a>{" "}
            by Saurabh Chauhan (MIT).
          </p>
        </div>
      </div>
    </footer>
  );
}
