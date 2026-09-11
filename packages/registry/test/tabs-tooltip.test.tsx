/**
 * Tabs and Tooltip both need a real DOM to drive keyboard and hover/focus
 * behaviour, so — same as `surfaces.test.tsx`'s Modal/Snackbar/ContextActionMenu
 * — this runs in `happy-dom`, not the string-rendering `render.test.tsx`.
 *
 * Two environment quirks, checked against this happy-dom + vitest setup
 * directly rather than assumed:
 *
 *  - `fireEvent.focus(el)` dispatches a `focus` event (enough to trigger Base
 *    UI's `useFocus` handler) but does not move `document.activeElement` the
 *    way a real browser does. A real `el.focus()` call does both, so that is
 *    what every test below uses, wrapped in `act` to keep React's state
 *    update inside the same flush `fireEvent` would have given it.
 *  - Base UI's roving tabindex moves the *DOM* focus from one tab to the next
 *    one render tick after the key handler runs (an effect, not the handler
 *    itself), so assertions on `document.activeElement` after an arrow key
 *    need `waitFor`; the `aria-selected`/`aria-disabled` flips from a click
 *    or a key do not.
 *  - A focused native `<button>` (`nativeButton` is Tab's default) relies on
 *    the *browser's* default action to turn an Enter keydown into a click —
 *    Base UI does not re-dispatch it itself (checked in
 *    `internals/use-button/useButton.mjs`: the Enter branch is skipped
 *    whenever `isNativeButton` is true) — and happy-dom does not synthesize
 *    that default action either, so `Enter` cannot be driven through
 *    `fireEvent` here. `Space` is unaffected: Base UI dispatches its click
 *    itself for any composite item, native button or not. 04 M-05 asks for
 *    both; this suite exercises the one that is actually testable without
 *    `@testing-library/user-event`, which this package does not depend on.
 *
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@/registry/cubby/ui/tabs";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/registry/cubby/ui/tooltip";

function focus(element: HTMLElement) {
  act(() => {
    element.focus();
  });
}

function ThreeTabs({ defaultValue = "a" }: { defaultValue?: string }) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTab value="a">Вкладка A</TabsTab>
        <TabsTab value="b">Вкладка B</TabsTab>
        <TabsTab value="c" disabled>
          Вкладка C
        </TabsTab>
      </TabsList>
      <TabsPanel value="a">Тело A</TabsPanel>
      <TabsPanel value="b">Тело B</TabsPanel>
      <TabsPanel value="c">Тело C</TabsPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders data-slot on the root, the list, a tab and the panel", () => {
    render(<ThreeTabs />);

    expect(screen.getByText("Вкладка A").closest('[data-slot="tabs-tab"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="tabs-list"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="tabs"]')).toBeTruthy();
    expect(screen.getByText("Тело A").closest('[data-slot="tabs-panel"]')).toBeTruthy();
  });

  it("links the active tab to its panel and marks it selected", () => {
    render(<ThreeTabs />);

    const tabA = screen.getByRole("tab", { name: "Вкладка A" });
    const panelA = screen.getByText("Тело A").closest('[data-slot="tabs-panel"]');

    expect(tabA.getAttribute("aria-selected")).toBe("true");
    expect(tabA.getAttribute("aria-controls")).toBe(panelA?.getAttribute("id"));
    expect(panelA?.getAttribute("aria-labelledby")).toBe(tabA.getAttribute("id"));
  });

  it("switches the active tab on click, hiding the previous panel", async () => {
    render(<ThreeTabs />);

    fireEvent.click(screen.getByRole("tab", { name: "Вкладка B" }));

    expect(screen.getByRole("tab", { name: "Вкладка B" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("tab", { name: "Вкладка A" }).getAttribute("aria-selected")).toBe(
      "false",
    );
    expect(screen.getByText("Тело B").closest('[data-slot="tabs-panel"]')).toHaveProperty(
      "hidden",
      false,
    );
    // Base UI unmounts a closed panel once its (here instant, no CSS
    // transition) close finishes — `keepMounted` is not set — rather than
    // leaving it in the DOM with `hidden`.
    await waitFor(() => {
      expect(screen.queryByText("Тело A")).toBeNull();
    });
  });

  it("moves focus with the arrow keys without selecting — activateOnFocus stays off", async () => {
    render(<ThreeTabs />);

    const tabA = screen.getByRole("tab", { name: "Вкладка A" });
    const tabB = screen.getByRole("tab", { name: "Вкладка B" });
    focus(tabA);

    fireEvent.keyDown(tabA, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(tabB);
    });
    // Focus moved, selection did not — 04 M-05: "←→ ходят, Enter/Space выбирают".
    expect(tabA.getAttribute("aria-selected")).toBe("true");
    expect(tabB.getAttribute("aria-selected")).toBe("false");
  });

  it("selects the focused tab with Space", () => {
    render(<ThreeTabs />);

    const tabB = screen.getByRole("tab", { name: "Вкладка B" });
    focus(tabB);
    fireEvent.keyDown(tabB, { key: " " });

    expect(tabB.getAttribute("aria-selected")).toBe("true");
  });

  it("jumps to the last tab on End and the first on Home", async () => {
    render(<ThreeTabs />);

    const tabA = screen.getByRole("tab", { name: "Вкладка A" });
    const tabC = screen.getByRole("tab", { name: "Вкладка C" });
    focus(tabA);
    fireEvent.keyDown(tabA, { key: "End" });

    // The last tab is disabled, but Base UI still moves roving focus onto it
    // (04 M-05's disabled tab is perceivable, not removed from the sequence).
    await waitFor(() => {
      expect(document.activeElement).toBe(tabC);
    });

    fireEvent.keyDown(tabC, { key: "Home" });
    await waitFor(() => {
      expect(document.activeElement).toBe(tabA);
    });
  });

  it("marks the disabled tab and keeps a click on it from selecting", () => {
    render(<ThreeTabs />);

    const tabC = screen.getByRole("tab", { name: "Вкладка C" });
    expect(tabC.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(tabC);
    expect(tabC.getAttribute("aria-selected")).toBe("false");
  });

  it("size classes come from the control-height tokens, not a literal", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTab value="a" size="compact">
            Compact
          </TabsTab>
          <TabsTab value="b" size="regular">
            Regular
          </TabsTab>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole("tab", { name: "Compact" }).className).toContain("h-control-h-sm");
    expect(screen.getByRole("tab", { name: "Regular" }).className).toContain("h-control-h-md");
  });
});

function SingleTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger render={<IconButton aria-label="Настройки" icon={<span>icon</span>} />} />
      <TooltipPopup>Настройки проекта</TooltipPopup>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("is not in the document until it opens", () => {
    render(<SingleTooltip />);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows on focus-visible and wires aria-describedby to the popup's id", async () => {
    render(<SingleTooltip />);

    const trigger = screen.getByRole("button", { name: "Настройки" });
    focus(trigger);

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe("Настройки проекта");
    expect(tooltip.getAttribute("data-slot")).toBe("tooltip-popup");
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.getAttribute("id"));
  });

  it("closes on Escape", async () => {
    render(<SingleTooltip />);

    const trigger = screen.getByRole("button", { name: "Настройки" });
    focus(trigger);
    const tooltip = await screen.findByRole("tooltip");

    fireEvent.keyDown(tooltip, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });

  it("does not trap focus — the trigger, not the popup, stays the active element", async () => {
    render(<SingleTooltip />);

    const trigger = screen.getByRole("button", { name: "Настройки" });
    focus(trigger);
    await screen.findByRole("tooltip");

    expect(document.activeElement).toBe(trigger);
  });

  it("merges an explicit aria-describedby with the popup's own", async () => {
    render(
      <Tooltip>
        <TooltipTrigger
          aria-describedby="external-hint"
          render={<IconButton aria-label="Настройки" icon={<span>icon</span>} />}
        />
        <TooltipPopup>Настройки проекта</TooltipPopup>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Настройки" });
    focus(trigger);
    const tooltip = await screen.findByRole("tooltip");
    const describedBy = trigger.getAttribute("aria-describedby") ?? "";

    expect(describedBy.split(" ")).toContain("external-hint");
    expect(describedBy.split(" ")).toContain(tooltip.getAttribute("id"));
  });
});
