import { Avatar } from "@/registry/cubby/ui/avatar";

/**
 * What the empty state is for: no photo, no initials, just the outline —
 * "nobody is assigned" happens often enough to deserve a circle of its own
 * rather than a gap where one should be. No props at all; the component
 * falls back on its own.
 */
export default function AvatarUnassigned() {
  return (
    <div className="flex items-center gap-2">
      <Avatar />
      <span className="text-ui-md-regular text-text-2">Unassigned</span>
    </div>
  );
}
