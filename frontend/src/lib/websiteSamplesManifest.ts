import type { WebsiteSample, WebsitesManifest } from "@/types/samples";
import { sampleAssetUrl } from "@/lib/sampleAssetUrl";
import bundledManifest from "@/data/websites-manifest.json";

export const websiteSamplesManifest = bundledManifest as WebsitesManifest;

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
