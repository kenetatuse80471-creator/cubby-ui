"use client";

import type { ComponentProps, ReactNode } from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { Icon } from "@/registry/cubby/ui/icon";

/**
 * The box carries border, fill and the focus ring; the native input inside it
 * stays borderless and transparent so `iconStart` and the clear button can sit
 * in the same row (04 A-06). `focus-within` stands in for `focus-visible`
 * here because the DOM focus target is the inner `<input>`, not this element.
 */
const textInputVariants = cva(
  [
    "inline-flex w-full min-w-0 items-center gap-2 rounded-role-control",
    "border border-solid border-film-border px-10px",
    "transition-colors duration-(--motion-fast) ease-standard",
    "focus-within:outline-solid focus-within:outline-(length:--stroke-focus)",
    "focus-within:outline-offset-(--stroke-hairline) focus-within:outline-accent",
  ],
  {
    variants: {
      tone: {
        default: "bg-film-2 hover:bg-film-3",
        raised: "bg-bg-raised hover:bg-film-3",
      },
      /**
       * 04 A-06: Md = 32 (toolbar row), Lg = 40 (sign-in/large forms). `form`
       * (36) is the modal-form-row height from 04 §0.3 (`size/control/lg`) —
       * added because `--control-h-lg` exists in the tokens, not invented.
       */
      size: {
        regular: "h-control-h-md",
        large: "h-control-h-xl",
        form: "h-control-h-lg",
      },
    },
    defaultVariants: { tone: "default", size: "regular" },
  },
);

export type TextInputTone = NonNullable<VariantProps<typeof textInputVariants>["tone"]>;
export type TextInputSize = NonNullable<VariantProps<typeof textInputVariants>["size"]>;

export interface TextInputProps
  extends Omit<ComponentProps<typeof InputPrimitive>, "size" | "className">,
    VariantProps<typeof textInputVariants> {
  className?: string;
  /** Icon before the value — an `<Icon />`, 16px (04 §0.4: fields take `md`). */
  iconStart?: ReactNode;
  /** Accessible name of the clear button; passing it together with `onClear` shows it. */
  clearLabel?: string;
  onClear?: () => void;
}

/**
 * Single-line field. Height is fixed, width is fill (04 A-06). Long values
 * scroll horizontally inside the input instead of being clipped — that is
 * native `<input>` behaviour and needs no extra class.
 */
export function TextInput({
  className,
  tone,
  size,
  iconStart,
  clearLabel,
  onClear,
  disabled,
  "aria-invalid": ariaInvalid,
  ...props
}: TextInputProps) {
  const invalid = ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false";
  const clearable = Boolean(onClear && clearLabel);

  return (
    <div
      data-slot="text-input"
      className={cn(
        textInputVariants({ tone, size }),
        invalid && "border-danger",
        disabled && "cursor-not-allowed opacity-(--opacity-disabled)",
        className,
      )}
    >
      {iconStart ? (
        <span data-slot="text-input-icon" className="flex shrink-0 items-center text-text-3">
          {iconStart}
        </span>
      ) : null}
      <InputPrimitive
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className="w-full min-w-0 flex-1 bg-transparent text-ui-md text-text-1 outline-none placeholder:text-text-3 disabled:cursor-not-allowed"
        {...props}
      />
      {clearable ? (
        <button
          data-slot="text-input-clear"
          type="button"
          aria-label={clearLabel}
          disabled={disabled}
          onClick={onClear}
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-role-mark",
            "text-text-3 transition-colors duration-(--motion-fast) ease-standard hover:text-text-1",
            "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
            "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
            "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
          )}
        >
          <Icon icon={Cancel01Icon} size="md" />
        </button>
      ) : null}
    </div>
  );
}

export { textInputVariants };
