import {
  Delete02Icon,
  MoreHorizontalIcon,
  Notification01Icon,
  PlusSignIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton, type IconButtonVariant } from "@/registry/cubby/ui/icon-button";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

const hover: Record<IconButtonVariant, string> = {
  primary: "bg-btn-primary-surface-hover",
  secondary: "bg-film-2",
  danger: "bg-film-1",
  text: "bg-film-1",
};

const pressed: Record<IconButtonVariant, string> = {
  primary: "bg-[color-mix(in_srgb,var(--plate)_88%,var(--text-on-plate))]",
  secondary: "bg-film-3",
  danger: "bg-film-2",
  text: "bg-film-2",
};

const focusRing =
  "outline-solid outline-(length:--stroke-focus) outline-offset-(--stroke-hairline) outline-accent";

const variants: IconButtonVariant[] = ["primary", "secondary", "danger", "text"];

const glyph: Record<IconButtonVariant, typeof PlusSignIcon> = {
  primary: PlusSignIcon,
  secondary: Settings01Icon,
  danger: Delete02Icon,
  text: MoreHorizontalIcon,
};

function IconButtonDemo() {
  return (
    <DemoGrid>
      {variants.map((variant) => (
        <DemoRow key={variant} label={`variant="${variant}" · состояния`}>
          <DemoCell label="rest · 32">
            <IconButton
              variant={variant}
              aria-label="Действие"
              icon={<Icon icon={glyph[variant]} />}
            />
          </DemoCell>
          <DemoCell label="compact · 28">
            <IconButton
              variant={variant}
              size="compact"
              aria-label="Действие"
              icon={<Icon icon={glyph[variant]} />}
            />
          </DemoCell>
          <DemoCell label="наведение">
            <IconButton
              variant={variant}
              className={hover[variant]}
              aria-label="Действие"
              icon={<Icon icon={glyph[variant]} />}
            />
          </DemoCell>
          <DemoCell label="нажатие">
            <IconButton
              variant={variant}
              className={pressed[variant]}
              aria-label="Действие"
              icon={<Icon icon={glyph[variant]} />}
            />
          </DemoCell>
          <DemoCell label="фокус · 2px">
            <IconButton
              variant={variant}
              className={focusRing}
              aria-label="Действие"
              icon={<Icon icon={glyph[variant]} />}
            />
          </DemoCell>
          <DemoCell label="отключена">
            <IconButton
              variant={variant}
              disabled
              aria-label="Действие"
              icon={<Icon icon={glyph[variant]} />}
            />
          </DemoCell>
          <DemoCell label="загрузка">
            <IconButton
              variant={variant}
              loading
              aria-label="Действие"
              icon={<Icon icon={glyph[variant]} />}
            />
          </DemoCell>
        </DemoRow>
      ))}

      <DemoRow label="Бейдж, выбранное состояние, иконка навигации 20">
        <DemoCell label="точка непрочитанного">
          <IconButton
            badge
            aria-label="Уведомления"
            icon={<Icon icon={Notification01Icon} />}
          />
        </DemoCell>
        <DemoCell label="выбран · дровер открыт">
          <IconButton
            selected
            variant="text"
            aria-label="Уведомления"
            icon={<Icon icon={Notification01Icon} />}
          />
        </DemoCell>
        <DemoCell label="иконка 20 в навигации">
          <IconButton
            variant="text"
            aria-label="Уведомления"
            icon={<Icon icon={Notification01Icon} size="lg" />}
          />
        </DemoCell>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "icon-button";
export const title = "IconButton — кнопка-иконка";
export const component = IconButtonDemo;
