import { describe, it, expect, vi } from 'vitest';
import { S3UrlBuilder } from '../s3.url-builder';

// Mock logger
vi.mock('../../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('S3UrlBuilder', () => {
  const bucketName = 'test-bucket';
  const region = 'us-west-2';
  const cdnUrl = 'https://cdn.example.com';
  
  describe('without CDN', () => {
    const builder = new S3UrlBuilder(bucketName, region);

    it('should generate correct public URL', () => {
      const path = 'test/image.jpg';
      const expected = `https://${bucketName}.s3.${region}.amazonaws.com/${path}`;
      expect(builder.getPublicUrl(path)).toBe(expected);
    });

    it('should handle empty path', () => {
      expect(builder.getPublicUrl('')).toBe('');
    });

    it('should generate correct download URL', () => {
      const path = 'test/image.jpg';
      const expected = `https://${bucketName}.s3.${region}.amazonaws.com/${path}?response-content-disposition=attachment`;
      expect(builder.getDownloadUrl(path)).toBe(expected);
    });

    it('should generate correct upload URL', () => {
      const path = 'test/image.jpg';
      const expected = `https://${bucketName}.s3.${region}.amazonaws.com/${path}`;
      expect(builder.getUploadUrl(path)).toBe(expected);
    });
  });

  describe('with CDN', () => {
    const builder = new S3UrlBuilder(bucketName, region, cdnUrl);

    it('should use CDN URL for public URL', () => {
      const path = 'test/image.jpg';
      const expected = `${cdnUrl}/${path}`;
      expect(builder.getPublicUrl(path)).toBe(expected);
    });

    it('should handle CDN URL with trailing slash', () => {
      const builderWithSlash = new S3UrlBuilder(bucketName, region, `${cdnUrl}/`);
      const path = 'test/image.jpg';
      const expected = `${cdnUrl}/${path}`;
      expect(builderWithSlash.getPublicUrl(path)).toBe(expected);
    });

    it('should still use S3 URL for download URL', () => {
      const path = 'test/image.jpg';
      const expected = `https://${bucketName}.s3.${region}.amazonaws.com/${path}?response-content-disposition=attachment`;
      expect(builder.getDownloadUrl(path)).toBe(expected);
    });

    it('should still use S3 URL for upload URL', () => {
      const path = 'test/image.jpg';
      const expected = `https://${bucketName}.s3.${region}.amazonaws.com/${path}`;
      expect(builder.getUploadUrl(path)).toBe(expected);
    });
  });

  describe('getSignedUrl', () => {
    const builder = new S3UrlBuilder(bucketName, region);

    it('should throw error as it requires S3 client', async () => {
      await expect(builder.getSignedUrl('test/image.jpg'))
        .rejects.toThrow('Use S3 client for signed URLs');
    });

    it('should throw error for empty path', async () => {
      await expect(builder.getSignedUrl(''))
        .rejects.toThrow('Path is required');
    });
  });
});