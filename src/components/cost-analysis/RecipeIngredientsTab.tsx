import React from 'react';
import { IngredientsTable } from './IngredientsTable';
import type { TableRecipeIngredient } from '../../types';

interface RecipeIngredientsTabProps {
  ingredients: TableRecipeIngredient[];
  onDeleteIngredient: (index: number) => void;
  onEditIngredient: (index: number, updatedIngredient: TableRecipeIngredient) => void;
}

export function RecipeIngredientsTab({ 
  ingredients, 
  onDeleteIngredient, 
  onEditIngredient 
}: RecipeIngredientsTabProps) {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 italic">No ingredients added yet. Use the Recipe Assistant to add ingredients.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <IngredientsTable
        ingredients={ingredients}
        onDeleteIngredient={onDeleteIngredient}
        onEditIngredient={onEditIngredient}
      />
    </div>
  );
}