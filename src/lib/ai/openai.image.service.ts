import { appLogger } from '../logger';
import type { TableRecipeIngredient } from '../types';
import { supabase } from '../supabase/client';

export class OpenAIImageService {
  private static readonly SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  private static readonly TIMEOUT = 30000; // 30 seconds

  private static readonly PLACEHOLDER_IMAGES = {
    default: {
      url: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65',
      params: 'w=1600&auto=format&fit=crop&q=80'
    },
    apiError: {
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      params: 'w=1600&auto=format&fit=crop&q=80'
    },
    networkError: {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
      params: 'w=1600&auto=format&fit=crop&q=80'
    },
    rateLimit: {
      url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
      params: 'w=1600&auto=format&fit=crop&q=80'
    }
  };

  static async generateImage(prompt: string, recipeId: string): Promise<string> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this.MAX_RETRIES) {
      try {
        if (!prompt.trim()) {
          throw new Error('Empty prompt provided');
        }

        appLogger.info('Starting image generation', { 
          promptLength: prompt.length,
          attempt: retryCount + 1
        });

        // Get auth session
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;
        if (!session) throw new Error('No active session');

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

        try {
          const response = await fetch(`${this.SUPABASE_URL}/functions/v1/generate-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ prompt, recipeId }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate image');
          }

          const result = await response.json();

          appLogger.info('Image generated successfully', {
            path: result.path,
            duration: result.duration
          });

          return result.path;

        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const shouldRetry = 
          error instanceof Error && 
          (error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('429') ||
           error.message === 'Request timeout');

        if (shouldRetry && retryCount < this.MAX_RETRIES - 1) {
          const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
          appLogger.warn('Retrying after error', {
            error: lastError.message,
            delay,
            retriesLeft: this.MAX_RETRIES - retryCount - 1
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }

        appLogger.error('Failed to generate image', {
          error: lastError,
          attempts: retryCount + 1
        });

        break;
      }
    }

    // Return placeholder image based on error type
    return this.getPlaceholderUrl(this.getErrorType(lastError));
  }

  private static getErrorType(error: Error | null): keyof typeof OpenAIImageService.PLACEHOLDER_IMAGES {
    if (!error) return 'default';
    
    if (error.message.includes('API key')) return 'apiError';
    if (error.message.includes('fetch') || error.message.includes('network')) return 'networkError';
    if (error.message.includes('429') || error.message.includes('rate limit')) return 'rateLimit';
    return 'default';
  }

  private static getPlaceholderUrl(type: keyof typeof OpenAIImageService.PLACEHOLDER_IMAGES): string {
    const placeholder = this.PLACEHOLDER_IMAGES[type];
    appLogger.warn('Using placeholder image', { type });
    return `${placeholder.url}?${placeholder.params}`;
  }

  static enhancePrompt(
    recipeName: string,
    ingredients: TableRecipeIngredient[] = [],
    instructions: string[] = []
  ): string {
    try {
      if (!recipeName.trim()) {
        throw new Error('Recipe name is required for prompt generation');
      }

      // Extract key ingredients for visual emphasis
      const mainIngredients = ingredients
        .sort((a, b) => b.costPercentage - a.costPercentage)
        .slice(0, 3)
        .map(ing => ing.ingredient.name)
        .filter(name => name && name.trim())
        .join(', ');

      // Extract key preparation methods from instructions
      const cookingMethods = this.extractCookingMethods(instructions);
      
      // Build a detailed prompt
      const promptParts: string[] = [
        `A professional, appetizing photo of ${recipeName}`,
        mainIngredients && `featuring ${mainIngredients}`,
        cookingMethods,
        'styled as a high-end restaurant presentation',
        'shot from a 45-degree angle with soft natural lighting',
        'shallow depth of field',
        'on a clean modern white plate with elegant plating',
        'garnished appropriately',
        'vibrant colors',
        'food photography style',
        'high resolution',
        '4k',
        'detailed',
        'professional lighting'
      ].filter(Boolean);

      const prompt = promptParts.join(', ');

      appLogger.debug('Generated enhanced prompt', { 
        recipeName,
        mainIngredients,
        cookingMethods,
        promptLength: prompt.length
      });

      return prompt;
    } catch (error) {
      appLogger.error('Failed to enhance prompt', { error });
      return `A professional, appetizing photo of ${recipeName.trim() || 'food'} dish, food photography style`;
    }
  }

  private static extractCookingMethods(instructions: string[]): string {
    try {
      if (!instructions?.length) return '';

      const cookingMethodKeywords = {
        grill: 'grilled',
        bake: 'baked',
        roast: 'roasted',
        fry: 'fried',
        sauté: 'sautéed',
        steam: 'steamed',
        boil: 'boiled',
        broil: 'broiled',
        sear: 'seared',
        smoke: 'smoked',
        braise: 'braised',
        poach: 'poached',
        simmer: 'simmered'
      };

      const instructionsText = instructions.join(' ').toLowerCase();

      // Find all cooking methods mentioned in instructions
      const foundMethods = Object.entries(cookingMethodKeywords)
        .filter(([keyword]) => instructionsText.includes(keyword))
        .map(([, pastTense]) => pastTense);

      if (foundMethods.length > 0) {
        // Use the first two methods if available
        const methods = foundMethods.slice(0, 2);
        return methods.length === 1 
          ? `${methods[0]} to perfection`
          : `${methods.join(' and ')} to perfection`;
      }

      return '';
    } catch (error) {
      appLogger.error('Failed to extract cooking methods', { error });
      return '';
    }
  }
}