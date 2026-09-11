import { Tag } from "@/registry/cubby/ui/tag";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
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
