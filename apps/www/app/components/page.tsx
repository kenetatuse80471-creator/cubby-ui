import type { Metadata } from "next";
import Link from "next/link";

import { NewBadge } from "@/components/new-badge";
import { catalogByGroup, entryIsNew } from "@/site/catalog";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Components",
  description: "Every item of the Cubby UI registry, grouped by what it is for.",
};

/** The index of the catalogue: the groups, in order, with every item in each. */
export default function ComponentsPage() {
  const groups = catalogByGroup();

  return (
    <div className="mx-auto flex max-w-site flex-col gap-10 px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-site-h2 text-text-1">Components</h1>
        <p className="max-w-site-content text-body-md text-text-body">
          Every item of the registry, grouped by what it is for. Each page carries the install
          command, a live example with its source, and the component's own source.
        </p>
      </header>

      {groups.map(({ group, entries }) => (
        <section key={group.id} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-heading-h2 text-text-1">{group.title}</h2>
            <p className="text-caption-sm text-text-2">{group.description}</p>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
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
                  <span className="mt-auto font-site-mono text-mono-sm text-text-3">
                    {entry.slug}
                    {entry.item.version ? ` · ${entry.item.version}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
