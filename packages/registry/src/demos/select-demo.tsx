import { useState } from "react";
import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectSize,
  type SelectTone,
} from "@/registry/cubby/ui/select";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

const sizes: { size: SelectSize; label: string }[] = [
  { size: "regular", label: "regular · 32" },
  { size: "compact", label: "compact · 28" },
];

const tones: SelectTone[] = ["default", "raised"];

// `:hover`/`:focus-visible` cannot be frozen for a screenshot, so these two
// columns re-apply exactly the utilities the component uses on those
// pseudo-classes — same trick as `button-demo.tsx`.
const hoverClassName = "bg-film-2";
const focusClassName =
  "outline-solid outline-(length:--stroke-focus) outline-offset-(--stroke-hairline) outline-accent";

/**
 * `SelectTrigger` is `w-full` on purpose (a form field fills its row).
 * `DemoRow` is a wrapping flex row that gives its children no width of
 * their own, so this stands in for the real form row.
 */
function Field({ children }: { children: ReactNode }) {
  return <div className="w-comp-popover-menu">{children}</div>;
}

function ClosedSelect({
  size,
  tone,
  className,
  hasValue = true,
  ...triggerProps
}: {
  size?: SelectSize;
  tone?: SelectTone;
  className?: string;
  hasValue?: boolean;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}) {
  return (
    <Select defaultValue={hasValue ? "ru" : null}>
      <SelectTrigger size={size} tone={tone} className={className} {...triggerProps}>
        <SelectValue placeholder="Не выбрано">
          {(value: string | null) => (value === "ru" ? "Русский" : "Не выбрано")}
        </SelectValue>
      </SelectTrigger>
    </Select>
  );
}

/**
 * The only real, interactive Select in this demo: forced open with
 * `defaultOpen` (the shots script never clicks anything, so this is the only
 * way to have the popup show up at all) and portaled into `container`, a
 * node that lives inside this same section — Base UI's default portal
 * target is `<body>`, outside the region the screenshot script captures.
 */
function OpenSelectShowcase() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    // `pb-comp-popover-panel`: this is the last row on the page, so without
    // trailing space the viewport has nowhere to scroll to and the popup's
    // own `max-h-(--available-height)` clamps it to almost nothing.
    <div className="relative flex w-comp-popover-menu flex-col pb-comp-popover-panel">
      {/* `modal={false}`: a showcase page has no dialog to trap focus or lock
          scroll behind — the real component still defaults to `modal`. */}
      <Select defaultOpen defaultValue="ru" modal={false}>
        <SelectTrigger>
          <SelectValue placeholder="Не выбрано">
            {(value: string | null) => (value === "ru" ? "Русский" : "Не выбрано")}
          </SelectValue>
        </SelectTrigger>
        {/* `collisionAvoidance={{ side: "none" }}`: this row sits near the
            bottom of a long showcase page, and a real viewport-edge flip
            would make the popup open upward and cover the row above it —
            wrong for a screenshot meant to show it opening downward. */}
        <SelectContent container={container} sideOffset={4} collisionAvoidance={{ side: "none" }}>
          <SelectItem value="en" className={hoverClassName}>
            English
          </SelectItem>
          <SelectItem value="ru">Русский</SelectItem>
          <SelectItem value="de" disabled>
            Deutsch
          </SelectItem>
        </SelectContent>
      </Select>
      <div ref={setContainer} />
    </div>
  );
}

function SelectDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Размеры × тона — 04 A-08">
        {sizes.map(({ size, label }) =>
          tones.map((tone) => (
            <DemoCell key={`${size}-${tone}`} label={`${label} · ${tone}`}>
              <Field>
                <ClosedSelect size={size} tone={tone} />
              </Field>
            </DemoCell>
          )),
        )}
      </DemoRow>

      <DemoRow label="Состояния — rest / hover / focus / error / disabled">
        <DemoCell label="rest">
          <Field>
            <ClosedSelect />
          </Field>
        </DemoCell>
        <DemoCell label="наведение">
          <Field>
            <ClosedSelect className={hoverClassName} />
          </Field>
        </DemoCell>
        <DemoCell label="фокус · 2px">
          <Field>
            <ClosedSelect className={focusClassName} />
          </Field>
        </DemoCell>
        <DemoCell label="ошибка">
          <Field>
            <ClosedSelect aria-invalid />
          </Field>
        </DemoCell>
        <DemoCell label="отключено · 0.45">
          <Field>
            <ClosedSelect disabled />
          </Field>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Пусто — плейсхолдер «Не выбрано»">
        <DemoCell label="empty">
          <Field>
            <ClosedSelect hasValue={false} />
          </Field>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Раскрытый список — по 04 M-04 / S-02: hover, выбранный (галочка), disabled">
        <OpenSelectShowcase />
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "select";
export const title = "Select — выпадающий список";
export const component = SelectDemo;
