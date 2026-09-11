"use client";

import { Delete02Icon, Link01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { ContextActionMenu } from "@/registry/cubby/ui/context-action-menu";

/**
 * The «…» is the last cell of a task row: everywhere else on the row opens
 * the task, only this corner opens a menu — rename and copy link first,
 * delete last and set apart in red.
 */
export default function ContextActionMenuDefault() {
  return (
    <div className="flex w-comp-popover-panel items-center justify-between gap-3">
      <span className="min-w-0 flex-1 truncate text-ui-md text-text-1">
        Redesign onboarding flow
      </span>
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
    </div>
  );
}
