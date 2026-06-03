/** Absolute URL for static files under public/samples/websites (posters, previews). */
export function sampleAssetUrl(assetPath: string): string {
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  const base = import.meta.env.BASE_URL ?? "/";
  if (base === "/") return path;
  return `${base.replace(/\/$/, "")}${path}`;
}
