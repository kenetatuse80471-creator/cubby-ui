import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const spinnerVariants = cva(
  [
    "inline-block shrink-0 rounded-role-pill",
    "border-(length:--stroke-focus) border-solid border-border border-t-accent",
    // `animate-spin` brings the @keyframes with it; the local override of
    // `--animate-spin` replaces Tailwind's 1s/linear with the motion tokens.
    "animate-spin [--animate-spin:spin_var(--motion-spin-duration)_var(--ease-linear)_infinite]",
    "motion-reduce:animate-none",
  ],
  {
    variants: {
      size: {
        regular: "size-spinner-size-regular",
        compact: "size-spinner-size-compact",
      },
    },
    defaultVariants: { size: "regular" },
  },
);

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>["size"]>;

export interface SpinnerProps
  extends Omit<ComponentProps<"div">, "children">,
    VariantProps<typeof spinnerVariants> {
  /** Announced by a screen reader; without it the spinner stays `aria-hidden`. */
  label?: string;
}

/**
 * Ring with a gap, spinning at `--motion-spin-duration` (800ms) linear.
 * Decorative by default — the status is announced by the container.
 */
export function Spinner({ size, label, className, ...props }: SpinnerProps) {
  return (
    <div
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}

export { spinnerVariants };
