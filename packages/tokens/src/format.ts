/**
 * Unit rules. The Figma export stores bare numbers; CSS needs units, and which unit a number
 * takes is decided by its collection plus its Figma scopes — never guessed per variable.
 *
 *   Color                       hex, printed exactly as exported (`#A8ABB212` keeps its alpha)
 *   Space / Radius              px
 *   Size                        px, except `OPACITY` scope → unitless
 *   Motion  FLOAT               ms
 *   Motion  STRING              printed as is (easing curves)
 *   Layer                       unitless
 */

import type { Collection, EffectStyle, TextStyle, Variable } from "./schema.ts";

export type Unit = "raw" | "px" | "ms" | "number";

export function unitFor(collection: Collection, variable: Variable): Unit {
  if (variable.type === "COLOR" || variable.type === "STRING") return "raw";
  switch (collection.name) {
    case "Space":
    case "Radius":
      return "px";
    case "Size":
      return variable.scopes.includes("OPACITY") ? "number" : "px";
    case "Motion":
      return "ms";
    case "Layer":
      return "number";
    default:
      return "raw";
  }
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

export function applyUnit(value: string | number, unit: Unit): string {
  if (typeof value === "string") return value;
  switch (unit) {
    case "px":
      return `${formatNumber(value)}px`;
    case "ms":
      return `${formatNumber(value)}ms`;
    default:
      return formatNumber(value);
  }
}

/** Figma font-style names → CSS numeric weights. An unknown style is a build error. */
const WEIGHTS: Record<string, number> = {
  Thin: 100,
  ExtraLight: 200,
  Light: 300,
  Regular: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
  ExtraBold: 800,
  Black: 900,
};

export function fontWeight(style: string): number {
  const weight = WEIGHTS[style.replace(/\s+/g, "")];
  if (weight === undefined) throw new Error(`Unknown font style "${style}"`);
  return weight;
}

/** `display/lg` → `display-lg`, used as the suffix of --text-* / --leading-* / --tracking-*. */
export function styleKey(name: string): string {
  return name.split("/").filter(Boolean).join("-").toLowerCase();
}

export function letterSpacing(style: TextStyle): string {
  if (style.letterSpacingUnit === "PERCENT") return `${formatNumber(style.letterSpacing / 100)}em`;
  return `${formatNumber(style.letterSpacing)}px`;
}

/** `#00000059` → `rgba(0, 0, 0, 0.349)`; `#RRGGBB` → `rgba(r, g, b, 1)`. */
export function hexToRgba(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6 && clean.length !== 8) {
    throw new Error(`Cannot read shadow colour "${hex}"`);
  }
  const int = (offset: number) => Number.parseInt(clean.slice(offset, offset + 2), 16);
  const alpha = clean.length === 8 ? int(6) / 255 : 1;
  return `rgba(${int(0)}, ${int(2)}, ${int(4)}, ${formatNumber(Number(alpha.toFixed(3)))})`;
}

export function shadowCss(style: EffectStyle): string {
  return style.effects
    .map((effect) => {
      if (effect.type !== "DROP_SHADOW") throw new Error(`Unsupported effect ${effect.type}`);
      const [x, y] = effect.offset;
      const spread = effect.spread === 0 ? "" : ` ${formatNumber(effect.spread)}px`;
      return `${formatNumber(x)}px ${formatNumber(y)}px ${formatNumber(effect.radius)}px${spread} ${hexToRgba(effect.color)}`;
    })
    .join(", ");
}
