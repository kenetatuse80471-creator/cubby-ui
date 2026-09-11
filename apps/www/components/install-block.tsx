"use client";

import { useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/cn";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/registry/cubby/ui/tabs";
import { installCommandFor, PACKAGE_RUNNERS, type PackageRunner } from "@/site/site";

/**
 * How to get this item into a project: the shadcn command, or the manual route.
 *
 * The two switchers are what make a page read as a library rather than as a blog
 * post with a snippet in it (§5, technique 14). Both live in the box header, and
 * both matter: **CLI | Manual** on our own `Tabs` primitive — the site is assembled
 * from the registry it documents, which is the only demonstration of a component
 * library that cannot be faked — and the four package runners as a plain segmented
 * row, because a segmented control is not a primitive the registry ships yet.
 *
 * Every command is composed from data. `installCommandFor` in `site/site.ts` owns
 * the registry address, the same function the markdown mirror and `llms.txt` call,
 * and the manual line is built from the item's own `dependencies` — so a dependency
 * added in `registry.json` appears here in the same commit and nowhere is there a
 * second copy to forget.
 */
const ADD_VERB: Record<PackageRunner, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

export function InstallBlock({
  slug,
  dependencies,
  files,
}: {
  slug: string;
  /** Exactly as `registry.json` states them, version range included. */
  dependencies: string[];
  /** Paths relative to the repository root, as the registry addresses them. */
  files: string[];
}) {
  const [runner, setRunner] = useState<PackageRunner>("npm");

  const cliCommand = installCommandFor(slug, runner);
  const manualCommand =
    dependencies.length > 0 ? `${ADD_VERB[runner]} ${dependencies.join(" ")}` : null;

  return (
    <Tabs
      defaultValue="cli"
      className="overflow-hidden rounded-site-block border border-site-border bg-bg-well"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-site-border bg-film-1 py-1 pr-2 pl-2">
        <TabsList>
          <TabsTab value="cli">CLI</TabsTab>
          <TabsTab value="manual">Manual</TabsTab>
        </TabsList>

        <div className="ml-auto flex items-center gap-1">
          {PACKAGE_RUNNERS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setRunner(candidate)}
              aria-pressed={candidate === runner}
              className={cn(
                "h-control-h-sm cursor-pointer rounded-role-tag px-2 text-caption-sm-strong",
                "transition-colors duration-(--site-dur-base) ease-site",
                "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
                "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
                candidate === runner
                  ? "bg-film-3 text-text-1"
                  : "text-text-3 hover:text-text-1",
              )}
            >
              {candidate}
            </button>
          ))}
        </div>
      </div>

      <TabsPanel value="cli">
        <CommandLine command={cliCommand} />
      </TabsPanel>

      <TabsPanel value="manual" className="flex flex-col">
        {manualCommand ? (
          <CommandLine command={manualCommand} />
        ) : (
          <p className="px-4 py-3 text-caption-sm text-text-2">
            No packages to install — this item depends on nothing outside your project.
          </p>
        )}
        <div className="flex flex-col gap-1 border-t border-site-border px-4 py-3">
          <p className="text-caption-sm text-text-2">
            Then copy {files.length === 1 ? "this file" : "these files"} into your project:
          </p>
          <ul className="flex flex-col gap-1">
            {files.map((file) => (
              <li key={file} className="font-site-mono text-site-code text-text-1">
                {file}
              </li>
            ))}
          </ul>
        </div>
      </TabsPanel>
    </Tabs>
  );
}

function CommandLine({ command }: { command: string }) {
  return (
    <div className="flex items-start gap-2 py-3 pr-2 pl-4">
      <pre className="min-w-0 flex-1 overflow-x-auto font-site-mono text-site-code text-text-1">
        <span aria-hidden className="text-text-3">
          ${" "}
        </span>
        {command}
      </pre>
      <span className="shrink-0">
        <CopyButton text={command} label="Copy install command" />
      </span>
    </div>
  );
}
