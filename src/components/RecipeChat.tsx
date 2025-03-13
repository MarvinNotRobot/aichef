import React, { useState } from 'react';
import { RecipeAIService } from '../lib/ai/recipe.ai';
import { appLogger } from '../lib/logger';

interface RecipeChatProps {
  onRecipeParsed: (recipe: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function RecipeChat({ onRecipeParsed, isOpen, onToggle }: RecipeChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      let parsedRecipe;
      if (input.includes(',') || input.includes('$')) {
        // Input contains ingredients details
        parsedRecipe = await RecipeAIService.parseRecipeText(input);
      } else {
        // Input is just a recipe name
        parsedRecipe = await RecipeAIService.suggestRecipeFromName(input);
      }
      
      onRecipeParsed(parsedRecipe);
      setInput('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process recipe';
      setError(message);
      appLogger.error('Recipe chat error', { error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 w-96 bg-white rounded-lg shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-[120%]'}`}>
      <div className="p-4 bg-indigo-600 rounded-t-lg flex justify-between items-center">
        <h3 className="text-white font-medium">Recipe Assistant</h3>
        <button
          onClick={onToggle}
          className="text-white hover:text-indigo-100"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Enter either:</p>
          <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
            <li>A recipe name (e.g., "Thai Tofu Yellow Curry")</li>
            <li>Ingredient details (e.g., "Tofu $2.99/lb, Yellow curry paste $4.99/jar")</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter recipe name or ingredients..."
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Generate Recipe'}
          </button>
        </form>
      </div>
    </div>
  );
}