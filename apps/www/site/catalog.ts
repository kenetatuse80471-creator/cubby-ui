import { isComponentNew, type ComponentLaunch } from "@/site/component-status";
import { registryItem, registrySlugs, type RegistryItem } from "@/site/registry-data";

/**
 * The catalogue: the site's own view of the registry — grouping, ordering, and
 * whether an item can be shown alive on a page. It deliberately holds **no text**:
 * titles, descriptions, docs notes, versions and dependency lists are read from
 * `registry.json` through `registry-data.ts`, and no file path is repeated here
 * either, because `registry.json` already states where every item's source lives.
 *
 * What the catalogue adds is the editorial part a registry file has no place for.
 */

export const CATALOG_GROUPS = [
  {
    id: "foundation",
    title: "Foundation",
    description: "What everything else is built out of: the values, the class merge, the glyphs.",
  },
  {
    id: "controls",
    title: "Controls",
    description: "Things a person presses or flips.",
  },
  {
    id: "fields",
    title: "Fields",
    description: "Things a person types into or picks from.",
  },
  {
    id: "display",
    title: "Display",
    description: "Markers that carry status and identity without asking for a click.",
  },
  {
    id: "surfaces",
    title: "Surfaces",
    description: "Layers that arrive on top of the page, and the page that has nothing on it.",
  },
] as const;

export type CatalogGroupId = (typeof CATALOG_GROUPS)[number]["id"];
export type CatalogGroup = (typeof CATALOG_GROUPS)[number];

/**
 * Items that install a stylesheet or a helper rather than a component: there is
 * nothing to render, so their pages show the install command and the source only.
 */
const ASSET_SLUGS = ["tokens", "cn"] as const;

/** Items that are React components, i.e. everything that has a live example. */
const PREVIEW_SLUGS = [
  "icon",
  "spinner",
  "divider",
  "button",
  "icon-button",
  "switch",
  "text-input",
  "text-area",
  "select",
  "tag",
  "avatar",
  "empty-state",
  "modal",
  "snackbar",
  "context-action-menu",
] as const;

export type AssetSlug = (typeof ASSET_SLUGS)[number];
/** Slug of an item with a live preview. `examples.ts` is keyed by exactly this union. */
export type PreviewSlug = (typeof PREVIEW_SLUGS)[number];
export type CatalogSlug = AssetSlug | PreviewSlug;

interface CatalogPlacement extends ComponentLaunch {
  group: CatalogGroupId;
  /** Position inside the group. Small integers, gaps allowed. */
  order: number;
}

/**
 * 12.09.2026 is the day every item below first existed in a shipped registry, so
 * every item is genuinely new and carries the badge; it expires by itself a week
 * later (`component-status.ts`). A later component gets its own `launchedAt`.
 */
const LAUNCHED = "2026-09-12";

const PLACEMENT: Record<CatalogSlug, CatalogPlacement> = {
  // Foundation
  tokens: { group: "foundation", order: 10, badge: "new", launchedAt: LAUNCHED },
  cn: { group: "foundation", order: 20, badge: "new", launchedAt: LAUNCHED },
  icon: { group: "foundation", order: 30, badge: "new", launchedAt: LAUNCHED },
  divider: { group: "foundation", order: 40, badge: "new", launchedAt: LAUNCHED },
  spinner: { group: "foundation", order: 50, badge: "new", launchedAt: LAUNCHED },

  // Controls
  button: { group: "controls", order: 10, badge: "new", launchedAt: LAUNCHED },
  "icon-button": { group: "controls", order: 20, badge: "new", launchedAt: LAUNCHED },
  switch: { group: "controls", order: 30, badge: "new", launchedAt: LAUNCHED },

  // Fields
  "text-input": { group: "fields", order: 10, badge: "new", launchedAt: LAUNCHED },
  "text-area": { group: "fields", order: 20, badge: "new", launchedAt: LAUNCHED },
  select: { group: "fields", order: 30, badge: "new", launchedAt: LAUNCHED },

  // Display
  tag: { group: "display", order: 10, badge: "new", launchedAt: LAUNCHED },
  avatar: { group: "display", order: 20, badge: "new", launchedAt: LAUNCHED },

  // Surfaces
  "empty-state": { group: "surfaces", order: 10, badge: "new", launchedAt: LAUNCHED },
  modal: { group: "surfaces", order: 20, badge: "new", launchedAt: LAUNCHED },
  snackbar: { group: "surfaces", order: 30, badge: "new", launchedAt: LAUNCHED },
  "context-action-menu": { group: "surfaces", order: 40, badge: "new", launchedAt: LAUNCHED },
};

