import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/registry/cubby/ui/button";
import { Icon } from "@/registry/cubby/ui/icon";

/**
 * The four variants, each carrying the label it would really carry: the variant is
 * chosen by what the action does, not by how it should look.
 */
export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" iconStart={<Icon icon={PlusSignIcon} />}>
        New task
      </Button>
      <Button variant="secondary">Duplicate</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="text">Cancel</Button>
    </div>
  );
}
