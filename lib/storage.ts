// S3-compatible storage interface and local mock implementation
// Provides a unified interface for file storage operations
// Can be swapped between S3-compatible services (AWS S3, DigitalOcean Spaces, etc.) and local storage

/**
 * Storage interface for S3-compatible operations
 * Implement this interface for different storage backends
 */
export interface StorageInterface {
  /**
   * Upload a file to storage
   * @param key - File path/key in storage
   * @param file - File buffer or stream
   * @param contentType - MIME type of the file
   * @returns URL or path to the uploaded file
   */
  upload(key: string, file: Buffer | Uint8Array, contentType: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param key - File path/key in storage
   */
  delete(key: string): Promise<void>;

  /**
   * Get a signed URL for temporary access to a file
   * @param key - File path/key in storage
   * @param expiresIn - Expiration time in seconds (default: 3600)
   * @returns Signed URL
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Check if a file exists
   * @param key - File path/key in storage
   * @returns True if file exists
   */
  exists(key: string): Promise<boolean>;
}

/**
 * Local file system storage implementation (mock)
 * Stores files in the local filesystem for development
 * In production, replace with S3-compatible implementation
 */
export class LocalStorage implements StorageInterface {
  private basePath: string;

  constructor(basePath: string = './storage') {
    this.basePath = basePath;
  }

  async upload(key: string, _file: Buffer | Uint8Array, contentType: string): Promise<string> {
    // In a real implementation, this would write to the filesystem
    // For now, return a mock path
    const path = `${this.basePath}/${key}`;
    // eslint-disable-next-line no-console
    console.log(`[LocalStorage] Would upload file to: ${path} (${contentType})`);
    return path;
  }

  async delete(key: string): Promise<void> {
    // In a real implementation, this would delete from the filesystem
    // eslint-disable-next-line no-console
    console.log(`[LocalStorage] Would delete file: ${key}`);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // In a real implementation, this would generate a signed URL
    // For local storage, return a mock URL
    return `/storage/${key}?expires=${Date.now() + expiresIn * 1000}`;
  }

  async exists(key: string): Promise<boolean> {
    // In a real implementation, this would check the filesystem
    // eslint-disable-next-line no-console
    console.log(`[LocalStorage] Would check existence of: ${key}`);
    return false;
  }
}

/**
 * S3-compatible storage implementation (placeholder)
 * Implement this using AWS SDK or compatible library
 * Environment variables required:
 * - STORAGE_ENDPOINT: S3 endpoint URL
 * - STORAGE_ACCESS_KEY_ID: Access key
 * - STORAGE_SECRET_ACCESS_KEY: Secret key
 * - STORAGE_BUCKET: Bucket name
 * - STORAGE_REGION: Region (optional)
 */
export class S3Storage implements StorageInterface {
  // These properties will be used when S3 implementation is added
  // For now, we store them but don't use them to avoid TypeScript errors
  private readonly config = {
    bucket: process.env.STORAGE_BUCKET || '',
    endpoint: process.env.STORAGE_ENDPOINT || '',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
    region: process.env.STORAGE_REGION || 'us-east-1',
  };

  constructor() {
    // Configuration is stored in this.config for future use
    void this.config; // Suppress unused variable warning
  }

  async upload(_key: string, _file: Buffer | Uint8Array, _contentType: string): Promise<string> {
    // TODO: Implement S3 upload using AWS SDK or compatible library
    // Example with AWS SDK v3:
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const client = new S3Client({ ... });
    // await client.send(new PutObjectCommand({ ... }));
    throw new Error('S3Storage.upload() not implemented. Use LocalStorage for development.');
  }

  async delete(_key: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3Storage.delete() not implemented. Use LocalStorage for development.');
  }

  async getSignedUrl(_key: string, _expiresIn: number = 3600): Promise<string> {
    // TODO: Implement S3 signed URL generation
    throw new Error('S3Storage.getSignedUrl() not implemented. Use LocalStorage for development.');
  }

  async exists(_key: string): Promise<boolean> {
    // TODO: Implement S3 file existence check
    throw new Error('S3Storage.exists() not implemented. Use LocalStorage for development.');
  }
}

/**
 * Get storage instance based on environment
 * Uses LocalStorage in development, S3Storage in production
 */
export function getStorage(): StorageInterface {
  const useS3 = process.env.STORAGE_PROVIDER === 's3' || process.env.NODE_ENV === 'production';

  if (useS3) {
    return new S3Storage();
  }

  return new LocalStorage();
}

