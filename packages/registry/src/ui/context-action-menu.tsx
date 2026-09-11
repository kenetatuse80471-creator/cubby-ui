"use client";

import type { ComponentProps, ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import { cva, type VariantProps } from "class-variance-authority";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { Divider } from "@/registry/cubby/ui/divider";
import { Icon, type IconSvgElement } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";

/**
 * The gap between the trigger and the popup, in pixels: Base UI's positioner
 * takes a number, not a CSS length, so this one value cannot be a class.
 * It is `--space-1` (4).
 */
const MENU_SIDE_OFFSET = 4;

const menuPopupVariants = cva([
  "flex w-comp-popover-menu flex-col p-1 outline-none",
  "rounded-role-overlay border border-solid border-film-border-strong",
  "bg-bg-raised shadow-popover",
  "transition-opacity duration-(--motion-fast) ease-standard",
  "data-starting-style:opacity-0 data-ending-style:opacity-0",
  "motion-reduce:transition-none",
]);

const menuItemVariants = cva(
  [
    "flex h-row-h-menu cursor-pointer select-none items-center gap-2 px-2",
    "rounded-6 text-ui-md-regular outline-none",
    "data-highlighted:bg-film-2",
    "data-disabled:pointer-events-none data-disabled:cursor-not-allowed",
    "data-disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      tone: {
        default: "text-text-1",
        destructive: "text-danger",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export type MenuItemTone = NonNullable<VariantProps<typeof menuItemVariants>["tone"]>;

export type MenuRootProps = ComponentProps<typeof Menu.Root>;

/** Base UI's `Menu.Root`, re-exported so a custom popover can be composed. */
export function MenuRoot(props: MenuRootProps) {
  return <Menu.Root {...props} />;
}

export type MenuTriggerProps = ComponentProps<typeof Menu.Trigger>;

/** Carries `aria-haspopup="menu"` and `aria-expanded` on its own. */
export function MenuTrigger(props: MenuTriggerProps) {
  return <Menu.Trigger data-slot="context-action-menu-trigger" {...props} />;
}

export interface MenuPopupProps extends ComponentProps<typeof Menu.Popup> {
  /** Which edge of the trigger the popup lines up with. */
  align?: ComponentProps<typeof Menu.Positioner>["align"];
  side?: ComponentProps<typeof Menu.Positioner>["side"];
  sideOffset?: ComponentProps<typeof Menu.Positioner>["sideOffset"];
  /** Renders the portal into this element instead of `<body>` (demos, docs). */
  container?: ComponentProps<typeof Menu.Portal>["container"];
}

/** Portal, positioner and surface in one: 210 wide, radius 12, padding 4. */
export function MenuPopup({
  align = "end",
  side = "bottom",
  sideOffset = MENU_SIDE_OFFSET,
  container,
  className,
  ...props
}: MenuPopupProps) {
  return (
    <Menu.Portal container={container}>
      <Menu.Positioner
        data-slot="context-action-menu-positioner"
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="z-(--z-dropdown)"
      >
        <Menu.Popup
          data-slot="context-action-menu-popup"
          className={cn(menuPopupVariants(), className)}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export interface MenuItemProps
  extends ComponentProps<typeof Menu.Item>,
    VariantProps<typeof menuItemVariants> {}

/** A row 28 high: icon lane 16, label, optional trailing slot. */
export function MenuItem({ className, tone, ...props }: MenuItemProps) {
  return (
    <Menu.Item
      data-slot="context-action-menu-item"
      className={cn(menuItemVariants({ tone }), className)}
      {...props}
    />
  );
}

export type MenuGroupProps = ComponentProps<typeof Menu.Group>;

export function MenuGroup(props: MenuGroupProps) {
  return <Menu.Group data-slot="context-action-menu-group" {...props} />;
}

export type MenuSeparatorProps = ComponentProps<typeof Divider>;

/** The line before the destructive group; the same `Divider`, with a role. */
export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <Divider
      data-slot="context-action-menu-separator"
      decorative={false}
      className={cn("my-1", className)}
      {...props}
    />
  );
}

/** The fixed 16 lane that keeps every label on the same vertical line. */
export function MenuItemIcon({ icon }: { icon?: IconSvgElement }) {
  return (
    <span
      aria-hidden
      className="flex size-icon-md shrink-0 items-center justify-center text-text-2"
    >
      {icon ? <Icon icon={icon} /> : null}
    </span>
  );
}

/** One row of the menu, as Altis describes it. */
export interface ActionDescriptor {
  id: string;
  label: ReactNode;
  /** Glyph from `@hugeicons/core-free-icons`, drawn at 16. */
  icon?: IconSvgElement;
  disabled?: boolean;
  /** Moves the row into the last group, behind the divider, and paints it red. */
  destructive?: boolean;
  onAction: () => void;
}

export interface ContextActionMenuProps {
  actions: ActionDescriptor[];
  /** Required: the trigger is an icon and has no other name. */
  ariaLabel: string;
  /** Replaces the default «…» button; gets the menu props and `ariaLabel`. */
  trigger?: MenuTriggerProps["render"];
  align?: MenuPopupProps["align"];
  side?: MenuPopupProps["side"];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: MenuRootProps["onOpenChange"];
  /** Renders the portal into this element instead of `<body>` (demos, docs). */
  container?: MenuPopupProps["container"];
  className?: string;
}

/**
 * The row-level «…» menu: up to eight items, the destructive ones last, in
 * their own group behind a `Divider`, red. Opening by click (never by hover),
 * `↑↓`, `Enter`, `Esc`, typeahead and the focus returning to the trigger are
 * Base UI Menu; the geometry is 04 S-02 and M-04.
 */
export function ContextActionMenu({
  actions,
  ariaLabel,
  trigger,
  align = "end",
  side = "bottom",
  open,
  defaultOpen,
  onOpenChange,
  container,
  className,
}: ContextActionMenuProps) {
  const regular = actions.filter((action) => !action.destructive);
  const destructive = actions.filter((action) => action.destructive);
  // If any row has a glyph, every row keeps the lane — otherwise the labels
  // of the rows without one would sit closer to the edge than to each other.
  const hasIcons = actions.some((action) => action.icon !== undefined);

  const renderItem = (action: ActionDescriptor) => (
    <MenuItem
      key={action.id}
      tone={action.destructive ? "destructive" : "default"}
      disabled={action.disabled}
      onClick={action.onAction}
    >
      {hasIcons ? <MenuItemIcon icon={action.icon} /> : null}
      <span className="min-w-0 flex-1 truncate">{action.label}</span>
    </MenuItem>
  );

  return (
    <MenuRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <MenuTrigger
        aria-label={ariaLabel}
        render={
          trigger ?? (
            <IconButton
              variant="text"
              size="compact"
              aria-label={ariaLabel}
              icon={<Icon icon={MoreHorizontalIcon} />}
            />
          )
        }
      />
      <MenuPopup
        data-slot="context-action-menu"
        aria-label={ariaLabel}
        align={align}
        side={side}
        container={container}
        className={className}
      >
        {regular.map(renderItem)}
        {destructive.length > 0 ? (
          <>
            {regular.length > 0 ? <MenuSeparator /> : null}
            <MenuGroup>{destructive.map(renderItem)}</MenuGroup>
          </>
        ) : null}
      </MenuPopup>
    </MenuRoot>
  );
}

export { menuItemVariants, menuPopupVariants, MENU_SIDE_OFFSET };
