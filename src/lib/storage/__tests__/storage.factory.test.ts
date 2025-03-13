import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageFactory } from '../storage.factory';
import { StorageProvider } from '../storage.config';
import { S3StorageService } from '../s3.service';
import { SupabaseStorageService } from '../supabase.storage.service';

// Mock storage services
vi.mock('../s3.service');
vi.mock('../supabase.storage.service');

// Mock logger
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('StorageFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    StorageFactory.resetInstance();
  });

  describe('createService', () => {
    it('should create S3 storage service', () => {
      const config = {
        provider: StorageProvider.S3,
        bucketName: 'test-bucket',
        region: 'us-west-2'
      };

      const service = StorageFactory.createService(config);
      expect(service).toBeInstanceOf(S3StorageService);
    });

    it('should create Supabase storage service', () => {
      const config = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket'
      };

      const service = StorageFactory.createService(config);
      expect(service).toBeInstanceOf(SupabaseStorageService);
    });

    it('should throw error for unsupported provider', () => {
      const config = {
        provider: 'unsupported' as StorageProvider,
        bucketName: 'test-bucket'
      };

      expect(() => StorageFactory.createService(config))
        .toThrow('Unsupported storage provider: unsupported');
    });
  });

  describe('getInstance', () => {
    it('should create and return singleton instance', () => {
      const config = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket'
      };

      const service1 = StorageFactory.getInstance(config);
      const service2 = StorageFactory.getInstance();

      expect(service1).toBe(service2);
      expect(service1).toBeInstanceOf(SupabaseStorageService);
    });

    it('should throw error when getting instance without initialization', () => {
      expect(() => StorageFactory.getInstance())
        .toThrow('Storage service not initialized');
    });

    it('should allow reinitializing with new config', () => {
      const s3Config = {
        provider: StorageProvider.S3,
        bucketName: 'test-bucket',
        region: 'us-west-2'
      };

      const supabaseConfig = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket'
      };

      const s3Service = StorageFactory.getInstance(s3Config);
      expect(s3Service).toBeInstanceOf(S3StorageService);

      const supabaseService = StorageFactory.getInstance(supabaseConfig);
      expect(supabaseService).toBeInstanceOf(SupabaseStorageService);
      expect(supabaseService).not.toBe(s3Service);
    });
  });

  describe('resetInstance', () => {
    it('should reset the singleton instance', () => {
      const config = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket'
      };

      const service = StorageFactory.getInstance(config);
      expect(service).toBeInstanceOf(SupabaseStorageService);

      StorageFactory.resetInstance();

      expect(() => StorageFactory.getInstance())
        .toThrow('Storage service not initialized');
    });
  });
});