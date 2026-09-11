import { useState } from "react";
import {
  Notification01Icon,
  Search01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@/registry/cubby/ui/tooltip";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

/**
 * Forced open with `defaultOpen` — the shots script never hovers anything,
 * so this is the only way the popup shows up at all for a screenshot — and
 * portaled into `container`, a node inside this same section (Base UI's
 * default portal target is `<body>`, outside what the screenshot captures).
 * Same technique as `select-demo.tsx`'s `OpenSelectShowcase`.
 */
function OpenTooltip({
  label,
  side,
}: {
  label: string;
  side: "top" | "bottom" | "left" | "right";
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    // `pt-7`: headroom for the `side="top"` cell's popup, which would
    // otherwise overlap the row label above it — kept on every cell so the
    // three stay aligned.
    <div className="relative flex flex-col items-center gap-8 pt-7">
      <Tooltip defaultOpen>
        <TooltipTrigger
          render={<IconButton aria-label="Настройки" icon={<Icon icon={Settings01Icon} />} />}
        />
        <TooltipPopup container={container} side={side}>
          Настройки
        </TooltipPopup>
      </Tooltip>
      <div ref={setContainer} />
      <span className="text-caption-sm text-text-3">{label}</span>
    </div>
  );
}

/**
 * The case the task names — a row of header/nav icons sharing one
 * `TooltipProvider`, so hovering from one to the next shows the rest
 * instantly instead of waiting out the open delay again each time. Live:
 * hover or tab to each icon.
 */
function NavShowcase() {
  const items = [
    { label: "Поиск", icon: Search01Icon },
    { label: "Уведомления", icon: Notification01Icon },
    { label: "Настройки", icon: Settings01Icon },
    { label: "Профиль", icon: UserIcon },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {items.map(({ label, icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={<IconButton variant="text" aria-label={label} icon={<Icon icon={icon} />} />}
            />
            <TooltipPopup>{label}</TooltipPopup>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function TooltipDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Раскрытый — fit, max 240, padding 8, radius 6, shadow/raised, 04 §3.1">
        <DemoCell label="сторона">
          <OpenTooltip label="side=&quot;top&quot; (по умолчанию)" side="top" />
        </DemoCell>
        <DemoCell label="сторона">
          <OpenTooltip label='side="bottom"' side="bottom" />
        </DemoCell>
        <DemoCell label="сторона">
          <OpenTooltip label='side="right"' side="right" />
        </DemoCell>
      </DemoRow>

      <DemoRow label="Живые — шапка и навигация сайта, hover или Tab по очереди">
        <NavShowcase />
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "tooltip";
export const title = "Tooltip — тултип";
export const component = TooltipDemo;
