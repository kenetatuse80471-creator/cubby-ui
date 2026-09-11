/**
 * One PNG per demo per theme, 960 CSS px wide, written to `apps/playground/shots/`.
 *
 * The app is built and served by Vite's own preview server, which is closed
 * again at the end — nothing keeps running after the script.
 */
import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { build, preview } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const shotsDir = fileURLToPath(new URL("../shots", import.meta.url));
const themes = ["dark", "light"] as const;
const width = 960;

await rm(shotsDir, { recursive: true, force: true });
await mkdir(shotsDir, { recursive: true });

await build({ root, logLevel: "warn" });

const server = await preview({ root, logLevel: "warn" });
const url = server.resolvedUrls?.local[0];
if (!url) throw new Error("vite preview did not report a local url");

const browser = await chromium.launch();
let written = 0;

try {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  // Freezes the spinner, so a rerun produces byte-identical files.
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const theme of themes) {
    await page.goto(`${url}?theme=${theme}`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-demo]");

    const names = await page.$$eval("[data-demo]", (nodes) =>
      nodes.map((node) => node.getAttribute("data-demo") ?? ""),
    );

    for (const name of names) {
      await page
        .locator(`[data-demo="${name}"]`)
        .screenshot({ path: `${shotsDir}/${name}-${theme}.png` });
      written += 1;
    }
  }
} finally {
  await browser.close();
  await server.close();
}

console.log(`shots: ${written} PNG -> apps/playground/shots/`);
