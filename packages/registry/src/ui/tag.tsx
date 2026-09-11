import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { Icon } from "@/registry/cubby/ui/icon";

/**
 * One shape for every tone: the colour lives in the text and in the hairline,
 * never in an opaque plate (03 §3.6). `--tag-ink` and `--tag-line` are set by
 * the tone and read by the base classes, so a new tone is one line.
 */
const tagVariants = cva(
  [
    "inline-flex max-w-full shrink-0 items-center gap-1",
    "h-tag-height px-2 rounded-role-tag",
    "border border-solid bg-film-2",
    "text-caption-sm-strong text-(--tag-ink) border-(--tag-line)",
  ],
  {
    variants: {
      tone: {
        neutral: "[--tag-ink:var(--text-2)] [--tag-line:var(--film-border)]",
        // Each hairline below is A-09's formula, tone text at 40% alpha; no token exports
        // the percentage, see 05-gates-report.md. cubby-ui-lint-ignore
        gray: "[--tag-ink:var(--stage-gray-text)] [--tag-line:color-mix(in_srgb,var(--stage-gray-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
        blue: "[--tag-ink:var(--stage-blue-text)] [--tag-line:color-mix(in_srgb,var(--stage-blue-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
        teal: "[--tag-ink:var(--stage-teal-text)] [--tag-line:color-mix(in_srgb,var(--stage-teal-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
        green: "[--tag-ink:var(--stage-green-text)] [--tag-line:color-mix(in_srgb,var(--stage-green-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
        yellow: "[--tag-ink:var(--stage-yellow-text)] [--tag-line:color-mix(in_srgb,var(--stage-yellow-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
        orange: "[--tag-ink:var(--stage-orange-text)] [--tag-line:color-mix(in_srgb,var(--stage-orange-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
        red: "[--tag-ink:var(--stage-red-text)] [--tag-line:color-mix(in_srgb,var(--stage-red-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
        purple: "[--tag-ink:var(--stage-purple-text)] [--tag-line:color-mix(in_srgb,var(--stage-purple-text)_40%,transparent)]", // cubby-ui-lint-ignore — A-09, 40% alpha hairline
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type TagTone = NonNullable<VariantProps<typeof tagVariants>["tone"]>;

export interface TagProps extends ComponentProps<"span">, VariantProps<typeof tagVariants> {
  /** Round marker in the tone colour before the label. */
  dot?: boolean;
  /** Accessible name of the cross; passing it turns the tag into a removable one. */
  removeLabel?: string;
  onRemove?: () => void;
  children?: ReactNode;
}

/** A label, not a control: the tag itself never takes focus — its cross does. */
export function Tag({
  className,
  tone,
  dot = false,
  removeLabel,
  onRemove,
  children,
  ...props
}: TagProps) {
  const removable = Boolean(onRemove && removeLabel);

  return (
    <span data-slot="tag" className={cn(tagVariants({ tone }), className)} {...props}>
      {dot ? (
        <span
          data-slot="tag-dot"
          aria-hidden
          className="size-badge-dot shrink-0 rounded-role-pill bg-(--tag-ink)"
        />
      ) : null}
      <span data-slot="tag-label" className="truncate">
        {children}
      </span>
      {removable ? (
        <button
          data-slot="tag-remove"
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className={cn(
            "-mr-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-role-mark",
            "text-(--tag-ink) opacity-(--opacity-disabled) transition-opacity duration-(--motion-fast) ease-standard",
            "hover:opacity-100",
            "focus-visible:opacity-100 focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
            "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
          )}
        >
          <Icon icon={Cancel01Icon} size="sm" />
        </button>
      ) : null}
    </span>
  );
}

export { tagVariants };
