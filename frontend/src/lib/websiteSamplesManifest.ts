import type { WebsiteSample, WebsitesManifest } from "@/types/samples";
import { sampleAssetUrl } from "@/lib/sampleAssetUrl";
import bundledManifest from "@/data/websites-manifest.json";

export const websiteSamplesManifest = bundledManifest as WebsitesManifest;

/** Matches capture-sample-posters.mjs viewport (1280×720 screenshots). */
export const SAMPLE_POSTER_WIDTH = 1280;
export const SAMPLE_POSTER_HEIGHT = 720;
export const SAMPLE_POSTER_ASPECT_RATIO = SAMPLE_POSTER_WIDTH / SAMPLE_POSTER_HEIGHT;

export function websiteSamplesWithPosters(samples: WebsiteSample[] = websiteSamplesManifest.samples) {
  return samples
    .filter((s) => s.posterUrl?.trim())
    .map((s) => ({
      id: s.id,
      name: s.name,
      src: sampleAssetUrl(s.posterUrl!.trim()),
      alt: `${s.name} — website hero preview`,
    }));
}
