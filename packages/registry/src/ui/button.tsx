import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "@/registry/cubby/ui/spinner";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap",
    "min-w-button-min-w rounded-role-control border border-solid border-transparent",
    "text-ui-md cursor-pointer",
    "transition-colors duration-(--motion-fast) ease-standard",
    // Focus ring: 2px accent outside the control, offset 1px, on top of hover.
    "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
    "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-plate text-text-on-plate",
          "hover:bg-btn-primary-surface-hover",
          // Pressed on a light plate: 12% towards the plate ink (03 §8).
          "active:bg-[color-mix(in_srgb,var(--plate)_88%,var(--text-on-plate))]",
        ],
        secondary: "bg-film-1 border-film-border text-text-1 hover:bg-film-2 active:bg-film-3",
        danger: "bg-transparent border-film-border text-danger hover:bg-film-1 active:bg-film-2",
        text: "bg-transparent text-text-1 hover:bg-film-1 active:bg-film-2",
      },
      size: {
        regular: "h-control-h-md px-4",
        compact: "h-control-h-sm px-3",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "secondary", size: "regular", fullWidth: false },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Icon slot before the label — an `<Icon />`, 16px. */
  iconStart?: ReactNode;
  /** Icon slot after the label — an `<Icon />`, 16px. */
  iconEnd?: ReactNode;
  /**
   * Waiting for the server: a compact spinner takes the place of `iconStart`
   * inside the same 16px box, the label stays, the button stops reacting.
   */
  loading?: boolean;
}

/**
 * The action primitive. One Primary per surface; Danger only for the
 * irreversible. Height is fixed — 32 (`regular`) or 28 (`compact`).
 */
export function Button({
  className,
  variant,
  size,
  fullWidth,
  iconStart,
  iconEnd,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const leading = loading ? (
    <span
      data-slot="button-spinner"
      className="inline-flex size-icon-md items-center justify-center"
    >
      <Spinner size="compact" />
    </span>
  ) : (
    iconStart
  );

  return (
    <button
      data-slot="button"
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      disabled={disabled ?? loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {leading}
      {children}
      {iconEnd}
    </button>
  );
}

export { buttonVariants };
