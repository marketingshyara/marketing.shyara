# Website sample sources

Editable TanStack Start projects used to build static previews under `frontend/public/samples/websites/`.

| Folder | Deploy slug | Original path |
|--------|-------------|---------------|
| `gym-ironforge` | `gym-ironforge-website` | `E:\Websites\Templates for Marketing-Shyara\Gym\fit-foundry-front-main` |
| `car-wash-auto-care` | `car-wash-auto-care-website` | `E:\Websites\Templates for Marketing-Shyara\Car Wash\shyara-sparkle-web-main` |
| `yoga-ananda` | `yoga-ananda-website` | `E:\Websites\Templates for Marketing-Shyara\Yoga\flow-motion-pages-main` |
| `florist-bloom-vine` | `florist-bloom-vine-website` | Bloom & Vine florist (formerly `bloom-whispers-animate-main`) |
| `realestate-verdant-heights` | `realestate-verdant-heights-website` | Verdant Heights real estate (formerly `serene-nest-showcase-main`) |

## Build

From repo root:

```bash
cd frontend
npm run build:website-samples
```

Then rebuild the marketing frontend (`npm run build`) so `dist/` includes the new static files. Refresh posters after UI changes:

```bash
npm run capture-sample-posters:dist
```

## Toolchain

- **Vite**: standard `@tanstack/react-start/plugin/vite` (no Lovable config packages).
- **Static hosting**: each `vite.config.ts` sets `base` to `/samples/websites/<slug>/`; SPA prerender emits `_shell.html`, copied to `index.html` by `build-website-samples.mjs`. Client routes (`/services`, `/about`, etc.) need SPA fallback — see `frontend/serve.json`, `render.yaml`, and `frontend/src/plugins/sampleStaticMiddleware.ts`. When adding a new TanStack sample slug, add matching rewrite rules there.
- **Favicons**: unified Shyara marketing icons in each project `public/`; linked from `src/lib/shyaraFaviconLinks.ts` in `__root.tsx` `head()`.

## Edit a sample

1. Change source in `samples-sources/<name>/src/`.
2. Run `npm run build:website-samples` in `frontend/`.
3. Run `npm run capture-sample-posters:dist` if thumbnails need updating.

## Garbled text (â€", Â°, etc.) in static samples

Restaurant, clinic, astrology, and other **prebuilt** samples under `frontend/public/samples/websites/` can show UTF-8 mojibake when punctuation was saved with the wrong encoding. From `frontend/`:

```bash
npm run fix:website-sample-encoding
npm run verify:website-sample-encoding
```

To fix an external Lovable/template tree (exclude `node_modules` automatically):

```bash
node scripts/fix-sample-encoding.mjs "E:/path/to/template-project"
```

Only files that still contain mojibake markers are rewritten — already-correct UTF-8 (em dashes, degree symbols) is left unchanged.
