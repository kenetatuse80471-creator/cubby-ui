/**
 * The three surfaces of batch B are the first components with state, so they
 * are the first ones tested in a DOM rather than in a string.
 *
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/registry/cubby/ui/button";
import {
  ContextActionMenu,
  type ActionDescriptor,
} from "@/registry/cubby/ui/context-action-menu";
import { Modal, ModalClose } from "@/registry/cubby/ui/modal";
import { SnackbarProvider, useSnackbar } from "@/registry/cubby/ui/snackbar";

describe("Modal", () => {
  it("renders a dialog named by its title", () => {
    render(
      <Modal open title="Новая доска" closeLabel="Закрыть">
        Тело модалки
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Новая доска" })).toBeTruthy();
    expect(screen.getByText("Тело модалки")).toBeTruthy();
  });

  it("gives the close button the label it was handed", () => {
    render(
      <Modal open title="Новая доска" closeLabel="Закрыть">
        Тело
      </Modal>,
    );

    const close = screen.getByRole("button", { name: "Закрыть" });
    expect(close.getAttribute("data-slot")).toBe("modal-close");
  });

  it("asks to close on Escape", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Новая доска" closeLabel="Закрыть">
        Тело
      </Modal>,
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });

  it("asks to close when a ModalClose in the footer is pressed", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open
        onOpenChange={onOpenChange}
        title="Новая доска"
        closeLabel="Закрыть"
        footer={<ModalClose render={<Button>Отмена</Button>} />}
      >
        Тело
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));

    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });

  it("scrolls the body and nothing else", () => {
    render(
      <Modal open title="Новая доска" closeLabel="Закрыть" footer={<Button>ОК</Button>}>
        Тело
      </Modal>,
    );

    const popup = screen.getByRole("dialog");
    const body = popup.querySelector('[data-slot="modal-body"]');

    expect(popup.className).toContain("overflow-hidden");
    expect(body?.className).toContain("overflow-y-auto");
  });
});

function SnackbarHarness() {
  const { notify } = useSnackbar();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          notify({
            kind: "undo",
            message: "Задача выполнена",
            actionLabel: "Отменить",
            onAction: () => {},
            closeLabel: "Закрыть",
          })
        }
      >
        undo
      </button>
      <button
        type="button"
        onClick={() => notify({ kind: "quiet", message: "Настройка сохранена" })}
      >
        quiet
      </button>
      <button
        type="button"
        onClick={() =>
          notify({
            kind: "error",
            message: "Не удалось сохранить",
            actionLabel: "Повторить",
            onAction: () => {},
            closeLabel: "Закрыть",
          })
        }
      >
        error
      </button>
    </div>
  );
}

function visibleSnackbars() {
  return document.querySelectorAll('[data-slot="snackbar"]:not([data-ending-style])');
}

describe("Snackbar", () => {
  it("shows one snackbar, and the next one displaces it", async () => {
    render(
      <SnackbarProvider>
        <SnackbarHarness />
      </SnackbarProvider>,
    );

    fireEvent.click(screen.getByText("undo"));
    expect(screen.getByText("Задача выполнена")).toBeTruthy();

    fireEvent.click(screen.getByText("quiet"));
    await waitFor(() => {
      expect(visibleSnackbars().length).toBe(1);
    });
    expect(screen.getByText("Настройка сохранена")).toBeTruthy();
    expect(screen.queryByText("Задача выполнена")).toBeNull();
  });

  it("puts an action button on an undo snackbar", () => {
    render(
      <SnackbarProvider>
        <SnackbarHarness />
      </SnackbarProvider>,
    );

    fireEvent.click(screen.getByText("undo"));

    const action = screen.getByRole("button", { name: "Отменить" });
    expect(action.getAttribute("data-slot")).toBe("snackbar-action");

    // Base UI keeps the × out of the accessibility tree until the viewport is
    // hovered or the button itself takes focus; it is tabbable the whole time.
    const close = document.querySelector<HTMLElement>('[data-slot="snackbar-close"]');
    expect(close?.getAttribute("aria-label")).toBe("Закрыть");
    expect(close?.getAttribute("tabindex")).toBe("0");
    if (close) fireEvent.focus(close);
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeTruthy();
  });

  it("never dismisses an error on its own, and dismisses a quiet one", async () => {
    vi.useFakeTimers();
    try {
      render(
        <SnackbarProvider>
          <SnackbarHarness />
        </SnackbarProvider>,
      );

      fireEvent.click(screen.getByText("error"));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30_000);
      });
      expect(screen.getByText("Не удалось сохранить")).toBeTruthy();

      fireEvent.click(screen.getByText("quiet"));
      expect(screen.getByText("Настройка сохранена")).toBeTruthy();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3_100);
      });
      expect(screen.queryByText("Настройка сохранена")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

const menuActions = (spy: () => void): ActionDescriptor[] => [
  { id: "rename", label: "Переименовать", onAction: spy },
  { id: "copy", label: "Дублировать", disabled: true, onAction: () => {} },
  { id: "delete", label: "Удалить", destructive: true, onAction: () => {} },
];

describe("ContextActionMenu", () => {
  it("announces itself as a menu trigger", () => {
    render(<ContextActionMenu ariaLabel="Действия с доской" actions={menuActions(() => {})} />);

    const trigger = screen.getByRole("button", { name: "Действия с доской" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("opens a menu with its items on click", async () => {
    render(<ContextActionMenu ariaLabel="Действия с доской" actions={menuActions(() => {})} />);

    fireEvent.click(screen.getByRole("button", { name: "Действия с доской" }));

    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("Переименовать")).toBeTruthy();
    expect(within(menu).getByText("Удалить")).toBeTruthy();
  });

  it("keeps the destructive group behind a separator", async () => {
    render(<ContextActionMenu ariaLabel="Действия с доской" actions={menuActions(() => {})} />);

    fireEvent.click(screen.getByRole("button", { name: "Действия с доской" }));
    const menu = await screen.findByRole("menu");

    const nodes = Array.from(
      menu.querySelectorAll(
        '[data-slot="context-action-menu-separator"], [data-slot="context-action-menu-item"]',
      ),
    );
    const separatorIndex = nodes.findIndex(
      (node) => node.getAttribute("data-slot") === "context-action-menu-separator",
    );
    const destructiveIndex = nodes.findIndex((node) => node.textContent === "Удалить");

    expect(separatorIndex).toBeGreaterThan(-1);
    expect(destructiveIndex).toBeGreaterThan(separatorIndex);
    expect(nodes[separatorIndex]?.getAttribute("role")).toBe("separator");
  });

  it("marks a disabled item as disabled", async () => {
    render(<ContextActionMenu ariaLabel="Действия с доской" actions={menuActions(() => {})} />);

    fireEvent.click(screen.getByRole("button", { name: "Действия с доской" }));
    await screen.findByRole("menu");

    const item = screen.getByText("Дублировать").closest('[data-slot="context-action-menu-item"]');
    expect(item?.getAttribute("aria-disabled")).toBe("true");
  });

  it("runs the action and closes", async () => {
    const spy = vi.fn();
    render(<ContextActionMenu ariaLabel="Действия с доской" actions={menuActions(spy)} />);

    fireEvent.click(screen.getByRole("button", { name: "Действия с доской" }));
    await screen.findByRole("menu");

    fireEvent.click(screen.getByText("Переименовать"));

    expect(spy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
