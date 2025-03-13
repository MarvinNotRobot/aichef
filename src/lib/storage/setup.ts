import { StorageFactory } from './storage.factory';
import { storageConfig, StorageProvider } from './storage.config';
import { appLogger } from '../logger';

/**
 * Initialize storage service based on environment configuration
 */
export async function initializeStorage(): Promise<void> {
  try {
    appLogger.info('Initializing storage service');

    // Get storage provider from environment
    const provider = (import.meta.env.VITE_STORAGE_PROVIDER?.toLowerCase() as StorageProvider) || StorageProvider.SUPABASE;

    // Configure storage based on provider
    const config = {
      provider,
      bucketName: provider === StorageProvider.S3 
        ? import.meta.env.VITE_S3_BUCKET_NAME 
        : import.meta.env.VITE_SUPABASE_STORAGE_BUCKET,
      region: import.meta.env.VITE_AWS_REGION,
      baseUrl: import.meta.env.VITE_SUPABASE_STORAGE_URL
    };

    // Update storage configuration
    storageConfig.update(config);

    // Initialize storage service
    const service = StorageFactory.getInstance(config);

    // Validate service initialization
    if (!service) {
      throw new Error('Failed to initialize storage service');
    }

    appLogger.info('Storage service initialized successfully', {
      provider: config.provider,
      bucketName: config.bucketName,
      hasBaseUrl: !!config.baseUrl
    });
  } catch (error) {
    appLogger.error('Failed to initialize storage service', { error });
    throw error;
  }
}

/**
 * Get the initialized storage service instance
 */
export function getStorageService() {
  return StorageFactory.getInstance();
}