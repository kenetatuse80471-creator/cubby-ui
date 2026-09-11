import {
  Alert01Icon,
  InboxIcon,
  PlusSignIcon,
  Search01Icon,
  SquareLock02Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/registry/cubby/ui/button";
import { EmptyState } from "@/registry/cubby/ui/empty-state";
import { Icon } from "@/registry/cubby/ui/icon";
import { DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

function EmptyStateDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Пусто · у каждого контекста свой текст и своё действие">
        <div className="flex flex-col gap-1">
          <EmptyState
            className="w-comp-popover-panel"
            icon={InboxIcon}
            title="Задач пока нет"
            description="Первая задача появится здесь, как только вы её добавите."
            action={
              <Button variant="primary" iconStart={<Icon icon={PlusSignIcon} />}>
                Добавить задачу
              </Button>
            }
          />
          <span className="text-caption-sm text-text-3">empty · с действием</span>
        </div>
        <div className="flex flex-col gap-1">
          <EmptyState
            className="w-comp-popover-panel"
            icon={Search01Icon}
            title="Ничего не нашлось"
            description="Проверьте формулировку или снимите фильтры."
            action={<Button>Сбросить поиск</Button>}
          />
          <span className="text-caption-sm text-text-3">not found</span>
        </div>
      </DemoRow>

      <DemoRow label="Ошибка и нет доступа">
        <div className="flex flex-col gap-1">
          <EmptyState
            className="w-comp-popover-panel"
            icon={Alert01Icon}
            title="Данные не загрузились"
            description="Сеть недоступна. Попробуйте ещё раз."
            action={<Button variant="danger">Повторить</Button>}
          />
          <span className="text-caption-sm text-text-3">unavailable · с «Повторить»</span>
        </div>
        <div className="flex flex-col gap-1">
          <EmptyState
            className="w-comp-popover-panel"
            icon={SquareLock02Icon}
            title="Нет доступа"
            description="Попросите владельца пространства открыть эту доску."
          />
          <span className="text-caption-sm text-text-3">denied · без кнопки</span>
        </div>
      </DemoRow>

      <DemoRow label="Размер sm и минимальный набор">
        <div className="flex flex-col gap-1">
          <EmptyState
            size="sm"
            className="w-comp-popover-menu"
            title="Пусто"
            description="Перетащите сюда карточку."
          />
          <span className="text-caption-sm text-text-3">sm · колонка канбана</span>
        </div>
        <div className="flex flex-col gap-1">
          <EmptyState className="w-comp-popover-menu" title="Новых уведомлений нет" />
          <span className="text-caption-sm text-text-3">только заголовок</span>
        </div>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "empty-state";
export const title = "EmptyState — пустое состояние";
export const component = EmptyStateDemo;
