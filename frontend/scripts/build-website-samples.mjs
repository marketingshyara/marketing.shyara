/**
 * build-website-samples.mjs
 *
 * Builds TanStack Start sample apps from samples-sources/ and copies prerendered
 * client output into frontend/public/samples/websites/<slug>/.
 *
 * Usage (from frontend/): node scripts/build-website-samples.mjs
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, "..");
const repoRoot = resolve(frontendRoot, "..");
const sourcesRoot = resolve(repoRoot, "samples-sources");
const publicSamplesRoot = resolve(frontendRoot, "public/samples/websites");

const SAMPLES = [
  {
    sourceDir: "gym-ironforge",
    slug: "gym-ironforge-website",
  },
  {
    sourceDir: "car-wash-auto-care",
    slug: "car-wash-auto-care-website",
  },
  {
    sourceDir: "yoga-ananda",
    slug: "yoga-ananda-website",
  },
  {
    sourceDir: "florist-bloom-vine",
    slug: "florist-bloom-vine-website",
  },
  {
    sourceDir: "realestate-verdant-heights",
    slug: "realestate-verdant-heights-website",
  },
  {
    sourceDir: "toy-store-playhouse",
    slug: "toy-store-playhouse-website",
  },
];

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyBuiltSample(sourceProjectDir, slug) {
  const clientDir = resolve(sourceProjectDir, "dist/client");
  if (!existsSync(clientDir)) {
    throw new Error(`Missing dist/client in ${sourceProjectDir} — build may have failed`);
  }

  const dest = resolve(publicSamplesRoot, slug);
  const posterPath = resolve(dest, "poster.jpg");
  const posterBackup = existsSync(posterPath) ? readFileSync(posterPath) : null;

  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(clientDir, dest, { recursive: true });

  if (posterBackup) {
    writeFileSync(posterPath, posterBackup);
  }

  const indexPath = resolve(dest, "index.html");
  if (!existsSync(indexPath)) {
    const shellPath = resolve(dest, "_shell.html");
    if (existsSync(shellPath)) {
      copyFileSync(shellPath, indexPath);
    } else {
      throw new Error(
        `No index.html or _shell.html in ${dest} after build — check TanStack SPA prerender config`,
      );
    }
  }

  console.log(`Deployed sample → public/samples/websites/${slug}/`);
}

for (const { sourceDir, slug } of SAMPLES) {
  const projectDir = resolve(sourcesRoot, sourceDir);
  if (!existsSync(projectDir)) {
    console.error(`Missing source project: ${projectDir}`);
    process.exit(1);
  }

  console.log(`\n=== Building ${sourceDir} (${slug}) ===\n`);

  if (!existsSync(resolve(projectDir, "node_modules"))) {
    run("npm", ["install"], projectDir);
  }

  run("npm", ["run", "build"], projectDir);
  copyBuiltSample(projectDir, slug);
}

console.log("\nAll website samples built. Fixing UTF-8 mojibake in sample assets…\n");
run("node", [resolve(__dirname, "fix-sample-encoding.mjs")], frontendRoot);

console.log("\nDone. Run marketing build + capture-sample-posters next.\n");
