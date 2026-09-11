import { Avatar, type AvatarTone } from "@/registry/cubby/ui/avatar";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

/** Inline SVG so the demo never depends on the network. */
const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%2340C8E0"/><stop offset="1" stop-color="%23BF5AF2"/></linearGradient></defs><rect width="64" height="64" fill="url(%23g)"/><circle cx="32" cy="25" r="11" fill="rgba(255,255,255,.85)"/><path d="M8 64c2-14 12-21 24-21s22 7 24 21z" fill="rgba(255,255,255,.85)"/></svg>',
  );

const tones: AvatarTone[] = [
  "gray",
  "blue",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
];

function AvatarDemo() {
  return (
    <DemoGrid>
      <DemoRow label="Размеры — 20 · 24 · 28 · 32 · 64">
        <DemoCell label="xs · 20 · строки">
          <Avatar size="xs" initials="СО" name="Сергей Оршак" />
        </DemoCell>
        <DemoCell label="sm · 24 · плотный список">
          <Avatar size="sm" initials="СО" name="Сергей Оршак" />
        </DemoCell>
        <DemoCell label="md · 28 · строка участника">
          <Avatar size="md" initials="СО" name="Сергей Оршак" />
        </DemoCell>
        <DemoCell label="lg · 32 · комментарий">
          <Avatar size="lg" initials="СО" name="Сергей Оршак" />
        </DemoCell>
        <DemoCell label="xl · 64 · карточка профиля">
          <Avatar size="xl" initials="СО" name="Сергей Оршак" />
        </DemoCell>
      </DemoRow>

      <DemoRow label="Тип содержимого">
        <DemoCell label="инициалы · identity">
          <Avatar size="lg" initials="СО" name="Сергей Оршак" />
        </DemoCell>
        <DemoCell label="фото по URL">
          <Avatar size="lg" src={photo} name="Сергей Оршак" />
        </DemoCell>
        <DemoCell label="пусто · никто не назначен">
          <Avatar size="lg" />
        </DemoCell>
        <DemoCell label="пусто · 20">
          <Avatar size="xs" />
        </DemoCell>
      </DemoRow>

      <DemoRow label="Варианты">
        <DemoCell label="identity · градиент акцента">
          <Avatar size="md" variant="identity" initials="СО" name="Сергей Оршак" />
        </DemoCell>
        <DemoCell label="neutral">
          <Avatar size="md" variant="neutral" initials="АК" name="Анна Ким" />
        </DemoCell>
        <DemoCell label="unavailable · удалён">
          <Avatar size="md" variant="unavailable" initials="ПР" name="Пётр Р." />
        </DemoCell>
        <DemoCell label="disabled · 0.45">
          <Avatar
            size="md"
            initials="СО"
            name="Сергей Оршак"
            className="opacity-(--opacity-disabled)"
          />
        </DemoCell>
      </DemoRow>

      <DemoRow label="Тон стадии по хэшу имени">
        {tones.map((tone) => (
          <DemoCell key={tone} label={tone}>
            <Avatar size="md" tone={tone} initials="СО" name="Сергей Оршак" />
          </DemoCell>
        ))}
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "avatar";
export const title = "Avatar — аватар";
export const component = AvatarDemo;
