import fs from "node:fs";
import path from "node:path";

const MOJI =
  /\u00e2\u20ac[\u201c\u201d"]|\u00e2\u20ac\u2026|\u00e2\u20ac\u2122|\u00c2[\u00a9\u00ae\u00b0-\u00bf]|\u00c3[\u00a0-\u00bf]/;

const TEXT = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".txt",
  ".svg",
  ".tsx",
  ".ts",
  ".jsx",
  ".md",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".tanstack",
  ".wrangler",
  ".lovable",
]);

export function walkTextFiles(root, files = []) {
  if (!fs.existsSync(root)) return files;
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(root, e.name);
    if (e.isDirectory()) walkTextFiles(p, files);
    else if (TEXT.has(path.extname(e.name).toLowerCase())) files.push(p);
  }
  return files;
}

export function findMojibakeFiles(root) {
  return walkTextFiles(root).filter((f) => MOJI.test(fs.readFileSync(f, "utf8")));
}

if (process.argv[1]?.endsWith("scan-encoding.mjs")) {
  const roots = process.argv.slice(2);
  if (!roots.length) {
    console.error("Usage: node scan-encoding.mjs <dir> [dir...]");
    process.exit(1);
  }
  for (const root of roots) {
    const hits = findMojibakeFiles(path.resolve(root));
    console.log(`\n${root}: ${hits.length} file(s)`);
    for (const h of hits) console.log(" ", h);
  }
}
