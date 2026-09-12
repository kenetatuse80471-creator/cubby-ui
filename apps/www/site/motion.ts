/**
 * The landing's motion, in the units Motion wants — seconds and a bezier as four
 * numbers — mirroring the CSS custom properties the rest of the site transitions on.
 *
 * There are two places a curve can live and only one of them can be the source. CSS
 * transitions read `--site-ease` and `--site-dur-*` straight from `site-theme.css`;
 * a JavaScript animation cannot, because Motion needs the numbers before the element
 * exists. So the numbers are written once, here, with the property they answer to
 * named next to them — and nothing else in the app is allowed a second copy.
 *
 * One easing for the whole site is the point (reference spec §5, technique 6): none
 * of the four references leaves a single `ease` at its default.
 */

/** `--site-ease`: cubic-bezier(0.23, 1, 0.32, 1). */
export const SITE_EASE = [0.23, 1, 0.32, 1] as const;

/** `--site-dur-panel`, in seconds. A card arriving, a heading resolving. */
export const SITE_DUR_PANEL = 0.3;

/**
 * The hero's reveal is longer than any interaction on the site — it is read, not
 * responded to — and the references bear that out: beui's words resolve over roughly
 * half a second each (§5, technique 10). Interaction durations stay at
 * `--site-dur-press` / `--site-dur-base` / `--site-dur-panel`; this one is its own.
 */
export const SITE_DUR_REVEAL = 0.55;

/** Between one word of the hero and the next, and between one card and the next. */
export const SITE_STAGGER = 0.055;

/** How far a word or a card travels on arrival, in pixels. Small enough to read as
 *  settling rather than as sliding: the blur is what carries the effect. */
export const SITE_RISE = 10;

/** The blur a hero word starts at, in pixels — beui's own figure (§5, technique 10). */
export const SITE_REVEAL_BLUR = 12;
