"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { SITE_DUR_PANEL, SITE_EASE, SITE_RISE, SITE_STAGGER } from "@/site/motion";

/**
 * A block arriving as the page reaches it. Used for the cards of the component grid
 * and for the section headings above them.
 *
 * It is a **client wrapper around server-rendered children**, and that is the whole
 * reason it is a separate file: `site/examples.ts` reads example sources off disk with
 * `node:fs`, so nothing that imports it can be a client module. The grid stays on the
 * server, renders the real components, and hands the finished elements through here as
 * `children` — which cross the boundary as payload, not as code.
 *
 * `once` matters as much as the animation: a card that re-animates every time it
 * passes the fold is a page that will not sit still while it is being read.
 *
 * The stagger is by `index` within a row rather than globally, so the fifth card does
 * not wait four steps behind the first — `index % columns` keeps every row's sweep the
 * same length however long the grid gets.
 */
export function ScrollReveal({
  children,
  className,
  /** Position in its row; the delay is this many steps of the shared clock. */
  step = 0,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: SITE_RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      // `amount: 0` fires as soon as any edge crosses in, and the negative bottom
      // margin holds it back until the block is properly on screen rather than
      // one pixel into it.
      viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
      transition={{ duration: SITE_DUR_PANEL, ease: SITE_EASE, delay: step * SITE_STAGGER }}
    >
      {children}
    </motion.div>
  );
}
