import { appLogger } from '../../logger';
import type { IStorageUrlBuilder } from '../types';

export class S3UrlBuilder implements IStorageUrlBuilder {
  private readonly bucketName: string;
  private readonly region: string;
  private readonly cdnUrl?: string;

  constructor(bucketName: string, region: string, cdnUrl?: string) {
    this.bucketName = bucketName;
    this.region = region;
    this.cdnUrl = cdnUrl?.replace(/\/$/, ''); // Remove trailing slash if present

    appLogger.info('S3 URL builder initialized', {
      bucketName: this.bucketName,
      region: this.region,
      hasCdnUrl: !!this.cdnUrl
    });
  }

  getPublicUrl(path: string): string {
    if (!path) return '';

    // Use CDN URL if available
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${path}`;
    }

    // Otherwise use S3 URL
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${path}`;
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    if (!path) throw new Error('Path is required');
    // Signed URLs are handled by the S3 client directly
    throw new Error('Use S3 client for signed URLs');
  }

  getDownloadUrl(path: string): string {
    if (!path) return '';
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${path}?response-content-disposition=attachment`;
  }

  getUploadUrl(path: string): string {
    if (!path) return '';
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${path}`;
  }
}