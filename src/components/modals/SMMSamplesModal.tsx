import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Image, Video, X, ChevronLeft, ChevronRight, Loader2, FolderOpen } from "lucide-react";
import { useGoogleDrive, getDriveFolderIds, isDriveConfigured } from "@/hooks/use-google-drive";
import type { DriveMedia } from "@/types/samples";

interface SMMSamplesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lightbox component for viewing media
function Lightbox({ 
  media, 
  currentIndex, 
  onClose, 
  onPrev, 
  onNext 
}: { 
  media: DriveMedia[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = media[currentIndex];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Navigation buttons */}
      {media.length > 1 && (
        <>
          <button 
            onClick={onPrev}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button 
            onClick={onNext}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </>
      )}

      {/* Media content */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {current.type === 'video' ? (
          <video 
            src={current.fullUrl} 
            controls 
            autoPlay
            className="max-w-full max-h-[90vh] rounded-lg"
          />
        ) : (
          <img 
            src={current.fullUrl} 
            alt={current.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
}

// Gallery grid component
function MediaGallery({ 
  media, 
  loading, 
  error,
  onMediaClick 
}: { 
  media: DriveMedia[];
  loading: boolean;
  error: string | null;
  onMediaClick: (index: number) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!isDriveConfigured()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-center mb-2">Google Drive integration coming soon!</p>
        <p className="text-sm text-center opacity-75">
          Our portfolio samples will be available here shortly.
        </p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
        <p>No samples available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {media.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onMediaClick(index)}
          className="relative aspect-square overflow-hidden rounded-lg bg-muted group cursor-pointer"
        >
          <img 
            src={item.thumbnailUrl} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Video className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </button>
      ))}
    </div>
  );
}

export function SMMSamplesModal({ open, onOpenChange }: SMMSamplesModalProps) {
  const [activeTab, setActiveTab] = useState<"images" | "reels">("images");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const folderIds = getDriveFolderIds();
  
  const { 
    media: images, 
    loading: imagesLoading, 
    error: imagesError 
  } = useGoogleDrive(folderIds.images, 'image');
  
  const { 
    media: reels, 
    loading: reelsLoading, 
    error: reelsError 
  } = useGoogleDrive(folderIds.reels, 'video');

  const currentMedia = activeTab === "images" ? images : reels;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrev = () => {
    setLightboxIndex((prev) => 
      prev === 0 ? currentMedia.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setLightboxIndex((prev) => 
      prev === currentMedia.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Social Media Samples</DialogTitle>
            <DialogDescription className="text-base">
              Browse through our portfolio of social media content - from eye-catching 
              image posts to engaging video reels.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "images" | "reels")} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto">
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="reels" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Reels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="mt-6">
              <MediaGallery 
                media={images}
                loading={imagesLoading}
                error={imagesError}
                onMediaClick={openLightbox}
              />
            </TabsContent>

            <TabsContent value="reels" className="mt-6">
              <MediaGallery 
                media={reels}
                loading={reelsLoading}
                error={reelsError}
                onMediaClick={openLightbox}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                window.open(
                  "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%20just%20checked%20out%20your%20social%20media%20samples%20and%20I%20love%20the%20quality.%20I%20want%20similar%20content%20for%20my%20brand.%20Can%20we%20discuss%20which%20plan%20would%20work%20best%3F",
                  "_blank"
                );
              }}
            >
              Want Similar Content for Your Brand?
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox overlay */}
      {lightboxOpen && currentMedia.length > 0 && (
        <Lightbox
          media={currentMedia}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </>
  );
}
