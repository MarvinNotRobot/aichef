import { supabase } from '../supabase/client';
import { appLogger } from '../logger';
import type { IStorageService } from './types';

export class SupabaseStorageService implements IStorageService {
  private bucketName: string;

  constructor(bucketName: string = 'recipe-photos') {
    this.bucketName = bucketName;
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      appLogger.info('Starting file upload to Supabase', {
        fileName: file.name,
        path,
        size: file.size,
        bucket: this.bucketName
      });

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      if (!data?.path) {
        throw new Error('No path returned from upload');
      }

      appLogger.info('File uploaded successfully to Supabase', {
        path: data.path,
        bucket: this.bucketName
      });

      return data.path;
    } catch (error) {
      appLogger.error('Failed to upload file to Supabase', {
        error,
        fileName: file.name,
        path
      });
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      if (!path) {
        appLogger.warn('Attempted to delete file with empty path');
        return;
      }

      appLogger.info('Deleting file from Supabase', {
        path,
        bucket: this.bucketName
      });

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) throw error;

      appLogger.info('File deleted successfully from Supabase', { path });
    } catch (error) {
      appLogger.error('Failed to delete file from Supabase', {
        error,
        path
      });
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
      appLogger.error('Failed to generate signed URL', {
        error,
        path
      });
      throw new Error('Failed to generate signed URL');
    }
  }

  getPublicUrl(path: string): string {
    if (!path) {
      return '';
    }

    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}