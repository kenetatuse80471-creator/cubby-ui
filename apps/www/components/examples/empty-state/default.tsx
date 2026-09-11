import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/registry/cubby/ui/button";
import { EmptyState } from "@/registry/cubby/ui/empty-state";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
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
