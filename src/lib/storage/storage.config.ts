import { appLogger } from '../logger';

export enum StorageProvider {
  SUPABASE = 'supabase'
}

export interface StorageConfig {
  provider: StorageProvider;
  bucketName: string;
  cdnUrl?: string;
}

// Default configuration
const defaultConfig: StorageConfig = {
  provider: StorageProvider.SUPABASE,
  bucketName: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'recipe-photos'
};

// Current configuration
let currentConfig: StorageConfig = { ...defaultConfig };

// Validate environment variables
function validateEnvironment() {
  // Validate Supabase configuration
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_STORAGE_URL',
    'VITE_SUPABASE_STORAGE_BUCKET'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    const error = `Missing required Supabase configuration: ${missingVars.join(', ')}`;
    appLogger.error(error, { missingVars });
    throw new Error(error);
  }

  appLogger.info('Storage environment validated successfully');
}

// Initialize configuration
validateEnvironment();

export const storageConfig = {
  get provider() {
    return currentConfig.provider;
  },
  get bucketName() {
    return currentConfig.bucketName;
  },
  get cdnUrl() {
    return currentConfig.cdnUrl;
  },

  /**
   * Updates the storage configuration
   */
  update(config: Partial<StorageConfig>) {
    currentConfig = {
      ...currentConfig,
      ...config
    };

    appLogger.info('Storage configuration updated', {
      provider: currentConfig.provider,
      bucketName: currentConfig.bucketName,
      hasCdnUrl: !!currentConfig.cdnUrl
    });
  },

  /**
   * Resets configuration to defaults
   */
  reset() {
    currentConfig = { ...defaultConfig };
    appLogger.info('Storage configuration reset to defaults');
  }
};

// Initialize configuration based on environment
if (import.meta.env.VITE_STORAGE_PROVIDER) {
  storageConfig.update({
    provider: import.meta.env.VITE_STORAGE_PROVIDER.toLowerCase() as StorageProvider
  });
}

if (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET) {
  storageConfig.update({
    bucketName: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET
  });
}

if (import.meta.env.VITE_SUPABASE_STORAGE_URL) {
  storageConfig.update({
    cdnUrl: import.meta.env.VITE_SUPABASE_STORAGE_URL
  });
}

appLogger.info('Storage configuration initialized', {
  provider: storageConfig.provider,
  bucketName: storageConfig.bucketName,
  hasCdnUrl: !!storageConfig.cdnUrl
});