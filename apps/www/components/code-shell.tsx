"use client";

import { useState, type ReactNode } from "react";

import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/cubby/ui/button";

/**
 * The frame around a block of code: header, body, and the collapse (§1.4, technique
 * 13). Everything that needs the browser lives here; the highlighted markup is
 * produced on the server and arrives as `children`, so no highlighter ships.
 *
 * Geometry, measured: wrapper radius 12 (`--site-radius-block`), a header carrying
 * the language badge and the file path, a body capped at 375px while collapsed with
 * a 128px fade over it and one control to open it.
 *
 * The fade is `bg-linear-to-t from-bg-well` — the plate's own colour, not a black
 * wash — so the text dissolves into the block instead of into a shadow. It is
 * `pointer-events-none` except for the button it carries, or it would eat the
 * selection of the last four lines of code.
 */
export function CodeShell({
  lang,
  label,
  copyText,
  collapsible,
  children,
}: {
  lang: string;
  /** Usually the file path this code was read from. */
  label?: string;
  copyText: string;
  collapsible: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsed = collapsible && !expanded;

  return (
    <div className="overflow-hidden rounded-site-block border border-site-border bg-bg-well">
      <div className="flex h-control-h-lg items-center gap-2 border-b border-site-border bg-film-1 pr-2 pl-3">
        <span className="shrink-0 rounded-role-tag bg-film-2 px-2 py-px text-site-eyebrow font-semibold text-text-2 uppercase">
          {lang}
        </span>
        {label ? (
          <span className="truncate font-site-mono text-site-code text-text-3">{label}</span>
        ) : null}
        <span className="ml-auto shrink-0">
          <CopyButton text={copyText} label="Copy code" />
        </span>
      </div>

      <div className="relative">
        <div
          className={cn(
            "overflow-x-auto py-4 font-site-mono text-site-code",
            "[&_pre]:bg-transparent! [&_pre]:px-5",
            collapsed && "max-h-site-code-max overflow-y-hidden",
          )}
        >
          {children}
        </div>

        {collapsible ? (
          <div
            className={cn(
              "pointer-events-none flex items-end justify-center pb-4",
              collapsed
                ? "absolute inset-x-0 bottom-0 h-site-code-fade bg-linear-to-t from-bg-well to-transparent"
                : "pt-2 pb-4",
            )}
          >
            <Button
              variant="secondary"
              size="compact"
              className="pointer-events-auto"
              onClick={() => setExpanded((was) => !was)}
            >
              {collapsed ? "Show all" : "Show less"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
