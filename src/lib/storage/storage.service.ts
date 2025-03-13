import { StorageFactory } from './storage.factory';
import { storageConfig } from './storage.config';
import { appLogger } from '../logger';
import type { IStorageService } from './types';

export class StorageService {
  private static storageService: IStorageService;

  private static getService(): IStorageService {
    if (!this.storageService) {
      this.storageService = StorageFactory.getInstance();
    }
    return this.storageService;
  }

  static async uploadPhoto(file: File, recipeId: string): Promise<string> {
    try {
      appLogger.info('Uploading photo', { fileName: file.name, recipeId });
      
      // Create a unique file path
      const filePath = `${recipeId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload using the configured storage service
      const path = await this.getService().uploadFile(file, filePath);
      
      appLogger.info('Photo uploaded successfully', { path });
      return path;
    } catch (error) {
      appLogger.error('Failed to upload photo', { error });
      throw error;
    }
  }

  static async deletePhoto(path: string): Promise<void> {
    try {
      if (!path) return;
      
      appLogger.info('Deleting photo', { path });
      await this.getService().deleteFile(path);
      appLogger.info('Photo deleted successfully', { path });
    } catch (error) {
      appLogger.error('Failed to delete photo', { error });
      throw error;
    }
  }

  static getPhotoUrl(path: string): string {
    if (!path) return '';

    // Get URL from configured storage service
    return this.getService().getPublicUrl(path);
  }
}