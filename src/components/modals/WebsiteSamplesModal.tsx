import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, FolderOpen } from "lucide-react";
import type { WebsiteSample, WebsitesManifest } from "@/types/samples";

interface WebsiteSamplesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Custom hook to load website samples from manifest
function useWebsiteSamples() {
  const [samples, setSamples] = useState<WebsiteSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadManifest() {
      try {
        setLoading(true);
        const response = await fetch("/samples/websites/manifest.json");
        
        if (!response.ok) {
          if (response.status === 404) {
            // Manifest doesn't exist yet - that's okay
            setSamples([]);
            setError(null);
            return;
          }
          throw new Error("Failed to load samples");
        }

        const data: WebsitesManifest = await response.json();
        setSamples(data.samples || []);
        setError(null);
      } catch (err) {
        console.error("Error loading website samples:", err);
        setSamples([]);
        setError(null); // Don't show error, just show empty state
      } finally {
        setLoading(false);
      }
    }

    loadManifest();
  }, []);

  return { samples, loading, error };
}

// Website sample card with iframe preview
function WebsiteSampleCard({ sample }: { sample: WebsiteSample }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const sampleUrl = `/samples/websites/${sample.folder}/${sample.file}`;

  const openInNewTab = () => {
    window.open(sampleUrl, "_blank");
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Iframe Preview Container */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {/* Scaled iframe container */}
        <div className="absolute inset-0 origin-top-left scale-[0.25] w-[400%] h-[400%]">
          <iframe
            src={sampleUrl}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
            title={sample.name}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        
        {/* Loading overlay */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button 
            onClick={openInNewTab}
            className="bg-white text-black hover:bg-gray-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Site
          </Button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{sample.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{sample.description}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 w-full"
          onClick={openInNewTab}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Preview
        </Button>
      </div>
    </div>
  );
}

export function WebsiteSamplesModal({ open, onOpenChange }: WebsiteSamplesModalProps) {
  const { samples, loading, error } = useWebsiteSamples();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Website Samples</DialogTitle>
          <DialogDescription className="text-base">
            Explore our portfolio of websites. Click on any preview to see the full 
            website in a new tab.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading samples...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-destructive">{error}</p>
            </div>
          ) : samples.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center mb-2">Website samples coming soon!</p>
              <p className="text-sm text-center opacity-75">
                We're preparing our portfolio for you to explore.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {samples.map((sample) => (
                <WebsiteSampleCard key={sample.id} sample={sample} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              window.open(
                "https://wa.me/919584661610?text=Hi%2C%20I%27d%20like%20to%20discuss%20Website%20Development%20services.",
                "_blank"
              );
            }}
          >
            Want a Website Like These?
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
