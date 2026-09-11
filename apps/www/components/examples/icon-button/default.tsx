import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function IconButtonDefault() {
  return <IconButton aria-label="Rename task" icon={<Icon icon={PencilEdit02Icon} />} />;
}
