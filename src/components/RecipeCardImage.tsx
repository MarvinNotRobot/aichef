import React, { useState, useEffect } from 'react';
import { PhotoService } from '../lib/recipe/photo.service';
import { appLogger } from '../lib/logger';
import type { RecipePhoto } from '../types';

interface RecipeCardImageProps {
  recipeId: string;
  alt: string;
  className?: string;
}

export function RecipeCardImage({ recipeId, alt, className = '' }: RecipeCardImageProps) {
  const [photos, setPhotos] = useState<RecipePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const recipePhotos = await PhotoService.getPhotosByRecipeId(recipeId);
        
        if (mounted) {
          setPhotos(recipePhotos);
        }
      } catch (error) {
        if (mounted) {
          const message = error instanceof Error ? error.message : 'Failed to load photo';
          setError(message);
          appLogger.error('Failed to load recipe photo', { error, recipeId });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPhotos();

    return () => {
      mounted = false;
    };
  }, [recipeId]);

  // Get primary photo or first available photo
  const displayPhoto = photos.find(p => p.is_primary) || photos[0];

  if (isLoading) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 rounded-t-lg ${className}`}
        data-testid="recipe-image-loading"
      />
    );
  }

  if (error) {
    return (
      <div 
        className={`bg-gray-100 rounded-t-lg flex items-center justify-center ${className}`}
        data-testid="recipe-image-error"
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
    );
  }

  if (!displayPhoto) {
    return (
      <div 
        className={`bg-gray-100 rounded-t-lg flex items-center justify-center ${className}`}
        data-testid="recipe-image-placeholder"
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={displayPhoto.url}
        alt={alt}
        className="w-full h-full object-cover rounded-t-lg"
        loading="lazy"
        data-testid="recipe-image"
      />
      {displayPhoto.is_ai_generated && (
        <div 
          className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded"
          data-testid="ai-generated-badge"
        >
          AI Generated
        </div>
      )}
    </div>
  );
}