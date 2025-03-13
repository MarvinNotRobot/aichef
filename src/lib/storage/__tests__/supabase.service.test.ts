import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseStorageService } from '../supabase.service';
import { supabase } from '../../supabase/client';

// Mock Supabase client
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

// Mock logger
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('SupabaseStorageService', () => {
  const service = new SupabaseStorageService('test-bucket');
  const mockStorageFrom = supabase.storage.from();

  beforeEach(() => {
    vi.clearAllMocks();
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
        expect.any(Object)
      );
      expect(result).toBe(mockPath);
    });

    it('should handle upload failures', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.upload.mockResolvedValue({
        data: null,
        error: new Error('Upload failed')
      });

      await expect(service.uploadFile(mockFile, mockPath))
        .rejects.toThrow('Failed to upload file');
    });

    it('should handle missing path in response', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.upload.mockResolvedValue({
        data: {},
        error: null
      });

      await expect(service.uploadFile(mockFile, mockPath))
        .rejects.toThrow('No path returned from upload');
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

    it('should handle deletion failures', async () => {
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

    it('should handle URL generation failures', async () => {
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.createSignedUrl.mockResolvedValue({
        data: null,
        error: new Error('URL generation failed')
      });

      await expect(service.getSignedUrl(mockPath))
        .rejects.toThrow('Failed to generate signed URL');
    });

    it('should handle missing signed URL in response', async () => {
      const mockPath = 'test/path/test.jpg';

      mockStorageFrom.createSignedUrl.mockResolvedValue({
        data: {},
        error: null
      });

      await expect(service.getSignedUrl(mockPath))
        .rejects.toThrow('No signed URL returned');
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
    it('should generate correct public URL', () => {
      const mockPath = 'test/path/test.jpg';
      const mockPublicUrl = 'https://example.com/public-url';

      mockStorageFrom.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl }
      });

      const result = service.getPublicUrl(mockPath);
      expect(result).toBe(mockPublicUrl);
    });

    it('should handle empty path', () => {
      const result = service.getPublicUrl('');
      expect(result).toBe('');
    });
  });
});