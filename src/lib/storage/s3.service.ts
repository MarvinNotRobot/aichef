import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config } from './s3.config';
import { UrlBuilderFactory } from './url-builders/url-builder.factory';
import { StorageProvider } from './storage.config';
import { appLogger } from '../logger';
import type { IStorageService, IStorageUrlBuilder } from './types';

export class S3StorageService implements IStorageService {
  private urlBuilder: IStorageUrlBuilder;

  constructor() {
    this.urlBuilder = UrlBuilderFactory.createBuilder({
      provider: StorageProvider.S3,
      bucketName: s3Config.bucketName,
      region: s3Config.region
    });
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      appLogger.info('Starting file upload to S3', {
        fileName: file.name,
        path,
        size: file.size,
        contentType: file.type,
        bucket: s3Config.bucketName
      });

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();

      // Create upload command
      const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: path,
        Body: arrayBuffer,
        ContentType: file.type || 'application/octet-stream',
        ContentLength: file.size,
        CacheControl: s3Config.uploadOptions.CacheControl,
        Metadata: {
          'original-filename': file.name
        }
      });

      await s3Client.send(command);
      
      appLogger.info('File uploaded successfully to S3', {
        path,
        bucket: s3Config.bucketName,
        size: file.size
      });

      return path;
    } catch (error) {
      appLogger.error('Failed to upload file to S3', { error });
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      if (!path) {
        appLogger.warn('Attempted to delete file with empty path');
        return;
      }

      appLogger.info('Deleting file from S3', {
        path,
        bucket: s3Config.bucketName
      });

      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: path
      });

      await s3Client.send(command);

      appLogger.info('File deleted successfully from S3', { path });
    } catch (error) {
      appLogger.error('Failed to delete file from S3', { error });
      throw error;
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
        bucket: s3Config.bucketName
      });

      const command = new GetObjectCommand({
        Bucket: s3Config.bucketName,
        Key: path
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });

      appLogger.info('Signed URL generated successfully', {
        path,
        expiresIn
      });

      return url;
    } catch (error) {
      appLogger.error('Failed to generate signed URL', { error });
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    return this.urlBuilder.getPublicUrl(path);
  }
}