import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { buttonVariants } from "@/registry/cubby/ui/button";
import { EmptyState } from "@/registry/cubby/ui/empty-state";

/** The 404 of `/pro/*`: the route exists, the thing behind it does not yet. */
export default function ProNotFound() {
  return (
    <div className="mx-auto flex max-w-site-content flex-col px-5 py-64">
      <EmptyState
        icon={SquareLock02Icon}
        title="Pro is not available yet"
        description="This path is reserved for the paid part of the registry. Everything published so far is free and lives under /components."
        action={
          <Link href="/components" className={buttonVariants({ variant: "primary" })}>
            Browse the components
          </Link>
        }
      />
    </div>
  );
}
