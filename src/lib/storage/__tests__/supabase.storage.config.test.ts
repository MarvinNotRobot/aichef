import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseStorageConfig } from '../supabase.storage.config';

// Mock logger
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('supabaseStorageConfig', () => {
  beforeEach(() => {
    // Reset configuration before each test
    supabaseStorageConfig.reset();
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock import.meta.env with required vars
    vi.stubGlobal('import.meta', { 
      env: {
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-key',
        VITE_SUPABASE_STORAGE_URL: 'https://test.supabase.co/storage/v1',
        VITE_SUPABASE_STORAGE_BUCKET: 'test-bucket'
      }
    });
  });

  it('should initialize with environment values', () => {
    expect(supabaseStorageConfig.bucketName).toBe('test-bucket');
    expect(supabaseStorageConfig.storageUrl).toBe('https://test.supabase.co/storage/v1');
  });

  it('should throw error when required environment variables are missing', () => {
    // Mock missing environment variables
    vi.stubGlobal('import.meta', { 
      env: {}
    });

    expect(() => {
      // Re-run validation by importing the module again
      vi.isolateModules(() => {
        require('../supabase.storage.config');
      });
    }).toThrow('Missing required Supabase configuration');
  });

  it('should generate correct public URL', () => {
    const path = 'test/image.jpg';
    const expected = 'https://test.supabase.co/storage/v1/test/image.jpg';
    expect(supabaseStorageConfig.getPublicUrl(path)).toBe(expected);
  });

  it('should handle empty path in public URL', () => {
    expect(supabaseStorageConfig.getPublicUrl('')).toBe('');
  });

  it('should update configuration', () => {
    supabaseStorageConfig.update({
      bucketName: 'new-bucket',
      maxRetries: 5,
      retryDelay: 2000,
      uploadOptions: {
        cacheControl: '3600',
        upsert: true
      }
    });

    expect(supabaseStorageConfig.bucketName).toBe('new-bucket');
    expect(supabaseStorageConfig.maxRetries).toBe(5);
    expect(supabaseStorageConfig.retryDelay).toBe(2000);
    expect(supabaseStorageConfig.uploadOptions).toEqual({
      cacheControl: '3600',
      upsert: true
    });
  });

  it('should reset to environment defaults', () => {
    // First update config
    supabaseStorageConfig.update({
      bucketName: 'new-bucket',
      maxRetries: 5,
      retryDelay: 2000
    });

    // Then reset
    supabaseStorageConfig.reset();

    expect(supabaseStorageConfig.bucketName).toBe('test-bucket');
    expect(supabaseStorageConfig.maxRetries).toBe(3);
    expect(supabaseStorageConfig.retryDelay).toBe(1000);
    expect(supabaseStorageConfig.uploadOptions).toEqual({
      cacheControl: '31536000',
      upsert: false
    });
  });
});