import { REGISTRY_NAMESPACE } from "@/site/site";

/**
 * The star count in the header, read from the public GitHub API while the site is
 * built. Three of the four references show one (§6.2 item 6), and it is the one
 * number on the page that says whether anyone is actually using this.
 *
 * The rule this file exists to enforce: **never print a number nobody measured.**
 * Anything other than a 200 with a numeric `stargazers_count` — no network in the
 * build container, a rate-limited runner (60 requests an hour for an anonymous
 * caller), a renamed repository — returns `null`, and the header renders a plain
 * GitHub link with no count instead of a plausible-looking invention.
 *
 * `revalidate` is a day: `next build` fetches once and every page of the static
 * export carries that value, and a deployment that runs longer than a day refreshes
 * it rather than serving a stale figure forever.
 */
const STAR_REVALIDATE_SECONDS = 86_400;

/** Four seconds: long enough for a cold TLS handshake, short enough not to hang a build. */
const STAR_TIMEOUT_MS = 4_000;

export async function fetchStarCount(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${REGISTRY_NAMESPACE}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(STAR_TIMEOUT_MS),
      next: { revalidate: STAR_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const stars =
      typeof payload === "object" && payload !== null
        ? (payload as { stargazers_count?: unknown }).stargazers_count
        : undefined;
    return typeof stars === "number" && Number.isFinite(stars) ? stars : null;
  } catch {
    return null;
  }
}

/** 0 → «0», 1 500 → «1.5k», 47 100 → «47.1k» — the shorthand all four references use. */
export function formatStarCount(stars: number) {
  if (stars < 1000) return String(stars);
  const thousands = stars / 1000;
  // One decimal below ten thousand («1.5k»), none above it («47k»), never «1.0k».
  const text = thousands < 10 ? thousands.toFixed(1) : Math.round(thousands).toString();
  return `${text.replace(/\.0$/, "")}k`;
}
