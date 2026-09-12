"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import {
  SITE_DUR_REVEAL,
  SITE_EASE,
  SITE_REVEAL_BLUR,
  SITE_RISE,
  SITE_STAGGER,
} from "@/site/motion";

/**
 * The hero, arriving.
 *
 * `HeroWords` is the one borrowed effect on the page (§5, technique 10): every word
 * of the headline is its own inline-block, starting at `blur(12px)` and zero opacity
 * and resolving in sequence. It reads as expensive for a reason worth naming — a
 * fade changes one number, a blur-reveal changes how sharp the type is, and sharpness
 * is the thing an eye reads as "this has finished loading" rather than "this is
 * appearing". The words are not letters: per-letter is the version of this effect that
 * looks like a template.
 *
 * `HeroRise` is the same arrival without the blur, for everything under the headline —
 * the badge, the paragraph, the buttons, the terminal. They come in as blocks, on the
 * same clock, so the hero resolves top to bottom once instead of six times.
 *
 * Reduced motion is not a softer version of this: `useReducedMotion` drops both to a
 * plain render with no `initial` state at all, so nothing moves, nothing blurs, and
 * nothing is hidden waiting for an animation that will not run.
 */

/** Delay of the `nth` element of the hero, so blocks and words share one clock. */
function delayFor(index: number, offset: number) {
  return (index + offset) * SITE_STAGGER;
}

export function HeroWords({
  text,
  className,
  /** Steps of the shared clock to wait before the first word. */
  offset = 0,
}: {
  text: string;
  className?: string;
  offset?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          // The words of a headline are fixed and ordered; the index is the identity.
          key={`${word}-${index}`}
          data-reveal
          className="inline-block will-change-transform"
          initial={{ opacity: 0, filter: `blur(${SITE_REVEAL_BLUR}px)`, y: SITE_RISE }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: SITE_DUR_REVEAL,
            ease: SITE_EASE,
            delay: delayFor(index, offset),
          }}
        >
          {word}
          {/* A real space, outside the animated box: a `gap` would collapse at a line
              break and `word-spacing` would not survive the inline-block. */}
          {index < words.length - 1 ? " " : null}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroRise({
  children,
  className,
  offset = 0,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: SITE_RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: SITE_DUR_REVEAL,
        ease: SITE_EASE,
        delay: delayFor(offset, 0),
      }}
    >
      {children}
    </motion.div>
  );
}
