/**
 * Runs the literal gate, and checks that the gate itself still bites.
 */

import { describe, expect, it } from "vitest";

import { lintSource, lintUi } from "../scripts/lint-tokens.ts";

describe("lint:tokens", () => {
  it("src/ui and src/lib carry no literal values", () => {
    const findings = lintUi().map((f) => `${f.file}:${f.line}  ${f.rule}  ${f.text}`);
    expect(findings, `lint:tokens findings:\n${findings.join("\n")}`).toEqual([]);
  });

  it("catches what it is there to catch", () => {
    const rules = (source: string) => new Set(lintSource(source, "probe.tsx").map((f) => f.rule));

    expect(rules('const a = cva("bg-[#17181A]");').has("hex-colour")).toBe(true);
    expect(rules('const a = cva("h-[32px]");').has("arbitrary-number")).toBe(true);
    expect(rules('const a = cva("h-[32px]");').has("css-unit-literal")).toBe(true);
    expect(rules('const a = cva("[opacity:0.45]");').has("arbitrary-number")).toBe(true);
    expect(rules('const a = <div style={{ opacity: 0.45 }} />;').has("inline-style-number")).toBe(
      true,
    );
    expect(rules('const a = "inline-flex items-center";').has("class-list-out-of-place")).toBe(
      true,
    );
  });

  it("forbids Tailwind's own z-index scale, only a token passes", () => {
    const rules = (source: string) => new Set(lintSource(source, "probe.tsx").map((f) => f.rule));
    const clean = (source: string) => lintSource(source, "probe.tsx");

    expect(rules('const a = cn("z-50");').has("z-index-literal")).toBe(true);
    // Tailwind's negative scale, same shape, same problem.
    expect(rules('const a = cn("-z-10");').has("z-index-literal")).toBe(true);
    // select.tsx's real bug: the arbitrary-number rule cannot see this one, `z-50` has no
    // brackets/parens and no unit suffix — it is a plain Tailwind default-scale utility.
    expect(rules('const a = cn("z-50 min-w-(--anchor-width)");').has("z-index-literal")).toBe(
      true,
    );
    expect(clean('const a = cn("z-(--z-dropdown)");')).toEqual([]);
  });

  it("forbids Tailwind's own opacity scale, except opacity-0 and opacity-100", () => {
    const rules = (source: string) => new Set(lintSource(source, "probe.tsx").map((f) => f.rule));
    const clean = (source: string) => lintSource(source, "probe.tsx");

    expect(rules('const a = cn("opacity-45");').has("opacity-literal")).toBe(true);
    // 0 and 100 are "hidden"/"fully shown", a state rather than a design value — tag.tsx's
    // `hover:opacity-100` and the surfaces' `data-starting-style:opacity-0`.
    expect(clean('const a = cn("opacity-0");')).toEqual([]);
    expect(clean('const a = cn("opacity-100");')).toEqual([]);
    expect(clean('const a = cn("hover:opacity-100");')).toEqual([]);
    expect(clean('const a = cva("opacity-(--opacity-disabled)");')).toEqual([]);
  });

  it("lets a token reference through", () => {
    const clean = (source: string) => lintSource(source, "probe.tsx");

    expect(clean('const a = cva("border-(length:--stroke-focus)");')).toEqual([]);
    expect(clean('const a = cva("[animation-duration:var(--motion-spin-duration)]");')).toEqual(
      [],
    );
    expect(
      clean('const a = cva("bg-film-1 text-text-1 h-control-h-md px-4 [&>svg]:size-full");'),
    ).toEqual([]);
    // A token name may contain digits — the digit belongs to the token, not to the component.
    expect(clean('const a = cva("bg-(--film-1) opacity-(--opacity-disabled)");')).toEqual([]);
  });

  it("does not mistake variant names for classes", () => {
    const source = [
      'const a = cva("bg-film-1", {',
      '  variants: { size: { md: "h-control-h-md" } },',
      '  defaultVariants: { size: "md", variant: "secondary" },',
      "});",
      'const b = <div data-slot="icon-button" role="status" />;',
    ].join("\n");
    expect(lintSource(source, "probe.tsx")).toEqual([]);
  });

  it("does not mistake a quoted, digit-leading variant key for a class", () => {
    // "2xl" cannot be a bare identifier key, so it is quoted like a class value would be —
    // modal.tsx's `variants: { size: { "2xl": "max-w-modal-w-2xl" } }` is the real case.
    const source = [
      'const a = cva("flex", {',
      '  variants: { size: { "2xl": "max-w-modal-w-2xl" } },',
      "});",
    ].join("\n");
    expect(lintSource(source, "probe.tsx")).toEqual([]);
  });

  it("does not mistake a nested cva-function call's arguments for classes", () => {
    // `avatarVariants({ variant: tone ? "neutral" : variant })` inside `cn(...)`: "neutral" is
    // a variant key one call away, not a class next to `cn`'s other arguments.
    const source = [
      'const avatarVariants = cva("", { variants: { variant: { neutral: "bg-film-2" } } });',
      'const a = cn(avatarVariants({ variant: tone ? "neutral" : variant }), className);',
    ].join("\n");
    expect(lintSource(source, "probe.tsx")).toEqual([]);
  });

  it("does not mistake a comparison operand for a class", () => {
    // `size === "sm"` is empty-state.tsx's real shape: the class lives in the ternary's
    // branches, not in the condition that picks one.
    const source = 'const a = cn("text-text-2", size === "sm" ? "max-w-sm" : "max-w-md");';
    expect(lintSource(source, "probe.tsx")).toEqual([]);
  });

  it("does not mistake a directive prologue for a class list", () => {
    // Switch carries "use client" as its very first line — two words, no cva/cn/className
    // in sight, and not a token problem either. `class-list-out-of-place` used to fire on it.
    expect(lintSource('"use client";\n\nconst a = cva("bg-film-1");', "probe.tsx")).toEqual([]);
    // Only a *prologue* is exempt — the same two words anywhere else still count as a stray
    // class-shaped string the compiles-gate cannot see.
    expect(
      lintSource('const a = 1;\n"use client";\n', "probe.tsx").map((f) => f.rule),
    ).toEqual(["class-list-out-of-place"]);
  });

  it("the escape hatch works, and has to be written down", () => {
    expect(
      lintSource('// cubby-ui-lint-ignore probe\nconst a = cva("h-[32px]");', "probe.tsx"),
    ).toEqual([]);
  });
});
