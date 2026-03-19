import { useState, useEffect, useCallback } from "react";
import type { DriveMedia, DriveApiResponse } from "@/types/samples";

// Configuration - will be populated when API key is provided
const DRIVE_CONFIG = {
  apiKey: "", // Add your Google Drive API key here
  imagesFolderId: "", // Add folder ID for images
  reelsFolderId: "", // Add folder ID for reels
};

/**
 * Custom hook for fetching media from Google Drive
 * Currently prepared for future API integration
 * 
 * When API key is provided, uncomment the fetch logic below
 */
export function useGoogleDrive(
  folderId: string | null,
  mediaType: 'image' | 'video' = 'image'
): DriveApiResponse {
  const [media, setMedia] = useState<DriveMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    // If no API key or folder ID is configured, return empty
    if (!DRIVE_CONFIG.apiKey || !folderId) {
      setMedia([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Google Drive API v3 endpoint
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
      const fields = encodeURIComponent(
        "files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink)"
      );
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&key=${DRIVE_CONFIG.apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from Google Drive");
      }

      const data = await response.json();
      
      const mediaItems: DriveMedia[] = data.files
        .filter((file: any) => {
          if (mediaType === 'image') {
            return file.mimeType?.startsWith('image/');
          }
          return file.mimeType?.startsWith('video/');
        })
        .map((file: any) => ({
          id: file.id,
          name: file.name,
          thumbnailUrl: file.thumbnailLink || "",
          fullUrl: file.webContentLink || file.webViewLink || "",
          type: file.mimeType?.startsWith('video/') ? 'video' : 'image',
          mimeType: file.mimeType,
        }));

      setMedia(mediaItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [folderId, mediaType]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, loading, error };
}

/**
 * Get the configured folder IDs
 */
export function getDriveFolderIds() {
  return {
    images: DRIVE_CONFIG.imagesFolderId || null,
    reels: DRIVE_CONFIG.reelsFolderId || null,
  };
}

/**
 * Check if Google Drive is configured
 */
export function isDriveConfigured(): boolean {
  return Boolean(
    DRIVE_CONFIG.apiKey && 
    (DRIVE_CONFIG.imagesFolderId || DRIVE_CONFIG.reelsFolderId)
  );
}
