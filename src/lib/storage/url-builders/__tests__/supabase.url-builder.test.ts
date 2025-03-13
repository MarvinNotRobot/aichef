import { describe, it, expect, vi } from 'vitest';
import { SupabaseUrlBuilder } from '../supabase.url-builder';

// Mock logger
vi.mock('../../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('SupabaseUrlBuilder', () => {
  const baseUrl = 'https://test.supabase.co';
  const bucketName = 'test-bucket';
  const builder = new SupabaseUrlBuilder(baseUrl, bucketName);

  describe('getPublicUrl', () => {
    it('should generate correct public URL', () => {
      const path = 'test/image.jpg';
      const expected = `${baseUrl}/storage/v1/object/public/${bucketName}/${path}`;
      expect(builder.getPublicUrl(path)).toBe(expected);
    });

    it('should handle empty path', () => {
      expect(builder.getPublicUrl('')).toBe('');
    });

    it('should handle base URL with trailing slash', () => {
      const builderWithSlash = new SupabaseUrlBuilder(`${baseUrl}/`, bucketName);
      const path = 'test/image.jpg';
      const expected = `${baseUrl}/storage/v1/object/public/${bucketName}/${path}`;
      expect(builderWithSlash.getPublicUrl(path)).toBe(expected);
    });
  });

  describe('getSignedUrl', () => {
    it('should throw error as it requires Supabase client', async () => {
      await expect(builder.getSignedUrl('test/image.jpg'))
        .rejects.toThrow('Use Supabase client for signed URLs');
    });

    it('should throw error for empty path', async () => {
      await expect(builder.getSignedUrl(''))
        .rejects.toThrow('Path is required');
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate correct download URL', () => {
      const path = 'test/image.jpg';
      const expected = `${baseUrl}/storage/v1/object/download/${bucketName}/${path}`;
      expect(builder.getDownloadUrl(path)).toBe(expected);
    });

    it('should handle empty path', () => {
      expect(builder.getDownloadUrl('')).toBe('');
    });
  });

  describe('getUploadUrl', () => {
    it('should generate correct upload URL', () => {
      const path = 'test/image.jpg';
      const expected = `${baseUrl}/storage/v1/object/${bucketName}/${path}`;
      expect(builder.getUploadUrl(path)).toBe(expected);
    });

    it('should handle empty path', () => {
      expect(builder.getUploadUrl('')).toBe('');
    });
  });
});