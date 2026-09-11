import type { ReactNode } from "react";

/**
 * The stage a component stands on.
 *
 * Two layers, and the pair is the single most copied trick in the references
 * (§5, technique 3 — reactbits's `.customize-frame` / `.preview-options`):
 *
 *   frame    radius 14 (`--radius-role-surface`), padding 4, a 7 % film,
 *            one lit pixel along the top edge
 *   └ floor  radius 10 (`--radius-role-card`), the page's own colour, 1px alpha stroke
 *
 * 14 − 4 = 10 exactly, so the two radii are concentric and the frame reads as a
 * bezel rather than as a second border. Both numbers are tokens the library already
 * ships; nothing here is a literal.
 *
 * The floor is `--bg-app`, the colour of the page, which is what makes the demo look
 * recessed into the page without a shadow (§5, technique 4) — and, more to the
 * point, means the component inside is standing on the same surface it was designed
 * against. **Everything inside this element is the library's own tokens**; the
 * `--site-*` layer stops at the frame. That boundary is the honest part of a
 * component page: a preview cannot flatter a component with values the component
 * would not get in a real product.
 *
 * `min-height: 400px` is measured (§3.3).
 */
export function PreviewWell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-role-surface bg-film-1 p-1 inset-shadow-site-highlight">
      <div className="flex min-h-site-preview items-center justify-center rounded-role-card border border-site-border bg-bg-app p-6">
        {children}
      </div>
    </div>
  );
}
