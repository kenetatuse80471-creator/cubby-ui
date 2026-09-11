import fs from "node:fs";
import path from "node:path";
import * as docgen from "react-docgen-typescript";
import ts from "typescript";

/**
 * The props table, extracted from the component sources by the type checker.
 *
 * Adapted from beUI (`lib/props-extractor.ts`), MIT, Copyright (c) 2026 Saurabh
 * Chauhan — see THIRD-PARTY-NOTICES.md: the shared-`ts.Program` provider and the
 * idea of filtering inherited props by where the type checker says they came from
 * are theirs. The filter rule itself is different, and is the interesting part.
 *
 * `react-docgen-typescript` 2.4.0 was checked against this monorepo's TypeScript
 * 6.0.3 on 12.09.2026 and works; the table is real, not hand-written.
 *
 * Which props survive, and why:
 *
 * - props declared in this repository — the hand-written interface. Kept.
 * - props the checker cannot trace to a file at all — `cva`'s `VariantProps`
 *   resolve this way (`variant`, `size`, `tone`, `fullWidth`). Kept: they are the
 *   component's own API even though no interface spells them out.
 * - props from `@base-ui/react` — a primitive's own surface *is* the API of the
 *   component wrapping it (`Switch` is `Switch.Root`'s props, `checked` included).
 *   Kept.
 * - props from `@types/react` — the ~280 native DOM attributes every component
 *   accepts. Dropped: a table of them says nothing and hides the six that matter.
 */

export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

export interface ComponentPropsDoc {
  displayName: string;
  props: PropDoc[];
}

const APP_ROOT = process.cwd();
const REPO_ROOT = path.resolve(APP_ROOT, "..", "..");
const UI_DIR = path.join(REPO_ROOT, "packages", "registry", "src", "ui");

const IN_NODE_MODULES = /[/\\]node_modules[/\\]/;
const IS_BASE_UI = /[/\\]@base-ui[/\\]react[/\\]/;

function componentFiles(): string[] {
  return fs
    .readdirSync(UI_DIR)
    .filter((entry) => entry.endsWith(".tsx"))
    .map((entry) => path.join(UI_DIR, entry));
}

let program: ts.Program | null = null;

/**
 * One program for every component file. Building a program per file multiplies the
 * cost of the table by the number of pages; this way the whole site costs about a
 * second of the build.
 */
function getProgram() {
  if (!program) {
    const configPath = path.join(APP_ROOT, "tsconfig.json");
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, APP_ROOT);
    program = ts.createProgram(componentFiles(), parsed.options);
  }
  return program;
}

const parser = docgen.withDefaultConfig({
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
});

function formatType(prop: docgen.PropItem): string {
  if (prop.type?.name === "enum" && Array.isArray(prop.type.value)) {
    return prop.type.value.map((entry: { value: string }) => entry.value).join(" | ");
  }
  return prop.type?.name ?? "unknown";
}

function isOwnProp(prop: docgen.PropItem): boolean {
  const parent = prop.parent?.fileName;
  if (!parent) return true;
  if (!IN_NODE_MODULES.test(parent)) return true;
  return IS_BASE_UI.test(parent);
}

/**
 * Every exported function in a file is a "component" as far as docgen is concerned,
 * `useSnackbar` and `MENU_SIDE_OFFSET` included. A real component starts with a
 * capital, is not a constant written in caps, and has at least one prop worth showing.
 */
function isRenderableComponent(doc: ComponentPropsDoc) {
  const first = doc.displayName.charAt(0);
  const looksLikeComponent = first === first.toUpperCase() && doc.displayName !== doc.displayName.toUpperCase();
  return looksLikeComponent && doc.props.length > 0;
}

const cache = new Map<string, ComponentPropsDoc[]>();

/**
 * Props of one component file, addressed the way `registry.json` addresses it
 * (`packages/registry/src/ui/button.tsx`). Returns `[]` for anything that is not a
 * `.tsx` — the tokens stylesheets and `lib/cn.ts` have no props table, by nature.
 */
export function getComponentProps(relToRepoRoot: string): ComponentPropsDoc[] {
  if (!relToRepoRoot.endsWith(".tsx")) return [];

  const absolute = path.join(REPO_ROOT, relToRepoRoot);
  const cached = cache.get(absolute);
  if (cached) return cached;

  const docs = parser.parseWithProgramProvider([absolute], getProgram);
  const result = docs
    .map((doc) => ({
      displayName: doc.displayName,
      props: Object.values(doc.props ?? {})
        .filter(isOwnProp)
        .map((prop) => ({
          name: prop.name,
          type: formatType(prop),
          required: prop.required,
          defaultValue: (prop.defaultValue?.value as string | undefined) ?? null,
          description: prop.description || "",
        }))
        .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name)),
    }))
    .filter(isRenderableComponent);

  cache.set(absolute, result);
  return result;
}
