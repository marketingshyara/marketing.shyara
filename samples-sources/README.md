# Website sample sources

Editable TanStack Start projects used to build static previews under `frontend/public/samples/websites/`.

| Folder | Deploy slug | Original path |
|--------|-------------|---------------|
| `gym-ironforge` | `gym-ironforge-website` | `E:\Websites\Templates for Marketing-Shyara\Gym\fit-foundry-front-main` |
| `car-wash-auto-care` | `car-wash-auto-care-website` | `E:\Websites\Templates for Marketing-Shyara\Car Wash\shyara-sparkle-web-main` |

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
