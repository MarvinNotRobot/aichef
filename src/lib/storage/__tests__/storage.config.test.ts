import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageConfig, StorageProvider } from '../storage.config';

// Mock logger
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('storageConfig', () => {
  beforeEach(() => {
    // Reset configuration before each test
    storageConfig.reset();
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock import.meta.env
    vi.stubGlobal('import.meta', { 
      env: {}
    });
  });

  it('should initialize with default values', () => {
    expect(storageConfig.provider).toBe(StorageProvider.SUPABASE);
    expect(storageConfig.bucketName).toBe('recipe-photos');
    expect(storageConfig.region).toBeUndefined();
    expect(storageConfig.cdnUrl).toBeUndefined();
  });

  it('should update configuration', () => {
    storageConfig.update({
      provider: StorageProvider.S3,
      bucketName: 'test-bucket',
      region: 'us-west-2',
      cdnUrl: 'https://cdn.example.com'
    });

    expect(storageConfig.provider).toBe(StorageProvider.S3);
    expect(storageConfig.bucketName).toBe('test-bucket');
    expect(storageConfig.region).toBe('us-west-2');
    expect(storageConfig.cdnUrl).toBe('https://cdn.example.com');
  });

  it('should throw error when required S3 environment variables are missing', () => {
    // Mock S3 provider without required vars
    vi.stubGlobal('import.meta', { 
      env: {
        VITE_STORAGE_PROVIDER: 's3'
      }
    });

    expect(() => {
      // Re-run validation by importing the module again
      vi.isolateModules(() => {
        require('../storage.config');
      });
    }).toThrow('Missing required AWS configuration');
  });

  it('should initialize S3 configuration from environment', () => {
    // Mock S3 environment variables
    vi.stubGlobal('import.meta', { 
      env: {
        VITE_STORAGE_PROVIDER: 's3',
        VITE_AWS_ACCESS_KEY_ID: 'test-key',
        VITE_AWS_SECRET_ACCESS_KEY: 'test-secret',
        VITE_AWS_REGION: 'us-west-2',
        VITE_S3_BUCKET_NAME: 'test-bucket',
        VITE_STORAGE_CDN_URL: 'https://cdn.example.com'
      }
    });

    // Re-run initialization by importing the module again
    vi.isolateModules(() => {
      const { storageConfig: configFromEnv } = require('../storage.config');
      expect(configFromEnv.provider).toBe(StorageProvider.S3);
      expect(configFromEnv.bucketName).toBe('test-bucket');
      expect(configFromEnv.region).toBe('us-west-2');
      expect(configFromEnv.cdnUrl).toBe('https://cdn.example.com');
    });
  });

  it('should initialize Supabase configuration from environment', () => {
    // Mock Supabase environment variables
    vi.stubGlobal('import.meta', { 
      env: {
        VITE_STORAGE_PROVIDER: 'supabase',
        VITE_SUPABASE_STORAGE_BUCKET: 'supabase-bucket',
        VITE_SUPABASE_STORAGE_URL: 'https://test.supabase.co/storage/v1',
        VITE_STORAGE_CDN_URL: 'https://cdn.example.com'
      }
    });

    // Re-run initialization by importing the module again
    vi.isolateModules(() => {
      const { storageConfig: configFromEnv } = require('../storage.config');
      expect(configFromEnv.provider).toBe(StorageProvider.SUPABASE);
      expect(configFromEnv.bucketName).toBe('supabase-bucket');
      expect(configFromEnv.cdnUrl).toBe('https://cdn.example.com');
    });
  });

  it('should handle case-insensitive provider names', () => {
    vi.stubGlobal('import.meta', { 
      env: {
        VITE_STORAGE_PROVIDER: 'SUPABASE',
        VITE_SUPABASE_STORAGE_BUCKET: 'test-bucket'
      }
    });

    vi.isolateModules(() => {
      const { storageConfig: configFromEnv } = require('../storage.config');
      expect(configFromEnv.provider).toBe(StorageProvider.SUPABASE);
    });
  });
});