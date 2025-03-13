import { appLogger } from '../logger';
import type { Recipe, RecipeIngredient } from '../../types';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationService {
  static validateRecipe(recipe: Recipe): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    if (!recipe.name?.trim()) {
      errors.push({ field: 'name', message: 'Recipe name is required' });
    }

    if (!recipe.category?.trim()) {
      errors.push({ field: 'category', message: 'Category is required' });
    }

    // Price validation
    if (recipe.price !== undefined && recipe.price !== null) {
      if (recipe.price < 0) {
        errors.push({ field: 'price', message: 'Price cannot be negative' });
      }
    } else {
      errors.push({ field: 'price', message: 'Price is required' });
    }

    return errors;
  }

  static validateIngredient(ingredient: RecipeIngredient): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!ingredient.ingredient_id) {
      errors.push({ field: 'ingredient_id', message: 'Ingredient is required' });
    }

    if (!ingredient.unit_id) {
      errors.push({ field: 'unit_id', message: 'Unit is required' });
    }

    if (ingredient.quantity <= 0) {
      errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
    }

    return errors;
  }

  static validateRecipeWithIngredients(
    recipe: Recipe, 
    ingredients: RecipeIngredient[]
  ): ValidationError[] {
    try {
      const errors: ValidationError[] = [];

      // Validate recipe
      const recipeErrors = this.validateRecipe(recipe);
      errors.push(...recipeErrors);

      // Validate ingredients
      if (ingredients.length === 0) {
        errors.push({ 
          field: 'ingredients', 
          message: 'Recipe must have at least one ingredient' 
        });
      } else {
        ingredients.forEach((ingredient, index) => {
          const ingredientErrors = this.validateIngredient(ingredient);
          ingredientErrors.forEach(error => {
            errors.push({
              field: `ingredients[${index}].${error.field}`,
              message: error.message
            });
          });
        });
      }

      return errors;
    } catch (error) {
      appLogger.error('Error validating recipe', { error });
      return [{ 
        field: 'general', 
        message: 'An error occurred while validating the recipe' 
      }];
    }
  }
}