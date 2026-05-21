import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const routesDir = join(import.meta.dirname, "../src/routes");
const servicesDir = join(import.meta.dirname, "../src/services");

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...collectTsFiles(p));
    } else if (name.name.endsWith(".ts")) {
      out.push(p);
    }
  }
  return out;
}

describe("updateMany/deleteMany are scoped by primary key", () => {
  it("every updateMany in routes/services includes id or leadId in where block", () => {
    const files = [...collectTsFiles(routesDir), ...collectTsFiles(servicesDir)];
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const blocks = text.match(/\.updateMany\(\{[\s\S]*?\}\)/g) ?? [];
      for (const block of blocks) {
        if (!/\bwhere:\s*\{[\s\S]*?\bid\b/.test(block) && !/\bwhere:\s*\{[\s\S]*?leadId\b/.test(block)) {
          offenders.push(`${file}: ${block.slice(0, 80)}…`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
