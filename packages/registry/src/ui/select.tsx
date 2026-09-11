"use client";

import type { ReactNode } from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { Icon } from "@/registry/cubby/ui/icon";

export type SelectProps<Value = string> = SelectPrimitive.Root.Props<Value>;

/**
 * Groups every part below and owns the open/value state (Base UI). It
 * renders no element of its own — checked in the library's source — so it
 * carries no `data-slot`; `select-trigger` is the closed-state control a
 * consumer actually sees and can hook into.
 */
export function Select<Value = string>(props: SelectProps<Value>) {
  return <SelectPrimitive.Root {...props} />;
}

/**
 * 04 A-08: fill `film/1`, stroke `border/film`, radius `radius/8`
 * (`role/control`, same as TextInput). Heights are the Button/IconButton
 * pair — `regular` 32, `compact` 28 — per this batch's acceptance criteria;
 * 04 §0.3 also allows a 36 "large select" in a modal-form row, left out
 * here (see the report's open questions).
 */
const selectTriggerVariants = cva(
  [
    "inline-flex w-full min-w-0 cursor-pointer items-center justify-between gap-2",
    "rounded-role-control border border-solid border-film-border px-3",
    "text-ui-md text-text-1 transition-colors duration-(--motion-fast) ease-standard",
    "hover:bg-film-2 data-[popup-open]:bg-film-2 data-[placeholder]:text-text-3",
    "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
    "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
    "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      tone: {
        default: "bg-film-1",
        raised: "bg-bg-raised",
      },
      size: {
        regular: "h-control-h-md",
        compact: "h-control-h-sm",
      },
    },
    defaultVariants: { tone: "default", size: "regular" },
  },
);

export type SelectTone = NonNullable<VariantProps<typeof selectTriggerVariants>["tone"]>;
export type SelectSize = NonNullable<VariantProps<typeof selectTriggerVariants>["size"]>;

export interface SelectTriggerProps
  extends SelectPrimitive.Trigger.Props,
    VariantProps<typeof selectTriggerVariants> {
  /** Icon before the value — an `<Icon />`, 16px (04 A-08 "Has icon start"). */
  iconStart?: ReactNode;
}

/**
 * The closed-state control: value/placeholder text plus the chevron.
 * Base UI supplies `role="combobox"`, `aria-haspopup`, `aria-expanded` and
 * the keyboard handling; `data-popup-open` marks the open state (04 §0.1).
 */
export function SelectTrigger({
  className,
  tone,
  size,
  iconStart,
  children,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectTriggerProps) {
  const invalid = ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false";

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      aria-invalid={ariaInvalid}
      className={cn(selectTriggerVariants({ tone, size }), invalid && "border-danger", className)}
      {...props}
    >
      {iconStart ? (
        <span className="flex shrink-0 items-center text-text-3">{iconStart}</span>
      ) : null}
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="flex shrink-0 items-center text-text-2"
      >
        <Icon icon={ArrowDown01Icon} size="md" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export type SelectValueProps = SelectPrimitive.Value.Props;

/** The label of the current item, or the placeholder when nothing is chosen. */
export function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value data-slot="select-value" className={cn("truncate", className)} {...props} />
  );
}

export interface SelectContentProps extends SelectPrimitive.Popup.Props {
  /** Forwarded to `Select.Portal` — lets a demo mount the popup inline for a screenshot. */
  container?: SelectPrimitive.Portal.Props["container"];
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"];
  align?: SelectPrimitive.Positioner.Props["align"];
  /**
   * Forwarded to `Select.Positioner`. Real usage should keep the default
   * (flip to stay on screen); a demo forcing the popup open near the edge
   * of a tall page can pass `{ side: "none" }` for a deterministic side.
   */
  collisionAvoidance?: SelectPrimitive.Positioner.Props["collisionAvoidance"];
}

/**
 * Portal → Positioner → Popup → List, collapsed into one export the way
 * shadcn collapses Radix's content parts for its own Select. Styled per
 * 04 S-02: fill `bg/raised`, stroke `border/film-strong`, `shadow/popover`,
 * radius `role/overlay` (12). `min-w-(--anchor-width)` is Base UI's own
 * positioning variable, not a token — it is what keeps the popup at least
 * as wide as the trigger. `max-h-(--available-height)` is the same kind of
 * library-provided variable, used instead of a static token so the popup
 * clamps to whatever room the viewport actually has.
 */
export function SelectContent({
  className,
  children,
  container,
  sideOffset = 4,
  align = "start",
  collisionAvoidance,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        data-slot="select-positioner"
        sideOffset={sideOffset}
        align={align}
        collisionAvoidance={collisionAvoidance}
        className="z-50 min-w-(--anchor-width)"
      >
        <SelectPrimitive.Popup
          data-slot="select-popup"
          className={cn(
            "max-h-(--available-height) overflow-y-auto rounded-role-overlay p-1",
            "border border-solid border-film-border-strong bg-bg-raised shadow-popover",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List data-slot="select-list" className="flex flex-col">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export type SelectItemProps = SelectPrimitive.Item.Props;

/**
 * One option. 04 M-04: height 28 (`row/menu`), radius 6, padding-inline 8,
 * text `ui`. Hover/keyboard navigation share Base UI's `data-highlighted`;
 * the current value is marked by the checkmark (`ItemIndicator`) rather than
 * a second background, since M-04's own token list has no fill for
 * "selected" (only the generic 04 §0.1 table does — see the report).
 */
export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-row-h-menu cursor-pointer select-none items-center gap-2",
        "rounded-6 px-2 text-ui-md text-text-1 outline-none",
        "data-[highlighted]:bg-film-2",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-(--opacity-disabled)",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text" className="flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        className="flex shrink-0 items-center text-text-1"
      >
        <Icon icon={Tick02Icon} size="md" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { selectTriggerVariants };
