import { Alert02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { buttonVariants } from "@/registry/cubby/ui/button";
import { EmptyState } from "@/registry/cubby/ui/empty-state";

/**
 * The site's 404, built out of the library's own `EmptyState` and `Button`.
 *
 * The action is a `Link` wearing `buttonVariants()` rather than a `Button` around a
 * link: `<button><a></a></button>` is invalid HTML, and what this control does is
 * navigate.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-site-content flex-col px-5 py-20">
      <EmptyState
        icon={Alert02Icon}
        title="No such page"
        description="The link is either older than the site or was never right. The catalogue is one click away."
        action={
          <Link href="/components" className={buttonVariants({ variant: "primary" })}>
            Browse the components
          </Link>
        }
      />
    </div>
  );
}
