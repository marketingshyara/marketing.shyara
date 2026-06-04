/**
 * Fix UTF-8 mojibake in static website samples (UTF-8 bytes misread as Windows-1252).
 * Safe for minified JS: only re-encodes cp1252-mapped chars; leaves other Unicode as-is.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOTS = [
  path.resolve(__dirname, "../public/samples"),
  path.resolve(__dirname, "../public/samples/websites"),
];

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".tanstack",
  ".wrangler",
  ".lovable",
]);

/** Unicode code point → Windows-1252 byte (0x80–0x9F range). */
const WIN1252_UNICODES = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

const TEXT_EXTENSIONS = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".txt",
  ".svg",
  ".xml",
  ".tsx",
  ".ts",
  ".jsx",
  ".md",
]);

/** Detect likely mojibake without scanning every file byte-by-byte in CI. */
const MOJIBAKE_MARKER =
  /\u00e2\u20ac[\u201c\u201d"]|\u00e2\u20ac\u2026|\u00e2\u20ac\u2122|\u00c2[\u00a9\u00ae\u00b0-\u00bf]|\u00c3[\u00a0-\u00bf]/;

function charToByte(cp) {
  if (cp < 0x100) return cp;
  const mapped = WIN1252_UNICODES[cp];
  return mapped !== undefined ? mapped : null;
}

/**
 * Rebuild UTF-8 from a string that was UTF-8 interpreted as Windows-1252.
 * Non–cp1252-mapped characters are appended as their UTF-8 bytes (unchanged).
 */
export function fixMojibakeText(text) {
  const bytes = [];
  for (const ch of text) {
    const cp = ch.charCodeAt(0);
    const byte = charToByte(cp);
    if (byte !== null) {
      bytes.push(byte);
    } else {
      for (const b of Buffer.from(ch, "utf8")) bytes.push(b);
    }
  }
  return Buffer.from(bytes).toString("utf8");
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(name.name)) continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, files);
    else if (TEXT_EXTENSIONS.has(path.extname(name.name).toLowerCase())) files.push(full);
  }
  return files;
}

function collectFiles(roots) {
  const seen = new Set();
  const files = [];
  for (const root of roots) {
    for (const file of walk(root)) {
      if (!seen.has(file)) {
        seen.add(file);
        files.push(file);
      }
    }
  }
  return files;
}

function main() {
  const extraRoots = process.argv.slice(2).map((r) => path.resolve(r));
  const roots = [...DEFAULT_ROOTS, ...extraRoots].filter((r, i, a) => a.indexOf(r) === i);
  const missing = roots.filter((r) => !fs.existsSync(r));
  if (missing.length === roots.length) {
    console.error("No sample roots found:", missing.join(", "));
    process.exit(1);
  }
  for (const m of missing) console.warn("Skipping missing root:", m);

  const files = collectFiles(roots.filter((r) => fs.existsSync(r)));
  let scanned = 0;
  let fixed = 0;
  const fixedPaths = [];

  for (const filePath of files) {
    const original = fs.readFileSync(filePath, "utf8");
    scanned++;
    if (!MOJIBAKE_MARKER.test(original)) continue;

    const next = fixMojibakeText(original);
    if (next === original) continue;

    if (MOJIBAKE_MARKER.test(next)) {
      console.warn("Still has mojibake after fix:", filePath);
    }

    fs.writeFileSync(filePath, next, "utf8");
    fixed++;
    fixedPaths.push(filePath);
  }

  console.log(`Scanned ${scanned} text file(s) under ${roots.join(", ")}`);
  console.log(`Fixed ${fixed} file(s)`);
  if (fixedPaths.length) {
    for (const p of fixedPaths) console.log("  ", p);
  }

  const remaining = files.filter((f) => MOJIBAKE_MARKER.test(fs.readFileSync(f, "utf8")));
  if (remaining.length) {
    console.error(`\n${remaining.length} file(s) still contain mojibake markers:`);
    for (const f of remaining) console.error("  ", f);
    process.exit(1);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
