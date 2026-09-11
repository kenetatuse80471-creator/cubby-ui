import rawRegistry from "../../../registry.json";
import { REGISTRY_NAMESPACE } from "@/site/site";

/**
 * `registry.json` is the single source of every user-visible string about an item:
 * its title, its description, its docs note, its version and its dependencies. The
 * site reads them from here and never keeps a second copy — a wording fixed in the
 * registry is fixed on the site in the same commit, with no third place to forget.
 *
 * The file is imported, not read from disk: the bundler inlines it, which keeps the
 * component pages buildable as static output and makes a malformed registry a build
 * error rather than a runtime one.
 */

export interface RegistryItemFile {
  /** Relative to the repository root — that is how shadcn resolves it. */
  path: string;
  type: string;
  target?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
  author?: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryItemFile[];
  docs?: string;
  version?: string;
}

function fail(message: string): never {
  throw new Error(`registry.json: ${message}`);
}

function asRecord(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${where} must be an object`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, where: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${where} must be a non-empty string`);
  return value;
}

function asStringArray(value: unknown, where: string): string[] {
  if (!Array.isArray(value)) fail(`${where} must be an array`);
  return value.map((entry, index) => asString(entry, `${where}[${index}]`));
}

function toFile(value: unknown, where: string): RegistryItemFile {
  const record = asRecord(value, where);
  const target = record.target;
  return {
    path: asString(record.path, `${where}.path`),
    type: asString(record.type, `${where}.type`),
    target: typeof target === "string" ? target : undefined,
  };
}

function toItem(value: unknown, index: number): RegistryItem {
  const where = `items[${index}]`;
  const record = asRecord(value, where);
  const name = asString(record.name, `${where}.name`);
  const files = record.files;
  if (!Array.isArray(files) || files.length === 0) {
    fail(`items[${name}].files must be a non-empty array`);
  }
  const meta = record.meta === undefined ? {} : asRecord(record.meta, `${where}.meta`);
  const version = meta.version;
  const docs = record.docs;
  const author = record.author;

  return {
    name,
    type: asString(record.type, `${where}.type`),
    title: asString(record.title, `items[${name}].title`),
    description: asString(record.description, `items[${name}].description`),
    author: typeof author === "string" ? author : undefined,
    dependencies: asStringArray(record.dependencies ?? [], `items[${name}].dependencies`),
    registryDependencies: asStringArray(
      record.registryDependencies ?? [],
      `items[${name}].registryDependencies`,
    ),
    files: files.map((file, fileIndex) => toFile(file, `items[${name}].files[${fileIndex}]`)),
    docs: typeof docs === "string" ? docs : undefined,
    version: typeof version === "string" ? version : undefined,
  };
}

const root = asRecord(rawRegistry as unknown, "root");

export const registryName = asString(root.name, "name");

const rawItems = Array.isArray(root.items) ? root.items : fail("items must be an array");

export const registryItems: RegistryItem[] = rawItems.map(toItem);

const itemsBySlug = new Map(registryItems.map((item) => [item.name, item]));

/**
 * Every `registryDependencies` entry is written as a full registry address. If the
 * prefix ever stops matching `REGISTRY_NAMESPACE`, the install command printed on
 * the site would point somewhere else than the dependency resolution does, so the
 * mismatch is a build error rather than a silent inconsistency.
 */
for (const item of registryItems) {
  for (const dependency of item.registryDependencies) {
    if (!dependency.startsWith(`${REGISTRY_NAMESPACE}/`)) {
      fail(
        `items[${item.name}].registryDependencies contains "${dependency}", which does not start ` +
          `with "${REGISTRY_NAMESPACE}/" — the site's install namespace (apps/www/site/site.ts) ` +
          `and registry.json disagree about the registry address`,
      );
    }
  }
}

/** The item, or `undefined` when the slug is not in the registry at all. */
export function findRegistryItem(slug: string) {
  return itemsBySlug.get(slug);
}

/** The item, or a build error naming the slug. Use it wherever the slug is catalogued. */
export function registryItem(slug: string): RegistryItem {
  const item = itemsBySlug.get(slug);
  if (!item) {
    fail(
      `no item named "${slug}". The site catalogue (apps/www/site/catalog.ts) lists it; ` +
        `registry.json does not. Remove it from the catalogue or add it to the registry.`,
    );
  }
  return item;
}

/** Slugs present in `registry.json`, in the order the file lists them. */
export const registrySlugs = registryItems.map((item) => item.name);

/** The short dependency name, without the version range: `clsx@^2.1.1` → `clsx`. */
export function dependencyName(dependency: string) {
  const at = dependency.lastIndexOf("@");
  return at > 0 ? dependency.slice(0, at) : dependency;
}

/** `kenetatuse80471-creator/cubby-ui/cn` → `cn`. */
export function registryDependencySlug(dependency: string) {
  return dependency.slice(dependency.lastIndexOf("/") + 1);
}
