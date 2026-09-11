import { Tag } from "@/registry/cubby/ui/tag";

/** The NEW marker. Whether it shows at all is `site/component-status.ts`'s decision. */
export function NewBadge() {
  return (
    <Tag tone="green" dot>
      New
    </Tag>
  );
}
