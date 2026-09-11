import { Spinner } from "@/registry/cubby/ui/spinner";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

function SpinnerDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Размеры — 20 и 12, обводка 2, оборот 800ms linear">
        <DemoCell label="regular · 20">
          <Spinner />
        </DemoCell>
        <DemoCell label="compact · 12 — тот, что внутри кнопки">
          <Spinner size="compact" />
        </DemoCell>
      </DemoRow>

      <DemoRow label="На поверхностях">
        <DemoCell label="на bg-surface">
          <span className="inline-flex items-center justify-center rounded-role-card border border-film-border bg-bg-surface p-4">
            <Spinner />
          </span>
        </DemoCell>
        <DemoCell label="на bg-well">
          <span className="inline-flex items-center justify-center rounded-role-card bg-bg-well p-4">
            <Spinner />
          </span>
        </DemoCell>
        <DemoCell label="на плашке plate">
          <span className="inline-flex items-center justify-center rounded-role-card bg-plate p-4">
            <Spinner className="border-film-border-strong border-t-text-on-plate" />
          </span>
        </DemoCell>
      </DemoRow>

      <DemoRow label="С подписью — ожидание дольше секунды объясняется словами">
        <DemoCell label="role=status, подпись для скринридера">
          <span className="inline-flex items-center gap-2 text-ui-md text-text-2">
            <Spinner size="compact" label="Загружаем задачи" />
            Загружаем задачи…
          </span>
        </DemoCell>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "spinner";
export const title = "Spinner — спиннер";
export const component = SpinnerDemo;
