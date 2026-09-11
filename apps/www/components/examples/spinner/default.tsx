import { Spinner } from "@/registry/cubby/ui/spinner";

/**
 * The wait belongs to a place, not to empty air: a row inside the task list,
 * filled just enough to read as part of the page, while the tasks are still
 * on their way in.
 */
export default function SpinnerDefault() {
  return (
    <div className="flex items-center gap-2 rounded-role-card bg-film-1 px-4 py-3">
      <Spinner label="Loading tasks" />
      <span className="text-ui-md-regular text-text-2">Loading tasks…</span>
    </div>
  );
}
