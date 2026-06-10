/**
 * Renders frontend/scripts/og-card.html to frontend/public/og-image.png (1200×630).
 * Usage: node scripts/generate-og-image.mjs
 */

import { chromium } from "@playwright/test";
import { dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const htmlPath = resolve(__dirname, "og-card.html");
const outPath = resolve(root, "public", "og-image.png");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
await page.screenshot({ path: outPath, type: "png" });
await browser.close();

console.log(`Wrote ${outPath}`);
