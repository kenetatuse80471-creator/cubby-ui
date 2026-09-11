"use client";

import type { ComponentProps } from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/cn";

export type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root>;

/**
 * Track 30×18, knob 14, travel 12. One size only.
 *
 * The «on» track is the plate, exactly like a Primary button: 03 §3.7 keeps
 * the accent for focus and drop targets only, so it is not used here.
 * The change is sent immediately — there is no Save button next to a switch.
 */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center",
        "h-switch-track-h w-switch-track-w p-2px rounded-role-pill",
        "border border-solid border-transparent bg-film-2",
        "transition-colors duration-(--motion-fast) ease-standard",
        "hover:bg-film-3",
        "data-checked:bg-plate data-checked:hover:bg-btn-primary-surface-hover",
        "focus-visible:outline-solid focus-visible:outline-(length:--stroke-focus)",
        "focus-visible:outline-offset-(--stroke-hairline) focus-visible:outline-accent",
        "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "size-switch-knob rounded-role-pill bg-bg-surface shadow-raised",
          "transition-transform duration-(--motion-fast) ease-standard",
          "data-checked:translate-x-3",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
