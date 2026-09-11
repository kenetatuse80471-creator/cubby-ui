import { SiteHeaderBar } from "@/components/site-header-bar";
import { fetchStarCount } from "@/site/github";

/**
 * The header is split in two on purpose: the star count is a network read that has
 * to happen on the server while the site is built, and the bar itself needs the
 * browser (a scroll listener, the active route). This half is the build-time half —
 * everything it knows is baked into the HTML.
 *
 * `fetchStarCount` never throws and never guesses: no network, a rate limit, a
 * renamed repository all arrive here as `null`, and the bar then renders a plain
 * GitHub link with no number.
 */
export async function SiteHeader() {
  const stars = await fetchStarCount();

  return <SiteHeaderBar stars={stars} />;
}
