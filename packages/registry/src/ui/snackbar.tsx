"use client";

import { useCallback, type ComponentProps, type ReactNode } from "react";
import { Toast } from "@base-ui/react/toast";
import { cva, type VariantProps } from "class-variance-authority";
import { Alert02Icon, Cancel01Icon, CheckmarkCircle02Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { Button } from "@/registry/cubby/ui/button";
import { Icon, type IconSvgElement } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";

/**
 * How long each kind lives, in milliseconds — behaviour, not style, so it is
 * a number in JS and not a class. 5000 is `--motion-snackbar`; 3000 has no
 * token yet (see the report); 0 means «until dismissed by hand».
 */
const SNACKBAR_TIMEOUT_MS: Record<SnackbarKind, number> = {
  undo: 5000,
  quiet: 3000,
  error: 0,
};

/** 04 S-04: the meaning is carried by the icon, never by a coloured fill. */
const SNACKBAR_ICON: Record<SnackbarKind, IconSvgElement> = {
  undo: CheckmarkCircle02Icon,
  quiet: Tick02Icon,
  error: Alert02Icon,
};

const snackbarBarVariants = cva(
  [
    "relative flex h-row-h-snackbar w-fit max-w-full items-center gap-3 overflow-hidden",
    "rounded-md bg-plate px-4 text-ui-md text-text-on-plate shadow-overlay",
  ],
  {
    variants: {
      kind: {
        undo: "",
        quiet: "",
        error: "",
      },
    },
    defaultVariants: { kind: "quiet" },
  },
);

export type SnackbarKind = "undo" | "quiet" | "error";

/** What `useSnackbar().notify()` accepts. An error must be dismissible. */
export type SnackbarNotice =
  | {
      kind: "error";
      message: ReactNode;
      /** Required here: an error waits for a hand and needs a way out. */
      closeLabel: string;
      actionLabel?: string;
      onAction?: () => void;
    }
  | {
      kind?: "undo" | "quiet";
      message: ReactNode;
      closeLabel?: string;
      actionLabel?: string;
      onAction?: () => void;
    };

/** Everything of a notice that the toast object carries for us. */
interface SnackbarData {
  actionLabel?: string;
  onAction?: () => void;
  closeLabel?: string;
}

export interface SnackbarProps
  extends Omit<ComponentProps<"div">, "title" | "onClick">,
    VariantProps<typeof snackbarBarVariants> {
  /** The sentence. One sentence — the bar is 44 high and does not wrap. */
  message?: ReactNode;
  /** One word: «Отменить», «Открыть», «Повторить». */
  actionLabel?: string;
  onAction?: () => void;
  /** Renders the × when given; a quiet confirmation without an action has none. */
  closeLabel?: string;
  onClose?: () => void;
  /** `false` drops the leading glyph. */
  showIcon?: boolean;
  /**
   * A live toast from `useSnackbar`. With it the bar becomes a `Toast.Root`
   * (timers, swipe, pause on hover); without it the very same bar renders
   * statically — which is how the demos and the tests use it.
   */
  toast?: Toast.Root.ToastObject<SnackbarData>;
}

/**
 * `[stripe 3px for an error][Icon 16][message][action][× 28]` on a light plate,
 * 44 high, radius 8, bottom left of the window.
 */
export function Snackbar({
  toast,
  kind,
  message,
  actionLabel,
  onAction,
  closeLabel,
  onClose,
  showIcon = true,
  className,
  ...props
}: SnackbarProps) {
  const live = toast !== undefined;
  const resolvedKind: SnackbarKind = (toast?.type as SnackbarKind | undefined) ?? kind ?? "quiet";
  const resolvedMessage = live ? toast.title : message;
  const resolvedActionLabel = actionLabel ?? toast?.data?.actionLabel;
  const resolvedCloseLabel = closeLabel ?? toast?.data?.closeLabel;

  const actionClassName = cn(
    "shrink-0 text-inherit",
    // cubby-ui-lint-ignore — 03 §8 hover formula (8% towards the plate ink); no token exports this percentage, see 05-gates-report.md
    "hover:bg-[color-mix(in_srgb,var(--plate)_92%,var(--text-on-plate))]",
    // cubby-ui-lint-ignore — 03 §8 pressed-state formula (12% towards the plate ink), same as Button; no token exports this percentage, see 05-gates-report.md
    "active:bg-[color-mix(in_srgb,var(--plate)_88%,var(--text-on-plate))]",
  );
  const closeIcon = <Icon icon={Cancel01Icon} />;

  const bar = (
    <div
      data-slot="snackbar-bar"
      className={cn(snackbarBarVariants({ kind: resolvedKind }), className)}
    >
      {resolvedKind === "error" ? (
        <span
          data-slot="snackbar-stripe"
          aria-hidden
          className="absolute inset-y-0 left-0 w-comp-snackbar-stripe bg-danger"
        />
      ) : null}
      {showIcon ? (
        <Icon data-slot="snackbar-icon" icon={SNACKBAR_ICON[resolvedKind]} className="shrink-0" />
      ) : null}
      {live ? (
        <Toast.Title
          render={<span data-slot="snackbar-message" className="min-w-0 flex-1" />}
        >
          {resolvedMessage}
        </Toast.Title>
      ) : (
        <span data-slot="snackbar-message" className="min-w-0 flex-1">
          {resolvedMessage}
        </span>
      )}
      {resolvedActionLabel ? (
        live ? (
          <Toast.Action
            onClick={onAction}
            render={
              <Button data-slot="snackbar-action" variant="text" size="compact" className={actionClassName} />
            }
          >
            {resolvedActionLabel}
          </Toast.Action>
        ) : (
          <Button
            data-slot="snackbar-action"
            variant="text"
            size="compact"
            className={actionClassName}
            onClick={onAction}
          >
            {resolvedActionLabel}
          </Button>
        )
      ) : null}
      {resolvedCloseLabel ? (
        live ? (
          <Toast.Close
            render={
              <IconButton
                data-slot="snackbar-close"
                variant="text"
                size="compact"
                aria-label={resolvedCloseLabel}
                icon={closeIcon}
                className={actionClassName}
              />
            }
          />
        ) : (
          <IconButton
            data-slot="snackbar-close"
            variant="text"
            size="compact"
            aria-label={resolvedCloseLabel}
            icon={closeIcon}
            className={actionClassName}
            onClick={onClose}
          />
        )
      ) : null}
    </div>
  );

  const rootClassName = cn(
    "w-fit max-w-full transition-opacity duration-(--motion-base) ease-standard",
    "data-starting-style:opacity-0 data-ending-style:opacity-0",
    "motion-reduce:transition-none",
  );

  if (live) {
    return (
      <Toast.Root data-slot="snackbar" toast={toast} className={rootClassName} {...props}>
        {bar}
      </Toast.Root>
    );
  }

  return (
    <div data-slot="snackbar" role="status" className={rootClassName} {...props}>
      {bar}
    </div>
  );
}

function SnackbarList() {
  const { toasts, close } = Toast.useToastManager<SnackbarData>();

  return (
    <>
      {toasts
        // `limit: 1` only marks the older toast; the spec wants it gone.
        .filter((toast) => !toast.limited)
        .map((toast) => (
          <Snackbar
            key={toast.id}
            toast={toast}
            onAction={() => {
              toast.data?.onAction?.();
              close(toast.id);
            }}
          />
        ))}
    </>
  );
}

export interface SnackbarProviderProps {
  children?: ReactNode;
  /** Renders the viewport into this element instead of `<body>`. */
  container?: Toast.Portal.Props["container"];
  /** Extra classes for the viewport — bottom left of the window by default. */
  viewportClassName?: string;
}

/**
 * One snackbar at a time: `limit: 1` plus `notify` closing whatever is on
 * screen, so a queue can never pile up (04 S-04, артборд 13г). The viewport
 * pauses every timer while it is hovered or holds focus — that part is Base UI.
 */
export function SnackbarProvider({
  children,
  container,
  viewportClassName,
}: SnackbarProviderProps) {
  return (
    <Toast.Provider limit={1}>
      {children}
      <Toast.Portal container={container}>
        <Toast.Viewport
          data-slot="snackbar-viewport"
          className={cn(
            "fixed bottom-5 left-5 z-(--z-snackbar)",
            "flex max-w-comp-snackbar-max flex-col items-start gap-2",
            viewportClassName,
          )}
        >
          <SnackbarList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

export interface UseSnackbarReturn {
  /** Shows a snackbar, displacing the one on screen. Returns its id. */
  notify: (notice: SnackbarNotice) => string;
  /** Closes one snackbar, or all of them when called without an id. */
  dismiss: (id?: string) => void;
}

/** Has to be called under a `SnackbarProvider`. */
export function useSnackbar(): UseSnackbarReturn {
  const { add, close } = Toast.useToastManager<SnackbarData>();

  const notify = useCallback(
    (notice: SnackbarNotice) => {
      const kind = notice.kind ?? "quiet";
      // Never a stack: what is on screen leaves before the new one arrives.
      close();
      return add({
        type: kind,
        title: notice.message,
        timeout: SNACKBAR_TIMEOUT_MS[kind],
        data: {
          actionLabel: notice.actionLabel,
          onAction: notice.onAction,
          closeLabel: notice.closeLabel,
        },
      });
    },
    [add, close],
  );

  return { notify, dismiss: close };
}

export { snackbarBarVariants, SNACKBAR_TIMEOUT_MS };
