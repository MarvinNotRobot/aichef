import React, { useState } from 'react';
import { PhotoGallery } from './PhotoGallery';
import { PhotoUploader } from './PhotoUploader';
import { PhotoService } from '../../lib/recipe/photo.service';
import { appLogger } from '../../lib/logger';
import type { RecipePhoto } from '../../types';

interface RecipePhotosTabProps {
  recipeId: string;
  recipeName: string;
  photos: RecipePhoto[];
  isLoading: boolean;
  onPhotoUploaded?: (photo: RecipePhoto) => void;
  onPhotoDeleted?: (photoId: string) => void;
  onPrimaryPhotoChanged?: (photoId: string) => void;
  editable?: boolean;
}

export function RecipePhotosTab({
  recipeId,
  recipeName,
  photos,
  isLoading,
  onPhotoUploaded,
  onPhotoDeleted,
  onPrimaryPhotoChanged,
  editable = false
}: RecipePhotosTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);

    try {
      const isPrimary = photos.length === 0; // Make it primary if it's the first photo
      
      const uploadedPhoto = await PhotoService.uploadPhoto(file, recipeId, isPrimary);
      
      if (onPhotoUploaded) {
        onPhotoUploaded(uploadedPhoto);
      }
      
      appLogger.info('Photo uploaded successfully', { photoId: uploadedPhoto.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(message);
      appLogger.error('Failed to upload photo', { error: err });
      throw err; // Re-throw to let the PhotoUploader component handle the error
    }
  };

  const handleGenerateAIPhoto = async () => {
    if (!recipeName) {
      setError('Please provide a recipe name before generating an AI photo');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedPhoto = await PhotoService.generateAIPhoto(recipeName, recipeId);
      
      if (onPhotoUploaded) {
        onPhotoUploaded(generatedPhoto);
      }
      
      appLogger.info('AI photo generated successfully', { photoId: generatedPhoto.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate AI photo';
      setError(message);
      appLogger.error('Failed to generate AI photo', { error: err });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await PhotoService.deletePhoto(photoId);
      
      if (onPhotoDeleted) {
        onPhotoDeleted(photoId);
      }
      
      appLogger.info('Photo deleted successfully', { photoId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(message);
      appLogger.error('Failed to delete photo', { error: err });
    }
  };

  const handleSetPrimaryPhoto = async (photoId: string) => {
    try {
      await PhotoService.setPrimaryPhoto(photoId, recipeId);
      
      if (onPrimaryPhotoChanged) {
        onPrimaryPhotoChanged(photoId);
      }
      
      appLogger.info('Primary photo set successfully', { photoId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set primary photo';
      setError(message);
      appLogger.error('Failed to set primary photo', { error: err });
    }
  };

  return (
    <div className="space-y-6">
      {editable && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Photos</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <PhotoUploader
              onFileSelected={handleFileUpload}
              disabled={isGenerating}
              label="Upload Photo"
              className="flex-shrink-0"
            />
            
            <span className="text-gray-500">or</span>
            
            <button
              onClick={handleGenerateAIPhoto}
              disabled={isGenerating || !recipeName}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="generate-ai-photo-button"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>Generate AI Photo</>
              )}
            </button>
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Upload a photo of your recipe or let AI generate one based on the recipe name.
          </p>
        </div>
      )}
      
      <PhotoGallery
        photos={photos}
        isLoading={isLoading}
        onDelete={editable ? handleDeletePhoto : undefined}
        onSetPrimary={editable ? handleSetPrimaryPhoto : undefined}
      />
    </div>
  );
}