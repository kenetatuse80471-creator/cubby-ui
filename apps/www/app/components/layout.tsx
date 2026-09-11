import type { ReactNode } from "react";

import { DocsSidebar, type DocsNavGroup } from "@/components/docs-sidebar";
import { DocsToc } from "@/components/docs-toc";
import { cn } from "@/lib/cn";
import { catalogByGroup } from "@/site/catalog";

/**
 * The documentation shell, shared by the catalogue index and every component page.
 *
 * Three columns, measured (§1.2, §6.1): sidebar 240, content 816, «On this page»
 * 256, a 32px gap between them and a 32px gutter outside — 1376 of row inside a
 * 1440 window, which is the width every reference was measured at. Past 1440 the
 * row stops growing and centres; below `xl` the table of contents goes, below `lg`
 * the sidebar folds into a disclosure above the content.
 *
 * The catalogue is read here, on the server, and handed down as plain strings. The
 * sidebar needs the browser for the active route and its travelling highlight, and
 * `registry.json` has no business being shipped to it for two fields per item.
 */
const DOCS_CONTENT_ID = "docs-content";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  const groups: DocsNavGroup[] = catalogByGroup().map(({ group, entries }) => ({
    id: group.id,
    title: group.title,
    items: entries.map((entry) => ({ slug: entry.slug, title: entry.item.title })),
  }));

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-site-shell flex-col gap-6 px-4 pt-6 pb-site-section-bottom",
        "lg:flex-row lg:items-start lg:gap-site-gutter lg:px-site-gutter lg:pt-7",
      )}
    >
      <DocsSidebar groups={groups} />

      <div id={DOCS_CONTENT_ID} className="min-w-0 max-w-site-content flex-1">
        {children}
      </div>

      <aside className="hidden w-site-toc shrink-0 xl:block">
        <div className="sticky top-site-sticky max-h-[calc(100vh-var(--site-sticky-top))] overflow-y-auto pb-6">
          <DocsToc contentId={DOCS_CONTENT_ID} />
        </div>
      </aside>
    </div>
  );
}
