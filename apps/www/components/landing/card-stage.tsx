"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * The well of a grid card, and the one hard problem on this page.
 *
 * The components in the grid are the real ones, at the size they were designed for:
 * a `TextInput` is 400 wide because a form column is 400 wide, a `Modal` is 460
 * because a dialog is 460. The well is 232 high and whatever a quarter of the row
 * happens to be. Something has to give, and there are only three ways it can:
 *
 * 1. **Re-authoring each example smaller.** Then the grid stops showing the library
 *    and starts showing a set of miniatures made for the grid — and the sizes, which
 *    are the actual subject of this library, would be the first thing to go.
 * 2. **Cropping.** A component with its right edge cut off reads as a bug.
 * 3. **Scaling the whole demo down until it fits.** The proportions survive, nothing
 *    is cut, and the only cost is that the type in a scaled card is not at its real
 *    size — which the card never claims it is. beUI takes this route too (its
 *    `preview-fit`); this is our version of it.
 *
 * The scale is **measured, never declared**: a per-component table of magic numbers
 * would be wrong the first time an example changed, and wrong again at every viewport
 * the table was not written at. `offsetWidth`/`offsetHeight` report the element's
 * layout size and ignore its own transform, so reading them while scaled gives the
 * unscaled box back and there is no feedback loop to guard against. The factor is
 * capped at 1: a small demo is shown at its true size, never blown up.
 *
 * The subtree is `inert`. Everything in it is a real, working control — buttons,
 * inputs, a switch — and the card is a link; without `inert` the grid would be a
 * tab-stop minefield of seventeen cards' worth of controls that go nowhere, and a
 * screen reader would read every one of them. `inert` removes them from the tab order
 * and from the accessibility tree in one attribute, while leaving them rendered
 * exactly as they are. The card's name and description carry the meaning instead.
 */
export function CardStage({ children }: { children: ReactNode }) {
  const wellRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const well = wellRef.current;
    const demo = demoRef.current;
    if (!well || !demo) return;

    const width = demo.offsetWidth;
    const height = demo.offsetHeight;
    if (width === 0 || height === 0) return;

    const next = Math.min(1, well.clientWidth / width, well.clientHeight / height);
    // Round to the hundredth: without it a sub-pixel reflow can flip the state
    // forever, and nobody can see the difference between 0.812 and 0.81 anyway.
    setScale(Math.round(next * 100) / 100);
  }, []);

  // Before paint, so the first frame the visitor sees is already the fitted one.
  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const well = wellRef.current;
    const demo = demoRef.current;
    if (!well || !demo) return;

    // Both ends move: the well with the viewport, the demo when a font finishes
    // loading or a component settles into its own state.
    const observer = new ResizeObserver(measure);
    observer.observe(well);
    observer.observe(demo);
    return () => observer.disconnect();
  }, [measure]);

  return (
    /*
     * The stroke is not in beui's card — their well is a darker colour than the card
     * and needs nothing else. Ours needs it for one theme only: in light, `--bg-app`
     * and `--bg-surface` are both #FFFFFF, so colour alone separates nothing and the
     * well would disappear. The same reasoning, and the same pair of classes, as the
     * component page's `PreviewWell`.
     */
    <div className="h-site-card-well overflow-hidden rounded-site-well border border-site-border bg-bg-app p-5">
      {/*
        The measured box is this one, inside the padding, and not the well itself:
        `clientWidth` *includes* padding, so measuring the outer element would scale
        every demo up until it filled the air that the padding is there to keep.
      */}
      <div ref={wellRef} className="flex h-full w-full items-center justify-center">
        <div
          ref={demoRef}
          inert
          className="flex shrink-0 items-center justify-center"
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
