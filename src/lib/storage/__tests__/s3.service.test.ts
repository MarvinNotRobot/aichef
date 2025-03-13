import { describe, it, expect, vi, beforeEach } from 'vitest';
import { S3StorageService } from '../s3.service';
import { s3Client, s3Config } from '../s3.config';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UrlBuilderFactory } from '../url-builders/url-builder.factory';

// Mock dependencies
vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');
vi.mock('../s3.config', () => ({
  s3Client: {
    send: vi.fn()
  },
  s3Config: {
    bucketName: 'test-bucket',
    region: 'us-west-2',
    uploadOptions: {
      CacheControl: 'max-age=31536000'
    }
  }
}));

vi.mock('../url-builders/url-builder.factory');
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('S3StorageService', () => {
  let service: S3StorageService;
  const mockUrlBuilder = {
    getPublicUrl: vi.fn(),
    getSignedUrl: vi.fn(),
    getDownloadUrl: vi.fn(),
    getUploadUrl: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (UrlBuilderFactory.createBuilder as any).mockReturnValue(mockUrlBuilder);
    service = new S3StorageService();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'test/path/test.jpg';

      (s3Client.send as any).mockResolvedValue({});

      const result = await service.uploadFile(mockFile, mockPath);

      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: s3Config.bucketName,
        Key: mockPath,
        Body: expect.any(ArrayBuffer),
        ContentType: 'image/jpeg',
        ContentLength: mockFile.size,
        CacheControl: s3Config.uploadOptions.CacheControl,
        Metadata: {
          'original-filename': 'test.jpg'
        }
      });
      expect(s3Client.send).toHaveBeenCalled();
      expect(result).toBe(mockPath);
    });

    it('should handle upload failures', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'test/path/test.jpg';

      (s3Client.send as any).mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadFile(mockFile, mockPath))
        .rejects.toThrow('Upload failed');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const mockPath = 'test/path/test.jpg';

      (s3Client.send as any).mockResolvedValue({});

      await service.deleteFile(mockPath);

      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: s3Config.bucketName,
        Key: mockPath
      });
      expect(s3Client.send).toHaveBeenCalled();
    });

    it('should handle empty path gracefully', async () => {
      await service.deleteFile('');
      expect(s3Client.send).not.toHaveBeenCalled();
    });

    it('should handle deletion failures', async () => {
      const mockPath = 'test/path/test.jpg';

      (s3Client.send as any).mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteFile(mockPath))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('getSignedUrl', () => {
    it('should generate a signed URL successfully', async () => {
      const mockPath = 'test/path/test.jpg';
      const mockSignedUrl = 'https://test-bucket.s3.us-west-2.amazonaws.com/test.jpg?signed=true';

      (getSignedUrl as any).mockResolvedValue(mockSignedUrl);

      const result = await service.getSignedUrl(mockPath);

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: s3Config.bucketName,
        Key: mockPath
      });
      expect(getSignedUrl).toHaveBeenCalled();
      expect(result).toBe(mockSignedUrl);
    });

    it('should handle empty path', async () => {
      await expect(service.getSignedUrl(''))
        .rejects.toThrow('File path is required');
    });

    it('should handle URL generation failures', async () => {
      const mockPath = 'test/path/test.jpg';

      (getSignedUrl as any).mockRejectedValue(new Error('URL generation failed'));

      await expect(service.getSignedUrl(mockPath))
        .rejects.toThrow('URL generation failed');
    });
  });

  describe('getPublicUrl', () => {
    it('should use URL builder for public URLs', () => {
      const mockPath = 'test/path/test.jpg';
      const mockPublicUrl = 'https://test-bucket.s3.us-west-2.amazonaws.com/test.jpg';
      
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