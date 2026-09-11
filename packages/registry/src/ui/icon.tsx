import type { ComponentProps } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/cn";

/**
 * Icon sizes are the four canonical frames of the design system
 * (`--icon-sm|md|lg|xl` = 12 / 16 / 20 / 32):
 * sm — only the check inside a checkbox, md — everything in content,
 * lg — navigation only, xl — the illustration of an EmptyState.
 */
const iconSizes = {
  sm: "size-icon-sm",
  md: "size-icon-md",
  lg: "size-icon-lg",
  xl: "size-icon-xl",
} as const;

export type IconSize = keyof typeof iconSizes;

export interface IconProps
  extends Omit<ComponentProps<typeof HugeiconsIcon>, "size" | "color"> {
  /** Glyph from `@hugeicons/core-free-icons` (Stroke Rounded, 24×24 grid). */
  icon: IconSvgElement;
  size?: IconSize;
}

/**
 * The only way the library draws an icon. Always `currentColor`, always
 * `aria-hidden`: the meaning lives in the accessible name of the owner —
 * visible text next to it, `aria-label`, or `title`.
 *
 * `strokeWidth` is in the units of the 24×24 viewBox, not a CSS length:
 * 1.5 everywhere, 2 at `size="sm"` so a 12px glyph still reads as 1px.
 */
export function Icon({ icon, size = "md", strokeWidth, className, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      data-slot="icon"
      icon={icon}
      color="currentColor"
      strokeWidth={strokeWidth ?? (size === "sm" ? 2 : 1.5)}
      aria-hidden
      focusable="false"
      className={cn("shrink-0", iconSizes[size], className)}
      {...props}
    />
  );
}

export type { IconSvgElement };
