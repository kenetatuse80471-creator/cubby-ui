/*
 * A client module, and not by choice: `modalPopupVariants`, `menuPopupVariants` and
 * `menuItemVariants` are exported from components that declare `"use client"`, and a
 * server module may render a client component but may not *call* a function exported
 * from one. Calling them is exactly the point here — it is what keeps these surfaces
 * from being a second copy of the library's classes — so this file crosses the
 * boundary instead. Nothing in it holds state; the cost is bytes, not behaviour.
 */
"use client";

import {
  Cancel01Icon,
  Delete02Icon,
  Link01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Button } from "@/registry/cubby/ui/button";
import {
  menuItemVariants,
  menuPopupVariants,
} from "@/registry/cubby/ui/context-action-menu";
import { Divider } from "@/registry/cubby/ui/divider";
import { Icon, type IconSvgElement } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import {
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  modalPopupVariants,
} from "@/registry/cubby/ui/modal";
import { Snackbar } from "@/registry/cubby/ui/snackbar";

/**
 * Three components of the grid open into a portal at the window level, so their
 * example renders as a single button until somebody clicks it. A button is not what
 * the card is about, and "click to see it" is not a thing a card can say.
 *
 * So they are drawn in place, **out of the portal, from the components' own exported
 * parts and classes** — `modalPopupVariants` with the real `Modal*` slots,
 * `menuPopupVariants` with `menuItemVariants`, and `Snackbar` itself, which renders
 * statically when it is handed no live toast (its own doc comment says so; that is
 * how the library's tests and demos use it). Nothing here restates a class the
 * library owns: change the modal's radius in the registry and this changes with it.
 *
 * The pattern is the registry's, not a new one —
 * `packages/registry/src/demos/{modal,context-action-menu}-demo.tsx` draw their open
 * states exactly this way and for exactly this reason.
 *
 * What each card shows is the state that makes the component worth having, which for
 * two of the three is the moment *after* the action: the modal open on the one
 * genuinely destructive decision in the library, the snackbar holding the way back
 * from it.
 */

/** The modal, open. `w-modal-w-sm` because the surface's own `w-full` needs a box
 *  to fill — in the app that job belongs to the viewport. */
export function ModalStage() {
  return (
    <div className="w-modal-w-sm">
      <div data-slot="modal" data-kind="destructive" className={modalPopupVariants({ size: "sm" })}>
        <ModalHeader>
          <div className="flex min-w-0 flex-col gap-1">
            <ModalTitle>Delete board</ModalTitle>
            <ModalDescription>
              Every task on it goes with it. This cannot be undone.
            </ModalDescription>
          </div>
          <IconButton
            data-slot="modal-close"
            variant="text"
            size="compact"
            aria-label="Close"
            icon={<Icon icon={Cancel01Icon} />}
          />
        </ModalHeader>
        <Divider />
        <ModalBody>
          <p className="text-ui-md-regular text-text-body">The board «Launch» holds 14 tasks.</p>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button variant="text">Cancel</Button>
          <Button variant="danger">Delete</Button>
        </ModalFooter>
      </div>
    </div>
  );
}

/** The snackbar that the modal above leaves behind. */
export function SnackbarStage() {
  return (
    <Snackbar
      kind="undo"
      message="Board «Launch» deleted"
      actionLabel="Undo"
      closeLabel="Close"
    />
  );
}

function StaticMenuItem({
  icon,
  children,
  tone = "default",
  highlighted = false,
}: {
  icon: IconSvgElement;
  children: ReactNode;
  tone?: "default" | "destructive";
  /** The row under the cursor. A hover state cannot be hovered in a still card. */
  highlighted?: boolean;
}) {
  return (
    <div
      data-slot="context-action-menu-item"
      className={cn(menuItemVariants({ tone }), highlighted && "bg-film-2")}
    >
      <span
        aria-hidden
        className="flex size-icon-md shrink-0 items-center justify-center text-text-2"
      >
        <Icon icon={icon} />
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </div>
  );
}

/** The row-level «…» menu, open, over the row it belongs to. */
export function ContextActionMenuStage() {
  return (
    <div className="flex w-comp-popover-panel flex-col items-stretch gap-1">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 flex-1 truncate text-ui-md text-text-1">
          Redesign onboarding flow
        </span>
        <IconButton
          variant="text"
          size="compact"
          selected
          aria-label="Task actions"
          icon={<Icon icon={MoreHorizontalIcon} />}
        />
      </div>
      <div className="flex justify-end">
        <div data-slot="context-action-menu-popup" className={menuPopupVariants()}>
          <StaticMenuItem icon={PencilEdit02Icon}>Rename</StaticMenuItem>
          <StaticMenuItem icon={Link01Icon} highlighted>
            Copy link
          </StaticMenuItem>
          <Divider data-slot="context-action-menu-separator" decorative={false} className="my-1" />
          <StaticMenuItem icon={Delete02Icon} tone="destructive">
            Delete
          </StaticMenuItem>
        </div>
      </div>
    </div>
  );
}
