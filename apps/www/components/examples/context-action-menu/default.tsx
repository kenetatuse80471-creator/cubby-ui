"use client";

import { Delete02Icon, Link01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { ContextActionMenu } from "@/registry/cubby/ui/context-action-menu";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function ContextActionMenuDefault() {
  return (
    <ContextActionMenu
      ariaLabel="Task actions"
      actions={[
        { id: "rename", label: "Rename", icon: PencilEdit02Icon, onAction: () => undefined },
        { id: "copy-link", label: "Copy link", icon: Link01Icon, onAction: () => undefined },
        {
          id: "delete",
          label: "Delete",
          icon: Delete02Icon,
          destructive: true,
          onAction: () => undefined,
        },
      ]}
    />
  );
}
