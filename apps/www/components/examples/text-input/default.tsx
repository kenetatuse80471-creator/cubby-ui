import { Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/registry/cubby/ui/icon";
import { TextInput } from "@/registry/cubby/ui/text-input";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function TextInputDefault() {
  return (
    <TextInput
      aria-label="Search tasks"
      placeholder="Search tasks"
      iconStart={<Icon icon={Search01Icon} />}
    />
  );
}
