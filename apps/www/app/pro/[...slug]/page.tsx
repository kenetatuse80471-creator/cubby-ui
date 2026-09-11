import { notFound } from "next/navigation";

/**
 * `/pro/*` — the paid half of the registry, reserved from the first day.
 *
 * There is no access check here and there is not meant to be one: the point is that
 * the path is taken, so adding Pro later never means re-architecting the routes (a
 * decision recorded in `apps/www/README.md`). Every request answers 404 with the
 * message in `app/pro/not-found.tsx`.
 */
export default async function ProPage({ params }: { params: Promise<{ slug: string[] }> }) {
  await params;
  notFound();
}
