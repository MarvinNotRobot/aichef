import { useState } from 'react';
import { useAuthStore } from '../lib/auth/auth.store';
import { RecipeAIService } from '../lib/ai/recipe.ai';
import { appLogger } from '../lib/logger';
import type { TableRecipeIngredient } from '../types';

interface UseRecipeChatProps {
  setMenuItemName: (name: string) => void;
  setMenuItemCategory: (category: string) => void;
  setPrice: (price: string) => void;
  setIngredients: (ingredients: TableRecipeIngredient[]) => void;
  setIsDirty: (isDirty: boolean) => void;
}

export function useRecipeChat({
  setMenuItemName,
  setMenuItemCategory,
  setPrice,
  setIngredients,
  setIsDirty
}: UseRecipeChatProps) {
  const { user } = useAuthStore();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setChatError(null);

    try {
      let parsedRecipe;
      if (chatInput.includes(',') || chatInput.includes('$')) {
        parsedRecipe = await RecipeAIService.parseRecipeText(chatInput);
      } else {
        parsedRecipe = await RecipeAIService.suggestRecipeFromName(chatInput);
      }

      setMenuItemName(parsedRecipe.name);
      setMenuItemCategory(parsedRecipe.category);
      setPrice(parsedRecipe.suggestedPrice.toString());

      const newIngredients = parsedRecipe.ingredients.map(ing => ({
        ingredient: {
          id: '',
          name: ing.name,
          created_by: user?.id || '',
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

      setIngredients(newIngredients);
      setIsDirty(true);
      setChatInput('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process recipe';
      setChatError(message);
      appLogger.error('Recipe chat error', { error });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isChatOpen,
    chatInput,
    isProcessing,
    chatError,
    setIsChatOpen,
    setChatInput,
    handleChatSubmit
  };
}