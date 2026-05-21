import { memo, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useQueuedIframeSrc } from "@/hooks/useQueuedIframeSrc";
import type { WebsiteSample } from "@/types/samples";

export const WebsiteSampleCard = memo(function WebsiteSampleCard({ sample }: { sample: WebsiteSample }) {
  const previewRootRef = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(previewRootRef);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gridIframePainted, setGridIframePainted] = useState(false);

  const sampleUrl = `/samples/websites/${sample.folder}/`;
  const posterUrl = sample.posterUrl?.trim() ?? "";
  const hasPoster = posterUrl.length > 0;
  const hasWaitingRoom = sample.category === "clinics" && sample.clinicExperience === "waiting-room";
  const waitingRoomPath = (sample.waitingRoomPath || "waiting").replace(/^\/+/, "");
  const waitingRoomUrl = hasWaitingRoom ? `${sampleUrl}${waitingRoomPath}` : null;

  const shouldLoadGridIframe = inView && !hasPoster;
  const { src: iframeSrc, onIframeLoad, onIframeError } = useQueuedIframeSrc(sampleUrl, shouldLoadGridIframe);

  const { src: dialogIframeSrc, onIframeLoad: onDialogLoad, onIframeError: onDialogError } = useQueuedIframeSrc(
    sampleUrl,
    hasPoster && dialogOpen
  );

  useEffect(() => {
    setGridIframePainted(false);
  }, [iframeSrc]);

  const openInNewTab = () => {
    window.open(sampleUrl, "_blank", "noopener,noreferrer");
  };

  const openWaitingRoomInNewTab = () => {
    if (waitingRoomUrl) {
      window.open(waitingRoomUrl, "_blank", "noopener,noreferrer");
    }
  };

  const openWhatsAppInquire = () => {
    const code = sample.displayCode ? `${sample.displayCode} — ` : "";
    const msg = `Hi Shyara Marketing, I just viewed ${code}"${sample.name}" on your website samples and I'd like something similar for my business. Can we discuss the scope, timeline, and pricing?`;
    window.open(`https://wa.me/919584661610?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const handlePreviewClick = () => {
    if (hasPoster) {
      setDialogOpen(true);
    } else {
      openInNewTab();
    }
  };

  const handleGridIframeLoad = () => {
    setGridIframePainted(true);
    onIframeLoad();
  };

  const handleGridIframeError = () => {
    setGridIframePainted(true);
    onIframeError();
  };

  const showGridLoader = !hasPoster && (!iframeSrc || !gridIframePainted);

  return (
    <>
      <div
        data-testid="website-sample-card"
        className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg transition-shadow"
      >
        <div ref={previewRootRef} className="relative w-full aspect-video bg-muted overflow-hidden">
          {hasPoster ? (
            <>
              <img
                src={posterUrl}
                alt={`${sample.name} preview poster`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button type="button" onClick={openInNewTab} className="bg-white text-black hover:bg-gray-100">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Site
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 origin-top-left scale-[0.25] w-[400%] h-[400%] pointer-events-none">
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
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
                </div>
              )}
              {iframeSrc && gridIframePainted && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-auto">
                  <Button type="button" onClick={openInNewTab} className="bg-white text-black hover:bg-gray-100">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Site
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 [content-visibility:auto] [contain-intrinsic-size:auto_200px]">
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
            <h3 className="font-semibold text-foreground">{sample.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{sample.description}</p>
          <div className={`grid gap-2 mt-3 ${waitingRoomUrl ? "grid-cols-2" : "grid-cols-1"}`}>
            <Button variant="outline" size="sm" className="min-h-11 flex-1" onClick={handlePreviewClick}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {hasPoster ? "Live preview" : "Preview"}
            </Button>
            {waitingRoomUrl && (
              <Button variant="outline" size="sm" className="min-h-11 flex-1" onClick={openWaitingRoomInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Waiting Room
              </Button>
            )}
            <Button
              size="sm"
              className={`min-h-11 bg-[#25D366] hover:bg-[#1fb855] text-white ${waitingRoomUrl ? "col-span-2" : ""}`}
              onClick={openWhatsAppInquire}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Inquire
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[min(96vw,72rem)] w-[min(96vw,72rem)] p-0 gap-0 h-[min(90vh,52rem)] flex flex-col border-border sm:rounded-lg overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b border-border text-left space-y-1">
            <DialogTitle className="text-base pr-8">{sample.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Live interactive preview of {sample.name}. Use your browser back gesture or close to exit.
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
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

WebsiteSampleCard.displayName = "WebsiteSampleCard";
