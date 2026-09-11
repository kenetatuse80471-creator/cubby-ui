import { renderToStaticMarkup } from "react-dom/server";
import { Alert01Icon, Notification01Icon } from "@hugeicons/core-free-icons";
import { describe, expect, it } from "vitest";

import { Avatar } from "@/registry/cubby/ui/avatar";
import { Button } from "@/registry/cubby/ui/button";
import { Divider } from "@/registry/cubby/ui/divider";
import { EmptyState } from "@/registry/cubby/ui/empty-state";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import { Spinner } from "@/registry/cubby/ui/spinner";
import { Switch } from "@/registry/cubby/ui/switch";
import { Tag } from "@/registry/cubby/ui/tag";

describe("data-slot", () => {
  it("icon", () => {
    expect(renderToStaticMarkup(<Icon icon={Alert01Icon} />)).toContain('data-slot="icon"');
  });

  it("button", () => {
    const html = renderToStaticMarkup(<Button>Создать</Button>);
    expect(html).toContain('data-slot="button"');
    expect(html).toContain("Создать");
  });

  it("icon-button", () => {
    const html = renderToStaticMarkup(
      <IconButton aria-label="Уведомления" icon={<Icon icon={Notification01Icon} />} />,
    );
    expect(html).toContain('data-slot="icon-button"');
    expect(html).toContain('aria-label="Уведомления"');
  });

  it("tag", () => {
    expect(renderToStaticMarkup(<Tag tone="blue">В работе</Tag>)).toContain('data-slot="tag"');
  });

  it("divider", () => {
    expect(renderToStaticMarkup(<Divider />)).toContain('data-slot="divider"');
  });

  it("avatar", () => {
    expect(renderToStaticMarkup(<Avatar initials="СО" name="Сергей Оршак" />)).toContain(
      'data-slot="avatar"',
    );
  });

  it("spinner", () => {
    expect(renderToStaticMarkup(<Spinner />)).toContain('data-slot="spinner"');
  });

  it("empty-state", () => {
    const html = renderToStaticMarkup(<EmptyState title="Задач пока нет" />);
    expect(html).toContain('data-slot="empty-state"');
    expect(html).toContain('data-slot="empty-state-title"');
  });

  it("switch", () => {
    expect(renderToStaticMarkup(<Switch aria-label="Уведомления" />)).toContain(
      'data-slot="switch"',
    );
  });
});

describe("disabled", () => {
  it("button sets the attribute", () => {
    expect(renderToStaticMarkup(<Button disabled>Создать</Button>)).toContain("disabled");
  });

  it("button in loading is disabled and busy", () => {
    const html = renderToStaticMarkup(<Button loading>Создать</Button>);
    expect(html).toContain("disabled");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-slot="button-spinner"');
  });

  it("icon-button sets the attribute", () => {
    const html = renderToStaticMarkup(
      <IconButton aria-label="Удалить" disabled icon={<Icon icon={Alert01Icon} />} />,
    );
    expect(html).toContain("disabled");
  });

  it("switch sets the attribute", () => {
    const html = renderToStaticMarkup(<Switch aria-label="Уведомления" disabled />);
    expect(html).toContain("disabled");
  });
});

describe("shape", () => {
  it("icon carries the size class of its token, not a literal", () => {
    expect(renderToStaticMarkup(<Icon icon={Alert01Icon} size="lg" />)).toContain(
      "size-icon-lg",
    );
  });

  it("icon is hidden from the accessibility tree", () => {
    expect(renderToStaticMarkup(<Icon icon={Alert01Icon} />)).toContain('aria-hidden="true"');
  });

  it("tag renders its cross only with an accessible name", () => {
    const plain = renderToStaticMarkup(<Tag>Метка</Tag>);
    expect(plain).not.toContain('data-slot="tag-remove"');
    const removable = renderToStaticMarkup(
      <Tag removeLabel="Снять метку" onRemove={() => {}}>
        Метка
      </Tag>,
    );
    expect(removable).toContain('data-slot="tag-remove"');
    expect(removable).toContain('aria-label="Снять метку"');
  });

  it("avatar falls back to the empty state", () => {
    const html = renderToStaticMarkup(<Avatar />);
    expect(html).toContain('data-empty=""');
    expect(html).toContain('data-slot="avatar-placeholder"');
  });

  it("divider is decorative by default", () => {
    expect(renderToStaticMarkup(<Divider />)).toContain('role="none"');
    expect(renderToStaticMarkup(<Divider decorative={false} />)).toContain('role="separator"');
  });
});
