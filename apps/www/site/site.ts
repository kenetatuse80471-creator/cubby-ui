/**
 * Canonical site origin. Override per environment via NEXT_PUBLIC_SITE_URL.
 *
 * Adapted from beUI (`lib/site.ts`), MIT, Copyright (c) 2026 Saurabh Chauhan —
 * see THIRD-PARTY-NOTICES.md. The `pageUrlFor` helper below comes from the same
 * project's `lib/signature.ts`.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cubbyui.dev"
).replace(/\/$/, "");

export const SITE_NAME = "Cubby UI";

export const SITE_DESCRIPTION =
  "A component library for product interfaces, delivered through a shadcn registry. " +
  "Dark is the canon, every value comes from the tokens.";

/**
 * The registry's address for `npx shadcn@latest add`. It is the GitHub
 * `<owner>/<repo>` pair of this repository — the same prefix every
 * `registryDependencies` entry in `registry.json` already carries, which
 * `registry-data.ts` checks on load so the two cannot drift apart.
 */
export const REGISTRY_NAMESPACE = "kenetatuse80471-creator/cubby-ui";

export const GITHUB_URL = `https://github.com/${REGISTRY_NAMESPACE}`;

/** Docs page URL of one registry item, e.g. https://cubbyui.dev/components/button */
export function pageUrlFor(slug: string) {
  return `${SITE_URL}/components/${slug}`;
}

/** The install line shown on a component page and in the markdown mirror. */
export function installCommandFor(slug: string, runner: PackageRunner = "npm") {
  const target = `${REGISTRY_NAMESPACE}/${slug}`;
  switch (runner) {
    case "npm":
      return `npx shadcn@latest add ${target}`;
    case "pnpm":
      return `pnpm dlx shadcn@latest add ${target}`;
    case "yarn":
      return `yarn dlx shadcn@latest add ${target}`;
    case "bun":
      return `bunx --bun shadcn@latest add ${target}`;
  }
}

export const PACKAGE_RUNNERS = ["npm", "pnpm", "yarn", "bun"] as const;

export type PackageRunner = (typeof PACKAGE_RUNNERS)[number];
