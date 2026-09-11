import type { ReactNode } from "react";
import { TextArea, type TextAreaTone } from "@/registry/cubby/ui/text-area";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

const tones: TextAreaTone[] = ["default", "raised"];

const twoLines = "Первая строка описания.\nВторая строка описания.";
// Each line wraps to a few visual lines inside the box below, so all twelve
// of them push well past the 240px cap and it has to scroll — twelve short
// one-liners would not overflow it at all.
const twelveLines = Array.from(
  { length: 12 },
  (_, i) => `Пункт ${i + 1}: описание достаточно длинное, чтобы перенестись на несколько строк.`,
).join("\n");

// `:hover`/`:focus-visible` cannot be frozen for a screenshot, so these two
// columns re-apply exactly the utilities the component uses on those
// pseudo-classes — same trick as `button-demo.tsx`.
const hoverClassName = "bg-film-3";
const focusClassName =
  "outline-solid outline-(length:--stroke-focus) outline-offset-(--stroke-hairline) outline-accent";

/**
 * `TextArea`'s box is `w-full max-w-full` on purpose (a form field fills its
 * row, never its own text). `DemoRow` is a wrapping flex row that gives its
 * children no width of their own, so — same as a real form row would — this
 * gives each field a concrete width to fill instead of passing a `w-*`
 * override straight to the component (which `field-sizing: content` would
 * ignore in favour of sizing to the longest unwrapped line).
 */
function Field({ children }: { children: ReactNode }) {
  return <div className="w-comp-popover-menu">{children}</div>;
}

function TextAreaDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Тона — 04 A-07">
        {tones.map((tone) => (
          <DemoCell key={tone} label={tone}>
            <Field>
              <TextArea tone={tone} defaultValue={twoLines} />
            </Field>
          </DemoCell>
        ))}
      </DemoRow>

      <DemoRow label="Состояния — rest / hover / focus / error / disabled">
        <DemoCell label="rest">
          <Field>
            <TextArea defaultValue={twoLines} />
          </Field>
        </DemoCell>
        <DemoCell label="наведение">
          <Field>
            <TextArea defaultValue={twoLines} className={hoverClassName} />
          </Field>
        </DemoCell>
        <DemoCell label="фокус · 2px">
          <Field>
            <TextArea defaultValue={twoLines} className={focusClassName} />
          </Field>
        </DemoCell>
        <DemoCell label="ошибка">
          <Field>
            <TextArea aria-invalid defaultValue="Слишком длинное имя фильтра" />
          </Field>
        </DemoCell>
        <DemoCell label="отключено · 0.45">
          <Field>
            <TextArea disabled defaultValue={twoLines} />
          </Field>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Высота растёт с содержимым — min 72, max 240, дальше скролл">
        <DemoCell label="empty — min-height, плейсхолдер">
          <Field>
            <TextArea placeholder="Опишите задачу подробнее" />
          </Field>
        </DemoCell>
        <DemoCell label="2 строки — растёт по содержимому">
          <Field>
            <TextArea defaultValue={twoLines} />
          </Field>
        </DemoCell>
        <DemoCell label="12 строк — виден потолок и внутренний скролл">
          <Field>
            <TextArea defaultValue={twelveLines} />
          </Field>
        </DemoCell>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "text-area";
export const title = "TextArea — многострочное поле";
export const component = TextAreaDemo;
