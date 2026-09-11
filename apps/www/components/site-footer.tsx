import { SITE_NAME } from "@/site/site";

/**
 * STRUCTURAL PLACEHOLDER — same as the header: the designed footer comes later.
 *
 * The beUI line is not decoration and is not optional. Parts of this site's
 * machinery are derived from beUI, which is MIT licensed, and the licence requires
 * the attribution to travel with the work; `THIRD-PARTY-NOTICES.md` lists every
 * file it applies to.
 */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-site-border">
      <div className="mx-auto flex max-w-site flex-col gap-2 px-5 py-8">
        <p className="text-caption-sm text-text-2">{SITE_NAME} — MIT licensed.</p>
        <p className="text-caption-sm text-text-3">
          Site machinery adapted from{" "}
          <a
            href="https://github.com/starc007/ui-components"
            className="underline hover:text-text-1"
            rel="noreferrer"
            target="_blank"
          >
            beUI
          </a>{" "}
          by Saurabh Chauhan (MIT).
        </p>
      </div>
    </footer>
  );
}
