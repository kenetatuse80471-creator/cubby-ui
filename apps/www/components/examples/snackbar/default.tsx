"use client";

import { Button } from "@/registry/cubby/ui/button";
import { SnackbarProvider, useSnackbar } from "@/registry/cubby/ui/snackbar";

function DeleteButton() {
  const { notify } = useSnackbar();

  return (
    <Button
      variant="secondary"
      onClick={() =>
        notify({
          kind: "undo",
          message: "Task moved to trash",
          actionLabel: "Undo",
          onAction: () => undefined,
        })
      }
    >
      Delete task
    </Button>
  );
}

/**
 * The moment right after a destructive action: the task is already gone, and
 * the one way back is the same bar that confirms it happened, not a second
 * dialog asking first.
 */
export default function SnackbarDefault() {
  return (
    <SnackbarProvider>
      <DeleteButton />
    </SnackbarProvider>
  );
}
