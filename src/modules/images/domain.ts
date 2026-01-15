export type ImageStatus = 'pending_upload' | 'pending_published' | 'published' | 'deleted';

export interface Image {
  id: string;
  s3Key: string;
  status: ImageStatus;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  uploadedBy: string | null;
  uploadedAt: Date | null;
  createdAt: Date;
}

export interface CreateImage {
  s3Key: string;
  mimeType: string;
  uploadedBy?: string;
}

export interface CreatedImage {
  id: string;
  s3Key: string;
}

export interface UpdateImageMetadata {
  width?: number;
  height?: number;
  fileSize?: number;
}
