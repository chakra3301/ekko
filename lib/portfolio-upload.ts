// Portfolio upload helper with local mock storage
// Simulates S3 uploads for development
import { getStorage } from './storage';

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface UploadedMedia {
  mediaUrl: string;
  thumbnailUrl: string;
  type: MediaType;
  fileName: string;
  fileSize: number;
}

/**
 * Generate a thumbnail URL for an image
 * In production, this would be generated server-side
 */
function generateThumbnailUrl(mediaUrl: string): string {
  // For images, use the same URL (in production, generate actual thumbnail)
  // For videos/audio, return a placeholder
  return mediaUrl;
}

/**
 * Upload a file to storage (mock implementation)
 * Returns mediaUrl and thumbnailUrl
 */
export async function uploadPortfolioFile(
  file: File,
  type: MediaType
): Promise<UploadedMedia> {
  // Validate file type
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const validVideoTypes = ['video/mp4', 'video/webm'];
  const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];

  const isValidType =
    (type === 'IMAGE' && validImageTypes.includes(file.type)) ||
    (type === 'VIDEO' && validVideoTypes.includes(file.type)) ||
    (type === 'AUDIO' && validAudioTypes.includes(file.type));

  if (!isValidType) {
    throw new Error(`Invalid file type for ${type}. File type: ${file.type}`);
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate a unique file path
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileKey = `portfolio/${timestamp}-${sanitizedFileName}`;

  // Get storage instance (uses LocalStorage in development)
  const storage = getStorage();

  // Determine content type
  const contentType = file.type || 'application/octet-stream';

  // Upload file
  const mediaUrl = await storage.upload(fileKey, buffer, contentType);

  // Generate thumbnail URL
  const thumbnailUrl =
    type === 'IMAGE'
      ? generateThumbnailUrl(mediaUrl)
      : type === 'VIDEO'
        ? `/api/thumbnails/${fileKey}` // Placeholder for video thumbnail
        : '/api/thumbnails/audio-placeholder.png'; // Placeholder for audio

  return {
    mediaUrl,
    thumbnailUrl,
    type,
    fileName: file.name,
    fileSize: file.size,
  };
}

/**
 * Upload multiple portfolio files
 */
export async function uploadPortfolioFiles(
  files: File[],
  types: MediaType[]
): Promise<UploadedMedia[]> {
  if (files.length !== types.length) {
    throw new Error('Files and types arrays must have the same length');
  }

  const uploadPromises = files.map((file, index) =>
    uploadPortfolioFile(file, types[index])
  );

  return Promise.all(uploadPromises);
}

/**
 * Validate portfolio file before upload
 */
export function validatePortfolioFile(
  file: File,
  type: MediaType
): { valid: boolean; error?: string } {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const validVideoTypes = ['video/mp4', 'video/webm'];
  const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];

  const validTypes =
    type === 'IMAGE'
      ? validImageTypes
      : type === 'VIDEO'
        ? validVideoTypes
        : validAudioTypes;

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Expected ${type.toLowerCase()}, got ${file.type}`,
    };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

