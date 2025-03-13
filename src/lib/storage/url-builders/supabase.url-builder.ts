import { appLogger } from '../../logger';
import type { IStorageUrlBuilder } from '../types';

export class SupabaseUrlBuilder implements IStorageUrlBuilder {
  private readonly baseUrl: string;
  private readonly bucketName: string;

  constructor(baseUrl: string, bucketName: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.bucketName = bucketName;

    appLogger.info('Supabase URL builder initialized', {
      baseUrl: this.baseUrl,
      bucketName: this.bucketName
    });
  }

  getPublicUrl(path: string): string {
    if (!path) return '';
    return `${this.baseUrl}/storage/v1/object/public/${this.bucketName}/${path}`;
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    if (!path) throw new Error('Path is required');
    // Signed URLs are handled by the Supabase client directly
    throw new Error('Use Supabase client for signed URLs');
  }

  getDownloadUrl(path: string): string {
    if (!path) return '';
    return `${this.baseUrl}/storage/v1/object/download/${this.bucketName}/${path}`;
  }

  getUploadUrl(path: string): string {
    if (!path) return '';
    return `${this.baseUrl}/storage/v1/object/${this.bucketName}/${path}`;
  }
}