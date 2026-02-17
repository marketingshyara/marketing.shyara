// Types for SMM samples (Google Drive integration)
export interface DriveMedia {
  id: string;
  name: string;
  thumbnailUrl: string;
  fullUrl: string;
  type: 'image' | 'video';
  mimeType?: string;
}

export interface DriveConfig {
  apiKey: string;
  imagesFolderId: string;
  reelsFolderId: string;
}

export interface DriveApiResponse {
  media: DriveMedia[];
  loading: boolean;
  error: string | null;
}

// Types for Website samples
export interface SampleCategory {
  id: string;
  name: string;
  icon: string;
}

export interface WebsiteSample {
  id: string;
  name: string;
  description: string;
  folder: string;
  file: string;
  category: string;
}

export interface WebsitesManifest {
  categories: SampleCategory[];
  samples: WebsiteSample[];
}
