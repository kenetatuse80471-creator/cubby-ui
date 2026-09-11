"use client";

import { Button } from "@/registry/cubby/ui/button";
import { Modal, ModalClose, ModalTrigger } from "@/registry/cubby/ui/modal";

/**
 * The one truly destructive control in the library: the task count makes
 * the cost concrete, and Cancel sits first so the safe choice is the closer
 * one to reach.
 */
export default function ModalDefault() {
  return (
    <Modal
      title="Delete board"
      description="Every task on it goes with it. This cannot be undone."
      closeLabel="Close"
      kind="destructive"
      trigger={<ModalTrigger render={<Button variant="danger">Delete board</Button>} />}
      footer={
        <>
          <ModalClose render={<Button variant="text">Cancel</Button>} />
          <ModalClose render={<Button variant="danger">Delete</Button>} />
        </>
      }
    >
      <p className="text-ui-md-regular text-text-body">The board «Launch» holds 14 tasks.</p>
    </Modal>
  );
}
