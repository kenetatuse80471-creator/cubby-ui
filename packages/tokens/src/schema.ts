/**
 * Shape of `src/tokens.json` — the Figma variables export ("altis-design-tokens/1").
 *
 * The file is copied verbatim from the "Ящик" design-system folder and is never edited by
 * hand here; see SOURCE.md. These types only describe what the export actually contains,
 * so that build.ts can fail loudly when the export changes shape.
 */

export type Alias = { alias: string };

export type TokenValue = string | number | Alias;

export type VariableType = "COLOR" | "FLOAT" | "STRING";

export interface Variable {
  /** Slash path inside the collection, e.g. `color/bg/app`. */
  name: string;
  type: VariableType;
  /** One entry per collection mode: `Value`, or `Dark` / `Light` for Color. */
  values: Record<string, TokenValue>;
  scopes: string[];
  codeSyntax: { WEB: string | null };
  description?: string;
}

export interface Collection {
  name: string;
  modes: string[];
  /** Primitives are hidden: they are inlined into consumers, never emitted as variables. */
  hidden?: boolean;
  variables: Variable[];
}

export interface TextStyle {
  name: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  letterSpacingUnit: string;
  description?: string;
}

export interface Effect {
  type: string;
  color: string;
  offset: [number, number];
  radius: number;
  spread: number;
}

export interface EffectStyle {
  name: string;
  effects: Effect[];
  description?: string;
}

export interface TokensFile {
  $schema: string;
  meta: Record<string, unknown>;
  collections: Collection[];
  textStyles: TextStyle[];
  effectStyles: EffectStyle[];
}

export function isAlias(value: TokenValue): value is Alias {
  return typeof value === "object" && value !== null && "alias" in value;
}
