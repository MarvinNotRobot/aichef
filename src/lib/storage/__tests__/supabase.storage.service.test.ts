import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseStorageService } from '../supabase.storage.service';
import { supabase } from '../../supabase/client';
import { supabaseStorageConfig } from '../supabase.storage.config';
import { UrlBuilderFactory } from '../url-builders/url-builder.factory';
import { StorageProvider } from '../storage.config';

// Mock dependencies
vi.mock('../../supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        remove: vi.fn(),
        createSignedUrl: vi.fn(),
        getPublicUrl: vi.fn()
      })
    }
  }
}));

vi.mock('../url-builders/url-builder.factory');
vi.mock('../supabase.storage.config', () => ({
  supabaseStorageConfig: {
    bucketName: 'test-bucket',
    maxRetries: 3,
    retryDelay: 100,
    storageUrl: 'https://test.supabase.co/storage/v1',
    uploadOptions: {
      cacheControl: '31536000',
      upsert: false
    }
  }
}));

vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  const mockStorageFrom = supabase.storage.from();
  const mockUrlBuilder = {
    getPublicUrl: vi.fn(),
    getSignedUrl: vi.fn(),
    getDownloadUrl: vi.fn(),
    getUploadUrl: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (UrlBuilderFactory.createBuilder as any).mockReturnValue(mockUrlBuilder);
    service = new SupabaseStorageService();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(UrlBuilderFactory.createBuilder).toHaveBeenCalledWith({
        provider: StorageProvider.SUPABASE,
        bucketName: supabaseStorageConfig.bucketName,
        baseUrl: supabaseStorageConfig.storageUrl
      });
    });

    it('should use custom bucket name if provided', () => {
      const customBucketName = 'custom-bucket';
      service = new SupabaseStorageService(customBucketName);

      expect(UrlBuilderFactory.createBuilder).toHaveBeenCalledWith({
        provider: StorageProvider.SUPABASE,
        bucketName: customBucketName,
        baseUrl: supabaseStorageConfig.storageUrl
      });
    });
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.upload.mockResolvedValue({
        data: { path: mockPath },
        error: null
      });

      const result = await service.uploadFile(mockFile, mockPath);

      expect(mockStorageFrom.upload).toHaveBeenCalledWith(
        mockPath,
        mockFile,
        expect.objectContaining({
          contentType: 'image/jpeg',
          cacheControl: '31536000',
          upsert: false
        })
      );
      expect(result).toBe(mockPath);
    });

    it('should retry on failure', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'test/path/test.jpg';

      // Fail twice, succeed on third try
      mockStorageFrom.upload
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce({
          data: { path: mockPath },
          error: null
        });

      const result = await service.uploadFile(mockFile, mockPath);

      expect(mockStorageFrom.upload).toHaveBeenCalledTimes(3);
      expect(result).toBe(mockPath);
    });

    it('should throw error after max retries', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.upload.mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadFile(mockFile, mockPath))
        .rejects.toThrow('Failed to upload file');

      expect(mockStorageFrom.upload).toHaveBeenCalledTimes(3);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.remove.mockResolvedValue({
        data: {},
        error: null
      });

      await service.deleteFile(mockPath);

      expect(mockStorageFrom.remove).toHaveBeenCalledWith([mockPath]);
    });

    it('should handle empty path gracefully', async () => {
      await service.deleteFile('');
      expect(mockStorageFrom.remove).not.toHaveBeenCalled();
    });

    it('should throw error on deletion failure', async () => {
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.remove.mockResolvedValue({
        data: null,
        error: new Error('Delete failed')
      });

      await expect(service.deleteFile(mockPath))
        .rejects.toThrow('Failed to delete file');
    });
  });

  describe('getSignedUrl', () => {
    it('should generate a signed URL successfully', async () => {
      const mockPath = 'test/path/test.jpg';
      const mockSignedUrl = 'https://example.com/signed-url';

      mockStorageFrom.createSignedUrl.mockResolvedValue({
        data: { signedUrl: mockSignedUrl },
        error: null
      });

      const result = await service.getSignedUrl(mockPath);

      expect(mockStorageFrom.createSignedUrl).toHaveBeenCalledWith(
        mockPath,
        3600
      );
      expect(result).toBe(mockSignedUrl);
    });

    it('should handle empty path', async () => {
      await expect(service.getSignedUrl(''))
        .rejects.toThrow('File path is required');
    });

    it('should throw error on URL generation failure', async () => {
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.createSignedUrl.mockResolvedValue({
        data: null,
        error: new Error('URL generation failed')
      });

      await expect(service.getSignedUrl(mockPath))
        .rejects.toThrow('Failed to generate signed URL');
    });

    it('should use custom expiration time', async () => {
      const mockPath = 'test/path/test.jpg';
      const customExpiration = 7200;

      mockStorageFrom.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-url' },
        error: null
      });

      await service.getSignedUrl(mockPath, customExpiration);

      expect(mockStorageFrom.createSignedUrl).toHaveBeenCalledWith(
        mockPath,
        customExpiration
      );
    });
  });

  describe('getPublicUrl', () => {
    it('should use URL builder for public URLs', () => {
      const mockPath = 'test/path/test.jpg';
      const mockPublicUrl = 'https://test.supabase.co/storage/v1/public/test-bucket/test.jpg';
      
      mockUrlBuilder.getPublicUrl.mockReturnValue(mockPublicUrl);
      
      const result = service.getPublicUrl(mockPath);
      
      expect(mockUrlBuilder.getPublicUrl).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockPublicUrl);
    });

    it('should handle empty path', () => {
      mockUrlBuilder.getPublicUrl.mockReturnValue('');
      
      const result = service.getPublicUrl('');
      
      expect(mockUrlBuilder.getPublicUrl).toHaveBeenCalledWith('');
      expect(result).toBe('');
    });
  });
});