import { create } from 'zustand';
import { supabase } from '../supabase/client';
import type { RecipeState } from '../../types';
import type { Recipe, RecipeIngredient } from '../../types';
import { appLogger } from '../logger';
import { RecipeService } from './recipe.service';

interface RecipeStore extends RecipeState {
  isNewRecipe: boolean;
  setIsNewRecipe: (value: boolean) => void;
  fetchRecipes: () => Promise<void>;
  fetchRecipeById: (id: string) => Promise<void>;
  createRecipe: (recipe: Partial<Recipe>) => Promise<Recipe | null>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<void>;
  fetchRecipeIngredients: (recipeId: string) => Promise<RecipeIngredient[]>;
  clearCurrentRecipe: () => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
  isNewRecipe: false,

  setIsNewRecipe: (value: boolean) => {
    appLogger.info('Setting isNewRecipe state', { 
      oldValue: get().isNewRecipe,
      newValue: value,
      currentRecipe: get().currentRecipe
    });
    set({ isNewRecipe: value });
  },

  fetchRecipes: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ recipes: data || [], isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch recipes';
      set({ error: message, isLoading: false });
      appLogger.error('Failed to fetch recipes', { error });
    }
  },

  deleteRecipe: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await RecipeService.deleteRecipe(id);
      
      // Update local state by removing the deleted recipe
      set(state => ({
        recipes: state.recipes.filter(recipe => recipe.id !== id),
        isLoading: false
      }));

      appLogger.info('Recipe deleted and state updated', { deletedRecipeId: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete recipe';
      set({ error: message, isLoading: false });
      appLogger.error('Failed to delete recipe', { error, recipeId: id });
      throw error;
    }
  },

  fetchRecipeById: async (id: string) => {
    if (!id) {
      appLogger.error('Invalid recipe ID', { id });
      set({ error: 'Invalid recipe ID', isLoading: false });
      return;
    }

    try {
      appLogger.info('Fetching recipe by ID', { recipeId: id });
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          appLogger.warn('Recipe not found', { recipeId: id });
          set({ error: 'Recipe not found', isLoading: false });
          return;
        }
        throw error;
      }

      appLogger.info('Recipe fetched successfully', { recipe: data });
      set({ currentRecipe: data, isLoading: false, isNewRecipe: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch recipe';
      set({ error: message, isLoading: false });
      appLogger.error('Failed to fetch recipe', { error, recipeId: id });
    }
  },

  createRecipe: async (recipe: Partial<Recipe>) => {
    try {
      appLogger.info('Entering createRecipe function', { 
        recipe,
        isNewRecipe: get().isNewRecipe
      });
      set({ isLoading: true, error: null });

      // Generate a unique name if it's a default recipe
      if (recipe.name === 'New Recipe') {
        recipe.name = `New Recipe ${Date.now()}`;
      }

      appLogger.debug('Preparing to insert recipe', {
        recipeData: recipe,
        operation: 'CREATE'
      });

      const { data, error } = await supabase
        .from('recipes')
        .insert([recipe])
        .select()
        .single();

      if (error) {
        appLogger.error('Failed to create recipe in database', { error });
        throw error;
      }

      if (!data) {
        const message = 'No data returned from recipe creation';
        appLogger.error(message);
        throw new Error(message);
      }

      appLogger.info('Recipe created successfully', { 
        recipeId: data.id,
        recipeName: data.name,
        savedData: data
      });

      set(state => ({
        recipes: [data, ...state.recipes],
        currentRecipe: data,
        isLoading: false,
        isNewRecipe: false
      }));

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create recipe';
      set({ error: message, isLoading: false });
      appLogger.error('Failed to create recipe', { 
        error,
        attemptedRecipe: recipe
      });
      return null;
    }
  },

  updateRecipe: async (id: string, updates: Partial<Recipe>) => {
    if (!id) {
      const message = 'Invalid recipe ID for update';
      appLogger.error(message, { id });
      set({ error: message, isLoading: false });
      return null;
    }

    try {
      appLogger.info('Starting recipe update process', { 
        recipeId: id,
        updates,
        isNewRecipe: get().isNewRecipe
      });

      set({ isLoading: true, error: null });

      // First verify the recipe exists and user has access
      appLogger.debug('Verifying recipe exists and is accessible', { recipeId: id });
      const { data: existingRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (fetchError) {
        appLogger.error('Failed to fetch existing recipe', { error: fetchError });
        throw new Error('Recipe not found or access denied');
      }

      if (!existingRecipe) {
        const message = 'Recipe not found or access denied';
        appLogger.error(message, { recipeId: id });
        throw new Error(message);
      }

      appLogger.debug('Preparing to update recipe', {
        recipeId: id,
        existingRecipe,
        updates,
        operation: 'UPDATE'
      });

      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) {
        appLogger.error('Failed to update recipe in database', { error });
        throw error;
      }

      if (!data) {
        const message = 'No data returned from recipe update';
        appLogger.error(message);
        throw new Error(message);
      }

      appLogger.info('Recipe updated successfully', { 
        recipeId: id,
        recipeName: data.name,
        updatedData: data
      });

      set(state => ({
        recipes: state.recipes.map(recipe => recipe.id === id ? data : recipe),
        currentRecipe: data,
        isLoading: false
      }));

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update recipe';
      set({ error: message, isLoading: false });
      appLogger.error('Failed to update recipe', { 
        error,
        recipeId: id,
        attemptedUpdates: updates
      });
      return null;
    }
  },

  fetchRecipeIngredients: async (recipeId: string) => {
    if (!recipeId) {
      appLogger.error('Invalid recipe ID for ingredients', { recipeId });
      throw new Error('Invalid recipe ID');
    }

    try {
      appLogger.info('Fetching recipe ingredients', { recipeId });
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          *,
          ingredient:ingredients(*),
          unit:units(*)
        `)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      appLogger.info('Recipe ingredients fetched successfully', { 
        recipeId,
        ingredientCount: data?.length || 0
      });

      return data || [];
    } catch (error) {
      appLogger.error('Failed to fetch recipe ingredients', { error, recipeId });
      throw error;
    }
  },

  clearCurrentRecipe: () => {
    appLogger.info('Clearing current recipe and resetting state');
    set({ 
      currentRecipe: null,
      isNewRecipe: false
    });
  }
}));