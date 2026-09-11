import Link from "next/link";

import { NewBadge } from "@/components/new-badge";
import { catalog, entryIsNew } from "@/site/catalog";
import { installCommandFor, SITE_DESCRIPTION } from "@/site/site";

export const dynamic = "force-static";

/**
 * SCAFFOLD LANDING — deliberately plain.
 *
 * NEXT EXECUTOR: this whole file is the placeholder for the real landing page. It is
 * here so the catalogue is reachable from `/` and so the route exists from the first
 * commit; nothing below is meant to survive. What it does establish is the data the
 * landing has to work with: `catalog` is the list, and every string in it comes from
 * `registry.json`.
 */
export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-site flex-col gap-10 px-5 py-16">
      <header className="flex flex-col gap-5">
        <h1 className="max-w-site-content text-site-hero text-text-1">
          A component library for product interfaces.
        </h1>
        <p className="max-w-site-content text-site-hero-sub text-text-body">{SITE_DESCRIPTION}</p>
        <pre className="w-fit overflow-x-auto rounded-site-block border border-site-border bg-bg-well px-4 py-3 font-site-mono text-mono-sm text-text-1">
          {installCommandFor("button")}
        </pre>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-site-h2 text-text-1">{catalog.length} items</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/components/${entry.slug}`}
                className="flex h-full flex-col gap-2 rounded-site-card border border-site-border bg-bg-surface p-4 hover:bg-film-1"
              >
                <span className="flex items-center gap-2">
                  <span className="text-ui-md text-text-1">{entry.item.title}</span>
                  {entryIsNew(entry) ? <NewBadge /> : null}
                </span>
                <span className="text-caption-sm text-text-2">{entry.item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
