import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "@/registry/cubby/ui/spinner";

const iconButtonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center",
    "rounded-role-control border border-solid border-transparent cursor-pointer",
    "transition-colors duration-(--motion-fast) ease-standard",
    "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
    "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
    "data-selected:bg-film-3",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-plate text-text-on-plate",
          "hover:bg-btn-primary-surface-hover",
          // cubby-ui-lint-ignore — 03 §8 pressed-state formula (12% towards the plate ink), same as Button; no token exports this percentage, see 05-gates-report.md
          "active:bg-[color-mix(in_srgb,var(--plate)_88%,var(--text-on-plate))]",
        ],
        secondary: "bg-film-1 border-film-border text-text-1 hover:bg-film-2 active:bg-film-3",
        danger: "bg-transparent border-film-border text-danger hover:bg-film-1 active:bg-film-2",
        text: "bg-transparent text-text-1 hover:bg-film-1 active:bg-film-2",
      },
      size: {
        regular: "size-control-h-md",
        compact: "size-control-h-sm",
      },
    },
    defaultVariants: { variant: "secondary", size: "regular" },
  },
);

export type IconButtonVariant = NonNullable<
  VariantProps<typeof iconButtonVariants>["variant"]
>;
export type IconButtonSize = NonNullable<VariantProps<typeof iconButtonVariants>["size"]>;

export interface IconButtonProps
  extends Omit<ComponentProps<"button">, "children">,
    VariantProps<typeof iconButtonVariants> {
  /** Required: an icon without a label is mute otherwise. */
  "aria-label": string;
  /** The glyph — an `<Icon />`, 16px in content, 20px in navigation. */
  icon: ReactNode;
  /** Unread dot in the top right corner. */
  badge?: boolean;
  /** e.g. the bell while its drawer is open. */
  selected?: boolean;
  /** Spinner instead of the glyph; the button stops reacting. */
  loading?: boolean;
}

/**
 * A square action: 32 (`regular`) or 28 (`compact`), the hit area never
 * shrinks to the size of the glyph.
 */
export function IconButton({
  className,
  variant,
  size,
  icon,
  badge = false,
  selected = false,
  loading = false,
  disabled,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      data-slot="icon-button"
      type={type}
      data-selected={selected ? "" : undefined}
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? <Spinner size="compact" /> : icon}
      {badge ? (
        <span
          data-slot="icon-button-badge"
          aria-hidden
          className="absolute top-0 right-0 size-badge-dot rounded-role-pill bg-danger"
        />
      ) : null}
    </button>
  );
}

export { iconButtonVariants };
