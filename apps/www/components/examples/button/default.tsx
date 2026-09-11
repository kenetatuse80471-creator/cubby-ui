import { Button } from "@/registry/cubby/ui/button";

/**
 * The footer of a form. One primary action per surface and one way back — which
 * is the whole of the button's job, and the shape it takes almost every time.
 */
export default function ButtonDefault() {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="text">Cancel</Button>
      <Button variant="primary">Create task</Button>
    </div>
  );
}
