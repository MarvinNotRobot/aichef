import { appLogger } from '../logger';
import type { Recipe, Ingredient, Unit } from '../../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  notes?: string;
}

interface ParsedRecipe {
  name: string;
  category: string;
  ingredients: ParsedIngredient[];
  suggestedPrice: number;
  instructions?: string[];
}

export class RecipeAIService {
  static async parseRecipeText(text: string): Promise<ParsedRecipe> {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      if (!text.trim()) {
        throw new Error('Recipe text cannot be empty');
      }

      appLogger.info(`Starting recipe text parsing [${requestId}]`, {
        input: text.substring(0, 100) + '...'
      });

      const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to parse recipe');
      }

      const parsedResponse = await response.json();

      // Validate the response
      if (!parsedResponse.name || !parsedResponse.category || !Array.isArray(parsedResponse.ingredients)) {
        throw new Error('Invalid response format from AI service');
      }

      // Validate and sanitize ingredients
      parsedResponse.ingredients = parsedResponse.ingredients.map(ing => ({
        name: ing.name || 'Unknown Ingredient',
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit || 'ea',
        price: Number(ing.price) || 0,
        notes: ing.notes
      }));

      // Ensure suggestedPrice is a number
      parsedResponse.suggestedPrice = Number(parsedResponse.suggestedPrice) || 0;

      // Ensure instructions is an array
      if (!parsedResponse.instructions) {
        parsedResponse.instructions = [];
      }

      appLogger.info(`Successfully parsed recipe [${requestId}]`, {
        recipeName: parsedResponse.name,
        category: parsedResponse.category,
        ingredientCount: parsedResponse.ingredients.length,
        suggestedPrice: parsedResponse.suggestedPrice,
        hasInstructions: parsedResponse.instructions && parsedResponse.instructions.length > 0
      });

      return parsedResponse;
    } catch (error) {
      appLogger.error(`Recipe parsing failed [${requestId}]`, {
        error,
        input: text.substring(0, 100) + '...'
      });
      throw new Error(error instanceof Error ? error.message : 'Failed to parse recipe information. Please try again.');
    }
  }

  static async suggestRecipeFromName(name: string): Promise<ParsedRecipe> {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      if (!name.trim()) {
        throw new Error('Recipe name cannot be empty');
      }

      appLogger.info(`Starting recipe suggestion [${requestId}]`, {
        recipeName: name
      });

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate recipe');
      }

      const parsedResponse = await response.json();

      // Validate the response
      if (!parsedResponse.name || !parsedResponse.category || !Array.isArray(parsedResponse.ingredients)) {
        throw new Error('Invalid response format from AI service');
      }

      // Validate and sanitize ingredients
      parsedResponse.ingredients = parsedResponse.ingredients.map(ing => ({
        name: ing.name || 'Unknown Ingredient',
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit || 'ea',
        price: Number(ing.price) || 0,
        notes: ing.notes
      }));

      // Ensure suggestedPrice is a number
      parsedResponse.suggestedPrice = Number(parsedResponse.suggestedPrice) || 0;

      // Ensure instructions is an array
      if (!parsedResponse.instructions) {
        parsedResponse.instructions = [];
      }

      appLogger.info(`Successfully generated recipe suggestion [${requestId}]`, {
        recipeName: parsedResponse.name,
        category: parsedResponse.category,
        ingredientCount: parsedResponse.ingredients.length,
        suggestedPrice: parsedResponse.suggestedPrice,
        hasInstructions: parsedResponse.instructions && parsedResponse.instructions.length > 0
      });

      return parsedResponse;
    } catch (error) {
      appLogger.error(`Recipe suggestion failed [${requestId}]`, {
        error,
        recipeName: name
      });
      throw new Error(error instanceof Error ? error.message : 'Failed to generate recipe suggestion. Please try again.');
    }
  }
}