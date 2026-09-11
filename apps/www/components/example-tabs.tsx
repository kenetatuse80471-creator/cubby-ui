"use client";

import { SourceCodeIcon, ViewIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { Icon } from "@/registry/cubby/ui/icon";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/registry/cubby/ui/tabs";

/**
 * **Preview | Code**, on the registry's own `Tabs`.
 *
 * That choice is the point of the component, not an implementation detail: a
 * library's showcase is the one place where using somebody else's tab component
 * would be an admission. Nothing about the primitive is overridden here — the tab's
 * own radius (6), height (32, `size="regular"`) and active fill (`--film-3`) are
 * what the library ships. The pill around them is the site's: radius 10
 * (`--radius-role-card`) with 4px of padding, so 10 − 4 = 6 lands exactly on the
 * tab's own radius and the two are concentric (§5, technique 3). The measured pill
 * is 40px tall (§1.4) and 32 + 4 + 4 is 40.
 *
 * Both panels are rendered on the server and passed in as nodes — the preview is a
 * real React component and the code block is Shiki output, and neither needs this
 * file to become a client boundary around them.
 */
export function ExampleTabs({ preview, code }: { preview: ReactNode; code: ReactNode }) {
  return (
    <Tabs defaultValue="preview" className="flex flex-col gap-3">
      {/*
        No stroke on the pill, on purpose: 32 (tab) + 4 + 4 (padding) is the measured
        40, and a 1px border would make it 42. beui's pill is a fill and nothing else
        (§1.4) — the lit top edge is what separates it from the page.

        `--bg-well`, not beui's lighter `--card`: a pill one step LIGHTER than the page
        is invisible in the light theme, where the page is already #FFFFFF. The well is
        recessed in both (#131416 under #17181A, #F1F2F4 under #FFFFFF), and the active
        tab's own film then lifts out of it — which is what a segmented control should
        look like anyway. The code plate and the install box use the same surface, so
        the page has one recessed-chrome material rather than three.
      */}
      <TabsList className="w-fit rounded-role-card bg-bg-well p-1 inset-shadow-site-highlight">
        <TabsTab value="preview" size="regular" icon={<Icon icon={ViewIcon} size="md" />}>
          Preview
        </TabsTab>
        <TabsTab value="code" size="regular" icon={<Icon icon={SourceCodeIcon} size="md" />}>
          Code
        </TabsTab>
      </TabsList>
      <TabsPanel value="preview">{preview}</TabsPanel>
      <TabsPanel value="code">{code}</TabsPanel>
    </Tabs>
  );
}
