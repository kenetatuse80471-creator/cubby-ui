"use client";

import { createContext, useContext, useId, type ComponentProps } from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/cn";

/**
 * Base UI's own Dialog, Popover and Toast link their trigger to their
 * content with `aria-describedby`/`aria-labelledby` — checked in
 * `dialog/popup/DialogPopup.mjs`, `popover/popup/PopoverPopup.mjs` and
 * `toast/root/ToastRoot.mjs` (1.8.0), all three set `aria-describedby`.
 * Its Tooltip does not: `tooltip/trigger/TooltipTrigger.mjs` and
 * `tooltip/popup/TooltipPopup.mjs` set neither `aria-describedby` nor
 * `role="tooltip"` anywhere. `TooltipTrigger` and `TooltipPopup` below do
 * that wiring themselves, sharing one id generated at the `Tooltip` root.
 */
const TooltipIdContext = createContext<string | null>(null);

/** The gap between the trigger and the popup, in pixels — Base UI's
 * positioner takes a number, not a CSS length (same reasoning as
 * `context-action-menu.tsx`'s `MENU_SIDE_OFFSET`). 04's own Tooltip row
 * (§3.1) gives no offset, so this reuses the 4 (`--space-1`) that both
 * `SelectContent` and `ContextActionMenu` already use for the same gap. */
const TOOLTIP_SIDE_OFFSET = 4;

export type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root>;

/**
 * Groups the trigger and the popup and owns the open state (Base UI). Renders
 * no element of its own — checked in the library's source, same as `Select`
 * — so it carries no `data-slot`.
 */
export function Tooltip(props: TooltipProps) {
  const id = useId();
  return (
    <TooltipIdContext.Provider value={id}>
      <TooltipPrimitive.Root {...props} />
    </TooltipIdContext.Provider>
  );
}

export type TooltipProviderProps = ComponentProps<typeof TooltipPrimitive.Provider>;

/**
 * Shares one open/close delay across a group of tooltips — a row of toolbar
 * or nav icons — so that once the first one is visible, its neighbours show
 * instantly instead of waiting out the delay again (Base UI's own grouping
 * logic). Renders no element of its own.
 */
export function TooltipProvider(props: TooltipProviderProps) {
  return <TooltipPrimitive.Provider {...props} />;
}

export interface TooltipTriggerProps extends ComponentProps<typeof TooltipPrimitive.Trigger> {}

/**
 * An element to attach the tooltip to. Renders a plain `<button>` by
 * default; pass `render` to attach the tooltip to an existing element — an
 * `IconButton`, a nav link — instead, the same convention as
 * `ContextActionMenu`'s `MenuTrigger`. Shows on hover and, because Base UI's
 * `useFocus` gates opening on `:focus-visible` (checked in
 * `floating-ui-react/hooks/useFocus.mjs`, `matchesFocusVisible`), on keyboard
 * focus only — a mouse click that leaves the trigger focused does not open
 * it a second time. Hides on `Escape` through Base UI's own `useDismiss`;
 * none of that is re-implemented here, only the `aria-describedby` Base UI
 * leaves out (see the note above `TooltipIdContext`).
 */
export function TooltipTrigger({
  "aria-describedby": ariaDescribedBy,
  ...props
}: TooltipTriggerProps) {
  const id = useContext(TooltipIdContext);
  const describedBy = [id, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      aria-describedby={describedBy}
      {...props}
    />
  );
}

export interface TooltipPopupProps extends ComponentProps<typeof TooltipPrimitive.Popup> {
  /** Forwarded to `Tooltip.Portal` — lets a demo mount the popup inline for a screenshot. */
  container?: ComponentProps<typeof TooltipPrimitive.Portal>["container"];
  side?: ComponentProps<typeof TooltipPrimitive.Positioner>["side"];
  sideOffset?: ComponentProps<typeof TooltipPrimitive.Positioner>["sideOffset"];
  align?: ComponentProps<typeof TooltipPrimitive.Positioner>["align"];
}

/**
 * Portal → Positioner → Popup, collapsed into one export the way
 * `SelectContent` collapses the same three parts of `Select`. Styled per 04
 * §3.1's `Tooltip (v1.5)` row: width fit-content capped at 240 — one of the
 * spec's own five canonical popover widths, `size/popover/grid` — padding 8,
 * radius 6, `shadow/raised`, no scrim. `z-(--z-tooltip)` (600) is the highest
 * stacking token in `packages/tokens`, so a tooltip always shows above a menu
 * or a dropdown it happens to hover over.
 *
 * The spec's row has no fill or text colour for the chip — neither measured
 * anywhere else for `Tooltip` — so both reuse the only existing pairing of
 * `shadow/raised` already in this codebase, `switch.tsx`'s knob
 * (`bg-bg-surface shadow-raised`); flagged in the report.
 */
export function TooltipPopup({
  className,
  container,
  side = "top",
  sideOffset = TOOLTIP_SIDE_OFFSET,
  align = "center",
  id: idProp,
  ...props
}: TooltipPopupProps) {
  const contextId = useContext(TooltipIdContext);

  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="z-(--z-tooltip)"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-popup"
          id={idProp ?? contextId ?? undefined}
          role="tooltip"
          className={cn(
            "w-fit max-w-comp-popover-grid rounded-6 p-2",
            "bg-bg-surface text-caption-sm text-text-1 shadow-raised",
            "transition-opacity duration-(--motion-fast) ease-standard",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
