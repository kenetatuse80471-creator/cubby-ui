import { Alert02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { buttonVariants } from "@/registry/cubby/ui/button";
import { EmptyState } from "@/registry/cubby/ui/empty-state";

/**
 * The site's 404, built out of the library's own `EmptyState` and `Button`.
 *
 * `py-64`, not `py-20`: the spacing scale here is named after its own values, not
 * after a multiplier, so `py-20` compiles to nothing at all (there is no
 * `--spacing-20`). Same correction in `app/pro/not-found.tsx`.
 *
 * The action is a `Link` wearing `buttonVariants()` rather than a `Button` around a
 * link: `<button><a></a></button>` is invalid HTML, and what this control does is
 * navigate.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-site-content flex-col px-4 py-64">
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
