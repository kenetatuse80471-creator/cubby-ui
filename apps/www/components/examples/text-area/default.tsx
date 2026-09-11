import { TextArea } from "@/registry/cubby/ui/text-area";

/**
 * The second field of "New task": three lines to start and room to grow,
 * because a description is not a title and should not be squeezed into one
 * line to match it.
 */
export default function TextAreaDefault() {
  return (
    <div className="flex w-comp-auth-card flex-col gap-2">
      <span className="text-ui-md text-text-1">Description</span>
      <TextArea aria-label="Description" placeholder="What needs to happen, and why?" />
    </div>
  );
}
