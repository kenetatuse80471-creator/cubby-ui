import { Avatar } from "@/registry/cubby/ui/avatar";

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function AvatarDefault() {
  return (
    <div className="flex items-center gap-2">
      <Avatar name="Sergey Orshak" initials="SO" />
      <span className="text-ui-md text-text-1">Sergey Orshak</span>
    </div>
  );
}
