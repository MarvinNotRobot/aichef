import { appLogger } from '../logger';

export interface SupabaseStorageConfig {
  bucketName: string;
  maxRetries: number;
  retryDelay: number;
  storageUrl: string;
  uploadOptions: {
    cacheControl: string;
    upsert: boolean;
  };
}

// Default configuration values
const defaultConfig: SupabaseStorageConfig = {
  bucketName: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'recipe-photos',
  maxRetries: 3,
  retryDelay: 1000,
  storageUrl: import.meta.env.VITE_SUPABASE_STORAGE_URL || '',
  uploadOptions: {
    cacheControl: '31536000',
    upsert: false
  }
};

// Current configuration
let currentConfig: SupabaseStorageConfig = { ...defaultConfig };

// Validate environment variables
function validateEnvironment() {
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

  appLogger.info('Supabase storage environment validated successfully');
}

// Initialize configuration
validateEnvironment();

export const supabaseStorageConfig = {
  get bucketName() {
    return currentConfig.bucketName;
  },
  get maxRetries() {
    return currentConfig.maxRetries;
  },
  get retryDelay() {
    return currentConfig.retryDelay;
  },
  get storageUrl() {
    return currentConfig.storageUrl;
  },
  get uploadOptions() {
    return { ...currentConfig.uploadOptions };
  },

  /**
   * Get the full public URL for a storage path
   */
  getPublicUrl(path: string): string {
    if (!path) return '';
    return `${currentConfig.storageUrl}/${path}`;
  },

  /**
   * Updates the storage configuration
   */
  update(config: Partial<SupabaseStorageConfig>) {
    currentConfig = {
      ...currentConfig,
      ...config,
      uploadOptions: {
        ...currentConfig.uploadOptions,
        ...(config.uploadOptions || {})
      }
    };

    appLogger.info('Supabase storage configuration updated', {
      bucketName: currentConfig.bucketName,
      maxRetries: currentConfig.maxRetries,
      retryDelay: currentConfig.retryDelay,
      storageUrl: currentConfig.storageUrl,
      uploadOptions: currentConfig.uploadOptions
    });
  },

  /**
   * Resets configuration to defaults
   */
  reset() {
    currentConfig = { ...defaultConfig };
    appLogger.info('Supabase storage configuration reset to defaults');
  }
};

// Initialize configuration based on environment
if (import.meta.env.VITE_STORAGE_BUCKET) {
  supabaseStorageConfig.update({
    bucketName: import.meta.env.VITE_STORAGE_BUCKET
  });
}

appLogger.info('Supabase storage configuration initialized', {
  bucketName: supabaseStorageConfig.bucketName,
  maxRetries: supabaseStorageConfig.maxRetries,
  retryDelay: supabaseStorageConfig.retryDelay,
  storageUrl: supabaseStorageConfig.storageUrl
});