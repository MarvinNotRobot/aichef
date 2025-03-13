import { StorageProvider } from '../storage.config';
import { SupabaseUrlBuilder } from './supabase.url-builder';
import { appLogger } from '../../logger';
import type { IStorageUrlBuilder } from '../types';

interface UrlBuilderConfig {
  provider: StorageProvider;
  bucketName: string;
  baseUrl?: string;
  cdnUrl?: string;
}

export class UrlBuilderFactory {
  private static instance: IStorageUrlBuilder;

  static createBuilder(config: UrlBuilderConfig): IStorageUrlBuilder {
    try {
      appLogger.info('Creating URL builder', { 
        provider: config.provider,
        bucketName: config.bucketName,
        hasBaseUrl: !!config.baseUrl,
        hasCdnUrl: !!config.cdnUrl
      });

      if (!config.baseUrl) {
        throw new Error('Base URL is required for Supabase URL builder');
      }
      return new SupabaseUrlBuilder(config.baseUrl, config.bucketName);

    } catch (error) {
      appLogger.error('Failed to create URL builder', { error, config });
      throw error;
    }
  }

  static getInstance(config?: UrlBuilderConfig): IStorageUrlBuilder {
    if (!UrlBuilderFactory.instance && !config) {
      throw new Error('URL builder not initialized. Please provide configuration.');
    }

    if (config) {
      UrlBuilderFactory.instance = UrlBuilderFactory.createBuilder(config);
      appLogger.info('URL builder instance created', { 
        provider: config.provider,
        bucketName: config.bucketName
      });
    }

    return UrlBuilderFactory.instance;
  }

  static resetInstance(): void {
    UrlBuilderFactory.instance = undefined;
    appLogger.info('URL builder instance reset');
  }
}