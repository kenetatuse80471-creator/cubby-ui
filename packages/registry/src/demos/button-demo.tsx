import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import { Button, type ButtonVariant } from "@/registry/cubby/ui/button";
import { Icon } from "@/registry/cubby/ui/icon";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

/**
 * :hover / :active / :focus-visible cannot be frozen for a screenshot, so the
 * three columns below re-apply exactly the utilities the component uses.
 */
const hover: Record<ButtonVariant, string> = {
  primary: "bg-btn-primary-surface-hover",
  secondary: "bg-film-2",
  danger: "bg-film-1",
  text: "bg-film-1",
};

const pressed: Record<ButtonVariant, string> = {
  primary: "bg-[color-mix(in_srgb,var(--plate)_88%,var(--text-on-plate))]",
  secondary: "bg-film-3",
  danger: "bg-film-2",
  text: "bg-film-2",
};

const focusRing =
  "outline-solid outline-(length:--stroke-focus) outline-offset-(--stroke-hairline) outline-accent";

const variants: ButtonVariant[] = ["primary", "secondary", "danger", "text"];

function ButtonDemo() {
  return (
    <DemoGrid>
      {variants.map((variant) => (
        <DemoRow key={variant} label={`variant="${variant}" · состояния`}>
          <DemoCell label="rest · 32">
            <Button variant={variant}>Создать</Button>
          </DemoCell>
          <DemoCell label="compact · 28">
            <Button variant={variant} size="compact">
              Создать
            </Button>
          </DemoCell>
          <DemoCell label="наведение">
            <Button variant={variant} className={hover[variant]}>
              Создать
            </Button>
          </DemoCell>
          <DemoCell label="нажатие">
            <Button variant={variant} className={pressed[variant]}>
              Создать
            </Button>
          </DemoCell>
          <DemoCell label="фокус · 2px">
            <Button variant={variant} className={focusRing}>
              Создать
            </Button>
          </DemoCell>
          <DemoCell label="отключена · 0.45">
            <Button variant={variant} disabled>
              Создать
            </Button>
          </DemoCell>
          <DemoCell label="загрузка">
            <Button variant={variant} loading>
              Создать
            </Button>
          </DemoCell>
        </DemoRow>
      ))}

      <DemoRow label="Слоты иконок — 16px, слева и справа">
        <DemoCell label="иконка слева">
          <Button variant="primary" iconStart={<Icon icon={PlusSignIcon} />}>
            Задача
          </Button>
        </DemoCell>
        <DemoCell label="иконка справа">
          <Button iconEnd={<Icon icon={ArrowRight01Icon} />}>Дальше</Button>
        </DemoCell>
        <DemoCell label="загрузка вместо иконки — ширина та же">
          <Button variant="primary" loading iconStart={<Icon icon={PlusSignIcon} />}>
            Задача
          </Button>
        </DemoCell>
        <DemoCell label="compact + иконка">
          <Button size="compact" iconStart={<Icon icon={PlusSignIcon} />}>
            Задача
          </Button>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Ширина">
        <DemoCell label="min-width 64 на короткой подписи">
          <Button>ОК</Button>
        </DemoCell>
        <div className="flex w-comp-popover-panel flex-col items-start gap-1">
          <Button variant="primary" fullWidth>
            fullWidth
          </Button>
          <span className="text-caption-sm text-text-3">fullWidth · во всю поверхность</span>
        </div>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "button";
export const title = "Button — кнопка";
export const component = ButtonDemo;
