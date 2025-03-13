import { describe, it, expect } from 'vitest';
import { ValidationService } from '../validation.service';
import type { Recipe, RecipeIngredient } from '../../../types';

describe('ValidationService', () => {
  describe('validateRecipe', () => {
    it('should validate required fields', () => {
      const recipe: Recipe = {
        id: '1',
        name: '',
        category: '',
        version: 1,
        is_active: true,
        is_taxable: false,
        created_by: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const errors = ValidationService.validateRecipe(recipe);

      expect(errors).toHaveLength(3);
      expect(errors).toContainEqual({ field: 'name', message: 'Recipe name is required' });
      expect(errors).toContainEqual({ field: 'category', message: 'Category is required' });
      expect(errors).toContainEqual({ field: 'price', message: 'Price is required' });
    });

    it('should validate price constraints', () => {
      const recipe: Recipe = {
        id: '1',
        name: 'Test Recipe',
        category: 'Test',
        version: 1,
        is_active: true,
        is_taxable: false,
        price: -10,
        created_by: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const errors = ValidationService.validateRecipe(recipe);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ field: 'price', message: 'Price cannot be negative' });
    });
  });

  describe('validateIngredient', () => {
    it('should validate required fields', () => {
      const ingredient: RecipeIngredient = {
        id: '1',
        recipe_id: '1',
        ingredient_id: '',
        quantity: 0,
        unit_id: '',
        created_by: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const errors = ValidationService.validateIngredient(ingredient);

      expect(errors).toHaveLength(3);
      expect(errors).toContainEqual({ field: 'ingredient_id', message: 'Ingredient is required' });
      expect(errors).toContainEqual({ field: 'unit_id', message: 'Unit is required' });
      expect(errors).toContainEqual({ field: 'quantity', message: 'Quantity must be greater than 0' });
    });
  });

  describe('validateRecipeWithIngredients', () => {
    it('should validate complete recipe with ingredients', () => {
      const recipe: Recipe = {
        id: '1',
        name: 'Test Recipe',
        category: 'Test',
        version: 1,
        is_active: true,
        is_taxable: false,
        price: 100,
        created_by: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const ingredients: RecipeIngredient[] = [];

      const errors = ValidationService.validateRecipeWithIngredients(recipe, ingredients);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ 
        field: 'ingredients', 
        message: 'Recipe must have at least one ingredient' 
      });
    });
  });
});