export interface CatalogEntry extends CatalogPlacement {
  slug: CatalogSlug;
  /** `true` when the slug has examples and a live preview. */
  previewable: boolean;
  /** Everything user-visible — straight from `registry.json`. */
  item: RegistryItem;
}

const GROUP_ORDER = new Map<CatalogGroupId, number>(
  CATALOG_GROUPS.map((group, index) => [group.id, index]),
);

function entryFor(slug: CatalogSlug): CatalogEntry {
  const placement = PLACEMENT[slug];
  return {
    ...placement,
    slug,
    previewable: (PREVIEW_SLUGS as readonly string[]).includes(slug),
    // Throws, naming the slug, when the registry has no such item.
    item: registryItem(slug),
  };
}

/**
 * The catalogue, in reading order: group by group, then by `order` inside a group.
 */
export const catalog: CatalogEntry[] = (
  [...ASSET_SLUGS, ...PREVIEW_SLUGS] as CatalogSlug[]
)
  .map(entryFor)
  .sort((a, b) => {
    const groups = (GROUP_ORDER.get(a.group) ?? 0) - (GROUP_ORDER.get(b.group) ?? 0);
    return groups !== 0 ? groups : a.order - b.order;
  });

const catalogBySlug = new Map(catalog.map((entry) => [entry.slug as string, entry]));

/**
 * The completeness gate, run the moment this module is first imported — which, on
 * the site, is during `next build`. A registry item nobody catalogued would quietly
 * have no page; a catalogued slug with no registry item would quietly have no text.
 * Both are build failures instead, naming the slugs.
 *
 * This is the check that fires when a new item lands in `registry.json`: add it to
 * `ASSET_SLUGS` or `PREVIEW_SLUGS` with a placement, and (if previewable) to
 * `examples.ts`, which the type system then demands.
 */
const missingFromCatalog = registrySlugs.filter((slug) => !catalogBySlug.has(slug));
if (missingFromCatalog.length > 0) {
  throw new Error(
    `apps/www/site/catalog.ts is out of date: registry.json ships ` +
      `${missingFromCatalog.map((slug) => `"${slug}"`).join(", ")}, which the site catalogue does ` +
      `not list. Add each slug to ASSET_SLUGS or PREVIEW_SLUGS, give it a group and an order in ` +
      `PLACEMENT, and — if it is a component — an entry in apps/www/site/examples.ts.`,
  );
}

export function findCatalogEntry(slug: string) {
  return catalogBySlug.get(slug);
}

export function isCatalogSlug(slug: string): slug is CatalogSlug {
  return catalogBySlug.has(slug);
}

export const catalogSlugs: CatalogSlug[] = catalog.map((entry) => entry.slug);

/** The catalogue grouped for a sidebar or an index page, empty groups dropped. */
export function catalogByGroup(): { group: CatalogGroup; entries: CatalogEntry[] }[] {
  return CATALOG_GROUPS.map((group) => ({
    group,
    entries: catalog.filter((entry) => entry.group === group.id),
  })).filter((section) => section.entries.length > 0);
}

/** Previous and next entry in reading order — the footer links of a component page. */
export function catalogNeighbours(slug: CatalogSlug) {
  const index = catalog.findIndex((entry) => entry.slug === slug);
  return {
    previous: index > 0 ? catalog[index - 1] : undefined,
    next: index >= 0 && index < catalog.length - 1 ? catalog[index + 1] : undefined,
  };
}

export function entryIsNew(entry: CatalogEntry, now = Date.now()) {
  return isComponentNew(entry, now);
}
