"use client";

import type { ComponentProps, ReactNode } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export type TabsProps = ComponentProps<typeof TabsPrimitive.Root>;

/**
 * Groups the tabs and their panels and owns the active value (Base UI) — the
 * one part of this primitive that renders an element of its own (checked in
 * the library's source: `Tabs.Root` renders a `<div>`, unlike `Select.Root`),
 * so it is the one that carries the bare `tabs` slot.
 *
 * 04 M-05 keeps `Tabs` horizontal only — the vertical case in the spec is a
 * different component (`SettingsNavRow`) — so no orientation styling lives
 * here; Base UI's own `orientation` prop still works, just unstyled.
 */
export function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" className={className} {...props} />;
}

export type TabsListProps = ComponentProps<typeof TabsPrimitive.List>;

/**
 * The tab row. 04 M-05: gap between tabs `space/4` (4) — the row itself is
 * "not a component variant, an auto-layout container", so no fill or border
 * of its own. `overflow-x-auto` is this primitive's own addition, not from
 * the spec: a board row can hold more boards than fit, and scrolling beats
 * wrapping or shrinking tabs to illegible widths.
 */
export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
      {...props}
    />
  );
}

/**
 * Height only — 04 §3.2 measures the tab itself at 28 (`size/control/sm`,
 * "Вкладка, компактная кнопка"), the same row this batch calls `compact`.
 * `regular` (32, `control/md`) is not in the spec for `Tabs` specifically;
 * it is added so the prop matches the `regular | compact` axis of the rest
 * of this batch (Button, IconButton, Select) — see the report's open
 * question on which one `BoardTabs` should actually default to. Radius and
 * padding stay the same across both: 04 M-05 does not vary them by size
 * either.
 */
const tabsTabVariants = cva(
  [
    "relative inline-flex items-center gap-2 rounded-6 px-3",
    "cursor-pointer select-none text-ui-md text-text-2",
    "transition-colors duration-(--motion-fast) ease-standard",
    "hover:bg-film-2",
    "data-active:bg-film-3 data-active:text-text-1 data-active:hover:bg-film-3",
    "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
    "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
    // `data-disabled`, not `disabled:` — Base UI keeps a disabled Tab
    // focusable (`focusableWhenDisabled`, checked in
    // `internals/use-button/useButton.mjs`: it deletes the native `disabled`
    // attribute again after setting it) so the tab stays in the keyboard
    // sequence; only `aria-disabled`/`data-disabled` mark the state.
    "data-disabled:pointer-events-none data-disabled:cursor-not-allowed",
    "data-disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      size: {
        regular: "h-control-h-md",
        compact: "h-control-h-sm",
      },
    },
    defaultVariants: { size: "compact" },
  },
);

export type TabsTabSize = NonNullable<VariantProps<typeof tabsTabVariants>["size"]>;

export interface TabsTabProps
  extends ComponentProps<typeof TabsPrimitive.Tab>,
    VariantProps<typeof tabsTabVariants> {
  /** Leading glyph — an `<Icon />`, 16px (04 M-05 "Has icon"). */
  icon?: ReactNode;
  /**
   * Task count trailing the label — `caption` + `text/tertiary` (04 M-05).
   * 04 §3.3's "fixed counter lane so names don't float" is a rule for a row
   * of tabs with a shared layout, not for one `Tab` in isolation; a consumer
   * composing a real `BoardTabs` over this primitive is the one who can see
   * every sibling at once and reserve that lane — left out here, noted in
   * the report.
   */
  count?: ReactNode;
}

/**
 * One tab. Base UI supplies `role="tab"`, `aria-selected`, `aria-controls`,
 * the roving tabindex and the keyboard handling (`←→` move focus without
 * selecting — `activateOnFocus` defaults to `false` — `Enter`/`Space` select,
 * `Home`/`End` jump to the ends: 04 M-05's whole "Поведение" line is Base
 * UI's default, not styled here). The active state is a fill on the tab
 * itself (`color/film/3`, `data-active`), not a separate sliding indicator —
 * see `TabsIndicator` below for the alternative.
 */
export function TabsTab({ className, size, icon, count, children, ...props }: TabsTabProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(tabsTabVariants({ size }), className)}
      {...props}
    >
      {icon ? (
        <span aria-hidden className="flex shrink-0 items-center">
          {icon}
        </span>
      ) : null}
      {children ? <span className="min-w-0 flex-1 truncate">{children}</span> : null}
      {count != null ? (
        <span
          data-slot="tabs-tab-count"
          className="shrink-0 text-caption-sm text-text-3"
        >
          {count}
        </span>
      ) : null}
    </TabsPrimitive.Tab>
  );
}

export type TabsPanelProps = ComponentProps<typeof TabsPrimitive.Panel>;

/**
 * Shown when its `value` matches the active tab. Base UI supplies
 * `role="tabpanel"`, `aria-labelledby`, `hidden` and `inert` on the others;
 * only the focus ring is this primitive's own — the panel takes
 * `tabIndex={0}` while open so keyboard users can jump into it straight from
 * the tab, and a plain `<div>` has no focus style of its own otherwise.
 */
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn(
        "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
        "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
        className,
      )}
      {...props}
    />
  );
}

export type TabsIndicatorProps = ComponentProps<typeof TabsPrimitive.Indicator>;

/**
 * A sliding highlight tracking the active tab's position and size, through
 * Base UI's own CSS variables (`--active-tab-left/-width`, runtime-computed,
 * not a design token — the same kind of library-owned variable as Select's
 * `--anchor-width`). 04 M-05's active state is the fill on the tab itself,
 * not a separate bar, so nothing here uses it; it is exported, positioned,
 * and otherwise unstyled for a consumer who wants an underline instead of a
 * fill and will supply their own colour.
 */
export function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        "absolute transition-all duration-(--motion-fast) ease-standard motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { tabsTabVariants };
