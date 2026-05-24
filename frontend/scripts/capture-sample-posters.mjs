/**
 * capture-sample-posters.mjs
 *
 * Captures above-the-fold poster images for each website sample in manifest.json.
 * Run after sample static sites change: `node scripts/capture-sample-posters.mjs`
 *
 * Requires the dev server (or preview) serving the marketing site + public samples.
 * Default base URL: http://localhost:8080
 *
 *   BASE_URL=http://127.0.0.1:8080 node scripts/capture-sample-posters.mjs
 */

import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const manifestPath = resolve(root, "public/samples/websites/manifest.json");
const baseUrl = (process.env.BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const samples = manifest.samples ?? [];

if (samples.length === 0) {
  console.error("No samples in manifest.json");
  process.exit(1);
}

const VIEWPORT = { width: 1280, height: 720 };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT });
const page = await context.newPage();

for (const sample of samples) {
  const folder = sample.folder;
  const url = `${baseUrl}/samples/websites/${folder}/`;
  const outDir = resolve(root, `public/samples/websites/${folder}`);
  const outPath = resolve(outDir, "poster.jpg");

  mkdirSync(outDir, { recursive: true });
  console.log(`Capturing ${sample.displayCode} → poster.jpg`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: outPath,
      type: "jpeg",
      quality: 82,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });
    sample.posterUrl = `/samples/websites/${folder}/poster.jpg`;
  } catch (err) {
    console.error(`  Failed for ${folder}:`, err.message);
    process.exitCode = 1;
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Updated manifest with posterUrl for ${samples.length} samples.`);

await browser.close();
