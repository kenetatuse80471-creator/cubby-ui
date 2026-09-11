import { Divider } from "@/registry/cubby/ui/divider";
import { DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

function DividerDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Горизонтальный — 1px, ширина по родителю">
        <div className="flex w-comp-popover-panel flex-col gap-1">
          <span className="text-caption-sm text-text-3">tone=&quot;default&quot; · border</span>
          <Divider />
          <span className="text-caption-sm text-text-3">tone=&quot;film&quot; · film/border</span>
          <Divider tone="film" />
        </div>
      </DemoRow>

      <DemoRow label="Вертикальный — в шапке между группами контролов">
        <div className="flex h-control-h-xl items-center gap-4 rounded-role-card border border-film-border bg-bg-surface px-4">
          <span className="text-ui-md text-text-1">Список</span>
          <Divider orientation="vertical" className="h-icon-lg" />
          <span className="text-ui-md text-text-2">Доска</span>
          <Divider orientation="vertical" tone="film" className="h-icon-lg" />
          <span className="text-ui-md text-text-2">Таблица</span>
        </div>
      </DemoRow>

      <DemoRow label="Как в футере модалки — разделитель там, где зазора мало">
        <div className="flex w-comp-popover-panel flex-col overflow-hidden rounded-role-surface border border-film-border bg-bg-surface">
          <div className="px-4 py-3 text-heading-h3 text-text-1">Удалить доску?</div>
          <Divider />
          <div className="px-4 py-3 text-ui-md-regular text-text-2">
            Действие необратимо.
          </div>
          <Divider />
          <div className="px-4 py-3 text-ui-md text-text-2">Отменить · Удалить</div>
        </div>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "divider";
export const title = "Divider — разделитель";
export const component = DividerDemo;
