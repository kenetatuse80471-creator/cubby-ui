import {
  Alert01Icon,
  Calendar03Icon,
  Delete02Icon,
  Notification01Icon,
  Search01Icon,
  Settings01Icon,
  Tick02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/registry/cubby/ui/icon";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

function IconDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Размеры — 12 · 16 · 20 · 32, обводка 1.5 (у sm — 2)">
        <DemoCell label="sm · 12 · галочка чекбокса">
          <Icon icon={Tick02Icon} size="sm" />
        </DemoCell>
        <DemoCell label="md · 16 · контент">
          <Icon icon={Search01Icon} size="md" />
        </DemoCell>
        <DemoCell label="lg · 20 · навигация">
          <Icon icon={Notification01Icon} size="lg" />
        </DemoCell>
        <DemoCell label="xl · 32 · EmptyState">
          <Icon icon={Alert01Icon} size="xl" />
        </DemoCell>
      </DemoRow>

      <DemoRow label="Цвет наследуется от родителя (currentColor)">
        <DemoCell label="text-1">
          <span className="text-text-1">
            <Icon icon={Settings01Icon} />
          </span>
        </DemoCell>
        <DemoCell label="text-2">
          <span className="text-text-2">
            <Icon icon={Settings01Icon} />
          </span>
        </DemoCell>
        <DemoCell label="text-3">
          <span className="text-text-3">
            <Icon icon={Settings01Icon} />
          </span>
        </DemoCell>
        <DemoCell label="danger">
          <span className="text-danger">
            <Icon icon={Delete02Icon} />
          </span>
        </DemoCell>
        <DemoCell label="accent">
          <span className="text-accent">
            <Icon icon={Calendar03Icon} />
          </span>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Один набор на весь сервис — Hugeicons Stroke Rounded">
        <DemoCell label="16 в строке текста">
          <span className="inline-flex items-center gap-2 text-ui-md text-text-1">
            <Icon icon={UserIcon} />
            Исполнитель
          </span>
        </DemoCell>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "icon";
export const title = "Icon — иконка";
export const component = IconDemo;
