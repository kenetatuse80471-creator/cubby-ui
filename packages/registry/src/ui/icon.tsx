import type { ComponentProps, ReactNode } from "react";
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

interface IconSizeProps {
  size?: IconSize;
}

/** A Hugeicons glyph — the library's own set (Stroke Rounded, 24×24 grid). */
export type IconGlyphProps = IconSizeProps &
  Omit<ComponentProps<typeof HugeiconsIcon>, "size" | "color" | "icon"> & {
    /** Glyph from `@hugeicons/core-free-icons`. */
    icon: IconSvgElement;
    children?: never;
  };

/**
 * Any other SVG, drawn verbatim — a consumer's own sprite reference
 * (`<Icon size="lg"><svg><use href="#role-notifications" /></svg></Icon>`), for a first
 * consumer (Altis) whose icons are not Hugeicons glyphs. AGENTS.md §3: icons are a prop,
 * never a bundled icon package — this is the prop staying open to *any* SVG, not only ours.
 */
export type IconCustomProps = IconSizeProps &
  Omit<ComponentProps<"span">, "children"> & {
    icon?: never;
    /** The SVG to draw. Sized to fill the icon box: `[&>svg]:size-full [&>svg]:block`. */
    children: ReactNode;
  };

/** Exactly one of `icon` (a Hugeicons glyph) or `children` (any other SVG) is required. */
export type IconProps = IconGlyphProps | IconCustomProps;

/**
 * The only way the library draws an icon. Always `aria-hidden`: the meaning lives in the
 * accessible name of the owner — visible text next to it, `aria-label`, or `title`.
 *
 * `icon` renders a Hugeicons glyph, always `currentColor`; `strokeWidth` is in the units of
 * the 24×24 viewBox, not a CSS length — 1.5 everywhere, 2 at `size="sm"` so a 12px glyph
 * still reads as 1px. Pass `children` instead to draw a consumer's own SVG verbatim, sized
 * to the same box — exactly one of the two is required.
 */
export function Icon(props: IconProps) {
  if (props.icon) {
    const { icon, size = "md", strokeWidth, className, ...rest } = props;
    return (
      <HugeiconsIcon
        data-slot="icon"
        icon={icon}
        color="currentColor"
        strokeWidth={strokeWidth ?? (size === "sm" ? 2 : 1.5)}
        aria-hidden
        focusable="false"
        className={cn("shrink-0", iconSizes[size], className)}
        {...rest}
      />
    );
  }

  const { children, size = "md", className, ...rest } = props;
  return (
    <span
      data-slot="icon"
      aria-hidden
      className={cn("shrink-0 [&>svg]:size-full [&>svg]:block", iconSizes[size], className)}
      {...rest}
    >
      {children}
    </span>
  );
}

export type { IconSvgElement };
