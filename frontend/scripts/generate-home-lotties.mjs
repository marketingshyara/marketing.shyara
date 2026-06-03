/**
 * Regenerates brand-colored pulse Lottie JSON for the marketing home page.
 * Run: node scripts/generate-home-lotties.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "lottie");

/** Matches index.css brand HSL (light theme anchors) */
const colors = {
  emerald: [0.078, 0.541, 0.345],
  sky: [0.055, 0.569, 0.82],
  violet: [0.42, 0.33, 0.78],
  coral: [0.89, 0.42, 0.28],
  amber: [0.94, 0.58, 0.12],
  teal: [0.12, 0.52, 0.48],
};

function makeLayer(ind, nm, ellipseSize, color, scaleMin, scaleMax, opacityMin, opacityMax, op) {
  const mid = Math.floor(op / 2);
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0, s: [opacityMin] },
          { t: mid, s: [opacityMax] },
          { t: op, s: [opacityMin] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [100, 100, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          { t: 0, s: [scaleMin, scaleMin, 100] },
          { t: mid, s: [scaleMax, scaleMax, 100] },
          { t: op, s: [scaleMin, scaleMin, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          { ty: "el", d: 1, s: { a: 0, k: [ellipseSize, ellipseSize] }, p: { a: 0, k: [0, 0] } },
          { ty: "fl", c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 } },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
          },
        ],
      },
    ],
    ip: 0,
    op,
    st: 0,
    bm: 0,
  };
}

function pulseLottie(name, color, op = 90) {
  return {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op,
    w: 200,
    h: 200,
    nm: name,
    ddd: 0,
    assets: [],
    layers: [
      makeLayer(1, "Outer", 152, color, 52, 98, 28, 52, op),
      makeLayer(2, "Mid", 108, color, 62, 100, 40, 72, op),
      makeLayer(3, "Core", 68, color, 75, 100, 85, 100, op),
    ],
  };
}

const files = [
  ["website-live.json", "website-live", colors.emerald],
  ["trust-badge.json", "trust-badge", colors.emerald],
  ["search-nearby.json", "search-nearby", colors.sky],
  ["ai-answer.json", "ai-answer", colors.violet],
  ["maps-geo.json", "maps-geo", colors.violet],
  ["connect-india.json", "connect-india", colors.amber],
  ["leads-pulse.json", "leads-pulse", colors.coral],
  ["proof-showcase.json", "proof-showcase", colors.teal],
];

for (const [file, name, color] of files) {
  writeFileSync(join(root, file), JSON.stringify(pulseLottie(name, color), null, 0));
  console.log("wrote", file);
}
