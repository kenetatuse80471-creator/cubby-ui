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
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function SnackbarDefault() {
  return (
    <SnackbarProvider>
      <DeleteButton />
    </SnackbarProvider>
  );
}
