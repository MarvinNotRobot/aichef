import React, { useState, useEffect } from 'react';
import { RecipeIngredientsTab } from './RecipeIngredientsTab';
import { RecipeInstructions } from './RecipeInstructions';
import { RecipePhotosTab } from './RecipePhotosTab';
import { PhotoService } from '../../lib/recipe/photo.service';
import { appLogger } from '../../lib/logger';
import type { TableRecipeIngredient, RecipePhoto } from '../../types';
import { clsx } from 'clsx';

interface RecipeTabsProps {
  recipeId?: string;
  recipeName: string;
  ingredients: TableRecipeIngredient[];
  instructions?: string[];
  onDeleteIngredient: (index: number) => void;
  onEditIngredient: (index: number, updatedIngredient: TableRecipeIngredient) => void;
  onInstructionsChange?: (instructions: string[]) => void;
  editable?: boolean;
}

type TabType = 'ingredients' | 'instructions' | 'photos';

export function RecipeTabs({ 
  recipeId = '',
  recipeName,
  ingredients, 
  instructions = [], 
  onDeleteIngredient, 
  onEditIngredient,
  onInstructionsChange,
  editable = false
}: RecipeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');
  const [photos, setPhotos] = useState<RecipePhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (recipeId && activeTab === 'photos') {
      loadPhotos();
    }
  }, [recipeId, activeTab]);

  const loadPhotos = async () => {
    if (!recipeId) return;
    
    setIsLoadingPhotos(true);
    setPhotoError(null);
    
    try {
      const recipePhotos = await PhotoService.getRecipePhotos(recipeId);
      setPhotos(recipePhotos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load photos';
      setPhotoError(message);
      appLogger.error('Failed to load recipe photos', { error, recipeId });
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handlePhotoUploaded = (photo: RecipePhoto) => {
    setPhotos(prevPhotos => {
      if (photo.is_primary) {
        return [
          photo,
          ...prevPhotos.map(p => ({ ...p, is_primary: false }))
        ];
      }
      return [photo, ...prevPhotos];
    });
  };

  const handlePhotoDeleted = (photoId: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
  };

  const handlePrimaryPhotoChanged = (photoId: string) => {
    setPhotos(prevPhotos => 
      prevPhotos.map(p => ({
        ...p,
        is_primary: p.id === photoId
      }))
    );
  };

  const tabs = [
    {
      id: 'ingredients' as TabType,
      label: `Ingredients (${ingredients.length})`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'instructions' as TabType,
      label: `Cooking Instructions${instructions?.length ? ` (${instructions.length})` : ''}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'photos' as TabType,
      label: `Photos${photos?.length ? ` (${photos.length})` : ''}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={clsx(
                'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
              data-testid={`${tab.id}-tab`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'ingredients' && (
          <RecipeIngredientsTab
            ingredients={ingredients}
            onDeleteIngredient={onDeleteIngredient}
            onEditIngredient={onEditIngredient}
          />
        )}
        
        {activeTab === 'instructions' && (
          <RecipeInstructions 
            instructions={instructions}
            onInstructionsChange={onInstructionsChange}
            editable={editable}
          />
        )}
        
        {activeTab === 'photos' && (
          <>
            {photoError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {photoError}
              </div>
            )}
            <RecipePhotosTab
              recipeId={recipeId}
              recipeName={recipeName}
              photos={photos}
              isLoading={isLoadingPhotos}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoDeleted={handlePhotoDeleted}
              onPrimaryPhotoChanged={handlePrimaryPhotoChanged}
              editable={editable && !!recipeId}
            />
          </>
        )}
      </div>
    </div>
  );
}