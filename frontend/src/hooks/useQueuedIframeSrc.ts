import { useCallback, useEffect, useRef, useState } from "react";
import { acquireIframePreviewSlot, releaseIframePreviewSlot } from "@/lib/iframePreviewSlot";

/**
 * When `shouldLoad` becomes true, acquires a global slot then sets `src` to `url`.
 * Releases the slot on iframe load/error, when `shouldLoad`/`url` turn off, or on unmount
 * if the slot was held before the iframe finished loading.
 */
export function useQueuedIframeSrc(url: string | null, shouldLoad: boolean) {
  const [src, setSrc] = useState<string | undefined>(undefined);
  /** True after acquire resolves for this cycle until load/error/cleanup releases. */
  const pendingReleaseRef = useRef(false);

  useEffect(() => {
    if (!shouldLoad || !url) {
      setSrc(undefined);
      if (pendingReleaseRef.current) {
        pendingReleaseRef.current = false;
        releaseIframePreviewSlot();
      }
      return;
    }

    let cancelled = false;

    void acquireIframePreviewSlot().then(() => {
      if (cancelled) {
        releaseIframePreviewSlot();
        return;
      }
      pendingReleaseRef.current = true;
      setSrc(url);
    });

    return () => {
      cancelled = true;
      if (pendingReleaseRef.current) {
        pendingReleaseRef.current = false;
        releaseIframePreviewSlot();
      }
    };
  }, [shouldLoad, url]);

  const onIframeDone = useCallback(() => {
    if (pendingReleaseRef.current) {
      pendingReleaseRef.current = false;
      releaseIframePreviewSlot();
    }
  }, []);

  return { src, onIframeLoad: onIframeDone, onIframeError: onIframeDone };
}
