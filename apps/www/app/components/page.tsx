import type { Metadata } from "next";
import Link from "next/link";

import { NewBadge } from "@/components/new-badge";
import { catalog, catalogByGroup, entryIsNew } from "@/site/catalog";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Components",
  description: "Every item of the Cubby UI registry, grouped by what it is for.",
};

/**
 * The index of the catalogue: the groups, in order, with every item in each.
 *
 * The card is the references' own recipe (§1.4, §5 techniques 1, 5 and 7): a 1px
 * alpha-white stroke, no shadow at all, and a hover that moves that stroke from 5 %
 * to 10 % over 300ms and changes nothing else — no lift, no tint, no scale. Two
 * lines of CSS; it is the difference between a page that feels bought and a page
 * that feels assembled.
 *
 * The headings carry ids so the right-hand column builds itself from them.
 */
export default function ComponentsPage() {
  const groups = catalogByGroup();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-site-h1 font-semibold text-text-1">Components</h1>
        <p className="max-w-site-lead text-site-lead text-text-body">
          {catalog.length} items, grouped by what they are for. Every page carries the install
          command, a live example with the source that produced it, and the component&rsquo;s own
          code.
        </p>
      </header>

      <div className="mt-4 flex flex-col gap-5">
        {groups.map(({ group, entries }, index) => (
          <section
            key={group.id}
            className={
              index === 0
                ? "flex flex-col gap-4"
                : "flex flex-col gap-4 border-t border-site-border pt-5"
            }
          >
            <div className="flex flex-col gap-1">
              <h2
                id={group.id}
                className="scroll-mt-site-sticky text-heading-h2 text-text-1"
              >
                {group.title}
              </h2>
              <p className="text-caption-sm text-text-2">{group.description}</p>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/components/${entry.slug}`}
                    className="flex h-full flex-col gap-2 rounded-site-block border border-site-border p-4 transition-colors duration-(--site-dur-panel) ease-site hover:border-site-border-strong"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-body-md-strong text-text-1">{entry.item.title}</span>
                      {entryIsNew(entry) ? <NewBadge /> : null}
                    </span>
                    <span className="text-caption-sm text-text-2">{entry.item.description}</span>
                    <span className="mt-auto pt-2 font-site-mono text-caption-sm text-text-3">
                      {entry.slug}
                      {entry.item.version ? ` · v${entry.item.version}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
