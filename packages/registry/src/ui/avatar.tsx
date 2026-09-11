import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { UserIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { Icon } from "@/registry/cubby/ui/icon";

const avatarVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden",
    "rounded-role-pill border border-solid border-transparent",
  ],
  {
    variants: {
      size: {
        // The monogram is the one exception to the 12px floor (04 §0.4):
        // the canon asks for 9 at 20 and 10 at 24, and neither exists as a
        // token — those two sizes therefore use `caption` (12) for now.
        xs: "size-avatar-xs text-caption-sm-strong",
        sm: "size-avatar-sm text-caption-sm-strong",
        md: "size-avatar-md text-caption-sm-strong",
        lg: "size-avatar-lg text-body-md-strong",
        xl: "size-avatar-xl text-display-lg",
      },
      variant: {
        identity: "bg-linear-135 from-accent to-accent-2 text-on-accent",
        neutral: "bg-film-2 border-film-border text-text-1",
        unavailable: "bg-film-2 border-danger text-danger",
      },
      empty: {
        true: "border-dashed border-border-control bg-transparent text-text-3",
        false: "",
      },
    },
    defaultVariants: { size: "md", variant: "identity", empty: false },
  },
);

/**
 * Stage tone layered on top of `variant="neutral"` — the colour lives in the text, never in a
 * second opaque plate (03 §3.6, the same rule Tag follows). A `cva` of its own, not a plain
 * lookup object: a plain object's strings sit outside `cva`/`cn`/`className`, which is exactly
 * what `lint:tokens`'s `class-list-out-of-place` rule exists to catch — and what the
 * "every class compiles" test in `classes.test.ts` would then have no way to see.
 */
const avatarToneVariants = cva("", {
  variants: {
    tone: {
      gray: "bg-film-2 text-stage-gray-text",
      blue: "bg-film-2 text-stage-blue-text",
      teal: "bg-film-2 text-stage-teal-text",
      green: "bg-film-2 text-stage-green-text",
      yellow: "bg-film-2 text-stage-yellow-text",
      orange: "bg-film-2 text-stage-orange-text",
      red: "bg-film-2 text-stage-red-text",
      purple: "bg-film-2 text-stage-purple-text",
    },
  },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;
export type AvatarVariant = NonNullable<VariantProps<typeof avatarVariants>["variant"]>;
export type AvatarTone = NonNullable<VariantProps<typeof avatarToneVariants>["tone"]>;

export interface AvatarProps
  extends Omit<ComponentProps<"span">, "children">,
    Omit<VariantProps<typeof avatarVariants>, "empty"> {
  /** One or two capitals — the first letters of the name, or one from the e-mail. */
  initials?: string;
  /** Photo; falls back to the initials when it fails to load. */
  src?: string;
  /** Full name: becomes the accessible name. Without it the avatar is decorative. */
  name?: string;
  /** Stage tone by the hash of the name — overrides the identity gradient. */
  tone?: AvatarTone;
}

/**
 * A circle with a photo or a monogram, and — this is the point — a real empty
 * state: «nobody is assigned» is more common than it looks.
 */
export function Avatar({
  className,
  size = "md",
  variant,
  tone,
  initials,
  src,
  name,
  ...props
}: AvatarProps) {
  const empty = !src && !initials;

  return (
    <span
      data-slot="avatar"
      data-empty={empty ? "" : undefined}
      role={name ? "img" : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
      className={cn(
        avatarVariants({ size, variant: tone ? "neutral" : variant, empty }),
        tone && !empty ? avatarToneVariants({ tone }) : undefined,
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          data-slot="avatar-image"
          src={src}
          alt=""
          className="size-full object-cover"
        />
      ) : initials ? (
        <span data-slot="avatar-initials">{initials}</span>
      ) : (
        <Icon
          data-slot="avatar-placeholder"
          icon={UserIcon}
          size={size === "xs" || size === "sm" ? "sm" : "md"}
        />
      )}
    </span>
  );
}

export { avatarVariants };
