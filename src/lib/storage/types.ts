export interface IStorageService {
  uploadFile(file: File, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
  getPublicUrl(path: string): string;
}

export interface IStorageUrlBuilder {
  getPublicUrl(path: string): string;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
  getDownloadUrl(path: string): string;
  getUploadUrl(path: string): string;
}

export interface StorageConfig {
  provider: StorageProvider;
  bucketName: string;
  region?: string;
  cdnUrl?: string;
}

export interface StorageError extends Error {
  code?: string;
  statusCode?: number;
  requestId?: string;
  details?: any;
}

export interface StorageUploadResult {
  path: string;
  url: string;
  size: number;
  contentType: string;
}

export interface StorageDeleteResult {
  path: string;
  success: boolean;
}

export interface StorageUrlOptions {
  expiresIn?: number;
  contentType?: string;
  contentDisposition?: string;
  cacheControl?: string;
}