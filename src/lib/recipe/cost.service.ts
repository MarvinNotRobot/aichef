import { appLogger } from '../logger';
import type { Recipe, RecipeIngredient, CostSummary, TableRecipeIngredient } from '../../types';

export class CostService {
  /**
   * Calculates costs and percentages for a list of ingredients
   */
  static calculateIngredientCosts(
    ingredients: TableRecipeIngredient[],
    totalPrice: number
  ): TableRecipeIngredient[] {
    try {
      appLogger.info('Calculating ingredient costs', {
        ingredientCount: ingredients.length,
        totalPrice
      });

      // First calculate total costs for each ingredient
      const ingredientsWithCosts = ingredients.map(ingredient => {
        const totalCost = ingredient.quantity * ingredient.unitCost;
        return {
          ...ingredient,
          totalCost,
          costPercentage: totalPrice > 0 ? (totalCost / totalPrice) * 100 : 0
        };
      });

      appLogger.debug('Ingredient costs calculated', {
        ingredientsWithCosts: ingredientsWithCosts.map(ing => ({
          name: ing.ingredient.name,
          totalCost: ing.totalCost,
          costPercentage: ing.costPercentage
        }))
      });

      return ingredientsWithCosts;
    } catch (error) {
      appLogger.error('Error calculating ingredient costs', { error });
      throw error;
    }
  }

  /**
   * Updates ingredient costs and percentages when a single value changes
   */
  static updateIngredientCosts(
    ingredients: TableRecipeIngredient[],
    totalPrice: number,
    index: number,
    updates: Partial<TableRecipeIngredient>
  ): TableRecipeIngredient[] {
    try {
      appLogger.info('Updating ingredient costs', {
        ingredientIndex: index,
        updates,
        totalPrice
      });

      // Create new ingredients array with updates applied
      const updatedIngredients = ingredients.map((ingredient, i) => {
        if (i === index) {
          const updated = { ...ingredient, ...updates };
          // Recalculate total cost if quantity or unit cost changed
          if (updates.quantity !== undefined || updates.unitCost !== undefined) {
            updated.totalCost = updated.quantity * updated.unitCost;
            updated.costPercentage = totalPrice > 0 ? (updated.totalCost / totalPrice) * 100 : 0;
          }
          return updated;
        }
        return ingredient;
      });

      appLogger.debug('Ingredient costs updated', {
        updatedIngredient: updatedIngredients[index]
      });

      return updatedIngredients;
    } catch (error) {
      appLogger.error('Error updating ingredient costs', { error });
      throw error;
    }
  }

  /**
   * Calculates total food cost from ingredients
   */
  private static calculateTotalFoodCost(ingredients: TableRecipeIngredient[]): number {
    return ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.unitCost), 0);
  }

  /**
   * Calculates cost summary for a recipe
   */
  static calculateCostSummary(
    ingredients: TableRecipeIngredient[],
    totalPrice: number,
    materialCostPercentage: number = 10,
    overheadCostPercentage: number = 15
  ): CostSummary {
    try {
      appLogger.info('Calculating recipe cost summary', {
        ingredientCount: ingredients.length,
        totalPrice,
        materialCostPercentage,
        overheadCostPercentage
      });

      // Calculate total food cost from ingredients
      const totalFoodCost = this.calculateTotalFoodCost(ingredients);

      // Calculate material and overhead costs as percentages of food cost
      const materialCost = (totalFoodCost * materialCostPercentage) / 100;
      const overheadCost = (totalFoodCost * overheadCostPercentage) / 100;

      // Calculate total cost
      const totalCost = totalFoodCost + materialCost + overheadCost;

      // Calculate gross profit
      const grossProfit = totalPrice - totalCost;

      const summary: CostSummary = {
        foodCost: totalFoodCost,
        materialCost,
        materialCostPercentage,
        overheadCost,
        overheadCostPercentage,
        totalCost,
        grossProfit,
        grossProfitPercentage: totalPrice > 0 ? (grossProfit / totalPrice) * 100 : 0
      };

      appLogger.debug('Cost summary calculated', { summary });

      return summary;
    } catch (error) {
      appLogger.error('Error calculating cost summary', { error });
      throw error;
    }
  }

  /**
   * Calculates ingredient cost from recipe ingredient
   */
  static calculateIngredientCost(ingredient: RecipeIngredient): {
    unitCost: number;
    totalCost: number;
    costPercentage: number;
  } {
    try {
      // Get the latest price for the ingredient
      const prices = ingredient.ingredient.ingredient_prices || [];
      const latestPrice = prices.sort((a, b) => 
        new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
      )[0];

      if (!latestPrice) {
        appLogger.warn('No price found for ingredient', { 
          ingredientId: ingredient.ingredient.id,
          ingredientName: ingredient.ingredient.name 
        });
        return { unitCost: 0, totalCost: 0, costPercentage: 0 };
      }

      // Calculate costs
      const unitCost = latestPrice.price;
      const totalCost = unitCost * ingredient.quantity;
      const costPercentage = ingredient.recipe?.price ? (totalCost / ingredient.recipe.price) * 100 : 0;

      return { unitCost, totalCost, costPercentage };
    } catch (error) {
      appLogger.error('Error calculating ingredient cost', { error });
      return { unitCost: 0, totalCost: 0, costPercentage: 0 };
    }
  }

  /**
   * Validates ingredient cost calculations
   */
  static validateCostCalculations(
    ingredients: TableRecipeIngredient[]
  ): string[] {
    const errors: string[] = [];

    try {
      ingredients.forEach((ingredient, index) => {
        // Validate unit cost
        if (ingredient.unitCost < 0) {
          errors.push(`Ingredient ${index + 1}: Unit cost cannot be negative`);
        }

        // Validate quantity
        if (ingredient.quantity <= 0) {
          errors.push(`Ingredient ${index + 1}: Quantity must be greater than 0`);
        }

        // Validate total cost calculation
        const expectedTotalCost = ingredient.quantity * ingredient.unitCost;
        if (Math.abs(ingredient.totalCost - expectedTotalCost) > 0.001) {
          errors.push(`Ingredient ${index + 1}: Total cost calculation is incorrect`);
        }

        // Validate cost percentage is between 0 and 100
        if (ingredient.costPercentage < 0 || ingredient.costPercentage > 100) {
          errors.push(`Ingredient ${index + 1}: Cost percentage must be between 0 and 100`);
        }
      });

      if (errors.length > 0) {
        appLogger.warn('Cost calculation validation errors found', { errors });
      }

      return errors;
    } catch (error) {
      appLogger.error('Error validating cost calculations', { error });
      throw error;
    }
  }
}