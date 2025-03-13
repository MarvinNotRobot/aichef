import React from 'react';
import { CostSummaryPanel } from './CostSummaryPanel';
import { RecipeTabs } from './RecipeTabs';
import { CostDistributionChart } from './CostDistributionChart';
import { RecipeHeader } from './RecipeHeader';
import type { CostSummary, TableRecipeIngredient, RecipePhoto } from '../../types';

interface CostAnalysisLayoutProps {
  menuItemCategory: string;
  menuItemName: string;
  price: string;
  isTaxable: boolean;
  isActive: boolean;
  ingredients: TableRecipeIngredient[];
  isDirty: boolean;
  costSummary: CostSummary;
  materialCostPercentage: number;
  overheadCostPercentage: number;
  grossProfitPercentage: number;
  recommendedPrice: number;
  instructions?: string[];
  recipeId?: string;
  photos?: RecipePhoto[];
  onPhotoUploaded?: (photo: RecipePhoto) => void;
  onPhotoDeleted?: (photoId: string) => void;
  onPrimaryPhotoChanged?: (photoId: string) => void;
  onCategoryChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onTaxableChange: (value: boolean) => void;
  onActiveChange: (value: boolean) => void;
  onMaterialPercentageChange: (value: number) => void;
  onOverheadPercentageChange: (value: number) => void;
  onGrossProfitPercentageChange: (value: number) => void;
  onDeleteIngredient: (index: number) => void;
  onEditIngredient: (index: number, updatedIngredient: TableRecipeIngredient) => void;
  onInstructionsChange?: (instructions: string[]) => void;
  onSave: () => void;
}

export function CostAnalysisLayout({
  menuItemCategory,
  menuItemName,
  price,
  isTaxable,
  isActive,
  ingredients,
  isDirty,
  costSummary,
  materialCostPercentage,
  overheadCostPercentage,
  grossProfitPercentage,
  recommendedPrice,
  instructions,
  recipeId,
  photos = [],
  onPhotoUploaded,
  onPhotoDeleted,
  onPrimaryPhotoChanged,
  onCategoryChange,
  onNameChange,
  onPriceChange,
  onTaxableChange,
  onActiveChange,
  onMaterialPercentageChange,
  onOverheadPercentageChange,
  onGrossProfitPercentageChange,
  onDeleteIngredient,
  onEditIngredient,
  onInstructionsChange,
  onSave
}: CostAnalysisLayoutProps) {
  // Find the primary photo for the header, if available
  const primaryPhoto = photos?.find(photo => photo.is_primary);
  const headerImageUrl = primaryPhoto?.url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Image */}
      <RecipeHeader 
        category={menuItemCategory} 
        customImageUrl={headerImageUrl}
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={onSave}
          disabled={!isDirty}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Top Row: Cost Summary and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Summary Panel with Recipe Details */}
          <div className="bg-white rounded-lg shadow">
            <CostSummaryPanel 
              costSummary={costSummary}
              materialCostPercentage={materialCostPercentage}
              overheadCostPercentage={overheadCostPercentage}
              grossProfitPercentage={grossProfitPercentage}
              menuItemCategory={menuItemCategory}
              menuItemName={menuItemName}
              price={price}
              isTaxable={isTaxable}
              isActive={isActive}
              recommendedPrice={recommendedPrice}
              onMaterialPercentageChange={onMaterialPercentageChange}
              onOverheadPercentageChange={onOverheadPercentageChange}
              onGrossProfitPercentageChange={onGrossProfitPercentageChange}
              onCategoryChange={onCategoryChange}
              onNameChange={onNameChange}
              onPriceChange={onPriceChange}
              onTaxableChange={onTaxableChange}
              onActiveChange={onActiveChange}
            />
          </div>

          {/* Cost Distribution Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Distribution</h3>
            <CostDistributionChart costSummary={costSummary} />
          </div>
        </div>

        {/* Recipe Tabs (Ingredients, Instructions, and Photos) */}
        <RecipeTabs
          recipeId={recipeId}
          recipeName={menuItemName}
          ingredients={ingredients}
          instructions={instructions}
          onDeleteIngredient={onDeleteIngredient}
          onEditIngredient={onEditIngredient}
          onInstructionsChange={onInstructionsChange}
          editable={!!onInstructionsChange}
        />
      </div>
    </div>
  );
}