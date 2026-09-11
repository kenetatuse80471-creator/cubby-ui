"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

interface TocEntry {
  id: string;
  label: string;
  level: 2 | 3;
}

/**
 * «On this page» — the right column, 256px (§1.2).
 *
 * It is built from the page rather than handed to it: on mount the component reads
 * every `h2[id]` / `h3[id]` inside the content column and lists them in document
 * order. That is the one arrangement the two cannot drift apart in — a section
 * renamed, added or dropped on a page is renamed, added or dropped here in the same
 * edit, and a heading somebody forgot to give an `id` is simply absent instead of
 * being a link to nowhere. A heading can override its own wording with
 * `data-toc-label` when the full text is too long for the column.
 *
 * The active section comes from an `IntersectionObserver` rather than from scroll
 * arithmetic. `rootMargin` shrinks the viewport to a band just under the header:
 * the top inset clears the 56px bar, and the −62 % bottom inset means a heading
 * stops counting as «current» once it has travelled into the lower third — so the
 * highlight moves when a section leads the screen, not when it merely appears at
 * the bottom of it.
 */
const OBSERVER_ROOT_MARGIN = "-72px 0px -62% 0px";

export function DocsToc({ contentId }: { contentId: string }) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  /*
   * Everything this component knows arrives through the observer, including the
   * list itself — nothing is written to state from the body of the effect. That is
   * not a lint dodge, it is the honest shape: the effect subscribes to the DOM, and
   * the DOM answers. The browser delivers the first `IntersectionObserver` callback
   * for every observed element on the frame after `observe`, so the list appears
   * with the first answer rather than after a second render pass.
   */
  useEffect(() => {
    const content = document.getElementById(contentId);
    if (!content) return;

    const headings = Array.from(
      content.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"),
    );
    if (headings.length === 0) return;

    const order = headings.map((heading) => heading.id);
    const seen = new Set<string>();
    let listed = false;

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const { id } = record.target;
          if (record.isIntersecting) seen.add(id);
          else seen.delete(id);
        }

        if (!listed) {
          listed = true;
          setEntries(
            headings.map((heading) => ({
              id: heading.id,
              label: heading.dataset.tocLabel ?? heading.textContent?.trim() ?? heading.id,
              level: heading.tagName === "H3" ? 3 : 2,
            })),
          );
        }

        // The first heading of the band, in document order — not in callback order.
        // Nothing in the band (scrolled past the last section) keeps the previous
        // one lit instead of snapping the highlight back to the top.
        const current = order.find((id) => seen.has(id));
        setActiveId((previous) => current ?? previous ?? order[0] ?? null);
      },
      { rootMargin: OBSERVER_ROOT_MARGIN, threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [contentId, pathname]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <p className="text-site-eyebrow font-semibold text-text-3 uppercase">On this page</p>
      <ul className="flex flex-col border-l border-site-border">
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id} className="relative">
              {active ? (
                <motion.span
                  aria-hidden
                  layoutId="docs-toc-active"
                  className="absolute inset-y-1 -left-px w-px bg-text-1"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 44, mass: 0.7 }
                  }
                />
              ) : null}
              <a
                href={`#${entry.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "flex min-h-control-h-md items-center py-1 pr-2",
                  "transition-colors duration-(--site-dur-base) ease-site",
                  // 12 for a section, 12 + 16 = 28 for a sub-section (§1.6 item 9).
                  // `pl-28` is the 28px token, not a multiplier — the spacing scale
                  // here is named after its value, so `pl-7` would be 32.
                  entry.level === 3 ? "pl-28" : "pl-3",
                  active
                    ? "text-ui-md text-text-1"
                    : "text-ui-md-regular text-text-2 hover:text-text-1",
                )}
              >
                {entry.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
