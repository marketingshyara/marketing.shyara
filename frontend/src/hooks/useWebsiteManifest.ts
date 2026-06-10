import { useEffect, useState } from "react";
import type { WebsiteSample, SampleCategory, WebsitesManifest } from "@/types/samples";
import { websiteSamplesManifest } from "@/lib/websiteSamplesManifest";

export function useWebsiteManifest() {
  const [categories, setCategories] = useState<SampleCategory[]>(
    websiteSamplesManifest.categories ?? []
  );
  const [samples, setSamples] = useState<WebsiteSample[]>(
    websiteSamplesManifest.samples ?? []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function refreshManifest() {
      try {
        const response = await fetch("/samples/websites/manifest.json");
        if (!response.ok) return;
        const data: WebsitesManifest = await response.json();
        setCategories(data.categories || []);
        setSamples(data.samples || []);
      } catch {
        /* keep bundled manifest */
      }
    }
    void refreshManifest();
  }, []);

  return { categories, samples, loading };
}
