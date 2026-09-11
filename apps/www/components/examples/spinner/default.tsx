import { Spinner } from "@/registry/cubby/ui/spinner";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function SpinnerDefault() {
  return (
    <div className="flex items-center gap-3">
      <Spinner label="Loading tasks" />
      <span className="text-ui-md-regular text-text-2">Loading tasks…</span>
    </div>
  );
}
