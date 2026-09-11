import { Tag, type TagTone } from "@/registry/cubby/ui/tag";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

const tones: TagTone[] = [
  "neutral",
  "gray",
  "blue",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
];

function TagDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Девять тонов · заливка одна (film/2), цвет несут текст и обводка">
        {tones.map((tone) => (
          <DemoCell key={tone} label={tone}>
            <Tag tone={tone}>В работе</Tag>
          </DemoCell>
        ))}
      </DemoRow>

      <DemoRow label="С точкой-маркером">
        {tones.map((tone) => (
          <DemoCell key={tone} label={tone}>
            <Tag tone={tone} dot>
              Стадия
            </Tag>
          </DemoCell>
        ))}
      </DemoRow>

      <DemoRow label="Съёмный тег — крестик 12, состояния только у крестика">
        <DemoCell label="покой">
          <Tag tone="blue" removeLabel="Снять метку" onRemove={() => {}}>
            Дизайн
          </Tag>
        </DemoCell>
        <DemoCell label="наведение на крестик">
          <Tag
            tone="blue"
            removeLabel="Снять метку"
            onRemove={() => {}}
            className="[&_[data-slot=tag-remove]]:opacity-100"
          >
            Дизайн
          </Tag>
        </DemoCell>
        <DemoCell label="фокус на крестике">
          <Tag
            tone="blue"
            removeLabel="Снять метку"
            onRemove={() => {}}
            className="[&_[data-slot=tag-remove]]:opacity-100 [&_[data-slot=tag-remove]]:outline-solid [&_[data-slot=tag-remove]]:outline-(length:--stroke-focus) [&_[data-slot=tag-remove]]:outline-offset-(--stroke-hairline) [&_[data-slot=tag-remove]]:outline-accent"
          >
            Дизайн
          </Tag>
        </DemoCell>
        <DemoCell label="с точкой и крестиком">
          <Tag tone="purple" dot removeLabel="Снять метку" onRemove={() => {}}>
            Исследование
          </Tag>
        </DemoCell>
      </DemoRow>

      <DemoRow label="Отключён и длинная подпись">
        <DemoCell label="disabled · 0.45">
          <Tag tone="green" className="opacity-(--opacity-disabled)">
            Готово
          </Tag>
        </DemoCell>
        <div className="flex w-comp-popover-menu flex-col items-start gap-1">
          <Tag tone="orange">Очень длинное название метки, которое не влезает</Tag>
          <span className="text-caption-sm text-text-3">
            обрезается многоточием — тег метка, не предложение
          </span>
        </div>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "tag";
export const title = "Tag — тег";
export const component = TagDemo;
