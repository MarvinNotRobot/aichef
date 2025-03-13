import { supabase } from '../supabase/client';
import { StorageService } from '../storage/storage.service';
import { OpenAIImageService } from '../ai/openai.image.service';
import { appLogger } from '../logger';
import type { RecipePhoto } from '../types';

export class PhotoService {
  private static readonly SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  static async getRecipePhotos(recipeId: string): Promise<RecipePhoto[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_photos')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const photosWithUrls = (data || []).map(photo => ({
        ...photo,
        url: StorageService.getPhotoUrl(photo.storage_path)
      }));

      return photosWithUrls;
    } catch (error) {
      appLogger.error('Failed to fetch recipe photos', { error, recipeId });
      throw error;
    }
  }

  static async getPhotosByRecipeId(recipeId: string): Promise<RecipePhoto[]> {
    try {
      appLogger.info('Fetching photos for recipe', { recipeId });

      const { data, error } = await supabase
        .from('recipe_photos')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        appLogger.error('Failed to fetch recipe photos', { error, recipeId });
        throw error;
      }

      // Add public URL to each photo
      const photosWithUrls = (data || []).map(photo => ({
        ...photo,
        url: StorageService.getPhotoUrl(photo.storage_path)
      }));

      appLogger.info('Successfully fetched recipe photos', { 
        recipeId,
        photoCount: photosWithUrls.length,
        hasPrimaryPhoto: photosWithUrls.some(p => p.is_primary)
      });

      return photosWithUrls;
    } catch (error) {
      appLogger.error('Error in getPhotosByRecipeId', { error, recipeId });
      throw error;
    }
  }

  static async uploadPhoto(file: File, recipeId: string, isPrimary: boolean = false): Promise<RecipePhoto> {
    try {
      appLogger.info('Starting photo upload', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        recipeId,
        isPrimary
      });

      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipeId', recipeId);

      // Get auth token
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) throw new Error('No active session');

      // Call the edge function
      const response = await fetch(`${this.SUPABASE_URL}/functions/v1/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photo');
      }

      const uploadResult = await response.json();

      appLogger.info('Photo uploaded successfully', {
        path: uploadResult.path,
        size: uploadResult.size,
        duration: uploadResult.duration
      });

      if (isPrimary) {
        await this.clearPrimaryPhoto(recipeId);
      }

      // Create photo record in database
      const { data, error } = await supabase
        .from('recipe_photos')
        .insert([{
          recipe_id: recipeId,
          file_name: file.name,
          storage_path: uploadResult.path,
          is_primary: isPrimary,
          is_ai_generated: false,
          created_by: session.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from photo upload');

      return {
        ...data,
        url: uploadResult.url
      };
    } catch (error) {
      appLogger.error('Failed to upload photo', { error });
      throw error;
    }
  }

  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const { data: photo, error: fetchError } = await supabase
        .from('recipe_photos')
        .select('*')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;
      if (!photo) throw new Error('Photo not found');

      await StorageService.deletePhoto(photo.storage_path);

      const { error: deleteError } = await supabase
        .from('recipe_photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) throw deleteError;

      if (photo.is_primary) {
        await this.setNewPrimaryPhoto(photo.recipe_id);
      }
    } catch (error) {
      appLogger.error('Failed to delete photo', { error });
      throw error;
    }
  }

  static async setPrimaryPhoto(photoId: string, recipeId: string): Promise<void> {
    try {
      await this.clearPrimaryPhoto(recipeId);

      const { error } = await supabase
        .from('recipe_photos')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (error) throw error;
    } catch (error) {
      appLogger.error('Failed to set primary photo', { error });
      throw error;
    }
  }

  static async generateAIPhoto(recipeName: string, recipeId: string): Promise<RecipePhoto> {
    try {
      // Generate and download the image
      const imagePath = await OpenAIImageService.generateImage(
        OpenAIImageService.enhancePrompt(recipeName),
        recipeId
      );

      // Verify the image URL is accessible
      const imageUrl = StorageService.getPhotoUrl(imagePath);
      if (!imageUrl) {
        throw new Error('Failed to get photo URL');
      }

      // Generate filename
      const fileName = `${recipeName.replace(/[^a-zA-Z0-9]/g, '-')}-ai.jpg`;

      // Only create database record after successful URL verification
      const { data, error } = await supabase
        .from('recipe_photos')
        .insert([{
          recipe_id: recipeId,
          file_name: fileName,
          storage_path: imagePath,
          is_primary: false,
          is_ai_generated: true,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        // If database insert fails, try to clean up the uploaded file
        try {
          await StorageService.deletePhoto(imagePath);
        } catch (cleanupError) {
          appLogger.error('Failed to cleanup photo after database error', { 
            error: cleanupError,
            imagePath 
          });
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to save AI photo record');
      }

      return {
        ...data,
        url: imageUrl
      };
    } catch (error) {
      appLogger.error('Failed to generate AI photo', { error });
      throw error;
    }
  }

  private static async clearPrimaryPhoto(recipeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipe_photos')
        .update({ is_primary: false })
        .eq('recipe_id', recipeId)
        .eq('is_primary', true);

      if (error) throw error;
    } catch (error) {
      appLogger.error('Failed to clear primary photo', { error });
      throw error;
    }
  }

  private static async setNewPrimaryPhoto(recipeId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('recipe_photos')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('is_ai_generated', false)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return;
        }
        throw error;
      }

      if (data) {
        await this.setPrimaryPhoto(data.id, recipeId);
      }
    } catch (error) {
      appLogger.error('Failed to set new primary photo', { error });
      throw error;
    }
  }
}