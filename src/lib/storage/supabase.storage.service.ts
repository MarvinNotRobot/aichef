import { supabase } from '../supabase/client';
import { supabaseStorageConfig } from './supabase.storage.config';
import { UrlBuilderFactory } from './url-builders/url-builder.factory';
import { StorageProvider } from './storage.config';
import { appLogger } from '../logger';
import type { IStorageService, IStorageUrlBuilder } from './types';

export class SupabaseStorageService implements IStorageService {
  private bucketName: string;
  private maxRetries: number;
  private retryDelay: number;
  private urlBuilder: IStorageUrlBuilder;

  constructor(bucketName: string = supabaseStorageConfig.bucketName) {
    this.bucketName = bucketName;
    this.maxRetries = supabaseStorageConfig.maxRetries;
    this.retryDelay = supabaseStorageConfig.retryDelay;

    this.urlBuilder = UrlBuilderFactory.createBuilder({
      provider: StorageProvider.SUPABASE,
      bucketName: this.bucketName,
      baseUrl: supabaseStorageConfig.storageUrl
    });

    appLogger.info('Supabase storage service initialized', {
      bucketName: this.bucketName,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      storageUrl: supabaseStorageConfig.storageUrl
    });
  }

  async uploadFile(file: File, path: string): Promise<string> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this.maxRetries) {
      try {
        appLogger.info('Starting file upload to Supabase Storage', {
          fileName: file.name,
          path,
          size: file.size,
          bucket: this.bucketName,
          attempt: retryCount + 1
        });

        // Get current user ID
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('User not authenticated');

        // Ensure path starts with user ID
        const userPath = path.startsWith(user.id) ? path : `${user.id}/${path}`;

        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .upload(userPath, file, {
            ...supabaseStorageConfig.uploadOptions,
            contentType: file.type || 'application/octet-stream'
          });

        if (error) {
          appLogger.error('Upload failed', {
            error,
            attempt: retryCount + 1,
            path: userPath
          });
          throw error;
        }

        if (!data?.path) {
          throw new Error('No path returned from upload');
        }

        appLogger.info('File uploaded successfully', {
          path: data.path,
          bucket: this.bucketName,
          size: file.size
        });

        return data.path;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount++;

        if (retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount - 1);
          appLogger.warn('Retrying upload after error', {
            error: lastError.message,
            delay,
            retriesLeft: this.maxRetries - retryCount
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        appLogger.error('Upload failed after all retries', {
          error: lastError,
          attempts: retryCount
        });
        break;
      }
    }

    throw new Error(`Failed to upload file: ${lastError?.message}`);
  }

  async deleteFile(path: string): Promise<void> {
    try {
      if (!path) {
        appLogger.warn('Attempted to delete file with empty path');
        return;
      }

      appLogger.info('Deleting file from Supabase Storage', {
        path,
        bucket: this.bucketName
      });

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) throw error;

      appLogger.info('File deleted successfully', { path });
    } catch (error) {
      appLogger.error('Failed to delete file', { error, path });
      throw new Error('Failed to delete file');
    }
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (!path) {
        throw new Error('File path is required');
      }

      appLogger.info('Generating signed URL', {
        path,
        expiresIn,
        bucket: this.bucketName
      });

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error('No signed URL returned');
      }

      appLogger.info('Signed URL generated successfully', {
        path,
        expiresIn
      });

      return data.signedUrl;
    } catch (error) {
      appLogger.error('Failed to generate signed URL', { error });
      throw new Error('Failed to generate signed URL');
    }
  }

  getPublicUrl(path: string): string {
    if (!path) return '';
    return this.urlBuilder.getPublicUrl(path);
  }
}