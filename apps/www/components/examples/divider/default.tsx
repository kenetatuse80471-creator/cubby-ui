import { Divider } from "@/registry/cubby/ui/divider";

/**
 * A task panel's two halves: what the task is, and what happened to it
 * since. A gap alone reads as one continuous block — only a line makes it
 * unmistakably two.
 */
export default function DividerDefault() {
  return (
    <div className="flex w-comp-popover-panel flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-ui-md text-text-1">Redesign onboarding flow</span>
        <span className="text-caption-sm text-text-2">Assigned to Mira Chen · Due Friday</span>
      </div>
      <Divider />
      <div className="flex flex-col gap-1">
        <span className="text-ui-md text-text-1">Activity</span>
        <span className="text-caption-sm text-text-2">Mira moved this to In progress</span>
      </div>
    </div>
  );
}
