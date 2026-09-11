import { Tag } from "@/registry/cubby/ui/tag";

/**
 * The NEW marker. Whether it shows at all is `site/component-status.ts`'s decision.
 *
 * Monochrome, and deliberately so. It used to be `tone="green" dot` — a status
 * colour borrowed from the product's stage palette, where green means «done», not
 * «recent». Two things were wrong with that. The smaller one: on a shell whose
 * entire argument is surfaces and alpha strokes rather than colour (§5), one
 * saturated chip is the loudest thing on the page and the eye goes to it instead of
 * to the component being demonstrated. The larger one: every item in the registry
 * launched on the same day, so **19 of 19 rows carry this badge right now** — a
 * wall of green that marks nothing, because a marker only means something when it
 * is on some things and not others.
 *
 * `tone="neutral"` keeps the same chip — same primitive, same height, same radius —
 * in the text's own grey. It reads as a label rather than an alarm, and when the
 * week runs out and the badge starts appearing on one row at a time, it will still
 * be the right weight for the job.
 */
export function NewBadge() {
  return <Tag tone="neutral">New</Tag>;
}
