/** Unified Shyara marketing favicons (served from sample public/). */
export function shyaraFaviconLinks() {
  const base = import.meta.env.BASE_URL;
  return [
    { rel: "shortcut icon", href: `${base}favicon.ico` },
    { rel: "icon", type: "image/png", sizes: "48x48", href: `${base}favicon-48x48.png` },
    { rel: "icon", type: "image/png", sizes: "32x32", href: `${base}favicon-32x32.png` },
    { rel: "icon", type: "image/png", sizes: "16x16", href: `${base}favicon-16x16.png` },
    { rel: "apple-touch-icon", sizes: "180x180", href: `${base}apple-touch-icon.png` },
  ] as const;
}
