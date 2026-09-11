import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const dividerVariants = cva("shrink-0 border-0", {
  variants: {
    orientation: {
      horizontal: "h-stroke-hairline w-full",
      vertical: "w-stroke-hairline h-full self-stretch",
    },
    tone: {
      default: "bg-border",
      film: "bg-film-border",
    },
  },
  defaultVariants: { orientation: "horizontal", tone: "default" },
});

export type DividerOrientation = NonNullable<
  VariantProps<typeof dividerVariants>["orientation"]
>;
export type DividerTone = NonNullable<VariantProps<typeof dividerVariants>["tone"]>;

export interface DividerProps
  extends Omit<ComponentProps<"div">, "children">,
    VariantProps<typeof dividerVariants> {
  /** `true` (default) keeps the line out of the accessibility tree. */
  decorative?: boolean;
}

/**
 * A 1px line. The space around it belongs to the parent, never to the divider:
 * use it only where a gap alone cannot separate the meaning.
 */
export function Divider({
  orientation = "horizontal",
  tone,
  decorative = true,
  className,
  ...props
}: DividerProps) {
  return (
    <div
      data-slot="divider"
      role={decorative ? "none" : "separator"}
      aria-hidden={decorative ? true : undefined}
      aria-orientation={decorative ? undefined : (orientation ?? "horizontal")}
      className={cn(dividerVariants({ orientation, tone }), className)}
      {...props}
    />
  );
}

export { dividerVariants };
