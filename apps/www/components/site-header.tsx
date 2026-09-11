import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { GITHUB_URL, SITE_NAME } from "@/site/site";

/**
 * STRUCTURAL PLACEHOLDER — the shell of the site is written from the reference spec
 * by the next executor; this is a header that works, not a header that is designed.
 * It exists so every page has a way out of itself.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-sticky) border-b border-site-border bg-bg-app">
      <div className="mx-auto flex h-site-header max-w-site items-center gap-5 px-5">
        <Link href="/" className="text-ui-md text-text-1">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/components" className="text-ui-md-regular text-text-2 hover:text-text-1">
            Components
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={GITHUB_URL}
            className="text-ui-md-regular text-text-2 hover:text-text-1"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
