import { supabase } from '../supabase/client';
import { RecipeAIService } from '../ai/recipe.ai';
import type { Recipe, RecipeIngredient, CostSummary, TableRecipeIngredient } from '../../types';
import { appLogger } from '../logger';
import { CostService } from './cost.service';

export class RecipeService {
  static async fetchRecipeList(): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      appLogger.error('Failed to fetch recipe list', { error });
      throw error;
    }
  }

  static async fetchRecipeById(id: string): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      appLogger.error('Failed to fetch recipe by ID', { error, recipeId: id });
      throw error;
    }
  }

  static async fetchRecipeIngredients(recipeId: string): Promise<TableRecipeIngredient[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          *,
          ingredient:ingredients(*),
          unit:units(*)
        `)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      return (data || []).map(ri => ({
        ingredient: ri.ingredient,
        quantity: ri.quantity,
        unit: ri.unit,
        unitCost: ri.unit_cost || 0,
        totalCost: (ri.unit_cost || 0) * ri.quantity,
        costPercentage: 0, // Will be calculated later
        notes: ri.notes
      }));
    } catch (error) {
      appLogger.error('Failed to fetch recipe ingredients', { error, recipeId });
      throw error;
    }
  }

  static async calculateCostSummary(recipe: Recipe): Promise<CostSummary> {
    try {
      const { data: ingredients, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          quantity,
          unit_cost,
          ingredient:ingredients(
            id,
            name
          ),
          unit:units(
            id,
            name,
            conversion_factor
          )
        `)
        .eq('recipe_id', recipe.id);

      if (error) throw error;

      const tableIngredients: TableRecipeIngredient[] = ingredients.map(item => ({
        ingredient: item.ingredient,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unit_cost || 0,
        totalCost: (item.unit_cost || 0) * item.quantity * (item.unit.conversion_factor || 1),
        costPercentage: 0 // Will be calculated by CostService
      }));

      return CostService.calculateCostSummary(
        tableIngredients,
        recipe.price || 0,
        recipe.material_cost || 0,
        recipe.overhead_cost || 0
      );
    } catch (error) {
      appLogger.error('Failed to calculate cost summary', { error });
      throw error;
    }
  }

  static async createRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        appLogger.error('Authentication error', { error: authError });
        throw new Error('User not authenticated');
      }

      // Prepare the recipe data with only the instructions field
      const { instruction, ...recipeData } = recipe;

      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          ...recipeData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from recipe creation');

      return data;
    } catch (error) {
      appLogger.error('Failed to create recipe', { error });
      throw error;
    }
  }

  static async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        appLogger.error('Authentication error', { error: authError });
        throw new Error('User not authenticated');
      }

      appLogger.info('Starting recipe update', {
        recipeId: id,
        userId: user.id,
        updates
      });

      // First verify the recipe exists and user has access
      const { data: existingRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .eq('created_by', user.id)
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

      // Remove the instruction field from updates
      const { instruction, ...updateData } = updates;

      // Then perform the update with explicit user check
      const { data, error } = await supabase
        .from('recipes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('created_by', user.id)
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
        recipeName: data.name
      });

      return data;
    } catch (error) {
      appLogger.error('Failed to update recipe', { error });
      throw error;
    }
  }

  static async deleteRecipe(id: string): Promise<void> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        appLogger.error('Authentication error', { error: authError });
        throw new Error('User not authenticated');
      }

      // First delete recipe ingredients
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)
        .eq('created_by', user.id);

      if (ingredientsError) throw ingredientsError;

      // Then delete the recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (recipeError) throw recipeError;
    } catch (error) {
      appLogger.error('Failed to delete recipe', { error });
      throw error;
    }
  }

  static async saveRecipeIngredients(
    recipeId: string,
    ingredients: TableRecipeIngredient[]
  ): Promise<void> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        appLogger.error('Authentication error', { error: authError });
        throw new Error('User not authenticated');
      }

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId);

      if (deleteError) throw deleteError;

      if (ingredients.length > 0) {
        // Save units
        const uniqueUnits = Array.from(
          new Map(
            ingredients.map(ing => [ing.unit.name, {
              name: ing.unit.name.toLowerCase().trim(),
              abbreviation: ing.unit.abbreviation.toLowerCase().trim(),
              conversion_factor: ing.unit.conversion_factor || 1
            }])
          ).values()
        );

        const { data: savedUnits, error: unitError } = await supabase
          .from('units')
          .upsert(uniqueUnits, {
            onConflict: 'name'
          })
          .select();

        if (unitError) throw unitError;

        // Save ingredients with explicit created_by
        const ingredientRecords = ingredients.map(ing => ({
          name: ing.ingredient.name,
          created_by: user.id
        }));

        const { data: savedIngredients, error: ingredientError } = await supabase
          .from('ingredients')
          .upsert(ingredientRecords, {
            onConflict: 'name,created_by'
          })
          .select();

        if (ingredientError) throw ingredientError;

        // Save recipe ingredients with unit cost
        const recipeIngredients = ingredients.map(ing => {
          const savedIngredient = savedIngredients?.find(si => si.name === ing.ingredient.name);
          const savedUnit = savedUnits?.find(su => su.name === ing.unit.name.toLowerCase().trim());

          if (!savedIngredient || !savedUnit) {
            throw new Error('Failed to find saved ingredient or unit');
          }

          return {
            recipe_id: recipeId,
            ingredient_id: savedIngredient.id,
            quantity: ing.quantity,
            unit_id: savedUnit.id,
            unit_cost: ing.unitCost,
            notes: ing.notes,
            created_by: user.id
          };
        });

        const { error: recipeIngredientError } = await supabase
          .from('recipe_ingredients')
          .insert(recipeIngredients);

        if (recipeIngredientError) throw recipeIngredientError;

        appLogger.info('Recipe ingredients saved successfully', {
          recipeId,
          ingredientCount: recipeIngredients.length
        });
      }
    } catch (error) {
      appLogger.error('Failed to save recipe ingredients', { error });
      throw error;
    }
  }

  static async parseRecipeFromAI(input: string): Promise<{
    name: string;
    category: string;
    suggestedPrice: number;
    ingredients: TableRecipeIngredient[];
    instructions?: string[];
  }> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        appLogger.error('Authentication error', { error: authError });
        throw new Error('User not authenticated');
      }

      const parsedRecipe = await RecipeAIService.parseRecipeText(input);

      const ingredients: TableRecipeIngredient[] = parsedRecipe.ingredients.map(ing => ({
        ingredient: {
          id: '',
          name: ing.name,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        quantity: ing.quantity,
        unit: {
          id: '',
          name: ing.unit,
          abbreviation: ing.unit,
          conversion_factor: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        unitCost: ing.price,
        totalCost: ing.price * ing.quantity,
        costPercentage: ((ing.price * ing.quantity) / parsedRecipe.suggestedPrice) * 100,
        notes: ing.notes
      }));

      return {
        name: parsedRecipe.name,
        category: parsedRecipe.category,
        suggestedPrice: parsedRecipe.suggestedPrice,
        ingredients,
        instructions: parsedRecipe.instructions || []
      };
    } catch (error) {
      appLogger.error('Failed to parse recipe from AI', { error });
      throw error;
    }
  }
}