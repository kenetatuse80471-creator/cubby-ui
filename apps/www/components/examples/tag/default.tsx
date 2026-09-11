import { Tag } from "@/registry/cubby/ui/tag";

/**
 * Two labels on the same task card: a status wears a dot because it can
 * change under a person's feet, a category does not because it never moves
 * on its own.
 */
export default function TagDefault() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="blue" dot>
        In progress
      </Tag>
      <Tag tone="neutral">Design</Tag>
    </div>
  );
}
