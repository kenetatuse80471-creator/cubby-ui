import type { ReactNode } from "react";
import {
  Archive02Icon,
  Copy01Icon,
  Delete02Icon,
  Link01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { Divider } from "@/registry/cubby/ui/divider";
import { Icon, type IconSvgElement } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import { Snackbar } from "@/registry/cubby/ui/snackbar";
import {
  ContextActionMenu,
  menuItemVariants,
  menuPopupVariants,
  type ActionDescriptor,
} from "@/registry/cubby/ui/context-action-menu";
import { DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

/**
 * An open menu lives in a portal at the window level; the screenshot is taken
 * of the section. So the open states below are the same surface drawn in
 * place, out of the portal, from the same `menuPopupVariants` /
 * `menuItemVariants` the component uses. Hover cannot be frozen for a
 * screenshot either, so that row re-applies the utility the item uses
 * (`data-highlighted:bg-film-2`) by hand. The live menu is underneath.
 */
function StaticItem({
  icon,
  children,
  tone = "default",
  highlighted = false,
  disabled = false,
}: {
  icon?: IconSvgElement;
  children: ReactNode;
  tone?: "default" | "destructive";
  highlighted?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      data-slot="context-action-menu-item"
      className={cn(
        menuItemVariants({ tone }),
        highlighted && "bg-film-2",
        disabled && "opacity-(--opacity-disabled)",
      )}
    >
      <span
        aria-hidden
        className="flex size-icon-md shrink-0 items-center justify-center text-text-2"
      >
        {icon ? <Icon icon={icon} /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </div>
  );
}

function StaticMenu() {
  return (
    <div data-slot="context-action-menu-popup" className={menuPopupVariants()}>
      <StaticItem icon={PencilEdit02Icon}>Переименовать</StaticItem>
      <StaticItem icon={Copy01Icon} highlighted>
        Дублировать
      </StaticItem>
      <StaticItem icon={Link01Icon}>Скопировать ссылку</StaticItem>
      <StaticItem icon={Archive02Icon} disabled>
        В архив
      </StaticItem>
      <Divider
        data-slot="context-action-menu-separator"
        decorative={false}
        className="my-1"
      />
      <StaticItem icon={Delete02Icon} tone="destructive">
        Удалить
      </StaticItem>
    </div>
  );
}

const actions: ActionDescriptor[] = [
  { id: "rename", label: "Переименовать", icon: PencilEdit02Icon, onAction: () => {} },
  { id: "duplicate", label: "Дублировать", icon: Copy01Icon, onAction: () => {} },
  { id: "link", label: "Скопировать ссылку", icon: Link01Icon, onAction: () => {} },
  { id: "archive", label: "В архив", icon: Archive02Icon, disabled: true, onAction: () => {} },
  {
    id: "delete",
    label: "Удалить",
    icon: Delete02Icon,
    destructive: true,
    onAction: () => {},
  },
];

function ContextActionMenuDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Открытое меню — 210, иконки 16, наведение, отключённый пункт, деструктив за разделителем">
        <div className="flex flex-col items-start gap-2">
          <IconButton
            variant="text"
            size="compact"
            aria-label="Действия с доской"
            icon={<Icon icon={MoreHorizontalIcon} />}
          />
          <StaticMenu />
          <span className="text-caption-sm text-text-3">align=&quot;start&quot;</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <IconButton
            variant="text"
            size="compact"
            aria-label="Действия с доской"
            icon={<Icon icon={MoreHorizontalIcon} />}
          />
          <StaticMenu />
          <span className="text-caption-sm text-text-3">align=&quot;end&quot;</span>
        </div>
      </DemoRow>

      <DemoRow label="Состояние «после действия» — меню закрылось, результат в снекбаре">
        <Snackbar
          kind="undo"
          message="Доска «Найм» переименована"
          actionLabel="Отменить"
          closeLabel="Закрыть"
        />
      </DemoRow>

      <DemoRow label="Живые — клик открывает, ↑↓ ходят, Esc закрывает, фокус возвращается на триггер">
        <ContextActionMenu ariaLabel="Действия с доской" actions={actions} align="start" />
        <ContextActionMenu ariaLabel="Действия с задачей" actions={actions} align="end" />
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "context-action-menu";
export const title = "ContextActionMenu — меню действий";
export const component = ContextActionMenuDemo;
