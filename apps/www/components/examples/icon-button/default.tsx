"use client";

import { useState } from "react";
import { Comment01Icon, StarIcon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";

/**
 * The action panel of a task row: compact so a whole cluster fits in one
 * cell, text-toned so it recedes until hovered — the star is the one button
 * that keeps its own state once pressed.
 */
export default function IconButtonDefault() {
  const [starred, setStarred] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <IconButton
        variant="text"
        size="compact"
        selected={starred}
        aria-label={starred ? "Remove from favourites" : "Add to favourites"}
        icon={<Icon icon={StarIcon} />}
        onClick={() => setStarred((value) => !value)}
      />
      <IconButton
        variant="text"
        size="compact"
        badge
        aria-label="2 unread comments"
        icon={<Icon icon={Comment01Icon} />}
      />
      <IconButton
        variant="text"
        size="compact"
        aria-label="Assign to me"
        icon={<Icon icon={UserAdd01Icon} />}
      />
    </div>
  );
}
