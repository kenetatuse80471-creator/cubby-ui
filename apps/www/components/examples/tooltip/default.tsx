"use client";

import { Delete02Icon, Link01Icon, StarIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@/registry/cubby/ui/tooltip";

const ACTIONS = [
  { id: "star", label: "Add to favourites", icon: StarIcon },
  { id: "link", label: "Copy link to task", icon: Link01Icon },
  { id: "delete", label: "Delete task", icon: Delete02Icon },
] as const;

/**
 * A row of icon buttons is the place a tooltip earns its keep: the glyph carries the
 * action, the tooltip carries its name. One provider wraps the row, so once the first
 * tooltip is open its neighbours answer instantly instead of waiting out the delay again.
 */
export default function TooltipDefault() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {ACTIONS.map((action) => (
          <Tooltip key={action.id}>
            <TooltipTrigger
              render={<IconButton aria-label={action.label} icon={<Icon icon={action.icon} />} />}
            />
            <TooltipPopup>{action.label}</TooltipPopup>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
