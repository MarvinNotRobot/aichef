import { RecipeService } from './recipe.service';
import { appLogger } from '../logger';
import type { Recipe } from '../../types';

export class RecipeListService {
  static async fetchRecipes(): Promise<Recipe[]> {
    try {
      appLogger.info('Fetching all recipes');
      return await RecipeService.fetchRecipeList();
    } catch (error) {
      appLogger.error('Failed to fetch recipes', { error });
      throw error;
    }
  }

  static async deleteRecipe(recipeId: string): Promise<void> {
    try {
      appLogger.info('Deleting recipe', { recipeId });
      await RecipeService.deleteRecipe(recipeId);
      appLogger.info('Recipe deleted successfully', { recipeId });
    } catch (error) {
      appLogger.error('Failed to delete recipe', { error, recipeId });
      throw error;
    }
  }

  static async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      appLogger.info('Searching recipes', { query });
      const recipes = await RecipeService.fetchRecipeList();
      return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.category.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      appLogger.error('Failed to search recipes', { error, query });
      throw error;
    }
  }

  static async filterRecipesByCategory(category: string): Promise<Recipe[]> {
    try {
      appLogger.info('Filtering recipes by category', { category });
      const recipes = await RecipeService.fetchRecipeList();
      return category === 'all' 
        ? recipes 
        : recipes.filter(recipe => recipe.category === category);
    } catch (error) {
      appLogger.error('Failed to filter recipes', { error, category });
      throw error;
    }
  }
}