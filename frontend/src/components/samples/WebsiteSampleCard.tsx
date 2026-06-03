import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInView } from "@/hooks/useInView";
import { usePreferPosterGrid } from "@/hooks/use-mobile";
import { useQueuedIframeSrc } from "@/hooks/useQueuedIframeSrc";
import { sampleAssetUrl } from "@/lib/sampleAssetUrl";
import type { WebsiteSample } from "@/types/samples";

const DESKTOP_ROOT_MARGIN = "280px 0px";

function SamplePosterPlaceholder({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/60 px-4 text-center">
      <Play className="h-8 w-8 text-muted-foreground/70 mb-2" aria-hidden />
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tap to preview</span>
      <span className="mt-2 text-sm font-semibold text-foreground line-clamp-2">{name}</span>
    </div>
  );
}

export const WebsiteSampleCard = memo(function WebsiteSampleCard({ sample }: { sample: WebsiteSample }) {
  const previewRootRef = useRef<HTMLDivElement>(null);
  const usePosterGrid = usePreferPosterGrid();
  const inView = useInView(previewRootRef, {
    enabled: !usePosterGrid,
    rootMargin: DESKTOP_ROOT_MARGIN,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gridIframePainted, setGridIframePainted] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const sampleUrl = sampleAssetUrl(`/samples/websites/${sample.folder}/`);
  const posterPath = sample.posterUrl?.trim() ?? "";
  const posterUrl = posterPath ? sampleAssetUrl(posterPath) : "";
  const hasPosterAsset = posterUrl.length > 0 && !posterFailed;
  const hasWaitingRoom = sample.category === "clinics" && sample.clinicExperience === "waiting-room";
  const waitingRoomPath = (sample.waitingRoomPath || "waiting").replace(/^\/+/, "");
  const waitingRoomUrl = hasWaitingRoom ? `${sampleUrl}${waitingRoomPath}` : null;

  useEffect(() => {
    setPosterFailed(false);
  }, [posterUrl]);

  const shouldLoadGridIframe = !usePosterGrid && inView;
  const shouldLoadDialogIframe = usePosterGrid && dialogOpen;

  const { src: iframeSrc, onIframeLoad, onIframeError } = useQueuedIframeSrc(
    sampleUrl,
    shouldLoadGridIframe
  );
  const { src: dialogIframeSrc, onIframeLoad: onDialogLoad, onIframeError: onDialogError } =
    useQueuedIframeSrc(sampleUrl, shouldLoadDialogIframe);

  useEffect(() => {
    setGridIframePainted(false);
  }, [iframeSrc]);

  const openInNewTab = useCallback(() => {
    window.open(sampleUrl, "_blank", "noopener,noreferrer");
  }, [sampleUrl]);

  const openWaitingRoomInNewTab = useCallback(() => {
    if (waitingRoomUrl) {
      window.open(waitingRoomUrl, "_blank", "noopener,noreferrer");
    }
  }, [waitingRoomUrl]);

  const openWhatsAppInquire = useCallback(() => {
    const code = sample.displayCode ? `${sample.displayCode} — ` : "";
    const msg = `Hi Shyara Marketing, I just viewed ${code}"${sample.name}" on your website samples and I'd like something similar for my business. Can we discuss the scope, timeline, and pricing?`;
    window.open(`https://wa.me/919584661610?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }, [sample.displayCode, sample.name]);

  const openLivePreview = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handlePreviewClick = useCallback(() => {
    if (usePosterGrid) {
      openLivePreview();
    } else {
      openInNewTab();
    }
  }, [usePosterGrid, openLivePreview, openInNewTab]);

  const handleGridIframeLoad = () => {
    setGridIframePainted(true);
    onIframeLoad();
  };

  const handleGridIframeError = () => {
    setGridIframePainted(true);
    onIframeError();
  };

  const showGridLoader = !usePosterGrid && (!iframeSrc || !gridIframePainted);

  const previewLabel = `Open live preview of ${sample.name}`;

  return (
    <>
      <article
        data-testid="website-sample-card"
        className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg transition-shadow"
      >
        {usePosterGrid ? (
          <button
            type="button"
            onClick={openLivePreview}
            aria-label={previewLabel}
            className="relative block w-full aspect-video bg-muted overflow-hidden touch-pan-y [overflow-anchor:none] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {hasPosterAsset ? (
              <img
                src={posterUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setPosterFailed(true)}
              />
            ) : (
              <SamplePosterPlaceholder name={sample.name} />
            )}
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
              <Play className="h-3.5 w-3.5 text-accent" aria-hidden />
              Live preview
            </span>
          </button>
        ) : (
          <div
            ref={previewRootRef}
            className="relative w-full aspect-video bg-muted overflow-hidden touch-pan-y [overflow-anchor:none]"
          >
            <div className="absolute inset-0 origin-top-left scale-[0.25] w-[400%] h-[400%] pointer-events-none contain-[layout_paint]">
              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  className="h-full w-full border-0"
                  onLoad={handleGridIframeLoad}
                  onError={handleGridIframeError}
                  title={sample.name}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="h-full w-full bg-muted" aria-hidden />
              )}
            </div>
            {showGridLoader && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted" aria-busy="true">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
                <span className="sr-only">Loading preview</span>
              </div>
            )}
            {iframeSrc && gridIframePainted && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <Button type="button" onClick={openInNewTab} className="bg-white text-black hover:bg-gray-100 pointer-events-auto">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Site
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5">
          {(sample.clinicType || sample.category === "clinics") && (
            <div className="flex flex-wrap gap-2 mb-2">
              {sample.clinicType && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {sample.clinicType}
                </span>
              )}
              {sample.category === "clinics" && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    hasWaitingRoom ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {hasWaitingRoom ? "Waiting Room + QR" : "Standard Clinic Website"}
                </span>
              )}
            </div>
          )}
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-foreground">
              {sample.displayCode}
            </span>
            <h3 className="font-semibold text-foreground text-base leading-snug">{sample.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{sample.description}</p>
          <div className={`grid gap-2 mt-3 ${waitingRoomUrl ? "grid-cols-2" : "grid-cols-1"}`}>
            <Button variant="outline" size="sm" className="min-h-11 w-full" onClick={handlePreviewClick}>
              {usePosterGrid ? (
                <Play className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              )}
              {usePosterGrid ? "Live preview" : "Preview"}
            </Button>
            {waitingRoomUrl && (
              <Button variant="outline" size="sm" className="min-h-11 w-full" onClick={openWaitingRoomInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2 shrink-0" aria-hidden />
                Waiting Room
              </Button>
            )}
            <Button
              size="sm"
              className={`min-h-11 w-full bg-[#25D366] hover:bg-[#1fb855] text-white ${waitingRoomUrl ? "col-span-2" : ""}`}
              onClick={openWhatsAppInquire}
            >
              <MessageCircle className="h-4 w-4 mr-1 shrink-0" aria-hidden />
              Inquire
            </Button>
          </div>
        </div>
      </article>

      {usePosterGrid && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[min(96vw,72rem)] w-[min(96vw,72rem)] p-0 gap-0 h-[min(90dvh,52rem)] flex flex-col border-border sm:rounded-lg overflow-hidden">
            <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b border-border text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pr-8">
                <DialogTitle className="text-base leading-snug">{sample.name}</DialogTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full sm:w-auto shrink-0"
                  onClick={openInNewTab}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View full site
                </Button>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Interactive preview — scroll inside the frame or open the full site in a new tab.
              </DialogDescription>
            </DialogHeader>
            <div className="relative flex-1 min-h-0 bg-muted">
              {dialogIframeSrc ? (
                <iframe
                  src={dialogIframeSrc}
                  className="absolute inset-0 h-full w-full border-0"
                  title={`${sample.name} live preview`}
                  onLoad={onDialogLoad}
                  onError={onDialogError}
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" aria-busy="true">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
                  <p className="text-sm text-muted-foreground">Loading preview…</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});

WebsiteSampleCard.displayName = "WebsiteSampleCard";
