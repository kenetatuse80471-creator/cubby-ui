"use client";

import { Switch } from "@/registry/cubby/ui/switch";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

const focusRing =
  "outline-solid outline-(length:--stroke-focus) outline-offset-(--stroke-hairline) outline-accent";

function SwitchDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Состояния — трек 30×18, ручка 14, ход 12">
        <DemoCell label="off">
          <Switch aria-label="Уведомления" />
        </DemoCell>
        <DemoCell label="on">
          <Switch aria-label="Уведомления" defaultChecked />
        </DemoCell>
        <DemoCell label="наведение · off">
          <Switch aria-label="Уведомления" className="bg-film-3" />
        </DemoCell>
        <DemoCell label="наведение · on">
          <Switch
            aria-label="Уведомления"
            defaultChecked
            className="data-checked:bg-btn-primary-surface-hover"
          />
        </DemoCell>
        <DemoCell label="фокус · 2px">
          <Switch aria-label="Уведомления" className={focusRing} />
        </DemoCell>
        <DemoCell label="фокус · on">
          <Switch aria-label="Уведомления" defaultChecked className={focusRing} />
        </DemoCell>
        <DemoCell label="disabled off">
          <Switch aria-label="Уведомления" disabled />
        </DemoCell>
        <DemoCell label="disabled on">
          <Switch aria-label="Уведомления" defaultChecked disabled />
        </DemoCell>
      </DemoRow>

      <DemoRow label="В строке настроек — подпись слева, тумблер прижат вправо">
        <div className="flex w-comp-popover-panel flex-col gap-2">
          <label className="flex h-row-h-list cursor-pointer items-center justify-between gap-3 rounded-role-row px-3 hover:bg-film-1">
            <span className="text-ui-md text-text-1">Присылать письма о задачах</span>
            <Switch defaultChecked />
          </label>
          <label className="flex h-row-h-list cursor-pointer items-center justify-between gap-3 rounded-role-row px-3 hover:bg-film-1">
            <span className="text-ui-md text-text-1">Звук уведомлений</span>
            <Switch />
          </label>
        </div>
      </DemoRow>

      <DemoRow label="После действия — тихое подтверждение вместо снекбара">
        <div className="flex w-comp-popover-panel items-center justify-between gap-3 rounded-role-row px-3 py-2">
          <span className="text-ui-md text-text-1">Присылать письма о задачах</span>
          <span className="flex items-center gap-2">
            <span className="text-caption-sm text-success-text">Сохранено</span>
            <Switch defaultChecked />
          </span>
        </div>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "switch";
export const title = "Switch — тумблер";
export const component = SwitchDemo;
