import { useState } from "react";
import { Archive02Icon, InboxIcon, Settings01Icon } from "@hugeicons/core-free-icons";

import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  type TabsTabSize,
} from "@/registry/cubby/ui/tabs";
import { Icon } from "@/registry/cubby/ui/icon";
import { DemoCell, DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

// `:hover`/`:focus-visible` cannot be frozen for a screenshot, so this column
// re-applies exactly the utility the component uses on that pseudo-class —
// same trick as `button-demo.tsx`. `data-active` is real markup state, not a
// pseudo-class, so the "active" cells below are genuinely active tabs rather
// than a faked class.
const hoverClassName = "bg-film-2";
const focusClassName =
  "outline-solid outline-(length:--stroke-focus) outline-offset-(--stroke-hairline) outline-accent";

const sizes: { size: TabsTabSize; label: string }[] = [
  { size: "compact", label: "compact · 28 — 04 M-05" },
  { size: "regular", label: "regular · 32 — не в спеке, см. отчёт" },
];

function SizeRow({ size, label }: { size: TabsTabSize; label: string }) {
  return (
    <DemoRow label={label}>
      <Tabs defaultValue="boards">
        <TabsList>
          <TabsTab value="boards" size={size}>
            Доски
          </TabsTab>
          <TabsTab value="backlog" size={size}>
            Бэклог
          </TabsTab>
          <TabsTab value="archive" size={size}>
            Архив
          </TabsTab>
        </TabsList>
      </Tabs>
    </DemoRow>
  );
}

function StatesRow() {
  return (
    <DemoRow label="Состояния — rest / hover / active / focus / disabled">
      <DemoCell label="rest">
        <Tabs defaultValue="b">
          <TabsList>
            <TabsTab value="a">Rest</TabsTab>
            <TabsTab value="b">—</TabsTab>
          </TabsList>
        </Tabs>
      </DemoCell>
      <DemoCell label="наведение">
        <Tabs defaultValue="b">
          <TabsList>
            <TabsTab value="a" className={hoverClassName}>
              Hover
            </TabsTab>
            <TabsTab value="b">—</TabsTab>
          </TabsList>
        </Tabs>
      </DemoCell>
      <DemoCell label="активная — fill film/3">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTab value="a">Active</TabsTab>
            <TabsTab value="b">—</TabsTab>
          </TabsList>
        </Tabs>
      </DemoCell>
      <DemoCell label="фокус · 2px">
        <Tabs defaultValue="b">
          <TabsList>
            <TabsTab value="a" className={focusClassName}>
              Focus
            </TabsTab>
            <TabsTab value="b">—</TabsTab>
          </TabsList>
        </Tabs>
      </DemoCell>
      <DemoCell label="disabled · фокусируема">
        <Tabs defaultValue="b">
          <TabsList>
            <TabsTab value="a" disabled>
              Disabled
            </TabsTab>
            <TabsTab value="b">—</TabsTab>
          </TabsList>
        </Tabs>
      </DemoCell>
    </DemoRow>
  );
}

function IconCountRow() {
  return (
    <DemoRow label="С иконкой и счётчиком — лейн счётчика справа, 04 §3.3">
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTab value="inbox" icon={<Icon icon={InboxIcon} />} count={27}>
            Все задачи
          </TabsTab>
          <TabsTab value="sprint" icon={<Icon icon={Settings01Icon} />} count={12}>
            Спринт 24
          </TabsTab>
          <TabsTab value="archive" icon={<Icon icon={Archive02Icon} />} disabled>
            Архив
          </TabsTab>
        </TabsList>
      </Tabs>
    </DemoRow>
  );
}

/**
 * The live, fully wired group: exactly the case the task names — a
 * Preview/Usage/Source switcher, plus the package-manager row next to it.
 * Real `TabsPanel`s, real keyboard behaviour (`←→`, `Home`/`End`, `Enter`/
 * `Space`), nothing faked.
 */
function LiveShowcase() {
  const managers = ["npm", "pnpm", "bun", "yarn"] as const;
  const [manager, setManager] = useState<(typeof managers)[number]>("pnpm");

  return (
    <div className="flex w-comp-popover-panel flex-col gap-4">
      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTab value="preview">Preview</TabsTab>
          <TabsTab value="usage">Usage</TabsTab>
          <TabsTab value="source">Source</TabsTab>
        </TabsList>
        <TabsPanel value="preview" className="pt-3 text-caption-sm text-text-3">
          Отрисованный компонент.
        </TabsPanel>
        <TabsPanel value="usage" className="pt-3">
          <Tabs value={manager} onValueChange={(value) => setManager(value as typeof manager)}>
            <TabsList>
              {managers.map((name) => (
                <TabsTab key={name} value={name} size="compact">
                  {name}
                </TabsTab>
              ))}
            </TabsList>
            <TabsPanel value={manager} className="pt-2 text-caption-sm-tabular text-text-2">
              {manager} add @cubby-ui/registry
            </TabsPanel>
          </Tabs>
        </TabsPanel>
        <TabsPanel value="source" className="pt-3 text-caption-sm text-text-3">
          Исходник компонента.
        </TabsPanel>
      </Tabs>
    </div>
  );
}

function TabsDemo() {
  return (
    <DemoGrid>
      {sizes.map(({ size, label }) => (
        <SizeRow key={size} size={size} label={label} />
      ))}
      <StatesRow />
      <IconCountRow />
      <DemoRow label="Живые — Preview / Usage / Source + переключатель пакетного менеджера">
        <LiveShowcase />
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "tabs";
export const title = "Tabs — вкладки";
export const component = TabsDemo;
