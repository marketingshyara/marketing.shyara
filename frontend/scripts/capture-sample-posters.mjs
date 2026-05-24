/**
 * capture-sample-posters.mjs
 *
 * Captures above-the-fold poster images for each website sample in manifest.json.
 *
 * IMPORTANT: Use the production static server (vite preview), not `vite dev`.
 * Dev mode serves the marketing SPA for /samples/websites/<folder>/ and captures 404s.
 *
 *   npm run build
 *   npx vite preview --port 4173
 *   npm run capture-sample-posters
 *
 *   BASE_URL=http://127.0.0.1:4173 node scripts/capture-sample-posters.mjs
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const manifestPath = resolve(root, "public/samples/websites/manifest.json");
const previewPort = Number(process.env.PREVIEW_PORT ?? 4173);
const distDir = resolve(root, "dist");

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) {
        const html = await res.text();
        if (html.includes("That page does not exist")) {
          throw new Error("Marketing 404 — wrong server");
        }
        return;
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Marketing 404")) throw err;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not reachable at ${url}`);
}

async function withPreviewServer(run) {
  if (process.env.BASE_URL) {
    return run(process.env.BASE_URL.replace(/\/$/, ""));
  }

  if (!existsSync(distDir)) {
    console.error("dist/ not found. Run `npm run build` in frontend first.");
    process.exit(1);
  }

  const child = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(previewPort)], {
    cwd: root,
    shell: true,
  });

  const resolvedBase = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for vite preview")), 60_000);

    const onData = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      const match = text.match(/Local:\s+(https?:\/\/[^\s]+)/i);
      if (match) {
        clearTimeout(timeout);
        child.stdout?.off("data", onData);
        child.stderr?.off("data", onData);
        resolve(match[1].replace(/\/$/, ""));
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  try {
    await waitForServer(`${resolvedBase}/samples/websites/restaurant-classic-website/`);
    return await run(resolvedBase);
  } finally {
    child.kill("SIGTERM");
  }
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const samples = manifest.samples ?? [];

if (samples.length === 0) {
  console.error("No samples in manifest.json");
  process.exit(1);
}

const VIEWPORT = { width: 1280, height: 720 };

/** Marketing-site 404 from React Router — must not be captured as a poster. */
async function assertSampleLoaded(page, sample) {
  const marketingLost = page.getByText("That page does not exist");
  if (await marketingLost.isVisible().catch(() => false)) {
    throw new Error(
      "Marketing 404 page loaded. Run `npm run build`, then `npx vite preview --port 4173`, and set BASE_URL to that server."
    );
  }

  await page.locator("#root *").first().waitFor({ state: "attached", timeout: 90_000 });

  const title = await page.title();
  if (/page not found/i.test(title)) {
    throw new Error(`Unexpected page title: ${title}`);
  }

  const heading404 = page.getByRole("heading", { name: "404", exact: true });
  if (await heading404.isVisible().catch(() => false)) {
    if (await marketingLost.isVisible().catch(() => false)) {
      throw new Error("Marketing 404 visible");
    }
    console.warn(`  Note: ${sample.displayCode} shows an in-app 404 — check sample routes`);
  }
}

await withPreviewServer(async (baseUrl) => {
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT });
const page = await context.newPage();
const hashes = new Set();

for (const sample of samples) {
  const folder = sample.folder;
  const url = `${baseUrl}/samples/websites/${folder}/`;
  const outDir = resolve(root, `public/samples/websites/${folder}`);
  const outPath = resolve(outDir, "poster.jpg");

  mkdirSync(outDir, { recursive: true });
  console.log(`Capturing ${sample.displayCode} → ${url}`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await assertSampleLoaded(page, sample);
    await page.waitForTimeout(2500);

    const bytes = await page.screenshot({
      type: "jpeg",
      quality: 82,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });
    writeFileSync(outPath, bytes);

    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    if (hashes.has(hash)) {
      console.warn(`  Warning: poster hash ${hash} duplicates a prior sample`);
    }
    hashes.add(hash);
    sample.posterUrl = `/samples/websites/${folder}/poster.jpg`;
    console.log(`  Saved poster.jpg (${Math.round(bytes.length / 1024)} KB, hash ${hash})`);
  } catch (err) {
    console.error(`  Failed for ${folder}:`, err.message);
    process.exitCode = 1;
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Updated manifest with posterUrl for ${samples.length} samples.`);

await browser.close();

if (hashes.size < Math.min(3, samples.length) && samples.length > 1) {
  console.error("Too many identical posters — use production static server (npm run build + capture).");
  process.exitCode = 1;
}
});
