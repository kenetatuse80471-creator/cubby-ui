import { renderToStaticMarkup } from "react-dom/server";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { describe, expect, it } from "vitest";

import { Icon } from "@/registry/cubby/ui/icon";
import { TextInput } from "@/registry/cubby/ui/text-input";
import { TextArea } from "@/registry/cubby/ui/text-area";
import { Select, SelectTrigger, SelectValue } from "@/registry/cubby/ui/select";

describe("TextInput", () => {
  it("renders its data-slot", () => {
    expect(renderToStaticMarkup(<TextInput />)).toContain('data-slot="text-input"');
  });

  it("size classes come from the height tokens, not a literal", () => {
    expect(renderToStaticMarkup(<TextInput />)).toContain("h-control-h-md");
    expect(renderToStaticMarkup(<TextInput size="large" />)).toContain("h-control-h-xl");
    expect(renderToStaticMarkup(<TextInput size="form" />)).toContain("h-control-h-lg");
  });

  it("tone classes switch the fill token", () => {
    expect(renderToStaticMarkup(<TextInput />)).toContain("bg-film-2");
    expect(renderToStaticMarkup(<TextInput tone="raised" />)).toContain("bg-bg-raised");
  });

  it("disabled sets the attribute on the input and dims the box", () => {
    const html = renderToStaticMarkup(<TextInput disabled />);
    expect(html).toContain("disabled");
    expect(html).toContain("opacity-(--opacity-disabled)");
  });

  it("aria-invalid gives the box the error class", () => {
    const valid = renderToStaticMarkup(<TextInput />);
    expect(valid).not.toContain("border-danger");
    const invalid = renderToStaticMarkup(<TextInput aria-invalid />);
    expect(invalid).toContain('aria-invalid="true"');
    expect(invalid).toContain("border-danger");
  });

  it("renders the icon slot only when one is passed", () => {
    const plain = renderToStaticMarkup(<TextInput />);
    expect(plain).not.toContain('data-slot="text-input-icon"');
    const withIcon = renderToStaticMarkup(<TextInput iconStart={<Icon icon={Search01Icon} />} />);
    expect(withIcon).toContain('data-slot="text-input-icon"');
  });

  it("renders the clear button only with an accessible name", () => {
    const plain = renderToStaticMarkup(<TextInput />);
    expect(plain).not.toContain('data-slot="text-input-clear"');
    const clearable = renderToStaticMarkup(<TextInput clearLabel="Очистить" onClear={() => {}} />);
    expect(clearable).toContain('data-slot="text-input-clear"');
    expect(clearable).toContain('aria-label="Очистить"');
  });
});

describe("TextArea", () => {
  it("renders its data-slot and fits its content", () => {
    const html = renderToStaticMarkup(<TextArea />);
    expect(html).toContain('data-slot="text-area"');
    expect(html).toContain("field-sizing-content");
    expect(html).toContain("min-h-textarea-min-h");
  });

  it("tone classes switch the fill token", () => {
    expect(renderToStaticMarkup(<TextArea tone="raised" />)).toContain("bg-bg-raised");
  });

  it("disabled sets the attribute", () => {
    expect(renderToStaticMarkup(<TextArea disabled />)).toContain("disabled");
  });

  it("aria-invalid gives it the error class", () => {
    const valid = renderToStaticMarkup(<TextArea />);
    expect(valid).not.toContain("border-danger");
    const invalid = renderToStaticMarkup(<TextArea aria-invalid />);
    expect(invalid).toContain('aria-invalid="true"');
    expect(invalid).toContain("border-danger");
  });
});

describe("Select", () => {
  it("trigger carries aria-haspopup and the placeholder", () => {
    const html = renderToStaticMarkup(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Не выбрано" />
        </SelectTrigger>
      </Select>,
    );
    expect(html).toContain('data-slot="select-trigger"');
    expect(html).toContain('data-slot="select-value"');
    expect(html).toContain('data-slot="select-icon"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain("Не выбрано");
  });

  it("shows the current value once one is set", () => {
    const html = renderToStaticMarkup(
      <Select defaultValue="ru">
        <SelectTrigger>
          <SelectValue placeholder="Не выбрано">
            {(value: string | null) => (value === "ru" ? "Русский" : "Не выбрано")}
          </SelectValue>
        </SelectTrigger>
      </Select>,
    );
    expect(html).toContain("Русский");
  });

  it("size and tone classes come from tokens", () => {
    const html = renderToStaticMarkup(
      <Select>
        <SelectTrigger size="compact" tone="raised">
          <SelectValue placeholder="Не выбрано" />
        </SelectTrigger>
      </Select>,
    );
    expect(html).toContain("h-control-h-sm");
    expect(html).toContain("bg-bg-raised");
  });

  it("disabled sets the attribute on the trigger", () => {
    const html = renderToStaticMarkup(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Не выбрано" />
        </SelectTrigger>
      </Select>,
    );
    expect(html).toContain("disabled");
  });

  it("aria-invalid gives the trigger the error class", () => {
    const html = renderToStaticMarkup(
      <Select>
        <SelectTrigger aria-invalid>
          <SelectValue placeholder="Не выбрано" />
        </SelectTrigger>
      </Select>,
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("border-danger");
  });

  // `Select.Portal` renders nothing under `renderToStaticMarkup` — checked
  // empirically, there is no `document` for it to portal into on the server
  // — so the popup (`SelectContent`/`SelectItem`) is left to the screenshot
  // instead of a render-to-string test, per this batch's own allowance for
  // the open Select.
});
