import { Divider } from "@/registry/cubby/ui/divider";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function DividerDefault() {
  return (
    <div className="flex w-full flex-col gap-3">
      <span className="text-ui-md text-text-1">Details</span>
      <Divider />
      <span className="text-ui-md-regular text-text-2">Activity</span>
    </div>
  );
}
