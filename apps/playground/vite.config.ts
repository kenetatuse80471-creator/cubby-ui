import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/registry/cubby": fileURLToPath(
        new URL("../../packages/registry/src", import.meta.url),
      ),
      "@/lib": fileURLToPath(new URL("../../packages/registry/src/lib", import.meta.url)),
    },
  },
  server: { port: 4318 },
  preview: { port: 4319 },
});
