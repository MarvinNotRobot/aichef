import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '../storage.service';
import { supabase } from '../../supabase/client';
import { storageConfig, StorageProvider } from '../storage.config';

// Mock Supabase client
vi.mock('../../supabase/client', () => ({
  supabase: {
    storage: {
      listBuckets: vi.fn(),
      createBucket: vi.fn(),
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn()
      })
    }
  }
}));

// Mock logger
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBucketIfNotExists', () => {
    it('should create a bucket if it does not exist', async () => {
      // Mock bucket does not exist
      (supabase.storage.listBuckets as any).mockResolvedValue({
        data: [{ name: 'other-bucket' }],
        error: null
      });
      
      (supabase.storage.createBucket as any).mockResolvedValue({
        error: null
      });
      
      await StorageService.createBucketIfNotExists();
      
      expect(supabase.storage.listBuckets).toHaveBeenCalled();
      expect(supabase.storage.createBucket).toHaveBeenCalledWith(
        storageConfig.bucketName,
        { public: true }
      );
    });

    it('should not create a bucket if it already exists', async () => {
      // Mock bucket exists
      (supabase.storage.listBuckets as any).mockResolvedValue({
        data: [{ name: storageConfig.bucketName }],
        error: null
      });
      
      await StorageService.createBucketIfNotExists();
      
      expect(supabase.storage.listBuckets).toHaveBeenCalled();
      expect(supabase.storage.createBucket).not.toHaveBeenCalled();
    });

    it('should throw an error if listing buckets fails', async () => {
      (supabase.storage.listBuckets as any).mockResolvedValue({
        data: null,
        error: new Error('Failed to list buckets')
      });
      
      await expect(StorageService.createBucketIfNotExists()).rejects.toThrow('Failed to list buckets');
    });

    it('should throw an error if creating bucket fails', async () => {
      (supabase.storage.listBuckets as any).mockResolvedValue({
        data: [{ name: 'other-bucket' }],
        error: null
      });
      
      (supabase.storage.createBucket as any).mockResolvedValue({
        error: new Error('Failed to create bucket')
      });
      
      await expect(StorageService.createBucketIfNotExists()).rejects.toThrow('Failed to create bucket');
    });
  });

  describe('uploadPhoto', () => {
    it('should upload a photo successfully', async () => {
      // Mock createBucketIfNotExists
      vi.spyOn(StorageService, 'createBucketIfNotExists').mockResolvedValue();
      
      // Mock file upload
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockRecipeId = '123';
      
      (supabase.storage.from().upload as any).mockResolvedValue({
        data: { path: 'test-path' },
        error: null
      });
      
      const result = await StorageService.uploadPhoto(mockFile, mockRecipeId);
      
      expect(StorageService.createBucketIfNotExists).toHaveBeenCalled();
      expect(supabase.storage.from).toHaveBeenCalledWith(storageConfig.bucketName);
      expect(supabase.storage.from().upload).toHaveBeenCalledWith(
        expect.stringContaining(mockRecipeId),
        mockFile,
        expect.any(Object)
      );
      expect(result).toContain(mockRecipeId);
      expect(result).toContain('test.jpg');
    });

    it('should throw an error if upload fails', async () => {
      // Mock createBucketIfNotExists
      vi.spyOn(StorageService, 'createBucketIfNotExists').mockResolvedValue();
      
      // Mock file upload failure
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockRecipeId = '123';
      
      (supabase.storage.from().upload as any).mockResolvedValue({
        data: null,
        error: new Error('Upload failed')
      });
      
      await expect(StorageService.uploadPhoto(mockFile, mockRecipeId)).rejects.toThrow('Upload failed');
    });
  });

  describe('getPhotoUrl', () => {
    it('should return a public URL for a file path', () => {
      const mockFilePath = 'test/path.jpg';
      const mockPublicUrl = 'https://example.com/test/path.jpg';
      
      (supabase.storage.from().getPublicUrl as any).mockReturnValue({
        data: { publicUrl: mockPublicUrl }
      });
      
      const result = StorageService.getPhotoUrl(mockFilePath);
      
      expect(supabase.storage.from).toHaveBeenCalledWith(storageConfig.bucketName);
      expect(supabase.storage.from().getPublicUrl).toHaveBeenCalledWith(mockFilePath);
      expect(result).toBe(mockPublicUrl);
    });

    it('should return an empty string for empty file path', () => {
      const result = StorageService.getPhotoUrl('');
      expect(result).toBe('');
    });

    it('should use CDN URL if configured', () => {
      const originalConfig = { ...storageConfig };
      const mockCdnUrl = 'https://cdn.example.com';
      const mockFilePath = 'test/path.jpg';
      
      try {
        // Update config with CDN URL
        storageConfig.cdnUrl = mockCdnUrl;
        
        const result = StorageService.getPhotoUrl(mockFilePath);
        
        expect(result).toBe(`${mockCdnUrl}/${mockFilePath}`);
        expect(supabase.storage.from().getPublicUrl).not.toHaveBeenCalled();
      } finally {
        // Restore original config
        Object.assign(storageConfig, originalConfig);
      }
    });
  });

  describe('deletePhoto', () => {
    it('should delete a photo successfully', async () => {
      const mockFilePath = 'test/path.jpg';
      
      (supabase.storage.from().remove as any).mockResolvedValue({
        error: null
      });
      
      await StorageService.deletePhoto(mockFilePath);
      
      expect(supabase.storage.from).toHaveBeenCalledWith(storageConfig.bucketName);
      expect(supabase.storage.from().remove).toHaveBeenCalledWith([mockFilePath]);
    });

    it('should do nothing for empty file path', async () => {
      await StorageService.deletePhoto('');
      
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should throw an error if delete fails', async () => {
      const mockFilePath = 'test/path.jpg';
      
      (supabase.storage.from().remove as any).mockResolvedValue({
        error: new Error('Delete failed')
      });
      
      await expect(StorageService.deletePhoto(mockFilePath)).rejects.toThrow('Delete failed');
    });
  });
});