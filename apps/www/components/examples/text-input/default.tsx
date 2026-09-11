import { TextInput } from "@/registry/cubby/ui/text-input";

/**
 * The first field of "New task": nothing before it needs to be decided, so
 * it carries no icon and no clear button — just a title, typed the moment
 * the form opens.
 */
export default function TextInputDefault() {
  return (
    <div className="flex w-comp-auth-card flex-col gap-2">
      <span className="text-ui-md text-text-1">Title</span>
      <TextInput aria-label="Title" placeholder="e.g. Redesign the onboarding flow" />
    </div>
  );
}
