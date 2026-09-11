import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * No Base UI part exists for a textarea (checked the package's export map —
 * only `input` and `select` ship), so this wraps the native element directly,
 * same as the Altis donor.
 *
 * Height is fit-to-content (Sergey's rule), not a fixed box: `field-sizing`
 * is the Tailwind v4 utility for the CSS property of the same name.
 * `--textarea-min-h` (72) exists in the tokens and is used as-is. A matching
 * max-height token does not exist — 240 is 04 A-07's number, sourced here
 * from `--comp-popover-grid` only because the pixel value happens to match;
 * the name is unrelated (see the report's open questions, same kind of
 * borrowing as the spinner border-width in batch A).
 */
const textAreaVariants = cva(
  [
    // `field-sizing: content` fits both axes to the text by default; the
    // explicit `max-w-full` clamp keeps the fit to height only, so a single
    // long unbroken line wraps and scrolls instead of stretching the box.
    "field-sizing-content w-full max-w-full min-w-0 resize-none",
    "min-h-textarea-min-h max-h-comp-popover-grid overflow-y-auto",
    "rounded-role-control border border-solid border-film-border p-10px",
    "text-ui-md text-text-1 placeholder:text-text-3",
    "transition-colors duration-(--motion-fast) ease-standard",
    "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
    "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
    "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      tone: {
        default: "bg-film-2 hover:bg-film-3",
        raised: "bg-bg-raised hover:bg-film-3",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export type TextAreaTone = NonNullable<VariantProps<typeof textAreaVariants>["tone"]>;

export interface TextAreaProps
  extends ComponentProps<"textarea">,
    VariantProps<typeof textAreaVariants> {}

/**
 * Multiline field. Grows downward with its content between `min-h` (three
 * lines of `ui` plus padding) and `max-h`; past that it scrolls internally
 * rather than pushing the rest of the form down.
 */
export function TextArea({
  className,
  tone,
  rows = 3,
  "aria-invalid": ariaInvalid,
  ...props
}: TextAreaProps) {
  const invalid = ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false";

  return (
    <textarea
      data-slot="text-area"
      rows={rows}
      aria-invalid={ariaInvalid}
      className={cn(textAreaVariants({ tone }), invalid && "border-danger", className)}
      {...props}
    />
  );
}

export { textAreaVariants };
