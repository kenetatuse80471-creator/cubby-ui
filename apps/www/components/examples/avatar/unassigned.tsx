import { Avatar } from "@/registry/cubby/ui/avatar";

/**
 * The empty state Avatar's own author calls the point: no photo, no
 * initials, just the outline — «nobody is assigned» is common enough to
 * need a circle of its own, not a gap where one should be. `variant="neutral"`
 * is spelled out because the empty state's transparent fill cannot cancel the
 * default variant's gradient image underneath it — see the report.
 */
export default function AvatarUnassigned() {
  return (
    <div className="flex items-center gap-2">
      <Avatar variant="neutral" />
      <span className="text-ui-md-regular text-text-2">Unassigned</span>
    </div>
  );
}
