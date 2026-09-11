"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/cn";
import { installCommandFor, PACKAGE_RUNNERS, type PackageRunner } from "@/site/site";

/**
 * The install line, with the four package runners people actually have installed.
 * The command itself is built in `site/site.ts`, so the registry address is written
 * down once for the page, the markdown mirror and `llms.txt` alike.
 */
export function InstallCommand({ slug }: { slug: string }) {
  const [runner, setRunner] = useState<PackageRunner>("npm");
  const command = installCommandFor(slug, runner);

  return (
    <div className="overflow-hidden rounded-site-block border border-site-border bg-bg-well">
      <div className="flex h-control-h-lg items-center gap-1 border-b border-site-border px-2">
        {PACKAGE_RUNNERS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            onClick={() => setRunner(candidate)}
            aria-pressed={candidate === runner}
            className={cn(
              "h-control-h-sm cursor-pointer rounded-role-control px-2 text-caption-sm",
              "transition-colors duration-(--motion-fast) ease-standard",
              "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
              "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
              candidate === runner ? "bg-film-2 text-text-1" : "text-text-3 hover:text-text-1",
            )}
          >
            {candidate}
          </button>
        ))}
        <span className="ml-auto">
          <CopyButton text={command} label="Copy install command" />
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-site-mono text-site-code text-text-1">
        {command}
      </pre>
    </div>
  );
}
