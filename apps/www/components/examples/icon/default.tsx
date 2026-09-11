import { Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/registry/cubby/ui/icon";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function IconDefault() {
  return (
    <span className="inline-flex items-center gap-2 text-ui-md text-text-1">
      <Icon icon={Search01Icon} />
      Search
    </span>
  );
}
