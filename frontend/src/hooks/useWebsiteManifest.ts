import { useEffect, useState } from "react";
import type { WebsiteSample, SampleCategory, WebsitesManifest } from "@/types/samples";

export function useWebsiteManifest() {
  const [categories, setCategories] = useState<SampleCategory[]>([]);
  const [samples, setSamples] = useState<WebsiteSample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManifest() {
      try {
        setLoading(true);
        const response = await fetch("/samples/websites/manifest.json");
        if (!response.ok) {
          setCategories([]);
          setSamples([]);
          return;
        }
        const data: WebsitesManifest = await response.json();
        setCategories(data.categories || []);
        setSamples(data.samples || []);
      } catch {
        setCategories([]);
        setSamples([]);
      } finally {
        setLoading(false);
      }
    }
    loadManifest();
  }, []);

  return { categories, samples, loading };
}
