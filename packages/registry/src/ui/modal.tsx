"use client";

import type { ComponentProps, ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { Divider } from "@/registry/cubby/ui/divider";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";

const modalPopupVariants = cva(
  [
    // Height is fit by content: the popup declares no minimum, only a cap of
    // the viewport it sits in (04 S-01 — a one-field dialog stretched to the
    // height of an editor reads as broken).
    "relative flex max-h-full min-h-0 w-full flex-col overflow-hidden",
    "rounded-role-surface bg-bg-overlay text-text-1 shadow-overlay",
    "transition-opacity duration-(--motion-fast) ease-standard",
    "data-starting-style:opacity-0 data-ending-style:opacity-0",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      size: {
        sm: "max-w-modal-w-sm",
        md: "max-w-modal-w-md",
        lg: "max-w-modal-w-lg",
        xl: "max-w-modal-w-xl",
        "2xl": "max-w-modal-w-2xl",
      },
    },
    defaultVariants: { size: "sm" },
  },
);

export type ModalSize = NonNullable<VariantProps<typeof modalPopupVariants>["size"]>;

/** Only the semantics of the surface; the Danger button itself comes in `footer`. */
export type ModalKind = "default" | "destructive";

/** The band above the body: title, optional description, the close button. */
export function ModalHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-header"
      className={cn("flex shrink-0 items-start justify-between gap-3 px-5 pt-3 pb-4", className)}
      {...props}
    />
  );
}

/** A noun («Новая доска»), never a question — 04 S-01. */
export function ModalTitle({ className, children, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="modal-title"
      className={cn("text-heading-h3 text-text-1", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function ModalDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="modal-description"
      className={cn("text-body-md text-text-2", className)}
      {...props}
    />
  );
}

/** The only scrollable area of the modal. */
export function ModalBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-body"
      className={cn("flex min-h-0 flex-auto flex-col gap-5 overflow-y-auto p-5", className)}
      {...props}
    />
  );
}

/** Secondary first, Primary last; both sit on the right. */
export function ModalFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn("flex shrink-0 items-center justify-end gap-2 px-5 pt-3 pb-4", className)}
      {...props}
    />
  );
}

export type ModalTriggerProps = ComponentProps<typeof Dialog.Trigger>;

/** Opens the modal it is passed to; place it in the `trigger` prop. */
export function ModalTrigger(props: ModalTriggerProps) {
  return <Dialog.Trigger data-slot="modal-trigger" {...props} />;
}

export type ModalCloseProps = ComponentProps<typeof Dialog.Close>;

/** Closes the modal from anywhere inside it — typically the footer «Отмена». */
export function ModalClose(props: ModalCloseProps) {
  return <Dialog.Close data-slot="modal-close" {...props} />;
}

export interface ModalProps extends VariantProps<typeof modalPopupVariants> {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Called on Esc, on a press outside, and on any close control. */
  onOpenChange?: (open: boolean, eventDetails: Dialog.Root.ChangeEventDetails) => void;
  /** Required: it is both the visible heading and the accessible name. */
  title: ReactNode;
  /** One sentence under the title; also the accessible description. */
  description?: ReactNode;
  /** Changes semantics only (`data-kind`), never colour — see the report. */
  kind?: ModalKind;
  /** Required, as in Altis: an icon-only control with no name is mute. */
  closeLabel: string;
  /** `false` leaves Esc, the scrim and the footer as the only ways out. */
  showClose?: boolean;
  /** Buttons of the footer; without it the footer and its divider are gone. */
  footer?: ReactNode;
  /** The `ModalTrigger` that opens this modal, if it is uncontrolled. */
  trigger?: ReactNode;
  /** The body — the only part that scrolls. */
  children?: ReactNode;
  /** Where focus lands when the modal opens. Default: first tabbable element. */
  initialFocus?: Dialog.Popup.Props["initialFocus"];
  /** Where focus returns on close. Default: the element that opened it. */
  finalFocus?: Dialog.Popup.Props["finalFocus"];
  /** Renders the portal into this element instead of `<body>` (demos, docs). */
  container?: Dialog.Portal.Props["container"];
  /** Extra classes for the surface. */
  className?: string;
}

/**
 * Scrim → surface: header, divider, body, divider, footer. Focus trap, Esc,
 * a press on the scrim, focus return and the body scroll lock (with scrollbar
 * compensation) all come from Base UI Dialog; the geometry and the two
 * dividers come from 04 S-01.
 *
 * A modal over a modal is forbidden by the spec: the second level is a
 * `ContextActionMenu` or an inline confirmation.
 */
export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  size,
  kind = "default",
  closeLabel,
  showClose = true,
  footer,
  trigger,
  children,
  initialFocus,
  finalFocus,
  container,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      <Dialog.Portal container={container}>
        <Dialog.Backdrop
          data-slot="modal-backdrop"
          className={cn(
            "fixed inset-0 z-(--z-scrim) bg-scrim",
            "transition-opacity duration-(--motion-fast) ease-standard",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
            "motion-reduce:transition-none",
          )}
        />
        <Dialog.Viewport
          data-slot="modal-viewport"
          className="fixed inset-0 z-(--z-modal) flex items-center justify-center overflow-hidden p-5"
        >
          <Dialog.Popup
            data-slot="modal"
            data-kind={kind}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={cn(modalPopupVariants({ size }), className)}
          >
            <ModalHeader>
              <div className="flex min-w-0 flex-col gap-1">
                <Dialog.Title render={<ModalTitle />}>{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description render={<ModalDescription />}>
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              {showClose ? (
                <Dialog.Close
                  render={
                    <IconButton
                      data-slot="modal-close"
                      variant="text"
                      size="compact"
                      aria-label={closeLabel}
                      icon={<Icon icon={Cancel01Icon} />}
                    />
                  }
                />
              ) : null}
            </ModalHeader>
            <Divider />
            <ModalBody>{children}</ModalBody>
            {footer ? (
              <>
                <Divider />
                <ModalFooter>{footer}</ModalFooter>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { modalPopupVariants };
