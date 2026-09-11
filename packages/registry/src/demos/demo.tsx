import type { ComponentType, ReactNode } from "react";

/** What every `*-demo.tsx` exports and `index.ts` collects. */
export interface Demo {
  /** Registry item name — also the file name of the screenshot. */
  name: string;
  /** Heading above the grid in the playground. */
  title: string;
  component: ComponentType;
}

/** Vertical stack of labelled rows. Outer gap 24 — twice the inner one. */
export function DemoGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

/** One labelled row of the grid. */
export function DemoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption-sm text-text-3">{label}</span>
      <div className="flex flex-wrap items-end gap-4">{children}</div>
    </div>
  );
}

/** One sample with its caption underneath. */
export function DemoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <div className="flex min-h-control-h-lg items-center">{children}</div>
      <span className="text-caption-sm text-text-3">{label}</span>
    </div>
  );
}
