import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/registry/cubby/ui/button";
import { EmptyState } from "@/registry/cubby/ui/empty-state";

/**
 * An empty board is not an error: the icon is muted, the copy names the
 * situation without blame, and the one action is the same button that
 * creates every other task on it.
 */
export default function EmptyStateDefault() {
  return (
    <EmptyState
      icon={PlusSignIcon}
      title="No tasks yet"
      description="The first task is usually the one you are avoiding."
      action={<Button variant="primary">New task</Button>}
    />
  );
}
