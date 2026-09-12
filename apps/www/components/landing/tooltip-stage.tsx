"use client";

import { Delete02Icon, Link01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";

import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/registry/cubby/ui/tooltip";

/** Shorter than the component page's own row: a chip that wraps to two lines inside
 *  a card reads as a paragraph rather than as a hint. */
const ACTIONS = [
  { id: "star", label: "Favourite", icon: StarIcon },
  { id: "link", label: "Copy link", icon: Link01Icon },
  { id: "delete", label: "Delete", icon: Delete02Icon },
] as const;

/** Which of the three is showing its hint. The middle one, so the chip has a
 *  neighbour on each side and reads as one of a row rather than as the row. */
const OPEN = 1;

/**
 * A tooltip only exists while something is hovered, and a card in a grid is never
 * hovered — the pointer is on the card, not inside it, and the stage is `inert`
 * besides. So one of the three is held open with `defaultOpen` and portaled into a
 * node inside this component rather than into `<body>`, which is what keeps it inside
 * the well instead of floating over the page.
 *
 * Both halves of that are the registry's own demo technique, for the same reason
 * (`packages/registry/src/demos/tooltip-demo.tsx` — the screenshot script never
 * hovers anything either). `TooltipPopup` takes `container` as a documented prop
 * precisely for this.
 */
export function TooltipStage() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    // `pt-7` is headroom for the chip, which sits above the row it names.
    <div className="relative flex flex-col items-center gap-1 pt-7">
      <div className="flex items-center gap-1">
        {ACTIONS.map((action, index) => (
          <Tooltip key={action.id} defaultOpen={index === OPEN}>
            <TooltipTrigger
              render={
                <IconButton aria-label={action.label} icon={<Icon icon={action.icon} />} />
              }
            />
            <TooltipPopup container={container}>{action.label}</TooltipPopup>
          </Tooltip>
        ))}
      </div>
      <div ref={setContainer} />
    </div>
  );
}
