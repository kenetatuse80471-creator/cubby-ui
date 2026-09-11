import type { ComponentType } from "react";

import type { PreviewSlug } from "@/site/catalog";
import { readAppFile } from "@/site/source-files";

import AvatarDefault from "@/components/examples/avatar/default";
import ButtonDefault from "@/components/examples/button/default";
import ButtonLoading from "@/components/examples/button/loading";
import ButtonVariants from "@/components/examples/button/variants";
import ContextActionMenuDefault from "@/components/examples/context-action-menu/default";
import DividerDefault from "@/components/examples/divider/default";
import EmptyStateDefault from "@/components/examples/empty-state/default";
import IconButtonDefault from "@/components/examples/icon-button/default";
import IconDefault from "@/components/examples/icon/default";
import ModalDefault from "@/components/examples/modal/default";
import SelectDefault from "@/components/examples/select/default";
import SnackbarDefault from "@/components/examples/snackbar/default";
import SpinnerDefault from "@/components/examples/spinner/default";
import SwitchDefault from "@/components/examples/switch/default";
import SwitchGroup from "@/components/examples/switch/group";
import TagDefault from "@/components/examples/tag/default";
import TextAreaDefault from "@/components/examples/text-area/default";
import TextInputDefault from "@/components/examples/text-input/default";

/**
 * Examples of the site: one short, real use per component, not a grid of states.
 *
 * The point of this module is that a page's **live preview and its code block are
 * the same file**. `Component` is imported statically, so the bundler renders it;
 * `file` is the path that same module sits at, so the code shown underneath is read
 * off disk at build time from the very file that produced the preview. There is no
 * second copy of the snippet anywhere, which is the only way the two cannot drift.
 *
 * Adding a component: drop `components/examples/<slug>/default.tsx` with a default
 * export, then add it here. The map is typed per `PreviewSlug`, so a component
 * without an entry is a type error, not an empty page.
 */

export interface SiteExample {
  /** File name without the extension — `default`, `variants`, `loading`, … */
  id: string;
  /** Heading above the example, English, sentence case. */
  title: string;
  /** Path relative to the app root; both the import above and the disk read use it. */
  file: string;
  Component: ComponentType;
}

/** At least one example per component — the tuple type is what enforces it. */
type ExampleList = readonly [SiteExample, ...SiteExample[]];

function example(
  slug: PreviewSlug,
  id: string,
  title: string,
  Component: ComponentType,
): SiteExample {
  return { id, title, file: `components/examples/${slug}/${id}.tsx`, Component };
}

export const EXAMPLES: Record<PreviewSlug, ExampleList> = {
  icon: [example("icon", "default", "Default", IconDefault)],
  spinner: [example("spinner", "default", "Default", SpinnerDefault)],
  divider: [example("divider", "default", "Default", DividerDefault)],
  button: [
    example("button", "default", "Default", ButtonDefault),
    example("button", "variants", "Variants", ButtonVariants),
    example("button", "loading", "Loading", ButtonLoading),
  ],
  "icon-button": [example("icon-button", "default", "Default", IconButtonDefault)],
  switch: [
    example("switch", "default", "Default", SwitchDefault),
    example("switch", "group", "Several in a block", SwitchGroup),
  ],
  "text-input": [example("text-input", "default", "Default", TextInputDefault)],
  "text-area": [example("text-area", "default", "Default", TextAreaDefault)],
  select: [example("select", "default", "Default", SelectDefault)],
  tag: [example("tag", "default", "Default", TagDefault)],
  avatar: [example("avatar", "default", "Default", AvatarDefault)],
  "empty-state": [example("empty-state", "default", "Default", EmptyStateDefault)],
  modal: [example("modal", "default", "Default", ModalDefault)],
  snackbar: [example("snackbar", "default", "Default", SnackbarDefault)],
  "context-action-menu": [
    example("context-action-menu", "default", "Default", ContextActionMenuDefault),
  ],
};

export function examplesFor(slug: string): ExampleList | undefined {
  return Object.prototype.hasOwnProperty.call(EXAMPLES, slug)
    ? EXAMPLES[slug as PreviewSlug]
    : undefined;
}

/** The source text of one example, read from the file the preview was built from. */
export function readExampleSource(example: SiteExample) {
  return readAppFile(example.file);
}
