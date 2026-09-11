"use client";

import { Button } from "@/registry/cubby/ui/button";
import { Modal, ModalClose, ModalTrigger } from "@/registry/cubby/ui/modal";
import { TextInput } from "@/registry/cubby/ui/text-input";

/**
 * The other half of what a modal is for: not a warning but a short creation
 * form — one field, and a primary action that makes something new instead
 * of removing it.
 */
export default function ModalCreate() {
  return (
    <Modal
      title="New board"
      closeLabel="Close"
      trigger={<ModalTrigger render={<Button variant="primary">New board</Button>} />}
      footer={
        <>
          <ModalClose render={<Button variant="text">Cancel</Button>} />
          <ModalClose render={<Button variant="primary">Create</Button>} />
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <span className="text-ui-md text-text-1">Board name</span>
        <TextInput aria-label="Board name" placeholder="e.g. Launch" />
      </div>
    </Modal>
  );
}
