import { appLogger } from '../logger';
import { StorageProvider } from './storage.config';
import { SupabaseStorageService } from './supabase.storage.service';
import type { IStorageService, StorageConfig } from './types';

export class StorageFactory {
  private static instance: IStorageService;

  static createService(config: StorageConfig): IStorageService {
    try {
      appLogger.info('Creating storage service', { provider: config.provider });

      switch (config.provider) {
        case StorageProvider.SUPABASE:
        default:
          return new SupabaseStorageService(config.bucketName);
      }
    } catch (error) {
      appLogger.error('Failed to create storage service', { error, config });
      throw error;
    }
  }

  static getInstance(config?: StorageConfig): IStorageService {
    if (!StorageFactory.instance && !config) {
      throw new Error('Storage service not initialized. Please provide configuration.');
    }

    if (config) {
      StorageFactory.instance = StorageFactory.createService(config);
      appLogger.info('Storage service instance created', { 
        provider: config.provider,
        bucketName: config.bucketName
      });
    }

    return StorageFactory.instance;
  }

  static resetInstance(): void {
    StorageFactory.instance = undefined;
    appLogger.info('Storage service instance reset');
  }
}