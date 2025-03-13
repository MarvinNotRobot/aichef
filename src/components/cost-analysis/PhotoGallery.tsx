import React, { useState } from 'react';
import type { RecipePhoto } from '../../types';

interface PhotoGalleryProps {
  photos: RecipePhoto[];
  isLoading: boolean;
  onDelete?: (photoId: string) => void;
  onSetPrimary?: (photoId: string) => void;
}

export function PhotoGallery({ 
  photos, 
  isLoading,
  onDelete,
  onSetPrimary
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<RecipePhoto | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-4">No photos available for this recipe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Photo Display */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="relative aspect-video overflow-hidden rounded-lg shadow-md">
          <img 
            src={selectedPhoto?.url || photos[0].url} 
            alt="Selected recipe" 
            className="w-full h-full object-cover"
            data-testid="selected-photo"
          />
          {selectedPhoto?.is_ai_generated && (
            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
              AI Generated
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {selectedPhoto?.file_name || photos[0].file_name}
            </p>
          </div>
          <div className="flex space-x-2">
            {onSetPrimary && selectedPhoto && !selectedPhoto.is_primary && (
              <button
                onClick={() => onSetPrimary(selectedPhoto.id)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                data-testid="set-primary-button"
              >
                Set as Primary
              </button>
            )}
            {onDelete && selectedPhoto && (
              <button
                onClick={() => onDelete(selectedPhoto.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                data-testid="delete-photo-button"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              (selectedPhoto?.id === photo.id || (!selectedPhoto && photos[0].id === photo.id)) 
                ? 'border-indigo-600 shadow-md' 
                : 'border-transparent hover:border-gray-300'
            }`}
            data-testid={`photo-thumbnail-${photo.id}`}
          >
            <div className="aspect-square">
              <img 
                src={photo.url} 
                alt={photo.file_name} 
                className="w-full h-full object-cover"
              />
            </div>
            {photo.is_primary && (
              <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}