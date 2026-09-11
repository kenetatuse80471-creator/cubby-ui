import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/registry/cubby/ui/icon";

/**
 * A task's due date the way it sits in a row: the calendar glyph is the
 * reason the date needs no separate label — the icon carries the meaning,
 * not the text next to it.
 */
export default function IconDefault() {
  return (
    <span className="inline-flex items-center gap-1 text-ui-md-regular text-text-2">
      <Icon icon={Calendar03Icon} />
      Due Friday
    </span>
  );
}
