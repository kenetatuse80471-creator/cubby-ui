import type { ReactNode } from "react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import {
  TextInput,
  type TextInputSize,
  type TextInputTone,
} from "@/registry/cubby/ui/text-input";
import { Icon } from "@/registry/cubby/ui/icon";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

const sizes: { size: TextInputSize; label: string }[] = [
  { size: "regular", label: "regular · 32" },
  { size: "form", label: "form · 36 · поле формы в модалке" },
  { size: "large", label: "large · 40 · вход и крупные формы" },
];

const tones: TextInputTone[] = ["default", "raised"];

// `:hover`/`:focus-visible` cannot be frozen for a screenshot, so these two
// columns re-apply exactly the utilities the component uses on those
// pseudo-classes — same trick as `button-demo.tsx`.
const hoverClassName = "bg-film-3";
const focusClassName =
  "outline-solid outline-(length:--stroke-focus) outline-offset-(--stroke-hairline) outline-accent";

/**
 * `TextInput`'s box is `w-full` on purpose (a form field fills its row).
 * `DemoRow` is a wrapping flex row that gives its children no width of their
 * own, so this stands in for the real form row and gives the field
 * something concrete to fill.
 */
function Field({ children }: { children: ReactNode }) {
  return <div className="w-comp-popover-menu">{children}</div>;
}

function TextInputDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Размеры × тона — 04 A-06">
        {sizes.map(({ size, label }) =>
          tones.map((tone) => (
            <DemoCell key={`${size}-${tone}`} label={`${label} · ${tone}`}>
              <Field>
                <TextInput size={size} tone={tone} defaultValue="Дизайн-система" />
              </Field>
            </DemoCell>
          )),
        )}
      </DemoRow>

      <DemoRow label="Состояния — rest / hover / focus / error / disabled">
        <DemoCell label="rest">
          <Field>
            <TextInput defaultValue="Дизайн-система" />
          </Field>
        </DemoCell>
        <DemoCell label="наведение">
          <Field>
            <TextInput defaultValue="Дизайн-система" className={hoverClassName} />
          </Field>
        </DemoCell>
        <DemoCell label="фокус · 2px">
          <Field>
            <TextInput defaultValue="Дизайн-система" className={focusClassName} />
          </Field>
        </DemoCell>
        <DemoCell label="ошибка">
          <Field>
            <TextInput aria-invalid defaultValue="Название уже занято" />
          </Field>
        </DemoCell>
        <DemoCell label="отключено · 0.45">
          <Field>
            <TextInput disabled defaultValue="Дизайн-система" />
          </Field>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Пусто — плейсхолдер это пример значения, не повтор подписи">
        <DemoCell label="empty">
          <Field>
            <TextInput placeholder="Например, Дизайн-система" />
          </Field>
        </DemoCell>
        <DemoCell label="длинное значение — скроллится, не обрезается">
          <Field>
            <TextInput defaultValue="Очень длинное значение поля, которое не помещается по ширине целиком" />
          </Field>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Слоты — иконка слева (16) и кнопка очистки">
        <DemoCell label="с иконкой">
          <Field>
            <TextInput iconStart={<Icon icon={Search01Icon} />} placeholder="Поиск по задачам" />
          </Field>
        </DemoCell>
        <DemoCell label="с очисткой">
          <Field>
            <TextInput defaultValue="Дизайн-система" clearLabel="Очистить поле" onClear={() => {}} />
          </Field>
        </DemoCell>
        <DemoCell label="иконка + очистка">
          <Field>
            <TextInput
              iconStart={<Icon icon={Search01Icon} />}
              defaultValue="кубик"
              clearLabel="Очистить поле"
              onClear={() => {}}
            />
          </Field>
        </DemoCell>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "text-input";
export const title = "TextInput — однострочное поле";
export const component = TextInputDemo;
