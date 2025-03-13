import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UrlBuilderFactory } from '../url-builder.factory';
import { StorageProvider } from '../../storage.config';
import { S3UrlBuilder } from '../s3.url-builder';
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

describe('UrlBuilderFactory', () => {
  beforeEach(() => {
    UrlBuilderFactory.resetInstance();
  });

  describe('createBuilder', () => {
    it('should create S3 URL builder', () => {
      const config = {
        provider: StorageProvider.S3,
        bucketName: 'test-bucket',
        region: 'us-west-2',
        cdnUrl: 'https://cdn.example.com'
      };

      const builder = UrlBuilderFactory.createBuilder(config);
      expect(builder).toBeInstanceOf(S3UrlBuilder);
    });

    it('should create Supabase URL builder', () => {
      const config = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket',
        baseUrl: 'https://test.supabase.co'
      };

      const builder = UrlBuilderFactory.createBuilder(config);
      expect(builder).toBeInstanceOf(SupabaseUrlBuilder);
    });

    it('should throw error for S3 without region', () => {
      const config = {
        provider: StorageProvider.S3,
        bucketName: 'test-bucket'
      };

      expect(() => UrlBuilderFactory.createBuilder(config))
        .toThrow('Region is required for S3 URL builder');
    });

    it('should throw error for Supabase without base URL', () => {
      const config = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket'
      };

      expect(() => UrlBuilderFactory.createBuilder(config))
        .toThrow('Base URL is required for Supabase URL builder');
    });

    it('should default to Supabase for unknown provider', () => {
      const config = {
        provider: 'unknown' as StorageProvider,
        bucketName: 'test-bucket',
        baseUrl: 'https://test.supabase.co'
      };

      const builder = UrlBuilderFactory.createBuilder(config);
      expect(builder).toBeInstanceOf(SupabaseUrlBuilder);
    });
  });

  describe('getInstance', () => {
    it('should create and return singleton instance', () => {
      const config = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket',
        baseUrl: 'https://test.supabase.co'
      };

      const builder1 = UrlBuilderFactory.getInstance(config);
      const builder2 = UrlBuilderFactory.getInstance();

      expect(builder1).toBe(builder2);
      expect(builder1).toBeInstanceOf(SupabaseUrlBuilder);
    });

    it('should throw error when getting instance without initialization', () => {
      expect(() => UrlBuilderFactory.getInstance())
        .toThrow('URL builder not initialized');
    });

    it('should allow reinitializing with new config', () => {
      const supabaseConfig = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket',
        baseUrl: 'https://test.supabase.co'
      };

      const s3Config = {
        provider: StorageProvider.S3,
        bucketName: 'test-bucket',
        region: 'us-west-2'
      };

      const supabaseBuilder = UrlBuilderFactory.getInstance(supabaseConfig);
      expect(supabaseBuilder).toBeInstanceOf(SupabaseUrlBuilder);

      const s3Builder = UrlBuilderFactory.getInstance(s3Config);
      expect(s3Builder).toBeInstanceOf(S3UrlBuilder);
      expect(s3Builder).not.toBe(supabaseBuilder);
    });
  });

  describe('resetInstance', () => {
    it('should reset the singleton instance', () => {
      const config = {
        provider: StorageProvider.SUPABASE,
        bucketName: 'test-bucket',
        baseUrl: 'https://test.supabase.co'
      };

      const builder = UrlBuilderFactory.getInstance(config);
      expect(builder).toBeInstanceOf(SupabaseUrlBuilder);

      UrlBuilderFactory.resetInstance();

      expect(() => UrlBuilderFactory.getInstance())
        .toThrow('URL builder not initialized');
    });
  });
});