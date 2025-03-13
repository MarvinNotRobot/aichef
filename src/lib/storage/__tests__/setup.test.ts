import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeStorage, getStorageService } from '../setup';
import { StorageFactory } from '../storage.factory';
import { storageConfig, StorageProvider } from '../storage.config';

// Mock dependencies
vi.mock('../storage.factory');
vi.mock('../storage.config');
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Storage Setup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage config
    storageConfig.reset();
  });

  describe('initializeStorage', () => {
    it('should initialize storage service with default configuration', async () => {
      const mockStorageService = {};
      (StorageFactory.getInstance as any).mockReturnValue(mockStorageService);

      await initializeStorage();

      expect(storageConfig.update).toHaveBeenCalledWith({
        provider: StorageProvider.SUPABASE,
        bucketName: 'recipe-photos',
        cdnUrl: undefined
      });

      expect(StorageFactory.getInstance).toHaveBeenCalledWith({
        provider: StorageProvider.SUPABASE,
        bucketName: 'recipe-photos',
        cdnUrl: undefined
      });
    });

    it('should initialize storage service with environment configuration', async () => {
      const mockEnv = {
        VITE_STORAGE_PROVIDER: 'S3',
        VITE_STORAGE_BUCKET: 'custom-bucket',
        VITE_STORAGE_CDN_URL: 'https://cdn.example.com'
      };

      // Mock import.meta.env
      vi.stubGlobal('import.meta', { env: mockEnv });

      const mockStorageService = {};
      (StorageFactory.getInstance as any).mockReturnValue(mockStorageService);

      await initializeStorage();

      expect(storageConfig.update).toHaveBeenCalledWith({
        provider: 'S3',
        bucketName: 'custom-bucket',
        cdnUrl: 'https://cdn.example.com'
      });

      expect(StorageFactory.getInstance).toHaveBeenCalledWith({
        provider: 'S3',
        bucketName: 'custom-bucket',
        cdnUrl: 'https://cdn.example.com'
      });
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      (StorageFactory.getInstance as any).mockRejectedValue(error);

      await expect(initializeStorage()).rejects.toThrow('Initialization failed');
    });
  });

  describe('getStorageService', () => {
    it('should return initialized storage service', () => {
      const mockStorageService = {};
      (StorageFactory.getInstance as any).mockReturnValue(mockStorageService);

      const result = getStorageService();
      expect(result).toBe(mockStorageService);
    });

    it('should throw error if storage service is not initialized', () => {
      (StorageFactory.getInstance as any).mockImplementation(() => {
        throw new Error('Storage service not initialized');
      });

      expect(() => getStorageService()).toThrow('Storage service not initialized');
    });
  });
});