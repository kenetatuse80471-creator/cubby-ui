import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@/registry/cubby": fileURLToPath(new URL("./src", import.meta.url)),
      "@/lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
  },
});
