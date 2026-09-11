// Flat config, ESLint 9. One config for the whole workspace: it lives at the
// root, so `pnpm lint` runs `eslint .` from here and every package is covered.
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/.next/**",
      "public/r/**",
      "apps/www/.screenshots/**",
      "apps/www/next-env.d.ts",
      "apps/*/shots/**",
      "packages/tokens/src/tokens.json",
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Components and demos: the two rule sets that catch what a designer notices —
  // broken hooks and an icon without an accessible name.
  {
    files: [
      "packages/registry/src/**/*.tsx",
      "apps/playground/src/**/*.tsx",
      "apps/www/**/*.tsx",
    ],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // `Switch` renders a real (visually hidden) checkbox inside itself, so a
      // wrapping <label> is the pattern Base UI documents; the rule needs to be
      // told which of our components count as controls.
      "jsx-a11y/label-has-associated-control": [
        "error",
        { controlComponents: ["Switch"] },
      ],
    },
  },

  // Node scripts.
  {
    files: ["**/scripts/**/*.ts", "**/*.config.{js,cjs,mjs,ts}"],
    languageOptions: { globals: { ...globals.node } },
  },
);
