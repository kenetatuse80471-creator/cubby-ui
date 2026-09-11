import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Icon, type IconSvgElement } from "@/registry/cubby/ui/icon";

const emptyStateVariants = cva(
  [
    "flex flex-col items-center gap-3 text-center",
    "rounded-role-card border border-dashed border-border-control",
    "px-6 py-7",
  ],
  {
    variants: {
      size: {
        md: "",
        sm: "",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type EmptyStateSize = NonNullable<VariantProps<typeof emptyStateVariants>["size"]>;

export interface EmptyStateProps
  extends Omit<ComponentProps<"div">, "title">,
    VariantProps<typeof emptyStateVariants> {
  /** Glyph from `@hugeicons/core-free-icons`, drawn at 32. */
  icon?: IconSvgElement;
  /** Names the situation: «Задач пока нет», not «Ничего не найдено». */
  title: ReactNode;
  /** Says what can be done about it. */
  description?: ReactNode;
  /** The action itself — a `<Button />`, the only focusable element here. */
  action?: ReactNode;
}

/**
 * Empty, not-found, unavailable and denied all wear this shape. Every context
 * writes its own text and its own call to action — there is no generic one.
 */
export function EmptyState({
  className,
  size = "md",
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    >
      {icon ? (
        <Icon data-slot="empty-state-icon" icon={icon} size="xl" className="text-text-3" />
      ) : null}
      <h3 data-slot="empty-state-title" className="text-heading-h3 text-text-1">
        {title}
      </h3>
      {description ? (
        <p
          data-slot="empty-state-description"
          className={cn(
            "text-ui-md-regular text-text-2",
            size === "sm" ? "max-w-comp-empty-text-sm" : "max-w-comp-empty-text",
          )}
        >
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}

export { emptyStateVariants };
