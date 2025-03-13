import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth/auth.store';
import { useRecipeStore } from '../lib/recipe/recipe.store';
import { RecipeService } from '../lib/recipe/recipe.service';
import type { Recipe, TableRecipeIngredient, CostSummary } from '../types';
import { appLogger } from '../lib/logger';
import { supabase } from '../lib/supabase/client';

export function useRecipeForm(recipeId: string | undefined) {
  const { user } = useAuthStore();
  const { currentRecipe, isLoading, error, fetchRecipeById, updateRecipe, createRecipe, clearCurrentRecipe } = useRecipeStore();

  const [menuItemCategory, setMenuItemCategory] = useState('Lunch');
  const [menuItemName, setMenuItemName] = useState('');
  const [price, setPrice] = useState('15.00');
  const [isTaxable, setIsTaxable] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [ingredients, setIngredients] = useState<TableRecipeIngredient[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [costSummary, setCostSummary] = useState<CostSummary>({
    foodCost: 0,
    foodCostPercentage: 0,
    materialCost: 0,
    materialCostPercentage: 0,
    overheadCost: 0,
    overheadCostPercentage: 0,
    totalCost: 0,
    totalCostPercentage: 0,
    grossProfit: 0,
    grossProfitPercentage: 0
  });

  useEffect(() => {
    if (user && !isInitialized) {
      const loadInitialRecipe = async () => {
        try {
          appLogger.info('Loading recipe based on URL parameter', { recipeId });

          if (recipeId) {
            // Load specific recipe if ID is provided
            await fetchRecipeById(recipeId);
            await loadRecipeIngredients(recipeId);
          } else {
            // Clear form for new recipe
            setMenuItemName('');
            setMenuItemCategory('Lunch');
            setPrice('15.00');
            setIsTaxable(false);
            setIsActive(true);
            setIngredients([]);
            setIsDirty(false);
            clearCurrentRecipe();
          }
          setIsInitialized(true);
        } catch (error) {
          appLogger.error('Failed to load recipe', { error, recipeId });
        }
      };

      loadInitialRecipe();
    }
  }, [user, recipeId, fetchRecipeById, clearCurrentRecipe, isInitialized]);

  const loadRecipeIngredients = async (recipeId: string) => {
    try {
      const { data: recipeIngredients, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          *,
          ingredient:ingredients(*),
          unit:units(*)
        `)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      if (recipeIngredients) {
        const formattedIngredients = recipeIngredients.map(ri => {
          const unitCost = ri.unit_cost || 0;
          const totalCost = unitCost * ri.quantity;
          const recipePrice = parseFloat(price);
          const costPercentage = recipePrice > 0 ? (totalCost / recipePrice) * 100 : 0;

          return {
            ingredient: ri.ingredient,
            quantity: ri.quantity,
            unit: ri.unit,
            unitCost,
            totalCost,
            costPercentage,
            notes: ri.notes
          };
        });

        setIngredients(formattedIngredients);
      }
    } catch (error) {
      appLogger.error('Failed to load recipe ingredients', { error, recipeId });
    }
  };

  useEffect(() => {
    if (currentRecipe) {
      appLogger.info('Updating form with current recipe data', { 
        recipeId: currentRecipe.id
      });

      setMenuItemName(currentRecipe.name);
      setMenuItemCategory(currentRecipe.category);
      setPrice(currentRecipe.price?.toString() || '0');
      setIsTaxable(currentRecipe.is_taxable);
      setIsActive(currentRecipe.is_active);
      
      const loadCostSummary = async () => {
        try {
          const summary = await RecipeService.calculateCostSummary(currentRecipe);
          setCostSummary(summary);
        } catch (error) {
          appLogger.error('Failed to calculate cost summary', { error });
        }
      };

      loadCostSummary();
    }
  }, [currentRecipe]);

  const refreshData = async () => {
    try {
      if (recipeId) {
        appLogger.info('Refreshing recipe data', { recipeId });
        await fetchRecipeById(recipeId);
        await loadRecipeIngredients(recipeId);
      }
    } catch (error) {
      appLogger.error('Failed to refresh recipe data', { error, recipeId });
    }
  };

  const handleCreateNewRecipe = async () => {
    if (!user) return;

    try {
      appLogger.info('Starting new recipe creation process');
      const timestamp = new Date().getTime();
      const newRecipe = {
        name: `New Recipe ${timestamp}`,
        category: 'Lunch',
        version: 1,
        is_active: true,
        is_taxable: false,
        price: 15.00,
        created_by: user.id
      };

      setMenuItemName(newRecipe.name);
      setMenuItemCategory(newRecipe.category);
      setPrice(newRecipe.price.toString());
      setIsTaxable(newRecipe.is_taxable);
      setIsActive(newRecipe.is_active);
      setIngredients([]);
      setIsDirty(true);

      appLogger.info('New recipe state initialized', {
        menuItemName: newRecipe.name,
        menuItemCategory: newRecipe.category,
        price: newRecipe.price
      });

    } catch (error) {
      appLogger.error('Failed to create new recipe', { error });
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) return;

    try {
      const recipeData = {
        name: menuItemName,
        category: menuItemCategory,
        is_active: isActive,
        is_taxable: isTaxable,
        price: parseFloat(price),
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      appLogger.info('Starting recipe save process', {
        recipeData,
        currentRecipeId: currentRecipe?.id,
        ingredientCount: ingredients.length
      });

      let savedRecipe;
      if (currentRecipe?.id) {
        savedRecipe = await updateRecipe(currentRecipe.id, recipeData);
      } else {
        savedRecipe = await createRecipe(recipeData);
      }

      if (savedRecipe) {
        await saveIngredients(savedRecipe.id);
        setIsDirty(false);
      }
    } catch (error) {
      appLogger.error('Failed to save recipe', { error });
      throw error;
    }
  };

  const saveIngredients = async (recipeId: string) => {
    try {
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

        // Save ingredients
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
            unit_cost: ing.unitCost, // Store the unit cost
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
  };

  return {
    menuItemCategory,
    menuItemName,
    price,
    isTaxable,
    isActive,
    ingredients,
    isDirty,
    isLoading,
    error,
    costSummary,
    setMenuItemCategory,
    setMenuItemName,
    setPrice,
    setIsTaxable,
    setIsActive,
    setIngredients,
    setIsDirty,
    handleCreateNewRecipe,
    handleSaveRecipe,
    refreshData
  };
}