/**
 * prerender.mjs — Static prerendering for Shyara Marketing SPA
 *
 * Builds the client bundle (without re-copying public/ assets, since those
 * already exist in dist/ from a prior build), then runs the SSR render
 * and writes per-route index.html files into dist/.
 *
 * NOTE: dist/samples/websites contains large static sample website files
 * copied during the initial build. Those files are preserved between runs.
 * The build intentionally skips re-copying public/ (copyPublicDir: false)
 * and does NOT empty dist/ (emptyOutDir: false) to avoid conflicts with
 * the existing static asset tree.
 *
 * Usage: npm run build:ssg
 */

import { build } from "vite";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Routes to prerender — skips redirects, wildcards, and 404
const routes = [
  "/",
  "/services",
  "/services/social-media",
  "/services/ads-campaign-management",
  "/services/website-development",
  "/services/app-development",
  "/samples",
  "/samples/social-media",
  "/samples/websites",
  "/offers",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/service-delivery-policy",
];

// ── 0. Pre-clean only Vite-generated artifacts ────────────────────────────────
// We never touch dist/samples/ since it contains large pre-built static files.
for (const artifact of ["dist/assets", "dist/index.html"]) {
  try {
    rmSync(resolve(root, artifact), { recursive: true, force: true });
  } catch {
    // Ignore — artifact may not exist on first run
  }
}

// ── 1. Client build ───────────────────────────────────────────────────────────
// emptyOutDir:false  → don't wipe dist/ (avoids EPERM on locked sample files)
// copyPublicDir:false → don't re-copy public/samples/websites (already in dist/)
console.log("Building client bundle…");
await build({
  root,
  configFile: resolve(root, "vite.config.ts"),
  logLevel: "warn",
  build: {
    emptyOutDir: false,
    copyPublicDir: false,
    assetsDir: "static", // Avoids the locked dist/assets directory
  },
});
console.log("Client bundle ready.\n");

// ── 2. SSR bundle ─────────────────────────────────────────────────────────────
console.log("Building SSR bundle…");
await build({
  root,
  configFile: resolve(root, "vite.config.ts"),
  logLevel: "warn",
  build: {
    ssr: "src/entry-server.tsx",
    outDir: "dist-ssr",
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
console.log("SSR bundle ready.\n");

// ── 3. Load render function ───────────────────────────────────────────────────
const entryUrl = pathToFileURL(resolve(root, "dist-ssr/entry-server.js")).href;
const { render } = await import(entryUrl);

// ── 4. Read client-build HTML template ───────────────────────────────────────
const templatePath = resolve(root, "dist/index.html");
if (!existsSync(templatePath)) {
  console.error("ERROR: dist/index.html not found after client build.");
  process.exit(1);
}
const template = readFileSync(templatePath, "utf-8");

// ── 5. Render each route ──────────────────────────────────────────────────────
let successCount = 0;
let failCount = 0;

for (const route of routes) {
  try {
    const { html: appHtml, helmetContext } = render(route);
    const helmet = helmetContext.helmet;

    // Extract per-route head tags from react-helmet-async SSR context
    const headParts = [];
    if (helmet) {
      const title = helmet.title?.toString();
      const meta = helmet.meta?.toString();
      const link = helmet.link?.toString();
      const script = helmet.script?.toString();
      if (title) headParts.push(title);
      if (meta) headParts.push(meta);
      if (link) headParts.push(link);
      if (script) headParts.push(script);
    }
    const headContent = headParts.join("\n    ");

    // Inject prerendered content into the HTML template
    let html = template
      .replace("<!--app-head-->", headContent)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    // Determine output file path
    const outPath =
      route === "/"
        ? resolve(root, "dist/index.html")
        : resolve(root, "dist", route.slice(1), "index.html");

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, "utf-8");

    console.log(`  ✓  ${route}`);
    successCount++;
  } catch (err) {
    console.error(`  ✗  ${route} — ${err.message}`);
    failCount++;
  }
}

// ── 6. Clean up SSR bundle ────────────────────────────────────────────────────
rmSync(resolve(root, "dist-ssr"), { recursive: true, force: true });

console.log(
  `\nPrerendering complete. ${successCount} routes written, ${failCount} failed.`
);
if (failCount > 0) process.exit(1);
